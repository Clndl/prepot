import assert from 'node:assert/strict';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { after, describe, it } from 'node:test';

import { collectAssets } from '../src/core/assets.ts';
import { applyPlan, buildPlan } from '../src/core/installer.ts';
import { readManifest } from '../src/core/manifest.ts';
import { providerById } from '../src/providers/registry.ts';
import { cleanup, fakeHarness, tempDir } from './helpers.ts';

const scratch: string[] = [];
after(() => cleanup(...scratch));

const claude = providerById('claude')!;

function track<T extends string>(dir: T): T {
  scratch.push(dir);
  return dir;
}

describe('payload collection', () => {
  it('accepts a harness that ships no workflows at all', () => {
    const root = track(fakeHarness({ 'skills/alpha/SKILL.md': 'a\n' }));
    const kinds = collectAssets(root).map((a) => a.kind);
    assert.ok(kinds.includes('skill'));
    assert.equal(kinds.includes('workflow'), false);
  });

  it('accepts an empty workflows directory', () => {
    const root = track(fakeHarness({ 'skills/alpha/SKILL.md': 'a\n' }));
    mkdirSync(join(root, 'workflows'), { recursive: true });
    const kinds = collectAssets(root).map((a) => a.kind);
    assert.ok(kinds.includes('skill'));
    assert.equal(kinds.includes('workflow'), false);
  });

  it('ignores editor and VCS noise rather than installing it', () => {
    const root = track(fakeHarness({ 'skills/alpha/SKILL.md': 'a\n', 'skills/.DS_Store': 'junk' }));
    assert.deepEqual(collectAssets(root).filter((a) => a.kind === 'skill').map((a) => a.rel), ['alpha/SKILL.md']);
  });

  // A payload with nothing in it is always a mistake (bad --source, a failed
  // asset sync, a broken package), and update would read it as "everything was
  // retired". It must be refused, not obeyed.
  it('refuses a payload whose kind directories are all empty', () => {
    const root = track(tempDir('empty-payload-'));
    for (const dir of ['skills', 'agents', 'workflows', 'hooks']) {
      mkdirSync(join(root, dir), { recursive: true });
    }
    assert.throws(() => collectAssets(root), /No harness content found/);
  });

  it('refuses a source directory with no kind directories at all', () => {
    const root = track(tempDir('bare-payload-'));
    assert.throws(() => collectAssets(root), /No harness content found/);
  });

  it('does not let the bundled dispatcher disguise an empty payload', () => {
    const root = track(tempDir('runtime-only-'));
    assert.throws(() => collectAssets(root), /Refusing to continue/);
  });

  it('leaves an existing install intact when the payload is empty', () => {
    const project = track(tempDir('victim-'));
    const home = track(tempDir('victim-home-'));
    const source = track(fakeHarness({ 'skills/alpha/SKILL.md': 'a\n', 'workflows/flow.md': 'f\n' }));
    const plan = buildPlan({
      installRoot: project,
      hookRoot: project,
      scope: 'project',
      projectRoot: project,
      home,
      providers: [claude],
      assets: collectAssets(source),
    });
    applyPlan(plan, { cliVersion: '1.0.0' });
    const before = readManifest(project)!.providers.claude!.files.length;
    assert.ok(before >= 2);

    const empty = track(tempDir('empty-'));
    mkdirSync(join(empty, 'skills'), { recursive: true });
    assert.throws(() => collectAssets(empty), /No harness content found/);

    // The throw happens before any plan exists, so nothing was touched.
    assert.ok(existsSync(join(project, '.claude/skills/alpha/SKILL.md')));
    assert.equal(readManifest(project)!.providers.claude!.files.length, before);
  });

  it('prunes one retired kind without disturbing the others', () => {
    const project = track(tempDir('prune-'));
    const home = track(tempDir('prune-home-'));
    const full = track(fakeHarness({ 'skills/alpha/SKILL.md': 'a\n', 'workflows/flow.md': 'f\n' }));
    const options = {
      installRoot: project,
      hookRoot: project,
      scope: 'project' as const,
      projectRoot: project,
      home,
      providers: [claude],
    };
    applyPlan(buildPlan({ ...options, assets: collectAssets(full) }), { cliVersion: '1.0.0' });

    // Same harness, workflows dropped: that is a legitimate content change.
    const trimmed = track(fakeHarness({ 'skills/alpha/SKILL.md': 'a\n' }));
    const result = applyPlan(buildPlan({ ...options, assets: collectAssets(trimmed) }), { cliVersion: '1.0.0' });

    assert.equal(result.removed, 1);
    assert.ok(existsSync(join(project, '.claude/skills/alpha/SKILL.md')));
  });
});
