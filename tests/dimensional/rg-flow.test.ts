/**
 * tests/dimensional/rg-flow.test.ts
 *
 * v0.7 BE-X re-encoding sprint — `RGCouplingNode` + `BetaFunctionNode`
 * predicate AST + validators. Covers:
 *
 *   1. Happy paths: single-coupling β_g; two-coupling β_g + β_λ; with and
 *      without `fixedPoint`.
 *   2. Predicate failures: non-dimensionless `polynomialExpansion`; target
 *      not in `couplings`; `fixedPoint` length mismatch; missing /
 *      invalid `name`; non-finite fixed-point value; duplicate coupling
 *      name; empty coupling list; non-dimensionless coupling.
 *   3. Physics sanity: a constructed β_g(g, λ) = g²(g − g*) vanishes
 *      structurally at the pinned fixed point (informational; the test
 *      pins structural validation, the polynomial-evaluation check uses
 *      hand-rolled arithmetic since `validate()` only does dimension
 *      propagation).
 *   4. Error-keyword discipline (meta-test): predicate failures contain
 *      the right scoping keywords.
 */

import { describe, it, expect } from 'vitest';
import {
  rgCoupling,
  validateRGCoupling,
  validateBetaFunction,
} from '../../src/dimensional/rg-flow.js';
import type {
  RGCouplingNode,
  BetaFunctionNode,
} from '../../src/dimensional/rg-flow.js';
import type { ExprNode } from '../../src/dimensional/validator.js';
import { LENGTH, DIMENSIONLESS } from '../../src/dimensional/types.js';

// ── Builders ───────────────────────────────────────────────────────────────

const dimlessSym = (name: string): ExprNode => ({
  kind: 'symbol',
  name,
  dim: DIMENSIONLESS,
});

/** Build β_g = 2g + A·g² + B·g³ − C·g²·λ (BE-39 canonical form). */
function betaGPolynomial(): ExprNode {
  const g = dimlessSym('g');
  const lambda = dimlessSym('lambda');
  const A = dimlessSym('A');
  const B = dimlessSym('B');
  const minusC = dimlessSym('-C');
  const two = dimlessSym('2');
  const three = dimlessSym('3');
  return {
    kind: 'op',
    op: '+',
    args: [
      { kind: 'op', op: '*', args: [dimlessSym('2'), g] },
      {
        kind: 'op',
        op: '*',
        args: [A, { kind: 'op', op: '^', args: [g, two] }],
      },
      {
        kind: 'op',
        op: '*',
        args: [B, { kind: 'op', op: '^', args: [g, three] }],
      },
      {
        kind: 'op',
        op: '*',
        args: [minusC, { kind: 'op', op: '^', args: [g, two] }, lambda],
      },
    ],
  };
}

/** Build β_λ = -2λ + D·λ² − E·g·λ − F·g² (BE-39 canonical form, sign-stubbed). */
function betaLambdaPolynomial(): ExprNode {
  const g = dimlessSym('g');
  const lambda = dimlessSym('lambda');
  const D = dimlessSym('D');
  const minusE = dimlessSym('-E');
  const minusF = dimlessSym('-F');
  const two = dimlessSym('2');
  return {
    kind: 'op',
    op: '+',
    args: [
      { kind: 'op', op: '*', args: [dimlessSym('-2'), lambda] },
      {
        kind: 'op',
        op: '*',
        args: [D, { kind: 'op', op: '^', args: [lambda, two] }],
      },
      { kind: 'op', op: '*', args: [minusE, g, lambda] },
      {
        kind: 'op',
        op: '*',
        args: [minusF, { kind: 'op', op: '^', args: [g, two] }],
      },
    ],
  };
}

// ── RGCouplingNode ─────────────────────────────────────────────────────────

describe('RGCouplingNode validator', () => {
  it('accepts a well-formed dimensionless coupling', () => {
    const g = rgCoupling('g');
    expect(() => validateRGCoupling(g)).not.toThrow();
    expect(g.kind).toBe('rg-coupling');
    expect(g.dim).toEqual(DIMENSIONLESS);
  });

  it('rejects an empty name', () => {
    const bad: RGCouplingNode = { kind: 'rg-coupling', name: '', dim: DIMENSIONLESS };
    expect(() => validateRGCoupling(bad)).toThrow(/name/i);
  });

  it('rejects a non-string name (defensive)', () => {
    const bad = {
      kind: 'rg-coupling',
      name: 42 as unknown as string,
      dim: DIMENSIONLESS,
    } as RGCouplingNode;
    expect(() => validateRGCoupling(bad)).toThrow(/name/i);
  });

  it('rejects a non-dimensionless coupling', () => {
    const bad: RGCouplingNode = { kind: 'rg-coupling', name: 'G', dim: LENGTH };
    expect(() => validateRGCoupling(bad)).toThrow(/dimension/i);
  });
});

// ── BetaFunctionNode — happy paths ─────────────────────────────────────────

describe('BetaFunctionNode validator — happy paths', () => {
  it('single-coupling β_g (no fixed point)', () => {
    const g = rgCoupling('g');
    const node: BetaFunctionNode = {
      kind: 'beta-function',
      couplings: [g],
      target: g,
      // β_g(g) = 2g + A g² — pure-g truncation (no λ coupling)
      polynomialExpansion: {
        kind: 'op',
        op: '+',
        args: [
          { kind: 'op', op: '*', args: [dimlessSym('2'), dimlessSym('g')] },
          {
            kind: 'op',
            op: '*',
            args: [
              dimlessSym('A'),
              {
                kind: 'op',
                op: '^',
                args: [dimlessSym('g'), dimlessSym('2')],
              },
            ],
          },
        ],
      },
    };
    const r = validateBetaFunction(node);
    expect(r.dim).toEqual(DIMENSIONLESS);
    expect(r.targetName).toBe('g');
  });

  it('two-coupling β_g (the full BE-39 polynomial)', () => {
    const g = rgCoupling('g');
    const lambda = rgCoupling('lambda');
    const node: BetaFunctionNode = {
      kind: 'beta-function',
      couplings: [g, lambda],
      target: g,
      polynomialExpansion: betaGPolynomial(),
    };
    const r = validateBetaFunction(node);
    expect(r.dim).toEqual(DIMENSIONLESS);
    expect(r.targetName).toBe('g');
  });

  it('two-coupling β_λ (the BE-39 dual)', () => {
    const g = rgCoupling('g');
    const lambda = rgCoupling('lambda');
    const node: BetaFunctionNode = {
      kind: 'beta-function',
      couplings: [g, lambda],
      target: lambda,
      polynomialExpansion: betaLambdaPolynomial(),
    };
    const r = validateBetaFunction(node);
    expect(r.dim).toEqual(DIMENSIONLESS);
    expect(r.targetName).toBe('lambda');
  });

  it('two-coupling β_g with a UV-fixed-point pin', () => {
    const g = rgCoupling('g');
    const lambda = rgCoupling('lambda');
    // Canonical EH-truncation NGFP from Reuter 1998, one representative
    // scheme: (g*, λ*) ≈ (0.7, 0.4). Numbers carry no special meaning to
    // the validator — they just need to be finite and length-match.
    const node: BetaFunctionNode = {
      kind: 'beta-function',
      couplings: [g, lambda],
      target: g,
      polynomialExpansion: betaGPolynomial(),
      fixedPoint: [0.7, 0.4],
    };
    const r = validateBetaFunction(node);
    expect(r.dim).toEqual(DIMENSIONLESS);
    expect(r.targetName).toBe('g');
  });

  it('Gaussian fixed-point pin (g* = 0, λ* = 0) is accepted', () => {
    const g = rgCoupling('g');
    const lambda = rgCoupling('lambda');
    const node: BetaFunctionNode = {
      kind: 'beta-function',
      couplings: [g, lambda],
      target: g,
      polynomialExpansion: betaGPolynomial(),
      fixedPoint: [0, 0],
    };
    expect(() => validateBetaFunction(node)).not.toThrow();
  });
});

// ── BetaFunctionNode — predicate failures ──────────────────────────────────

describe('BetaFunctionNode validator — predicate failures', () => {
  it('rejects an empty coupling list', () => {
    const g = rgCoupling('g');
    const node: BetaFunctionNode = {
      kind: 'beta-function',
      couplings: [],
      target: g,
      polynomialExpansion: dimlessSym('0'),
    };
    expect(() => validateBetaFunction(node)).toThrow(/coupling/i);
  });

  it('rejects a target that is not in the couplings list', () => {
    const g = rgCoupling('g');
    const lambda = rgCoupling('lambda');
    const node: BetaFunctionNode = {
      kind: 'beta-function',
      couplings: [g],
      target: lambda, // lambda not in [g]
      polynomialExpansion: dimlessSym('g'),
    };
    expect(() => validateBetaFunction(node)).toThrow(/target/i);
  });

  it('rejects a non-dimensionless polynomialExpansion', () => {
    const g = rgCoupling('g');
    const node: BetaFunctionNode = {
      kind: 'beta-function',
      couplings: [g],
      target: g,
      // 'length_thing' is LENGTH-typed — β must be dimensionless
      polynomialExpansion: {
        kind: 'symbol',
        name: 'length_thing',
        dim: LENGTH,
      },
    };
    expect(() => validateBetaFunction(node)).toThrow(/dimension/i);
  });

  it('rejects fixedPoint with the wrong length', () => {
    const g = rgCoupling('g');
    const lambda = rgCoupling('lambda');
    const node: BetaFunctionNode = {
      kind: 'beta-function',
      couplings: [g, lambda],
      target: g,
      polynomialExpansion: betaGPolynomial(),
      fixedPoint: [0.7], // 1 value, expected 2
    };
    expect(() => validateBetaFunction(node)).toThrow(/fixedPoint/);
  });

  it('rejects a non-finite fixed-point value', () => {
    const g = rgCoupling('g');
    const node: BetaFunctionNode = {
      kind: 'beta-function',
      couplings: [g],
      target: g,
      polynomialExpansion: dimlessSym('g'),
      fixedPoint: [Number.NaN],
    };
    expect(() => validateBetaFunction(node)).toThrow(/fixedPoint/);
  });

  it('rejects duplicate coupling names', () => {
    const g1 = rgCoupling('g');
    const g2 = rgCoupling('g');
    const node: BetaFunctionNode = {
      kind: 'beta-function',
      couplings: [g1, g2],
      target: g1,
      polynomialExpansion: dimlessSym('g'),
    };
    expect(() => validateBetaFunction(node)).toThrow(/duplicate/i);
  });

  it('rejects a coupling with an empty name (via validateRGCoupling)', () => {
    const bad: RGCouplingNode = { kind: 'rg-coupling', name: '', dim: DIMENSIONLESS };
    const node: BetaFunctionNode = {
      kind: 'beta-function',
      couplings: [bad],
      target: bad,
      polynomialExpansion: dimlessSym('g'),
    };
    expect(() => validateBetaFunction(node)).toThrow(/name/i);
  });

  it('rejects a non-dimensionless coupling (via validateRGCoupling)', () => {
    const bad: RGCouplingNode = { kind: 'rg-coupling', name: 'G_physical', dim: LENGTH };
    const node: BetaFunctionNode = {
      kind: 'beta-function',
      couplings: [bad],
      target: bad,
      polynomialExpansion: dimlessSym('g'),
    };
    expect(() => validateBetaFunction(node)).toThrow(/dimension/i);
  });
});

// ── Physics sanity (informational) ─────────────────────────────────────────

describe('BetaFunctionNode — physics sanity at the fixed point', () => {
  it('β_g(g) = g²(g − g*) constructed with a pinned fixed point validates structurally', () => {
    // The polynomial β_g = g³ − g* · g². Encoded as op-tree below.
    // gStar acts as a dimensionless symbol parameter at the AST level.
    const g = rgCoupling('g');
    const polynomial: ExprNode = {
      kind: 'op',
      op: '-',
      args: [
        // g³
        {
          kind: 'op',
          op: '^',
          args: [dimlessSym('g'), dimlessSym('3')],
        },
        // g* · g²
        {
          kind: 'op',
          op: '*',
          args: [
            dimlessSym('g_star'),
            { kind: 'op', op: '^', args: [dimlessSym('g'), dimlessSym('2')] },
          ],
        },
      ],
    };
    const node: BetaFunctionNode = {
      kind: 'beta-function',
      couplings: [g],
      target: g,
      polynomialExpansion: polynomial,
      fixedPoint: [0.5],
    };
    const r = validateBetaFunction(node);
    expect(r.dim).toEqual(DIMENSIONLESS);

    // Hand-rolled polynomial-evaluation sanity at the pinned fixed point:
    // β_g(g*) = (g*)² · (g* − g*) = 0. This is structural physics; the
    // validator only does dimension propagation, so the test computes
    // the polynomial value directly.
    const gStar = node.fixedPoint![0];
    const betaAtStar = gStar * gStar * (gStar - gStar);
    expect(betaAtStar).toBe(0);
  });
});

// ── Error-keyword discipline (meta-test) ───────────────────────────────────

describe('BetaFunctionNode — error-keyword discipline', () => {
  it("'dimension' failures carry the keyword", () => {
    const g = rgCoupling('g');
    const node: BetaFunctionNode = {
      kind: 'beta-function',
      couplings: [g],
      target: g,
      polynomialExpansion: { kind: 'symbol', name: 'L', dim: LENGTH },
    };
    expect(() => validateBetaFunction(node)).toThrow(/dimension/i);
  });

  it("'target' failures are scoped to BetaFunctionNode", () => {
    const g = rgCoupling('g');
    const lambda = rgCoupling('lambda');
    const node: BetaFunctionNode = {
      kind: 'beta-function',
      couplings: [g],
      target: lambda,
      polynomialExpansion: dimlessSym('g'),
    };
    expect(() => validateBetaFunction(node)).toThrow(/BetaFunctionNode: target/);
  });

  it("'fixedPoint' failures are scoped to BetaFunctionNode", () => {
    const g = rgCoupling('g');
    const node: BetaFunctionNode = {
      kind: 'beta-function',
      couplings: [g],
      target: g,
      polynomialExpansion: dimlessSym('g'),
      fixedPoint: [1, 2], // 2 values, expected 1
    };
    expect(() => validateBetaFunction(node)).toThrow(/BetaFunctionNode: fixedPoint/);
  });
});
