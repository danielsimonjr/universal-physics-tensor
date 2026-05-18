import { describe, it, expect } from 'vitest';
import { pderivGrid, pderivNumericalFn } from '../../src/numerical/pderiv.js';

describe('pderiv: flattenNA consolidation regression', () => {
  it('pderivGrid: 1D grid, interior points use centered difference', () => {
    const grid = {
      shape: [5],
      spacing: [1],
      data: [0, 1, 4, 9, 16], // x^2 at x=0,1,2,3,4
      boundary: 'clamp' as const,
    };
    const result = pderivGrid(grid, 0);
    // Interior: f'(x) ≈ (f(x+1) - f(x-1)) / 2
    // x=1: (4-0)/2=2, x=2: (9-1)/2=4, x=3: (16-4)/2=6
    // Edge x=0: (f(1)-f(0))/1=1, edge x=4: (f(4)-f(3))/1=7
    expect(result).toHaveLength(5);
    expect(result[0]).toBeCloseTo(1);   // clamp forward
    expect(result[1]).toBeCloseTo(2);   // centered
    expect(result[2]).toBeCloseTo(4);   // centered
    expect(result[3]).toBeCloseTo(6);   // centered
    expect(result[4]).toBeCloseTo(7);   // clamp backward
  });

  it('pderivGrid: nested data array (rank-2 grid) flattens correctly', () => {
    // 2x2 grid, axis=0
    const grid = {
      shape: [2, 2],
      spacing: [1, 1],
      data: [[1, 2], [3, 4]],
      boundary: 'clamp' as const,
    };
    const result = pderivGrid(grid, 0);
    expect(result).toHaveLength(4);
    // All points are edges along axis 0 (only 2 rows), so one-sided diff everywhere
    // f[0,0]=1, f[1,0]=3 → df[0,0]/dx0 = (3-1)/1 = 2
    // f[0,1]=2, f[1,1]=4 → df[0,1]/dx0 = (4-2)/1 = 2
    // f[1,0]=3, f[0,0]=1 → df[1,0]/dx0 = (3-1)/1 = 2
    // f[1,1]=4, f[0,1]=2 → df[1,1]/dx0 = (4-2)/1 = 2
    expect(result[0]).toBeCloseTo(2);
    expect(result[1]).toBeCloseTo(2);
    expect(result[2]).toBeCloseTo(2);
    expect(result[3]).toBeCloseTo(2);
  });

  it('pderivNumericalFn: d/dx(x^2) at x=3 along axis 0', () => {
    const fn = (coords: ReadonlyArray<number>) => coords[0] * coords[0];
    const result = pderivNumericalFn(fn, [3], 0);
    // Centered finite diff: (f(3+h)-f(3-h))/(2h) ≈ 2x = 6
    expect(typeof result).toBe('number');
    expect(result as number).toBeCloseTo(6, 4);
  });
});
