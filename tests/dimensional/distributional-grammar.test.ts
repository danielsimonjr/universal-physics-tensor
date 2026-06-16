/**
 * v0.14 — Distributional / variational grammar primitives.
 *
 * Two new scalar `ExprNode` arms let the dimensional validator EXPRESS (not
 * numerically evaluate) the Model-A Langevin / fluctuation-dissipation relation
 * BE-15 documents as un-encodable:
 *
 *   ∂φ/∂t = −Γ δH/δφ + ζ ,   ⟨ζ(x,t)ζ(x',t')⟩ = 2Γk_BT δ(x−x') δ(t−t')
 *
 *   - `dirac-delta`  : ∫δ(x)dx=1 ⟹ [δ(x)] = [x]⁻¹.
 *   - `variational-derivative` : δF=∫(δF/δφ)δφ dμ ⟹ [δF/δφ] = [F]/([φ]·[μ]).
 *
 * Both are SCALAR (a tensor child is rejected with TensorInScalarOpError) and
 * NON-numerical (lowering throws). Design + Adam+Eve vet:
 * docs/planning/v0.14-Distributional-Grammar-Design.md.
 */
import { describe, it, expect } from 'vitest';
import { validate, validateEquation } from '../../src/dimensional/validator.js';
import type { ExprNode } from '../../src/dimensional/validator.js';
import { equals, multiply, divide, power } from '../../src/dimensional/algebra.js';
import { TensorInScalarOpError } from '../../src/dimensional/errors.js';
import { tsym } from '../../src/dimensional/tensor.js';
import {
  LENGTH,
  TIME,
  ENERGY,
  DIMENSIONLESS,
  type Dimension,
} from '../../src/dimensional/types.js';

const s = (name: string, dim: Dimension = DIMENSIONLESS): ExprNode => ({ kind: 'symbol', name, dim });
const op = (o: '+' | '-' | '*' | '/' | '^', ...args: ExprNode[]): ExprNode => ({ kind: 'op', op: o, args });
const delta = (arg: ExprNode): ExprNode => ({ kind: 'dirac-delta', arg });
const vderiv = (functional: ExprNode, field: ExprNode, over: ExprNode): ExprNode =>
  ({ kind: 'variational-derivative', functional, field, over });

// An arbitrary (but fixed) field dimension for φ. Homogeneity must hold for any
// [φ]; a non-trivial value makes the cancellation genuine. Use mass.
const PHI: Dimension = { L: 0, M: 1, T: 0, I: 0, Theta: 0, N: 0, J: 0 };
const VOLUME: Dimension = power(LENGTH, 3); // the spatial measure [d³x] = L³

describe('dirac-delta — [δ(x)] = [x]⁻¹', () => {
  it('δ(length) → L⁻¹', () => {
    const r = validate(delta(s('x', LENGTH)));
    expect(r.ok).toBe(true);
    expect(equals(r.inferredDimension!, power(LENGTH, -1))).toBe(true);
  });

  it('δ(time) → T⁻¹', () => {
    const r = validate(delta(s('t', TIME)));
    expect(r.ok).toBe(true);
    expect(equals(r.inferredDimension!, power(TIME, -1))).toBe(true);
  });

  it('δ(dimensionless) → dimensionless', () => {
    const r = validate(delta(s('θ', DIMENSIONLESS)));
    expect(r.ok).toBe(true);
    expect(equals(r.inferredDimension!, DIMENSIONLESS)).toBe(true);
  });

  it('δ³(x) as a product of three single-arg deltas → L⁻³', () => {
    const d3 = op('*', delta(s('x', LENGTH)), delta(s('y', LENGTH)), delta(s('z', LENGTH)));
    const r = validate(d3);
    expect(r.ok).toBe(true);
    expect(equals(r.inferredDimension!, power(LENGTH, -3))).toBe(true);
  });

  it('missing arg → violation (no throw)', () => {
    const bad = { kind: 'dirac-delta' } as unknown as ExprNode;
    const r = validate(bad);
    expect(r.ok).toBe(false);
    expect(r.violations.some((v) => /dirac-delta requires an 'arg'/.test(v.note))).toBe(true);
  });

  it('tensor arg → throws TensorInScalarOpError', () => {
    const tensorArg = tsym('A', [{ label: 'μ', variance: 'upper' }], LENGTH);
    expect(() => validate(delta(tensorArg))).toThrow(TensorInScalarOpError);
  });

  it('a δ node contributes no free indices to the parent', () => {
    const r = validate(delta(s('x', LENGTH)));
    expect(r.freeIndices.size).toBe(0);
  });
});

describe('variational-derivative — [δF/δφ] = [F]/([φ]·[μ])', () => {
  it('δH/δφ over d³x → ENERGY/[φ]/L³', () => {
    const r = validate(vderiv(s('H', ENERGY), s('φ', PHI), s('d³x', VOLUME)));
    expect(r.ok).toBe(true);
    const expected = divide(divide(ENERGY, PHI), VOLUME);
    expect(equals(r.inferredDimension!, expected)).toBe(true);
  });

  it('missing field → violation', () => {
    const bad = { kind: 'variational-derivative', functional: s('H', ENERGY), over: s('d³x', VOLUME) } as unknown as ExprNode;
    const r = validate(bad);
    expect(r.ok).toBe(false);
    expect(r.violations.some((v) => /variational-derivative requires/.test(v.note))).toBe(true);
  });

  it('tensor child (functional) → throws TensorInScalarOpError', () => {
    const tensorH = tsym('H', [{ label: 'μ', variance: 'lower' }], ENERGY);
    expect(() => validate(vderiv(tensorH, s('φ', PHI), s('d³x', VOLUME)))).toThrow(TensorInScalarOpError);
  });
});

describe('Model-A demonstration — the relation BE-15 documented as un-encodable', () => {
  // Bare-Langevin kinetic coefficient: ∂φ/∂t = −Γ δH/δφ fixes
  // [Γ] = [φ]²·L³·T⁻¹·ENERGY⁻¹. Compute via the algebra (no hand-encoded vector).
  const GAMMA: Dimension = divide(
    multiply(power(PHI, 2), VOLUME), // [φ]²·L³
    multiply(TIME, ENERGY),          // ·T⁻¹·E⁻¹
  );

  it('the Langevin equation ∂φ/∂t = Γ·(δH/δφ over d³x) is homogeneous', () => {
    const lhs = { kind: 'derivative' as const, of: s('φ', PHI), wrt: s('t', TIME) }; // [φ]·T⁻¹
    const rhs = op('*', s('Γ', GAMMA), vderiv(s('H', ENERGY), s('φ', PHI), s('d³x', VOLUME)));
    const r = validateEquation(lhs, rhs);
    expect(r.ok).toBe(true);
    expect(r.violations).toEqual([]);
    // both sides reduce to [φ]·T⁻¹
    expect(equals(r.inferredDimension!, divide(PHI, TIME))).toBe(true);
  });

  it('the FDT correlator ⟨ζζ⟩ = 2Γk_BT δ³(x)δ(t) is homogeneous (the marquee)', () => {
    // LHS ⟨ζζ⟩ = [∂φ/∂t]² = [φ]²·T⁻².
    const dphidt = { kind: 'derivative' as const, of: s('φ', PHI), wrt: s('t', TIME) };
    const lhs = op('*', dphidt, dphidt);
    // RHS 2·Γ·k_BT·δ(x)δ(y)δ(z)·δ(t)  (the dimensionless 2 is omitted).
    const rhs = op(
      '*',
      s('Γ', GAMMA),
      s('k_BT', ENERGY),
      delta(s('x', LENGTH)),
      delta(s('y', LENGTH)),
      delta(s('z', LENGTH)),
      delta(s('t', TIME)),
    );
    const r = validateEquation(lhs, rhs);
    expect(r.ok).toBe(true);
    expect(r.violations).toEqual([]);
    expect(equals(r.inferredDimension!, multiply(power(PHI, 2), power(TIME, -2)))).toBe(true);
  });

  it('NEGATIVE: dropping a δ(t) from the RHS is REJECTED (grammar can reject)', () => {
    const dphidt = { kind: 'derivative' as const, of: s('φ', PHI), wrt: s('t', TIME) };
    const lhs = op('*', dphidt, dphidt);
    // Same RHS but WITHOUT the δ(t) factor → off by one T⁻¹.
    const rhs = op(
      '*',
      s('Γ', GAMMA),
      s('k_BT', ENERGY),
      delta(s('x', LENGTH)),
      delta(s('y', LENGTH)),
      delta(s('z', LENGTH)),
    );
    const r = validateEquation(lhs, rhs);
    expect(r.ok).toBe(false);
    expect(r.violations.some((v) => /not dimensionally homogeneous/.test(v.note))).toBe(true);
  });
});

describe('serialization — new kinds survive a JSON round-trip', () => {
  it('dirac-delta round-trips and re-infers the same dimension', () => {
    const node = delta(s('x', LENGTH));
    const round = JSON.parse(JSON.stringify(node)) as ExprNode;
    const before = validate(node).inferredDimension!;
    const after = validate(round).inferredDimension!;
    expect(equals(after, before)).toBe(true);
  });

  it('variational-derivative round-trips and re-infers the same dimension', () => {
    const node = vderiv(s('H', ENERGY), s('φ', PHI), s('d³x', VOLUME));
    const round = JSON.parse(JSON.stringify(node)) as ExprNode;
    const before = validate(node).inferredDimension!;
    const after = validate(round).inferredDimension!;
    expect(equals(after, before)).toBe(true);
  });
});
