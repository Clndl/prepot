export type Scope = 'project' | 'user';

export type AssetKind = 'skill' | 'agent' | 'workflow' | 'hook' | 'runtime' | 'config';

/**
 * Where a provider keeps each kind of asset, relative to its own root
 * (`<project>/.claude`, `~/.claude`, ...).
 *
 * The four directories mirror the payload's own top-level layout one for one,
 * so `assets/workflows/` lands at `<provider>/workflows/` and nothing is buried
 * under an extra namespace folder.
 */
export interface ProviderLayout {
  skills: string;
  agents: string;
  workflows: string;
  hooks: string;
  /** Rename hook for providers with their own agent-file suffix (Copilot). */
  agentFileName?: (baseName: string) => string;
}

/**
 * A hook manifest a provider needs on top of the copied files, e.g. Claude's
 * `settings.local.json`. `build` receives the command line that runs the
 * installed dispatcher and returns the fragment to merge in.
 */
export interface HookManifest {
  /** Path relative to the *hook root* (always the project root). */
  file: string;
  build: (command: string) => Record<string, unknown>;
}

export interface Provider {
  readonly id: string;
  readonly name: string;
  /** Directory that holds this provider's assets inside a project. */
  readonly dir: string;
  readonly aliases: readonly string[];
  readonly layout: ProviderLayout;
  /** Provider root for a given scope. */
  root(scope: Scope, projectRoot: string, home: string): string;
  /**
   * Extra directories whose presence signals the provider is in use, beyond
   * `root()` itself (Codex is configured in `~/.codex` but reads `.agents`).
   */
  detectionDirs?: (scope: Scope, projectRoot: string, home: string) => string[];
  /** Hook manifests to merge. Absent means the provider takes no hooks. */
  hookManifests?: readonly HookManifest[];
}
