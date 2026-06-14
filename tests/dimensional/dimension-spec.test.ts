/**
 * Dimension-spec parser (src/dimensional/dimension-spec.ts) — turns CLI
 * strings into Dimensions: named dims, constants (exact-case so G ≠ g),
 * explicit base exponents (incl. fractional), and error handling.
 */
import { describe, it, expect } from 'vitest';
import {
  parseDimensionSpec,
  DimensionSpecError,
} from '../../src/dimensional/dimension-spec.js';
import {
  LENGTH,
  VELOCITY,
  ACTION,
  ENTROPY,
  AREA,
  DIMENSIONLESS,
} from '../../src/dimensional/types.js';

describe('parseDimensionSpec — named dimensions', () => {
  it('resolves named dimensions case-insensitively', () => {
    expect(parseDimensionSpec('length')).toEqual(LENGTH);
    expect(parseDimensionSpec('Velocity')).toEqual(VELOCITY);
    expect(parseDimensionSpec('dimensionless')).toEqual(DIMENSIONLESS);
  });
});

describe('parseDimensionSpec — constants (exact-case)', () => {
  it('maps constant names to their SI dimension', () => {
    expect(parseDimensionSpec('hbar')).toEqual(ACTION);
    expect(parseDimensionSpec('ℏ')).toEqual(ACTION);
    expect(parseDimensionSpec('c')).toEqual(VELOCITY);
    expect(parseDimensionSpec('k_B')).toEqual(ENTROPY);
    expect(parseDimensionSpec('G')).toEqual({
      L: 3, M: -1, T: -2, I: 0, Theta: 0, N: 0, J: 0,
    });
  });

  it('does NOT confuse G (Newton constant) with g (acceleration)', () => {
    // 'G' is the constant; lowercase 'g' is not a named term → must error,
    // not silently become Newton's constant.
    expect(parseDimensionSpec('G').L).toBe(3);
    expect(() => parseDimensionSpec('g')).toThrow(DimensionSpecError);
  });
});

describe('parseDimensionSpec — explicit base exponents', () => {
  it('parses L^a.M^b.T^c forms', () => {
    expect(parseDimensionSpec('L^3.M^-1.T^-2')).toEqual({
      L: 3, M: -1, T: -2, I: 0, Theta: 0, N: 0, J: 0,
    });
    expect(parseDimensionSpec('L2')).toEqual(AREA);
    expect(parseDimensionSpec('L M T-2')).toEqual({
      L: 1, M: 1, T: -2, I: 0, Theta: 0, N: 0, J: 0,
    });
  });

  it('accepts fractional exponents and Theta/Θ', () => {
    expect(parseDimensionSpec('T^1/2').T).toBeCloseTo(0.5, 12);
    expect(parseDimensionSpec('Theta').Theta).toBe(1);
    expect(parseDimensionSpec('Θ^-1').Theta).toBe(-1);
  });

  it('rejects empty and unknown bases', () => {
    expect(() => parseDimensionSpec('')).toThrow(DimensionSpecError);
    expect(() => parseDimensionSpec('Q^2')).toThrow(/unknown base/);
  });
});
