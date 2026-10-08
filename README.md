# Prepot

**Prepare your agents before the pull.**

One harness. Every assistant. No installer.

prepot is my personal AI agent harness — a set of skills — packaged as a
plugin. Coding agents now share the same skill
structure, so the repository *is* the install: each assistant's own plugin
system fetches it, updates it, and removes it.

## Install

### Claude Code

```sh
claude plugin install prepot@prepot
```

### Codex

```sh
codex plugin marketplace add clndl/prepot
codex plugin add prepot@prepot
```

### Any agent that reads the shared skill layout

```sh
npx skills add clndl/prepot                      # every skill
npx skills add clndl/prepot --skill prepot-plan
```

### Manually

```sh
git clone https://github.com/clndl/prepot.git
cp -r prepot/skills/* ~/.agents/skills/
```

Update and uninstall go through the same tool you installed with.

## Layout

```
prepot/
├── skills/                  one folder per skill, each with a SKILL.md
├── rules/                   RULES.md, RTK.md — opt-in rule files
├── .claude-plugin/          Claude Code plugin + marketplace manifest
├── .codex-plugin/           Codex plugin manifest
└── .agents/plugins/         shared marketplace manifest
```

The manifests are static JSON pointing at `skills/`. There is no build step and
no code to run.

### Skills

The skills, each a short `SKILL.md` that routes to its modes in `references/`,
which load only when a mode needs them:

| Skill | Modes |
|---|---|
| `prepot-lean` | Simplest solution that works: lite, full, ultra |
| `prepot-plan` | Implementation plan; brainstorm or refine first; execute inline, per subagent, or in parallel |
| `prepot-verify` | Proof before "done"; full verification loop before a PR |
| `prepot-review` | Over-engineering (diff or repo), `lean:` debt ledger, scored security audit, review feedback |
| `prepot-backlog` | Shape the backlog, run a sprint, deliver one story; lifecycle and definition of done |
| `prepot-patterns` | Language, framework, database, infrastructure patterns; React composition; frontend design; migrations; stack recipes |
| `prepot-memory` | Project memory, context hand-off, codebase knowledge graph |
| `prepot-writing` | Articles, project documentation |

### Rules

`rules/RULES.md` and `rules/RTK.md` are always-on coding rules, not skills, so
no plugin system installs them. To use them, copy them next to your assistant's
instruction file and reference them from it, for example:

```md
@RULES.md
@RTK.md
```

### Upgrading from 1.x

1.x was an npm CLI (`npx prepot-cli install`) that copied files into each
assistant's directory, wired hook manifests, and wrote `CLAUDE.md` /
`AGENTS.md`. Remove that install with the old CLI, then install the plugin:

```sh
npx prepot-cli@1 uninstall
```

---

# The bundled harness

This repository is **my personal prepot loadout** — a curated collection of the skills and workflows I use every day across AI coding assistants.

This is only a starting point. prepot is designed to be replaced, extended, and customized.

The bundled harness is not a framework or a fixed methodology. It is a practical example of how to combine different AI agent capabilities into a repeatable environment that can be installed across assistants and projects.

## Credits

My prepot is built by assembling and customizing excellent open-source work from the AI agent ecosystem.

The goal is not to reinvent these tools, but to make them composable: one harness and one consistent environment for whichever assistant you use.

| Project                                                                  | Contribution                                                                                                                     |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| [superpowers](https://github.com/obra/superpowers)                       | Source of most skills, later adapted, extended, and customized.                                                                  |
| [ponytail](https://github.com/DietrichGebert/ponytail)                   | `prepot-lean` and the simplify and debt modes of `prepot-review` (MIT, see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md))      |
| [leanharness](https://github.com/bartek-890/leanharness)                 | `prepot-verify` and the security mode of `prepot-review` (MIT, see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md))              |
| [system_prompts_leaks](https://github.com/asgeirtj/system_prompts_leaks) | Writing `prepot-plan` from scratch — a custom skill, informed by the Antigravity CLI system prompts collected there      |
| [ECC](https://github.com/affaan-m/ECC)                                   | Source of language, framework, and engineering references used by the `prepot-patterns` skill                                         |
| [rtk](https://github.com/rtk-ai/rtk)                                     | Global token-optimized CLI proxy.                                                                                                |
| [codebase-memory-mcp](https://github.com/DeusData/codebase-memory-mcp)   | Global persistent codebase memory layer used to give agents deeper project context                                               |
