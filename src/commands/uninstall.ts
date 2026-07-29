import { homedir } from 'node:os';

import { MANIFEST_DIR } from '../brand.ts';
import { findProjectRoot, installRootFor } from '../core/context.ts';
import { uninstallProviders } from '../core/installer.ts';
import { deleteManifest, readManifest } from '../core/manifest.ts';
import { allProviders } from '../providers/registry.ts';
import { displayPath, pruneEmptyDirs } from '../util/fsx.ts';
import type { Flags } from '../util/flags.ts';
import { info, ui, warn } from '../util/log.ts';
import { confirm, isInteractive } from '../util/prompt.ts';
import { explicitProviders, explicitScope, installedProviders } from './shared.ts';

export async function uninstall(flags: Flags): Promise<number> {
  const yes = flags.has('-y', '--yes');
  const force = flags.has('--force');
  const projectRoot = findProjectRoot();
  const home = homedir();

  const wanted = explicitScope(flags);
  const roots = (['project', 'user'] as const)
    .filter((scope) => (wanted ? scope === wanted : true))
    .map((scope) => installRootFor(scope, projectRoot, home))
    .filter((root) => readManifest(root) !== null);

  if (roots.length === 0) {
    warn('No prepot install found to remove.');
    return 1;
  }

  const selected = explicitProviders(flags);
  let removedTotal = 0;

  for (const root of roots) {
    const recorded = installedProviders(root);
    const targets = (selected ?? recorded).filter((p) => recorded.includes(p));
    if (targets.length === 0) continue;

    info(`Removing ${ui.bold(targets.map((p) => p.name).join(', '))} from ${displayPath(root, home)}`);
    if (!yes && isInteractive() && !(await confirm('Remove these files?', false))) {
      info('Aborted.');
      return 0;
    }

    const result = uninstallProviders(root, root, targets.map((p) => p.id), allProviders(), { force });
    removedTotal += result.removed;
    info(`  ${result.removed} file(s) removed.`);
    if (result.hookFiles.length > 0) info(`  Hooks unwired from: ${result.hookFiles.join(', ')}`);
    if (result.keptModified.length > 0) {
      warn(`  ${result.keptModified.length} file(s) kept because they have local edits (use --force to remove).`);
    }

    const remaining = readManifest(root);
    if (remaining && Object.keys(remaining.providers).length === 0) {
      deleteManifest(root);
      pruneEmptyDirs(`${root}/${MANIFEST_DIR}`, root);
    }
  }

  info(`\n${ui.good('Done.')} ${removedTotal} file(s) removed in total.`);
  return 0;
}
