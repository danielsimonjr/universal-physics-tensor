import { describe, it, expect } from 'vitest';
import { GL4_C, GL4_A, GL4_B } from '../../src/numerical/gl4-integrator.js';

describe('GL4 integrator: Butcher tableau (Hairer/Lubich/Wanner §II.1)', () => {
  const SQRT3_OVER_6 = Math.sqrt(3) / 6;

  it('exposes 2-stage GL quadrature nodes c₁, c₂ to ≤1e-15', () => {
    expect(GL4_C[0]).toBeCloseTo(0.5 - SQRT3_OVER_6, 15);
    expect(GL4_C[1]).toBeCloseTo(0.5 + SQRT3_OVER_6, 15);
  });

  it('exposes the 2×2 Butcher matrix a_{ij} to ≤1e-15', () => {
    expect(GL4_A[0][0]).toBeCloseTo(0.25, 15);
    expect(GL4_A[0][1]).toBeCloseTo(0.25 - SQRT3_OVER_6, 15);
    expect(GL4_A[1][0]).toBeCloseTo(0.25 + SQRT3_OVER_6, 15);
    expect(GL4_A[1][1]).toBeCloseTo(0.25, 15);
  });

  it('exposes the stage weights b₁ = b₂ = ½', () => {
    expect(GL4_B[0]).toBe(0.5);
    expect(GL4_B[1]).toBe(0.5);
  });

  it('satisfies the Sanz-Serna 1988 symplecticity condition b_i a_{ij} + b_j a_{ji} = b_i b_j', () => {
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        const lhs = GL4_B[i] * GL4_A[i][j] + GL4_B[j] * GL4_A[j][i];
        const rhs = GL4_B[i] * GL4_B[j];
        expect(lhs).toBeCloseTo(rhs, 15);
      }
    }
  });

  it('row sums match c_i (consistency, standard RK condition)', () => {
    for (let i = 0; i < 2; i++) {
      const rowSum = GL4_A[i][0] + GL4_A[i][1];
      expect(rowSum).toBeCloseTo(GL4_C[i], 15);
    }
  });
});
