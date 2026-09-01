/**
 * Canonical JSON serialization and hashing for Product B probe artifacts.
 *
 * Object keys are sorted lexicographically; `undefined` properties are omitted;
 * arrays keep encounter order. A `Date` (if somehow passed) serializes as
 * ISO-8601 rather than as an empty object — `Object.keys(date)` is empty, so
 * the object walk is skipped for dates.
 *
 * Hashes use SHA-256 over this canonical form. Experimental — not a public
 * API stability surface (`src/index.ts` does not re-export this module).
 *
 * @module composition/probe/serialize
 */

import { createHash } from 'node:crypto';

/**
 * Deterministic JSON string: sorted object keys, `undefined` omitted, arrays
 * in encounter order. `Date` values become ISO-8601 strings.
 *
 * @internal
 */
export function canonicalJson(value: unknown): string {
  const json = JSON.stringify(canonicalize(value));
  return json === undefined ? 'null' : json;
}

/**
 * SHA-256 digest of `text` as lowercase hex.
 *
 * @internal
 */
export function sha256Hex(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

/**
 * SHA-256 of {@link canonicalJson} applied to `value`.
 *
 * @internal
 */
export function hashCanonical(value: unknown): string {
  return sha256Hex(canonicalJson(value));
}

function canonicalize(value: unknown): unknown {
  if (value === null || typeof value !== 'object') {
    return value;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (Array.isArray(value)) {
    return value.map((item) => (item === undefined ? null : canonicalize(item)));
  }
  const obj = value as Record<string, unknown>;
  const sorted: Record<string, unknown> = {};
  for (const key of Object.keys(obj).sort()) {
    const item = obj[key];
    if (item === undefined) continue;
    sorted[key] = canonicalize(item);
  }
  return sorted;
}
