/**
 * In-process golden verification for the src/cli port (spec §5.1). Unlike
 * `upt-golden.test.ts` (which spawns the OLD `bin/upt.mjs`, unchanged until
 * Task 8), this file drives the new `runCli` directly against the SAME
 * committed golden fixtures, proving the port is output-identical for every
 * case whose command has been ported so far.
 *
 * `INPROCESS_READY` grows per task as commands are ported; task 5 ports the
 * eight "printer" commands (`priority`/`audit`/`coverage`/`canonical`/
 * `recover`/`connectors`/`predict`/`candidates`/`candidates-both`). `map` is
 * explicitly excluded — it is not part of this task.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { runCli } from '../../dist/cli/main.js';
import { GOLDEN_CASES } from './golden-cases.mjs';

export const INPROCESS_READY: string[] = [
  'priority',
  'audit',
  'coverage',
  'canonical',
  'recover',
  'connectors',
  'predict',
  'candidates',
  'candidates-both',
];

const here = dirname(fileURLToPath(import.meta.url));
const goldenDir = resolve(here, 'golden');

function normalize(text: string): string {
  return text.replace(/\r\n/g, '\n');
}

function readGolden(name: string): string {
  return normalize(readFileSync(join(goldenDir, `${name}.txt`), 'utf8'));
}

const cases = GOLDEN_CASES.filter((c) => INPROCESS_READY.includes(c.name));

describe('src/cli port — in-process golden corpus', () => {
  it('has at least one case selected (guards against a stale INPROCESS_READY list)', () => {
    expect(cases.length).toBe(INPROCESS_READY.length);
  });

  it.each(cases)('$name', async ({ name, args }) => {
    const writes: string[] = [];
    const outLines: string[] = [];
    const errLines: string[] = [];
    const io = {
      out: (line?: string) => outLines.push((line ?? '') + '\n'),
      err: (line?: string) => errLines.push((line ?? '') + '\n'),
      write: (s: string) => writes.push(s),
    };

    const status = await runCli(args, io);

    expect(status).toBe(0);
    expect(normalize(outLines.join(''))).toBe(readGolden(name));
  });
});
