/**
 * Atlas Phase 4, S4.4 — the diffusion family: models, bridges, and the
 * witnesses WD1, WD1b, WD2, WD3 and WD3b.
 *
 * Design note: `docs/planning/Atlas-Phase-4-Design.md` §4.
 *
 * The convergence numbers asserted here were MEASURED at several resolutions
 * before any tolerance was written; they are recomputed from scratch, never
 * read back from the results artifact (Eve E4: "recompute two diffusion
 * witness numbers").
 */

import { describe, expect, it } from 'vitest';
import { DIFFUSION_FAMILY } from '../../src/atlas/diffusion/index.js';
import {
  BRIDGE_HEAT_DIFFUSION,
  BRIDGE_SCHRODINGER_DIFFUSION,
  BRIDGE_WALK_DIFFUSION,
  WALK_MAX_STEP_FRACTION,
} from '../../src/atlas/diffusion/bridges.js';
import {
  DENSITY,
  DIFFUSIVITY,
  SPECIFIC_HEAT,
  THERMAL_CONDUCTIVITY,
} from '../../src/atlas/diffusion/dimensions.js';
import { getDiffusionModel } from '../../src/atlas/diffusion/models.js';
import {
  diffusionKernel,
  gaussianSpread,
  heatFtcsCentre,
  randomWalkCentralDensity,
  randomWalkDensity,
  wickHeatResidual,
  wickKernelSquaredNorm,
} from '../../src/atlas/diffusion/numerics.js';
import { WD1_FIXTURE, WD2_FIXTURE, WD3_FIXTURE } from '../../src/atlas/witness-specs.js';
import { wickRotatedFreeKernel } from '../../src/atlas/witnesses/quantum-support.js';
import { admitApproximation, regimeHolds } from '../../src/atlas/regime.js';
import { canonicalById } from '../../src/canonical/registry.js';
import { equals } from '../../src/dimensional/algebra.js';
import { validate } from '../../src/dimensional/validator.js';

describe('diffusion family — structure', () => {
  it('opens with the four S4.4 models and three S4.4 bridges, of three distinct relation types', () => {
    // The Sprint 4 closure appends to both lists (tests/atlas/closure.test.ts).
    expect(DIFFUSION_FAMILY.models.slice(0, 4).map((m) => m.id)).toEqual([
      'model-random-walk',
      'model-fick',
      'model-heat',
      'model-schrodinger-free',
    ]);
    expect(DIFFUSION_FAMILY.bridges.slice(0, 3).map((b) => b.relation)).toEqual([
      'coarse-graining',
      'exact-equivalence',
      'analytic-continuation',
    ]);
  });

  it('every bridge PREMISE is a model of this family (conclusions may cross families)', () => {
    // ab-telegraph-wave ends at the oscillator family's model-wave-1d; endpoint
    // resolution across the whole atlas is pinned in families.test.ts.
    const ids = new Set(DIFFUSION_FAMILY.models.map((m) => m.id));
    for (const b of DIFFUSION_FAMILY.bridges) {
      for (const p of b.premises) expect(ids.has(p)).toBe(true);
    }
  });

  it('every regime inequality names a DERIVED group, never a hand-written one', () => {
    for (const b of DIFFUSION_FAMILY.bridges) {
      for (const ineq of b.regime.inequalities) {
        expect(Object.keys(b.regime.groupDefinitions)).toContain(ineq.group);
      }
    }
  });

  it('the Fourier number is derived on the heat bridge, from the dimension matrix', () => {
    expect(Object.keys(BRIDGE_HEAT_DIFFUSION.regime.groupDefinitions)).toContain(
      'kappa · rho^-1 · cp^-1 · ell^-2 · t',
    );
  });

  it('every bridge is admitted, and the exact equivalence carries an inverse', () => {
    for (const b of DIFFUSION_FAMILY.bridges) expect(admitApproximation(b)).toBe(b);
    expect(BRIDGE_HEAT_DIFFUSION.inverse).toBeDefined();
  });

  it('model-heat cites CE-thermal-diffusivity, and that entry is α = κ/(ρ c_p) in the SAME dimensions', () => {
    expect(getDiffusionModel('model-heat').canonicalRefs).toEqual(['CE-thermal-diffusivity']);
    const ce = canonicalById('CE-thermal-diffusivity');
    expect(ce).toBeDefined();
    const inferred = validate(ce!.scalarAst!).inferredDimension;
    expect(inferred).not.toBeNull();
    expect(equals(inferred!, DIFFUSIVITY)).toBe(true);
  });

  it('the redefined dimensions are κ/(ρ c_p) = diffusivity', () => {
    const ratio = {
      L: THERMAL_CONDUCTIVITY.L - DENSITY.L - SPECIFIC_HEAT.L,
      M: THERMAL_CONDUCTIVITY.M - DENSITY.M - SPECIFIC_HEAT.M,
      T: THERMAL_CONDUCTIVITY.T - DENSITY.T - SPECIFIC_HEAT.T,
      I: 0,
      Theta: THERMAL_CONDUCTIVITY.Theta - DENSITY.Theta - SPECIFIC_HEAT.Theta,
      N: 0,
      J: 0,
    };
    expect(equals(ratio, DIFFUSIVITY)).toBe(true);
  });
});

describe('WD1 — random walk → diffusion, with convergence', () => {
  const target = diffusionKernel(0, WD1_FIXTURE.t, WD1_FIXTURE.D);

  it('the target is (4πDt)^-1/2 = 1/√(4π) at D = 0.5, t = 2', () => {
    expect(target).toBeCloseTo(1 / Math.sqrt(4 * Math.PI), 15);
  });

  it('the error at 100 and 1000 steps is 7.043e-4 and 7.051e-5 — a factor of ≈10 per 10× steps', () => {
    const coarse = Math.abs(randomWalkCentralDensity(100, WD1_FIXTURE.D, WD1_FIXTURE.t) - target);
    const fine = Math.abs(randomWalkCentralDensity(1000, WD1_FIXTURE.D, WD1_FIXTURE.t) - target);
    expect(coarse).toBeCloseTo(7.04344e-4, 8);
    expect(fine).toBeCloseTo(7.05149e-5, 9);
    expect(coarse / fine).toBeGreaterThan(9.9);
    expect(coarse / fine).toBeLessThan(10.1);
  });

  it('the regime ceiling is the coarse resolution: Δt/t = 1/100', () => {
    expect(WALK_MAX_STEP_FRACTION).toBe(0.01);
    expect(regimeHolds(BRIDGE_WALK_DIFFUSION.regime, { 'dt · t^-1': 0.001 }).ok).toBe(true);
    expect(regimeHolds(BRIDGE_WALK_DIFFUSION.regime, { 'dt · t^-1': 0.1 }).ok).toBe(false);
  });
});

describe('WD1b — the walk has a light cone and diffusion does not', () => {
  it('after 100 steps the walk density is exactly 0 at site 101 while the kernel is positive', () => {
    const { D, t } = WD1_FIXTURE;
    expect(randomWalkDensity(101, 100, D, t)).toBe(0);
    const dx = Math.sqrt((2 * D * t) / 100);
    expect(diffusionKernel(101 * dx, t, D)).toBeGreaterThan(0);
  });

  it('wrong-parity sites are empty too — the other half of what coarse-graining discards', () => {
    expect(randomWalkDensity(1, 100, WD1_FIXTURE.D, WD1_FIXTURE.t)).toBe(0);
    expect(randomWalkDensity(0, 100, WD1_FIXTURE.D, WD1_FIXTURE.t)).toBeGreaterThan(0);
  });
});

describe('WD2 — heat ↔ Fick, the heat equation solved in its own variables', () => {
  const D = WD2_FIXTURE.kappa / (WD2_FIXTURE.rho * WD2_FIXTURE.cp);
  const target = gaussianSpread(0, WD2_FIXTURE.tEnd, D, WD2_FIXTURE.s0);

  it('the target is √(s0/(s0 + Dt)) = √(0.05/0.25) at D = κ/(ρ c_p) = 1', () => {
    expect(D).toBe(1);
    expect(target).toBeCloseTo(Math.sqrt(0.2), 15);
  });

  it('the error at 80 and 160 cells is 4.476e-4 and 1.118e-4 — a factor of ≈4 per halving', () => {
    const coarse = Math.abs(heatFtcsCentre(80, WD2_FIXTURE) - target);
    const fine = Math.abs(heatFtcsCentre(160, WD2_FIXTURE) - target);
    expect(coarse).toBeCloseTo(4.47584e-4, 8);
    expect(fine).toBeCloseTo(1.11827e-4, 8);
    expect(coarse / fine).toBeGreaterThan(3.9);
    expect(coarse / fine).toBeLessThan(4.1);
  });

  it('NEGATIVE CONTROL: the wrong dictionary D = κρ/c_p misses by 0.32, far outside the 5e-4 tolerance', () => {
    const wrong = gaussianSpread(
      0,
      WD2_FIXTURE.tEnd,
      (WD2_FIXTURE.kappa * WD2_FIXTURE.rho) / WD2_FIXTURE.cp,
      WD2_FIXTURE.s0,
    );
    expect(Math.abs(heatFtcsCentre(160, WD2_FIXTURE) - wrong)).toBeGreaterThan(0.3);
  });
});

describe('WD3 — free Schrödinger → diffusion by Wick rotation, with convergence', () => {
  it('the residual of ∂τφ = (ħ/2m)∂²φ falls from 3.27e-3 to 2.03e-4 as h goes 0.1 → 0.025 (≈16 = 4²)', () => {
    const coarse = wickHeatResidual(1, WD3_FIXTURE, wickRotatedFreeKernel);
    const fine = wickHeatResidual(4, WD3_FIXTURE, wickRotatedFreeKernel);
    expect(coarse).toBeCloseTo(3.26623e-3, 7);
    expect(fine).toBeCloseTo(2.02740e-4, 8);
    expect(coarse / fine).toBeGreaterThan(15.5);
    expect(coarse / fine).toBeLessThan(16.5);
  });

  it('NEGATIVE CONTROL: with the wrong diffusivity ħ/m the residual does NOT vanish', () => {
    // Doubling ħ in the coefficient only (not in the kernel) is the dictionary
    // D = ħ/m. The residual must stay large as h shrinks.
    const wrong = { ...WD3_FIXTURE };
    const h = wrong.h0 / 64;
    const phi = (x: number, tau: number) =>
      wickRotatedFreeKernel(x, tau, wrong.s, wrong.hbar, wrong.m);
    const dTau = (phi(wrong.x, wrong.tau + h) - phi(wrong.x, wrong.tau - h)) / (2 * h);
    const dXX =
      (phi(wrong.x + h, wrong.tau) - 2 * phi(wrong.x, wrong.tau) + phi(wrong.x - h, wrong.tau)) /
      (h * h);
    expect(Math.abs(dTau - (wrong.hbar / wrong.m) * dXX)).toBeGreaterThan(0.1);
  });
});

describe('WD3b — the continuation does not preserve unitarity', () => {
  it('∫φ² dx matches s²√(2π/σ(τ)) and DECREASES in τ', () => {
    const { s, hbar, m } = WD3_FIXTURE;
    const exact = (tau: number) => s * s * Math.sqrt((2 * Math.PI) / (s * s + (hbar * tau) / (2 * m)));
    const values = [0, 1, 4].map((tau) => wickKernelSquaredNorm(tau, WD3_FIXTURE, wickRotatedFreeKernel));
    [0, 1, 4].forEach((tau, i) => expect(Math.abs(values[i]! - exact(tau))).toBeLessThan(1e-9));
    expect(values[0]).toBeCloseTo(1.75464, 5);
    expect(values[2]).toBeCloseTo(0.579646, 5);
    expect(values[1]!).toBeLessThan(values[0]!);
    expect(values[2]!).toBeLessThan(values[1]!);
  });

  it('the counterexample text quotes the measured values', () => {
    expect(BRIDGE_SCHRODINGER_DIFFUSION.counterexamples[0]?.description).toContain('1.755');
    expect(BRIDGE_SCHRODINGER_DIFFUSION.counterexamples[0]?.description).toContain('0.580');
  });
});
