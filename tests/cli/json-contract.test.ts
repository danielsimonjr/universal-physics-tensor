/**
 * `--json` contract coverage for task 6's ported commands
 * (`explain`/`symbolic`/`eval`/`derive`). In-process against the new
 * `src/cli` port (dist/cli/main.js) — these commands never had `--json` on
 * the old bin/upt.mjs, so there is no golden text to compare against; this
 * file instead pins the JSON *shape* (spec field names from the task-6
 * brief) plus the "errors never emit JSON" invariant.
 */
import { describe, it, expect } from 'vitest';
import { runCli } from '../../dist/cli/main.js';

function makeIo() {
  const outLines: string[] = [];
  const errLines: string[] = [];
  const writes: string[] = [];
  const io = {
    out: (line?: string) => outLines.push((line ?? '') + '\n'),
    err: (line?: string) => errLines.push((line ?? '') + '\n'),
    write: (s: string) => writes.push(s),
  };
  return { io, outLines, errLines, writes };
}

async function runJson(args: string[]): Promise<{ status: number; envelope: any; raw: string }> {
  const { io, writes } = makeIo();
  const status = await runCli(args, io);
  const raw = writes.join('');
  const envelope = raw.length > 0 ? JSON.parse(raw) : undefined;
  return { status, envelope, raw };
}

describe('json-contract — explain --json', () => {
  it('envelope.command + result.summary is a string', async () => {
    const { status, envelope } = await runJson(['explain', '--json', 'hawking-temperature', 'mass=1.989e30']);

    expect(status).toBe(0);
    expect(envelope.command).toBe('explain');
    expect(envelope.source).toBe('catalog');
    expect(typeof envelope.result.summary).toBe('string');
  });
});

describe('json-contract — symbolic --json', () => {
  it('result is an array of length 2', async () => {
    const { status, envelope } = await runJson(['symbolic', '--json']);

    expect(status).toBe(0);
    expect(envelope.command).toBe('symbolic');
    expect(Array.isArray(envelope.result)).toBe(true);
    expect(envelope.result.length).toBe(2);
    for (const entry of envelope.result) {
      expect(typeof entry.label).toBe('string');
      expect(typeof entry.name).toBe('string');
      expect(Array.isArray(entry.leaves)).toBe(true);
      expect(typeof entry.expr).toBe('string');
      expect(typeof entry.dim).toBe('string');
      expect(typeof entry.value).toBe('number');
    }
  });
});

describe('json-contract — eval --json', () => {
  it('result.value close to 6.168e-8 for the Hawking-temperature example', async () => {
    const { status, envelope } = await runJson([
      'eval',
      '--json',
      'hbar*c^3/(8*pi*G*M*k_B)',
      'hbar=1.054571817e-34',
      'c=299792458',
      'G=6.6743e-11',
      'M=1.989e30',
      'k_B=1.380649e-23',
    ]);

    expect(status).toBe(0);
    expect(envelope.command).toBe('eval');
    expect(envelope.result.value).toBeCloseTo(6.168e-8, 10);
  });

  it('a formula error still exits 2 with EMPTY stdout (errors never emit JSON)', async () => {
    const { io, outLines, writes } = makeIo();
    const status = await runCli(['eval', '--json', 'a*b^2'], io);

    expect(status).toBe(2);
    // BOTH stdout channels must be empty: the raw write channel (where JSON
    // envelopes go) AND the out() line channel (where text output goes).
    expect(writes.join('')).toBe('');
    expect(outLines.join('')).toBe('');
  });
});

describe('json-contract — derive --json', () => {
  it('the pendulum example: determined + prefactor within 1e-6 relative of 6.2832', async () => {
    const { status, envelope } = await runJson([
      'derive',
      '--json',
      'period:time',
      'length:length',
      'gravity:acceleration',
      '--formula',
      '2*pi*sqrt(length/gravity)',
    ]);

    expect(status).toBe(0);
    expect(envelope.command).toBe('derive');
    expect(envelope.result.determination.determined).toBe(true);
    expect(envelope.result.formulaCheck).toBeDefined();
    const relErr = Math.abs(envelope.result.prefactor - 2 * Math.PI) / (2 * Math.PI);
    expect(relErr).toBeLessThan(1e-6);
  });
});

describe('derive text-mode error paths — conversion-fidelity rule (partial stdout preserved)', () => {
  // The old bin printed the header + determination + dimensional-check lines
  // to stdout BEFORE the formula parse/evaluate errors hit stderr with exit 2.
  // The port must keep that partial stdout (output emitted before the old
  // process.exit(2) site stays emitted before the throw).

  it('malformed formula: exit 2, partial report on stdout, parse error on stderr', async () => {
    const { io, outLines, errLines } = makeIo();
    const status = await runCli(
      ['derive', 'period:time', 'length:length', 'gravity:acceleration', '--formula', '2*pi*sqrt((('],
      io
    );

    expect(status).toBe(2);
    const stdout = outLines.join('');
    expect(stdout).toContain('● period  from {length, gravity}');
    expect(stdout).toContain('dimensionally determined up to a constant');
    expect(stdout).toContain('formula dimensional check: ✗');
    expect(errLines.join('')).toContain('formula parse error');
  });

  it('undeclared variable: exit 2, determination line on stdout, evaluate error on stderr', async () => {
    const { io, outLines, errLines } = makeIo();
    const status = await runCli(
      ['derive', 'period:time', 'length:length', 'gravity:acceleration', '--formula', '2*pi*sqrt(len/gravity)'],
      io
    );

    expect(status).toBe(2);
    const stdout = outLines.join('');
    expect(stdout).toContain('● period  from {length, gravity}');
    expect(stdout).toContain('dimensionally determined up to a constant');
    expect(errLines.join('')).toContain('formula uses an undeclared variable');
  });
});
