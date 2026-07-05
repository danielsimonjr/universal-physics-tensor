/**
 * BE-55 integer quantum Hall / TKNN — evaluator + universality confrontation.
 * @module tests/bridges/be-55-quantum-hall
 */
import { describe, it, expect } from 'vitest';
import {
  evaluateQuantumHall,
  VON_KLITZING_SI,
} from '../../src/bridges/be55-quantum-hall.js';
import { confrontBE55 } from '../../src/bridges/be55-quantum-hall-confrontation.js';
import { CONFRONTATIONS } from '../../src/bridges/confrontations.js';
import { DATA_CONFRONTED_IDS } from '../../src/bridges/confrontation-coverage.js';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';

describe('BE-55 integer quantum Hall / TKNN', () => {
  it('R_H(C=1) = von Klitzing constant h/e² ≈ 25812.807 Ω', () => {
    expect(VON_KLITZING_SI).toBeCloseTo(25812.807, 2);
    expect(evaluateQuantumHall({ C: 1 }).R_H_ohm).toBeCloseTo(25812.807, 2);
  });

  it('σ_xy is C·e²/h; R_H = R_K/C', () => {
    const r1 = evaluateQuantumHall({ C: 1 });
    const r2 = evaluateQuantumHall({ C: 2 });
    expect(r2.sigma_xy_S).toBeCloseTo(2 * r1.sigma_xy_S, 20);
    expect(r2.R_H_ohm).toBeCloseTo(VON_KLITZING_SI / 2, 6);
  });

  it('rejects non-integer or zero Chern number', () => {
    expect(() => evaluateQuantumHall({ C: 1.5 })).toThrow();
    expect(() => evaluateQuantumHall({ C: 0 })).toThrow();
  });

  it('confronts UNIVERSALITY (graphene vs GaAs, 8.6e-11) — consistency, non-circular', () => {
    const r = confrontBE55();
    expect(r.consistent).toBe(true);
    expect(r.relative_uncertainty).toBeCloseTo(8.6e-11, 13);
    expect(r.observation.provenance.citation).toMatch(/Janssen/);
    expect(r.observation.provenance.note).toMatch(/non-circular|definitional/i);
    expect(CONFRONTATIONS.get(55)?.kind).toBe('consistency');
    expect(DATA_CONFRONTED_IDS.has(55)).toBe(true);
  });

  it('catalog entry: established, conductance signature', () => {
    const e = BRIDGE_EQUATIONS.find((b) => b.id === 55)!;
    expect(e.status).toBe('established');
    expect(e.dimensional_signature).toBe('[L^-2 M^-1 T^3 I^2]');
  });
});
