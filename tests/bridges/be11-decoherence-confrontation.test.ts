/**
 * BE-11 × collisional-decoherence confrontation (Hornberger 2003). Pins the
 * parameter-free 9-gas agreement within the 15% experimental tolerance, the
 * primary-source-verified provenance (numbers NOT from the reviewers, who
 * fabricated cross-sections absent from the paper), and the registry wiring
 * (DATA_CONFRONTED_IDS now 9).
 *
 * @module tests/bridges/be11-decoherence-confrontation
 */
import { describe, it, expect } from 'vitest';
import {
  confrontBE11,
  DECOHERENCE_EXPERIMENTAL_TOLERANCE,
  COLLISIONAL_HORNBERGER_2003,
} from '../../src/bridges/be11-decoherence-confrontation.js';
import { CONFRONTATIONS, runConfrontation } from '../../src/bridges/confrontations.js';
import { DATA_CONFRONTED_IDS } from '../../src/bridges/confrontation-coverage.js';

describe('BE-11 collisional-decoherence confrontation', () => {
  it('the parameter-free theory agrees with 9-gas experiment within the 15% tolerance', () => {
    const r = confrontBE11();
    expect(r.observation.gasCount).toBe(9);
    expect(DECOHERENCE_EXPERIMENTAL_TOLERANCE).toBeCloseTo(0.15, 6);
    expect(r.fractional_gap).toBeLessThanOrEqual(r.observation.tolerance);
    expect(r.withinTolerance).toBe(true);
  });

  it('cites Hornberger 2003 and records the parameter-free, primary-verified provenance', () => {
    const r = confrontBE11();
    expect(r.observation).toBe(COLLISIONAL_HORNBERGER_2003);
    expect(r.observation.provenance.citation).toMatch(/Hornberger/);
    expect(r.observation.provenance.note).toMatch(/no adjustable parameters/);
    // the honesty record: numbers verified against the source, not the reviewers
    expect(r.observation.provenance.note).toMatch(/verified against the arXiv source/);
  });

  it('is registered as a consistency confrontation (DATA_CONFRONTED_IDS now 9)', () => {
    expect(CONFRONTATIONS.has(11)).toBe(true);
    expect(CONFRONTATIONS.get(11)?.kind).toBe('consistency');
    expect(DATA_CONFRONTED_IDS.has(11)).toBe(true);
    expect(DATA_CONFRONTED_IDS.size).toBe(9);
    const out = runConfrontation(11);
    expect(out?.kind).toBe('consistency');
    if (out?.kind === 'consistency') {
      expect(out.predicted).toBe(1);
      expect(out.approaches).toBe(1);
    }
  });
});
