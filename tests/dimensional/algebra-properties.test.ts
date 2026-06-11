/**
 * v0.8.0 Phase 5 (G-10) — property-based tests for the dimensional
 * calculus.
 *
 * The example-based suite samples the input space pointwise; these
 * properties pin the algebraic LAWS: SI dimensions form an abelian
 * group (ℤ⁷ under exponent addition) with `multiply` as the operation,
 * `DIMENSIONLESS` as identity, and `power(·, −1)` as inverse — the
 * structure the dimension-functor claim in Part-X rests on.
 */
import { describe, it } from 'vitest';
import fc from 'fast-check';
import {
  divide,
  equals,
  multiply,
  power,
} from '../../src/dimensional/algebra.js';
import { DIMENSIONLESS } from '../../src/dimensional/types.js';
import type { Dimension } from '../../src/dimensional/types.js';

/** Arbitrary Dimension with integer exponents in [−6, 6]. */
const arbDim = fc
  .record({
    L: fc.integer({ min: -6, max: 6 }),
    M: fc.integer({ min: -6, max: 6 }),
    T: fc.integer({ min: -6, max: 6 }),
    I: fc.integer({ min: -6, max: 6 }),
    Theta: fc.integer({ min: -6, max: 6 }),
    N: fc.integer({ min: -6, max: 6 }),
    J: fc.integer({ min: -6, max: 6 }),
  })
  .map((d) => d as Dimension);

describe('dimensional algebra — abelian-group laws (property-based)', () => {
  it('multiply is associative', () => {
    fc.assert(
      fc.property(arbDim, arbDim, arbDim, (a, b, c) =>
        equals(multiply(multiply(a, b), c), multiply(a, multiply(b, c))),
      ),
    );
  });

  it('multiply is commutative', () => {
    fc.assert(
      fc.property(arbDim, arbDim, (a, b) =>
        equals(multiply(a, b), multiply(b, a)),
      ),
    );
  });

  it('DIMENSIONLESS is the identity', () => {
    fc.assert(
      fc.property(arbDim, (a) => equals(multiply(a, DIMENSIONLESS), a)),
    );
  });

  it('power(a, −1) is the inverse: a · a⁻¹ = 1', () => {
    fc.assert(
      fc.property(arbDim, (a) =>
        equals(multiply(a, power(a, -1)), DIMENSIONLESS),
      ),
    );
  });

  it('divide is multiply-by-inverse: a/b = a · b⁻¹', () => {
    fc.assert(
      fc.property(arbDim, arbDim, (a, b) =>
        equals(divide(a, b), multiply(a, power(b, -1))),
      ),
    );
  });

  it('cancellation: (a·b)/b = a', () => {
    fc.assert(
      fc.property(arbDim, arbDim, (a, b) =>
        equals(divide(multiply(a, b), b), a),
      ),
    );
  });

  it('power distributes over multiply: (a·b)ⁿ = aⁿ·bⁿ', () => {
    fc.assert(
      fc.property(arbDim, arbDim, fc.integer({ min: -3, max: 3 }), (a, b, n) =>
        equals(power(multiply(a, b), n), multiply(power(a, n), power(b, n))),
      ),
    );
  });

  it('equals is reflexive, symmetric, and respects multiply (congruence)', () => {
    fc.assert(fc.property(arbDim, (a) => equals(a, a)));
    fc.assert(
      fc.property(arbDim, arbDim, (a, b) => equals(a, b) === equals(b, a)),
    );
    fc.assert(
      fc.property(arbDim, arbDim, arbDim, (a, b, c) => {
        if (!equals(a, b)) return true;
        return equals(multiply(a, c), multiply(b, c));
      }),
    );
  });
});
