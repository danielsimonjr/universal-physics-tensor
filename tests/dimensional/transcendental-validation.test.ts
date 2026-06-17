/**
 * Dimensional validation of the `transcendental` scalar-AST node:
 * a DIMENSIONLESS argument yields a DIMENSIONLESS result; a dimensionful
 * argument is a dimension violation.
 *
 * @module tests/dimensional/transcendental-validation
 */
import { describe, it, expect } from 'vitest';
import { validate } from '../../src/dimensional/validator.js';
import type { ExprNode, TranscendentalFn } from '../../src/dimensional/validator.js';
import { equals } from '../../src/dimensional/algebra.js';
import { DIMENSIONLESS, LENGTH } from '../../src/dimensional/types.js';

const dimensionless = (name: string): ExprNode => ({ kind: 'symbol', name, dim: DIMENSIONLESS });
const lengthSym = (name: string): ExprNode => ({ kind: 'symbol', name, dim: LENGTH });
const tx = (fn: TranscendentalFn, arg: ExprNode): ExprNode => ({ kind: 'transcendental', fn, arg });

const ALL_FNS: TranscendentalFn[] = [
  'exp', 'ln', 'log2', 'log10', 'sin', 'cos', 'tan', 'sinh', 'cosh', 'tanh',
];

describe('transcendental node — dimensional validation', () => {
  for (const fn of ALL_FNS) {
    it(`${fn}(dimensionless) → DIMENSIONLESS, validates`, () => {
      const r = validate(tx(fn, dimensionless('x')));
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).not.toBeNull();
      expect(equals(r.inferredDimension!, DIMENSIONLESS)).toBe(true);
    });
  }

  it('rejects a dimensionful argument (length is not dimensionless)', () => {
    const r = validate(tx('exp', lengthSym('L')));
    expect(r.ok).toBe(false);
    expect(r.violations.length).toBeGreaterThan(0);
    expect(r.violations.some((v) => /dimensionless argument/i.test(v.note ?? ''))).toBe(true);
  });

  it('accepts a dimensionless ratio of dimensionful symbols (length / length)', () => {
    // ln(R_far / R_near) — the BE-37 shape: the ratio is dimensionless.
    const ratio: ExprNode = { kind: 'op', op: '/', args: [lengthSym('R_far'), lengthSym('R_near')] };
    const r = validate(tx('ln', ratio));
    expect(r.ok).toBe(true);
    expect(equals(r.inferredDimension!, DIMENSIONLESS)).toBe(true);
  });
});
