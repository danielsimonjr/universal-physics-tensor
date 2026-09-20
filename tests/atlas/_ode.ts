/**
 * Fixed-step classical RK4 for atlas tests, with trajectory sampling.
 *
 * Why this is implemented locally rather than wrapping the in-tree
 * `integrateRK4` (`src/numerical/null-ray-integrator.ts`):
 *
 * 1. `integrateRK4` returns ONLY the final state. Atlas witness tests need the
 *    trajectory (phase drift per cycle, envelope decay, dispersion), so a
 *    wrapper would have to re-enter the integrator once per sample and would
 *    not reproduce a single continuous fixed-step run.
 * 2. `integrateRK4` is `@internal` to `src/numerical/` and its `ODESystem`
 *    type is deliberately NOT exported (dropped in v0.6.1 for having no
 *    external consumer). Wrapping it would pull a numerical internal into a
 *    test helper for no gain.
 *
 * The two agree to floating-point noise on the same problem; `ode-helper.test.ts`
 * pins that agreement as a cross-check.
 *
 * @module tests/atlas/_ode
 */

/** dy/dt = f(t, y). `y` and the return are state vectors of equal length. */
export type Derivative = (t: number, y: readonly number[]) => number[];

/** One sampled point of the trajectory. */
export interface OdeSample {
  t: number;
  y: number[];
}

/** Result of {@link rk4}: the final state plus the sampled trajectory. */
export interface OdeResult {
  y: number[];
  samples: OdeSample[];
}

function addScaled(a: readonly number[], b: readonly number[], k: number): number[] {
  const out = new Array<number>(a.length);
  for (let i = 0; i < a.length; i++) out[i] = a[i] + k * b[i];
  return out;
}

/**
 * Integrate `f` from `t0` to `t1` in `steps` fixed classical-RK4 steps.
 *
 * `samples` always includes the initial point (`t0`, `y0`) and the final point
 * (`t1`, result), plus every `sampleEvery`-th intermediate step.
 *
 * @throws RangeError if `steps` is not a positive integer, or `sampleEvery`
 *   is not a positive integer.
 */
export function rk4(
  f: (t: number, y: readonly number[]) => number[],
  y0: readonly number[],
  t0: number,
  t1: number,
  steps: number,
  sampleEvery = 1,
): { y: number[]; samples: Array<{ t: number; y: number[] }> } {
  if (!Number.isInteger(steps) || steps <= 0) {
    throw new RangeError(`rk4: step count must be a positive integer, got ${steps}`);
  }
  if (!Number.isInteger(sampleEvery) || sampleEvery <= 0) {
    throw new RangeError(`rk4: sampleEvery must be a positive integer, got ${sampleEvery}`);
  }

  const h = (t1 - t0) / steps;
  const n = y0.length;
  let y = [...y0];
  const samples: Array<{ t: number; y: number[] }> = [{ t: t0, y: [...y] }];

  for (let step = 0; step < steps; step++) {
    const t = t0 + step * h;
    const k1 = f(t, y);
    const k2 = f(t + h / 2, addScaled(y, k1, h / 2));
    const k3 = f(t + h / 2, addScaled(y, k2, h / 2));
    const k4 = f(t + h, addScaled(y, k3, h));
    const next = new Array<number>(n);
    for (let i = 0; i < n; i++) {
      next[i] = y[i] + (h / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]);
    }
    y = next;
    // The final step's sample is appended unconditionally below, so skip it
    // here to avoid duplicating the endpoint.
    if (step + 1 < steps && (step + 1) % sampleEvery === 0) {
      samples.push({ t: t0 + (step + 1) * h, y: [...y] });
    }
  }

  samples.push({ t: t1, y: [...y] });
  return { y, samples };
}
