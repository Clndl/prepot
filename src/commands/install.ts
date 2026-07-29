import { MANIFEST_DIR } from '../brand.ts';
import { cliVersion } from '../core/context.ts';
import { applyPlan } from '../core/installer.ts';
import { displayPath } from '../util/fsx.ts';
import type { Flags } from '../util/flags.ts';
import { info, ui } from '../util/log.ts';
import { confirm, isInteractive } from '../util/prompt.ts';
import { planFor, reportResult, resolveTargets } from './shared.ts';

export async function install(flags: Flags): Promise<number> {
  const yes = flags.has('-y', '--yes');
  const hooks = !flags.has('--no-hooks');
  const dryRun = flags.has('--dry-run');

  if (!yes && isInteractive()) {
    info(`${ui.accent(ui.bold('prepot'))} ${ui.dim('install')}\n`);
  }

  const resolved = await resolveTargets(flags);
  const plan = planFor(resolved, flags);

  info('');
  info(
    `Installing into ${ui.bold(resolved.providers.map((p) => p.name).join(', '))} ` +
      `${ui.dim(`(${resolved.scope === 'user' ? 'global' : 'project'}: ${displayPath(resolved.installRoot, resolved.home)})`)}`,
  );

  const writes = plan.providers.flatMap((p) => p.changes).filter((c) => c.outcome !== 'unchanged').length;
  if (dryRun) {
    info(`${ui.dim(`Dry run: ${writes} file operation(s) would run across ${plan.providers.length} provider(s).`)}`);
    for (const providerPlan of plan.providers) {
      for (const change of providerPlan.changes) {
        if (change.outcome === 'unchanged') continue;
        info(`  ${change.outcome.padEnd(9)} ${change.path}`);
      }
      for (const removal of providerPlan.removals) info(`  ${removal.outcome.padEnd(9)} ${removal.path}`);
    }
    return 0;
  }

  if (!yes && isInteractive() && !(await confirm('Proceed?'))) {
    info('Aborted.');
    return 0;
  }

  const result = applyPlan(plan, { cliVersion: cliVersion(), hooks });
  reportResult(result, resolved.home);
  info(`\n${ui.good('Done.')} Manifest: ${displayPath(`${resolved.installRoot}/${MANIFEST_DIR}/manifest.json`, resolved.home)}`);
  return 0;
}
