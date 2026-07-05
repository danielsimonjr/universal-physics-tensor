/**
 * BE-58 Johnson-Nyquist / FDT — evaluator + JNT k_B confrontation. Also owns the
 * exact DATA_CONFRONTED_IDS count (12) since it is the last confrontation added.
 * @module tests/bridges/be-58-johnson-nyquist
 */
import { describe, it, expect } from 'vitest';
import { evaluateJohnsonNyquist } from '../../src/bridges/be58-johnson-nyquist.js';
import { confrontBE58 } from '../../src/bridges/be58-johnson-nyquist-confrontation.js';
import { CONFRONTATIONS, runConfrontation } from '../../src/bridges/confrontations.js';
import { DATA_CONFRONTED_IDS } from '../../src/bridges/confrontation-coverage.js';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';
import { K_B_SI } from '../../src/core/constants.js';

describe('BE-58 Johnson-Nyquist / fluctuation-dissipation', () => {
  it('S_V = 4 k_B T R (one-sided); linear in T and R', () => {
    const r = evaluateJohnsonNyquist({ T_K: 300, R_ohm: 1000 });
    expect(r.S_V_V2_per_Hz).toBeCloseTo(4 * K_B_SI * 300 * 1000, 25);
    expect(evaluateJohnsonNyquist({ T_K: 600, R_ohm: 1000 }).S_V_V2_per_Hz).toBeCloseTo(
      2 * r.S_V_V2_per_Hz,
      25,
    );
  });

  it('rejects negative T or R', () => {
    expect(() => evaluateJohnsonNyquist({ T_K: -1, R_ohm: 1000 })).toThrow();
    expect(() => evaluateJohnsonNyquist({ T_K: 300, R_ohm: -1 })).toThrow();
  });

  it('confronts JNT k_B vs CODATA at 0.81σ (within 1σ, non-circular)', () => {
    const r = confrontBE58();
    expect(r.residual_in_sigma).toBeCloseTo(0.81, 1);
    expect(r.withinObserved).toBe(true);
    expect(r.observation.provenance.citation).toMatch(/Flowers-Jacobs/);
    expect(r.observation.provenance.note).toMatch(/NON-CIRCULAR|quantum Hall|acoustic/i);
    const out = runConfrontation(58);
    expect(out?.kind).toBe('value');
  });

  it('registered; DATA_CONFRONTED_IDS is exactly 12 (BE-58 is the last added)', () => {
    expect(CONFRONTATIONS.get(58)?.kind).toBe('value');
    expect(DATA_CONFRONTED_IDS.has(58)).toBe(true);
    expect(DATA_CONFRONTED_IDS.size).toBe(12);
  });

  it('catalog entry: established, V²/Hz signature, FDT (dep 27 = its violation)', () => {
    const e = BRIDGE_EQUATIONS.find((b) => b.id === 58)!;
    expect(e.status).toBe('established');
    expect(e.dimensional_signature).toBe('[L^4 M^2 T^-5 I^-2]');
    expect(e.dependencies).toContain(27);
  });
});
