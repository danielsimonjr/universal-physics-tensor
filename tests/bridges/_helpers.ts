/**
 * Shared test helpers for bridge equation encoding tests.
 *
 * v0.4.5 Task 5a: extracted from encoding test files to eliminate the
 * repeated boilerplate (catalog lookup + dimensional validation
 * round-trip). Net savings target: ~150-200 LOC across the full suite
 * (realized across Tasks 5b and 5c).
 *
 * IMPORTANT — F5 constraint: Call these helpers INSIDE `it()` blocks
 * only. Calling `expect()` at describe/module scope causes Vitest to
 * report an uncaught error and corrupts the per-bridge test count.
 * Each bridge file keeps its own `it()` structure; these helpers replace
 * the BODY of those `it()` blocks, not the `it()` wrappers themselves.
 *
 * NOT for use in reformulation tests (different structure — index
 * metadata only, no AST/evaluate) or fix tests (non-standard shapes).
 * Encoding tests only.
 *
 * @module tests/bridges/_helpers
 */

import { expect } from 'vitest';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';
import type { BridgeEquationStatus, BridgeEquationEntry } from '../../src/bridges/index.js';
import type { ExprNode } from '../../src/dimensional/validator.js';
import { validate } from '../../src/dimensional/validator.js';
import { format } from '../../src/dimensional/algebra.js';

/**
 * Assert that a bridge with the given numeric id exists in
 * BRIDGE_EQUATIONS, and optionally that its `status` matches the
 * expected value. Returns the entry for further assertions.
 *
 * Call INSIDE an `it()` block — not at describe/module scope.
 *
 * @example
 * it('exists in the index', () => {
 *   expectBridgeInIndex(22);
 * });
 * it("status pinned 'speculative'", () => {
 *   expectBridgeInIndex(22, 'speculative');
 * });
 */
export function expectBridgeInIndex(
  id: number,
  status?: BridgeEquationStatus,
): BridgeEquationEntry {
  const entry = BRIDGE_EQUATIONS.find((e) => e.id === id);
  expect(entry, `Bridge BE-${id} not found in BRIDGE_EQUATIONS`).toBeDefined();
  if (status !== undefined) {
    expect(entry!.status, `BE-${id} status mismatch`).toBe(status);
  }
  return entry!;
}

/**
 * Assert that the given AST node validates cleanly and that
 * `format(validate(rhs).inferredDimension!)` matches `expectedSig`.
 * Covers both "validation ok" and "format round-trip" in one call.
 *
 * Call INSIDE an `it()` block — not at describe/module scope.
 *
 * @example
 * it("RHS infers SI dimension '[1]' (round-trip pin)", () => {
 *   expectDimRoundTrip(BE22_TOPOLOGICAL_ENTANGLEMENT_RHS, '[1]');
 * });
 */
export function expectDimRoundTrip(rhs: ExprNode, expectedSig: string): void {
  const r = validate(rhs);
  expect(
    r.ok,
    `AST validation failed: ${JSON.stringify(r.violations)}`,
  ).toBe(true);
  expect(
    r.inferredDimension,
    'inferredDimension is null — validation did not infer a dimension',
  ).not.toBeNull();
  const actual = format(r.inferredDimension!);
  expect(
    actual,
    `dimensional_signature mismatch: expected '${expectedSig}', got '${actual}'`,
  ).toBe(expectedSig);
}
