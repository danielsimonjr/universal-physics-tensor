/**
 * BE-64 Eddington luminosity — evaluator + Eddington-ratio confrontation (caveat).
 * @module tests/bridges/be-64-eddington-luminosity
 */
import { describe, it, expect } from 'vitest';
import { evaluateEddingtonLuminosity } from '../../src/bridges/be64-eddington-luminosity.js';
import { confrontBE64 } from '../../src/bridges/be64-eddington-luminosity-confrontation.js';
import { DATA_CONFRONTED_IDS } from '../../src/bridges/confrontation-coverage.js';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';

describe('BE-64 Eddington luminosity', () => {
  it('L_Edd(M_⊙) ≈ 1.26e31 W; linear in M', () => {
    const r = evaluateEddingtonLuminosity({ M_kg: 1.989e30 });
    expect(r.L_Edd_W).toBeGreaterThan(1.2e31);
    expect(r.L_Edd_W).toBeLessThan(1.3e31);
    expect(evaluateEddingtonLuminosity({ M_kg: 2 * 1.989e30 }).L_Edd_W).toBeCloseTo(2 * r.L_Edd_W, 20);
  });

  it('rejects non-positive mass', () => {
    expect(() => evaluateEddingtonLuminosity({ M_kg: 0 })).toThrow();
  });

  it('confronts the Eddington ratio with the super-Eddington caveat', () => {
    const r = confrontBE64();
    expect(r.consistent).toBe(true);
    expect(r.observation.provenance.note).toMatch(/super-Eddington|spherical|caveat/i);
    expect(DATA_CONFRONTED_IDS.has(64)).toBe(true);
  });

  it('catalog entry: established, power signature', () => {
    const e = BRIDGE_EQUATIONS.find((b) => b.id === 64)!;
    expect(e.status).toBe('established');
    expect(e.dimensional_signature).toBe('[power]');
  });
});
