function styled(): boolean {
  return Boolean(process.stdout.isTTY && process.env.NO_COLOR === undefined && process.env.TERM !== 'dumb');
}

function wrap(open: string, close: string, value: unknown): string {
  const text = String(value);
  return styled() ? `${open}${text}${close}` : text;
}

export const ui = {
  accent: (v: unknown) => wrap('\x1b[36m', '\x1b[0m', v),
  bold: (v: unknown) => wrap('\x1b[1m', '\x1b[22m', v),
  dim: (v: unknown) => wrap('\x1b[2m', '\x1b[22m', v),
  good: (v: unknown) => wrap('\x1b[32m', '\x1b[0m', v),
  warn: (v: unknown) => wrap('\x1b[33m', '\x1b[0m', v),
  bad: (v: unknown) => wrap('\x1b[31m', '\x1b[0m', v),
};

export function info(message: string): void {
  console.log(message);
}

export function warn(message: string): void {
  console.warn(`${ui.warn('!')} ${message}`);
}

export function fail(message: string): void {
  console.error(`${ui.bad('x')} ${message}`);
}

export function heading(message: string): void {
  console.log(`${ui.accent('◇')} ${ui.bold(message)}`);
}

/** Thrown when the user interrupts a prompt; the CLI turns it into exit 130. */
export class AbortError extends Error {
  readonly code = 'PREPOT_ABORT';
  constructor() {
    super('Aborted.');
    this.name = 'AbortError';
  }
}

export function isAbortError(error: unknown): boolean {
  return (error as { code?: string } | null)?.code === 'PREPOT_ABORT';
}
