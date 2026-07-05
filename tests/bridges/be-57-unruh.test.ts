/**
 * BE-57 Unruh effect — evaluator; confrontation DEFERRED (no lab data).
 * @module tests/bridges/be-57-unruh
 */
import { describe, it, expect } from 'vitest';
import { evaluateUnruh } from '../../src/bridges/be57-unruh.js';
import { CONFRONTATIONS } from '../../src/bridges/confrontations.js';
import { DATA_CONFRONTED_IDS } from '../../src/bridges/confrontation-coverage.js';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';

describe('BE-57 Unruh effect', () => {
  it('T = ℏa/(2π c k_B); ~4×10⁻²⁰ K at 1g (unmeasurable)', () => {
    const T = evaluateUnruh({ a_m_s2: 9.80665 }).T_K;
    expect(T).toBeGreaterThan(3e-20);
    expect(T).toBeLessThan(5e-20);
    // linear in a
    expect(evaluateUnruh({ a_m_s2: 2 * 9.80665 }).T_K).toBeCloseTo(2 * T, 30);
  });

  it('rejects negative acceleration; T(0) = 0', () => {
    expect(() => evaluateUnruh({ a_m_s2: -1 })).toThrow();
    expect(evaluateUnruh({ a_m_s2: 0 }).T_K).toBe(0);
  });

  it('is NOT data-confronted (established on theory; no lab test)', () => {
    expect(CONFRONTATIONS.has(57)).toBe(false);
    expect(DATA_CONFRONTED_IDS.has(57)).toBe(false);
  });

  it('catalog entry: established, temperature signature, Hawking sibling (dep 42)', () => {
    const e = BRIDGE_EQUATIONS.find((b) => b.id === 57)!;
    expect(e.status).toBe('established');
    expect(e.dimensional_signature).toBe('[temperature]');
    expect(e.dependencies).toContain(42);
  });
});
