/**
 * Tests for Bridge Equation 35: Conformal Bootstrap (crossing-symmetry
 * residual, single-block reduction).
 *
 *   R_cross = C² · [ g_block(u, v) − g_block(v, u) ]
 *
 * References: Rattazzi-Rychkov-Tonni-Vichi 2008 JHEP 0812:031
 * (arXiv:0807.0004); Poland-Rychkov-Vichi 2019 Rev. Mod. Phys. 91:015002
 * (arXiv:1805.04405); Dolan-Osborn 2001 Nucl. Phys. B 599:459;
 * Kos-Poland-Simmons-Duffin 2014 JHEP 1406:091.
 *
 * Honest-claude scope notes:
 *   - Single-block reduction. The full bootstrap programme sums an
 *     infinite (Δ, ℓ) tower under positivity / unitarity constraints;
 *     that spectrum-fitting work is NOT captured by the residual. The
 *     encoding pins the symmetry identity, not the spectrum.
 *   - OPE coefficients C are scheme-dependent. We assume unit-normalized
 *     two-point functions, making C dimensionless.
 *   - Conformal blocks g_{Δ, ℓ}(u, v) are encoded as dimensionless symbol
 *     stubs, not as their analytic-function expressions. Closed forms
 *     (Dolan-Osborn, 2D / 4D) live outside the AST grammar.
 *   - Status pinned 'established' — the crossing-symmetry equation is
 *     canonical CFT bootstrap content.
 */
import { describe, it, expect } from 'vitest';
import {
  BE35_CROSSING_RESIDUAL_RHS,
  BE35_FORWARD_BLOCK,
  BE35_CROSSED_BLOCK,
  evaluateCrossingResidual,
  BE35_CROSSING_EQUATION_RHS,
  evaluateCrossingEquation,
} from '../../src/bridges/equations/be-35-conformal-bootstrap.js';
import { BRIDGE_RHS_BY_ID } from '../../src/bridges/rhs-registry.js';
import { BridgeEquations } from '../../src/bridges/bridge-equations.js';
import { validate } from '../../src/dimensional/validator.js';
import { DIMENSIONLESS } from '../../src/dimensional/types.js';
import { expectBridgeInIndex, expectDimRoundTrip } from './_helpers.js';

describe('BE-35 Conformal Bootstrap (crossing-symmetry residual)', () => {
  describe('index entry invariants', () => {
    it('exists in the index', () => {
      expectBridgeInIndex(35);
    });

    it("status is 'established' (canonical CFT bootstrap identity)", () => {
      expectBridgeInIndex(35, 'established');
    });

    it('dimensional_signature is set to [1] (dimensionless residual)', () => {
      const entry = expectBridgeInIndex(35);
      expect(entry.dimensional_signature).toBe('[1]');
    });
  });

  describe('dimensional validation', () => {
    it('AST validates cleanly through the dimensional analyzer', () => {
      const r = validate(BE35_CROSSING_RESIDUAL_RHS);
      expect(r.ok).toBe(true);
      expect(r.violations).toEqual([]);
    });

    it("RHS infers SI dimension '[1]' (round-trip pin)", () => {
      expectDimRoundTrip(BE35_CROSSING_RESIDUAL_RHS, '[1]');
    });

    it('BE35_FORWARD_BLOCK (C² · g_block(u, v)) is dimensionless', () => {
      const r = validate(BE35_FORWARD_BLOCK);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(DIMENSIONLESS);
    });

    it('BE35_CROSSED_BLOCK (C² · g_block(v, u)) is dimensionless', () => {
      const r = validate(BE35_CROSSED_BLOCK);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(DIMENSIONLESS);
    });
  });

  describe('numerical evaluation', () => {
    it('crossing-symmetric block (g_uv = g_vu) → residual = 0', () => {
      // For any legitimate single-block contribution, swapping u ↔ v
      // leaves g_block invariant and the residual collapses to zero.
      const R = evaluateCrossingResidual({
        ope_coefficient: 1,
        g_block_uv: 0.5,
        g_block_vu: 0.5,
      });
      expect(R).toBe(0);
    });

    it('asymmetric pair: C=1, g_uv=0.7, g_vu=0.3 → residual = 0.4', () => {
      // Sanity-check the C² · (g_uv − g_vu) arithmetic on a clean
      // exact-arithmetic case: 1² · (0.7 − 0.3) = 0.4.
      const R = evaluateCrossingResidual({
        ope_coefficient: 1,
        g_block_uv: 0.7,
        g_block_vu: 0.3,
      });
      expect(R).toBeCloseTo(0.4, 12);
    });

    it('pure C-rescaling: doubling C quadruples the residual (C² scaling)', () => {
      // R_cross is quadratic in C. Doubling C → factor of 4 in R.
      // Use an asymmetric (g_uv, g_vu) pair so the residual is nonzero.
      const base = evaluateCrossingResidual({
        ope_coefficient: 0.6,
        g_block_uv: 0.8,
        g_block_vu: 0.2,
      });
      const doubled = evaluateCrossingResidual({
        ope_coefficient: 1.2,
        g_block_uv: 0.8,
        g_block_vu: 0.2,
      });
      expect(doubled).toBeCloseTo(4 * base, 12);
    });

    it('sign flip: swapping g_uv and g_vu negates the residual', () => {
      // R_cross is antisymmetric under u ↔ v: swapping the two block
      // values flips the sign while preserving |R|.
      const forward = evaluateCrossingResidual({
        ope_coefficient: 0.9,
        g_block_uv: 0.81,
        g_block_vu: 0.27,
      });
      const swapped = evaluateCrossingResidual({
        ope_coefficient: 0.9,
        g_block_uv: 0.27,
        g_block_vu: 0.81,
      });
      expect(swapped).toBeCloseTo(-forward, 12);
    });
  });

  describe('input validation', () => {
    it('rejects non-finite ope_coefficient', () => {
      expect(() =>
        evaluateCrossingResidual({
          ope_coefficient: NaN,
          g_block_uv: 0.5,
          g_block_vu: 0.5,
        }),
      ).toThrow(RangeError);
    });

    it('rejects non-finite g_block_uv', () => {
      expect(() =>
        evaluateCrossingResidual({
          ope_coefficient: 1,
          g_block_uv: Infinity,
          g_block_vu: 0.5,
        }),
      ).toThrow(RangeError);
    });
  });
});

// ---------------------------------------------------------------------------
// The crossing EQUATION (census finding F1). The residual above has no
// v^Δφ / u^Δφ prefactors and is written for ONE block, but crossing holds for
// the full reduced four-point function g = 1 + Σ λ_O² g_O, with prefactors
// (Rattazzi, Rychkov, Tonni & Vichi 2008, eq. 4.3: v^d g(u,v) = u^d g(v,u),
// four identical scalars of dimension d).
// ---------------------------------------------------------------------------

describe('BE-35 crossing equation (full four-point function, with prefactors)', () => {
  // The generalized free field of four identical scalars of dimension Δ:
  // g(u, v) = 1 + u^Δ + (u/v)^Δ. It satisfies crossing EXACTLY, at every (u, v).
  const gff = (u: number, v: number, d: number) => 1 + u ** d + (u / v) ** d;
  const points: [number, number][] = [
    [0.1, 0.7],
    [0.3, 0.05],
    [2, 0.5],
    [0.25, 0.9],
  ];
  const dims = [0.5, 1, 1.2, 2.7];

  it('is zero for the generalized free field at points away from u = v', () => {
    for (const d of dims) {
      for (const [u, v] of points) {
        const r = evaluateCrossingEquation({ u, v, delta_phi: d, g_uv: gff(u, v, d), g_vu: gff(v, u, d) });
        expect(Math.abs(r)).toBeLessThan(1e-12 * (1 + gff(u, v, d)));
      }
    }
  });

  it('is NOT zero when the four-point function drops a term (the control fails)', () => {
    const partial = (u: number, v: number, d: number) => 1 + u ** d;
    for (const d of dims) {
      for (const [u, v] of points) {
        const r = evaluateCrossingEquation({ u, v, delta_phi: d, g_uv: partial(u, v, d), g_vu: partial(v, u, d) });
        expect(Math.abs(r)).toBeGreaterThan(1e-3);
      }
    }
  });

  it('is NOT zero for the generalized free field without the prefactors (what the old residual computed)', () => {
    const [u, v] = [0.1, 0.7];
    expect(Math.abs(gff(u, v, 1.2) - gff(v, u, 1.2))).toBeGreaterThan(1e-3);
  });

  it('is zero at u = v for ANY g, so u = v tests nothing', () => {
    expect(evaluateCrossingEquation({ u: 0.25, v: 0.25, delta_phi: 1.7, g_uv: 3.1, g_vu: 3.1 })).toBe(0);
  });

  it('is the RHS registered for BE-35, and infers dimensionless', () => {
    expect(BRIDGE_RHS_BY_ID.get(35)).toBe(BE35_CROSSING_EQUATION_RHS);
    const r = validate(BE35_CROSSING_EQUATION_RHS);
    expect(r.ok).toBe(true);
    expect(r.violations).toEqual([]);
    expect(r.inferredDimension).toEqual(DIMENSIONLESS);
    expectDimRoundTrip(BE35_CROSSING_EQUATION_RHS, '[1]');
  });

  it('is on the public BridgeEquations surface', () => {
    // typeof first: two undefineds are equal, so toBe alone passed before the evaluator existed.
    expect(typeof BridgeEquations.crossingEquation).toBe('function');
    expect(BridgeEquations.crossingEquation).toBe(evaluateCrossingEquation);
  });

  it('rejects a non-positive cross-ratio and a non-finite input', () => {
    const ok = { u: 0.2, v: 0.6, delta_phi: 1, g_uv: 1, g_vu: 1 };
    expect(() => evaluateCrossingEquation({ ...ok, u: 0 })).toThrow(RangeError);
    expect(() => evaluateCrossingEquation({ ...ok, v: -0.1 })).toThrow(RangeError);
    expect(() => evaluateCrossingEquation({ ...ok, g_vu: NaN })).toThrow(RangeError);
  });
});
