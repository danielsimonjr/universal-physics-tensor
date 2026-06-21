/**
 * GL4 step-halving recovery correctness (Round-2 audit, HIGH).
 *
 * Regression guard for the bug where the adaptive step-halving loop solved the
 * implicit stages at a reduced step `h/2ᵏ` but then advanced the state (and τ)
 * by the FULL `h`, destroying accuracy and symplecticity on every recovery
 * step. The fix sub-steps: a macro-step that needs halving is covered by
 * `2ᵏ` micro-steps of the converging size, so the geodesic Hamiltonian norm
 *   N = g^{μν}(x) p_μ p_ν   (≡ 2·H, conserved by the autonomous flow)
 * stays put even when halving fires.
 *
 * The metric is a fully-controlled synthetic 2-D `(t, r)` inverse metric with
 * a position-dependent `g^{11}` so Picard contraction scales with the step;
 * a deliberately small `picardMaxIter` forces the full step to fail while the
 * halved sub-steps converge. This makes the bug deterministically reachable
 * without the skip-by-default long-run orbit test.
 *
 * @module tests/numerical/gl4-step-halving
 */
import { describe, it, expect } from 'vitest';
import { integrateGeodesicGL4 } from '../../src/numerical/gl4-integrator.js';

const DIM = 2;

/** g^{μν}(x): diag(-1, 1 + 0.5·sin(2·r)) — flattened row-major (4 entries). */
function gInverseFn(x: readonly number[]): Float64Array {
  const g = new Float64Array(DIM * DIM);
  g[0] = -1; // g^{tt}
  g[3] = 1 + 0.5 * Math.sin(2 * x[1]); // g^{rr}
  return g;
}

/** dg[λ][μ][ν] = ∂_λ g^{μν}: only ∂_r g^{rr} = cos(2·r) is non-zero. */
function dgInverseFn(x: readonly number[]): Float64Array {
  const dg = new Float64Array(DIM * DIM * DIM);
  // index = λ·dim² + μ·dim + ν ; λ=1 (r), μ=1, ν=1 → 1·4 + 1·2 + 1 = 7
  dg[7] = Math.cos(2 * x[1]);
  return dg;
}

function norm(x: readonly number[], p: readonly number[]): number {
  const g = gInverseFn(x);
  let n = 0;
  for (let mu = 0; mu < DIM; mu++) {
    for (let nu = 0; nu < DIM; nu++) {
      n += g[mu * DIM + nu] * p[mu] * p[nu];
    }
  }
  return n;
}

describe('GL4 step-halving recovery (Round-2 HIGH)', () => {
  it('conserves the Hamiltonian norm when halving fires', () => {
    const x0: readonly number[] = [0, 1.0];
    const p0: readonly number[] = [1.0, 1.0];
    const N0 = norm(x0, p0);

    let halvingSteps = 0;
    const snapshots = integrateGeodesicGL4(
      { x: x0, p: p0 },
      {
        steps: 40,
        tauMax: 40, // h = 1.0 — large enough that the full step needs many Picard iters
        gInverseFn,
        dgInverseFn,
        picardTol: 1e-12,
        picardMaxIter: 6, // too few for the full step; halved sub-steps converge
        onStep: ({ halvings }) => {
          if (halvings > 0) halvingSteps++;
        },
      },
    );

    // Halving must actually fire, else this test proves nothing.
    expect(halvingSteps).toBeGreaterThan(0);

    let maxDrift = 0;
    for (const s of snapshots) {
      maxDrift = Math.max(maxDrift, Math.abs(norm(s.x, s.p) / N0 - 1));
    }

    // eslint-disable-next-line no-console
    console.log(
      `[GL4 step-halving] halvingSteps=${halvingSteps} maxNormDrift=${maxDrift.toExponential(3)}`,
    );

    // Correct sub-stepping keeps the norm to ~GL4 accuracy; the full-h-update
    // bug drives this O(1).
    expect(maxDrift).toBeLessThan(1e-6);
  });
});
