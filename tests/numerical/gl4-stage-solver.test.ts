import { describe, it, expect } from 'vitest';
import { solveGL4Stage } from '../../src/numerical/gl4-integrator.js';

describe('GL4 integrator: implicit Picard stage solver', () => {
  it('converges in ≤40 iterations for flat-space (∂g=0) over 1 step (Picard: linear convergence, trivially fast when ∂g=0)', () => {
    // Flat-space inverse metric η^μν = diag(−1, +1, +1, +1) (Minkowski, mostly-plus per UPT convention).
    // v0.9.0 flat layout: Float64Array(16), flat[mu*4+nu] = g^{μν}.
    const eta = Float64Array.from([
      -1, 0, 0, 0,
       0, 1, 0, 0,
       0, 0, 1, 0,
       0, 0, 0, 1,
    ]);
    const gInverseFn = (_x: readonly number[]): Float64Array => eta;
    const dgInverseFn = (_x: readonly number[]): Float64Array =>
      // 64 zeros (∂_λ η^μν = 0); flat[lambda*16 + mu*4 + nu]
      new Float64Array(64);

    const x0 = [0, 10, Math.PI / 2, 0];
    const p0 = [-1, 0.5, 0, 0]; // arbitrary timelike-ish covariant momentum
    const h = 0.01;

    const stages = solveGL4Stage(
      { x: x0, p: p0 },
      h,
      gInverseFn,
      dgInverseFn,
      { picardTol: 1e-12, picardMaxIter: 40 },
    );

    // In flat space, p is constant; stage P_i = p0 for both stages.
    // Picard converges in ≤40 iterations (trivially fast when ∂g=0).
    expect(stages.iterations).toBeLessThanOrEqual(40);
    for (let i = 0; i < 2; i++) {
      for (let mu = 0; mu < 4; mu++) {
        expect(stages.stageP[i][mu]).toBeCloseTo(p0[mu], 12);
      }
    }
  });

  it('throws GL4ConvergenceError if Picard fails to converge within picardMaxIter (I7: specific error class)', () => {
    // Pathological case: caller passes picardMaxIter=1 with a curved metric so Picard can't converge in 1 step.
    const gInverseFn = (x: readonly number[]): Float64Array => {
      // Strongly position-dependent metric — guarantees Newton needs many iterations.
      const r = x[1];
      // v0.9.0 flat layout: Float64Array(16), flat[mu*4+nu] = g^{μν}.
      const gInv = new Float64Array(16);
      gInv[0 * 4 + 0] = -(1 + 1 / r);
      gInv[1 * 4 + 1] = 1 + 1 / r;
      gInv[2 * 4 + 2] = r * r;
      gInv[3 * 4 + 3] = r * r;
      return gInv;
    };
    const dgInverseFn = (x: readonly number[]): Float64Array => {
      const r = x[1];
      // Only ∂_r (λ=1) is non-zero; flat[lambda*16 + mu*4 + nu].
      const dg = new Float64Array(64);
      dg[1 * 16 + 0 * 4 + 0] = 1 / (r * r);
      dg[1 * 16 + 1 * 4 + 1] = -1 / (r * r);
      dg[1 * 16 + 2 * 4 + 2] = 2 * r;
      dg[1 * 16 + 3 * 4 + 3] = 2 * r;
      return dg;
    };
    // I7: assert specific error class (not just any throwable — NaN return also triggers .toThrow()).
    expect(() =>
      solveGL4Stage(
        { x: [0, 10, Math.PI / 2, 0], p: [-1, 0.5, 0, 0] },
        0.1,
        gInverseFn,
        dgInverseFn,
        { picardTol: 1e-12, picardMaxIter: 1 },
      ),
    ).toThrow(/Picard iteration did not converge/i);
  });
});
