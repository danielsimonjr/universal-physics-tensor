/**
 * Validator tests — known-good and known-bad equations.
 *
 * Reference checks (Goldstein "Classical Mechanics" 3rd ed., Sakurai "Modern QM"
 * 2nd ed., Wald "General Relativity" 1984) for unit-canonical formulations:
 *   - Newton II: F = m a — Goldstein §1.1
 *   - Einstein rest energy: E = m c^2 — derived in any SR text, e.g. Rindler 2006
 *   - Schrödinger time evolution: i ℏ ∂ψ/∂t = H ψ — Sakurai §2.1
 *   - Bekenstein-Hawking entropy: S = k_B A / (4 ℓ_P^2) — Bekenstein 1973 PRD 7,
 *     Hawking 1975 CMP 43; canonical form S = k_B A c^3 / (4 ℏ G).
 */

import { describe, it, expect } from 'vitest';
import {
  validate,
  validateEquation,
  ExprNode,
} from '../../src/dimensional/validator.js';
import {
  DIMENSIONLESS,
  LENGTH,
  TIME,
  MASS,
  ENERGY,
  FORCE,
  VELOCITY,
  ACCELERATION,
  TEMPERATURE,
  ENTROPY,
  AREA,
  Dimension,
} from '../../src/dimensional/types.js';
import { hbar, c, k_B, l_P } from '../../src/dimensional/constants.js';

const sym = (name: string, dim: Dimension): ExprNode => ({ kind: 'symbol', name, dim });

describe('validator: known-good equations', () => {
  it("Newton's second law F = m a", () => {
    const lhs = sym('F', FORCE);
    const rhs: ExprNode = {
      kind: 'op', op: '*',
      args: [sym('m', MASS), sym('a', ACCELERATION)],
    };
    const r = validateEquation(lhs, rhs);
    expect(r.ok).toBe(true);
    expect(r.violations).toHaveLength(0);
  });

  it('E = m c^2', () => {
    const lhs = sym('E', ENERGY);
    const rhs: ExprNode = {
      kind: 'op', op: '*',
      args: [
        sym('m', MASS),
        { kind: 'op', op: '^', args: [sym('c', c), { kind: 'symbol', name: '2', dim: DIMENSIONLESS }] },
      ],
    };
    // For ^, the exponent symbol carries the literal numeric value via name; validator parses it.
    const r = validateEquation(lhs, rhs);
    expect(r.ok).toBe(true);
  });

  it('Schrödinger: i ℏ ∂ψ/∂t  has same dim as  H ψ (both = energy × ψ)', () => {
    // Treat ψ as dimensional with arbitrary tag PSI; only relative consistency is required.
    const PSI: Dimension = { L: -1.5, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 }; // L^{-3/2} convention; chosen but cancels
    const psi = sym('psi', PSI);
    const t = sym('t', TIME);
    // i is dimensionless
    const i_node = sym('i', DIMENSIONLESS);
    const dPsi_dt: ExprNode = { kind: 'derivative', of: psi, wrt: t };
    const lhs: ExprNode = {
      kind: 'op', op: '*',
      args: [i_node, sym('hbar', hbar), dPsi_dt],
    };
    // RHS: H * psi, with H having dim ENERGY
    const rhs: ExprNode = {
      kind: 'op', op: '*',
      args: [sym('H', ENERGY), psi],
    };
    const r = validateEquation(lhs, rhs);
    expect(r.ok).toBe(true);
  });

  it('Bekenstein-Hawking entropy S = k_B A / (4 ℓ_P^2)', () => {
    const lhs = sym('S', ENTROPY);
    const four = sym('4', DIMENSIONLESS);
    const lP_node = sym('lP', l_P);
    const rhs: ExprNode = {
      kind: 'op', op: '/',
      args: [
        { kind: 'op', op: '*', args: [sym('k_B', k_B), sym('A', AREA)] },
        { kind: 'op', op: '*', args: [four, { kind: 'op', op: '^', args: [lP_node, { kind: 'symbol', name: '2', dim: DIMENSIONLESS }] }] },
      ],
    };
    const r = validateEquation(lhs, rhs);
    expect(r.ok).toBe(true);
  });
});

describe('validator: integral and derivative dimension propagation', () => {
  it('∫ v dt has dimension LENGTH (when v=VELOCITY, dt=TIME)', () => {
    const expr: ExprNode = {
      kind: 'integral',
      integrand: sym('v', VELOCITY),
      over: sym('t', TIME),
    };
    const r = validate(expr);
    expect(r.ok).toBe(true);
    expect(r.inferredDimension).toEqual(LENGTH);
  });

  it('d(position)/d(time) has dimension VELOCITY', () => {
    const expr: ExprNode = {
      kind: 'derivative',
      of: sym('x', LENGTH),
      wrt: sym('t', TIME),
    };
    const r = validate(expr);
    expect(r.ok).toBe(true);
    expect(r.inferredDimension).toEqual(VELOCITY);
  });
});

describe('validator: known-bad equations', () => {
  it('rejects ENERGY + LENGTH (cannot add unlike dimensions)', () => {
    const expr: ExprNode = {
      kind: 'op', op: '+',
      args: [sym('E', ENERGY), sym('x', LENGTH)],
    };
    const r = validate(expr);
    expect(r.ok).toBe(false);
    expect(r.violations.length).toBeGreaterThan(0);
    expect(r.violations[0].note).toMatch(/add|mismatch/i);
  });

  it('rejects equation where LHS and RHS dims differ', () => {
    const lhs = sym('S', ENTROPY);
    const rhs = sym('E', ENERGY);
    const r = validateEquation(lhs, rhs);
    expect(r.ok).toBe(false);
    expect(r.violations.length).toBeGreaterThan(0);
  });

  it('rejects mixed-unit sum inside a larger expression', () => {
    // (E + x) * m  — inner sum is illegal
    const expr: ExprNode = {
      kind: 'op', op: '*',
      args: [
        {
          kind: 'op', op: '+',
          args: [sym('E', ENERGY), sym('x', LENGTH)],
        },
        sym('m', MASS),
      ],
    };
    const r = validate(expr);
    expect(r.ok).toBe(false);
    // Path should mention args[0] (the inner sum)
    expect(r.violations[0].location).toContain('args[0]');
  });
});
