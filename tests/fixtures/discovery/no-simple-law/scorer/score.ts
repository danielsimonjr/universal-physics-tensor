/**
 * Family B scorer. Must not be imported from src/.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));

export function loadHiddenTruth(): {
  monomial: Record<string, number> | null;
  prefactor: number | null;
  expectAbstention?: boolean;
} {
  return JSON.parse(readFileSync(join(here, 'hidden-truth.json'), 'utf8'));
}
