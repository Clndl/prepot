import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

import { cliVersion, findProjectRoot, installRootFor } from '../core/context.ts';
import { buildPlan } from '../core/installer.ts';
import { readManifest } from '../core/manifest.ts';
import { hookManifestInstalled } from '../core/hooks.ts';
import { detectProviders } from '../providers/registry.ts';
import { displayPath, hashFile } from '../util/fsx.ts';
import type { Flags } from '../util/flags.ts';
import { info, ui } from '../util/log.ts';
import { installedProviders, loadAssets, printDetections } from './shared.ts';

type Level = 'ok' | 'warn' | 'error';

interface Finding {
  level: Level;
  message: string;
  fix?: string;
}

const BADGE: Record<Level, string> = {
  ok: ui.good('ok  '),
  warn: ui.warn('warn'),
  error: ui.bad('err '),
};

/**
 * Report the state of every install without changing anything. Diagnostics are
 * derived from the manifest plus a fresh plan, so `doctor` and `update` can
 * never disagree about what is out of date.
 */
export async function doctor(flags: Flags): Promise<number> {
  const projectRoot = findProjectRoot();
  const home = homedir();
  const findings: Finding[] = [];

  info(`${ui.accent(ui.bold('prepot'))} ${ui.dim(`doctor (CLI v${cliVersion()})`)}\n`);
  printDetections(projectRoot, detectProviders(projectRoot, home), home);

  let assets;
  try {
    assets = loadAssets(flags);
    findings.push({ level: 'ok', message: `Harness payload readable (${assets.length} files).` });
  } catch (error) {
    findings.push({
      level: 'error',
      message: `Harness payload unreadable: ${(error as Error).message}`,
      fix: 'Reinstall the CLI, or pass --source=<harness checkout>.',
    });
  }

  let anyInstall = false;
  for (const scope of ['project', 'user'] as const) {
    const root = installRootFor(scope, projectRoot, home);
    const manifest = readManifest(root);
    if (!manifest) continue;
    anyInstall = true;

    const label = `${scope} install (${displayPath(root, home)})`;
    info(`${ui.bold(label)}  ${ui.dim(`installed by v${manifest.cliVersion}, ${manifest.updatedAt}`)}`);

    const providers = installedProviders(root);
    const unknownIds = Object.keys(manifest.providers).filter(
      (id) => !providers.some((p) => p.id === id),
    );
    if (unknownIds.length > 0) {
      findings.push({
        level: 'warn',
        message: `${label}: manifest names providers this CLI does not know: ${unknownIds.join(', ')}.`,
        fix: 'Upgrade the CLI, or run `npx prepot uninstall --providers=<id>`.',
      });
    }

    for (const provider of providers) {
      const entry = manifest.providers[provider.id]!;
      const missing = entry.files.filter((f) => !existsSync(join(root, f.path)));
      const edited = entry.files.filter(
        (f) => existsSync(join(root, f.path)) && hashFile(join(root, f.path)) !== f.hash,
      );

      if (missing.length > 0) {
        findings.push({
          level: 'error',
          message: `${provider.name} (${scope}): ${missing.length} installed file(s) are missing.`,
          fix: 'Run `npx prepot update`.',
        });
      }
      if (edited.length > 0) {
        findings.push({
          level: 'warn',
          message: `${provider.name} (${scope}): ${edited.length} file(s) edited locally; updates will skip them.`,
          fix: 'Run `npx prepot update --force` to take the shipped version.',
        });
      }
      if ((provider.hookManifests?.length ?? 0) > 0 && !hookManifestInstalled(provider, root)) {
        findings.push({
          level: 'warn',
          message: `${provider.name} (${scope}): hook manifest is not wired up.`,
          fix: 'Run `npx prepot update`.',
        });
      }
      if (missing.length === 0 && edited.length === 0) {
        findings.push({ level: 'ok', message: `${provider.name} (${scope}): ${entry.files.length} files intact.` });
      }
    }

    if (assets && providers.length > 0) {
      const plan = buildPlan({
        installRoot: root,
        hookRoot: root,
        scope,
        projectRoot,
        home,
        providers,
        assets,
        prune: true,
      });
      if (plan.isNoop) {
        findings.push({ level: 'ok', message: `${label}: content matches CLI v${cliVersion()}.` });
      } else {
        const pending = plan.providers.reduce(
          (n, p) => n + p.changes.filter((c) => c.outcome !== 'unchanged').length + p.removals.length,
          0,
        );
        findings.push({
          level: 'warn',
          message: `${label}: ${pending} file(s) differ from CLI v${cliVersion()}.`,
          fix: 'Run `npx prepot update`.',
        });
      }
    }
    info('');
  }

  if (!anyInstall) {
    findings.push({
      level: 'warn',
      message: 'No prepot install found in this project or globally.',
      fix: 'Run `npx prepot install`.',
    });
  }

  for (const finding of findings) {
    info(`  ${BADGE[finding.level]}  ${finding.message}`);
    if (finding.fix) info(`        ${ui.dim(finding.fix)}`);
  }

  const errors = findings.filter((f) => f.level === 'error').length;
  info('');
  info(errors > 0 ? ui.bad(`${errors} problem(s) found.`) : ui.good('No problems found.'));
  return errors > 0 ? 1 : 0;
}
