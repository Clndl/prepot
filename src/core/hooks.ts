import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { BRAND } from '../brand.ts';
import { pruneEmptyDirs, readJson, removeFile, writeJson } from '../util/fsx.ts';
import type { Provider } from '../providers/types.ts';
import type { Plan } from './installer.ts';

/**
 * Substring that identifies a hook entry as ours: the tail of the installed
 * dispatcher path, which no other tool has a reason to reference.
 */
export const HOOK_MARKER = `${BRAND}-dispatch.mjs`;

/**
 * A hook command that is a no-op when the dispatcher is missing, rather than a
 * Node module-resolution crash mid-turn. The `[ ! -f X ] || node X` form (not
 * `... || true`) preserves the dispatcher's own exit code when it does run, so
 * a provider that reads exit status still gets the real signal.
 */
function guarded(path: string): string {
  const quoted = JSON.stringify(path);
  return `[ ! -f ${quoted} ] || node ${quoted}`;
}

/**
 * The command a provider's hook manifest should run.
 *
 * A project-scope install keeps the path project-relative so the manifest stays
 * portable across machines. Anything else (a global install, or a hook manifest
 * whose root differs from the skill root) is rewritten absolute: a global
 * settings file fires in every project, and a relative path there would resolve
 * to directories that hold no install.
 */
export function hookCommandFor(provider: Provider, plan: Plan): string {
  const dispatcher = join(
    plan.providers.find((p) => p.provider === provider)?.providerRoot ?? plan.installRoot,
    provider.layout.hooks,
    `${BRAND}-dispatch.mjs`,
  );
  if (plan.scope === 'project' && plan.hookRoot === plan.installRoot) {
    const rel = dispatcher.slice(plan.installRoot.length + 1);
    return guarded(provider.id === 'claude' ? `\${CLAUDE_PROJECT_DIR}/${rel}` : rel);
  }
  return guarded(dispatcher);
}

function hasMarker(value: unknown): boolean {
  if (typeof value === 'string') return value.includes(HOOK_MARKER);
  if (Array.isArray(value)) return value.some(hasMarker);
  if (value && typeof value === 'object') return Object.values(value).some(hasMarker);
  return false;
}

/** Drop our entries from one event's list, keeping everything else intact. */
function stripEntries(entries: unknown): unknown[] {
  if (!Array.isArray(entries)) return [];
  return entries
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return entry;
      const record = entry as Record<string, unknown>;
      if (hasMarker(record.command) || hasMarker(record.args)) return null;
      if (!Array.isArray(record.hooks)) return entry;
      const nested = stripEntries(record.hooks);
      if (nested.length === 0) return null;
      return { ...record, hooks: nested };
    })
    .filter((entry) => entry !== null);
}

function hooksSection(value: unknown): Record<string, unknown> {
  const record = value as Record<string, unknown> | null;
  const hooks = record?.hooks;
  return hooks && typeof hooks === 'object' && !Array.isArray(hooks)
    ? (hooks as Record<string, unknown>)
    : {};
}

/**
 * Merge our fresh hook entries into whatever is already in the file. Existing
 * entries survive; our own previous entries are replaced rather than stacked,
 * which is what makes repeated installs idempotent.
 */
export function mergeHookManifest(
  existing: Record<string, unknown> | null,
  fresh: Record<string, unknown>,
): Record<string, unknown> {
  const base = existing ?? {};
  const existingHooks = hooksSection(base);
  const freshHooks = hooksSection(fresh);
  const merged: Record<string, unknown> = { ...base };

  for (const key of ['version', 'description'] as const) {
    if (fresh[key] !== undefined) merged[key] = fresh[key];
  }

  const events: Record<string, unknown> = {};
  for (const event of new Set([...Object.keys(existingHooks), ...Object.keys(freshHooks)])) {
    const kept = stripEntries(existingHooks[event]);
    const added = Array.isArray(freshHooks[event]) ? (freshHooks[event] as unknown[]) : [];
    if (kept.length + added.length > 0) events[event] = [...kept, ...added];
  }
  merged.hooks = events;
  return merged;
}

export interface ApplyHookOptions {
  provider: Provider;
  installRoot: string;
  hookRoot: string;
  command: string;
}

/** Write every hook manifest a provider needs. Returns the paths touched. */
export function applyHookManifests({ provider, hookRoot, command }: ApplyHookOptions): string[] {
  const written: string[] = [];
  for (const manifest of provider.hookManifests ?? []) {
    const target = join(hookRoot, manifest.file);
    const existing = readJson<Record<string, unknown>>(target);
    const next = mergeHookManifest(existing, manifest.build(command));
    writeJson(target, next);
    written.push(manifest.file);
  }
  return written;
}

/**
 * Take our entries back out. Files that held nothing but our hook are removed
 * entirely; files with unrelated content keep it.
 */
export function removeHookEntries(provider: Provider, _installRoot: string, hookRoot: string): string[] {
  const touched: string[] = [];
  for (const manifest of provider.hookManifests ?? []) {
    const target = join(hookRoot, manifest.file);
    if (!existsSync(target)) continue;
    const existing = readJson<Record<string, unknown>>(target);
    if (!existing || !hasMarker(existing)) continue;

    const events: Record<string, unknown> = {};
    for (const [event, entries] of Object.entries(hooksSection(existing))) {
      const kept = stripEntries(entries);
      if (kept.length > 0) events[event] = kept;
    }

    const next: Record<string, unknown> = { ...existing };
    if (Object.keys(events).length > 0) {
      next.hooks = events;
    } else {
      delete next.hooks;
      delete next.version;
      delete next.description;
    }

    if (Object.keys(next).length === 0) {
      removeFile(target);
      // `.grok/hooks/` and friends are directories we created for the manifest,
      // so clear them when they empty out. The provider's own config dir
      // (`.grok`, `.claude`) is never ours to delete: it predates us and the
      // harness keeps its own state there.
      const providerDir = join(hookRoot, manifest.file.split('/')[0] ?? '');
      pruneEmptyDirs(dirname(target), providerDir);
    } else {
      writeJson(target, next);
    }
    touched.push(manifest.file);
  }
  return touched;
}

export function hookManifestInstalled(provider: Provider, hookRoot: string): boolean {
  const manifests = provider.hookManifests ?? [];
  if (manifests.length === 0) return true;
  return manifests.every((manifest) => hasMarker(readJson(join(hookRoot, manifest.file))));
}
