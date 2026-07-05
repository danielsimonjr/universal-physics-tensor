/**
 * `upt confront` — in-process against the src/cli port (dist/cli/main.js),
 * matching the convention established in main-dispatch.test.ts /
 * json-contract.test.ts (not a src/ import — the command needs the built
 * cli-api barrel wired in).
 */
import { describe, it, expect } from 'vitest';
import { runCli } from '../../dist/cli/main.js';

function capture() {
  const lines: string[] = [];
  const sink = (s?: string) => lines.push((s ?? '') + '\n');
  return { lines, io: { out: sink, err: sink, write: (s: string) => lines.push(s) } };
}

describe('upt confront', () => {
  it('lists all confrontations by default (exit 0)', async () => {
    const cap = capture();
    const code = await runCli(['confront'], cap.io);
    expect(code).toBe(0);
    const text = cap.lines.join('');
    expect(text).toMatch(/be-37/);
    expect(text).toMatch(/be-48/);
    expect(text).toMatch(/be-52/);
  });

  it('--bridge=be-37 runs one, exit 0', async () => {
    const cap = capture();
    const code = await runCli(['confront', '--bridge=be-37'], cap.io);
    expect(code).toBe(0);
    expect(cap.lines.join('')).toMatch(/PPN|γ|gamma/i);
  });

  it('--bridge with an unregistered id is a bad value → exit 1', async () => {
    const cap = capture();
    const code = await runCli(['confront', '--bridge=be-99'], cap.io);
    expect(code).toBe(1);
  });

  it('--bridge with an unparseable value is a bad value → exit 1', async () => {
    const cap = capture();
    const code = await runCli(['confront', '--bridge=garbage'], cap.io);
    expect(code).toBe(1);
  });

  it('--json emits an envelope with a result array', async () => {
    const cap = capture();
    const code = await runCli(['confront', '--json'], cap.io);
    expect(code).toBe(0);
    const parsed = JSON.parse(cap.lines.join(''));
    expect(parsed.command).toBe('confront');
    expect(Array.isArray(parsed.result)).toBe(true);
    expect(parsed.result.some((o: { kind: string }) => o.kind === 'value')).toBe(true);
  });

  it('--bridge=be-52 --sensitivity prints a descending elasticity ranking', async () => {
    const cap = capture();
    const code = await runCli(['confront', '--bridge=be-52', '--sensitivity'], cap.io);
    expect(code).toBe(0);
    const text = cap.lines.join('');
    expect(text).toMatch(/sensitivity \(elasticity, strongest dependence, not uncertainty budget\)/);
    expect(text).toMatch(/central_mass_kg:/);
    expect(text).not.toMatch(/uncertainty budget\).*dominates/i);
  });

  it('--bridge=be-48 --sensitivity reports n/a for the non-value kind', async () => {
    const cap = capture();
    const code = await runCli(['confront', '--bridge=be-48', '--sensitivity'], cap.io);
    expect(code).toBe(0);
    expect(cap.lines.join('')).toMatch(/sensitivity: n\/a for upper-bound-kind/);
  });

  it('--json --sensitivity adds a sensitivity field to value-kind entries only', async () => {
    const cap = capture();
    const code = await runCli(['confront', '--json', '--sensitivity'], cap.io);
    expect(code).toBe(0);
    const parsed = JSON.parse(cap.lines.join(''));
    const be52 = parsed.result.find((r: { kind: string; predicted: number }) => r.kind === 'value' && Math.abs(r.predicted - 42) < 5);
    expect(Array.isArray(be52.sensitivity)).toBe(true);
    expect(be52.sensitivity.length).toBeGreaterThan(0);
    const be48 = parsed.result.find((r: { kind: string }) => r.kind === 'upper-bound');
    expect(be48.sensitivity).toBeUndefined();
    expect(parsed.epistemics).toMatch(/uncertainty budget/);
  });

  it('--bridge=be-36 surfaces the one-sided caveat in the summary line', async () => {
    const cap = capture();
    const code = await runCli(['confront', '--bridge=be-36'], cap.io);
    expect(code).toBe(0);
    const text = cap.lines.join('');
    expect(text).toMatch(/not excluded/);
    // honesty fix: the pass is one-sided — the GW170817 negative side exceeds
    // BE-36's symmetric encoding, and the summary line must say so.
    expect(text).toMatch(/one-sided|\+side|−side|-side/i);
  });

  it('--json carries the be-36 caveat as a field', async () => {
    const cap = capture();
    const code = await runCli(['confront', '--json'], cap.io);
    expect(code).toBe(0);
    const parsed = JSON.parse(cap.lines.join(''));
    const be36 = parsed.result.find((r: { kind: string; caveat?: string }) => r.kind === 'upper-bound' && r.caveat);
    expect(be36).toBeDefined();
    expect(be36.caveat).toMatch(/side/i);
  });

  it('default confront (no --sensitivity) output is unaffected', async () => {
    const cap = capture();
    const code = await runCli(['confront'], cap.io);
    expect(code).toBe(0);
    expect(cap.lines.join('')).not.toMatch(/sensitivity/i);
  });
});
