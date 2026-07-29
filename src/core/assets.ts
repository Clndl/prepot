import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { BRAND } from '../brand.ts';
import { isNoise, walkFiles } from '../util/fsx.ts';
import type { AssetKind, Provider, Scope } from '../providers/types.ts';

export interface Asset {
  kind: AssetKind;
  /** Path relative to the kind's own root, e.g. `patterns/SKILL.md`. */
  rel: string;
  /** Absolute path to the file to copy. */
  src: string;
  /** When set, only this provider receives the asset. */
  providerId?: string;
}

/** Top-level harness directories, and the asset kind each one produces. */
const KIND_DIRS: ReadonlyArray<{ dir: string; kind: AssetKind }> = [
  { dir: 'skills', kind: 'skill' },
  { dir: 'agents', kind: 'agent' },
  { dir: 'workflows', kind: 'workflow' },
  { dir: 'hooks', kind: 'hook' },
];

/**
 * Instruction files that configure the assistant itself, rather than content it
 * loads on demand: CLAUDE.md, AGENTS.md, and the rule files they pull in.
 *
 * `config/shared/` goes to every provider; `config/<provider-id>/` goes only to
 * that provider, because each assistant reads a differently named entrypoint
 * (Claude reads CLAUDE.md, Codex reads AGENTS.md) whose contents are not
 * interchangeable.
 */
const CONFIG_DIR = 'config';
const CONFIG_SHARED = 'shared';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

/**
 * Where the harness payload comes from.
 *
 * `assets/` in this repo is the payload itself, not a generated copy of one:
 * it is edited in place, committed, and shipped in the package. That makes
 * `npx prepot@latest` the update channel, with no build step between editing a
 * skill and releasing it, and no network call of the CLI's own.
 *
 * `--source` / `PREPOT_SOURCE` override it, which is useful for trying a
 * payload out before committing it.
 */
export function resolveSourceRoot(sourceFlag?: string | null): string {
  const explicit = sourceFlag ?? process.env.PREPOT_SOURCE ?? null;
  if (explicit) {
    const path = isAbsolute(explicit) ? explicit : resolve(process.cwd(), explicit);
    if (!existsSync(path)) throw new Error(`Source not found: ${path}`);
    return path;
  }
  const bundled = join(packageRoot, 'assets');
  if (!existsSync(bundled)) {
    // assets/ is committed, so a missing one means a damaged checkout or a
    // broken package rather than a step the user forgot to run.
    throw new Error(
      `Harness payload missing at ${bundled}. Reinstall prepot, or pass --source=<payload dir>.`,
    );
  }
  return bundled;
}

/** The dispatcher that provider hooks invoke. Shipped with the CLI, not the harness. */
export function runtimeAssets(): Asset[] {
  const dispatch = join(packageRoot, 'runtime', 'dispatch.mjs');
  return existsSync(dispatch) ? [{ kind: 'runtime', rel: 'dispatch.mjs', src: dispatch }] : [];
}

/**
 * Config assets, grouped by the provider they belong to. `shared` entries carry
 * no providerId and go everywhere.
 */
function collectConfigAssets(sourceRoot: string): Asset[] {
  const configRoot = join(sourceRoot, CONFIG_DIR);
  if (!existsSync(configRoot)) return [];
  const assets: Asset[] = [];
  for (const group of readdirSync(configRoot, { withFileTypes: true })) {
    if (!group.isDirectory() || isNoise(group.name)) continue;
    const groupRoot = join(configRoot, group.name);
    for (const rel of walkFiles(groupRoot)) {
      const asset: Asset = { kind: 'config', rel, src: join(groupRoot, rel) };
      if (group.name !== CONFIG_SHARED) asset.providerId = group.name;
      assets.push(asset);
    }
  }
  return assets;
}

export function collectAssets(sourceRoot: string): Asset[] {
  const assets: Asset[] = [];
  for (const { dir, kind } of KIND_DIRS) {
    const root = join(sourceRoot, dir);
    // A missing or empty kind directory is fine on its own: a harness need not
    // ship workflows, and dropping one legitimately prunes it on update.
    for (const rel of walkFiles(root)) assets.push({ kind, rel, src: join(root, rel) });
  }
  assets.push(...collectConfigAssets(sourceRoot));

  // But a payload with NO harness content at all is never a real state - it
  // means a bad --source, a failed asset sync, or a broken package. Refuse it,
  // because update would read "everything was retired" and prune a whole
  // install. The runtime dispatcher is added after this check precisely so it
  // cannot make an empty payload look populated.
  if (assets.length === 0) {
    throw new Error(
      `No harness content found under ${sourceRoot}. Expected files in skills/, agents/, workflows/ or hooks/. ` +
        'Refusing to continue: an empty payload would remove an existing install.',
    );
  }

  assets.push(...runtimeAssets());
  return assets;
}

/**
 * Destination for an asset, relative to the provider's own root.
 *
 * The payload's top-level directories map one for one onto the provider's, so
 * `assets/workflows/x.md` lands at `<provider>/workflows/x.md` and sits beside
 * `skills/` and `agents/` rather than under an extra namespace folder.
 */
export function assetDest(provider: Provider, asset: Asset): string {
  const { layout } = provider;
  switch (asset.kind) {
    case 'skill':
      return `${layout.skills}/${asset.rel}`;
    case 'agent': {
      const rename = layout.agentFileName;
      if (!rename) return `${layout.agents}/${asset.rel}`;
      const slash = asset.rel.lastIndexOf('/');
      const dir = slash === -1 ? '' : `${asset.rel.slice(0, slash)}/`;
      return `${layout.agents}/${dir}${rename(asset.rel.slice(slash + 1))}`;
    }
    case 'workflow':
      return `${layout.workflows}/${asset.rel}`;
    case 'hook':
      return `${layout.hooks}/${asset.rel}`;
    case 'runtime':
      // The dispatcher sits at the root of the hooks directory it dispatches
      // for, so it finds the stack folders beside it with no configured path.
      // Scanning only looks at directories, so it never dispatches to itself.
      // Brand-prefixed so it cannot collide with a hook script of the same name.
      return `${layout.hooks}/${BRAND}-${asset.rel}`;
    case 'config':
      // Straight into the provider's root: an assistant only reads its
      // instruction file from its own top level (~/.claude/CLAUDE.md).
      return asset.rel;
  }
}

/** Files that must stay executable for the hooks to run at all. */
export function isExecutableAsset(asset: Asset): boolean {
  return asset.kind === 'hook' && asset.rel.endsWith('.sh');
}

export interface RenderContext {
  /** Absolute provider root for the scope being installed into. */
  providerRoot: string;
  home: string;
}

/**
 * Config files reference absolute paths (`@/Users/me/.codex/RULES.md`), which
 * cannot be committed as-is: the user account and machine differ per install.
 * The payload stores placeholders and they are resolved here, at write time.
 *
 * Only config assets are templated. Skills and agents are copied byte for byte,
 * so nothing in the harness content can be silently rewritten.
 */
export function renderAsset(asset: Asset, context: RenderContext): Buffer {
  const bytes = readFileSync(asset.src);
  if (asset.kind !== 'config') return bytes;
  const rendered = bytes
    .toString('utf-8')
    .replaceAll('{{PROVIDER_ROOT}}', context.providerRoot)
    .replaceAll('{{HOME}}', context.home);
  return Buffer.from(rendered, 'utf-8');
}

/**
 * The assets a given provider receives at a given scope.
 *
 * Config files are user-scope only. They configure the assistant globally, and
 * each assistant reads them from its own home directory; writing them into a
 * repo's `.claude/` would put an instruction file where nothing reads it.
 */
export function assetsForProvider(
  assets: readonly Asset[],
  provider: Provider,
  scope: Scope,
): Asset[] {
  return assets.filter((asset) => {
    if (asset.kind === 'config' && scope !== 'user') return false;
    return asset.providerId === undefined || asset.providerId === provider.id;
  });
}
