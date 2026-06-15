/**
 * Dimensional-derivation benchmark: known physics equations DERIVED by
 * the Buckingham-π engine (docs/research/Dimensional-Derivation-
 * Benchmark.md). Each case declares a target, the governing variables
 * (with SI dimensions), and the textbook monomial; the engine must
 * recover that monomial UP TO A DIMENSIONLESS CONSTANT. A failure here
 * means the engine no longer reproduces a classical dimensional-analysis
 * result.
 *
 * These are derivations BY DIMENSIONS ALONE — the engine cannot and does
 * not supply the leading constant (2π for the pendulum, √(2π) for the
 * thermal wavelength, etc.); only the exponents.
 */
import { describe, it, expect } from 'vitest';
import {
  buckinghamPi,
  dimensionallyDetermines,
} from '../../src/dimensional/buckingham.js';
import type { DimensionalVariable } from '../../src/dimensional/buckingham.js';
import type { Dimension } from '../../src/dimensional/types.js';
import {
  LENGTH,
  TIME,
  MASS,
  VELOCITY,
  ACCELERATION,
} from '../../src/dimensional/types.js';
import { D } from '../fixtures/dimension.js';

const v = (name: string, dim: Dimension): DimensionalVariable => ({ name, dim });

// Constants / derived dims used across the benchmark.
const G = D(3, -1, -2); // Newton's constant
const HBAR = D(2, 1, -1); // reduced Planck (action)
const C = VELOCITY; // speed of light
const K_B = D(2, 1, -2, -1); // Boltzmann
const TEMP = D(0, 0, 0, 1); // temperature
const FORCE = D(1, 1, -2);
const LIN_DENSITY = D(-1, 1, 0); // mass per length
const MASS_DENSITY = D(-3, 1, 0);
const DYN_VISCOSITY = D(-1, 1, -1); // Pa·s

interface BenchCase {
  readonly name: string;
  readonly target: DimensionalVariable;
  readonly governing: readonly DimensionalVariable[];
  readonly monomial: Readonly<Record<string, number>>;
}

const BENCHMARK: readonly BenchCase[] = [
  {
    name: 'Pendulum period  T = 2π·√(L/g)',
    target: v('period', TIME),
    governing: [v('length', LENGTH), v('gravity', ACCELERATION)],
    monomial: { length: 0.5, gravity: -0.5 },
  },
  {
    name: "Kepler's third law  T² = 4π²·a³/(GM)",
    target: v('period', TIME),
    governing: [v('semi-major-axis', LENGTH), v('G', G), v('mass', MASS)],
    monomial: { 'semi-major-axis': 1.5, G: -0.5, mass: -0.5 },
  },
  {
    name: 'Schwarzschild radius  r_s = 2·GM/c²',
    target: v('radius', LENGTH),
    governing: [v('mass', MASS), v('G', G), v('c', C)],
    monomial: { mass: 1, G: 1, c: -2 },
  },
  {
    name: 'Wave speed on a string  v = √(F/μ)',
    target: v('speed', VELOCITY),
    governing: [v('tension', FORCE), v('linear-density', LIN_DENSITY)],
    monomial: { tension: 0.5, 'linear-density': -0.5 },
  },
  {
    name: 'Planck length  ℓ_P = √(ℏG/c³)',
    target: v('planck-length', LENGTH),
    governing: [v('hbar', HBAR), v('G', G), v('c', C)],
    monomial: { hbar: 0.5, G: 0.5, c: -1.5 },
  },
  {
    name: 'Planck mass  m_P = √(ℏc/G)',
    target: v('planck-mass', MASS),
    governing: [v('hbar', HBAR), v('c', C), v('G', G)],
    monomial: { hbar: 0.5, c: 0.5, G: -0.5 },
  },
  {
    name: 'Planck time  t_P = √(ℏG/c⁵)',
    target: v('planck-time', TIME),
    governing: [v('hbar', HBAR), v('G', G), v('c', C)],
    monomial: { hbar: 0.5, G: 0.5, c: -2.5 },
  },
  {
    name: 'Compton wavelength  λ_C = ℏ/(mc)',
    target: v('compton-wavelength', LENGTH),
    governing: [v('hbar', HBAR), v('mass', MASS), v('c', C)],
    monomial: { hbar: 1, mass: -1, c: -1 },
  },
  {
    name: 'Thermal de Broglie wavelength  λ ∝ ℏ/√(m k_B T)  [BE-12]',
    target: v('thermal-wavelength', LENGTH),
    governing: [
      v('hbar', HBAR),
      v('mass', MASS),
      v('boltzmann', K_B),
      v('temperature', TEMP),
    ],
    monomial: { hbar: 1, mass: -0.5, boltzmann: -0.5, temperature: -0.5 },
  },
];

describe('dimensional-derivation benchmark — known equations derived by the engine', () => {
  for (const c of BENCHMARK) {
    it(`derives ${c.name}`, () => {
      const res = dimensionallyDetermines(c.target, c.governing);
      expect(res.determined).toBe(true);
      expect(res.upToDimensionlessConstant).toBe(true);
      // every expected exponent recovered (rational exponents are exact)
      for (const [name, exp] of Object.entries(c.monomial)) {
        expect(res.monomial![name]).toBeCloseTo(exp, 10);
      }
      // and no extra non-zero exponents the textbook form lacks
      for (const [name, exp] of Object.entries(res.monomial!)) {
        if (!(name in c.monomial)) expect(exp).toBeCloseTo(0, 10);
      }
    });
  }

  it('Reynolds number is the single dimensionless group of {ρ, v, L, μ}', () => {
    const r = buckinghamPi([
      v('density', MASS_DENSITY),
      v('velocity', VELOCITY),
      v('length', LENGTH),
      v('dyn-viscosity', DYN_VISCOSITY),
    ]);
    expect(r.piGroupCount).toBe(1);
    expect(r.verdict).toBe('single-invariant');
    // Re = ρ·v·L/μ  (normalized so the first nonzero exponent is positive)
    expect(r.piGroups[0].exponents).toEqual({
      density: 1,
      velocity: 1,
      length: 1,
      'dyn-viscosity': -1,
    });
  });

  it('the benchmark count is pinned (so additions are deliberate)', () => {
    expect(BENCHMARK.length).toBe(9);
  });
});
