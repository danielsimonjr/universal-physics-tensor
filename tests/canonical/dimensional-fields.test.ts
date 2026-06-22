/**
 * `dimensionalFields` derives an entry's L0 fields from the Buckingham-π engine
 * and must keep the invariant `monomial !== null ⟺ freeDimensionlessGroups === 0`
 * UNCONDITIONALLY — including the not-in-span edge where the π-engine alone would
 * report 0 free groups for a null monomial.
 */
import { describe, it, expect } from 'vitest';
import { dimensionalFields } from '../../src/canonical/dimensional-fields.js';
import { dim } from '../../src/dimensional/ast-builders.js';
import type { DimensionalVariable } from '../../src/dimensional/buckingham.js';

const v = (name: string, d: ReturnType<typeof dim>): DimensionalVariable => ({ name, dim: d });

const biconditional = (r: ReturnType<typeof dimensionalFields>) =>
  (r.monomial !== null) === (r.freeDimensionlessGroups === 0);

describe('dimensionalFields — monomial ⟺ zero-free-group invariant', () => {
  it('determined: area = length² pins a monomial with 0 free groups', () => {
    const r = dimensionalFields(v('area', dim(2)), [v('length', dim(1))]);
    expect(r.monomial).not.toBeNull();
    expect(r.freeDimensionlessGroups).toBe(0);
    expect(biconditional(r)).toBe(true);
  });

  it('underdetermined: Newton F=Gm₁m₂/r² leaves a free mass-ratio group', () => {
    const r = dimensionalFields(v('force', dim(1, 1, -2)), [
      v('G', dim(3, -1, -2)),
      v('m1', dim(0, 1)),
      v('m2', dim(0, 1)),
      v('r', dim(1)),
    ]);
    expect(r.monomial).toBeNull();
    expect(r.freeDimensionlessGroups).toBeGreaterThanOrEqual(1);
    expect(biconditional(r)).toBe(true);
  });

  it('not-in-span edge: target unreachable from the governing set still reports a free group', () => {
    // Temperature [Θ] cannot be formed from [length] alone: det.determined is
    // false AND the π-engine on [length] alone has 0 groups → must force ≥1 so
    // the null monomial never claims 0 free groups (the invariant guard).
    const r = dimensionalFields(v('temperature', dim(0, 0, 0, 0, 1)), [v('length', dim(1))]);
    expect(r.monomial).toBeNull();
    expect(r.freeDimensionlessGroups).toBeGreaterThanOrEqual(1);
    expect(biconditional(r)).toBe(true);
  });

  it('empty governing set: a non-dimensionless target is unpinnable', () => {
    const r = dimensionalFields(v('mass', dim(0, 1)), []);
    expect(r.monomial).toBeNull();
    expect(r.freeDimensionlessGroups).toBeGreaterThanOrEqual(1);
    expect(biconditional(r)).toBe(true);
  });
});
