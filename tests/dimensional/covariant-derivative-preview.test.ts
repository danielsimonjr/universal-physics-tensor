import { describe, it, expect } from 'vitest';
import { validate } from '../../src/dimensional/validator.js';
import { tsym } from '../../src/dimensional/tensor.js';
import { metric, pderiv } from '../../src/dimensional/metric.js';
import { DIMENSIONLESS } from '../../src/dimensional/types.js';

const LENGTH = { L: 1, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 };

describe('covariant-derivative preview (v0.4.0 building block)', () => {
  // TENSOR-RULE: pderiv-of-metric-composes
  it('∂_μ g_νλ is well-formed (v0.3.0 building block for v0.4.0 Christoffel)', () => {
    const g_lower = metric(
      'g',
      [
        { label: 'ν', variance: 'lower' },
        { label: 'λ', variance: 'lower' },
      ],
      DIMENSIONLESS,
      '+,-,-,-',
    );
    const x_coord = tsym('x', [{ label: 'α', variance: 'upper' }], LENGTH, 'coordinate');
    const dg = pderiv(g_lower, x_coord, { label: 'μ', variance: 'lower' });

    const result = validate(dg);
    expect(result.ok).toBe(true);
    expect(result.freeIndices.size).toBe(3);
    expect(result.freeIndices.get('μ')).toEqual({ upper: 0, lower: 1 });
    expect(result.freeIndices.get('ν')).toEqual({ upper: 0, lower: 1 });
    expect(result.freeIndices.get('λ')).toEqual({ upper: 0, lower: 1 });
  });

  it.todo(
    'v0.4.0 — Christoffel symbol Γ^λ_μν = (1/2) g^λρ (∂_μ g_ρν + ∂_ν g_ρμ - ∂_ρ g_μν) validates',
  );

  it.todo(
    'v0.4.0 — covariant derivative ∇_μ V^ν = ∂_μ V^ν + Γ^ν_μλ V^λ validates',
  );
});
