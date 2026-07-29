/**
 * The one place the tool's name lives.
 *
 * It is not just the npm package name: it also names the CLI binary, the
 * manifest directory (`.prepot/`), the installed hook dispatcher
 * (`hooks/prepot-dispatch.mjs`), and the marker that identifies our entries
 * inside a provider's hook manifest.
 *
 * Renaming means changing `BRAND` here and `name` / `bin` in package.json.
 * Note that a rename orphans existing installs: the old folders and hook
 * entries carry the old name, so uninstall with the previous version first.
 */
export const BRAND = 'prepot';

/** Directory holding the install manifest, relative to the install root. */
export const MANIFEST_DIR = `.${BRAND}`;

