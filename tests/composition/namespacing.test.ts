/**
 * v0.11 namespacing gate — Option D acceptance criteria 1, 3, 5
 * (docs/planning/v0.11.0-Quantity-Namespacing-Design-Note.md r2,
 * post-Adam). Criterion 2's call-site churn lives in the ST-2 and
 * Phase-D test files; criterion 6 in quantities.test.ts.
 */
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  be12Edge,
  be42Edge,
  composeEdges,
  CompositionAliasError,
  M_SUN_KG,
} from '../../src/composition/index.js';
import type { BridgeEdge, Quantity } from '../../src/composition/index.js';
import { C_SI, G_SI, HBAR_SI, K_B_SI, M_E_SI } from '../../src/core/constants.js';
import { DIMENSIONLESS } from '../../src/dimensional/types.js';

const relErr = (a: number, b: number): number => Math.abs(a - b) / Math.abs(b);

describe('criterion 1 — the Phase-D finding becomes a guard', () => {
  it('composeEdges(be42Edge, be12Edge) THROWS CompositionAliasError (no silent aliasing)', () => {
    expect(() => composeEdges(be42Edge, be12Edge)).toThrow(
      CompositionAliasError,
    );
    expect(() => composeEdges(be42Edge, be12Edge)).toThrow(/'mass' appears/);
  });
});

describe('criterion 3 — renameSecond splits the collision (Adam A-5 pins)', () => {
  const split = composeEdges(be42Edge, be12Edge, {
    aliases: [
      {
        name: 'mass',
        treatAs: { renameSecond: 'particle-mass' },
        rationale:
          "BE-42's mass is the BLACK HOLE; BE-12's mass is the PARTICLE " +
          'whose thermal wavelength is evaluated at T_H — distinct ' +
          'physical quantities sharing a canonical name.',
      },
    ],
  });

  it('composed sources carry mass + particle-mass (+junction consumed)', () => {
    expect(split.sources.map((s) => s.name).sort()).toEqual([
      'mass',
      'particle-mass',
    ]);
    expect(split.aliasDispositionsUsed?.[0]?.name).toBe('mass');
  });

  it('λ_T(m_e, T_H(M_sun)) = 3.0012e-4 m (relErr ≤ 1e-12 vs closed form; vs aliased 2.031e-34 m)', () => {
    const T_H = (HBAR_SI * C_SI ** 3) / (8 * Math.PI * G_SI * M_SUN_KG * K_B_SI);
    expect(relErr(T_H, 6.1684e-8)).toBeLessThan(1e-4); // Adam anchor
    const lambdaClosed = Math.sqrt(
      (2 * Math.PI * HBAR_SI * HBAR_SI) / (M_E_SI * K_B_SI * T_H),
    );
    const lambda = split.evaluate({
      mass: M_SUN_KG,
      'particle-mass': M_E_SI,
    });
    expect(relErr(lambda, lambdaClosed)).toBeLessThanOrEqual(1e-12);
    expect(relErr(lambda, 3.0012e-4)).toBeLessThan(1e-4); // Adam anchor
  });

  it('rejects a renameSecond target colliding with an operand source name (vet A-4)', () => {
    expect(() =>
      composeEdges(be42Edge, be12Edge, {
        aliases: [
          { name: 'mass', treatAs: { renameSecond: 'temperature' }, rationale: 'bad' },
        ],
      }),
    ).toThrow(CompositionAliasError);
  });
});

describe('criterion 5 — disjoint names NEVER alias-throw (property)', () => {
  const q = (name: string): Quantity => ({
    name,
    symbol: name,
    dim: DIMENSIONLESS,
    attributes: {},
  });
  const edge = (id: string, srcs: string[], tgt: string): BridgeEdge => ({
    id,
    beId: null,
    kind: 'bridge',
    label: id,
    sources: srcs.map(q),
    target: q(tgt),
    confidence: 'speculative',
    domain: { description: 'any', predicate: () => true },
    evaluate: (i) => srcs.reduce((acc, n) => acc + i[n], 0),
    citation: 'synthetic',
  });

  it('exact under the name-based rule', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 3 }),
        fc.integer({ min: 0, max: 3 }),
        (nA, nB) => {
          const aSrcs = Array.from({ length: nA }, (_, k) => `a${k}`);
          const bSrcs = ['junction', ...Array.from({ length: nB }, (_, k) => `b${k}`)];
          const A = edge('A', aSrcs.length ? aSrcs : ['a-only'], 'junction');
          const B = edge('B', bSrcs, 'out');
          // Disjoint by construction: a*/a-only vs junction/b*.
          const composed = composeEdges(A, B);
          return composed.id === 'A>>B';
        },
      ),
    );
  });
});
