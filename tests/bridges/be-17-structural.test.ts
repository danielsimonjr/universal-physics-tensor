/**
 * BE-17 structural encoding test (v0.2.0).
 *
 * Verifies the structural rewrite of the Einstein-Cartan torsion-spin
 * squared-invariant scalar reduction:
 *
 *   S²_spin = (c⁴/(8πG))² · T_λμν T^λμν
 *
 * In v0.1.0, T_λμν T^λμν was a single typed-stub symbol
 * (`T_torsion_squared` with hand-computed dim [T²·L⁻⁴]). In v0.2.0,
 * the contraction is encoded structurally as a `tensor-product` over
 * two `tensor-symbol` nodes (three lower indices vs. three upper
 * indices, contracted by the algebra layer).
 *
 * The dimensional verdict is INVARIANT under the rewrite — both
 * v0.1.0 and v0.2.0 give RHS dim [M²·L⁻²·T⁻²]. The new tests pin the
 * AST shape so a regression to the stub form is detected.
 *
 * @see src/bridges/equations/be-17-einstein-cartan.ts
 * @see docs/planning/v0.2.0-Implementation-Plan.md (Task 11)
 * @see docs/planning/v0.2.0-Design.md §7 (worked example), §11 (success
 *   criterion #6: BE-17 structural encoding non-negotiable)
 */

import { describe, it, expect } from 'vitest';
import { validate } from '../../src/dimensional/validator.js';
import {
  BE17_SPIN_DENSITY_SQUARED_RHS,
  BE17_SPIN_DENSITY_SQUARED_LHS,
  validateBE17Dimensions,
} from '../../src/bridges/equations/be-17-einstein-cartan.js';

// Silence unused-import warning; LHS pin is in the existing
// be-17-encoding test, but importing here keeps the structural test's
// dependency surface explicit.
void BE17_SPIN_DENSITY_SQUARED_LHS;

describe('BE-17 structural encoding (v0.2.0)', () => {
  it('RHS validates as a scalar (empty freeIndices)', () => {
    const result = validate(BE17_SPIN_DENSITY_SQUARED_RHS);
    expect(result.ok).toBe(true);
    expect(result.freeIndices.size).toBe(0);
  });

  it('LHS and RHS have matching dimensions', () => {
    const report = validateBE17Dimensions();
    expect(report.ok).toBe(true);
    expect(report.lhsDim).toEqual(report.rhsDim);
  });

  it('RHS structure includes a tensor-product with the torsion contraction', () => {
    function findKind(node: unknown, kind: string): boolean {
      if (typeof node !== 'object' || node === null) return false;
      const n = node as { kind?: string; args?: unknown[]; of?: unknown };
      if (n.kind === kind) return true;
      if (Array.isArray(n.args)) return n.args.some((a) => findKind(a, kind));
      if (n.of) return findKind(n.of, kind);
      return false;
    }
    expect(findKind(BE17_SPIN_DENSITY_SQUARED_RHS, 'tensor-product')).toBe(true);
    expect(findKind(BE17_SPIN_DENSITY_SQUARED_RHS, 'tensor-symbol')).toBe(true);
  });
});
