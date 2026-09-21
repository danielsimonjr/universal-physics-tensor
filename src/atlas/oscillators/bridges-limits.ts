/**
 * The two Phase 0 APPROXIMATION bridges — design note §3, bridges 3 and 4.
 *
 * - `ab-pendulum-linear` — a REGULAR limit. `θ'' + ω0² sin θ = 0` reduces to
 *   `θ'' + ω0² θ = 0` as `θ0 → 0`. The order of the system does not drop, the
 *   error is `O(θ0²)` in the relative period, and the approximation is
 *   NON-UNIFORM in time: a fixed relative period error accumulates phase
 *   without bound, so the bound carries the horizon `t ≪ 16 T0/θ0²`.
 * - `ab-damped-massless` — a SINGULAR limit. `m x'' + b x' + k x = 0` reduces
 *   to `b x' + k x = 0` as `m → 0`. The order DROPS from two to one, one
 *   initial condition is lost, and the reduced model cannot satisfy `x'(0)`.
 *   The bound therefore holds only OUTSIDE the boundary layer, `t ≥ 5 m/b`.
 *
 * On the position offset of the singular bridge: `x_full − x_red` is an
 * `O((1 + |v0|) m)` deviation that PERSISTS THROUGHOUT THE OUTER REGION and
 * decays only on the slow time scale `b/k`. It is the matched-asymptotics
 * correction, not a boundary-layer transient, and waiting out the fast mode
 * does not remove it. (Design note §9 YELLOW (5) — "non-vanishing" was the
 * imprecise wording this replaces: the offset does go to zero as `t → ∞`.)
 *
 * @module atlas/oscillators/bridges-limits
 */

import { deriveRegimeGroups } from '../regime.js';
import { MissingHorizonError } from '../types.js';
import type { ApproximationBound, AtlasBridge, Regime } from '../types.js';
import { DAMPING, SPRING_CONSTANT } from './dimensions.js';
import { ACCELERATION, LENGTH, MASS } from '../../dimensional/types.js';

const FAMILY = 'oscillators';
const TEST_FILE = 'tests/atlas/oscillators-limits.test.ts';

/**
 * Build an `ApproximationBound`, rejecting one with no prose horizon.
 *
 * Every `approximation` bridge in this module is constructed through here, so
 * the mandatory-horizon rule of `ApproximationBound` has something that FAILS
 * rather than a comment asking for compliance. `horizonHolds` is mandatory by
 * the type; the prose `horizon` is the field a caller can satisfy with `''`,
 * so it is the one checked at run time.
 *
 * @throws MissingHorizonError if `horizon` is empty or whitespace.
 * @internal
 */
export function makeApproximation(bound: ApproximationBound): ApproximationBound {
  if (bound.horizon.trim() === '') {
    throw new MissingHorizonError(
      'an approximation bound requires a non-empty prose horizon beside horizonHolds',
    );
  }
  return bound;
}

/** Pendulum regime: `θ0 ≤ 0.5 rad`, stated on the dimensionless input. @internal */
const PENDULUM_REGIME: Regime = {
  family: FAMILY,
  inequalities: [{ group: 'theta0', op: '<=', bound: 0.5, alias: 'θ0 ≤ 0.5 rad' }],
  groupDefinitions: deriveRegimeGroups(
    FAMILY,
    [
      { name: 'g', dim: ACCELERATION },
      { name: 'ell', dim: LENGTH },
    ],
    ['theta0'],
  ),
};

/**
 * Damped-spring regime: overdamped, `m k / b² < 1/4`.
 *
 * The inequality is written on the π-group, not on `ζ = ½ (m k / b²)^(−½)`,
 * which is a derived quantity and not a group (`RegimeInequality` doc).
 * `m k / b² < 1/4` is exactly `ζ > 1`, recorded as the display alias.
 *
 * @internal
 */
const DAMPED_REGIME: Regime = {
  family: FAMILY,
  inequalities: [{ group: 'm · b^-2 · k', op: '<', bound: 0.25, alias: 'ζ > 1' }],
  groupDefinitions: deriveRegimeGroups(
    FAMILY,
    [
      { name: 'm', dim: MASS },
      { name: 'b', dim: DAMPING },
      { name: 'k', dim: SPRING_CONSTANT },
    ],
    [],
  ),
};

/**
 * `ab-pendulum-linear` — small-angle pendulum → harmonic spring.
 *
 * `delta = θ0²/16` is the leading term of the exact relative period error
 * `(2/π) K(sin(θ0/2)) − 1`. At `θ0 = 0.2` the residual is `5.744e-6`, which
 * the next series term `11 θ0⁴/3072 = 5.729e-6` accounts for to `1.5e-8`.
 *
 * @internal
 */
export const AB_PENDULUM_LINEAR: AtlasBridge = {
  id: 'ab-pendulum-linear',
  relation: 'approximation',
  premises: ['model-pendulum'],
  conclusion: 'model-spring',
  transformation: 'sin θ → θ, with x ↔ ℓ θ and ω0² = g/ℓ',
  preserves: ['harmonic frequency ω0 to O(θ0²)', 'energy conservation', 'time-reversal symmetry'],
  doesNotPreserve: ['the amplitude dependence of the period', 'phase over times t ≳ 16 T0/θ0²'],
  sideConditions: ['θ0 ≤ 0.5 rad', 'the bound is a PERIOD error and is not uniform in time'],
  bound: makeApproximation({
    K: 1,
    delta: 0.5 ** 2 / 16,
    norm: 'relative period error',
    domain: 'θ0 ≤ 0.5 rad',
    horizon: 't ≪ 16 T0/θ0²; machine form t < 4 T0/θ0², the π/2-drift time',
    // ⚠ The machine form is a QUARTER of the prose scale, and it must be.
    // `16 T0/θ0²` is the time at which the accumulated phase drift reaches a
    // FULL 2π (measured: 400 T0 at θ0 = 0.2, drift 6.2976 rad) — by then the
    // approximation has lapped, so `t < 16 T0/θ0²` is not a horizon at all.
    // The `≪` is what carries the whole claim, and `<` does not render it.
    // `4 T0/θ0²` is the π/2-drift time, which is exactly what W7b measures
    // independently (99.77 cycles at θ0 = 0.2). It is also what makes
    // `horizonHolds(200 T0)` false and `horizonHolds(10 T0)` true.
    horizonHolds: (t, params) => {
      const { T0, theta0 } = params;
      if (!Number.isFinite(T0) || !Number.isFinite(theta0) || theta0 === 0) return false;
      return t < (4 * T0) / theta0 ** 2;
    },
    parameterRange: 'θ0 ≤ 0.5 rad',
    limitCharacter: 'regular',
  }),
  regime: PENDULUM_REGIME,
  counterexamples: [
    {
      description:
        'the approximation is non-uniform in time: at θ0 = 0.2 the phase drift reaches π/2 ' +
        'after ~100 cycles, however small the per-cycle error is',
      witness: 'W7b',
    },
  ],
  evidence: new Set(['numerically-supported']),
  witnesses: [
    {
      id: 'W7',
      kind: 'numeric',
      test: TEST_FILE,
      tolerance: 'T/T0 − 1 ∈ [0.002505, 0.002507]; residual ∈ [5.70e-6, 5.76e-6] at θ0 = 0.2',
    },
    {
      id: 'W7b',
      kind: 'numeric',
      test: TEST_FILE,
      tolerance: 'cycles to π/2 drift ∈ [99, 101] at θ0 = 0.2',
    },
    {
      id: 'W7c',
      kind: 'numeric',
      test: TEST_FILE,
      tolerance: 'RK4 zero-crossing lag within 0.05° of the elliptic prediction 89.98°',
    },
  ],
  citations: [
    'Landau & Lifshitz, Mechanics §11 (pendulum period as a complete elliptic integral)',
    'Abramowitz & Stegun §17.6 (AGM evaluation of K)',
  ],
  reviewStatus: 'proposed',
};

/**
 * `ab-damped-massless` — the SINGULAR `m → 0` limit of the damped spring.
 *
 * `delta = 2(1 + |v0|) m/b` bounds the position offset outside the boundary
 * layer. The lost initial condition is visible in the VELOCITY: inside the
 * layer the reduced model's `x'` is wrong by O(1/m·…), and it is only after
 * `t ≈ 5 m/b` that the fast mode has decayed.
 *
 * @internal
 */
export const AB_DAMPED_MASSLESS: AtlasBridge = {
  id: 'ab-damped-massless',
  relation: 'approximation',
  premises: ['model-damped-spring'],
  conclusion: 'model-first-order',
  transformation: 'm → 0, dropping the m x″ term',
  preserves: ['the slow relaxation rate k/b to O(m)', 'the sign and monotonicity of the decay'],
  doesNotPreserve: [
    'the order of the system (two → one)',
    "the initial condition x'(0), which the reduced model cannot satisfy",
    'the fast mode r ≈ −b/m',
  ],
  sideConditions: [
    'overdamped: m k / b² < 1/4',
    'the bound holds only outside the boundary layer, t ≥ 5 m/b',
  ],
  bound: makeApproximation({
    K: 1,
    delta: 2 * (1 + 5) * 1e-3,
    norm: 'sup |x − x_reduced| for t ≥ 5 m/b',
    domain: 't ≥ 5 m/b, overdamped',
    horizon: 't ≥ 5 m/b (outside the boundary layer)',
    horizonHolds: (t, params) => {
      const { m, b } = params;
      if (!Number.isFinite(m) || !Number.isFinite(b) || b === 0) return false;
      return t >= (5 * m) / b;
    },
    parameterRange: 'm k / b² < 1/4, |v0| ≤ 5',
    limitCharacter: 'singular',
  }),
  regime: DAMPED_REGIME,
  counterexamples: [
    {
      description:
        "inside the boundary layer the reduced model's velocity is wrong by O(1): at " +
        "t = 0.5 m/b with v0 = 5 the velocity error is 3.6, against x'_red = −1",
      witness: 'W8b',
    },
  ],
  evidence: new Set(['numerically-supported']),
  witnesses: [
    {
      id: 'W8',
      kind: 'numeric',
      test: TEST_FILE,
      tolerance: '|r_slow + k/b| < 2m and |r_fast·m + b| < 2m for m ∈ {1e-1, 1e-2, 1e-3}',
    },
    {
      id: 'W8b',
      kind: 'numeric',
      test: TEST_FILE,
      tolerance:
        "|x_full − x_red| < 2(1+v0)·m for t ≥ 5 m/b; |x'| error > 1 at 0.5 m/b and < 0.05 at 5 m/b",
    },
  ],
  citations: [
    "Kevorkian & Cole, Multiple Scale and Singular Perturbation Methods §2 (Tikhonov's theorem)",
    'Verhulst, Methods and Applications of Singular Perturbations §8 (boundary layers)',
  ],
  reviewStatus: 'proposed',
};

/** The two approximation bridges of this module, in design-note order. @internal */
export const LIMIT_BRIDGES: readonly AtlasBridge[] = [AB_PENDULUM_LINEAR, AB_DAMPED_MASSLESS];
