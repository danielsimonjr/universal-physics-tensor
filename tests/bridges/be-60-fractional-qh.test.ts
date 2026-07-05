/**
 * BE-60 Fractional QH — evaluator + fractional-plateau confrontation.
 * @module tests/bridges/be-60-fractional-qh
 */
import { describe, it, expect } from 'vitest';
import { evaluateFractionalQH } from '../../src/bridges/be60-fractional-qh.js';
import { VON_KLITZING_SI } from '../../src/bridges/be55-quantum-hall.js';
import { confrontBE60 } from '../../src/bridges/be60-fractional-qh-confrontation.js';
import { CONFRONTATIONS } from '../../src/bridges/confrontations.js';
import { DATA_CONFRONTED_IDS } from '../../src/bridges/confrontation-coverage.js';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';

describe('BE-60 fractional quantum Hall (Laughlin ν=1/3)', () => {
  it('R_xy(ν=1/3) = 3·R_K ≈ 77438.422 Ω', () => {
    const r = evaluateFractionalQH({ nu: 1 / 3 });
    expect(r.R_xy_ohm).toBeCloseTo(3 * VON_KLITZING_SI, 3);
    expect(r.R_xy_ohm).toBeCloseTo(77438.422, 2);
    expect(r.sigma_xy_S).toBeCloseTo(1 / (3 * VON_KLITZING_SI), 12);
  });

  it('rejects non-positive filling', () => {
    expect(() => evaluateFractionalQH({ nu: 0 })).toThrow();
    expect(() => evaluateFractionalQH({ nu: -1 / 3 })).toThrow();
  });

  it('confronts the ⅓ FRACTION (topological order), anyonic/chern-tagged', () => {
    const r = confrontBE60();
    expect(r.consistent).toBe(true);
    expect(r.observation.provenance.citation).toMatch(/Tsui/);
    expect(CONFRONTATIONS.get(60)?.kind).toBe('consistency');
    expect(DATA_CONFRONTED_IDS.has(60)).toBe(true);
  });

  it('catalog entry: established, conductance signature, dep [55]', () => {
    const e = BRIDGE_EQUATIONS.find((b) => b.id === 60)!;
    expect(e.status).toBe('established');
    expect(e.dimensional_signature).toBe('[L^-2 M^-1 T^3 I^2]');
    expect(e.dependencies).toContain(55);
  });
});
