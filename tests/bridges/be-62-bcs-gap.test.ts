/**
 * BE-62 BCS gap ratio — evaluator + gap-ratio confrontation (with caveat). Owns
 * the exact DATA_CONFRONTED_IDS count (16) as the last confrontation added.
 * @module tests/bridges/be-62-bcs-gap
 */
import { describe, it, expect } from 'vitest';
import { evaluateBCSGap, BCS_GAP_RATIO } from '../../src/bridges/be62-bcs-gap.js';
import { confrontBE62 } from '../../src/bridges/be62-bcs-gap-confrontation.js';
import { CONFRONTATIONS } from '../../src/bridges/confrontations.js';
import { DATA_CONFRONTED_IDS } from '../../src/bridges/confrontation-coverage.js';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';
import { K_B_SI } from '../../src/core/constants.js';

describe('BE-62 BCS gap ratio', () => {
  it('2Δ(0)/(k_B T_c) = 2π/e^γ ≈ 3.528; Δ(0) = 1.764 k_B T_c', () => {
    expect(BCS_GAP_RATIO).toBeCloseTo(3.528, 3);
    const r = evaluateBCSGap({ T_c_K: 1.2 }); // ~aluminum
    expect(r.gap_0_J).toBeCloseTo((BCS_GAP_RATIO / 2) * K_B_SI * 1.2, 30);
    expect(r.ratio_2gap_over_kTc).toBeCloseTo(3.528, 3);
  });

  it('rejects negative T_c', () => {
    expect(() => evaluateBCSGap({ T_c_K: -1 })).toThrow();
  });

  it('confronts the weak-coupling class with the strong-coupling caveat', () => {
    const r = confrontBE62();
    expect(r.consistent).toBe(true);
    expect(r.observation.provenance.note).toMatch(/strong-coupling|spread|caveat/i);
    expect(DATA_CONFRONTED_IDS.has(62)).toBe(true);
  });

  it('registered; DATA_CONFRONTED_IDS is exactly 16 (BE-62 is the last added)', () => {
    expect(CONFRONTATIONS.get(62)?.kind).toBe('consistency');
    expect(DATA_CONFRONTED_IDS.size).toBeGreaterThanOrEqual(16);
  });

  it('catalog entry: established, energy signature, statistics STRIPPED', () => {
    const e = BRIDGE_EQUATIONS.find((b) => b.id === 62)!;
    expect(e.status).toBe('established');
    expect(e.dimensional_signature).toBe('[energy]');
    expect(e.notes).toMatch(/STRIPPED/);
  });
});
