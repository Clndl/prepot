#!/usr/bin/env node
/** Make the compiled entrypoint directly executable, so `bin` works from a checkout. */

import { chmodSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const cli = join(resolve(dirname(fileURLToPath(import.meta.url)), '..'), 'dist', 'cli.js');
if (existsSync(cli)) chmodSync(cli, 0o755);
