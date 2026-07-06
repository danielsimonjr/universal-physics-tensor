/**
 * BE-65 Jeans mass — evaluator + fragmentation-scale confrontation. Owns the exact
 * DATA_CONFRONTED_IDS count (19) as the last confrontation added.
 * @module tests/bridges/be-65-jeans-mass
 */
import { describe, it, expect } from 'vitest';
import { evaluateJeansMass } from '../../src/bridges/be65-jeans-mass.js';
import { confrontBE65 } from '../../src/bridges/be65-jeans-mass-confrontation.js';
import { CONFRONTATIONS } from '../../src/bridges/confrontations.js';
import { DATA_CONFRONTED_IDS } from '../../src/bridges/confrontation-coverage.js';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';

describe('BE-65 Jeans mass', () => {
  it('M_J ∝ T^{3/2} ρ^{-1/2}; ~1 M_⊙ at core-forming density', () => {
    const r = evaluateJeansMass({ T_K: 10, rho_kg_per_m3: 3.8e-16, mu: 2.3 });
    expect(r.M_J_kg / 1.989e30).toBeGreaterThan(0.5);
    expect(r.M_J_kg / 1.989e30).toBeLessThan(5);
    // denser → smaller M_J (ρ^-1/2): ×4 density → ÷2 mass
    const denser = evaluateJeansMass({ T_K: 10, rho_kg_per_m3: 4 * 3.8e-16, mu: 2.3 });
    expect(denser.M_J_kg).toBeCloseTo(r.M_J_kg / 2, 25);
  });

  it('rejects non-positive T, ρ, or μ', () => {
    expect(() => evaluateJeansMass({ T_K: 0, rho_kg_per_m3: 1e-16, mu: 2.3 })).toThrow();
    expect(() => evaluateJeansMass({ T_K: 10, rho_kg_per_m3: 0, mu: 2.3 })).toThrow();
    expect(() => evaluateJeansMass({ T_K: 10, rho_kg_per_m3: 1e-16, mu: -1 })).toThrow();
  });

  it('confronts the fragmentation scale (order-of-magnitude, convention caveat)', () => {
    const r = confrontBE65();
    expect(r.consistent).toBe(true);
    expect(r.observation.provenance.note).toMatch(/order-of-magnitude|convention|caveat/i);
    expect(DATA_CONFRONTED_IDS.has(65)).toBe(true);
  });

  it('registered; DATA_CONFRONTED_IDS is exactly 19 (BE-65 is the last added)', () => {
    expect(CONFRONTATIONS.get(65)?.kind).toBe('consistency');
    expect(DATA_CONFRONTED_IDS.size).toBe(19);
  });

  it('catalog entry: established, mass signature', () => {
    const e = BRIDGE_EQUATIONS.find((b) => b.id === 65)!;
    expect(e.status).toBe('established');
    expect(e.dimensional_signature).toBe('[mass]');
  });
});
