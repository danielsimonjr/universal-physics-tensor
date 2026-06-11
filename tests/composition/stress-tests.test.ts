/**
 * v0.10.0 T2 — Part-IX Phase C STRESS TESTS (pre-registered in
 * docs/planning/v0.10.0-Improvement-Plan.md §T2 BEFORE implementation).
 *
 * Phase C's bar: compositions that SHOULD fail must fail with the
 * framework NAMING the failure correctly — junction refusal vs
 * dimension refusal vs domain refusal are different physics claims and
 * must not blur. Two registered stress tests:
 *
 *   ST-1: λ_T (length) into Landauer's T slot — junction refusal, and
 *         the dimension functor refusing even a forced human override.
 *   ST-2: photon grazing AT r_s — type-checks, composes, and fails at
 *         the weak-field DOMAIN, correctly attributed.
 */
import { describe, it, expect } from 'vitest';
import {
  be12Edge,
  be16Edge,
  be51Edge,
  composeEdges,
  lawSchwarzschildRadius,
  M_SUN_KG,
  CompositionDimensionError,
  CompositionJunctionError,
  DomainViolationError,
} from '../../src/composition/index.js';

describe('ST-1 — thermal wavelength into Landauer (must refuse, twice, for different reasons)', () => {
  it('junction refusal: no name match, no registered identification', () => {
    expect(() => composeEdges(be12Edge, be16Edge)).toThrow(
      CompositionJunctionError,
    );
    // The error must NAME both quantity sets (diagnosability bar).
    expect(() => composeEdges(be12Edge, be16Edge)).toThrow(
      /thermal-de-broglie-wavelength.*temperature/s,
    );
  });

  it('dimension-functor refusal: a forced human identification cannot launder [length] into [Θ]', () => {
    // A (wrong) physicist override asserting λ_T IS a temperature:
    expect(() =>
      composeEdges(be12Edge, be16Edge, {
        identifications: [
          {
            from: 'thermal-de-broglie-wavelength',
            to: 'temperature',
            rationale: 'deliberately wrong — stress test ST-1',
          },
        ],
      }),
    ).toThrow(CompositionDimensionError);
  });
});

describe('ST-2 — photon grazing AT the horizon (composes, then fails at the DOMAIN)', () => {
  // schwarzschild-radius → impact-parameter type-checks ([L] = [L]);
  // the physics refusal must come from BE-51's weak-field domain
  // b ≥ 10·r_s, not from the type layer.
  const grazingAtHorizon = composeEdges(lawSchwarzschildRadius, be51Edge, {
    identifications: [
      {
        from: 'schwarzschild-radius',
        to: 'impact-parameter',
        rationale:
          'stress test ST-2 — a photon with impact parameter exactly r_s ' +
          '(deep strong field; the weak-field deflection formula must refuse)',
      },
    ],
  });

  it('composition itself SUCCEEDS (the junction is type-valid)', () => {
    expect(grazingAtHorizon.id).toBe('law-schwarzschild-radius>>be-51');
    // Both source slots are the canonical 'mass' quantity — here the
    // aliasing is physically CORRECT (the same M is the lensing mass
    // AND the r_s source). Contrast the be-42>>be-12 candidate where
    // aliasing is the wrong reading — see the Phase-D report.
    expect(grazingAtHorizon.sources.map((s) => s.name)).toEqual([
      'mass',
      'mass',
    ]);
  });

  it('evaluation fails with DomainViolationError (not a type error), naming the weak field', () => {
    expect(() => grazingAtHorizon.evaluate({ mass: M_SUN_KG })).toThrow(
      DomainViolationError,
    );
    expect(() => grazingAtHorizon.evaluate({ mass: M_SUN_KG })).toThrow(
      /weak field/i,
    );
  });

  it('control: the same edge pair at b = 100·r_s would be in-domain (the refusal is the physics, not the plumbing)', () => {
    // Direct evaluation of be51 at a healthy impact parameter — same
    // mass, same machinery, no refusal.
    const r_s = lawSchwarzschildRadius.evaluate({ mass: M_SUN_KG });
    expect(
      be51Edge.evaluate({ mass: M_SUN_KG, 'impact-parameter': 100 * r_s }),
    ).toBeGreaterThan(0);
  });
});
