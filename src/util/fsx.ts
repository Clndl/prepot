import { createHash } from 'node:crypto';
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  rmdirSync,
  writeFileSync,
} from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, relative, sep } from 'node:path';

/** Names that are never part of a payload, whatever tree they show up in. */
const NOISE = new Set(['.DS_Store', '.git', 'node_modules', 'Thumbs.db']);

export function isNoise(name: string): boolean {
  return NOISE.has(name);
}

/**
 * Every file under `dir`, as POSIX-style paths relative to `dir`, sorted.
 * Symlinks are followed for directories but recorded as plain files otherwise,
 * which is all the installer needs: it only ever writes real files.
 */
export function walkFiles(dir: string, base = dir): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (isNoise(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkFiles(full, base));
    else if (entry.isFile()) out.push(toPosix(relative(base, full)));
  }
  return out.sort();
}

export function toPosix(path: string): string {
  return path.split(sep).join('/');
}

export function hashBuffer(bytes: Buffer | string): string {
  return createHash('sha256').update(bytes).digest('hex');
}

export function hashFile(path: string): string | null {
  try {
    return hashBuffer(readFileSync(path));
  } catch {
    return null;
  }
}

export function writeFile(path: string, bytes: Buffer | string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, bytes);
}

export function readJson<T>(path: string): T | null {
  try {
    const parsed: unknown = JSON.parse(readFileSync(path, 'utf-8'));
    return parsed && typeof parsed === 'object' ? (parsed as T) : null;
  } catch {
    return null;
  }
}

export function writeJson(path: string, value: unknown): void {
  writeFile(path, `${JSON.stringify(value, null, 2)}\n`);
}

export function removeFile(path: string): void {
  rmSync(path, { force: true });
}

/**
 * Drop `dir` and every empty parent up to (but not including) `stopAt`.
 * Installs leave no hollow directory trees behind after an uninstall.
 */
export function pruneEmptyDirs(dir: string, stopAt: string): void {
  let current = dir;
  while (current.startsWith(stopAt) && current !== stopAt) {
    try {
      const entries = readdirSync(current).filter((name) => !isNoise(name));
      if (entries.length > 0) return;
      rmdirSync(current);
    } catch {
      return;
    }
    current = dirname(current);
  }
}

export function isSymlink(path: string): boolean {
  try {
    return lstatSync(path).isSymbolicLink();
  } catch {
    return false;
  }
}

/** `~/foo` rather than `/Users/someone/foo`, for readable output. */
export function displayPath(path: string, home = homedir()): string {
  if (path === home) return '~';
  if (path.startsWith(`${home}${sep}`)) return `~${sep}${path.slice(home.length + 1)}`;
  return path;
}
