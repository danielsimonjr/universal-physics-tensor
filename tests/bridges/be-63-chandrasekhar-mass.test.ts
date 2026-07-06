/**
 * BE-63 Chandrasekhar mass — evaluator + white-dwarf-mass confrontation (caveat).
 * @module tests/bridges/be-63-chandrasekhar-mass
 */
import { describe, it, expect } from 'vitest';
import { evaluateChandrasekharMass } from '../../src/bridges/be63-chandrasekhar-mass.js';
import { confrontBE63 } from '../../src/bridges/be63-chandrasekhar-mass-confrontation.js';
import { DATA_CONFRONTED_IDS } from '../../src/bridges/confrontation-coverage.js';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';

describe('BE-63 Chandrasekhar mass', () => {
  it('M_Ch(μ_e=2) ≈ 1.4 M_⊙; scales as μ_e⁻²', () => {
    const r = evaluateChandrasekharMass({ mu_e: 2 });
    expect(r.M_Ch_solar).toBeGreaterThan(1.3);
    expect(r.M_Ch_solar).toBeLessThan(1.6);
    // μ_e⁻² scaling
    expect(evaluateChandrasekharMass({ mu_e: 4 }).M_Ch_kg).toBeCloseTo(r.M_Ch_kg / 4, 25);
  });

  it('rejects non-positive mu_e', () => {
    expect(() => evaluateChandrasekharMass({ mu_e: 0 })).toThrow();
  });

  it('confronts WD max mass with the super-Chandrasekhar caveat', () => {
    const r = confrontBE63();
    expect(r.consistent).toBe(true);
    expect(r.observation.provenance.note).toMatch(/super-Chandrasekhar|upper-bound|caveat/i);
    expect(DATA_CONFRONTED_IDS.has(63)).toBe(true);
  });

  it('catalog entry: established, mass signature', () => {
    const e = BRIDGE_EQUATIONS.find((b) => b.id === 63)!;
    expect(e.status).toBe('established');
    expect(e.dimensional_signature).toBe('[mass]');
  });
});
