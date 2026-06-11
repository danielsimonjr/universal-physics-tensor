/**
 * BE-23 × overdoped-cuprate Planckian dissipation — second real-data
 * confrontation (follows the BE-36 × GW170817 test pattern).
 *
 * Pins: encoded literals (self-consistency with the aggregate-level
 * Legros et al. 2019 record), the O(1)-band verdict, the honest-note
 * presence, input validation, and one cross-check against the BE-23
 * evaluator at a parameter point computed in-test from the SAME
 * constants the module uses.
 */
import { describe, it, expect } from 'vitest';
import {
  confrontBE23,
  confrontBE23WithUncertainty,
  PLANCKIAN_CUPRATES,
  PLANCKIAN_O1_BAND,
} from '../../src/bridges/be23-planckian-confrontation.js';
import { evaluateSYKResistivity } from '../../src/bridges/equations/be-23-syk-planckian.js';
import { PhysicalConstants } from '../../src/core/types.js';

const relErr = (actual: number, expected: number): number =>
  Math.abs(actual - expected) / Math.abs(expected);

describe('PLANCKIAN_CUPRATES — encoded literals (aggregate honesty level)', () => {
  it('encodes the conservative aggregate α = 1.0 ± 0.4, not per-material rows', () => {
    expect(PLANCKIAN_CUPRATES.alpha_aggregate).toBe(1.0);
    expect(PLANCKIAN_CUPRATES.alpha_aggregate_err).toBe(0.4);
    expect(PLANCKIAN_CUPRATES.perMaterialAlphas).toBeNull();
    expect(PLANCKIAN_CUPRATES.encodingHonestyLevel).toBe('aggregate');
  });

  it('names the four cuprate families of the study and carries the citation', () => {
    expect(PLANCKIAN_CUPRATES.materials).toEqual([
      'Bi2212',
      'Bi2201',
      'LSCO',
      'Nd-LSCO',
    ]);
    expect(PLANCKIAN_CUPRATES.citation).toContain('Legros');
    expect(PLANCKIAN_CUPRATES.citation).toContain('1805.02512');
    expect(PLANCKIAN_CUPRATES.citation).toContain('Nature Phys. 15:142');
  });

  it('carries the honesty note saying the per-material table was NOT reproduced', () => {
    expect(PLANCKIAN_CUPRATES.honestyNote).toContain('not reproduced');
    expect(PLANCKIAN_CUPRATES.honestyNote).toContain('AGGREGATE');
  });
});

describe('confrontBE23 — Planckian-band verdict and honest findings', () => {
  const result = confrontBE23();

  it('the published aggregate α lies within the O(1) band [0.5, 2]', () => {
    expect(PLANCKIAN_O1_BAND).toEqual([0.5, 2]);
    expect(result.planckianBand).toEqual([0.5, 2]);
    expect(result.withinPlanckianBand).toBe(true);
    expect(result.alphaAggregate).toBeGreaterThanOrEqual(0.5);
    expect(result.alphaAggregate).toBeLessThanOrEqual(2);
  });

  it('echoes the observation record and its aggregate-only honesty markers', () => {
    expect(result.alphaAggregate).toBe(1.0);
    expect(result.alphaAggregateErr).toBe(0.4);
    expect(result.perMaterialAlphas).toBeNull();
    expect(result.observation).toBe(PLANCKIAN_CUPRATES);
  });

  it('note states aggregate-only encoding and disclaims an SYK prediction of α', () => {
    expect(result.note).toContain('AGGREGATE');
    expect(result.note).toContain('per-material');
    expect(result.note).toContain('speculative');
    // The band is UPT's operationalization, not a published number.
    expect(result.note).toContain('not a published number');
  });

  it('planckianRateAt(T) = α·k_B·T/ℏ — recomputed in-test from the same constants', () => {
    const { kB, hbar } = PhysicalConstants;
    const expected300 = (1.0 * kB * 300) / hbar; // α = 1 aggregate
    expect(relErr(result.planckianRateAt(300), expected300)).toBeLessThanOrEqual(
      1e-12,
    );
    // Linear in T (the encoded form's defining property).
    expect(
      relErr(result.planckianRateAt(200), 2 * result.planckianRateAt(100)),
    ).toBeLessThanOrEqual(1e-12);
    expect(result.planckianRateAt(0)).toBe(0);
  });

  it('rejects malformed observations and temperatures', () => {
    expect(() =>
      confrontBE23({ ...PLANCKIAN_CUPRATES, alpha_aggregate: -1 }),
    ).toThrow(RangeError);
    expect(() =>
      confrontBE23({ ...PLANCKIAN_CUPRATES, alpha_aggregate: NaN }),
    ).toThrow(RangeError);
    expect(() => confrontBE23({ ...PLANCKIAN_CUPRATES, materials: [] })).toThrow(
      RangeError,
    );
    expect(() =>
      confrontBE23({
        ...PLANCKIAN_CUPRATES,
        perMaterialAlphas: [{ material: 'X', alpha: -0.5, alpha_err: 0.1 }],
      }),
    ).toThrow(RangeError);
    expect(() => result.planckianRateAt(-1)).toThrow(RangeError);
    expect(() => result.planckianRateAt(NaN)).toThrow(RangeError);
  });
});

describe('confrontBE23 — cross-check against the BE-23 evaluator', () => {
  it('evaluator thermal term ≡ Drude × Planckian rate at a literature-scale point', () => {
    // Parameter point computed in-test from the SAME constants the
    // module uses (PhysicalConstants). m* = electron mass scale,
    // n_e = 1e28 m⁻³, T = 100 K — illustrative magnitudes; the
    // identity is structural and holds for any positive values.
    const { kB, hbar, e } = PhysicalConstants;
    const m_star_kg = 9.1093837015e-31;
    const n_e_per_m3 = 1e28;
    const T_K = 100;
    const alpha = PLANCKIAN_CUPRATES.alpha_aggregate;

    const viaEvaluator = evaluateSYKResistivity({
      rho_0: 0,
      m_star_kg,
      n_e_per_m3,
      T_K,
      alpha_SYK: alpha,
    });
    const planckianRate = (alpha * kB * T_K) / hbar; // ℏ/τ = α·k_B·T
    const viaDrude = (m_star_kg / (n_e_per_m3 * e * e)) * planckianRate;

    expect(relErr(viaEvaluator, viaDrude)).toBeLessThanOrEqual(1e-12);
    // And the module's own structural check agrees.
    const result = confrontBE23();
    expect(result.encodedFormConsistent).toBe(true);
    expect(result.encodedFormRelErr).toBeLessThanOrEqual(1e-12);
    // Cross-check the module's rate accessor against the evaluator too.
    expect(
      relErr(
        (m_star_kg / (n_e_per_m3 * e * e)) * result.planckianRateAt(T_K),
        viaEvaluator,
      ),
    ).toBeLessThanOrEqual(1e-12);
  });

  it('ρ_0 enters additively, untouched by the Planckian term (encoded + form)', () => {
    const m_star_kg = 9.1093837015e-31;
    const n_e_per_m3 = 1e28;
    const T_K = 100;
    const alpha = PLANCKIAN_CUPRATES.alpha_aggregate;
    const thermalOnly = evaluateSYKResistivity({
      rho_0: 0,
      m_star_kg,
      n_e_per_m3,
      T_K,
      alpha_SYK: alpha,
    });
    const withResidual = evaluateSYKResistivity({
      rho_0: 1e-8,
      m_star_kg,
      n_e_per_m3,
      T_K,
      alpha_SYK: alpha,
    });
    expect(relErr(withResidual, thermalOnly + 1e-8)).toBeLessThanOrEqual(1e-12);
  });
});

describe('confrontBE23WithUncertainty — α_err propagation', () => {
  const result = confrontBE23WithUncertainty();

  it('propagates σ_rate(T) = σ_α·k_B·T/ℏ (linear in α)', () => {
    const { kB, hbar } = PhysicalConstants;
    expect(result.alphaSigma).toBe(0.4);
    const expected = (0.4 * kB * 100) / hbar;
    expect(
      relErr(result.planckianRateSigmaAt(100), expected),
    ).toBeLessThanOrEqual(1e-12);
  });

  it('the full ±1σ interval [0.6, 1.4] sits inside the O(1) band [0.5, 2]', () => {
    expect(result.withinPlanckianBandAtOneSigma).toBe(true);
    expect(result.alphaAggregate - result.alphaSigma).toBeGreaterThanOrEqual(0.5);
    expect(result.alphaAggregate + result.alphaSigma).toBeLessThanOrEqual(2);
  });

  it('extends the base result (band verdict, honesty fields intact)', () => {
    expect(result.withinPlanckianBand).toBe(true);
    expect(result.encodedFormConsistent).toBe(true);
    expect(result.perMaterialAlphas).toBeNull();
    expect(result.note).toContain('AGGREGATE');
  });

  it('rejects invalid α_err and temperatures', () => {
    expect(() =>
      confrontBE23WithUncertainty({
        ...PLANCKIAN_CUPRATES,
        alpha_aggregate_err: -0.1,
      }),
    ).toThrow(RangeError);
    expect(() =>
      confrontBE23WithUncertainty({
        ...PLANCKIAN_CUPRATES,
        alpha_aggregate_err: NaN,
      }),
    ).toThrow(RangeError);
    expect(() => result.planckianRateSigmaAt(-5)).toThrow(RangeError);
  });
});
