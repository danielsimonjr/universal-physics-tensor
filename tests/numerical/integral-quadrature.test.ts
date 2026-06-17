/**
 * Gauss–Legendre quadrature helper + numerical lowering of definite `integral`
 * nodes.
 *
 * @module tests/numerical/integral-quadrature
 */
import { describe, it, expect } from 'vitest';
import { integrateGaussLegendre } from '../../src/numerical/quadrature.js';
import { evaluateNumerical } from '../../src/numerical/index.js';
import type { NumericalInputs } from '../../src/numerical/types.js';
import type { ExprNode } from '../../src/dimensional/validator.js';
import { DIMENSIONLESS } from '../../src/dimensional/types.js';

describe('integrateGaussLegendre (16-point)', () => {
  it('∫₀¹ x² dx = 1/3 (exact, polynomial)', () => {
    expect(integrateGaussLegendre((x) => x * x, 0, 1)).toBeCloseTo(1 / 3, 12);
  });

  it('∫₀^π sin x dx = 2 (smooth)', () => {
    expect(integrateGaussLegendre(Math.sin, 0, Math.PI)).toBeCloseTo(2, 10);
  });

  it('∫₂⁵ 7 dx = 21 (constant)', () => {
    expect(integrateGaussLegendre(() => 7, 2, 5)).toBeCloseTo(21, 12);
  });

  it('signed: ∫₁⁰ x dx = −1/2 (b < a)', () => {
    expect(integrateGaussLegendre((x) => x, 1, 0)).toBeCloseTo(-0.5, 12);
  });
});

describe('numerical lowering — definite integral', () => {
  const sym = (name: string): ExprNode => ({ kind: 'symbol', name, dim: DIMENSIONLESS });

  it('evaluateNumerical(∫₀ᵇ x² dx) = b³/3', async () => {
    const expr: ExprNode = {
      kind: 'integral',
      over: sym('x'),
      integrand: { kind: 'op', op: '^', args: [sym('x'), sym('2')] },
      lower: sym('0'),
      upper: sym('b'),
    };
    const inputs: NumericalInputs = {
      tensors: new Map<string, number>([
        ['b', 2],
        ['0', 0],
        ['2', 2],
      ]),
    };
    expect((await evaluateNumerical(expr, inputs)).value as number).toBeCloseTo(8 / 3, 9);
  });
});
