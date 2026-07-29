export interface Flags {
  readonly raw: readonly string[];
  has(...names: string[]): boolean;
  value(...names: string[]): string | null;
}

/**
 * Minimal flag reader. Supports `--name=value`, `--name value`, and bare
 * switches. Deliberately not a full parser: the CLI's surface is small and a
 * dependency-free reader keeps `npx prepot` a single-package download.
 */
export function parseFlags(argv: readonly string[]): Flags {
  const raw = [...argv];
  return {
    raw,
    has(...names) {
      return names.some((name) => raw.includes(name));
    },
    value(...names) {
      for (const name of names) {
        const inline = raw.find((arg) => arg.startsWith(`${name}=`));
        if (inline) return inline.slice(name.length + 1);
        const index = raw.indexOf(name);
        const next = index === -1 ? undefined : raw[index + 1];
        if (next !== undefined && !next.startsWith('-')) return next;
      }
      return null;
    },
  };
}

export function unknownFlags(flags: Flags, known: readonly string[]): string[] {
  const knownSet = new Set(known);
  return flags.raw.filter((arg) => {
    if (!arg.startsWith('-')) return false;
    const name = arg.split('=')[0] ?? arg;
    return !knownSet.has(name);
  });
}
