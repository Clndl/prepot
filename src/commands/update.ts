import { homedir } from 'node:os';

import { cliVersion, findProjectRoot, installRootFor } from '../core/context.ts';
import { applyPlan, buildPlan } from '../core/installer.ts';
import { readManifest } from '../core/manifest.ts';
import type { Scope } from '../providers/types.ts';
import { displayPath } from '../util/fsx.ts';
import type { Flags } from '../util/flags.ts';
import { info, ui, warn } from '../util/log.ts';
import { confirm, isInteractive, promptRadio } from '../util/prompt.ts';
import {
  explicitProviders,
  explicitScope,
  installedProviders,
  loadAssets,
  reportResult,
} from './shared.ts';

/**
 * Update refreshes an install that already exists; it never creates one. It
 * finds the install from the manifest rather than from provider detection, so
 * it only ever touches directories prepot itself wrote.
 */
export async function update(flags: Flags): Promise<number> {
  const yes = flags.has('-y', '--yes');
  const hooks = !flags.has('--no-hooks');
  const projectRoot = findProjectRoot();
  const home = homedir();

  const wanted = explicitScope(flags);
  const candidates = (['project', 'user'] as const)
    .map((scope) => ({ scope, root: installRootFor(scope, projectRoot, home) }))
    .filter(({ scope, root }) => (wanted ? scope === wanted : true) && readManifest(root) !== null);

  if (candidates.length === 0) {
    warn(
      wanted
        ? `No prepot install found at the ${wanted === 'user' ? 'global' : 'project'} scope.`
        : 'No prepot install found in this project or globally.',
    );
    info('Run `npx prepot install` first.');
    return 1;
  }

  let target = candidates[0]!;
  if (candidates.length > 1) {
    info('prepot is installed in both scopes:');
    for (const candidate of candidates) info(`  ${candidate.scope.padEnd(8)} ${displayPath(candidate.root, home)}`);
    if (!yes && isInteractive()) {
      const scope = await promptRadio<Scope>(
        'Update which install?',
        candidates.map((c) => ({
          value: c.scope,
          label: c.scope === 'user' ? 'Global' : 'Project',
          hint: `(${displayPath(c.root, home)})`,
        })),
      );
      target = candidates.find((c) => c.scope === scope)!;
    } else {
      info('Defaulting to the project install. Pass --global to update the other one.');
    }
  }

  const recorded = installedProviders(target.root);
  const providers = explicitProviders(flags) ?? recorded;
  const unknown = providers.filter((p) => !recorded.includes(p));
  if (unknown.length > 0) {
    warn(`Not installed at this scope, skipping: ${unknown.map((p) => p.id).join(', ')}.`);
  }
  const selected = providers.filter((p) => recorded.includes(p));
  if (selected.length === 0) {
    warn('Nothing to update.');
    return 1;
  }

  const manifest = readManifest(target.root);
  info(
    `Updating ${ui.bold(selected.map((p) => p.name).join(', '))} ` +
      `${ui.dim(`(${target.scope}: ${displayPath(target.root, home)}, installed by v${manifest?.cliVersion ?? '?'})`)}`,
  );

  const plan = buildPlan({
    installRoot: target.root,
    hookRoot: target.root,
    scope: target.scope,
    projectRoot,
    home,
    providers: selected,
    assets: loadAssets(flags),
    force: flags.has('--force'),
    prune: true,
  });

  if (plan.isNoop) {
    info(`${ui.good('Already up to date')} (v${cliVersion()}).`);
    return 0;
  }

  if (flags.has('--dry-run')) {
    for (const providerPlan of plan.providers) {
      for (const change of providerPlan.changes) {
        if (change.outcome === 'unchanged') continue;
        info(`  ${change.outcome.padEnd(9)} ${change.path}`);
      }
      for (const removal of providerPlan.removals) info(`  ${removal.outcome.padEnd(9)} ${removal.path}`);
    }
    return 0;
  }

  if (!yes && isInteractive() && !(await confirm('Apply the update?'))) {
    info('Aborted.');
    return 0;
  }

  const result = applyPlan(plan, { cliVersion: cliVersion(), hooks });
  reportResult(result, home);
  info(`\n${ui.good('Done.')}`);
  return 0;
}
