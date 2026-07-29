import { homedir } from 'node:os';

import { findProjectRoot, installRootFor, normalizeScope } from '../core/context.ts';
import { collectAssets, resolveSourceRoot, type Asset } from '../core/assets.ts';
import { buildPlan, type ApplyResult, type Plan } from '../core/installer.ts';
import { readManifest } from '../core/manifest.ts';
import {
  allProviders,
  defaultProviders,
  detectProviders,
  parseProviderList,
  preferredProviders,
  providerById,
  type Detection,
  type Provider,
} from '../providers/registry.ts';
import type { Scope } from '../providers/types.ts';
import type { Flags } from '../util/flags.ts';
import { isInteractive, promptCheckbox, promptRadio } from '../util/prompt.ts';
import { displayPath } from '../util/fsx.ts';
import { info, ui, warn } from '../util/log.ts';

export interface Resolved {
  projectRoot: string;
  home: string;
  scope: Scope;
  installRoot: string;
  providers: Provider[];
  assets: Asset[];
  detections: Detection[];
}

export function loadAssets(flags: Flags): Asset[] {
  return collectAssets(resolveSourceRoot(flags.value('--source')));
}

/** Providers from `--providers`, throwing on anything unrecognized. */
export function explicitProviders(flags: Flags): Provider[] | null {
  const value = flags.value('--providers', '--provider');
  if (!value) return null;
  const { providers, invalid } = parseProviderList(value);
  if (invalid.length > 0) {
    const known = allProviders().map((p) => p.id).join(', ');
    throw new Error(`Unknown provider(s): ${invalid.join(', ')}. Known providers: ${known}.`);
  }
  return providers;
}

export function explicitScope(flags: Flags): Scope | null {
  if (flags.has('--project', '--local')) return 'project';
  if (flags.has('--global', '--user', '--home')) return 'user';
  const value = flags.value('--scope');
  if (!value) return null;
  const scope = normalizeScope(value);
  if (!scope) throw new Error(`Unknown scope: ${value}. Use --scope=project or --scope=global.`);
  return scope;
}

export function printDetections(projectRoot: string, detections: readonly Detection[], home: string): void {
  if (detections.length === 0) {
    info(
      `${ui.accent('◇')} ${ui.bold('Detected providers')}\n  ${ui.dim(
        `none under ${displayPath(projectRoot, home)} or ${displayPath(home, home)}`,
      )}`,
    );
    return;
  }
  info(`${ui.accent('◇')} ${ui.bold('Detected providers')}`);
  const width = Math.max(...detections.map((d) => d.provider.name.length));
  for (const d of detections) {
    info(`  ${ui.bold(d.provider.name.padEnd(width))}  ${ui.dim(`${d.scope}  ${displayPath(d.foundAt, home)}`)}`);
  }
  info('');
}

function providerChoices() {
  return allProviders().map((provider) => ({
    value: provider,
    label: provider.name,
    hint: `(${provider.dir})`,
    searchText: `${provider.name} ${provider.id} ${provider.dir} ${provider.aliases.join(' ')}`,
  }));
}

/**
 * Work out what to install and where.
 *
 * Scope is decided first and is never prompted for: a harness belongs to the
 * project that uses it, so `install` writes into the repo unless the user asks
 * for `--scope=global`.
 *
 * Providers are then detected *at that scope only*. A project install looks at
 * the project's own harness folders; a global install looks at the home ones.
 * Detecting across scopes would mean `install` in a fresh repo silently targets
 * every assistant you happen to have on the machine.
 */
export async function resolveTargets(
  flags: Flags,
  { interactive = true }: { interactive?: boolean } = {},
): Promise<Resolved> {
  const projectRoot = findProjectRoot();
  const home = homedir();
  const detections = detectProviders(projectRoot, home);
  const assets = loadAssets(flags);

  const chosenProviders = explicitProviders(flags);
  const yes = flags.has('-y', '--yes');
  const canPrompt = interactive && !yes && isInteractive();
  const scope: Scope = explicitScope(flags) ?? 'project';

  const inScope = detections.filter((d) => d.scope === scope);
  const detected = preferredProviders(inScope);

  let providers = chosenProviders;
  if (!providers) {
    if (canPrompt) {
      printDetections(projectRoot, detections, home);
      if (detected.length === 0) {
        providers = await promptCheckbox('Select providers', providerChoices(), defaultProviders());
      } else {
        const mode = await promptRadio(
          'Install for the detected providers, or choose?',
          [
            { value: 'detected', label: 'Detected only', hint: `(${detected.map((p) => p.id).join(', ')})` },
            { value: 'choose', label: 'Choose providers...' },
          ],
        );
        providers =
          mode === 'detected' ? detected : await promptCheckbox('Select providers', providerChoices(), detected);
      }
    } else {
      providers = detected.length > 0 ? detected : defaultProviders();
      if (detected.length === 0) {
        warn(`No providers detected here; defaulting to ${providers.map((p) => p.id).join(', ')}.`);
      }
    }
  }

  if (providers.length === 0) throw new Error('No providers selected.');

  return {
    projectRoot,
    home,
    scope,
    installRoot: installRootFor(scope, projectRoot, home),
    providers,
    assets,
    detections,
  };
}

export function planFor(resolved: Resolved, flags: Flags, { prune = true } = {}): Plan {
  return buildPlan({
    installRoot: resolved.installRoot,
    hookRoot: resolved.installRoot,
    scope: resolved.scope,
    projectRoot: resolved.projectRoot,
    home: resolved.home,
    providers: resolved.providers,
    assets: resolved.assets,
    force: flags.has('--force'),
    prune,
  });
}

/** Providers a previous run recorded in the manifest at `installRoot`. */
export function installedProviders(installRoot: string): Provider[] {
  const manifest = readManifest(installRoot);
  if (!manifest) return [];
  return Object.keys(manifest.providers)
    .map((id) => providerById(id))
    .filter((p): p is Provider => p !== null);
}

export function reportResult(result: ApplyResult, home: string): void {
  const parts: string[] = [];
  if (result.written) parts.push(`${result.written} added`);
  if (result.updated) parts.push(`${result.updated} updated`);
  if (result.adopted) parts.push(`${result.adopted} adopted`);
  if (result.unchanged) parts.push(`${result.unchanged} unchanged`);
  if (result.removed) parts.push(`${result.removed} removed`);
  info(`Files: ${parts.length > 0 ? parts.join(', ') : 'nothing to do'}.`);

  if (result.hookFiles.length > 0) {
    info(`Hooks wired into: ${[...new Set(result.hookFiles)].join(', ')}`);
  }
  if (result.conflicts.length > 0) {
    warn(`${result.conflicts.length} file(s) have local edits and were left alone:`);
    for (const path of result.conflicts.slice(0, 10)) info(`    ${displayPath(path, home)}  ${ui.dim('(new version saved as *.new)')}`);
    if (result.conflicts.length > 10) info(`    ${ui.dim(`... and ${result.conflicts.length - 10} more`)}`);
    info(`  ${ui.dim('Review the .new files, or re-run with --force to overwrite.')}`);
  }
  if (result.keptModified.length > 0) {
    warn(`${result.keptModified.length} retired file(s) were kept because they have local edits.`);
  }
}
