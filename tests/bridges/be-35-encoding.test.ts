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
  BE35_CROSSING_EQUATION_RHS,
  evaluateCrossingEquation,
} from '../../src/bridges/equations/be-35-conformal-bootstrap.js';
import { BRIDGE_RHS_BY_ID } from '../../src/bridges/rhs-registry.js';
import { BridgeEquations } from '../../src/bridges/bridge-equations.js';
import { validate } from '../../src/dimensional/validator.js';
import { DIMENSIONLESS } from '../../src/dimensional/types.js';
import { expectBridgeInIndex, expectDimRoundTrip } from './_helpers.js';

describe('BE-35 Conformal Bootstrap (index entry)', () => {
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
});

// ---------------------------------------------------------------------------
// The crossing EQUATION (census finding F1). The single-block residual, removed in
// 0.47.0, had no v^Δφ / u^Δφ prefactors and was written for ONE block, but crossing holds for
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
