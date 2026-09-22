/**
 * `upt path` — in-process against the built CLI (dist/cli/main.js).
 *
 * The load-bearing case is the no-composite-claim one: it must print the
 * literal phrase, EXIT 0 (a refusal is an answer), and carry no number — the
 * envelope must have no `bound` key at all, because a precise-looking bound
 * over an undefined composite is the one output this library must never emit.
 */
import { describe, it, expect } from 'vitest';
import { runCli } from '../../dist/cli/main.js';

function capture() {
  const lines: string[] = [];
  const sink = (s?: string) => lines.push((s ?? '') + '\n');
  return { lines, io: { out: sink, err: sink, write: (s: string) => lines.push(s) } };
}

describe('upt path', () => {
  it('pendulum → spring composes to an approximation with its stated bound', async () => {
    const cap = capture();
    const code = await runCli(
      ['path', 'model-pendulum', 'model-spring', '--at', 'theta0=0.2', 'T0=1', 't=10'],
      cap.io,
    );
    expect(code).toBe(0);
    const text = cap.lines.join('');
    expect(text).toMatch(/composite relation: approximation/);
    // The bound is the RECORD's own (the EXACT relative period error at the
    // regime edge θ0 = 0.5), not a number recomputed from --at. The S2.3 brief
    // predicted (1, 0.0025) — that is θ0²/16 at θ0 = 0.2, which no code path
    // produces. The pinned 0.015625 here was 0.5²/16, the SERIES at the edge,
    // which the record no longer declares: it understates the exact error by
    // 1.456% and so was a bound violated at its own boundary.
    expect(text).toMatch(/composed bound: K = 1 · delta = 0\.0158525/);
    expect(text).toMatch(/norm: relative period error/);
    expect(text).toMatch(/horizons at t=10: all hold/);
  });

  it('the same path at t=1000 reports the pendulum horizon VIOLATED', async () => {
    const cap = capture();
    const code = await runCli(
      ['path', 'model-pendulum', 'model-spring', '--at', 'theta0=0.2', 'T0=1', 't=1000'],
      cap.io,
    );
    expect(code).toBe(0);
    const text = cap.lines.join('');
    // Machine horizon is t < 4 T0/θ0² = 100, so 1000 is outside it.
    expect(text).toMatch(/horizons at t=1000: NOT all hold/);
    expect(text).toMatch(/ab-pendulum-linear: VIOLATED/);
  });

  it("a no-composite-claim pair prints the phrase, carries no bound, and EXITS 0", async () => {
    const cap = capture();
    const code = await runCli(
      ['path', 'model-pendulum', 'model-lc', '--at', 'theta0=0.2', 'T0=1', 't=10'],
      cap.io,
    );
    expect(code).toBe(0);
    const text = cap.lines.join('');
    expect(text).toMatch(/no composite claim/);
    expect(text).not.toMatch(/composed bound/);
  });

  it('--json for a no-claim has NO bound key and names the reason', async () => {
    const cap = capture();
    const code = await runCli(['path', 'model-pendulum', 'model-lc', '--json'], cap.io);
    expect(code).toBe(0);
    const parsed = JSON.parse(cap.lines.join(''));
    expect(parsed.command).toBe('path');
    expect(parsed.result.kind).toBe('no-claim');
    expect(parsed.result.reason).toBe('no-composite-claim');
    expect(parsed.result.phrase).toBe('no composite claim');
    expect('bound' in parsed.result).toBe(false);
  });

  it('--json envelope matches confront’s shape for a bounded path', async () => {
    const cap = capture();
    const code = await runCli(
      ['path', 'model-pendulum', 'model-spring', '--at', 'theta0=0.2', 'T0=1', 't=10', '--json'],
      cap.io,
    );
    expect(code).toBe(0);
    const parsed = JSON.parse(cap.lines.join(''));
    expect(parsed.command).toBe('path');
    expect(typeof parsed.epistemics).toBe('string');
    expect(parsed.options.from).toBe('model-pendulum');
    expect(parsed.result.kind).toBe('bound');
    expect(parsed.result.relation).toBe('approximation');
    expect(parsed.result.bound.K).toBe(1);
    expect(parsed.result.bound.delta).toBeCloseTo(0.0158525311014, 10);
    expect(parsed.result.allHorizonsHold).toBe(true);
  });

  it('an unevaluated horizon is reported as unevaluated, not as holding', async () => {
    const cap = capture();
    const code = await runCli(['path', 'model-pendulum', 'model-spring', '--json'], cap.io);
    expect(code).toBe(0);
    const parsed = JSON.parse(cap.lines.join(''));
    expect(parsed.result.horizonsEvaluated).toBe(false);
    expect(parsed.result.allHorizonsHold).toBe(null);
    expect(parsed.result.horizons[0].holds).toBe(null);
  });

  it('an exact-equivalence path is traversable in both directions', async () => {
    const cap = capture();
    const code = await runCli(['path', 'model-lc', 'model-spring', '--json'], cap.io);
    expect(code).toBe(0);
    const parsed = JSON.parse(cap.lines.join(''));
    expect(parsed.result.kind).toBe('bound');
    expect(parsed.result.relation).toBe('exact-equivalence');
    expect(parsed.result.bound).toEqual({ K: 1, delta: 0 });
  });

  it('an unknown model id → exit 1', async () => {
    const cap = capture();
    const code = await runCli(['path', 'model-nope', 'model-spring'], cap.io);
    expect(code).toBe(1);
    expect(cap.lines.join('')).toMatch(/is not a model of family 'oscillators'/);
  });

  it('a wrong number of endpoints → exit 1', async () => {
    const cap = capture();
    expect(await runCli(['path', 'model-spring'], cap.io)).toBe(1);
    expect(await runCli(['path', 'a', 'b', 'c'], cap.io)).toBe(1);
  });

  it('a non-finite --at value → exit 1', async () => {
    const cap = capture();
    expect(await runCli(['path', 'model-pendulum', 'model-spring', '--at', 't=oops'], cap.io)).toBe(1);
  });

  it('an unknown flag is rejected by the parser → exit 2', async () => {
    const cap = capture();
    expect(await runCli(['path', 'model-pendulum', 'model-spring', '--bogus'], cap.io)).toBe(2);
  });

  it('identical endpoints compose nothing, and say so (exit 0)', async () => {
    const cap = capture();
    const code = await runCli(['path', 'model-spring', 'model-spring'], cap.io);
    expect(code).toBe(0);
    expect(cap.lines.join('')).toMatch(/the path is empty and composes nothing/);
  });

  it('a disconnected pair reports no chain rather than a bound (exit 0)', async () => {
    const cap = capture();
    const code = await runCli(['path', 'model-spring', 'model-cubic-spring'], cap.io);
    expect(code).toBe(0);
    expect(cap.lines.join('')).toMatch(/no chain of bridges connects these models/);
  });

  it('`upt help path` prints the command help', async () => {
    const cap = capture();
    expect(await runCli(['help', 'path'], cap.io)).toBe(0);
    expect(cap.lines.join('')).toMatch(/upt path <from> <to>/);
  });
});
