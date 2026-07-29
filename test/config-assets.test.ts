import assert from 'node:assert/strict';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { after, describe, it } from 'node:test';

import { assetsForProvider, collectAssets, renderAsset } from '../src/core/assets.ts';
import { applyPlan, buildPlan, type PlanOptions } from '../src/core/installer.ts';
import { providerById } from '../src/providers/registry.ts';
import { cleanup, fakeHarness, tempDir } from './helpers.ts';

const scratch: string[] = [];
after(() => cleanup(...scratch));

const claude = providerById('claude')!;
const codex = providerById('codex')!;
const cursor = providerById('cursor')!;

function harness() {
  const root = fakeHarness({
    'skills/alpha/SKILL.md': 'alpha\n',
    'config/shared/RULES.md': '# rules\n',
    'config/shared/RTK.md': '# rtk\n',
    'config/claude/CLAUDE.md': '@RULES.md\n@RTK.md\n',
    'config/codex/AGENTS.md': '@{{PROVIDER_ROOT}}/RTK.md\n@{{PROVIDER_ROOT}}/RULES.md\n',
  });
  scratch.push(root);
  return root;
}

function globalSetup(root: string, providers = [claude, codex]) {
  const home = tempDir('cfg-home-');
  const project = tempDir('cfg-project-');
  scratch.push(home, project);
  const options: PlanOptions = {
    installRoot: home,
    hookRoot: home,
    scope: 'user',
    projectRoot: project,
    home,
    providers,
    assets: collectAssets(root),
  };
  return { home, project, options };
}

describe('config asset routing', () => {
  it('sends shared config to every provider and per-provider config only to its owner', () => {
    const assets = collectAssets(harness());
    const names = (p: typeof claude) =>
      assetsForProvider(assets, p, 'user').filter((a) => a.kind === 'config').map((a) => a.rel).sort();

    assert.deepEqual(names(claude), ['CLAUDE.md', 'RTK.md', 'RULES.md']);
    assert.deepEqual(names(codex), ['AGENTS.md', 'RTK.md', 'RULES.md']);
    // A provider with no config group of its own still gets the shared rules.
    assert.deepEqual(names(cursor), ['RTK.md', 'RULES.md']);
  });

  it('never installs config files at project scope', () => {
    const assets = collectAssets(harness());
    assert.deepEqual(assetsForProvider(assets, claude, 'project').filter((a) => a.kind === 'config'), []);
  });

  it('places config at the provider root, not in a subfolder', () => {
    const root = harness();
    const { home, options } = globalSetup(root);
    applyPlan(buildPlan(options), { cliVersion: '1.0.0' });

    assert.ok(existsSync(join(home, '.claude/CLAUDE.md')));
    assert.ok(existsSync(join(home, '.claude/RULES.md')));
    assert.ok(existsSync(join(home, '.codex/AGENTS.md')));
    assert.ok(existsSync(join(home, '.codex/RULES.md')));
    // Cross-contamination would make each assistant read the other's entrypoint.
    assert.equal(existsSync(join(home, '.claude/AGENTS.md')), false);
    assert.equal(existsSync(join(home, '.codex/CLAUDE.md')), false);
  });
});

describe('config templating', () => {
  it('resolves {{PROVIDER_ROOT}} to the machine the install lands on', () => {
    const root = harness();
    const { home, options } = globalSetup(root);
    applyPlan(buildPlan(options), { cliVersion: '1.0.0' });

    const agents = readFileSync(join(home, '.codex/AGENTS.md'), 'utf-8');
    assert.equal(agents.includes('{{PROVIDER_ROOT}}'), false, 'placeholder must not survive');
    assert.ok(agents.includes(`@${join(home, '.codex')}/RTK.md`));
  });

  it('points config references at files that actually exist', () => {
    const root = harness();
    const { home, options } = globalSetup(root);
    applyPlan(buildPlan(options), { cliVersion: '1.0.0' });

    for (const line of readFileSync(join(home, '.codex/AGENTS.md'), 'utf-8').split('\n')) {
      if (!line.startsWith('@/')) continue;
      assert.ok(existsSync(line.slice(1)), `AGENTS.md references a missing file: ${line}`);
    }
  });

  it('leaves non-config assets byte-identical', () => {
    const root = harness();
    const skill = collectAssets(root).find((a) => a.kind === 'skill')!;
    const rendered = renderAsset(skill, { providerRoot: '/anywhere', home: '/h' });
    assert.deepEqual(rendered, readFileSync(skill.src));
  });

  // The hash recorded in the manifest must be of the RENDERED bytes. If it were
  // the source bytes, every config file would read as user-edited on the next
  // run and updates would refuse to touch them forever.
  it('hashes rendered bytes, so a re-run is a no-op rather than a conflict', () => {
    const root = harness();
    const { options } = globalSetup(root);
    applyPlan(buildPlan(options), { cliVersion: '1.0.0' });

    const second = buildPlan(options);
    assert.equal(second.isNoop, true);
    const result = applyPlan(second, { cliVersion: '1.0.0' });
    assert.equal(result.conflicts.length, 0);
    assert.equal(result.updated, 0);
  });

  it('still protects a config file the user edited', () => {
    const root = harness();
    const { home, options } = globalSetup(root);
    applyPlan(buildPlan(options), { cliVersion: '1.0.0' });

    const rules = join(home, '.claude/RULES.md');
    const mine = '# rules\n\nmy own addition\n';
    writeFileSync(rules, mine);

    const result = applyPlan(buildPlan(options), { cliVersion: '1.0.0' });
    assert.ok(result.conflicts.includes('.claude/RULES.md'));
    assert.equal(readFileSync(rules, 'utf-8'), mine);
  });
});
