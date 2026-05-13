import { describe, it, expect } from 'vitest';
import { validate } from '../../src/dimensional/validator.js';
import { tsym } from '../../src/dimensional/tensor.js';
import { metric, raise, lower } from '../../src/dimensional/metric.js';
import { DIMENSIONLESS } from '../../src/dimensional/types.js';
import { MetricSignatureError } from '../../src/dimensional/errors.js';

const LENGTH = { L: 1, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 };
const POTENTIAL = { L: 2, M: 1, T: -3, I: -1, Theta: 0, N: 0, J: 0 };

describe('raise() / lower() with internal alpha-conversion', () => {
  // TENSOR-RULE: raise-lower-construct-tensor-product
  // TENSOR-RULE: raise-lower-internal-alpha-conversion
  // TENSOR-RULE: raise-lower-fresh-label-deterministic
  // TENSOR-RULE: raise-requires-upper-variance-inverse-metric
  // TENSOR-RULE: raise-requires-label-present-in-operand
  const g_inv = metric(
    'g_inv',
    [
      { label: 'α', variance: 'upper' },
      { label: 'β', variance: 'upper' },
    ],
    DIMENSIONLESS,
    '+,-,-,-',
  );

  const g = metric(
    'g',
    [
      { label: 'α', variance: 'lower' },
      { label: 'β', variance: 'lower' },
    ],
    DIMENSIONLESS,
    '+,-,-,-',
  );

  it('raise(A_μ, g_inv, "μ") yields a contractable tensor-product', () => {
    const A_lower = tsym('A', [{ label: 'μ', variance: 'lower' }], POTENTIAL);
    const raised = raise(A_lower, g_inv, 'μ');
    expect(raised.kind).toBe('tensor-product');
    expect(raised.args.length).toBe(2);

    const result = validate(raised);
    expect(result.ok).toBe(true);
    // The μ contracts; one upper free index remains (the renamed metric label).
    expect(result.freeIndices.size).toBe(1);
    // Total upper count after contraction = 1.
    let totalUpper = 0;
    for (const counts of result.freeIndices.values()) totalUpper += counts.upper;
    expect(totalUpper).toBe(1);
  });

  it('lower(A^μ, g, "μ") yields a contractable tensor-product', () => {
    const A_upper = tsym('A', [{ label: 'μ', variance: 'upper' }], POTENTIAL);
    const lowered = lower(A_upper, g, 'μ');
    expect(lowered.kind).toBe('tensor-product');
    const result = validate(lowered);
    expect(result.ok).toBe(true);
    expect(result.freeIndices.size).toBe(1);
    let totalLower = 0;
    for (const counts of result.freeIndices.values()) totalLower += counts.lower;
    expect(totalLower).toBe(1);
  });

  it('rejects raise() with a lower-variance metric (must be inverse)', () => {
    const A_lower = tsym('A', [{ label: 'μ', variance: 'lower' }], POTENTIAL);
    expect(() => raise(A_lower, g, 'μ')).toThrow(MetricSignatureError);
  });

  it('rejects lower() with an upper-variance metric', () => {
    const A_upper = tsym('A', [{ label: 'μ', variance: 'upper' }], POTENTIAL);
    expect(() => lower(A_upper, g_inv, 'μ')).toThrow(MetricSignatureError);
  });

  it('rejects raise() when label is absent from operand free indices', () => {
    const A_lower = tsym('A', [{ label: 'μ', variance: 'lower' }], POTENTIAL);
    expect(() => raise(A_lower, g_inv, 'ν')).toThrow();
  });

  it('rejects raise() when label is already upper in operand', () => {
    const A_upper = tsym('A', [{ label: 'μ', variance: 'upper' }], POTENTIAL);
    expect(() => raise(A_upper, g_inv, 'μ')).toThrow();
  });

  it('fresh label generation avoids collision with operand free indices', () => {
    // Operand has free indices μ:lower AND α:upper (which is one of g_inv's labels).
    // raise(...,'μ') must NOT pick 'α' as the fresh label.
    const A = tsym(
      'A',
      [
        { label: 'μ', variance: 'lower' },
        { label: 'α', variance: 'upper' },
      ],
      POTENTIAL,
    );
    const raised = raise(A, g_inv, 'μ');
    const result = validate(raised);
    expect(result.ok).toBe(true);
    // free indices = {α: upper (from A), <freshLabel>: upper (renamed from g_inv's β or α)}
    // The fresh label MUST NOT be 'α' (would collide with A's existing 'α').
    expect(result.freeIndices.size).toBe(2);
    expect(result.freeIndices.has('α')).toBe(true);
    expect(result.freeIndices.get('α')!.upper).toBe(1);
    // The renamed metric label is NOT 'α'.
    const labels = Array.from(result.freeIndices.keys());
    const renamed = labels.filter((l) => l !== 'α');
    expect(renamed.length).toBe(1);
    expect(renamed[0]).not.toBe('α');
  });

  it('fresh label generation is deterministic across runs', () => {
    const A = tsym('A', [{ label: 'μ', variance: 'lower' }], POTENTIAL);
    const r1 = raise(A, g_inv, 'μ');
    const r2 = raise(A, g_inv, 'μ');
    expect(JSON.stringify(r1)).toBe(JSON.stringify(r2));
  });

  it('multi-index operand: raise picks one label, leaves others intact', () => {
    // T_μν has free indices {μ:lower, ν:lower}. raise(T_μν, g_inv, 'μ') should
    // contract μ via g_inv, leaving ν:lower untouched and adding one new
    // upper free index.
    const T = tsym(
      'T',
      [
        { label: 'μ', variance: 'lower' },
        { label: 'ν', variance: 'lower' },
      ],
      POTENTIAL,
    );
    const raised = raise(T, g_inv, 'μ');
    const result = validate(raised);
    expect(result.ok).toBe(true);
    // free = {ν:lower (untouched), <fresh>:upper (raised)}
    expect(result.freeIndices.size).toBe(2);
    expect(result.freeIndices.get('ν')).toEqual({ upper: 0, lower: 1 });
    let upperCount = 0;
    for (const counts of result.freeIndices.values()) upperCount += counts.upper;
    expect(upperCount).toBe(1);
  });
});
