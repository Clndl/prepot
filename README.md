# Prepot

**Prepare your agents before the pull.**

One harness. Every assistant. One command.

```sh
npx prepot-cli install
```

## What this is

Every AI coding assistant keeps its instructions somewhere different — Claude
Code in `.claude/skills/`, Codex in `.agents/skills/`, Cursor in `.cursor/`. Use
more than one and you are copying the same files into four directories by hand,
where they drift apart within a week.

prepot is **an installer, not a content pack**. You put your content in one
directory:

```
assets/
  skills/       agents/       workflows/
  hooks/        config/
```

and prepot copies it into every assistant, each in the layout it expects. That
directory is the whole contract — provider layouts, hook wiring, safe updates
and uninstall are machinery that does not care whose content it carries.

**This repository ships my personal harness as the default payload.** It is an example, not the
point: fork it, replace `assets/`, and it ships your AI toolchain instead. See
[Build your own prepot](#build-your-own-prepot).

- **No account, no service, no telemetry.** Content ships in the package; the
  CLI makes no network calls.
- **It never eats your edits.** Every file is tracked by hash. See
  [Safe updates](#safe-updates).
- **It cleans up after itself.** `uninstall` removes exactly what it installed.

## Quick start

```sh
npx prepot-cli install                   # your project/workspace
npx prepot-cli install --scope=global    # your whole machine
npx prepot-cli update                    # pull in the latest content
npx prepot-cli doctor                    # what is installed, and is it healthy
```

Project-scoped by default. Providers are detected from the directories already
present; with nothing to detect, the default is Claude Code.

## Commands

| Command | What it does |
| --- | --- |
| `install` | Copy the payload in and wire up hooks |
| `update` | Refresh an existing install to this version's content |
| `uninstall` | Remove what prepot installed |
| `doctor` | Report install health; changes nothing |

| Flag | Meaning |
| --- | --- |
| `--providers=claude,codex` | Target providers. Default: detected, else `claude` |
| `--scope=global` | Install into your home dir. Default: `project` |
| `-y`, `--yes` | Non-interactive; take the defaults |
| `--force` | Overwrite files that have local edits |
| `--no-hooks` | Skip provider hook manifests |
| `--dry-run` | Print what would change and exit |
| `--source=<path>` | Install from a different payload directory |

## Providers

| id | Provider | Project | Global |
| --- | --- | --- | --- |
| `claude` | Claude Code | `.claude` | `~/.claude` |
| `codex` | Codex CLI | `.agents` | `~/.codex` |
| `cursor` | Cursor | `.cursor` | `~/.cursor` |
| `grok` | Grok Build | `.grok` | `~/.grok` |
| `gemini` | Gemini CLI | `.gemini` | `~/.gemini` |
| `copilot` | GitHub Copilot | `.github` | `~/.copilot` |
| `opencode` | OpenCode | `.opencode` | `$OPENCODE_CONFIG_DIR`, else `~/.config/opencode` |

A provider counts as detected when its directory above exists. Nothing shells
out to a provider binary.

## How it installs

The payload's directories map one for one onto each provider's:

| In `assets/` | Installed to |
| --- | --- |
| `skills/` | `<provider>/skills/` |
| `agents/` | `<provider>/agents/` |
| `workflows/` | `<provider>/workflows/` |
| `hooks/` | `<provider>/hooks/` |
| `config/` | `<provider>/` — global installs only |

Installing into a project for Claude Code gives:

```
my-project/
├── .claude/
│   ├── skills/
│   ├── agents/
│   ├── workflows/
│   ├── hooks/
│   │   ├── react/
│   │   ├── springboot/
│   │   └── prepot-dispatch.mjs
│   └── settings.local.json     hook wiring, merged not overwritten
└── .prepot/manifest.json       what was installed, and its hashes
```

Copilot is the one exception: its agent files take a `.agent.md` suffix.

Hook-capable providers get one guarded command (`[ ! -f X ] || node X`) pointing
at `prepot-dispatch.mjs`, so a missing file is a no-op rather than a crash. The
dispatcher runs the stack folders sitting beside it. Existing hook manifests are
merged, never replaced.

### Config files

Instruction files install into the provider root, on **global installs only** —
each assistant reads them from its own home directory:

```
~/.claude/CLAUDE.md   ~/.claude/RULES.md   ~/.claude/RTK.md
~/.codex/AGENTS.md    ~/.codex/RULES.md    ~/.codex/RTK.md
```

`assets/config/shared/` goes to every provider; `assets/config/<provider-id>/`
to that one only — each assistant reads a differently named entrypoint. Absolute
paths cannot be committed literally, so `{{PROVIDER_ROOT}}` and `{{HOME}}` are
substituted at write time, in config files only:

```
@{{PROVIDER_ROOT}}/RTK.md    ->    @/Users/you/.codex/RTK.md
```

## Safe updates

Every installed file is recorded in `.prepot/manifest.json` with its hash. On
the next run:

- **Untouched** (hash matches) — safely replaced.
- **Already current** — left alone, and adopted if the manifest was lost, so a
  deleted manifest heals instead of turning into noise.
- **Edited by you** — never overwritten. The new version lands beside it as
  `<file>.new` and the conflict is reported. `--force` overrides.

Retired content is deleted on update and by `uninstall`, unless you edited it.
Runs are idempotent. A payload with no content at all is refused outright,
rather than read as "everything was retired".

---

# The bundled harness

The default `assets/` directory is **my personal prepot loadout** — a curated collection of the skills, agents, workflows, hooks, and tooling I use every day across AI coding assistants.

It includes my current collection of:

* skills
* agents
* workflows
* hooks
* assistant instructions
* global developer tooling

This is only a starting point. prepot is designed to be replaced, extended, and customized.

The bundled harness is not a framework or a fixed methodology. It is a practical example of how to combine different AI agent capabilities into a repeatable environment that can be installed across assistants and projects.

## Credits

My prepot is built by assembling and customizing excellent open-source work from the AI agent ecosystem.

The goal is not to reinvent these tools, but to make them composable: one installer, one harness, and one consistent environment for whichever assistant you use.

| Project                                                                  | Contribution                                                                                                                     |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| [agency-agents](https://github.com/msitarzewski/agency-agents)           | Foundation and tooling used to structure and install the specialized agents included in this harness                             |
| [superpowers](https://github.com/obra/superpowers)                       | Source of most skills, later adapted, extended, and customized.                                                                  |
| [system_prompts_leaks](https://github.com/asgeirtj/system_prompts_leaks) | Writing `implementation-plan` from scratch — a custom skill, informed by the Antigravity CLI system prompts collected there      |
| [ECC](https://github.com/affaan-m/ECC)                                   | Source of language, framework, and engineering references used by the `patterns` skill                                           |
| [rtk](https://github.com/rtk-ai/rtk)                                     | Global token-optimized CLI proxy.                                                                                                |
| [codebase-memory-mcp](https://github.com/DeusData/codebase-memory-mcp)   | Global persistent codebase memory layer used to give agents deeper project context                                               |

## Build your own prepot

The bundled payload is only one possible build.

Swap the skills. Replace the agents. Add your own hooks. Change the workflows.

The purpose of prepot is not to give everyone the same build.

It is to give everyone the ability to create their own AI agent environment.

To add a provider, append one entry to `PROVIDERS` in
`src/providers/definitions.ts`:

```ts
{
  id: 'newtool',
  name: 'New Tool',
  dir: '.newtool',
  aliases: ['nt'],
  layout: { skills: 'skills', agents: 'agents', workflows: 'workflows', hooks: 'hooks' },
  root: (scope, projectRoot, home) =>
    scope === 'user' ? join(home, '.newtool') : join(projectRoot, '.newtool'),
  hookManifests: [/* optional */],
}
```

Every command picks it up with no further changes. Rename the tool itself by
editing `src/brand.ts` plus `name` / `bin` in `package.json`.

## Development

```sh
npm install       # runs `prepare` -> builds dist/
npm run build     # tsc + chmod the CLI entrypoint
npm test          # node:test suite
```

Take the installer. Replace the skills. Add your own hooks. Keep what works, remove what doesn't.

**The best prepot is the one you build yourself.**