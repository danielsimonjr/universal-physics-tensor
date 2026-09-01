/**
 * Family B scorer for pendulum-scaling. Must not be imported from src/.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));

export interface HiddenTruth {
  readonly monomial: Readonly<Record<string, number>>;
  readonly prefactor: number;
  readonly canonicalId?: string;
}

export function loadHiddenTruth(): HiddenTruth {
  return JSON.parse(readFileSync(join(here, 'hidden-truth.json'), 'utf8')) as HiddenTruth;
}

export function monomialMatches(
  got: Readonly<Record<string, number>> | null,
  want: Readonly<Record<string, number>>,
  tol = 1e-9,
): boolean {
  if (!got) return false;
  const keys = new Set([...Object.keys(got), ...Object.keys(want)]);
  for (const k of keys) {
    if (Math.abs((got[k] ?? 0) - (want[k] ?? 0)) > tol) return false;
  }
  return true;
}
