/**
 * Dimensional algebra: per-base-exponent arithmetic.
 *
 * Operations follow standard dimensional analysis (Bridgman, "Dimensional Analysis", 1922):
 *   - multiply: add exponents per base
 *   - divide:   subtract exponents per base
 *   - power:    scale exponents by the scalar `n`
 *   - add/sub:  permitted only when both operands have the same dimension
 *
 * @module dimensional/algebra
 */

import { Dimension, NAMED_DIMENSIONS } from './types.js';

const BASES = ['L', 'M', 'T', 'I', 'Theta', 'N', 'J'] as const;
type Base = typeof BASES[number];

/** Thrown by `add`/`sub` and equation-level checks when dimensions disagree. */
export class DimensionMismatchError extends Error {
  public readonly expected: Dimension;
  public readonly actual: Dimension;
  constructor(message: string, expected: Dimension, actual: Dimension) {
    super(message);
    this.name = 'DimensionMismatchError';
    this.expected = expected;
    this.actual = actual;
  }
}

export function multiply(a: Dimension, b: Dimension): Dimension {
  const out = {} as Dimension;
  for (const base of BASES) {
    out[base as Base] = a[base as Base] + b[base as Base];
  }
  return out;
}

export function divide(a: Dimension, b: Dimension): Dimension {
  const out = {} as Dimension;
  for (const base of BASES) {
    out[base as Base] = a[base as Base] - b[base as Base];
  }
  return out;
}

export function power(a: Dimension, n: number): Dimension {
  const out = {} as Dimension;
  for (const base of BASES) {
    out[base as Base] = a[base as Base] * n;
  }
  return out;
}

export function equals(a: Dimension, b: Dimension): boolean {
  for (const base of BASES) {
    if (a[base as Base] !== b[base as Base]) return false;
  }
  return true;
}

export function add(a: Dimension, b: Dimension): Dimension {
  if (!equals(a, b)) {
    throw new DimensionMismatchError(
      `Cannot add unlike dimensions: ${format(a)} + ${format(b)}`,
      a,
      b,
    );
  }
  return { ...a };
}

export function subtract(a: Dimension, b: Dimension): Dimension {
  if (!equals(a, b)) {
    throw new DimensionMismatchError(
      `Cannot subtract unlike dimensions: ${format(a)} - ${format(b)}`,
      a,
      b,
    );
  }
  return { ...a };
}

/**
 * Format a `Dimension` for human display.
 *
 * Strategy:
 *   1. If `d` matches a named SI dimension exactly, return e.g. "[energy]".
 *      "dimensionless" is rendered as "[1]" for compactness.
 *   2. Otherwise emit the bracketed product form, e.g. "[M L^2 T^-2]".
 *      Bases with exponent 0 are omitted; exponent 1 is written without "^1".
 */
export function format(d: Dimension): string {
  for (const [name, ref] of NAMED_DIMENSIONS) {
    if (equals(d, ref)) {
      if (name === 'dimensionless') return '[1]';
      return `[${name}]`;
    }
  }
  const parts: string[] = [];
  for (const base of BASES) {
    const exp = d[base as Base];
    if (exp === 0) continue;
    if (exp === 1) parts.push(base);
    else parts.push(`${base}^${exp}`);
  }
  if (parts.length === 0) return '[1]';
  return `[${parts.join(' ')}]`;
}
