/**
 * Atlas Phase 4, S4.5 — the wave family: models, bridges, and the witnesses
 * WS1, WS2, WS3, WS3b, WS4 and WS4b.
 *
 * Design note: `docs/planning/Atlas-Phase-4-Design.md` §4.
 *
 * Every number asserted here was measured at three or more resolutions before
 * a tolerance was written, and is recomputed from scratch rather than read back
 * from the results artifact (Eve E4: "recompute two wave witness numbers").
 */

import { describe, expect, it } from 'vitest';
import { WAVES_FAMILY } from '../../src/atlas/waves/index.js';
import {
  BRIDGE_KLEIN_GORDON_WAVE,
  BRIDGE_SOUND_SPEED,
  KG_MAX_DISPERSION_RATIO,
  SOUND_MAX_PERTURBATION,
} from '../../src/atlas/waves/bridges.js';
import {
  acousticLeapfrogQuarter,
  adiabaticSlope,
  dalembertResidual,
  kleinGordonPhaseError,
  kleinGordonPhaseVelocity,
  soundSpeeds,
  stringLeapfrogMidpoint,
} from '../../src/atlas/waves/numerics.js';
import {
  WS1_FIXTURE,
  WS2_FIXTURE,
  WS3_FIXTURE,
  WS4_FIXTURE,
} from '../../src/atlas/witness-specs.js';
import { admitApproximation, regimeHolds } from '../../src/atlas/regime.js';

describe('wave family — structure', () => {
  it('has six models, four bridges, and the relation types restriction, derivation, approximation', () => {
    expect(WAVES_FAMILY.models).toHaveLength(6);
    expect(WAVES_FAMILY.bridges.map((b) => [b.id, b.relation])).toEqual([
      ['ab-string-wave', 'restriction'],
      ['ab-wave-dalembert', 'derivation'],
      ['ab-sound-speed', 'derivation'],
      ['ab-klein-gordon-wave', 'approximation'],
    ]);
  });

  it('the sound-speed bridge is a HYPEREDGE: two premises, one conclusion', () => {
    expect(BRIDGE_SOUND_SPEED.premises).toEqual(['model-euler-linear', 'model-adiabatic-eos']);
    expect(BRIDGE_SOUND_SPEED.conclusion).toBe('model-sound');
  });

  it('every bridge is admitted, and every inequality names a derived group', () => {
    for (const b of WAVES_FAMILY.bridges) {
      expect(admitApproximation(b)).toBe(b);
      for (const ineq of b.regime.inequalities) {
        expect(Object.keys(b.regime.groupDefinitions)).toContain(ineq.group);
      }
    }
  });

  it('the small-perturbation and dispersion-free regimes evaluate as stated', () => {
    expect(SOUND_MAX_PERTURBATION).toBe(0.01);
    expect(regimeHolds(BRIDGE_SOUND_SPEED.regime, { 'p0 · p1^-1': 1000 }).ok).toBe(true);
    expect(regimeHolds(BRIDGE_SOUND_SPEED.regime, { 'p0 · p1^-1': 10 }).ok).toBe(false);
    expect(regimeHolds(BRIDGE_KLEIN_GORDON_WAVE.regime, { 'c · omega0^-1 · k': 20 }).ok).toBe(true);
    expect(regimeHolds(BRIDGE_KLEIN_GORDON_WAVE.regime, { 'c · omega0^-1 · k': 2 }).ok).toBe(false);
  });
});

describe('WS1 — string → 1-D wave, solved in the string’s own variables', () => {
  const c = Math.sqrt(WS1_FIXTURE.tension / WS1_FIXTURE.mu);
  const target = Math.cos(Math.PI * c * WS1_FIXTURE.tEnd);

  it('the error at 40 and 80 cells is 3.456e-4 and 8.640e-5 — ≈4 per halving', () => {
    const coarse = Math.abs(stringLeapfrogMidpoint(40, WS1_FIXTURE) - target);
    const fine = Math.abs(stringLeapfrogMidpoint(80, WS1_FIXTURE) - target);
    expect(coarse).toBeCloseTo(3.45625e-4, 8);
    expect(fine).toBeCloseTo(8.63961e-5, 9);
    expect(coarse / fine).toBeGreaterThan(3.9);
    expect(coarse / fine).toBeLessThan(4.1);
  });

  it('NEGATIVE CONTROL: the wrong dictionary c² = Fμ misses the string solution by far more than 2e-4', () => {
    const wrongC = Math.sqrt(WS1_FIXTURE.tension * WS1_FIXTURE.mu);
    const wrong = Math.cos(Math.PI * wrongC * WS1_FIXTURE.tEnd);
    expect(Math.abs(stringLeapfrogMidpoint(80, WS1_FIXTURE) - wrong)).toBeGreaterThan(0.5);
  });
});

describe('WS2 — the d’Alembert form satisfies the wave equation', () => {
  it('the residual falls 4.496e-3 → 1.125e-3 as h halves (≈4)', () => {
    const coarse = dalembertResidual(4, WS2_FIXTURE);
    const fine = dalembertResidual(8, WS2_FIXTURE);
    expect(coarse).toBeCloseTo(4.49641e-3, 7);
    expect(fine).toBeCloseTo(1.12495e-3, 7);
    expect(coarse / fine).toBeGreaterThan(3.9);
    expect(coarse / fine).toBeLessThan(4.1);
  });
});

describe('WS3 — linearized Euler + adiabatic EOS → sound (the hyperedge)', () => {
  const cs = Math.sqrt((WS3_FIXTURE.gamma * WS3_FIXTURE.p0) / WS3_FIXTURE.rho0);
  const target = Math.cos(2 * Math.PI * cs * WS3_FIXTURE.tEnd);

  it('the EOS premise’s slope at ρ₀ is γp₀/ρ₀ exactly', () => {
    expect(adiabaticSlope(WS3_FIXTURE.rho0, WS3_FIXTURE)).toBeCloseTo(
      (WS3_FIXTURE.gamma * WS3_FIXTURE.p0) / WS3_FIXTURE.rho0,
      15,
    );
  });

  it('the error at 64 and 128 cells is 4.510e-4 and 1.120e-4 — ≈4 per halving', () => {
    const coarse = Math.abs(acousticLeapfrogQuarter(64, WS3_FIXTURE) - target);
    const fine = Math.abs(acousticLeapfrogQuarter(128, WS3_FIXTURE) - target);
    expect(coarse).toBeCloseTo(4.51007e-4, 8);
    expect(fine).toBeCloseTo(1.11994e-4, 8);
    expect(coarse / fine).toBeGreaterThan(3.9);
    expect(coarse / fine).toBeLessThan(4.1);
  });

  it('NEGATIVE CONTROL: the ISOTHERMAL target cos(2π√(p₀/ρ₀) t) misses by 0.28', () => {
    const iso = Math.cos(2 * Math.PI * Math.sqrt(WS3_FIXTURE.p0 / WS3_FIXTURE.rho0) * WS3_FIXTURE.tEnd);
    expect(Math.abs(acousticLeapfrogQuarter(128, WS3_FIXTURE) - iso)).toBeGreaterThan(0.28);
  });
});

describe('WS3b — Newton versus Laplace for air at 20 °C', () => {
  it('adiabatic 343.25 m/s, isothermal 290.10 m/s — the isothermal closure is 15% low', () => {
    const { adiabatic, isothermal } = soundSpeeds(101325, 1.204, 1.4);
    expect(adiabatic).toBeCloseTo(343.2488, 3);
    expect(isothermal).toBeCloseTo(290.0982, 3);
    expect(1 - isothermal / adiabatic).toBeCloseTo(1 - 1 / Math.sqrt(1.4), 12);
  });
});

describe('WS4 — Klein–Gordon → 1-D wave, the dispersion-free limit', () => {
  it('the phase-velocity error at k = 10 and 20 is 4.988e-3 and 1.249e-3 — ≈4 per doubling', () => {
    const coarse = kleinGordonPhaseVelocity(1, WS4_FIXTURE.omega0, WS4_FIXTURE.c, WS4_FIXTURE.k0) - 1;
    const fine = kleinGordonPhaseVelocity(2, WS4_FIXTURE.omega0, WS4_FIXTURE.c, WS4_FIXTURE.k0) - 1;
    expect(coarse).toBeCloseTo(4.98756e-3, 8);
    expect(fine).toBeCloseTo(1.24922e-3, 8);
    expect(coarse / fine).toBeGreaterThan(3.9);
  });

  it('the declared delta IS the exact error at the domain edge, and deltaAt never exceeds it inside', () => {
    const bound = BRIDGE_KLEIN_GORDON_WAVE.bound!;
    expect(bound.delta).toBe(kleinGordonPhaseError(KG_MAX_DISPERSION_RATIO, 1, 1));
    for (const ratio of [0.01, 0.05, 0.099, 0.1]) {
      expect(bound.deltaAt!({ omega0: ratio, c: 1, k: 1 })).toBeLessThanOrEqual(bound.delta);
    }
  });

  it('the horizon is the π/2-drift time: true well inside, false beyond', () => {
    const bound = BRIDGE_KLEIN_GORDON_WAVE.bound!;
    const params = { omega0: 1, c: 1, k: 10 };
    const tStar = Math.PI / (2 * 10 * kleinGordonPhaseError(1, 1, 10));
    expect(bound.horizonHolds(0.5 * tStar, params)).toBe(true);
    expect(bound.horizonHolds(2 * tStar, params)).toBe(false);
    expect(bound.horizonHolds(1, {})).toBe(false);
  });
});

describe('WS4b — the limit fails for long waves', () => {
  it('at ω₀/(ck) = 1 the relative phase error is √2 − 1', () => {
    expect(kleinGordonPhaseError(1, 1, 1)).toBeCloseTo(Math.SQRT2 - 1, 15);
    expect(BRIDGE_KLEIN_GORDON_WAVE.counterexamples[0]?.witness).toBe('WS4b');
  });
});
