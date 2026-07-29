import { mkdirSync, mkdtempSync, realpathSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { writeFile } from '../src/util/fsx.ts';

/** Scratch lives in the repo's gitignored tmp/, never in the system temp dir. */
const SCRATCH_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'tmp', 'test');

/**
 * A throwaway directory. `realpathSync` matters on macOS, where paths can be
 * reached through symlinks and the installer compares resolved paths.
 */
export function tempDir(prefix = 'harness-test-'): string {
  mkdirSync(SCRATCH_ROOT, { recursive: true });
  return realpathSync(mkdtempSync(join(SCRATCH_ROOT, prefix)));
}

export function cleanup(...dirs: string[]): void {
  for (const dir of dirs) rmSync(dir, { recursive: true, force: true });
}

/** Build a miniature harness source tree and return its root. */
export function fakeHarness(files: Record<string, string>): string {
  const root = tempDir('harness-src-');
  for (const [rel, content] of Object.entries(files)) writeFile(join(root, rel), content);
  return root;
}
