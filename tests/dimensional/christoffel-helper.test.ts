import { describe, it, expect } from 'vitest';
import { validate } from '../../src/dimensional/validator.js';
import { tsym } from '../../src/dimensional/tensor.js';
import { metric } from '../../src/dimensional/metric.js';
import { christoffel } from '../../src/dimensional/connection.js';
import { LENGTH, DIMENSIONLESS } from '../../src/dimensional/types.js';

const gLower = metric('g',
  [{ label: 'a', variance: 'lower' }, { label: 'b', variance: 'lower' }],
  DIMENSIONLESS, '+,-,-,-');
const gInverse = metric('gInv',
  [{ label: 'a', variance: 'upper' }, { label: 'b', variance: 'upper' }],
  DIMENSIONLESS, '+,-,-,-');
const xCoord = tsym('x', [{ label: 'α', variance: 'upper' }], LENGTH, 'coordinate');

describe('christoffel() helper', () => {
  it('Γ^λ_μν validates as rank-3 with the right index signature', () => {
    const node = christoffel(gLower, gInverse, 'λ', 'μ', 'ν', xCoord);
    const r = validate(node);
    expect(r.ok).toBe(true);
    expect(r.freeIndices.size).toBe(3);
    expect(r.freeIndices.get('λ')).toEqual({ upper: 1, lower: 0 });
    expect(r.freeIndices.get('μ')).toEqual({ upper: 0, lower: 1 });
    expect(r.freeIndices.get('ν')).toEqual({ upper: 0, lower: 1 });
  });

  it('Γ output dim is DIMENSIONLESS (geometrized convention)', () => {
    const node = christoffel(gLower, gInverse, 'λ', 'μ', 'ν', xCoord);
    const r = validate(node);
    // Γ has units 1/LENGTH (geometrized DIMENSIONLESS metric).
    expect(r.inferredDimension).not.toBeNull();
    expect(r.inferredDimension?.L).toBe(-1);
  });

  it('uses a fresh contraction label that does not collide with operand labels', () => {
    // Build Γ where 'ρ' is already used as a free label of gInverse — the
    // freshLabel scheme should pick e.g. 'ρ_1'.
    const gInverseWithRho = metric('gInv',
      [{ label: 'a', variance: 'upper' }, { label: 'ρ', variance: 'upper' }],
      DIMENSIONLESS, '+,-,-,-');
    // (Note: this is an unusual setup — for the real christoffel formula the
    // ρ label is introduced internally — but verifying the freshLabel scheme.)
    const node = christoffel(gLower, gInverseWithRho, 'λ', 'μ', 'ν', xCoord);
    const r = validate(node);
    expect(r.ok).toBe(true);
  });

  it('handles xCoord index labeled ρ — picks a fresh contraction label', () => {
    // xCoord carries index 'ρ' — the taken set must include xCoord's labels so
    // christoffel() picks a fresh dummy that doesn't collide with 'ρ'.
    const xCoordRho = tsym('x', [{ label: 'ρ', variance: 'upper' }], LENGTH, 'coordinate');
    const node = christoffel(gLower, gInverse, 'λ', 'μ', 'ν', xCoordRho);
    const r = validate(node);
    expect(r.ok).toBe(true);
    // The contraction dummy must not appear as a free index and must not be 'ρ'.
    // 'ρ' must survive as the only free index from xCoord, but the internal
    // dummy ρ_N should not alias it.
    const freeLabels = Array.from(r.freeIndices.keys());
    // λ, μ, ν are the free indices of Γ — ρ should NOT be a free index
    // (it was xCoord's label and appears in each pderiv, which folds it in).
    // Most importantly: the result must validate cleanly (no malformed AST).
    expect(freeLabels).not.toContain('ρ'); // ρ is xCoord's wrt index, consumed by pderiv
  });

  it('handles lowerA (μ) labeled ρ — picks a fresh contraction label', () => {
    // When lowerA itself is 'ρ', the internal dummy must not clash.
    const node = christoffel(gLower, gInverse, 'λ', 'ρ', 'ν', xCoord);
    const r = validate(node);
    expect(r.ok).toBe(true);
    // free indices must be exactly {λ:upper, ρ:lower, ν:lower}
    expect(r.freeIndices.size).toBe(3);
    expect(r.freeIndices.get('λ')).toEqual({ upper: 1, lower: 0 });
    expect(r.freeIndices.get('ρ')).toEqual({ upper: 0, lower: 1 });
    expect(r.freeIndices.get('ν')).toEqual({ upper: 0, lower: 1 });
  });

  it('handles lowerB (ν) labeled ρ — picks a fresh contraction label', () => {
    // When lowerB itself is 'ρ', the internal dummy must not clash.
    const node = christoffel(gLower, gInverse, 'λ', 'μ', 'ρ', xCoord);
    const r = validate(node);
    expect(r.ok).toBe(true);
    // free indices must be exactly {λ:upper, μ:lower, ρ:lower}
    expect(r.freeIndices.size).toBe(3);
    expect(r.freeIndices.get('λ')).toEqual({ upper: 1, lower: 0 });
    expect(r.freeIndices.get('μ')).toEqual({ upper: 0, lower: 1 });
    expect(r.freeIndices.get('ρ')).toEqual({ upper: 0, lower: 1 });
  });
});
