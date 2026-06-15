/**
 * Geometrized boundary adapters (G-9 increment 1; Adam+Eve-vetted —
 * docs/planning/v0.13-G9-Adapters-Plan.md). The dimension functor drives the
 * SI↔geometrized conversion `Q_geom = Q_SI·G^M·c^(T−2M)`. Pins (Eve-verified):
 * absolute factor values, mass-energy self-consistency, the round-trip
 * property, and the I/Θ/N/J domain guard. Round-trips alone are insufficient
 * (a wrong factor cancels) — the absolute pins fix the factor.
 */
import { describe, it, expect } from 'vitest';
import {
  toGeometrized,
  fromGeometrized,
  geometrizedFactor,
  NonGeometrizableDimensionError,
} from '../../src/numerical/geometrized.js';
import { C_SI, G_SI, M_SUN_SI } from '../../src/core/constants.js';
import {
  MASS,
  TIME,
  LENGTH,
  VELOCITY,
  ENERGY,
  ACCELERATION,
  CHARGE,
  TEMPERATURE,
  DIMENSIONLESS,
  type Dimension,
} from '../../src/dimensional/types.js';

const relErr = (a: number, b: number) => Math.abs(a - b) / Math.abs(b);

describe('geometrized adapters — absolute factor pins (fix the factor)', () => {
  it('M_sun → GM_sun/c² ≈ 1477 m (the Schwarzschild radius is 2× this)', () => {
    const geom = toGeometrized(M_SUN_SI, MASS);
    expect(relErr(geom, (G_SI * M_SUN_SI) / (C_SI * C_SI))).toBeLessThan(1e-12);
    expect(geom).toBeGreaterThan(1476);
    expect(geom).toBeLessThan(1478);
  });

  it('1 second → c metres (exact)', () => {
    expect(toGeometrized(1, TIME)).toBe(C_SI);
  });

  it('the speed of light is geometrized-1 (exact)', () => {
    expect(toGeometrized(C_SI, VELOCITY)).toBe(1);
  });

  it('a length is the geometrized base — identity (factor 1)', () => {
    expect(toGeometrized(123.45, LENGTH)).toBe(123.45);
    expect(geometrizedFactor(LENGTH)).toBe(1);
    expect(geometrizedFactor(DIMENSIONLESS)).toBe(1);
  });
});

describe('geometrized adapters — self-consistency + round-trip', () => {
  it('mass-energy maps like mass: to(m·c²) ≈ to(m) (the functor is consistent)', () => {
    const m = 3.0;
    expect(
      relErr(toGeometrized(m * C_SI * C_SI, ENERGY), toGeometrized(m, MASS)),
    ).toBeLessThan(1e-15);
  });

  it('from∘to = id to ≤1 ulp across the dimension lattice', () => {
    const dims: Dimension[] = [LENGTH, MASS, TIME, VELOCITY, ENERGY, ACCELERATION];
    const values = [1, 2.5, 1e30, 6.6743e-11, -7.3, 1e-18];
    for (const dim of dims) {
      for (const x of values) {
        expect(relErr(fromGeometrized(toGeometrized(x, dim), dim), x)).toBeLessThan(1e-15);
      }
    }
  });

  it('fractional exponents are finite (no NaN/Inf)', () => {
    const half: Dimension = { L: 0, M: 0.5, T: 0.5, I: 0, Theta: 0, N: 0, J: 0 };
    expect(Number.isFinite(geometrizedFactor(half))).toBe(true);
  });
});

describe('geometrized adapters — domain guard (only c and G)', () => {
  it('rejects a charge (electric-current) dimension', () => {
    expect(() => geometrizedFactor(CHARGE)).toThrow(NonGeometrizableDimensionError);
  });
  it('rejects a temperature dimension', () => {
    expect(() => toGeometrized(300, TEMPERATURE)).toThrow(NonGeometrizableDimensionError);
  });
});
