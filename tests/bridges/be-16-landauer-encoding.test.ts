/**
 * Tier-5 AST encoding test for BE-16 — Complexity-Entropy Production
 * Relation (Landauer's principle reformulation).
 *
 *   E_min = k_B · T · ln(2)
 *
 * Wave Z-E (2026-05-11): reformulates BE-16 from `status='invalid'`
 * (broken `dS/dt = k_B·C(ρ)·∂I/∂t` ansatz, self-refuting algebraically)
 * to `status='speculative'` via Landauer's principle, the canonical
 * information-↔-thermodynamics bridge. Precedent: BE-25 (Penrose-
 * Hameroff Orch-OR → IIT Φ_max, Wave P-D R-D2).
 *
 * Status pin: 'speculative'. Landauer 1961 is canonical and
 * experimentally tested (Bérut 2012, Jun 2014). The bridge framing —
 * treating Landauer's bound as the UPT microscale-↔-emergent bridge —
 * remains the speculative element.
 *
 * @see src/bridges/equations/be-16-landauer.ts
 * @see docs/specification/Part-I.md ("Bridge Equation 16")
 * @see src/bridges/index.ts BRIDGE_EQUATIONS.find(e => e.id === 16)
 */

import { describe, it, expect } from 'vitest';
import {
  BE16_LANDAUER_RHS,
  BE16_LANDAUER_LHS,
  BE16_BOLTZMANN,
  BE16_TEMPERATURE,
  BE16_LN2,
  evaluateLandauerEnergy,
  validateBE16Dimensions,
} from '../../src/bridges/equations/be-16-landauer.js';
import { validate, validateEquation } from '../../src/dimensional/validator.js';
import { format } from '../../src/dimensional/algebra.js';
import { ENERGY, TEMPERATURE, DIMENSIONLESS } from '../../src/dimensional/types.js';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';

describe('BE-16 Complexity-Entropy (Landauer reformulation) — Tier 5 AST encoding (Wave Z-E)', () => {
  describe('index entry invariants', () => {
    const be16 = BRIDGE_EQUATIONS.find((e) => e.id === 16);

    it('exists in the index', () => {
      expect(be16).toBeDefined();
    });

    it("status REFORMULATED to 'speculative' (from 'invalid' under Wave Z-E Landauer reformulation)", () => {
      // Wave Z-E reformulates BE-16 from invalid (broken C(ρ) ansatz)
      // to Landauer's principle. Status set to 'speculative' (NOT
      // 'established') because Landauer itself is canonical, but the
      // bridge framing (Landauer as the UPT microscale-↔-emergent
      // bridge) is the speculative element. Same precedent as BE-25
      // IIT reformulation (Wave P-D R-D2).
      expect(be16!.status).toBe('speculative');
    });

    it("dimensional_signature is set to '[energy]' (Landauer's E_min)", () => {
      expect(be16!.dimensional_signature).toBe('[energy]');
    });
  });

  describe('dimensional validation', () => {
    it('AST validates cleanly through the dimensional analyzer', () => {
      const r = validate(BE16_LANDAUER_RHS);
      expect(r.ok).toBe(true);
      expect(r.violations).toEqual([]);
    });

    it("RHS infers SI dimension '[energy]' (round-trip pin)", () => {
      const r = validate(BE16_LANDAUER_RHS);
      expect(r.inferredDimension).not.toBeNull();
      expect(format(r.inferredDimension!)).toBe('[energy]');
    });

    it('LHS (E_min) has dim ENERGY', () => {
      const r = validate(BE16_LANDAUER_LHS);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(ENERGY);
    });

    it('full equation E_min = k_B·T·ln(2) validates', () => {
      const eq = validateEquation(BE16_LANDAUER_LHS, BE16_LANDAUER_RHS);
      expect(eq.ok).toBe(true);
    });

    it('BE16_TEMPERATURE (T) has dim TEMPERATURE', () => {
      const r = validate(BE16_TEMPERATURE);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(TEMPERATURE);
    });

    it('BE16_LN2 (ln_2_constant) is DIMENSIONLESS', () => {
      const r = validate(BE16_LN2);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(DIMENSIONLESS);
    });

    it('BE16_BOLTZMANN (k_B) has the project-standard k_B dim', () => {
      const r = validate(BE16_BOLTZMANN);
      expect(r.ok).toBe(true);
      // k_B has dim [energy/temperature]; the format() output is just
      // the bracketed product representation. We check via the
      // round-trip that k_B · T yields ENERGY.
      const kBT: import('../../src/dimensional/validator.js').ExprNode = {
        kind: 'op', op: '*',
        args: [BE16_BOLTZMANN, BE16_TEMPERATURE],
      };
      expect(validate(kBT).inferredDimension).toEqual(ENERGY);
    });

    it('validateBE16Dimensions reports both sides as ENERGY', () => {
      const r = validateBE16Dimensions();
      expect(r.ok).toBe(true);
      expect(r.lhsDim).toEqual(ENERGY);
      expect(r.rhsDim).toEqual(ENERGY);
    });

    it('bridge index dimensional_signature matches the AST inference', () => {
      const inferred = validate(BE16_LANDAUER_RHS).inferredDimension;
      expect(inferred).not.toBeNull();
      const be16 = BRIDGE_EQUATIONS.find((e) => e.id === 16);
      expect(be16!.dimensional_signature).toBe(format(inferred!));
    });
  });

  describe('numerical evaluation', () => {
    it('T = 300 K (room temperature): E_min ≈ 2.87 × 10⁻²¹ J', () => {
      const E = evaluateLandauerEnergy({ temperature_K: 300 });
      // k_B · 300 · ln(2) = 1.380649e-23 · 300 · 0.693147... = 2.871e-21
      expect(E).toBeCloseTo(2.870695e-21, 24);
    });

    it('T = 300 K: equivalent to ~18 meV per bit (literature bracket)', () => {
      const E = evaluateLandauerEnergy({ temperature_K: 300 });
      const eV = 1.602176634e-19;
      const E_meV = (E / eV) * 1000;
      // Should be ~17.9 meV per bit at room temperature.
      expect(E_meV).toBeGreaterThan(17.5);
      expect(E_meV).toBeLessThan(18.5);
    });

    it('T = 0 K: E_min = 0 (thermal noise floor vanishes)', () => {
      const E = evaluateLandauerEnergy({ temperature_K: 0 });
      expect(E).toBe(0);
    });

    it('linearity in T: doubling T doubles E_min', () => {
      const E1 = evaluateLandauerEnergy({ temperature_K: 100 });
      const E2 = evaluateLandauerEnergy({ temperature_K: 200 });
      expect(E2 / E1).toBeCloseTo(2.0, 14);
    });

    it('T = 1 K: E_min = k_B · ln(2) ≈ 9.57 × 10⁻²⁴ J', () => {
      const E = evaluateLandauerEnergy({ temperature_K: 1 });
      // k_B · 1 · ln(2) = 1.380649e-23 · 0.69314718... = 9.5699e-24
      expect(E).toBeCloseTo(9.5699296e-24, 27);
    });

    it('quantum-scale T = 1 mK: E_min ≈ 9.57 × 10⁻²⁷ J ≈ 60 neV', () => {
      const E = evaluateLandauerEnergy({ temperature_K: 1e-3 });
      expect(E).toBeCloseTo(9.5699296e-27, 30);
    });
  });

  describe('input validation', () => {
    it('rejects non-finite temperature', () => {
      expect(() => evaluateLandauerEnergy({ temperature_K: NaN })).toThrow(RangeError);
      expect(() => evaluateLandauerEnergy({ temperature_K: Infinity })).toThrow(RangeError);
    });

    it('rejects negative temperature (thermodynamic T ≥ 0)', () => {
      expect(() => evaluateLandauerEnergy({ temperature_K: -1 })).toThrow(RangeError);
      expect(() => evaluateLandauerEnergy({ temperature_K: -300 })).toThrow(RangeError);
    });

    it('accepts T = 0 as the zero-temperature limit (E_min = 0 by Landauer)', () => {
      expect(() => evaluateLandauerEnergy({ temperature_K: 0 })).not.toThrow();
    });
  });
});
