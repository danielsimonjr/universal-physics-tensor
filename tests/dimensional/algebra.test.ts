/**
 * Tests for dimensional algebra.
 *
 * SI base dimensions chosen per BIPM SI Brochure 9th ed. (2019), Table 3:
 *   length L, mass M, time T, electric current I, thermodynamic temperature Theta,
 *   amount of substance N, luminous intensity J.
 *
 * References:
 *  - BIPM, "The International System of Units (SI)", 9th edition, 2019.
 *  - NIST Special Publication 811 (2008), Section 4 (derived SI units).
 */

import { describe, it, expect } from 'vitest';
import {
  multiply,
  divide,
  power,
  add,
  equals,
  format,
  DimensionMismatchError,
} from '../../src/dimensional/algebra.js';
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
  ACTION,
  CHARGE,
  Dimension,
} from '../../src/dimensional/types.js';

describe('dimensional algebra: multiply', () => {
  it('multiplies LENGTH * LENGTH = L^2', () => {
    expect(multiply(LENGTH, LENGTH)).toEqual({
      L: 2, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0,
    });
  });

  it('multiplies MASS * ACCELERATION = FORCE (Newton II law)', () => {
    expect(equals(multiply(MASS, ACCELERATION), FORCE)).toBe(true);
  });

  it('treats DIMENSIONLESS as the identity', () => {
    expect(equals(multiply(DIMENSIONLESS, ENERGY), ENERGY)).toBe(true);
    expect(equals(multiply(ENERGY, DIMENSIONLESS), ENERGY)).toBe(true);
  });

  it('is commutative', () => {
    expect(equals(multiply(MASS, VELOCITY), multiply(VELOCITY, MASS))).toBe(true);
  });
});

describe('dimensional algebra: divide', () => {
  it('LENGTH / TIME = VELOCITY', () => {
    expect(equals(divide(LENGTH, TIME), VELOCITY)).toBe(true);
  });

  it('VELOCITY / TIME = ACCELERATION', () => {
    expect(equals(divide(VELOCITY, TIME), ACCELERATION)).toBe(true);
  });

  it('a / a = DIMENSIONLESS for any a', () => {
    expect(equals(divide(ENERGY, ENERGY), DIMENSIONLESS)).toBe(true);
    expect(equals(divide(ACTION, ACTION), DIMENSIONLESS)).toBe(true);
  });
});

describe('dimensional algebra: power', () => {
  it('LENGTH^2 has L exponent 2', () => {
    expect(power(LENGTH, 2)).toEqual({
      L: 2, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0,
    });
  });

  it('VELOCITY^2 = L^2 T^-2', () => {
    expect(power(VELOCITY, 2)).toEqual({
      L: 2, M: 0, T: -2, I: 0, Theta: 0, N: 0, J: 0,
    });
  });

  it('a^0 = DIMENSIONLESS', () => {
    expect(equals(power(ENERGY, 0), DIMENSIONLESS)).toBe(true);
  });

  it('supports negative exponents (inverse)', () => {
    expect(equals(power(TIME, -1), { L: 0, M: 0, T: -1, I: 0, Theta: 0, N: 0, J: 0 } as Dimension)).toBe(true);
  });
});

describe('dimensional algebra: add', () => {
  it('returns the common dimension when inputs match', () => {
    expect(equals(add(ENERGY, ENERGY), ENERGY)).toBe(true);
  });

  it('throws DimensionMismatchError when inputs differ', () => {
    expect(() => add(ENERGY, LENGTH)).toThrow(DimensionMismatchError);
  });
});

describe('dimensional algebra: equals', () => {
  it('LENGTH equals LENGTH', () => {
    expect(equals(LENGTH, { L: 1, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 })).toBe(true);
  });

  it('LENGTH does not equal TIME', () => {
    expect(equals(LENGTH, TIME)).toBe(false);
  });
});

describe('dimensional algebra: format', () => {
  it('produces "[1]" for DIMENSIONLESS', () => {
    expect(format(DIMENSIONLESS)).toBe('[1]');
  });

  it('produces "[length]" or "[L]" for LENGTH', () => {
    const s = format(LENGTH);
    expect(s === '[L]' || s.toLowerCase().includes('length')).toBe(true);
  });

  it('produces "[M L^2 T^-2]" for ENERGY (or recognizes named dim)', () => {
    const s = format(ENERGY);
    // Accept either the symbolic form or a named-dimension lookup hit.
    expect(s === '[M L^2 T^-2]' || s.toLowerCase().includes('energy')).toBe(true);
  });

  it('emits a recognizable form for inverse time (frequency)', () => {
    const inverseTime = power(TIME, -1);
    const s = format(inverseTime);
    // Either symbolic (T^-1) or the named dimension "frequency".
    expect(s.includes('T^-1') || s.toLowerCase().includes('frequency')).toBe(true);
  });

  it('emits explicit symbolic form for an unnamed compound dimension', () => {
    // L^2 / T^3 has no named SI dimension in our table; should fall back to symbolic.
    const weird: Dimension = { L: 2, M: 0, T: -3, I: 0, Theta: 0, N: 0, J: 0 };
    const s = format(weird);
    expect(s).toContain('L^2');
    expect(s).toContain('T^-3');
  });
});

describe('dimensional algebra: structural sanity', () => {
  it('TEMPERATURE has Theta exponent 1', () => {
    expect(TEMPERATURE.Theta).toBe(1);
  });

  it('ENTROPY = ENERGY / TEMPERATURE per Boltzmann S = k_B ln W', () => {
    expect(equals(divide(ENERGY, TEMPERATURE), ENTROPY)).toBe(true);
  });

  it('CHARGE = current * time per SI definition (q = I·t)', () => {
    expect(equals(multiply({ L: 0, M: 0, T: 0, I: 1, Theta: 0, N: 0, J: 0 }, TIME), CHARGE)).toBe(true);
  });
});
