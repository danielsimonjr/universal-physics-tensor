/**
 * BE-59 AC Josephson — evaluator + universality confrontation.
 * @module tests/bridges/be-59-ac-josephson
 */
import { describe, it, expect } from 'vitest';
import {
  evaluateACJosephson,
  JOSEPHSON_CONSTANT_SI,
} from '../../src/bridges/be59-ac-josephson.js';
import { confrontBE59 } from '../../src/bridges/be59-ac-josephson-confrontation.js';
import { CONFRONTATIONS } from '../../src/bridges/confrontations.js';
import { DATA_CONFRONTED_IDS } from '../../src/bridges/confrontation-coverage.js';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';

describe('BE-59 AC Josephson effect', () => {
  it('K_J = 2e/h ≈ 483597.8484 GHz/V; f = K_J·V linear', () => {
    expect(JOSEPHSON_CONSTANT_SI / 1e9).toBeCloseTo(483597.8484, 3);
    const r = evaluateACJosephson({ V_volts: 1e-3 });
    expect(r.f_Hz).toBeCloseTo(JOSEPHSON_CONSTANT_SI * 1e-3, 3);
    expect(evaluateACJosephson({ V_volts: 2e-3 }).f_Hz).toBeCloseTo(2 * r.f_Hz, 3);
  });

  it('rejects non-finite voltage', () => {
    expect(() => evaluateACJosephson({ V_volts: NaN })).toThrow();
  });

  it('confronts junction UNIVERSALITY (non-circular), metrology triangle', () => {
    const r = confrontBE59();
    expect(r.consistent).toBe(true);
    expect(r.observation.provenance.note).toMatch(/non-circular|universality/i);
    expect(CONFRONTATIONS.get(59)?.kind).toBe('consistency');
    expect(DATA_CONFRONTED_IDS.has(59)).toBe(true);
  });

  it('catalog entry: established, frequency signature, metrology deps [55,58]', () => {
    const e = BRIDGE_EQUATIONS.find((b) => b.id === 59)!;
    expect(e.status).toBe('established');
    expect(e.dimensional_signature).toBe('[frequency]');
    expect(e.dependencies).toEqual(expect.arrayContaining([55, 58]));
  });
});
