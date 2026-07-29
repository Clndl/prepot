import { createInterface, emitKeypressEvents } from 'node:readline';

import { AbortError, ui } from './log.ts';

export interface Choice<T> {
  value: T;
  label: string;
  hint?: string;
  searchText?: string;
}

/** A full-screen keypress prompt needs a real TTY on both ends. */
export function isInteractive(): boolean {
  return Boolean(
    process.stdin.isTTY && process.stdout.isTTY && typeof process.stdin.setRawMode === 'function',
  );
}

interface KeyResult {
  lines: string[];
  done?: boolean;
  abort?: boolean;
}

function keypressSession<T>(
  render: () => string[],
  onKey: (str: string | undefined, key: KeyInfo) => KeyResult | null,
  valueAt: () => T,
): Promise<T> {
  const input = process.stdin;
  const output = process.stdout;
  const wasRaw = Boolean(input.isRaw);
  let printed = 0;
  let closed = false;

  emitKeypressEvents(input);

  return new Promise<T>((resolve, reject) => {
    const cleanup = () => {
      if (closed) return;
      closed = true;
      input.off('keypress', handle);
      if (typeof input.setRawMode === 'function') input.setRawMode(wasRaw);
      output.write('\x1b[?25h');
      input.pause();
    };

    const draw = (lines: string[]) => {
      if (printed > 0) output.write(`\x1b[${printed}A`);
      const count = Math.max(printed, lines.length);
      for (let i = 0; i < count; i++) output.write(`\x1b[2K\r${lines[i] ?? ''}\n`);
      printed = count;
    };

    function handle(str: string | undefined, key: KeyInfo = {}) {
      if (key.ctrl && key.name === 'c') {
        cleanup();
        reject(new AbortError());
        return;
      }
      const next = onKey(str, key);
      if (!next) return;
      if (next.abort) {
        cleanup();
        reject(new AbortError());
        return;
      }
      draw(next.lines);
      if (next.done) {
        cleanup();
        resolve(valueAt());
      }
    }

    input.on('keypress', handle);
    input.setRawMode(true);
    input.resume();
    output.write('\x1b[?25l');
    draw(render());
  });
}

interface KeyInfo {
  name?: string;
  ctrl?: boolean;
  meta?: boolean;
}

function clamp(index: number, length: number): number {
  if (length <= 0) return 0;
  if (index < 0) return length - 1;
  if (index >= length) return 0;
  return index;
}

/** Read one line from stdin. Works with pipes so scripted runs still answer. */
export function ask(question: string): Promise<string> {
  if (!process.stdin.isTTY) {
    process.stdout.write(question);
    return Promise.resolve('');
  }
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve, reject) => {
    rl.once('SIGINT', () => {
      rl.close();
      reject(new AbortError());
    });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

export async function confirm(question: string, defaultYes = true): Promise<boolean> {
  const answer = await ask(`${question} ${defaultYes ? '(Y/n)' : '(y/N)'} `);
  if (!answer) return defaultYes;
  return ['y', 'yes'].includes(answer);
}

export async function promptRadio<T>(
  message: string,
  choices: readonly Choice<T>[],
  initialIndex = 0,
): Promise<T> {
  let cursor = clamp(initialIndex, choices.length);

  const render = (): string[] => [
    `${ui.accent('◆')} ${ui.bold(message)}`,
    '',
    ...choices.map((choice, index) => {
      const active = index === cursor;
      const pointer = active ? ui.accent('›') : ' ';
      const mark = active ? ui.good('●') : ui.dim('○');
      const label = active ? ui.bold(choice.label) : choice.label;
      return `  ${pointer} ${mark} ${label}${choice.hint ? ` ${ui.dim(choice.hint)}` : ''}`;
    }),
    '',
    `  ${ui.dim('↑/↓ move, enter confirm')}`,
  ];

  return keypressSession<T>(
    render,
    (_str, key) => {
      if (key.name === 'up') cursor = clamp(cursor - 1, choices.length);
      if (key.name === 'down') cursor = clamp(cursor + 1, choices.length);
      if (key.name === 'return' || key.name === 'enter') return { lines: render(), done: true };
      return { lines: render() };
    },
    () => choices[cursor]!.value,
  );
}

export async function promptCheckbox<T>(
  message: string,
  choices: readonly Choice<T>[],
  preselected: readonly T[] = [],
): Promise<T[]> {
  const selected = new Set<T>(preselected);
  let cursor = 0;
  let query = '';
  let error = '';
  const maxVisible = Math.max(5, Math.min(choices.length, (process.stdout.rows ?? 24) - 10));

  const filtered = (): readonly Choice<T>[] => {
    const needle = query.trim().toLowerCase();
    if (!needle) return choices;
    return choices.filter((c) => (c.searchText ?? c.label).toLowerCase().includes(needle));
  };

  const render = (): string[] => {
    const list = filtered();
    cursor = clamp(cursor, list.length);
    const start = Math.min(Math.max(0, cursor - maxVisible + 1), Math.max(0, list.length - maxVisible));
    const end = Math.min(list.length, start + maxVisible);
    const lines = [
      `${ui.accent('◆')} ${ui.bold(message)}`,
      '',
      `  Filter: ${query || ui.dim('type to filter')}`,
      `  ${ui.dim('↑/↓ move, space toggle, enter confirm')}`,
      '',
    ];
    if (list.length === 0) lines.push(`  ${ui.dim('No matches')}`);
    for (let i = start; i < end; i++) {
      const choice = list[i]!;
      const active = i === cursor;
      const pointer = active ? ui.accent('›') : ' ';
      const mark = selected.has(choice.value) ? ui.good('●') : ui.dim('○');
      const label = active ? ui.bold(choice.label) : choice.label;
      lines.push(`  ${pointer} ${mark} ${label}${choice.hint ? ` ${ui.dim(choice.hint)}` : ''}`);
    }
    lines.push('');
    lines.push(`  Selected: ${selected.size === 0 ? ui.dim('none') : selected.size}`);
    if (error) lines.push(`  ${ui.warn(error)}`);
    return lines;
  };

  return keypressSession<T[]>(
    render,
    (str, key) => {
      const list = filtered();
      if (key.name === 'up') cursor = clamp(cursor - 1, list.length);
      if (key.name === 'down') cursor = clamp(cursor + 1, list.length);
      if (key.name === 'space' || str === ' ') {
        const choice = list[cursor];
        if (choice) {
          if (selected.has(choice.value)) selected.delete(choice.value);
          else selected.add(choice.value);
          error = '';
        }
      }
      if (key.name === 'backspace') {
        query = query.slice(0, -1);
        cursor = 0;
      }
      if (str && str.length === 1 && str >= '!' && !key.ctrl && !key.meta) {
        query += str;
        cursor = 0;
      }
      if (key.name === 'return' || key.name === 'enter') {
        if (selected.size === 0) {
          error = 'Choose at least one provider.';
          return { lines: render() };
        }
        return { lines: render(), done: true };
      }
      return { lines: render() };
    },
    () => choices.filter((c) => selected.has(c.value)).map((c) => c.value),
  );
}
