import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { after, describe, it } from 'node:test';

import {
  HOOK_MARKER,
  applyHookManifests,
  hookCommandFor,
  hookManifestInstalled,
  mergeHookManifest,
  removeHookEntries,
} from '../src/core/hooks.ts';
import { buildPlan, type Plan } from '../src/core/installer.ts';
import { BRAND } from '../src/brand.ts';
import { providerById } from '../src/providers/registry.ts';
import { readJson, writeJson } from '../src/util/fsx.ts';
import { cleanup, tempDir } from './helpers.ts';

const scratch: string[] = [];
after(() => cleanup(...scratch));

const claude = providerById('claude')!;
const grok = providerById('grok')!;
const gemini = providerById('gemini')!;

function planFor(scope: 'project' | 'user', root: string, home: string): Plan {
  return buildPlan({
    installRoot: scope === 'user' ? home : root,
    hookRoot: scope === 'user' ? home : root,
    scope,
    projectRoot: root,
    home,
    providers: [claude],
    assets: [],
  });
}

describe('hook commands', () => {
  it('stays project-relative for a project install so the manifest travels', () => {
    const command = hookCommandFor(claude, planFor('project', '/p', '/h'));
    assert.ok(command.includes(`\${CLAUDE_PROJECT_DIR}/.claude/hooks/${BRAND}-dispatch.mjs`), command);
    assert.doesNotMatch(command, /^\/p/);
  });

  it('resolves absolute for a global install, which fires in every project', () => {
    const command = hookCommandFor(claude, planFor('user', '/p', '/h'));
    assert.ok(command.includes(`/h/.claude/hooks/${BRAND}-dispatch.mjs`));
    assert.doesNotMatch(command, /CLAUDE_PROJECT_DIR/);
  });

  it('no-ops instead of crashing when the dispatcher is missing', () => {
    const command = hookCommandFor(claude, planFor('project', '/p', '/h'));
    assert.ok(command.startsWith('[ ! -f '), command);
    assert.ok(command.includes('|| node '), command);
  });
});

describe('hook manifest merging', () => {
  it('preserves unrelated hooks and settings', () => {
    const existing = {
      permissions: { allow: ['Bash(ls)'] },
      hooks: {
        PostToolUse: [{ matcher: 'Edit', hooks: [{ type: 'command', command: 'my-linter' }] }],
        Stop: [{ hooks: [{ type: 'command', command: 'notify' }] }],
      },
    };
    const merged = mergeHookManifest(existing, {
      hooks: { PostToolUse: [{ matcher: 'Edit', hooks: [{ type: 'command', command: `node ${HOOK_MARKER}` }] }] },
    });

    assert.deepEqual((merged as any).permissions, { allow: ['Bash(ls)'] });
    assert.equal((merged as any).hooks.PostToolUse.length, 2);
    assert.equal((merged as any).hooks.Stop.length, 1);
  });

  it('replaces its own previous entry rather than stacking duplicates', () => {
    const fresh = {
      hooks: { PostToolUse: [{ matcher: 'Edit', hooks: [{ type: 'command', command: `node ${HOOK_MARKER}` }] }] },
    };
    const once = mergeHookManifest(null, fresh);
    const twice = mergeHookManifest(once, fresh);
    const thrice = mergeHookManifest(twice, fresh);
    assert.equal((thrice as any).hooks.PostToolUse.length, 1);
  });
});

describe('hook manifest lifecycle', () => {
  function root() {
    const dir = tempDir('sp-hooks-');
    scratch.push(dir);
    return dir;
  }

  it('writes, detects, and removes the manifest', () => {
    const dir = root();

    assert.equal(hookManifestInstalled(claude, dir), false);
    const written = applyHookManifests({ provider: claude, installRoot: dir, hookRoot: dir, command: `node ${HOOK_MARKER}` });
    assert.deepEqual(written, ['.claude/settings.local.json']);
    assert.equal(hookManifestInstalled(claude, dir), true);

    removeHookEntries(claude, dir, dir);
    assert.equal(existsSync(join(dir, '.claude/settings.local.json')), false, 'a file holding only our hook is removed');
  });

  it('keeps a settings file that also holds the user\'s own configuration', () => {
    const dir = root();
    writeJson(join(dir, '.claude/settings.local.json'), { permissions: { allow: ['Bash(ls)'] } });
    applyHookManifests({ provider: claude, installRoot: dir, hookRoot: dir, command: `node ${HOOK_MARKER}` });
    removeHookEntries(claude, dir, dir);

    const remaining = readJson<Record<string, unknown>>(join(dir, '.claude/settings.local.json'));
    assert.deepEqual(remaining, { permissions: { allow: ['Bash(ls)'] } });
  });

  it('prunes the directory it created for a nested manifest', () => {
    const dir = root();
    applyHookManifests({ provider: grok, installRoot: dir, hookRoot: dir, command: `node ${HOOK_MARKER}` });
    assert.ok(existsSync(join(dir, `.grok/hooks/${BRAND}.json`)));
    removeHookEntries(grok, dir, dir);
    assert.equal(existsSync(join(dir, '.grok/hooks')), false);
  });

  it('treats a provider with no hooks as always satisfied', () => {
    const dir = root();
    assert.equal(hookManifestInstalled(gemini, dir), true);
    assert.deepEqual(applyHookManifests({ provider: gemini, installRoot: dir, hookRoot: dir, command: 'x' }), []);
  });
});
