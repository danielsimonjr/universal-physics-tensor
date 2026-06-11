/**
 * v0.8.0 Phase 2 — PRE-REGISTERED composition targets (P-3).
 *
 * These acceptance criteria were registered in
 * docs/planning/v0.8.0-Design.md §2 BEFORE the implementation existed:
 *
 *   CT-1  composeEdges(be42, be16):  E_min(M) = ℏc³ln2/(8πGM)
 *   CT-1b law-chain ≡ CT-1 ≡ closed form (laws as connective tissue)
 *   CT-2  α/Δφ = 2a(1−e²)/(3πb), independent of M
 *
 * Constants in the closed forms use PhysicalConstants — bit-identical
 * to src/core/constants.ts literals (verified in the Adam vet), so the
 * 1e-12 pins are exact-arithmetic comparisons, not fitted tolerances.
 */
import { describe, it, expect } from 'vitest';
import {
  be16Edge,
  be42Edge,
  be42ViaRsEdge,
  be51Edge,
  be52Edge,
  composeEdges,
  consistencyRatio,
  lawSchwarzschildRadius,
  M_SUN_KG,
} from '../../src/composition/index.js';
import { equals } from '../../src/dimensional/algebra.js';
import { TEMPERATURE } from '../../src/dimensional/types.js';
import { PhysicalConstants } from '../../src/core/types.js';

const { hbar, c, G, kB } = PhysicalConstants;

const relErr = (actual: number, expected: number): number =>
  Math.abs(actual - expected) / Math.abs(expected);

describe('CT-1 — erasure cost at the horizon (BE-42 ∘ BE-16, Part-IX C4)', () => {
  const erasureCost = composeEdges(be42Edge, be16Edge);

  it('matches E_min(M) = ℏc³ln2/(8πGM) to relErr ≤ 1e-12 at three masses', () => {
    for (const M of [M_SUN_KG, 10 * M_SUN_KG, 1e-8 * M_SUN_KG]) {
      const expected = (hbar * c ** 3 * Math.LN2) / (8 * Math.PI * G * M);
      expect(relErr(erasureCost.evaluate({ mass: M }), expected)).toBeLessThanOrEqual(
        1e-12,
      );
    }
  });

  it('junction is [temperature] via the registered T_H ≡ T identification', () => {
    expect(equals(be42Edge.target.dim, TEMPERATURE)).toBe(true);
    expect(be42Edge.target.name).toBe('hawking-temperature');
    expect(be16Edge.sources[0].name).toBe('temperature');
    // The compose succeeded only because QUANTITY_IDENTIFICATIONS
    // carries the reviewable judgment — pin the output shape too.
    expect(erasureCost.target.name).toBe('landauer-erasure-energy');
    expect(erasureCost.sources.map((s) => s.name)).toEqual(['mass']);
  });

  it('confidence demotes to highly-speculative (min, never average)', () => {
    expect(erasureCost.confidence).toBe('highly-speculative');
  });

  it('numerical anchor: E_min(M_sun) ≈ 5.90e-31 J', () => {
    // T_H(M_sun) ≈ 6.17e-8 K (BE-42 docstring anchor) × k_B ln2.
    const e = erasureCost.evaluate({ mass: M_SUN_KG });
    expect(e).toBeGreaterThan(5.8e-31);
    expect(e).toBeLessThan(6.0e-31);
  });

  it('composed domain rejects non-positive mass', () => {
    expect(() => erasureCost.evaluate({ mass: -1 })).toThrow();
  });
});

describe('CT-1b — three-edge chain through the Schwarzschild-radius LAW (P-1)', () => {
  const viaLaw = composeEdges(
    composeEdges(lawSchwarzschildRadius, be42ViaRsEdge),
    be16Edge,
  );
  const direct = composeEdges(be42Edge, be16Edge);

  it('law-mediated chain ≡ direct composition ≡ closed form (relErr ≤ 1e-12)', () => {
    for (const M of [M_SUN_KG, 10 * M_SUN_KG, 1e-8 * M_SUN_KG]) {
      const expected = (hbar * c ** 3 * Math.LN2) / (8 * Math.PI * G * M);
      const chain = viaLaw.evaluate({ mass: M });
      expect(relErr(chain, expected)).toBeLessThanOrEqual(1e-12);
      expect(relErr(chain, direct.evaluate({ mass: M }))).toBeLessThanOrEqual(
        1e-12,
      );
    }
  });

  it('the law edge is kind "law" and the chain is kind "bridge"', () => {
    expect(lawSchwarzschildRadius.kind).toBe('law');
    expect(viaLaw.kind).toBe('bridge');
  });

  it('chain confidence demotes through the established law to highly-speculative', () => {
    expect(viaLaw.confidence).toBe('highly-speculative');
  });
});

describe('CT-2 — weak-field consistency ratio (BE-51 / BE-52, Part-IX C5-adjacent)', () => {
  // Mercury-like orbit + solar-grazing impact parameter.
  const a_m = 5.79e10;
  const e = 0.2056;
  const b_m = 6.96e8;
  const closedForm = (2 * a_m * (1 - e * e)) / (3 * Math.PI * b_m);

  it('α/Δφ = 2a(1−e²)/(3πb) and is independent of M across 3 decades', () => {
    for (const M of [M_SUN_KG, 10 * M_SUN_KG, 100 * M_SUN_KG]) {
      const ratio = consistencyRatio(be51Edge, be52Edge, {
        mass: M,
        'impact-parameter': b_m,
        'semi-major-axis': a_m,
        eccentricity: e,
      });
      expect(relErr(ratio, closedForm)).toBeLessThanOrEqual(1e-12);
    }
  });

  it('validity domains enforce the weak field and bound orbits (G-8)', () => {
    // b below 10·r_s violates BE-51's weak-field domain.
    const heavyM = 1e6 * M_SUN_KG; // r_s ≈ 2.95e9 m > b/10
    expect(() =>
      consistencyRatio(be51Edge, be52Edge, {
        mass: heavyM,
        'impact-parameter': b_m,
        'semi-major-axis': a_m,
        eccentricity: e,
      }),
    ).toThrow();
    // e ≥ 1 violates BE-52's bound-orbit domain.
    expect(() =>
      consistencyRatio(be52Edge, be51Edge, {
        mass: M_SUN_KG,
        'impact-parameter': b_m,
        'semi-major-axis': a_m,
        eccentricity: 1.5,
      }),
    ).toThrow();
  });
});
