/**
 * Single-unknown dimensional inference: given a parsed RHS `ExprNode` with one
 * unknown symbol (carrying a placeholder dimension) and a known target
 * dimension, recover the unknown's dimension from homogeneity — or abstain
 * (`null`) when it isn't uniquely pinned.
 *
 * @module tests/dimensional/dimension-inference
 */
import { describe, it, expect } from 'vitest';
import {
  substituteSymbolDim,
  inferUnknownDimension,
} from '../../src/dimensional/dimension-inference.js';
import { builtinFormulaDimensionChecker } from '../../src/numerical/formula-dimension.js';
import { LENGTH, TIME, MASS, FORCE, ENERGY, AREA, DIMENSIONLESS } from '../../src/dimensional/types.js';
import { equals, multiply } from '../../src/dimensional/algebra.js';
import { validate } from '../../src/dimensional/validator.js';

const b = builtinFormulaDimensionChecker();
// Parse RHS text with the unknown given a DIMENSIONLESS placeholder.
const rhs = (text: string, dims: Record<string, typeof LENGTH>) => b.parse(text, dims).expr;

describe('substituteSymbolDim', () => {
  it('replaces the dimension of every matching symbol (and leaves the original)', () => {
    const expr = rhs('a*b', { a: LENGTH, b: TIME });
    const sub = substituteSymbolDim(expr, 'a', MASS);
    // substituted tree: a is now MASS → a*b is M·T
    expect(equals(validate(sub).inferredDimension!, multiply(MASS, TIME))).toBe(true);
    // original tree is untouched → still L·T
    expect(equals(validate(expr).inferredDimension!, multiply(LENGTH, TIME))).toBe(true);
  });
});

describe('inferUnknownDimension', () => {
  it('pins an unknown in a quotient: force = enrgy / length ⟹ enrgy is [energy]', () => {
    const expr = rhs('enrgy / length', { enrgy: DIMENSIONLESS, length: LENGTH });
    const dim = inferUnknownDimension(expr, 'enrgy', FORCE);
    expect(dim).not.toBeNull();
    expect(equals(dim!, ENERGY)).toBe(true);
  });

  it('pins an unknown under a power: area = x^2 ⟹ x is [length]', () => {
    const expr = rhs('x^2', { x: DIMENSIONLESS });
    const dim = inferUnknownDimension(expr, 'x', AREA);
    expect(dim).not.toBeNull();
    expect(equals(dim!, LENGTH)).toBe(true);
  });

  it('abstains when the unknown is sum-constrained (non-homogeneous under probe)', () => {
    // Parses (both dimensionless), but probing x with LENGTH breaks the sum's
    // homogeneity → the unknown is constrained, not freely solvable.
    const expr = rhs('x + y', { x: DIMENSIONLESS, y: DIMENSIONLESS });
    expect(inferUnknownDimension(expr, 'x', LENGTH)).toBeNull();
  });

  it('abstains when the unknown does not affect the dimension (p = 0)', () => {
    const expr = rhs('length', { length: LENGTH });
    expect(inferUnknownDimension(expr, 'x', LENGTH)).toBeNull(); // x absent
  });

  it('abstains when the result would have a fractional exponent (x^2 = [length])', () => {
    const expr = rhs('x^2', { x: DIMENSIONLESS });
    expect(inferUnknownDimension(expr, 'x', LENGTH)).toBeNull(); // [length]^½ is not real
  });

  it('snaps an integer exponent that arrived with FP round-off in the target', () => {
    // A target dimension that suffered round-off upstream (a v0.20 fractional-
    // power computation can leave L = 2 + ε): a bare Number.isInteger check
    // spuriously abstains on this real [L^2] answer. The tolerance snap recovers
    // it — consistent with the `equals` fractional-exponent tolerance (bb15432).
    const expr = rhs('x', { x: DIMENSIONLESS });
    const noisyL2 = { L: 2 + 1e-10, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 };
    const dim = inferUnknownDimension(expr, 'x', noisyL2);
    expect(dim).not.toBeNull();
    expect(dim!.L).toBe(2); // snapped to the clean integer
  });

  it('still abstains on a genuinely fractional target exponent (beyond tolerance)', () => {
    const expr = rhs('x', { x: DIMENSIONLESS });
    const halfL = { L: 0.5, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 };
    expect(inferUnknownDimension(expr, 'x', halfL)).toBeNull();
  });
});
