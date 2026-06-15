/**
 * Symbolic simplification via MathTS (v0.12 — Adam+Eve-vetted supplement to
 * symbolic composition; docs/planning/v0.12.0-Symbolic-Simplification-Design.md).
 *
 * Requires the optional @danielsimonjr/mathts-functions peer (present in this
 * repo). Pins: CT-1/CT-1b fold (k_B cancels, value+dim preserved); the
 * fully-parenthesized renderer survives a compound base under `^` (EVE-A);
 * idempotence on an already-simple form asserts leaf-set+value+dim, not AST
 * structure (EVE-F); unsupported nodes degrade to a graceful no-op; and
 * simplifyObservable reconstructs a fresh STRICT Observable (Adam HIGH-3).
 */
import { describe, it, expect } from 'vitest';
import { simplifyExpr, simplifyObservable } from '../../src/composition/expr-simplify.js';
import { composeSymbolic } from '../../src/composition/compose-symbolic.js';
import { evalExpr, SymbolicEvalError } from '../../src/composition/expr-eval.js';
import {
  be42Edge,
  be16Edge,
  be42ViaRsEdge,
  lawSchwarzschildRadius,
  M_SUN_KG,
} from '../../src/composition/edges/calibration.js';
import type { ExprNode } from '../../src/dimensional/validator.js';
import { equals } from '../../src/dimensional/algebra.js';
import { ENERGY, TEMPERATURE, VELOCITY, DIMENSIONLESS } from '../../src/dimensional/types.js';

const relErr = (a: number, b: number) => Math.abs(a - b) / Math.abs(b);

/** Count occurrences of a leaf name in a scalar ExprNode. */
function countSymbol(expr: ExprNode, name: string): number {
  if (expr.kind === 'symbol') return expr.name === name ? 1 : 0;
  if (expr.kind === 'op') return expr.args.reduce((n, a) => n + countSymbol(a, name), 0);
  return 0;
}

describe('simplifyObservable — CT-1 folds k_B out (value + dim preserved)', () => {
  it('cancels the k_B that composition left uncancelled', async () => {
    const composed = composeSymbolic(be42Edge, be16Edge);
    expect(countSymbol(composed.expr, 'k_B')).toBe(2); // unsimplified: numerator + denominator

    const simp = await simplifyObservable(composed);
    expect(countSymbol(simp.expr, 'k_B')).toBe(0); // cancelled
    expect(simp.name).toBe('landauer-erasure-energy');
    expect(equals(simp.dim, ENERGY)).toBe(true);
    expect([...simp.leaves]).toEqual(['mass']); // k_B is a constant, never a leaf

    // value unchanged to float precision
    expect(relErr(simp.evaluate({ mass: M_SUN_KG }), composed.evaluate({ mass: M_SUN_KG }))).toBeLessThan(1e-9);
  });

  it('the reconstructed Observable keeps the STRICT input contract (HIGH-3)', async () => {
    const simp = await simplifyObservable(composeSymbolic(be42Edge, be16Edge));
    expect(() => simp.evaluate({})).toThrow(SymbolicEvalError); // missing mass
    expect(() => simp.evaluate({ mass: M_SUN_KG, k_B: 1 })).toThrow(SymbolicEvalError); // k_B not a leaf
  });
});

describe('simplifyObservable — CT-1b folds to temperature', () => {
  it('reduces the law∘via-rs chain, preserving value and dimension', async () => {
    const composed = composeSymbolic(lawSchwarzschildRadius, be42ViaRsEdge);
    const simp = await simplifyObservable(composed);
    expect(equals(simp.dim, TEMPERATURE)).toBe(true);
    expect([...simp.leaves]).toEqual(['mass']);
    expect(relErr(simp.evaluate({ mass: M_SUN_KG }), composed.evaluate({ mass: M_SUN_KG }))).toBeLessThan(1e-9);
  });
});

describe('renderer — compound base under ^ (EVE-A precedence guard)', () => {
  it('(alpha/beta)^2 round-trips without corruption', async () => {
    // If the renderer failed to parenthesize the ^ base, mathjs would read
    // alpha/beta^2 ≠ (alpha/beta)^2 and the numeric guard would throw.
    const compound: ExprNode = {
      kind: 'op',
      op: '^',
      args: [
        { kind: 'op', op: '/', args: [
          { kind: 'symbol', name: 'alpha', dim: VELOCITY },
          { kind: 'symbol', name: 'beta', dim: VELOCITY },
        ] },
        { kind: 'symbol', name: '2', dim: DIMENSIONLESS },
      ],
    };
    const r = await simplifyExpr(compound); // must NOT throw
    const probe = { alpha: 3.3, beta: 1.7 };
    expect(relErr(evalExpr(r.expr, probe), evalExpr(compound, probe))).toBeLessThan(1e-9);
  });
});

describe('simplifyExpr — degradation', () => {
  it('idempotent on an already-simple form: leaf-set + value + dim, not structure (EVE-F)', async () => {
    const r = await simplifyExpr(be16Edge.symbolic!); // k_B·temperature·ln2
    const probe = { temperature: 300 };
    expect(relErr(evalExpr(r.expr, probe), evalExpr(be16Edge.symbolic!, probe))).toBeLessThan(1e-9);
    expect(countSymbol(r.expr, 'temperature')).toBe(1);
  });

  it('returns a graceful no-op for an unsupported (integral) node', async () => {
    const integral: ExprNode = {
      kind: 'integral',
      over: { kind: 'symbol', name: 'x', dim: DIMENSIONLESS },
      integrand: { kind: 'symbol', name: 'y', dim: DIMENSIONLESS },
    };
    const r = await simplifyExpr(integral);
    expect(r.simplified).toBe(false);
    expect(r.expr).toBe(integral); // unchanged
  });
});
