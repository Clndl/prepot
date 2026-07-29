import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { Scope } from '../providers/types.ts';

/** The repo the user is standing in, or the cwd when there is no repo. */
export function findProjectRoot(from = process.cwd()): string {
  let dir = resolve(from);
  while (dir !== dirname(dir)) {
    if (existsSync(join(dir, '.git'))) return dir;
    dir = dirname(dir);
  }
  return resolve(from);
}

export function installRootFor(scope: Scope, projectRoot: string, home = homedir()): string {
  return scope === 'user' ? home : projectRoot;
}

export function normalizeScope(value: string | null | undefined): Scope | null {
  const key = String(value ?? '').trim().toLowerCase();
  if (['project', 'local', 'repo', 'p'].includes(key)) return 'project';
  if (['user', 'global', 'home', 'g', 'u'].includes(key)) return 'user';
  return null;
}

export function cliVersion(): string {
  const pkgPath = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', 'package.json');
  try {
    const pkg: unknown = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    const version = (pkg as { version?: unknown }).version;
    return typeof version === 'string' ? version : '0.0.0';
  } catch {
    return '0.0.0';
  }
}
