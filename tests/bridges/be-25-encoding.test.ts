/**
 * Tests for the legacy Tier-5 AST module that encodes the dropped
 * Penrose-Hameroff Orch-OR collapse-time form:
 *
 *   t_OR = ℏ / E_G = ℏ / (Δm c² Δx / ℓ_P)
 *
 * IMPORTANT — Wave P-D R-D2 (2026-05-06): BE-25 was reformulated to the
 * canonical Integrated Information Theory (IIT, Tononi) Φ_max form. The
 * AST module `src/bridges/equations/be-25-orch-or.ts` is now **stale**:
 * it encodes the dropped Penrose-Hameroff form rather than the new IIT
 * Φ_max form. The module is preserved for historical traceability and
 * for the dimensional-analyzer regression tests below, but it is no
 * longer load-bearing for any bridge-equation claim and is no longer
 * tied to `BRIDGE_EQUATIONS[BE-25].dimensional_signature` (which is now
 * null under the IIT reformulation — Φ is dimensionless / bits when
 * log₂ is used).
 *
 * The dimensional / numerical / property tests below are kept because
 * they exercise the AST validator infrastructure (validate, format,
 * evaluate, divergence-limit sweeps) on a non-trivial RHS. A future
 * Tier-5 sweep can either retire the module entirely or re-encode it
 * to the IIT Φ_max form (note: Φ is exponential in system size, so AST
 * encoding may not be tractable beyond ~10 elements).
 *
 * Honest-claude: this file no longer asserts that the bridge index's
 * `dimensional_signature` matches the AST inference, because the
 * reformulated IIT form has no canonical SI dimension to pin against.
 *
 * Reference (legacy / dropped): Penrose 1996 Gen. Rel. Grav. 28:581;
 * Hameroff-Penrose 1996. The original spec form's Δx/ℓ_P factor is a
 * spurious modification not present in Penrose's E_G ~ G(Δm)²/Δx; the
 * Tegmark 2000 (arXiv:quant-ph/9907009) decoherence falsification ruled
 * out the underlying microtubule-coherence mechanism by ~10 orders of
 * magnitude. Both critiques are moot under the IIT reformulation
 * (substrate-agnostic, no quantum-coherence claim).
 */
import { describe, it, expect } from 'vitest';
import {
  ORCH_OR_RHS,
  evaluateOrchOR,
  validateOrchORDimensions,
} from '../../src/bridges/equations/be-25-orch-or.js';
import { validate } from '../../src/dimensional/validator.js';
import { format } from '../../src/dimensional/algebra.js';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';
import { PhysicalConstants } from '../../src/core/types.js';

const be25 = BRIDGE_EQUATIONS.find((e) => e.id === 25);

describe('BE-25 legacy Orch-OR AST module (stale under Wave P-D R-D2 IIT reformulation)', () => {
  describe('index entry invariants under the IIT reformulation', () => {
    it('exists in the index', () => {
      expect(be25).toBeDefined();
    });

    it("status is now 'speculative' (Wave P-D R-D2 IIT reformulation)", () => {
      // Previously 'invalid' (Wave L Tier E3 R3 disposition); previously
      // 'highly-speculative' (initial spec). The Wave P-D reformulation
      // replaces the Penrose-Hameroff form with canonical IIT Φ_max,
      // promoting status to 'speculative'.
      expect(be25!.status).toBe('speculative');
    });

    it('dimensional_signature is null under the IIT reformulation (Φ has units of bits, not SI)', () => {
      // The legacy AST encoding (ORCH_OR_RHS) infers [time] for the
      // dropped Penrose-Hameroff form, but the bridge index entry now
      // describes the IIT Φ_max form whose dimensional_signature is
      // null (Φ is dimensionless / bits when log₂ is used).
      expect(be25!.dimensional_signature).toBeNull();
    });
  });

  describe('legacy Penrose-Hameroff AST validator regression (exercises validate/format/evaluate)', () => {
    it('AST validates cleanly through the dimensional analyzer (Penrose-Hameroff RHS)', () => {
      const r = validate(ORCH_OR_RHS);
      expect(r.ok).toBe(true);
      expect(r.violations).toEqual([]);
    });

    it('legacy RHS infers SI dimension [time]', () => {
      // The AST module encodes t_OR = ℏ ℓ_P / (Δm c² Δx) which has SI
      // dimension [time] regardless of whether the form is the
      // Penrose-canonical or spec-form expression.
      const r = validate(ORCH_OR_RHS);
      expect(r.inferredDimension).not.toBeNull();
      expect(format(r.inferredDimension!)).toBe('[time]');
    });

    it('validateOrchORDimensions reports both sides match (legacy form)', () => {
      const v = validateOrchORDimensions();
      expect(v.ok).toBe(true);
      expect(format(v.lhsDim!)).toBe('[time]');
      expect(format(v.rhsDim!)).toBe('[time]');
    });
  });

  describe('legacy numerical evaluation (exercises evaluator on the dropped form)', () => {
    it('1 mg sphere displaced 10 nm: legacy spec-form gives sub-Planckian t_OR (the documented spec defect)', () => {
      const t = evaluateOrchOR({ delta_m: 1e-6, delta_x: 1e-8 });
      // Spec form gives t ~ 10^-72 s, far below Planck time — exactly
      // the Wave L defect that justified the R3 disposition before
      // reformulation. Test now PINS the legacy module's behavior so a
      // silent edit doesn't go un-caught.
      expect(t).toBeGreaterThan(1e-75);
      expect(t).toBeLessThan(1e-65);
    });

    it('larger Δm gives shorter t_OR (inverse scaling)', () => {
      const t1 = evaluateOrchOR({ delta_m: 1e-9, delta_x: 1e-9 });
      const t2 = evaluateOrchOR({ delta_m: 1e-6, delta_x: 1e-9 });
      expect(t1 / t2).toBeCloseTo(1000, 6);
    });

    it('larger Δx gives shorter t_OR (inverse scaling per spec form)', () => {
      const t1 = evaluateOrchOR({ delta_m: 1e-9, delta_x: 1e-9 });
      const t2 = evaluateOrchOR({ delta_m: 1e-9, delta_x: 1e-6 });
      expect(t1 / t2).toBeCloseTo(1000, 6);
    });

    it('Δm = 1 kg, Δx = 1 m: explicit hand-computed value', () => {
      const t = evaluateOrchOR({ delta_m: 1.0, delta_x: 1.0 });
      const expected =
        (PhysicalConstants.hbar * PhysicalConstants.lP) /
        (1.0 * PhysicalConstants.c * PhysicalConstants.c * 1.0);
      expect(Math.abs(t - expected) / expected).toBeLessThan(1e-12);
      expect(t).toBeGreaterThan(1e-87);
      expect(t).toBeLessThan(1e-85);
    });
  });

  describe('legacy property tests / divergence limits', () => {
    it('Δm → 0 drives t_OR → ∞ (divergence with eps fence)', () => {
      const dms = [1e-3, 1e-6, 1e-9, 1e-12, 1e-15, 1e-18];
      let prev = -Infinity;
      for (const dm of dms) {
        const t = evaluateOrchOR({ delta_m: dm, delta_x: 1.0 });
        expect(t).toBeGreaterThan(prev);
        prev = t;
      }
      expect(prev).toBeGreaterThan(0);
    });

    it('Δx → 0 drives t_OR → ∞ (divergence with eps fence)', () => {
      const dxs = [1e-3, 1e-6, 1e-9, 1e-12, 1e-15, 1e-18];
      let prev = -Infinity;
      for (const dx of dxs) {
        const t = evaluateOrchOR({ delta_m: 1.0, delta_x: dx });
        expect(t).toBeGreaterThan(prev);
        prev = t;
      }
    });

    it('inverse-mass scaling: t(Δm)·Δm = const across 8-point sweep', () => {
      const dxFixed = 1.0;
      const dms = [1e-15, 1e-12, 1e-9, 1e-6, 1e-3, 1, 1e3, 1e6];
      const constants = dms.map((dm) =>
        evaluateOrchOR({ delta_m: dm, delta_x: dxFixed }) * dm,
      );
      const ref = constants[0]!;
      for (const k of constants) {
        expect(k / ref).toBeCloseTo(1, 12);
      }
    });

    it('inverse-Δx scaling: t(Δx)·Δx = const across 8-point sweep', () => {
      const dmFixed = 1.0;
      const dxs = [1e-15, 1e-12, 1e-9, 1e-6, 1e-3, 1, 1e3, 1e6];
      const constants = dxs.map((dx) =>
        evaluateOrchOR({ delta_m: dmFixed, delta_x: dx }) * dx,
      );
      const ref = constants[0]!;
      for (const k of constants) {
        expect(k / ref).toBeCloseTo(1, 12);
      }
    });
  });

  describe('input validation', () => {
    it('rejects non-positive delta_m', () => {
      expect(() => evaluateOrchOR({ delta_m: 0, delta_x: 1 })).toThrow(RangeError);
      expect(() => evaluateOrchOR({ delta_m: -1, delta_x: 1 })).toThrow(RangeError);
    });

    it('rejects non-positive delta_x', () => {
      expect(() => evaluateOrchOR({ delta_m: 1, delta_x: 0 })).toThrow(RangeError);
      expect(() => evaluateOrchOR({ delta_m: 1, delta_x: -1 })).toThrow(RangeError);
    });
  });
});
