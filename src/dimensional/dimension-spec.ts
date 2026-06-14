/**
 * Dimension-spec parser — turns a human string into a {@link Dimension},
 * so CLI users can declare a quantity's dimensions without TypeScript.
 *
 * Accepts (in priority order):
 *   1. a named dimension — `length`, `time`, `mass`, `velocity`,
 *      `acceleration`, `force`, `energy`, `power`, `action`, `frequency`,
 *      `temperature`, `entropy`, `charge`, `area`, `dimensionless`;
 *   2. a fundamental constant by name — `hbar`/`ℏ`, `c`, `G`, `k_B`/`kB`,
 *      `e` (its SI dimension);
 *   3. explicit base exponents — `L^3.M^-1.T^-2` (bases L M T I Theta/Θ N J,
 *      separated by `.`, `*`, or spaces; `^` optional; fractional exponents
 *      like `T^1/2` allowed).
 *
 * @module dimensional/dimension-spec
 */

import type { Dimension } from './types.js';
import {
  DIMENSIONLESS,
  LENGTH,
  AREA,
  TIME,
  FREQUENCY,
  MASS,
  VELOCITY,
  ACCELERATION,
  FORCE,
  ENERGY,
  POWER,
  ACTION,
  TEMPERATURE,
  ENTROPY,
  CHARGE,
} from './types.js';

/** A bad dimension spec. */
export class DimensionSpecError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DimensionSpecError';
  }
}

const d = (
  L = 0,
  M = 0,
  T = 0,
  Theta = 0,
  I = 0,
): Dimension => ({ L, M, T, I, Theta, N: 0, J: 0 });

/** Named dimensions — matched case-insensitively. */
const NAMED_DIMS: Readonly<Record<string, Dimension>> = {
  dimensionless: DIMENSIONLESS,
  length: LENGTH,
  area: AREA,
  time: TIME,
  frequency: FREQUENCY,
  mass: MASS,
  velocity: VELOCITY,
  acceleration: ACCELERATION,
  force: FORCE,
  energy: ENERGY,
  power: POWER,
  action: ACTION,
  temperature: TEMPERATURE,
  entropy: ENTROPY,
  charge: CHARGE,
};

/** Fundamental constants by their SI dimension — matched EXACT-case, so
 *  `G` (Newton's constant) is never confused with `g` (acceleration). */
const CONST_DIMS: Readonly<Record<string, Dimension>> = {
  hbar: ACTION,
  'ℏ': ACTION,
  c: VELOCITY,
  G: d(3, -1, -2),
  k_B: ENTROPY, // Boltzmann (J/K)
  kB: ENTROPY,
  e: CHARGE, // elementary charge (A·s)
};

const BASES: Record<string, keyof Dimension> = {
  L: 'L',
  M: 'M',
  T: 'T',
  I: 'I',
  THETA: 'Theta',
  'Θ': 'Theta',
  N: 'N',
  J: 'J',
};

function parseExponent(raw: string): number {
  if (raw === '') return 1;
  if (raw.includes('/')) {
    const [n, den] = raw.split('/');
    const num = Number(n);
    const dd = Number(den);
    if (!Number.isFinite(num) || !Number.isFinite(dd) || dd === 0) {
      throw new DimensionSpecError(`bad exponent '${raw}'`);
    }
    return num / dd;
  }
  const v = Number(raw);
  if (!Number.isFinite(v)) throw new DimensionSpecError(`bad exponent '${raw}'`);
  return v;
}

/** Parse a dimension spec string into a {@link Dimension}. @internal */
export function parseDimensionSpec(spec: string): Dimension {
  const s = spec.trim();
  if (!s) throw new DimensionSpecError('empty dimension spec');

  // (1) fundamental constant — EXACT case (G ≠ g).
  if (CONST_DIMS[s]) return CONST_DIMS[s];
  // (2) named dimension — case-insensitive.
  const named = NAMED_DIMS[s.toLowerCase()];
  if (named) return named;

  // (3) explicit base exponents.
  const out = d();
  const parts = s.split(/[.*\s]+/).filter(Boolean);
  for (const part of parts) {
    const m = /^([A-Za-zΘ]+)\^?(-?\d+(?:\/\d+)?)?$/.exec(part);
    if (!m) throw new DimensionSpecError(`unrecognized dimension term '${part}'`);
    const baseKey = BASES[m[1].toUpperCase()] ?? BASES[m[1]];
    if (!baseKey) {
      throw new DimensionSpecError(
        `unknown base dimension '${m[1]}' (use L M T I Theta N J, a named ` +
          `dimension, or a constant name)`,
      );
    }
    out[baseKey] += parseExponent(m[2] ?? '');
  }
  return out;
}
