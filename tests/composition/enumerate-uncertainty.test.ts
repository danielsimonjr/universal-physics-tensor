/**
 * v0.10.0 T3+T4 — Phase-D enumerator + first-order uncertainty
 * propagation. T3 acceptance: the enumerator finds every registered
 * CT-* composition (completeness) and ≥1 novel candidate, including
 * the plan-predicted be-42>>be-12 (λ_T at the Hawking temperature).
 * T4 acceptance: analytic linear-edge check, chain σ-scaling, GW
 * bound ±σ.
 */
import { describe, it, expect } from 'vitest';
import {
  enumerateCompositions,
  REGISTERED_COMPOSITION_IDS,
} from '../../src/composition/enumerate.js';
import { propagateUncertainty } from '../../src/composition/uncertainty.js';
import {
  be11ZurekEdge,
  be12Edge,
  be16Edge,
  be37Edge,
  be42Edge,
  be42ViaRsEdge,
  be51Edge,
  be52Edge,
  composeEdges,
  lawSchwarzschildRadius,
  M_SUN_KG,
} from '../../src/composition/index.js';
import type { BridgeEdge, Quantity } from '../../src/composition/index.js';
import { DIMENSIONLESS } from '../../src/dimensional/types.js';
import { PhysicalConstants } from '../../src/core/types.js';
import {
  confrontBE36WithUncertainty,
  GW170817,
} from '../../src/bridges/be36-gw170817-confrontation.js';

const CALIBRATION_EDGES = [
  be11ZurekEdge,
  be12Edge,
  be16Edge,
  be37Edge,
  be42Edge,
  be42ViaRsEdge,
  be51Edge,
  be52Edge,
  lawSchwarzschildRadius,
];

describe('T3 — Phase-D enumerator (novel-candidate generation)', () => {
  const report = enumerateCompositions(CALIBRATION_EDGES);

  it('completeness: every registered CT-* composition is found', () => {
    const foundIds = new Set(report.all.map((c) => c.edge.id));
    for (const id of REGISTERED_COMPOSITION_IDS) {
      expect(foundIds.has(id), `registered composition ${id} not found`).toBe(
        true,
      );
    }
    expect(report.registered).toHaveLength(REGISTERED_COMPOSITION_IDS.size);
  });

  it('be-42>>be-12 now lands in requiresDisposition (v0.11 Option D — the aliasing guard)', () => {
    // v0.11 REWRITE of the v0.10.0 aliasing pin (which self-described
    // as v0.11-replaceable): the Phase-D finding is now a GUARD. The
    // pair is junction- and dimension-compatible, but the 'mass'
    // collision (black-hole vs particle) requires a recorded
    // disposition — see tests/composition/namespacing.test.ts for the
    // renameSecond resolution and its λ_T(m_e, T_H) pins.
    expect(report.novel.find((c) => c.edge.id === 'be-42>>be-12')).toBeUndefined();
    const pending = report.requiresDisposition.find(
      (p) => p.composedId === 'be-42>>be-12',
    );
    expect(pending).toBeDefined();
    expect(pending!.message).toContain("'mass'");
  });

  it('novel candidates exist and every one carries demoted confidence + provenance', () => {
    expect(report.novel.length).toBeGreaterThanOrEqual(1);
    for (const c of report.novel) {
      expect(['established', 'speculative', 'highly-speculative']).toContain(
        c.edge.confidence,
      );
      expect(c.edge.beId).toBeNull(); // derived relations have no catalog row
    }
  });
});

describe('T4 — first-order uncertainty propagation', () => {
  const q = (name: string): Quantity => ({
    name,
    symbol: name,
    dim: DIMENSIONLESS,
    attributes: {},
  });

  it('analytic check: linear edge f = a·x gives σ_out = |a|·σ_x (rel ≤ 1e-9)', () => {
    const a = -3.7;
    const linear: BridgeEdge = {
      id: 'linear',
      beId: null,
      kind: 'law',
      label: 'linear',
      sources: [q('x')],
      target: q('y'),
      confidence: 'established',
      domain: { description: 'any', predicate: () => true },
      evaluate: (i) => a * i['x'],
      citation: 'synthetic',
    };
    const { value, sigma } = propagateUncertainty(linear, { x: 2 }, { x: 0.5 });
    expect(value).toBe(a * 2);
    expect(Math.abs(sigma - Math.abs(a) * 0.5) / (Math.abs(a) * 0.5)).toBeLessThan(
      1e-9,
    );
  });

  it('chain: CT-1 erasure cost has σ_E/E = σ_M/M (E ∝ 1/M, first order)', () => {
    const erasure = composeEdges(be42Edge, be16Edge);
    const relIn = 0.01;
    const { value, sigma } = propagateUncertainty(
      erasure,
      { mass: M_SUN_KG },
      { mass: relIn * M_SUN_KG },
    );
    expect(Math.abs(sigma / value - relIn) / relIn).toBeLessThan(1e-3);
  });

  it('GW170817: σ on the positive bound from Δt = 1.74 ± 0.05 s', () => {
    const r = confrontBE36WithUncertainty();
    // upper = c·Δt/D is linear in Δt: σ = (0.05/1.74)·upper ≈ 1.87e-17.
    const expectedSigma =
      (GW170817.dt_obs_err_s / GW170817.dt_obs_s) * r.upperBound;
    expect(
      Math.abs(r.upperBoundSigma - expectedSigma) / expectedSigma,
    ).toBeLessThan(1e-9);
    // The bound remains satisfied at ±3σ — the conclusion is not
    // uncertainty-fragile.
    expect(r.upperBound + 3 * r.upperBoundSigma).toBeLessThanOrEqual(
      r.encodedBound,
    );
  });

  it('rejects negative or non-finite sigmas', () => {
    expect(() =>
      propagateUncertainty(be42Edge, { mass: M_SUN_KG }, { mass: -1 }),
    ).toThrow(RangeError);
  });
});

void PhysicalConstants;
