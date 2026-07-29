#!/usr/bin/env node

import { doctor } from './commands/doctor.ts';
import { install } from './commands/install.ts';
import { uninstall } from './commands/uninstall.ts';
import { update } from './commands/update.ts';
import { cliVersion } from './core/context.ts';
import { allProviders } from './providers/registry.ts';
import { parseFlags } from './util/flags.ts';
import { fail, info, isAbortError, ui } from './util/log.ts';

const USAGE = `Usage: prepot <command> [options]

Commands:
  install      Install your harness into your AI coding assistants
  update       Refresh an existing install to this CLI's harness version
  uninstall    Remove files prepot installed (tracked via the manifest)
  doctor       Report install health without changing anything

Options:
  --providers=<a,b>   Target providers, default claude (${allProviders().map((p) => p.id).join(', ')})
  --scope=<s>         project (default) | global   (aliases: --project, --global)
  --source=<path>     Install from a harness checkout instead of the bundled payload
  -y, --yes           Non-interactive; take the defaults
  --force             Overwrite files that have local edits
  --no-hooks          Skip provider hook manifests
  --dry-run           Print what would change and exit
  -h, --help          Show this message
  -v, --version       Show the CLI version

Examples:
  npx prepot install
  npx prepot install --providers=claude,codex,cursor,grok --scope=project
  npx prepot update --global
  npx prepot doctor`;

const COMMANDS = {
  install,
  update,
  uninstall,
  doctor,
} as const;

type CommandName = keyof typeof COMMANDS;

async function main(): Promise<number> {
  const argv = process.argv.slice(2);
  const command = argv[0];

  if (!command || command === '--help' || command === '-h' || command === 'help') {
    info(USAGE);
    return 0;
  }
  if (command === '--version' || command === '-v') {
    info(cliVersion());
    return 0;
  }

  const flags = parseFlags(argv.slice(1));
  if (flags.has('--help', '-h')) {
    info(USAGE);
    return 0;
  }

  const handler = COMMANDS[command as CommandName];
  if (!handler) {
    fail(`Unknown command: "${command}"`);
    info(`Run ${ui.bold('prepot --help')} for the list of commands.`);
    return 1;
  }

  return handler(flags);
}

main()
  .then((code) => {
    process.exitCode = code;
  })
  .catch((error: unknown) => {
    if (isAbortError(error)) {
      info('\nAborted.');
      process.exitCode = 130;
      return;
    }
    fail((error as Error)?.message ?? String(error));
    process.exitCode = 1;
  });
