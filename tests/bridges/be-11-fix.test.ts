/**
 * Regression test for BE-11 (Decoherence Master Equation) audit fix.
 *
 * Branch: fix/be-11-decoherence-coupling (2026-05-04)
 *
 * Background: BE-11 was flagged R0 in the Tier-3 audit
 * (docs/planning/Bridge-Remediation-Plan.md) because its auxiliary
 * coupling-dependent decoherence rate `γ_k(T,λ) = γ_0 exp(-λ/λ_thermal)`
 * was exponentially *decreasing* in coupling λ, the opposite of the
 * standard Caldeira-Leggett weak-coupling result γ ∝ λ². The Lindblad
 * master equation itself (the main RHS) is established literature
 * (Lindblad 1976, GKSL 1976) and was always correct; only the auxiliary
 * rate was a transcription error.
 *
 * Fix: replace γ_k(T,λ) = γ_0 exp(-λ/λ_thermal) with the Caldeira-Leggett
 * weak-coupling form γ_k(λ) = γ_0 (λ/λ_0)² (Caldeira-Leggett 1985, Phys.
 * Rev. A 31, 1059, §III.B). Status remains 'established' (the Lindblad
 * form is unchanged; the rate was a transcription fix).
 *
 * This test asserts the audit-fix invariants in the index entry and the
 * dimensional consistency of the corrected rate.
 */
import { describe, it, expect } from 'vitest';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';
import {
  DECOHERENCE_RATE_RHS,
  evaluateDecoherenceRate,
  validateDecoherenceRateDimensions,
} from '../../src/bridges/equations/be-11-decoherence-master.js';
import { FREQUENCY } from '../../src/dimensional/types.js';
import { validate } from '../../src/dimensional/validator.js';
import { format } from '../../src/dimensional/algebra.js';

const be11 = BRIDGE_EQUATIONS.find((e) => e.id === 11);

describe('BE-11 Decoherence Master Equation (audit fix)', () => {
  describe('index entry invariants', () => {
    it('exists in the index', () => {
      expect(be11).toBeDefined();
    });

    it("status remains 'established' (Lindblad form is unchanged)", () => {
      expect(be11!.status).toBe('established');
    });

    it('formula_latex no longer contains the broken Arrhenius-in-coupling rate', () => {
      // The original broken rate was γ_0 exp(-λ/λ_thermal). After the fix,
      // the formula_latex should not mention λ_thermal or that exp form.
      expect(be11!.formula_latex).not.toMatch(/lambda_\{?\\?text\{?thermal\}?\}?/);
      expect(be11!.formula_latex).not.toMatch(/\\exp\\?left\(-\\?frac\{\\?lambda\}/);
    });

    it('formula_latex contains the corrected Caldeira-Leggett form γ_0 (λ/λ_0)²', () => {
      // The new formula_latex must include the corrected rate alongside
      // the Lindblad equation.
      expect(be11!.formula_latex).toMatch(/gamma_0/);
      expect(be11!.formula_latex).toMatch(/lambda_0/);
      // The (λ/λ_0)^2 ratio with explicit power.
      expect(be11!.formula_latex).toMatch(/\\frac\{\\lambda\}\{\\lambda_0\}.*\^2|\\lambda.*\\lambda_0.*\^2/);
    });

    it('known_issues no longer contains the "exponentially decreasing in coupling" finding', () => {
      // Pre-fix: known_issues had one phenomenological-ansatz entry citing
      // the backwards exponential. Post-fix: empty (the bug is fixed).
      const stillBacked = (be11!.known_issues ?? []).some((iss) =>
        /exponentially.*decreasing|backwards|increase.*coupling/i.test(iss.description),
      );
      expect(stillBacked).toBe(false);
      expect(be11!.known_issues).toEqual([]);
    });

    it('dimensional_signature is set to [frequency] (rate equation in T^-1)', () => {
      expect(be11!.dimensional_signature).toBe('[frequency]');
    });

    it('references include Lindblad 1976 and Caldeira-Leggett 1985', () => {
      const refs = be11!.references.join(' | ');
      expect(refs).toMatch(/Lindblad.*1976/);
      expect(refs).toMatch(/Caldeira.*Leggett.*1985|Caldeira-Leggett.*1985/);
    });

    it('notes record the 2026-05-04 fix and the original→corrected transition', () => {
      expect(be11!.notes).toMatch(/2026-05-04/);
      expect(be11!.notes).toMatch(/Caldeira-Leggett|\(λ\/λ_0\)²|lambda\/lambda_0/i);
    });
  });

  describe('dimensional validation of the corrected rate', () => {
    it('AST validates cleanly through the dimensional analyzer', () => {
      const r = validate(DECOHERENCE_RATE_RHS);
      expect(r.ok).toBe(true);
      expect(r.violations).toEqual([]);
    });

    it('RHS infers SI dimension [frequency] = T^-1', () => {
      const r = validate(DECOHERENCE_RATE_RHS);
      expect(r.inferredDimension).toEqual(FREQUENCY);
    });

    it('validateDecoherenceRateDimensions reports both sides in [frequency]', () => {
      const v = validateDecoherenceRateDimensions();
      expect(v.ok).toBe(true);
      expect(v.lhsDim).toEqual(FREQUENCY);
      expect(v.rhsDim).toEqual(FREQUENCY);
    });

    it('bridge index dimensional_signature matches the AST inference', () => {
      const inferred = validate(DECOHERENCE_RATE_RHS).inferredDimension;
      expect(inferred).not.toBeNull();
      expect(be11!.dimensional_signature).toBe(format(inferred!));
    });
  });

  describe('numerical evaluator (Caldeira-Leggett weak-coupling form)', () => {
    it('λ = λ_0 reproduces γ_0 (reference-coupling identity)', () => {
      const gamma = evaluateDecoherenceRate({
        gamma0_per_s: 1.0e9,
        lambda: 0.3,
        lambda0: 0.3,
      });
      expect(gamma).toBe(1.0e9);
    });

    it('rate is strictly monotonically increasing across a dense λ sweep', () => {
      // Property-style: a 10-point sweep is much harder to fit by a
      // function with a hidden bump than the 3-point form was. The
      // original (broken) γ_0 exp(-λ/λ_thermal) was monotonically
      // decreasing — every consecutive pair must violate the assertion.
      const lambdas = [0.01, 0.1, 0.3, 0.5, 0.7, 1.0, 1.5, 2.0, 5.0, 10.0];
      let prev = -Infinity;
      for (const lam of lambdas) {
        const g = evaluateDecoherenceRate({
          gamma0_per_s: 1,
          lambda: lam,
          lambda0: 1,
        });
        expect(g, `lambda=${lam}: γ=${g} not strictly greater than prev=${prev}`)
          .toBeGreaterThan(prev);
        prev = g;
      }
    });

    it('quadratic ratio: γ(αλ)/γ(λ) = α² for several α', () => {
      // Stronger than the original "doubling λ quadruples the rate" — a
      // single-pair test could fit any function with f(2)/f(1) = 4. We
      // assert the ratio identity over four α values to 12 decimal places.
      for (const alpha of [0.5, 2, 3, 7]) {
        const g1 = evaluateDecoherenceRate({
          gamma0_per_s: 1,
          lambda: 1,
          lambda0: 1,
        });
        const ga = evaluateDecoherenceRate({
          gamma0_per_s: 1,
          lambda: alpha,
          lambda0: 1,
        });
        expect(ga / g1).toBeCloseTo(alpha * alpha, 12);
      }
    });

    it('λ = 0 yields γ = 0 (no coupling, no decoherence)', () => {
      const gamma = evaluateDecoherenceRate({
        gamma0_per_s: 1.0e9,
        lambda: 0,
        lambda0: 1.0,
      });
      expect(gamma).toBe(0);
    });

    it('rejects negative gamma0_per_s', () => {
      expect(() =>
        evaluateDecoherenceRate({ gamma0_per_s: -1, lambda: 1, lambda0: 1 }),
      ).toThrow(RangeError);
    });

    it('rejects non-positive lambda0 (division would be ill-defined / sign-flipped)', () => {
      expect(() =>
        evaluateDecoherenceRate({ gamma0_per_s: 1, lambda: 1, lambda0: 0 }),
      ).toThrow(RangeError);
      expect(() =>
        evaluateDecoherenceRate({ gamma0_per_s: 1, lambda: 1, lambda0: -1 }),
      ).toThrow(RangeError);
    });
  });
});
