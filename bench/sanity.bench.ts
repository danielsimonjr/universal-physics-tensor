/**
 * Sanity benchmark — validates that the vitest bench toolchain is wired
 * correctly. Uses only `Math.sqrt` (no UPT imports) so this bench runs
 * even with a broken build.
 *
 * v0.4.5: first bench file in UPT. No threshold gates.
 */
import { bench, describe } from 'vitest';

describe('Sanity — Math.sqrt (toolchain validation)', () => {
  bench('Math.sqrt(2)', () => {
    Math.sqrt(2);
  });

  bench('Math.sqrt loop x 1000', () => {
    for (let i = 0; i < 1000; i++) Math.sqrt(i + 1);
  });
});
