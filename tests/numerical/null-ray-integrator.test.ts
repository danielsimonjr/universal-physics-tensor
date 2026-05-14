import { describe, it, expect } from 'vitest';
import { integrateRK4 } from '../../src/numerical/null-ray-integrator.js';

describe('integrateRK4', () => {
  it('integrates dy/dλ = 1 from 0 to 1 in 10 steps -> y = 1', () => {
    const result = integrateRK4((_lambda, _y) => [1], [0], 0, 1, 10);
    expect(result[0]).toBeCloseTo(1, 12);
  });

  it('integrates dy/dλ = y (exponential) -> y(1) = e, to RK4 accuracy', () => {
    const result = integrateRK4((_lambda, y) => [y[0]], [1], 0, 1, 100);
    expect(result[0]).toBeCloseTo(Math.E, 8);
  });

  it('integrates a coupled 2-vector system: y0 = sin, y1 = cos', () => {
    // dy0/dλ = y1, dy1/dλ = -y0  =>  y0 = sin(λ), y1 = cos(λ)
    const result = integrateRK4(
      (_lambda, y) => [y[1], -y[0]], [0, 1], 0, Math.PI / 2, 200,
    );
    expect(result[0]).toBeCloseTo(1, 8);  // sin(π/2)
    expect(result[1]).toBeCloseTo(0, 8);  // cos(π/2)
  });

  it('throws on a non-positive step count', () => {
    expect(() => integrateRK4(() => [0], [0], 0, 1, 0)).toThrow(/step count/);
  });

  it('throws when the ODE system returns a wrong-length state vector', () => {
    // y is length 1 but the system returns length 2
    expect(() => integrateRK4((_lambda, _y) => [1, 2], [0], 0, 1, 4))
      .toThrow(/returned a state vector of length/);
  });
});
