/**
 * Shared deterministic fresh-label utility used by both metric.ts (raise/lower)
 * and connection.ts (christoffel). Extracted to eliminate the algorithmic
 * divergence found in the Task 3 code-quality review (Finding #1).
 *
 * Canonical semantics (from metric.ts, the older module with downstream callers):
 * always returns `<base>_<counter>` starting at counter=1, regardless of
 * whether `base` itself is free. This guarantees every returned label is
 * suffixed and avoids subtle round-trip inconsistencies when the same base
 * label appears in multiple call sites.
 *
 * Per Part-VIII §VIII.5 TENSOR-RULE raise-lower-fresh-label-deterministic.
 *
 * @module dimensional/fresh-label
 */

/**
 * Generate a deterministic fresh label not present in `taken`.
 * Uses the scheme `<base>_<counter>` starting at counter=1; increments until
 * a non-taken label is found. Deterministic across runs.
 *
 * @param base  The preferred label stem (e.g. `'ρ'`).
 * @param taken Set of labels already in use.
 * @returns     A label of the form `<base>_N` where N ≥ 1.
 */
export function freshLabel(base: string, taken: Set<string>): string {
  let counter = 1;
  while (taken.has(`${base}_${counter}`)) counter++;
  return `${base}_${counter}`;
}
