import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { after, describe, it } from 'node:test';

import { HOOK_MARKER, applyHookManifests, removeHookEntries } from '../src/core/hooks.ts';
import { providerById } from '../src/providers/registry.ts';
import { cleanup, tempDir } from './helpers.ts';

const scratch: string[] = [];
after(() => cleanup(...scratch));

describe('uninstall stays inside its own footprint', () => {
  function root() {
    const dir = tempDir('sp-boundary-');
    scratch.push(dir);
    return dir;
  }

  it("never deletes a provider's own configuration directory", () => {
    const dir = root();
    for (const id of ['claude', 'grok', 'cursor', 'codex']) {
      const provider = providerById(id)!;
      applyHookManifests({ provider, installRoot: dir, hookRoot: dir, command: `node ${HOOK_MARKER}` });
      removeHookEntries(provider, dir, dir);
      const configDir = join(dir, provider.hookManifests![0]!.file.split('/')[0]!);
      assert.ok(existsSync(configDir), `${id}: ${configDir} should survive uninstall`);
    }
  });
});
