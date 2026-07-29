import { join } from 'node:path';

import { MANIFEST_DIR } from '../brand.ts';

import { readJson, removeFile, writeJson } from '../util/fsx.ts';
import type { Scope } from '../providers/types.ts';

export const MANIFEST_SCHEMA = 1;
export { MANIFEST_DIR };
export const MANIFEST_FILE = 'manifest.json';

export interface ManifestFile {
  /** Path relative to the install root, POSIX separators. */
  path: string;
  /** sha256 of the content the CLI wrote, so later runs can spot user edits. */
  hash: string;
}

export interface ManifestProvider {
  root: string;
  files: ManifestFile[];
  /** Hook manifest paths (relative to install root) this provider owns entries in. */
  hooks: string[];
}

export interface Manifest {
  schema: number;
  cliVersion: string;
  scope: Scope;
  updatedAt: string;
  providers: Record<string, ManifestProvider>;
}

export function manifestPath(installRoot: string): string {
  return join(installRoot, MANIFEST_DIR, MANIFEST_FILE);
}

export function readManifest(installRoot: string): Manifest | null {
  const raw = readJson<Manifest>(manifestPath(installRoot));
  if (!raw || raw.schema !== MANIFEST_SCHEMA || !raw.providers) return null;
  return raw;
}

export function emptyManifest(scope: Scope, cliVersion: string): Manifest {
  return {
    schema: MANIFEST_SCHEMA,
    cliVersion,
    scope,
    updatedAt: new Date().toISOString(),
    providers: {},
  };
}

export function writeManifest(installRoot: string, manifest: Manifest): void {
  manifest.updatedAt = new Date().toISOString();
  writeJson(manifestPath(installRoot), manifest);
}

export function deleteManifest(installRoot: string): void {
  removeFile(manifestPath(installRoot));
}

/** Recorded hash for a path, or null when the CLI has never written it. */
export function recordedHash(manifest: Manifest | null, providerId: string, path: string): string | null {
  const entry = manifest?.providers[providerId]?.files.find((f) => f.path === path);
  return entry?.hash ?? null;
}

export function recordedPaths(manifest: Manifest | null, providerId: string): string[] {
  return manifest?.providers[providerId]?.files.map((f) => f.path) ?? [];
}
