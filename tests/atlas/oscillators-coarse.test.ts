/**
 * W9 (dispersion + information loss) for the coarse-graining bridge, and
 * W3 (Buckingham survival) for the `ax-cubic-spring-lc` rejection.
 */

import { describe, expect, it } from 'vitest';
import { ATLAS_FAMILIES } from '../../src/atlas/families.js';

import { dim } from '../../src/dimensional/ast-builders.js';
import { buckinghamPi } from '../../src/dimensional/buckingham.js';
import { LENGTH, MASS } from '../../src/dimensional/types.js';
import {
  BRIDGE_CHAIN_WAVE,
  chainWaveSpeed,
  continuumDispersion,
  dispersionErrorApproximation,
  latticeBandEdge,
  latticeDispersion,
} from '../../src/atlas/oscillators/bridges-coarse.js';
import { CUBIC_STIFFNESS, SPRING_CONSTANT } from '../../src/atlas/oscillators/dimensions.js';
import { getAtlasModel } from '../../src/atlas/oscillators/models.js';
import { ATLAS_REJECTIONS } from '../../src/atlas/oscillators/rejections.js';

describe('W9 — chain → wave coarse-graining, dispersion', () => {
  const kappa = 1;
  const m = 1;
  const a = 1;

  it('matches the (qa)²/24 leading-order error within 0.5% of itself', () => {
    // Convention: with x = qa/2, 1 − sin x / x = x²/6 − x⁴/120, so (qa)²/24
    // OVERESTIMATES the true error and deviation = (true − approx)/approx is
    // NEGATIVE, ≈ −(qa)²/80. The assertion below is on the MAGNITUDE, so the
    // sign convention does not change it.
    for (const qa of [0.1, 0.2, 0.4]) {
      const q = qa / a;
      const wLattice = latticeDispersion(q, a, kappa, m);
      const wContinuum = continuumDispersion(q, a, kappa, m);
      const trueError = 1 - wLattice / wContinuum;
      const approx = dispersionErrorApproximation(qa);
      const deviation = (trueError - approx) / approx;

      expect(deviation).toBeLessThan(0); // the approximation overestimates
      expect(Math.abs(deviation)).toBeLessThan(0.005);
      // and the deviation itself is the next Taylor term, −(qa)²/80.
      expect(deviation).toBeCloseTo(-(qa * qa) / 80, 5);
    }
  });

  it('carries the wave speed c = a √(κ/m) into the continuum model', () => {
    expect(chainWaveSpeed(a, kappa, m)).toBeCloseTo(1, 12);
    expect(chainWaveSpeed(2, 8, 2)).toBeCloseTo(4, 12);
  });

  it('loses the band edge: ω(qa = π) = 2√(κ/m) on the lattice, unbounded in the continuum', () => {
    const q = Math.PI / a;
    expect(latticeDispersion(q, a, kappa, m)).toBeCloseTo(2 * Math.sqrt(kappa / m), 12);
    expect(latticeBandEdge(kappa, m)).toBeCloseTo(2, 12);

    // The continuum relation has no maximum: it grows without bound in q,
    // so no continuum wavenumber reproduces the lattice band edge.
    const edge = latticeBandEdge(kappa, m);
    for (const q2 of [10, 1e3, 1e6]) {
      expect(continuumDispersion(q2, a, kappa, m)).toBeGreaterThan(edge);
    }
    // Above the edge the lattice simply folds back; it never exceeds 2√(κ/m).
    for (let qa = 0; qa <= 4 * Math.PI; qa += Math.PI / 64) {
      expect(latticeDispersion(qa / a, a, kappa, m)).toBeLessThanOrEqual(edge + 1e-12);
    }
  });

  it('records the loss as a bridge field and a counterexample', () => {
    expect(BRIDGE_CHAIN_WAVE.relation).toBe('coarse-graining');
    expect(BRIDGE_CHAIN_WAVE.premises).toEqual(['model-chain']);
    expect(BRIDGE_CHAIN_WAVE.conclusion).toBe('model-wave-1d');
    expect(BRIDGE_CHAIN_WAVE.doesNotPreserve).toContain('modes with q > π/a');
    expect(BRIDGE_CHAIN_WAVE.sideConditions).toContain('long-wavelength, qa ≪ 1');
    expect(BRIDGE_CHAIN_WAVE.witnesses.map((w) => w.id)).toContain('W9');
    expect(BRIDGE_CHAIN_WAVE.counterexamples.map((c) => c.witness)).toContain('W9');
    // The premises and conclusion resolve to real models.
    expect(getAtlasModel('model-chain').id).toBe('model-chain');
    expect(getAtlasModel('model-wave-1d').id).toBe('model-wave-1d');
  });
});

describe('W3 — Buckingham survival, ax-cubic-spring-lc', () => {
  it('leaves the cubic spring exactly one group ∝ {β: 1, x0: 2, k: −1, m: 0}', () => {
    const result = buckinghamPi([
      { name: 'm', dim: MASS },
      { name: 'k', dim: SPRING_CONSTANT },
      { name: 'beta', dim: CUBIC_STIFFNESS },
      { name: 'x0', dim: LENGTH },
    ]);

    expect(result.verdict).toBe('single-invariant');
    expect(result.piGroups).toHaveLength(1);

    const e = result.piGroups[0].exponents;
    expect(e.beta).not.toBe(0);
    const scale = e.beta; // normalise so β carries exponent 1
    expect(e.x0 / scale).toBeCloseTo(2, 12);
    expect(e.k / scale).toBeCloseTo(-1, 12);
    expect(e.m / scale).toBeCloseTo(0, 12);
  });

  it('leaves the LC model dimensionally independent (no group at all)', () => {
    // The brief's variable set {L, C, q0}; q0 is charge, I·T.
    const withCharge = buckinghamPi([
      { name: 'L', dim: dim(2, 1, -2, -2) },
      { name: 'C', dim: dim(-2, -1, 4, 2) },
      { name: 'q0', dim: dim(0, 0, 1, 1) },
    ]);
    expect(withCharge.verdict).toBe('dimensionally-independent');

    // …and the model as the atlas actually declares it, {L, C}: same verdict.
    const declared = buckinghamPi(getAtlasModel('model-lc').parameters);
    expect(declared.verdict).toBe('dimensionally-independent');
  });

  it('records the rejection with witness W3', () => {
    const rejection = ATLAS_REJECTIONS.find((r) => r.id === 'ax-cubic-spring-lc');
    expect(rejection).toBeDefined();
    expect(rejection?.claimed).toBe('exact-equivalence');
    // The claimed relation runs cubic spring → LC; LC is the conclusion, not also a premise (D6).
    expect(rejection?.premises).toEqual(['model-cubic-spring']);
    expect(rejection?.conclusion).toBe('model-lc');
    expect(rejection?.survivingGroup).toBe('β x0² / k');
    expect(rejection?.witnesses.map((w) => w.id)).toContain('W3');
  });
});

describe('rejections — the conclusion is not also a premise (persona finding D6)', () => {
  const rejections = ATLAS_FAMILIES.flatMap((f) => f.rejections);

  it('the atlas has at least one rejection to check', () => {
    expect(rejections.length).toBeGreaterThan(0);
  });

  it.each(rejections.map((r) => [r.id, r] as const))('%s lists its conclusion only as the conclusion', (_id, r) => {
    expect(r.premises).not.toContain(r.conclusion);
  });
});
