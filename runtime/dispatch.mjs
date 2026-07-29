#!/usr/bin/env node
/**
 * prepot hook dispatcher.
 *
 * Providers wire this one command into their hook manifests; it decides which
 * of the harness's shell hooks (installed next to it under ../hooks/) apply to
 * the file the agent just touched, runs them, and prints their output.
 *
 * Contract: never break a turn. Any internal failure exits 0 silently. Only a
 * hook script's own non-zero exit is propagated, so a provider that blocks on
 * exit status still gets the real signal.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// The dispatcher is installed at the root of the hooks directory, so the stack
// folders (react/, springboot/, ...) sit beside it.
const HOOKS_DIR = dirname(fileURLToPath(import.meta.url));

/**
 * Which hook groups (subdirectories of hooks/) apply to a given file. Groups
 * are named after the stack they check, and a file opts in by extension.
 */
const GROUP_MATCHERS = {
  react: /\.(jsx|tsx)$/i,
  springboot: /\.(java|kt)$/i,
};

function readStdin() {
  try {
    return readFileSync(0, 'utf-8');
  } catch {
    return '';
  }
}

/**
 * The edited file path. Providers disagree on how they pass it: a JSON payload
 * on stdin (Claude, Codex), or a plain argument (Cursor, manual runs).
 */
function resolveTargetFile() {
  const arg = process.argv[2];
  if (arg && existsSync(arg)) return arg;

  const raw = readStdin().trim();
  if (!raw) return null;
  try {
    const payload = JSON.parse(raw);
    const candidate =
      payload?.tool_input?.file_path ??
      payload?.file_path ??
      payload?.filePath ??
      payload?.path ??
      null;
    return candidate && existsSync(candidate) ? candidate : null;
  } catch {
    return existsSync(raw) ? raw : null;
  }
}

function hookScriptsFor(file) {
  if (!existsSync(HOOKS_DIR)) return [];
  const scripts = [];
  for (const entry of readdirSync(HOOKS_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const matcher = GROUP_MATCHERS[entry.name];
    if (matcher && !matcher.test(file)) continue;
    const groupDir = join(HOOKS_DIR, entry.name);
    for (const script of readdirSync(groupDir)) {
      if (script.endsWith('.sh')) scripts.push(join(groupDir, script));
    }
  }
  return scripts.sort();
}

function main() {
  const file = resolveTargetFile();
  if (!file) return 0;
  try {
    if (!statSync(file).isFile()) return 0;
  } catch {
    return 0;
  }

  let worstExit = 0;
  for (const script of hookScriptsFor(file)) {
    try {
      const output = execFileSync('bash', [script, file], { encoding: 'utf-8', timeout: 20_000 });
      if (output.trim()) process.stdout.write(output);
    } catch (error) {
      if (error?.stdout) process.stdout.write(String(error.stdout));
      if (error?.stderr) process.stderr.write(String(error.stderr));
      if (typeof error?.status === 'number' && error.status > worstExit) worstExit = error.status;
    }
  }
  return worstExit;
}

try {
  process.exitCode = main();
} catch {
  process.exitCode = 0;
}
