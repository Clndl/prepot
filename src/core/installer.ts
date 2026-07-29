import { chmodSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';

import {
  assetDest,
  assetsForProvider,
  isExecutableAsset,
  renderAsset,
  type Asset,
  type RenderContext,
} from './assets.ts';
import {
  emptyManifest,
  readManifest,
  recordedHash,
  recordedPaths,
  writeManifest,
  type Manifest,
  type ManifestFile,
} from './manifest.ts';
import { applyHookManifests, hookCommandFor, removeHookEntries } from './hooks.ts';
import { hashBuffer, hashFile, pruneEmptyDirs, removeFile, toPosix, writeFile } from '../util/fsx.ts';
import type { Provider, Scope } from '../providers/types.ts';

export type WriteOutcome = 'create' | 'update' | 'unchanged' | 'adopt' | 'conflict';
export type RemoveOutcome = 'remove' | 'keep-modified';

export interface FileChange {
  /** Path relative to the install root. */
  path: string;
  outcome: WriteOutcome;
  asset: Asset;
  hash: string;
}

export interface Removal {
  path: string;
  outcome: RemoveOutcome;
}

export interface ProviderPlan {
  provider: Provider;
  providerRoot: string;
  changes: FileChange[];
  removals: Removal[];
  /**
   * Carried on the plan so `applyPlan` renders each asset exactly as
   * `buildPlan` hashed it. Re-deriving it would let the two drift, and a plan
   * that hashed different bytes than it writes is a silent corruption.
   */
  render: RenderContext;
}

export interface Plan {
  installRoot: string;
  hookRoot: string;
  scope: Scope;
  providers: ProviderPlan[];
  /** True when nothing would be written, removed, or rewired. */
  isNoop: boolean;
}

export interface PlanOptions {
  installRoot: string;
  hookRoot: string;
  scope: Scope;
  projectRoot: string;
  home: string;
  providers: readonly Provider[];
  assets: readonly Asset[];
  /** Overwrite files the user has edited. */
  force?: boolean;
  /** Remove files that used to be part of the harness but no longer are. */
  prune?: boolean;
}

/**
 * Decide what a run would do, without touching disk.
 *
 * The rule that makes updates safe: prepot only overwrites a file whose
 * current content is exactly what prepot last wrote (per the manifest), or
 * that already matches the incoming content. Anything else is the user's, and
 * is reported as a conflict rather than clobbered.
 */
export function buildPlan(options: PlanOptions): Plan {
  const { installRoot, scope, projectRoot, home, providers, assets, force = false, prune = true } = options;
  const manifest = readManifest(installRoot);
  const plans: ProviderPlan[] = [];

  for (const provider of providers) {
    const providerRoot = provider.root(scope, projectRoot, home);
    const render: RenderContext = { providerRoot, home };
    const changes: FileChange[] = [];
    const seen = new Set<string>();

    for (const asset of assetsForProvider(assets, provider, scope)) {
      const path = toPosix(join(relativeFromInstallRoot(installRoot, providerRoot), assetDest(provider, asset)));
      seen.add(path);
      const abs = join(installRoot, path);
      const incomingHash = hashBuffer(renderAsset(asset, render));
      const currentHash = hashFile(abs);

      let outcome: WriteOutcome;
      if (currentHash === null) {
        outcome = 'create';
      } else if (currentHash === incomingHash) {
        // Content is already right. Still an "adopt" when the manifest has no
        // record, so a lost manifest heals instead of turning into conflicts.
        outcome = recordedHash(manifest, provider.id, path) === incomingHash ? 'unchanged' : 'adopt';
      } else if (force || currentHash === recordedHash(manifest, provider.id, path)) {
        outcome = 'update';
      } else {
        outcome = 'conflict';
      }

      changes.push({ path, outcome, asset, hash: incomingHash });
    }

    const removals: Removal[] = [];
    if (prune) {
      for (const path of recordedPaths(manifest, provider.id)) {
        if (seen.has(path)) continue;
        const currentHash = hashFile(join(installRoot, path));
        if (currentHash === null) continue;
        const clean = currentHash === recordedHash(manifest, provider.id, path);
        removals.push({ path, outcome: clean || force ? 'remove' : 'keep-modified' });
      }
    }

    plans.push({ provider, providerRoot, changes, removals, render });
  }

  const isNoop = plans.every(
    (p) =>
      p.changes.every((c) => c.outcome === 'unchanged') &&
      p.removals.every((r) => r.outcome === 'keep-modified'),
  );

  return { installRoot, hookRoot: options.hookRoot, scope, providers: plans, isNoop };
}

function relativeFromInstallRoot(installRoot: string, providerRoot: string): string {
  if (providerRoot === installRoot) return '';
  if (providerRoot.startsWith(`${installRoot}/`)) return providerRoot.slice(installRoot.length + 1);
  // A provider root outside the install root would break the manifest's
  // relative-path contract; every provider definition keeps it inside.
  throw new Error(`Provider root ${providerRoot} is not under install root ${installRoot}.`);
}

export interface ApplyResult {
  written: number;
  updated: number;
  unchanged: number;
  adopted: number;
  conflicts: string[];
  removed: number;
  keptModified: string[];
  hookFiles: string[];
}

export interface ApplyOptions {
  cliVersion: string;
  /** Skip provider hook manifests entirely. */
  hooks?: boolean;
  /** Write conflicting incoming content beside the file as `<name>.new`. */
  keepIncoming?: boolean;
}

export function applyPlan(plan: Plan, options: ApplyOptions): ApplyResult {
  const { cliVersion, hooks = true, keepIncoming = true } = options;
  const manifest: Manifest = readManifest(plan.installRoot) ?? emptyManifest(plan.scope, cliVersion);
  manifest.cliVersion = cliVersion;
  manifest.scope = plan.scope;

  const result: ApplyResult = {
    written: 0,
    updated: 0,
    unchanged: 0,
    adopted: 0,
    conflicts: [],
    removed: 0,
    keptModified: [],
    hookFiles: [],
  };

  for (const providerPlan of plan.providers) {
    const files = new Map<string, string>();
    const previous = manifest.providers[providerPlan.provider.id];
    for (const file of previous?.files ?? []) files.set(file.path, file.hash);

    for (const change of providerPlan.changes) {
      const abs = join(plan.installRoot, change.path);
      if (change.outcome === 'conflict') {
        result.conflicts.push(change.path);
        // Leave the user's file alone but park the incoming version next to it
        // so the diff is one command away.
        if (keepIncoming) writeFile(`${abs}.new`, renderAsset(change.asset, providerPlan.render));
        continue;
      }
      if (change.outcome === 'create' || change.outcome === 'update') {
        writeFile(abs, renderAsset(change.asset, providerPlan.render));
        if (isExecutableAsset(change.asset)) chmodSync(abs, 0o755);
        if (change.outcome === 'create') result.written++;
        else result.updated++;
      } else if (change.outcome === 'adopt') {
        result.adopted++;
      } else {
        result.unchanged++;
      }
      // A resolved conflict leaves a stale `.new` sidecar; clear it.
      removeFile(`${abs}.new`);
      files.set(change.path, change.hash);
    }

    for (const removal of providerPlan.removals) {
      if (removal.outcome === 'keep-modified') {
        result.keptModified.push(removal.path);
        continue;
      }
      const abs = join(plan.installRoot, removal.path);
      removeFile(abs);
      pruneEmptyDirs(dirname(abs), providerPlan.providerRoot);
      files.delete(removal.path);
      result.removed++;
    }

    const hookFiles = hooks
      ? applyHookManifests({
          provider: providerPlan.provider,
          installRoot: plan.installRoot,
          hookRoot: plan.hookRoot,
          command: hookCommandFor(providerPlan.provider, plan),
        })
      : [];
    result.hookFiles.push(...hookFiles);

    manifest.providers[providerPlan.provider.id] = {
      root: providerPlan.providerRoot,
      files: [...files.entries()].map(([path, hash]) => ({ path, hash })).sort((a, b) => a.path.localeCompare(b.path)),
      hooks: hookFiles.length > 0 ? hookFiles : (previous?.hooks ?? []),
    };
  }

  writeManifest(plan.installRoot, manifest);
  return result;
}

export interface UninstallResult {
  removed: number;
  keptModified: string[];
  hookFiles: string[];
}

/**
 * Remove exactly what the manifest says prepot installed. Files the user
 * changed are left in place unless `force` is set, so an uninstall can never
 * take work with it.
 */
export function uninstallProviders(
  installRoot: string,
  hookRoot: string,
  providerIds: readonly string[],
  providers: readonly Provider[],
  { force = false }: { force?: boolean } = {},
): UninstallResult {
  const manifest = readManifest(installRoot);
  const result: UninstallResult = { removed: 0, keptModified: [], hookFiles: [] };
  if (!manifest) return result;

  for (const id of providerIds) {
    const entry = manifest.providers[id];
    if (!entry) continue;
    const kept: ManifestFile[] = [];
    for (const file of entry.files) {
      const abs = join(installRoot, file.path);
      if (!existsSync(abs)) continue;
      if (!force && hashFile(abs) !== file.hash) {
        result.keptModified.push(file.path);
        kept.push(file);
        continue;
      }
      removeFile(abs);
      pruneEmptyDirs(dirname(abs), entry.root);
      result.removed++;
    }

    const provider = providers.find((p) => p.id === id);
    if (provider) {
      result.hookFiles.push(...removeHookEntries(provider, installRoot, hookRoot));
    }

    if (kept.length > 0) manifest.providers[id] = { ...entry, files: kept, hooks: [] };
    else delete manifest.providers[id];
  }

  writeManifest(installRoot, manifest);
  return result;
}
