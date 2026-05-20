/**
 * Pin verifyKillingEquation residuals for Schwarzschild time-translation
 * and axial Killing fields (v0.6.0 Phase 1, Task 1.3).
 *
 * F-3 reconciliation: hybrid impl uses:
 *   - Exact analytic metric derivatives (dMetricFn = schwarzschildDgFn) for
 *     ∂_μ g_{αβ} — avoids FD of SI-scaled g_tt ~ −c²*(1−r_s/r) ~ −6e16.
 *   - 4th-order FD for ∂_μ ξ^β (upper components, which are constant → 0).
 *   - Exact symbolic Christoffels via the layout-agnostic ChristoffelAccess.
 *
 * Measured tolerance (E-4 "measure-then-lock"):
 *   ∂_t: max residual 0.0 (exact cancellation in the time sector).
 *   ∂_φ: max residual 2.98e-8 at r=5r_s, θ=π/3 — machine-precision floor for
 *         the (θ,φ) Christoffel/metric cancellation involving irrational
 *         sin(π/3) = √3/2 in IEEE 754. Specifically:
 *         `(cosθ/sinθ)*sinθ² ≠ sinθ*cosθ` by 1 ULP when cosθ/sinθ has rounding.
 *         This is 2× machine epsilon × r²*sinθcosθ, not an algorithm error.
 * Tolerance locked at 1e-7 (≈3.3× max observed, per E-4 measure-then-lock).
 *
 * @module tests/numerical/killing-schwarzschild
 */
import { describe, it, expect } from 'vitest';
import {
  schwarzschildGFn,
  schwarzschildChristoffelFn,
  schwarzschildDgFn,
  schwarzschildKillingT,
  schwarzschildKillingPhi,
  schwarzschildRs,
} from '../fixtures/schwarzschild.js';
import { verifyKillingEquation } from '../../src/numerical/killing.js';
import { C_SI, G_SI } from '../../src/core/constants.js';

const M_SUN = 1.989e30; // kg
const r_s = schwarzschildRs(M_SUN); // ≈ 2954 m

describe('verifyKillingEquation (Schwarzschild)', () => {
  // E-4 measure-then-lock: ∂_t residual = 0; ∂_φ max = 2.98e-8 (machine eps
  // × r²·sinθcosθ at π/3). Locked at 1e-7 (3.3× max observed).
  const TOL = 1e-7;

  const samplePoints: [number, number, number, number][] = [
    [0, 3 * r_s, Math.PI / 2, 0],
    [0, 5 * r_s, Math.PI / 3, 1],
    [0, 10 * r_s, Math.PI / 4, 2],
    [0, 100 * r_s, Math.PI / 2, 3],
    [0, 1000 * r_s, Math.PI / 6, 0.5],
  ];

  // P-3 fix: wrap the flat Float64Array(64) return into a ChristoffelAccess
  // (layout-agnostic accessor). BR-2 Task 2.9: schwarzschildChristoffelFn now
  // returns Float64Array(64) with λ-major layout (16·λ + 4·μ + ν).
  const chrAt = (x: [number, number, number, number]) => {
    const arr = schwarzschildChristoffelFn(M_SUN)(x);
    return (l: number, m: number, n: number) => arr[16 * l + 4 * m + n];
  };

  // Exact metric derivatives avoid FD of c²-scaled g_tt (F-3 hybrid).
  const dMetric = schwarzschildDgFn(M_SUN);

  it.each(samplePoints)(
    'time-translation Killing ∂_t: residual < TOL at (t=%d, r=%d, θ, φ)',
    (...args) => {
      const x = args.slice(0, 4) as [number, number, number, number];
      const residual = verifyKillingEquation(
        schwarzschildKillingT,
        schwarzschildGFn(M_SUN),
        chrAt,
        x,
        { tolerance: TOL, constantKilling: false, dMetricFn: dMetric },
      );
      expect(residual).toBeLessThan(TOL);
    },
  );

  it.each(samplePoints)(
    'axial Killing ∂_φ: residual < TOL at (t=%d, r=%d, θ, φ)',
    (...args) => {
      const x = args.slice(0, 4) as [number, number, number, number];
      const residual = verifyKillingEquation(
        schwarzschildKillingPhi,
        schwarzschildGFn(M_SUN),
        chrAt,
        x,
        { tolerance: TOL, constantKilling: false, dMetricFn: dMetric },
      );
      expect(residual).toBeLessThan(TOL);
    },
  );
});
