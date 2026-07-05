/**
 * BE-61 Wiedemann-Franz — evaluator + Lorenz-number confrontation (with caveat).
 * @module tests/bridges/be-61-wiedemann-franz
 */
import { describe, it, expect } from 'vitest';
import {
  evaluateWiedemannFranz,
  LORENZ_NUMBER_SI,
} from '../../src/bridges/be61-wiedemann-franz.js';
import { confrontBE61 } from '../../src/bridges/be61-wiedemann-franz-confrontation.js';
import { CONFRONTATIONS } from '../../src/bridges/confrontations.js';
import { DATA_CONFRONTED_IDS } from '../../src/bridges/confrontation-coverage.js';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';

describe('BE-61 Wiedemann-Franz law', () => {
  it('L₀ = (π²/3)(k_B/e)² ≈ 2.44e-8; κ = L₀·σ·T', () => {
    expect(LORENZ_NUMBER_SI).toBeCloseTo(2.44e-8, 10);
    const r = evaluateWiedemannFranz({ sigma_S_per_m: 6e7, T_K: 300 });
    expect(r.kappa_W_per_mK).toBeCloseTo(LORENZ_NUMBER_SI * 6e7 * 300, 6);
  });

  it('rejects negative sigma or T', () => {
    expect(() => evaluateWiedemannFranz({ sigma_S_per_m: -1, T_K: 300 })).toThrow();
    expect(() => evaluateWiedemannFranz({ sigma_S_per_m: 6e7, T_K: -1 })).toThrow();
  });

  it('confronts the degenerate limit with the honest material-spread caveat', () => {
    const r = confrontBE61();
    expect(r.consistent).toBe(true);
    // the caveat must be recorded (Eve YELLOW — degenerate-limit, not a tight test)
    expect(r.observation.provenance.note).toMatch(/degenerate|caveat|spread|9%/i);
    expect(DATA_CONFRONTED_IDS.has(61)).toBe(true);
  });

  it('catalog entry: established, Lorenz-number signature, statistics STRIPPED', () => {
    const e = BRIDGE_EQUATIONS.find((b) => b.id === 61)!;
    expect(e.status).toBe('established');
    expect(e.dimensional_signature).toBe('[L^4 M^2 T^-6 I^-2 Theta^-2]');
    // Eve YELLOW → statistics tag stripped; the note records it
    expect(e.notes).toMatch(/STRIPPED/);
  });
});
