import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { after, describe, it } from 'node:test';

import { BRAND } from '../src/brand.ts';
import { assetDest } from '../src/core/assets.ts';
import {
  allProviders,
  defaultProviders,
  detectProviders,
  parseProviderList,
  preferredProviders,
  providerById,
  resolveProvider,
} from '../src/providers/registry.ts';
import { cleanup, tempDir } from './helpers.ts';

const scratch: string[] = [];
after(() => cleanup(...scratch));

function dirs(...paths: string[]): { project: string; home: string } {
  const project = tempDir('sp-project-');
  const home = tempDir('sp-home-');
  scratch.push(project, home);
  for (const path of paths) {
    const base = path.startsWith('~/') ? home : project;
    mkdirSync(join(base, path.replace(/^~\//, '')), { recursive: true });
  }
  return { project, home };
}

describe('provider registry', () => {
  it('resolves providers by id, alias, and directory name', () => {
    assert.equal(resolveProvider('claude')?.id, 'claude');
    assert.equal(resolveProvider('.claude')?.id, 'claude');
    assert.equal(resolveProvider('CLAUDE-CODE')?.id, 'claude');
    assert.equal(resolveProvider('agents')?.id, 'codex');
    assert.equal(resolveProvider('github')?.id, 'copilot');
    assert.equal(resolveProvider('nope'), null);
    assert.equal(resolveProvider(''), null);
  });

  it('parses a provider list and reports what it could not resolve', () => {
    const { providers, invalid } = parseProviderList('claude, codex ,cursor,claude,bogus');
    assert.deepEqual(providers.map((p) => p.id), ['claude', 'codex', 'cursor']);
    assert.deepEqual(invalid, ['bogus']);
  });

  it('gives every provider a unique id and a resolvable default set', () => {
    const ids = allProviders().map((p) => p.id);
    assert.equal(new Set(ids).size, ids.length);
    assert.deepEqual(defaultProviders().map((p) => p.id), ['claude']);
  });
});

describe('detection', () => {
  it('finds project providers from their config directories', () => {
    const { project, home } = dirs('.claude', '.cursor');
    const found = detectProviders(project, home);
    assert.deepEqual(
      found.filter((d) => d.scope === 'project').map((d) => d.provider.id).sort(),
      ['claude', 'cursor'],
    );
  });

  it('detects Codex from either .agents or .codex in a project', () => {
    const { project, home } = dirs('.codex');
    const found = detectProviders(project, home);
    assert.ok(found.some((d) => d.provider.id === 'codex' && d.scope === 'project'));
  });

  it('prefers project providers over global ones', () => {
    const { project, home } = dirs('.cursor', '~/.claude');
    assert.deepEqual(preferredProviders(detectProviders(project, home)).map((p) => p.id), ['cursor']);
  });

  // The rule install relies on: a project-scope run must not inherit whatever
  // assistants happen to be installed on the machine, or a fresh repo silently
  // gets every one of them instead of the documented `claude` default.
  it('does not leak globally installed providers into a project-scope decision', () => {
    const { project, home } = dirs('~/.claude', '~/.gemini', '~/.cursor');
    const projectScope = detectProviders(project, home).filter((d) => d.scope === 'project');
    assert.deepEqual(preferredProviders(projectScope), []);
  });

  it('uses the global providers for a global-scope decision', () => {
    const { project, home } = dirs('.cursor', '~/.claude', '~/.gemini');
    const userScope = detectProviders(project, home).filter((d) => d.scope === 'user');
    assert.deepEqual(preferredProviders(userScope).map((p) => p.id).sort(), ['claude', 'gemini']);
  });

  it('reports no providers for an empty machine', () => {
    const { project, home } = dirs();
    assert.deepEqual(preferredProviders(detectProviders(project, home)), []);
  });
});

describe('asset placement', () => {
  const claude = providerById('claude')!;
  const gemini = providerById('gemini')!;
  const copilot = providerById('copilot')!;

  it('puts skills where the harness natively looks for them', () => {
    assert.equal(assetDest(claude, { kind: 'skill', rel: 'patterns/SKILL.md', src: '' }), 'skills/patterns/SKILL.md');
  });

  it('uses the native agents dir when one exists', () => {
    assert.equal(assetDest(claude, { kind: 'agent', rel: 'ui.md', src: '' }), 'agents/ui.md');
  });

  it('uses the same agents dir for every provider', () => {
    assert.equal(assetDest(gemini, { kind: 'agent', rel: 'ui.md', src: '' }), 'agents/ui.md');
  });

  it("honours a provider's own agent file suffix", () => {
    assert.equal(assetDest(copilot, { kind: 'agent', rel: 'ui.md', src: '' }), 'agents/ui.agent.md');
  });

  // Workflows and hooks sit beside skills/ and agents/, not under an extra
  // namespace folder: the payload layout maps one for one onto the provider's.
  it('mirrors the payload layout, with no namespace folder', () => {
    assert.equal(assetDest(claude, { kind: 'workflow', rel: 'react/x.md', src: '' }), 'workflows/react/x.md');
    assert.equal(assetDest(claude, { kind: 'hook', rel: 'react/a.sh', src: '' }), 'hooks/react/a.sh');
  });

  it('installs the dispatcher into the hooks dir under a brand-prefixed name', () => {
    assert.equal(assetDest(claude, { kind: 'runtime', rel: 'dispatch.mjs', src: '' }), `hooks/${BRAND}-dispatch.mjs`);
  });

  it('separates project and user roots per provider convention', () => {
    assert.equal(copilot.root('project', '/p', '/h'), '/p/.github');
    assert.equal(copilot.root('user', '/p', '/h'), '/h/.copilot');
    assert.equal(providerById('codex')!.root('project', '/p', '/h'), '/p/.agents');
    assert.equal(providerById('codex')!.root('user', '/p', '/h'), '/h/.codex');
  });
});
