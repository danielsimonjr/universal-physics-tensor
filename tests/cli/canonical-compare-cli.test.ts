/**
 * `upt map --equation` and `upt derive --formula` report how a user formula compares with the
 * canonical equation it restates (persona finding L2, 2026-09-25). In-process against the built
 * CLI (dist/cli/main.js). The comparison itself is pinned in
 * tests/composition/canonical-compare.test.ts; this file pins what the user sees.
 */
import { describe, it, expect } from 'vitest';
import { runCli } from '../../dist/cli/main.js';

function capture() {
  const lines: string[] = [];
  const sink = (s?: string) => lines.push((s ?? '') + '\n');
  return { lines, io: { out: sink, err: sink, write: (s: string) => lines.push(s) } };
}

async function text(args: string[]): Promise<string> {
  const cap = capture();
  const code = await runCli(args, cap.io);
  expect(code).toBe(0);
  return cap.lines.join('');
}

describe('upt map --equation — the canonical comparison', () => {
  it('a Hawking temperature with 4π for 8π differs from CE-hawking-temperature by the factor 2', async () => {
    const t = await text(['map', '--equation', 'hawking_temperature = hbar*c^3/(4*pi*G*mass*k_B)']);
    expect(t).toMatch(
      /⚠ differs from CE-hawking-temperature \(Hawking temperature\) by a constant factor: yours\/canonical = 2\.00000 at 3 fixed points/,
    );
  });

  it('the exact Hawking temperature agrees, prefactor included', async () => {
    const t = await text(['map', '--equation', 'hawking_temperature = hbar*c^3/(8*pi*G*mass*k_B)']);
    expect(t).toMatch(/✓ agrees with CE-hawking-temperature \(Hawking temperature\), prefactor included/);
  });

  it('the persona example T = π√(ℓ/g) differs from CE-pendulum-period by the factor 0.5', async () => {
    const t = await text(['map', '--equation', 'period = pi*sqrt(length/gravity)']);
    expect(t).toMatch(
      /⚠ differs from CE-pendulum-period \(Pendulum period\) by a constant factor: yours\/canonical = 0\.500000 at 3 fixed points/,
    );
  });

  it('--json carries the comparisons', async () => {
    const cap = capture();
    await runCli(['map', '--equation', 'hawking_temperature = hbar*c^3/(4*pi*G*mass*k_B)', '--json'], cap.io);
    const parsed = JSON.parse(cap.lines.join(''));
    const cmp = JSON.stringify(parsed);
    expect(cmp).toMatch(/"canonicalComparisons":\[\{"id":"CE-hawking-temperature","name":"Hawking temperature","kind":"factor","ratio":2/);
  });
});

describe('upt derive --formula — the canonical comparison', () => {
  it('derive reports the same comparison for a pendulum formula', async () => {
    const t = await text([
      'derive', 'period:time', 'length:length', 'gravity:acceleration', '--formula', 'pi*sqrt(length/gravity)',
    ]);
    expect(t).toMatch(/formula MATCHES the dimensional form — recovered prefactor ≈ 3\.1416e\+0/);
    expect(t).toMatch(/⚠ differs from CE-pendulum-period \(Pendulum period\) by a constant factor: yours\/canonical = 0\.500000/);
  });
});

describe('upt derive / map — the prefactor is never silently unchecked', () => {
  it('with no matching canonical entry, derive says dimensions cannot check the prefactor', async () => {
    const t = await text(['derive', 'energy:energy', 'mass:mass', 'velocity:velocity', '--formula', 'mass*velocity^2']);
    expect(t).toMatch(/· no canonical equation has this target and these variables, so the prefactor is NOT checked/);
  });

  it('derive compares even when the monomial is not unique (constants passed as variables)', async () => {
    const t = await text([
      'derive', 'hawking_temperature:temperature', 'mass:mass', 'hbar:hbar', 'c:c', 'G:G', 'k_B:k_B',
      '--formula', 'hbar*c^3/(4*pi*G*mass*k_B)',
    ]);
    expect(t).toMatch(/⚠ differs from CE-hawking-temperature \(Hawking temperature\) by a constant factor: yours\/canonical = 2\.00000/);
  });

  it('map --equation with a catalog target and no canonical match says the same', async () => {
    const t = await text(['map', '--equation', 'kinetic_energy = mass*velocity^2']);
    expect(t).toMatch(/· no canonical equation has this target and these variables, so the prefactor is NOT checked/);
  });
});

describe('upt derive — a variable is a constant only when its name AND dimension match', () => {
  it('c:length is a length called c, not the speed of light', async () => {
    const cap = capture();
    await runCli(
      ['derive', 'period:time', 'length:length', 'gravity:acceleration', 'c:length', '--formula', 'pi*sqrt(c/gravity)', '--json'],
      cap.io,
    );
    const result = JSON.parse(cap.lines.join('')).result;
    // As a length, c is a third variable, and no canonical entry has {length, gravity, c}.
    // Taken by name alone for the speed of light, c would drop out, the variables would match
    // CE-pendulum-period, and the formula would be evaluated with c = 299792458 m/s.
    expect(result.canonicalComparisons).toEqual([]);
  });
});
