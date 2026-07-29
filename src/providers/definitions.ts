import { join } from 'node:path';

import { BRAND } from '../brand.ts';
import type { HookManifest, Provider, Scope } from './types.ts';

/**
 * Every provider uses the same four directory names, which are the payload's
 * own. Only Copilot deviates, and only in how it names agent files.
 */
const LAYOUT = { skills: 'skills', agents: 'agents', workflows: 'workflows', hooks: 'hooks' } as const;

/**
 * Claude-flavoured hook shape: an event map of matcher groups. Codex, Cursor
 * and Grok all read a close-enough variant, so they share the builder and
 * differ only in the manifest path and event names.
 */
function commandEntry(command: string) {
  return { type: 'command', command };
}

function claudeHooks(): HookManifest[] {
  return [
    {
      // Machine-local, gitignored by Claude Code's own conventions: the hook
      // points at a path that only exists on this machine's install.
      file: '.claude/settings.local.json',
      build: (command) => ({
        hooks: {
          PostToolUse: [
            { matcher: 'Edit|Write|MultiEdit', hooks: [commandEntry(command)] },
          ],
        },
      }),
    },
  ];
}

function codexHooks(): HookManifest[] {
  return [
    {
      // Codex reads skills from `.agents/` but hooks from `.codex/`.
      file: '.codex/hooks.json',
      build: (command) => ({
        version: 1,
        hooks: { PostToolUse: [{ matcher: 'edit|write', hooks: [commandEntry(command)] }] },
      }),
    },
  ];
}

function cursorHooks(): HookManifest[] {
  return [
    {
      file: '.cursor/hooks.json',
      build: (command) => ({
        version: 1,
        hooks: { afterFileEdit: [commandEntry(command)] },
      }),
    },
  ];
}

function grokHooks(): HookManifest[] {
  return [
    {
      file: `.grok/hooks/${BRAND}.json`,
      build: (command) => ({
        version: 1,
        description: `${BRAND} hooks`,
        hooks: { PostToolUse: [{ matcher: 'Edit|Write', hooks: [commandEntry(command)] }] },
      }),
    },
  ];
}

function underHome(dirName: string) {
  return (scope: Scope, projectRoot: string, home: string): string =>
    scope === 'user' ? join(home, dirName) : join(projectRoot, dirName);
}

/**
 * OpenCode resolves its global config dir from the environment, and only reads
 * global skills from there. Writing to `~/.opencode` produces an install it
 * never lists.
 */
function opencodeGlobalDir(home: string): string {
  if (process.env.OPENCODE_CONFIG_DIR) return process.env.OPENCODE_CONFIG_DIR;
  if (process.env.XDG_CONFIG_HOME) return join(process.env.XDG_CONFIG_HOME, 'opencode');
  return join(home, '.config', 'opencode');
}

export const PROVIDERS: readonly Provider[] = [
  {
    id: 'claude',
    name: 'Claude Code',
    dir: '.claude',
    aliases: ['claude-code', 'anthropic'],
    layout: { ...LAYOUT },
    root: underHome('.claude'),
    hookManifests: claudeHooks(),
  },
  {
    id: 'codex',
    name: 'Codex CLI',
    // Codex discovers skills from `.agents/skills`; `~/.codex` is only its
    // config home, so project and user scope use different directory names.
    dir: '.agents',
    aliases: ['agents', 'openai-codex'],
    layout: { ...LAYOUT },
    root: (scope, projectRoot, home) =>
      scope === 'user' ? join(home, '.codex') : join(projectRoot, '.agents'),
    detectionDirs: (scope, projectRoot, home) =>
      scope === 'user' ? [join(home, '.codex')] : [join(projectRoot, '.agents'), join(projectRoot, '.codex')],
    hookManifests: codexHooks(),
  },
  {
    id: 'cursor',
    name: 'Cursor',
    dir: '.cursor',
    aliases: [],
    layout: { ...LAYOUT },
    root: underHome('.cursor'),
    hookManifests: cursorHooks(),
  },
  {
    id: 'grok',
    name: 'Grok Build',
    dir: '.grok',
    aliases: ['xai', 'grok-build'],
    layout: { ...LAYOUT },
    root: underHome('.grok'),
    hookManifests: grokHooks(),
  },
  {
    id: 'gemini',
    name: 'Gemini CLI',
    dir: '.gemini',
    aliases: ['google'],
    // No native subagent directory: agent definitions land under shared/.
    layout: { ...LAYOUT },
    root: underHome('.gemini'),
  },
  {
    id: 'copilot',
    name: 'GitHub Copilot',
    dir: '.github',
    aliases: ['github'],
    layout: { ...LAYOUT, agentFileName: (base) => base.replace(/\.md$/, '.agent.md') },
    // Copilot's user scope is `~/.copilot`, not `~/.github`.
    root: (scope, projectRoot, home) =>
      scope === 'user' ? join(home, '.copilot') : join(projectRoot, '.github'),
  },
  {
    id: 'opencode',
    name: 'OpenCode',
    dir: '.opencode',
    aliases: [],
    layout: { ...LAYOUT },
    root: (scope, projectRoot, home) =>
      scope === 'user' ? opencodeGlobalDir(home) : join(projectRoot, '.opencode'),
    detectionDirs: (scope, projectRoot, home) =>
      scope === 'user' ? [opencodeGlobalDir(home), join(home, '.opencode')] : [join(projectRoot, '.opencode')],
  },
];
