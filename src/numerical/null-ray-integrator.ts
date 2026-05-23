/**
 * Fixed-step classical RK4 integrator for affine-parameterized null
 * geodesics. Used by `src/bridges/equations/be-37-shapiro-delay.ts` (the
 * closed-form bridge encoding); the v0.5.0 covariant-eikonal path uses
 * the symplectic `integrateGeodesicGL4` instead (see
 * `src/numerical/be37-covariant-eikonal.ts`). Self-contained: operates on
 * plain `number[]` state vectors, no TensorEngine dependency
 * (v0.3.5-Design.md §8 for the original framing).
 *
 * @module numerical/null-ray-integrator
 */
import { NumericalBackendError } from './errors.js';

/** A first-order ODE system: dy/dλ = f(λ, y). `y` and the return are
 *  state vectors of equal length.
 *  v0.6.1: dropped export — was @internal-tagged with no external consumer. */
type ODESystem = (lambda: number, y: ReadonlyArray<number>) => number[];

function addScaled(a: ReadonlyArray<number>, b: ReadonlyArray<number>, k: number): number[] {
  const out = new Array<number>(a.length);
  for (let i = 0; i < a.length; i++) out[i] = a[i] + k * b[i];
  return out;
}

function checkLength(k: ReadonlyArray<number>, expected: number): void {
  if (k.length !== expected) {
    throw new NumericalBackendError(
      `integrateRK4: ODE system returned a state vector of length ${k.length}, expected ${expected}`,
    );
  }
}

/**
 * Integrate `system` from affine parameter `lambda0` to `lambda1` in
 * `steps` fixed RK4 steps, starting from state `y0`. Returns the final
 * state vector. Classical 4th-order Runge-Kutta — global error O(h⁴).
 *
 * @internal — cross-module/test use only; not part of the consumer surface.
 */
export function integrateRK4(
  system: ODESystem,
  y0: ReadonlyArray<number>,
  lambda0: number,
  lambda1: number,
  steps: number,
): number[] {
  if (!Number.isInteger(steps) || steps <= 0) {
    throw new NumericalBackendError(`integrateRK4: step count must be a positive integer, got ${steps}`);
  }
  const h = (lambda1 - lambda0) / steps;
  let lambda = lambda0;
  let y = [...y0];

  for (let n = 0; n < steps; n++) {
    const k1 = system(lambda, y);
    checkLength(k1, y.length);
    const k2 = system(lambda + h / 2, addScaled(y, k1, h / 2));
    checkLength(k2, y.length);
    const k3 = system(lambda + h / 2, addScaled(y, k2, h / 2));
    checkLength(k3, y.length);
    const k4 = system(lambda + h, addScaled(y, k3, h));
    checkLength(k4, y.length);
    const next = new Array<number>(y.length);
    for (let i = 0; i < y.length; i++) {
      next[i] = y[i] + (h / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]);
    }
    y = next;
    lambda += h;
  }
  return y;
}
