/**
 * In-process golden verification for the src/cli port (spec §5.1). Unlike
 * `upt-golden.test.ts` (which spawns the OLD `bin/upt.mjs`, unchanged until
 * Task 8), this file drives the new `runCli` directly against the SAME
 * committed golden fixtures, proving the port is output-identical for every
 * case whose command has been ported so far.
 *
 * `INPROCESS_READY` grows per task as commands are ported; task 5 ported the
 * eight "printer" commands (`priority`/`audit`/`coverage`/`canonical`/
 * `recover`/`connectors`/`predict`/`candidates`/`candidates-both`). Task 6
 * added `explain`/`symbolic`/`eval`/`derive` (plus `demo-no-args`, which
 * dispatches `explain`+`priority` and is fully in-process-testable now that
 * `explain` is ported). Task 7 adds `map`/`discover` (the flag-heavy pair) —
 * `map`'s visual-mode cases exercise `ctx.write` (diagram source, no
 * newline) interleaved with `ctx.out`/`ctx.err`, so the harness below
 * captures a single interleaved stdout stream (write-chunks + out-lines in
 * emission order) rather than the two separate channels task 5/6 used.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { runCli } from '../../dist/cli/main.js';
import { GOLDEN_CASES } from './golden-cases.mjs';
import { peerPresent } from '../helpers/peers.js';

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
  'explain-mass-value',
  'explain-bare-names',
  'symbolic',
  'symbolic-simplify',
  'eval',
  'derive-plain',
  'derive-formula',
  'demo-no-args',
  'map-text',
  'map-text-canonical',
  'map-text-both',
  'map-mermaid',
  'map-dot',
  'map-mermaid-proposed',
  'map-equation-ok',
  'map-equation-mismatch',
  'map-equation-visual',
  'discover',
  'discover-canonical',
  'discover-opts',
  'discover-derive',
  'discover-show-adjudicated',
];

const here = dirname(fileURLToPath(import.meta.url));
const goldenDir = resolve(here, 'golden');

function normalize(text: string): string {
  return text.replace(/\r\n/g, '\n');
}

function readGolden(name: string): string {
  return normalize(readFileSync(join(goldenDir, `${name}.txt`), 'utf8'));
}

function readStderrGolden(name: string): string {
  return normalize(readFileSync(join(goldenDir, `${name}.stderr.txt`), 'utf8'));
}

// Same filter as tests/cli/upt-golden.test.ts / golden-capture.mjs: pinStderr
// compares ONLY the equation-landing-report lines (printEquationReport: blank
// lines, `  ✓/⚠/·/●` lines, `     connects to:` continuations) — the CLI's
// own stderr output. Environment-dependent optional-peer warnings must not
// be pinned.
const REPORT_LINE = /^$|^  [✓⚠·●]|^     connects to:/u;

function filterReportLines(text: string): string {
  return text.split('\n').filter((line) => REPORT_LINE.test(line)).join('\n');
}

const cases = GOLDEN_CASES.filter((c) => INPROCESS_READY.includes(c.name));
const ungated = cases.filter((c) => !c.peerGated);
const gated = cases.filter((c) => c.peerGated);

async function runCase(name: string, args: string[], pinStderr?: boolean): Promise<void> {
  // A single interleaved stdout stream: `write` (raw diagram source, no
  // newline) and `out` (console.log semantics) both append here in emission
  // order, matching what a spawned process's real stdout would show.
  const stdout: string[] = [];
  const stderr: string[] = [];
  const io = {
    out: (line?: string) => stdout.push((line ?? '') + '\n'),
    err: (line?: string) => stderr.push((line ?? '') + '\n'),
    write: (s: string) => stdout.push(s),
  };

  const status = await runCli(args, io);

  expect(status).toBe(0);
  expect(normalize(stdout.join(''))).toBe(readGolden(name));
  if (pinStderr) {
    expect(filterReportLines(normalize(stderr.join('')))).toBe(readStderrGolden(name));
  }
}

describe('src/cli port — in-process golden corpus', () => {
  it('has at least one case selected (guards against a stale INPROCESS_READY list)', () => {
    expect(cases.length).toBe(INPROCESS_READY.length);
  });

  it.each(ungated)('$name', async ({ name, args, pinStderr }) => {
    await runCase(name, args, pinStderr);
  });
});

describe.skipIf(!peerPresent)('src/cli port — in-process golden corpus (peer-gated)', () => {
  it.each(gated)('$name', async ({ name, args, pinStderr }) => {
    await runCase(name, args, pinStderr);
  });
});
