/**
 * BE-56 Casimir effect — evaluator + measurement confrontation.
 * @module tests/bridges/be-56-casimir
 */
import { describe, it, expect } from 'vitest';
import { evaluateCasimir } from '../../src/bridges/be56-casimir.js';
import { confrontBE56 } from '../../src/bridges/be56-casimir-confrontation.js';
import { CONFRONTATIONS } from '../../src/bridges/confrontations.js';
import { DATA_CONFRONTED_IDS } from '../../src/bridges/confrontation-coverage.js';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';
import { HBAR_SI, C_SI } from '../../src/core/constants.js';

describe('BE-56 Casimir effect', () => {
  it('F/A = −π²ℏc/(240 d⁴), attractive, ∝ d⁻⁴', () => {
    const d = 1e-6;
    const expected = -(Math.PI ** 2 * HBAR_SI * C_SI) / (240 * d ** 4);
    expect(evaluateCasimir({ d_m: d }).pressure_Pa).toBeCloseTo(expected, 30);
    expect(evaluateCasimir({ d_m: d }).pressure_Pa).toBeLessThan(0); // attractive
    // halving d increases |F/A| by 16×
    const ratio =
      evaluateCasimir({ d_m: d / 2 }).pressure_Pa / evaluateCasimir({ d_m: d }).pressure_Pa;
    expect(ratio).toBeCloseTo(16, 6);
  });

  it('rejects non-positive separation', () => {
    expect(() => evaluateCasimir({ d_m: 0 })).toThrow();
    expect(() => evaluateCasimir({ d_m: -1e-6 })).toThrow();
  });

  it('confronts the measured force (Mohideen-Roy ~1%, systematics-dominated caveat)', () => {
    const r = confrontBE56();
    expect(r.consistent).toBe(true);
    expect(r.agreement).toBeCloseTo(0.01, 6);
    expect(r.observation.provenance.citation).toMatch(/Mohideen/);
    // the honesty caveat must be recorded
    expect(r.observation.provenance.note).toMatch(/systematics-dominated|corrected/i);
    expect(CONFRONTATIONS.get(56)?.kind).toBe('consistency');
    expect(DATA_CONFRONTED_IDS.has(56)).toBe(true);
  });

  it('catalog entry: established, pressure signature', () => {
    const e = BRIDGE_EQUATIONS.find((b) => b.id === 56)!;
    expect(e.status).toBe('established');
    expect(e.dimensional_signature).toBe('[L^-1 M T^-2]');
  });
});
