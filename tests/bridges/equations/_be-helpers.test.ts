/**
 * tests/bridges/equations/_be-helpers.test.ts
 *
 * v0.7.1 Phase 3 — coverage for the three behaviour-preserving extractions
 * in `src/bridges/equations/_be-helpers.ts`:
 *
 *   1. `validateFiniteInputs` — declarative range-guard replacement
 *      for the per-BE-NN `Number.isFinite || x <= 0` boilerplate.
 *   2. `validateBEDimensions` — drop-in replacement for the per-BE-NN
 *      `validateBE##Dimensions()` wrapper body.
 *   3. `sym` — drop-in replacement for the duplicated symbol-node
 *      factory. **Highest-risk** extraction (subtle factory bug
 *      affects every BE module silently).
 *
 * Plus three cross-helper integration tests that exercise a fake BE
 * module using all three helpers together — the practical "is this
 * the contract I expect" check.
 */

import { describe, it, expect } from 'vitest';
import {
  validateFiniteInputs,
  validateBEDimensions,
  sym,
} from '../../../src/bridges/equations/_be-helpers.js';
import type { ExprNode } from '../../../src/dimensional/validator.js';
import {
  DIMENSIONLESS,
  LENGTH,
  MASS,
  TIME,
  TEMPERATURE,
  ENERGY,
  FREQUENCY,
} from '../../../src/dimensional/types.js';
import type { Dimension } from '../../../src/dimensional/types.js';

// ─────────────────────────────────────────────────────────────────────────────
// validateFiniteInputs
// ─────────────────────────────────────────────────────────────────────────────

describe('validateFiniteInputs — finite-only specs (no range)', () => {
  it('accepts normal finite numbers', () => {
    expect(() =>
      validateFiniteInputs({ x: 1.5 }, [{ name: 'x' }], 'evaluateFake'),
    ).not.toThrow();
  });

  it('accepts zero when no range is set', () => {
    expect(() =>
      validateFiniteInputs({ x: 0 }, [{ name: 'x' }], 'evaluateFake'),
    ).not.toThrow();
  });

  it('accepts negative values when no range is set', () => {
    expect(() =>
      validateFiniteInputs({ x: -3.14 }, [{ name: 'x' }], 'evaluateFake'),
    ).not.toThrow();
  });

  it('rejects NaN with a "finite" keyword', () => {
    expect(() =>
      validateFiniteInputs({ x: Number.NaN }, [{ name: 'x' }], 'evaluateFake'),
    ).toThrow(RangeError);
    expect(() =>
      validateFiniteInputs({ x: Number.NaN }, [{ name: 'x' }], 'evaluateFake'),
    ).toThrow(/finite/);
  });

  it('rejects +Infinity', () => {
    expect(() =>
      validateFiniteInputs(
        { x: Number.POSITIVE_INFINITY },
        [{ name: 'x' }],
        'evaluateFake',
      ),
    ).toThrow(/finite/);
  });

  it('rejects -Infinity', () => {
    expect(() =>
      validateFiniteInputs(
        { x: Number.NEGATIVE_INFINITY },
        [{ name: 'x' }],
        'evaluateFake',
      ),
    ).toThrow(/finite/);
  });

  it('the error message carries the evaluator name + field name + bad value', () => {
    try {
      validateFiniteInputs({ M_kg: Number.NaN }, [{ name: 'M_kg' }], 'evaluateShapiroDelay');
      throw new Error('expected throw');
    } catch (err) {
      const msg = String(err);
      expect(msg).toContain('evaluateShapiroDelay');
      expect(msg).toContain('M_kg');
      expect(msg).toContain('finite');
      expect(msg).toContain('NaN');
    }
  });

  it('rejects non-number values (defensive — input may come from JS callers)', () => {
    expect(() =>
      validateFiniteInputs(
        { x: 'abc' as unknown as number },
        [{ name: 'x' }],
        'evaluateFake',
      ),
    ).toThrow(/finite/);
  });
});

describe('validateFiniteInputs — positive (excludeMin at 0)', () => {
  const positiveSpec = { name: 'x', min: 0, excludeMin: true } as const;

  it('accepts strictly positive values', () => {
    expect(() =>
      validateFiniteInputs({ x: 1 }, [positiveSpec], 'evaluateFake'),
    ).not.toThrow();
    expect(() =>
      validateFiniteInputs({ x: 1e-12 }, [positiveSpec], 'evaluateFake'),
    ).not.toThrow();
  });

  it('rejects zero', () => {
    expect(() =>
      validateFiniteInputs({ x: 0 }, [positiveSpec], 'evaluateFake'),
    ).toThrow(/positive/);
  });

  it('rejects negative values', () => {
    expect(() =>
      validateFiniteInputs({ x: -1 }, [positiveSpec], 'evaluateFake'),
    ).toThrow(/positive/);
  });

  it('error message uses the canonical "finite positive number" phrasing', () => {
    try {
      validateFiniteInputs({ x: -2 }, [positiveSpec], 'evaluateFake');
      throw new Error('expected throw');
    } catch (err) {
      expect(String(err)).toContain('must be a finite positive number');
    }
  });
});

describe('validateFiniteInputs — non-negative (min=0, inclusive)', () => {
  const nonNegSpec = { name: 'x', min: 0 } as const;

  it('accepts zero', () => {
    expect(() =>
      validateFiniteInputs({ x: 0 }, [nonNegSpec], 'evaluateFake'),
    ).not.toThrow();
  });

  it('accepts positive values', () => {
    expect(() =>
      validateFiniteInputs({ x: 42 }, [nonNegSpec], 'evaluateFake'),
    ).not.toThrow();
  });

  it('rejects negative values with "non-negative" keyword', () => {
    expect(() =>
      validateFiniteInputs({ x: -0.001 }, [nonNegSpec], 'evaluateFake'),
    ).toThrow(/non-negative/);
  });
});

describe('validateFiniteInputs — bounded ranges (min + max combinations)', () => {
  it('accepts values in a closed [min, max] range', () => {
    expect(() =>
      validateFiniteInputs(
        { x: 0.5 },
        [{ name: 'x', min: 0, max: 1, allowZero: true }],
        'evaluateFake',
      ),
    ).not.toThrow();
  });

  it('rejects values above the inclusive max', () => {
    expect(() =>
      validateFiniteInputs(
        { x: 1.5 },
        [{ name: 'x', min: 0, max: 1, allowZero: true }],
        'evaluateFake',
      ),
    ).toThrow(/range/);
  });

  it('rejects values at an exclusive max', () => {
    expect(() =>
      validateFiniteInputs(
        { x: 1 },
        [{ name: 'x', min: 0, max: 1, excludeMax: true, allowZero: true }],
        'evaluateFake',
      ),
    ).toThrow(/range/);
  });

  it('multi-field spec validates each in declaration order', () => {
    // x is fine; y is the violator → error message must blame y, not x
    try {
      validateFiniteInputs(
        { x: 1, y: -1 },
        [{ name: 'x', min: 0 }, { name: 'y', min: 0 }],
        'evaluateFake',
      );
      throw new Error('expected throw');
    } catch (err) {
      expect(String(err)).toContain('y must be a finite non-negative');
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// validateBEDimensions
// ─────────────────────────────────────────────────────────────────────────────

describe('validateBEDimensions — dimensional self-check helper', () => {
  it('returns ok=true with matching dimensions on a homogeneous equation', () => {
    const lhs = sym('Delta_t', TIME);
    const rhs = sym('tau', TIME);
    const report = validateBEDimensions(lhs, rhs, 'BE_fake');
    expect(report.ok).toBe(true);
    expect(report.lhsDim).toEqual(TIME);
    expect(report.rhsDim).toEqual(TIME);
  });

  it('returns ok=false when LHS and RHS have different dimensions', () => {
    const lhs = sym('L', LENGTH);
    const rhs = sym('M', MASS);
    const report = validateBEDimensions(lhs, rhs, 'BE_fake');
    expect(report.ok).toBe(false);
    expect(report.lhsDim).toEqual(LENGTH);
    expect(report.rhsDim).toEqual(MASS);
  });

  it('handles dimensionless equations', () => {
    const lhs = sym('alpha', DIMENSIONLESS);
    const rhs = sym('beta', DIMENSIONLESS);
    const report = validateBEDimensions(lhs, rhs, 'BE_fake');
    expect(report.ok).toBe(true);
    expect(report.lhsDim).toEqual(DIMENSIONLESS);
    expect(report.rhsDim).toEqual(DIMENSIONLESS);
  });

  it('handles compound RHS via op-trees', () => {
    // ENERGY = MASS * (LENGTH/TIME)^2, but here we test a simpler shape:
    // FREQUENCY = (DIMENSIONLESS)^2 * FREQUENCY
    const lhs = sym('gamma_k', FREQUENCY);
    const ratioSquared: ExprNode = {
      kind: 'op',
      op: '^',
      args: [
        { kind: 'op', op: '/', args: [sym('a', DIMENSIONLESS), sym('b', DIMENSIONLESS)] },
        sym('2', DIMENSIONLESS),
      ],
    };
    const rhs: ExprNode = {
      kind: 'op',
      op: '*',
      args: [sym('gamma_0', FREQUENCY), ratioSquared],
    };
    const report = validateBEDimensions(lhs, rhs, 'BE_fake');
    expect(report.ok).toBe(true);
    expect(report.lhsDim).toEqual(FREQUENCY);
    expect(report.rhsDim).toEqual(FREQUENCY);
  });

  it('the result shape matches `DimensionValidationReport` (ok + lhsDim + rhsDim, nothing else)', () => {
    const lhs = sym('x', TEMPERATURE);
    const rhs = sym('y', TEMPERATURE);
    const report = validateBEDimensions(lhs, rhs, 'BE_fake');
    expect(Object.keys(report).sort()).toEqual(['lhsDim', 'ok', 'rhsDim']);
  });

  it('the equationLabel argument is accepted but does not surface in the result (reserved for future)', () => {
    const lhs = sym('x', ENERGY);
    const rhs = sym('y', ENERGY);
    const a = validateBEDimensions(lhs, rhs, 'BE_label_A');
    const b = validateBEDimensions(lhs, rhs, 'BE_label_B');
    // The label doesn't affect the report — both calls produce equal reports.
    expect(a).toEqual(b);
  });

  it('does not throw on dimensional mismatch — it only reports', () => {
    const lhs = sym('L', LENGTH);
    const rhs = sym('T', TIME);
    expect(() => validateBEDimensions(lhs, rhs, 'BE_fake')).not.toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// sym — bug-sensitive factory (the highest-risk extraction)
// ─────────────────────────────────────────────────────────────────────────────

describe('sym — factory correctness (highest-risk extraction)', () => {
  it('produces a node with kind === "symbol"', () => {
    const node = sym('x', LENGTH);
    expect(node.kind).toBe('symbol');
  });

  it('preserves the name string exactly (no trim, no case-fold)', () => {
    const node = sym('  Phi_42  ', DIMENSIONLESS);
    expect((node as { name: string }).name).toBe('  Phi_42  ');
  });

  it('preserves the empty-string name (existing BE modules tolerate this)', () => {
    const node = sym('', DIMENSIONLESS);
    expect((node as { name: string }).name).toBe('');
  });

  it('preserves unicode names (existing BE modules use Greek letters)', () => {
    const node = sym('α', DIMENSIONLESS);
    expect((node as { name: string }).name).toBe('α');
  });

  it("preserves names that look like integers (e.g. '-1', '2', '3')", () => {
    expect((sym('-1', DIMENSIONLESS) as { name: string }).name).toBe('-1');
    expect((sym('2', DIMENSIONLESS) as { name: string }).name).toBe('2');
    expect((sym('3', DIMENSIONLESS) as { name: string }).name).toBe('3');
  });

  it("preserves names that look like number-prefixed words (e.g. '8pi')", () => {
    const node = sym('8pi', DIMENSIONLESS);
    expect((node as { name: string }).name).toBe('8pi');
  });

  it('passes the Dimension through by reference (no clone, no freeze)', () => {
    const dim: Dimension = { L: 1, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 };
    const node = sym('x', dim);
    expect((node as { dim: Dimension }).dim).toBe(dim); // identity, not equality
  });

  it('accepts all 7 SI base dims at extreme positive exponents', () => {
    const extreme: Dimension = { L: 5, M: 5, T: 5, I: 5, Theta: 5, N: 5, J: 5 };
    const node = sym('extreme_pos', extreme);
    expect((node as { dim: Dimension }).dim).toEqual(extreme);
  });

  it('accepts all 7 SI base dims at extreme negative exponents', () => {
    const extreme: Dimension = { L: -5, M: -5, T: -5, I: -5, Theta: -5, N: -5, J: -5 };
    const node = sym('extreme_neg', extreme);
    expect((node as { dim: Dimension }).dim).toEqual(extreme);
  });

  it('two calls with the same args produce structurally-equal but reference-distinct nodes (no memoisation)', () => {
    const a = sym('x', LENGTH);
    const b = sym('x', LENGTH);
    expect(a).not.toBe(b); // distinct identity
    expect(a).toEqual(b);  // structurally equal
  });

  it('the returned node has exactly { kind, name, dim } and nothing extra', () => {
    const node = sym('x', LENGTH);
    expect(Object.keys(node).sort()).toEqual(['dim', 'kind', 'name']);
  });

  it('the returned node is plain — no prototype chain noise', () => {
    const node = sym('x', LENGTH);
    expect(Object.getPrototypeOf(node)).toBe(Object.prototype);
  });

  it('the returned node is mutable (matches the pre-extraction factory; no Object.freeze)', () => {
    // Behaviour preservation: the original `(name, dim) => ({ ... })` did
    // not freeze; consumers (none today, but the test pins the contract)
    // could mutate the returned node. This test pins that behaviour.
    const node = sym('x', LENGTH) as { kind: string; name: string; dim: Dimension };
    expect(() => {
      node.name = 'y';
    }).not.toThrow();
    expect(node.name).toBe('y');
  });

  it('returned node satisfies `ExprNode` at the type level (smoke test via validateBEDimensions)', () => {
    const node = sym('x', LENGTH);
    const report = validateBEDimensions(node, sym('y', LENGTH), 'BE_fake');
    expect(report.ok).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Cross-helper integration: a fake BE module using all 3 helpers
// ─────────────────────────────────────────────────────────────────────────────

describe('cross-helper integration — fake BE module wiring all 3 helpers', () => {
  // A fake BE-NN module that uses sym + validateBEDimensions + validateFiniteInputs
  // together. Validates that the helpers compose end-to-end the way the real
  // per-BE-NN evaluators will use them after the Task 3.2 migration.

  const FAKE_LHS: ExprNode = sym('y', LENGTH);
  const FAKE_RHS: ExprNode = sym('x', LENGTH);

  interface FakeInputs {
    M_kg: number;
    R_m: number;
  }

  function evaluateFake(input: FakeInputs): number {
    validateFiniteInputs(
      input,
      [
        { name: 'M_kg', min: 0, excludeMin: true },
        { name: 'R_m', min: 0, excludeMin: true },
      ],
      'evaluateFake',
    );
    return input.M_kg * input.R_m;
  }

  function validateFakeDimensions() {
    return validateBEDimensions(FAKE_LHS, FAKE_RHS, 'FAKE_BE');
  }

  it('happy-path evaluator + happy-path validator both green', () => {
    expect(evaluateFake({ M_kg: 1.989e30, R_m: 1e9 })).toBeCloseTo(1.989e39);
    const report = validateFakeDimensions();
    expect(report.ok).toBe(true);
    expect(report.lhsDim).toEqual(LENGTH);
    expect(report.rhsDim).toEqual(LENGTH);
  });

  it('bad input is rejected with the canonical "positive" prose', () => {
    expect(() => evaluateFake({ M_kg: -1, R_m: 1 })).toThrow(/positive/);
    expect(() => evaluateFake({ M_kg: 1, R_m: 0 })).toThrow(/positive/);
    expect(() => evaluateFake({ M_kg: Number.NaN, R_m: 1 })).toThrow(/finite/);
  });

  it('a mismatched-dim fake bridge reports ok=false (no throw)', () => {
    const lhs = sym('time-side', TIME);
    const rhs = sym('len-side', LENGTH);
    const report = validateBEDimensions(lhs, rhs, 'FAKE_BAD');
    expect(report.ok).toBe(false);
  });
});
