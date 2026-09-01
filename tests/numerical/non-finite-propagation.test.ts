/**
 * How a non-finite value travels through the integrator hot paths.
 *
 * WHY THIS EXISTS. The 4D tensor contractions are guarded by `x !== 0` sparsity
 * checks, and those guards decide what happens to a NaN or Infinity: `0 * NaN` is
 * NaN, but a guard that skips a term whose coefficient is exactly 0 never performs
 * that multiply. Adding a guard keeps a blow-up local to the component that blew up;
 * removing one lets it poison every component of the result.
 *
 * The arithmetic for FINITE inputs is identical either way -- a 50000-step
 * Schwarzschild integration is bit-for-bit unchanged -- so no ordinary test can see
 * a guard move. That is exactly why this file exists: the behaviour is invisible to
 * the rest of the suite and therefore free to drift.
 *
 * THE CONTRACT PINNED HERE is component-local propagation, and CONSISTENCY between
 * the two integrators. Before this file, `geodesicRHS` was unguarded (one NaN
 * poisoned all four components) while `solveGL4Stage` was guarded (local) -- the same
 * input produced two different kinds of answer depending on which integrator ran.
 * Both are now guarded. A non-finite input must still be VISIBLE in the output;
 * silently returning all-finite numbers would erase the divergence signal.
 */
import { describe, it, expect } from 'vitest';
import { integrateGeodesic } from '../../src/numerical/geodesic-integrator.js';

/** Sparse Christoffel symbols -- mostly exact zeros, which is what the guards act on. */
function sparseChristoffel(): Float64Array {
  const G = new Float64Array(64);
  G[0 * 16 + 0 * 4 + 0] = 1.0;
  G[1 * 16 + 1 * 4 + 1] = -0.5;
  return G;
}

const run = (v0: [number, number, number, number]) =>
  integrateGeodesic({
    christoffelFn: () => sparseChristoffel(),
    x0: [0, 10, Math.PI / 2, 0],
    v0,
    tauStart: 0,
    tauEnd: 1,
    steps: 8,
  });

describe('non-finite propagation', () => {
  it.each([
    ['NaN', Number.NaN],
    ['Infinity', Number.POSITIVE_INFINITY],
    ['-Infinity', Number.NEGATIVE_INFINITY],
  ])('a %s velocity component stays visible in the output', (_label, bad) => {
    const r = run([1, 0, bad, 0]);
    expect(
      [...r.xFinal, ...r.vFinal].some((n) => !Number.isFinite(n)),
      'the value entered the integrator and every output came back finite -- ' +
      'the divergence signal was erased',
    ).toBe(true);
  });

  it('a non-finite component does NOT poison the components it is uncoupled from', () => {
    // The guards' purpose. Index 2 blows up; indices 0 and 1 are driven by
    // Christoffel components that never multiply it, so they stay finite and the
    // caller can see WHICH degree of freedom diverged.
    const r = run([1, 0, Number.NaN, 0]);
    expect(Number.isFinite(r.vFinal[0])).toBe(true);
    expect(Number.isFinite(r.vFinal[1])).toBe(true);
    expect(Number.isNaN(r.vFinal[2])).toBe(true);
  });

  it('a fully finite input produces a fully finite result', () => {
    const r = run([1.005, 0, 0, 0.001]);
    for (const n of [...r.xFinal, ...r.vFinal]) expect(Number.isFinite(n)).toBe(true);
  });
});
