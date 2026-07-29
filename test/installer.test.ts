import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { after, describe, it } from 'node:test';

import { applyPlan, buildPlan, uninstallProviders, type PlanOptions } from '../src/core/installer.ts';
import { readManifest } from '../src/core/manifest.ts';
import { providerById } from '../src/providers/registry.ts';
import { writeFile } from '../src/util/fsx.ts';
import type { Asset } from '../src/core/assets.ts';
import { MANIFEST_DIR } from '../src/brand.ts';
import { cleanup, fakeHarness, tempDir } from './helpers.ts';

const scratch: string[] = [];
after(() => cleanup(...scratch));

const claude = providerById('claude')!;
const cursor = providerById('cursor')!;
const CLI_VERSION = '9.9.9';

function harness(overrides: Record<string, string> = {}) {
  const root = fakeHarness({
    'skills/alpha/SKILL.md': 'alpha v1\n',
    'skills/beta/SKILL.md': 'beta v1\n',
    'agents/reviewer.md': 'reviewer v1\n',
    'workflows/flow.md': 'flow v1\n',
    'hooks/react/check.sh': '#!/bin/bash\necho hi\n',
    ...overrides,
  });
  scratch.push(root);
  return root;
}

function assetsOf(root: string, entries: Array<[Asset['kind'], string, string]>): Asset[] {
  return entries.map(([kind, rel, dir]) => ({ kind, rel, src: join(root, dir, rel) }));
}

function standardAssets(root: string): Asset[] {
  return assetsOf(root, [
    ['skill', 'alpha/SKILL.md', 'skills'],
    ['skill', 'beta/SKILL.md', 'skills'],
    ['agent', 'reviewer.md', 'agents'],
    ['workflow', 'flow.md', 'workflows'],
    ['hook', 'react/check.sh', 'hooks'],
  ]);
}

function setup(assets: Asset[], overrides: Partial<PlanOptions> = {}) {
  const project = tempDir('sp-install-');
  const home = tempDir('sp-home-');
  scratch.push(project, home);
  const options: PlanOptions = {
    installRoot: project,
    hookRoot: project,
    scope: 'project',
    projectRoot: project,
    home,
    providers: [claude],
    assets,
    ...overrides,
  };
  return { project, home, options };
}

describe('install', () => {
  it('writes every asset to the provider layout and records a manifest', () => {
    const root = harness();
    const { project, options } = setup(standardAssets(root));
    const result = applyPlan(buildPlan(options), { cliVersion: CLI_VERSION });

    assert.equal(result.written, 5);
    assert.equal(readFileSync(join(project, '.claude/skills/alpha/SKILL.md'), 'utf-8'), 'alpha v1\n');
    assert.equal(readFileSync(join(project, '.claude/agents/reviewer.md'), 'utf-8'), 'reviewer v1\n');
    assert.ok(existsSync(join(project, '.claude/workflows/flow.md')));
    assert.ok(existsSync(join(project, '.claude/hooks/react/check.sh')));

    const manifest = readManifest(project);
    assert.equal(manifest?.cliVersion, CLI_VERSION);
    assert.equal(manifest?.providers.claude?.files.length, 5);
  });

  it('marks shell hooks executable so the dispatcher can run them', () => {
    const root = harness();
    const { project, options } = setup(standardAssets(root));
    applyPlan(buildPlan(options), { cliVersion: CLI_VERSION });
    const mode = statSync(join(project, '.claude/hooks/react/check.sh')).mode & 0o777;
    assert.equal(mode & 0o100, 0o100);
  });

  it('is idempotent: a second run changes nothing', () => {
    const root = harness();
    const { options } = setup(standardAssets(root));
    applyPlan(buildPlan(options), { cliVersion: CLI_VERSION });

    const second = buildPlan(options);
    assert.equal(second.isNoop, true);
    const result = applyPlan(second, { cliVersion: CLI_VERSION });
    assert.equal(result.written, 0);
    assert.equal(result.updated, 0);
    assert.equal(result.unchanged, 5);
  });

  it('installs each selected provider into its own directory', () => {
    const root = harness();
    const { project, options } = setup(standardAssets(root), { providers: [claude, cursor] });
    applyPlan(buildPlan(options), { cliVersion: CLI_VERSION });
    assert.ok(existsSync(join(project, '.claude/skills/alpha/SKILL.md')));
    assert.ok(existsSync(join(project, '.cursor/skills/alpha/SKILL.md')));
    assert.deepEqual(Object.keys(readManifest(project)!.providers).sort(), ['claude', 'cursor']);
  });

  it('adopts pre-existing identical files instead of reporting a conflict', () => {
    const root = harness();
    const { project, options } = setup(standardAssets(root));
    writeFile(join(project, '.claude/skills/alpha/SKILL.md'), 'alpha v1\n');

    const result = applyPlan(buildPlan(options), { cliVersion: CLI_VERSION });
    assert.equal(result.conflicts.length, 0);
    assert.equal(result.adopted, 1);
    assert.equal(result.written, 4);
  });
});

describe('update', () => {
  it('replaces files the user has not touched', () => {
    const root = harness();
    const { project, options } = setup(standardAssets(root));
    applyPlan(buildPlan(options), { cliVersion: CLI_VERSION });

    const next = harness({ 'skills/alpha/SKILL.md': 'alpha v2\n' });
    const result = applyPlan(buildPlan({ ...options, assets: standardAssets(next) }), { cliVersion: CLI_VERSION });

    assert.equal(result.updated, 1);
    assert.equal(result.conflicts.length, 0);
    assert.equal(readFileSync(join(project, '.claude/skills/alpha/SKILL.md'), 'utf-8'), 'alpha v2\n');
  });

  it('never overwrites a file the user edited, and parks the new version beside it', () => {
    const root = harness();
    const { project, options } = setup(standardAssets(root));
    applyPlan(buildPlan(options), { cliVersion: CLI_VERSION });

    const edited = join(project, '.claude/skills/alpha/SKILL.md');
    writeFile(edited, 'alpha v1 + my notes\n');

    const next = harness({ 'skills/alpha/SKILL.md': 'alpha v2\n' });
    const result = applyPlan(buildPlan({ ...options, assets: standardAssets(next) }), { cliVersion: CLI_VERSION });

    assert.deepEqual(result.conflicts, ['.claude/skills/alpha/SKILL.md']);
    assert.equal(readFileSync(edited, 'utf-8'), 'alpha v1 + my notes\n');
    assert.equal(readFileSync(`${edited}.new`, 'utf-8'), 'alpha v2\n');
  });

  it('overwrites an edited file under --force and clears the sidecar', () => {
    const root = harness();
    const { project, options } = setup(standardAssets(root));
    applyPlan(buildPlan(options), { cliVersion: CLI_VERSION });

    const edited = join(project, '.claude/skills/alpha/SKILL.md');
    writeFile(edited, 'mine\n');
    const next = harness({ 'skills/alpha/SKILL.md': 'alpha v2\n' });
    applyPlan(buildPlan({ ...options, assets: standardAssets(next) }), { cliVersion: CLI_VERSION });
    assert.ok(existsSync(`${edited}.new`));

    applyPlan(buildPlan({ ...options, assets: standardAssets(next), force: true }), { cliVersion: CLI_VERSION });
    assert.equal(readFileSync(edited, 'utf-8'), 'alpha v2\n');
    assert.equal(existsSync(`${edited}.new`), false);
  });

  it('removes retired files and prunes the directories they leave empty', () => {
    const root = harness();
    const { project, options } = setup(standardAssets(root));
    applyPlan(buildPlan(options), { cliVersion: CLI_VERSION });
    assert.ok(existsSync(join(project, '.claude/skills/beta/SKILL.md')));

    const reduced = standardAssets(root).filter((a) => a.rel !== 'beta/SKILL.md');
    const result = applyPlan(buildPlan({ ...options, assets: reduced }), { cliVersion: CLI_VERSION });

    assert.equal(result.removed, 1);
    assert.equal(existsSync(join(project, '.claude/skills/beta')), false);
    assert.equal(readManifest(project)?.providers.claude?.files.length, 4);
  });

  it('keeps a retired file the user edited', () => {
    const root = harness();
    const { project, options } = setup(standardAssets(root));
    applyPlan(buildPlan(options), { cliVersion: CLI_VERSION });
    writeFile(join(project, '.claude/skills/beta/SKILL.md'), 'beta + mine\n');

    const reduced = standardAssets(root).filter((a) => a.rel !== 'beta/SKILL.md');
    const result = applyPlan(buildPlan({ ...options, assets: reduced }), { cliVersion: CLI_VERSION });

    assert.equal(result.removed, 0);
    assert.deepEqual(result.keptModified, ['.claude/skills/beta/SKILL.md']);
    assert.ok(existsSync(join(project, '.claude/skills/beta/SKILL.md')));
  });

  it('heals a lost manifest by adopting matching files rather than conflicting', () => {
    const root = harness();
    const { project, options } = setup(standardAssets(root));
    applyPlan(buildPlan(options), { cliVersion: CLI_VERSION });
    cleanup(join(project, MANIFEST_DIR));

    const result = applyPlan(buildPlan(options), { cliVersion: CLI_VERSION });
    assert.equal(result.conflicts.length, 0);
    assert.equal(result.adopted, 5);
    assert.equal(readManifest(project)?.providers.claude?.files.length, 5);
  });
});

describe('uninstall', () => {
  it('removes exactly what the manifest recorded', () => {
    const root = harness();
    const { project, options } = setup(standardAssets(root));
    applyPlan(buildPlan(options), { cliVersion: CLI_VERSION });
    writeFile(join(project, '.claude/skills/mine.md'), 'not ours\n');

    const result = uninstallProviders(project, project, ['claude'], [claude]);
    assert.equal(result.removed, 5);
    assert.ok(existsSync(join(project, '.claude/skills/mine.md')), 'untracked files survive');
    assert.equal(existsSync(join(project, '.claude/agents')), false);
    assert.deepEqual(Object.keys(readManifest(project)!.providers), []);
  });

  it('leaves edited files behind unless forced', () => {
    const root = harness();
    const { project, options } = setup(standardAssets(root));
    applyPlan(buildPlan(options), { cliVersion: CLI_VERSION });
    writeFile(join(project, '.claude/skills/alpha/SKILL.md'), 'mine\n');

    const kept = uninstallProviders(project, project, ['claude'], [claude]);
    assert.equal(kept.removed, 4);
    assert.deepEqual(kept.keptModified, ['.claude/skills/alpha/SKILL.md']);
    assert.ok(existsSync(join(project, '.claude/skills/alpha/SKILL.md')));

    const forced = uninstallProviders(project, project, ['claude'], [claude], { force: true });
    assert.equal(forced.removed, 1);
    assert.equal(existsSync(join(project, '.claude/skills/alpha')), false);
  });

  it('only removes the providers it was asked about', () => {
    const root = harness();
    const { project, options } = setup(standardAssets(root), { providers: [claude, cursor] });
    applyPlan(buildPlan(options), { cliVersion: CLI_VERSION });

    uninstallProviders(project, project, ['cursor'], [claude, cursor]);
    assert.ok(existsSync(join(project, '.claude/skills/alpha/SKILL.md')));
    assert.equal(existsSync(join(project, '.cursor/skills/alpha/SKILL.md')), false);
    assert.deepEqual(Object.keys(readManifest(project)!.providers), ['claude']);
  });
});
