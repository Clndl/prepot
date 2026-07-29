import { existsSync } from 'node:fs';

import { PROVIDERS } from './definitions.ts';
import type { Provider, Scope } from './types.ts';

export { PROVIDERS };
export type { Provider, Scope };

export function allProviders(): readonly Provider[] {
  return PROVIDERS;
}

export function providerById(id: string): Provider | null {
  return PROVIDERS.find((p) => p.id === id) ?? null;
}

/** Accepts an id, an alias, or a raw directory name (`claude`, `.claude`). */
export function resolveProvider(input: string): Provider | null {
  const key = String(input ?? '').trim().toLowerCase();
  if (!key) return null;
  const bare = key.replace(/^\./, '');
  return (
    PROVIDERS.find(
      (p) =>
        p.id === bare ||
        p.aliases.includes(bare) ||
        p.dir === key ||
        p.dir.replace(/^\./, '') === bare,
    ) ?? null
  );
}

export interface ParsedProviders {
  providers: Provider[];
  invalid: string[];
}

export function parseProviderList(value: string): ParsedProviders {
  const providers: Provider[] = [];
  const invalid: string[] = [];
  for (const raw of value.split(',').map((s) => s.trim()).filter(Boolean)) {
    const provider = resolveProvider(raw);
    if (!provider) invalid.push(raw);
    else if (!providers.includes(provider)) providers.push(provider);
  }
  return { providers, invalid };
}

export interface Detection {
  provider: Provider;
  scope: Scope;
  /** The directory whose presence produced this hit. */
  foundAt: string;
}

function detectionDirs(provider: Provider, scope: Scope, projectRoot: string, home: string): string[] {
  const dirs = provider.detectionDirs?.(scope, projectRoot, home) ?? [];
  return [...new Set([provider.root(scope, projectRoot, home), ...dirs])];
}

/**
 * Which providers are in use, at both scopes. A provider is "detected" when one
 * of its configuration directories already exists; that is the same signal the
 * harnesses themselves use, and it never requires running their binaries.
 */
export function detectProviders(projectRoot: string, home: string): Detection[] {
  const detections: Detection[] = [];
  for (const scope of ['project', 'user'] as const) {
    for (const provider of PROVIDERS) {
      // A home-rooted project would report the same directory at both scopes;
      // the project hit is the meaningful one, so skip the duplicate.
      const found = detectionDirs(provider, scope, projectRoot, home).find(existsSync);
      if (!found) continue;
      if (detections.some((d) => d.provider === provider && d.foundAt === found)) continue;
      detections.push({ provider, scope, foundAt: found });
    }
  }
  return detections;
}

/**
 * The providers an unattended run should target: whatever the project already
 * uses, else whatever is installed globally. Callers fall back to a default
 * when this is empty.
 */
export function preferredProviders(detections: readonly Detection[]): Provider[] {
  const unique = (scope: Scope) => [
    ...new Set(detections.filter((d) => d.scope === scope).map((d) => d.provider)),
  ];
  const project = unique('project');
  return project.length > 0 ? project : unique('user');
}

/** Last-resort target when nothing at all is detected. */
export const DEFAULT_PROVIDER_IDS = ['claude'] as const;

export function defaultProviders(): Provider[] {
  return DEFAULT_PROVIDER_IDS.map((id) => providerById(id)).filter((p): p is Provider => p !== null);
}
