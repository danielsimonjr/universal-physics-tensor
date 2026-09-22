/**
 * Atlas Phase 4, S4.3 — the EXECUTABLE witness registry.
 *
 * Design note: `docs/planning/Atlas-Phase-4-Design.md` §3.
 *
 * A `Witness` record names a check and the test file that runs it; it carries
 * nothing a runner can execute. This module holds the executable form of every
 * witness the results artifact covers, keyed by the record it supports. The
 * Lead-run `scripts/emit-witness-results.mjs` runs exactly this list, and
 * `tests/atlas/witness-results.test.ts` deep-equals the committed artifact
 * against a fresh run of it.
 *
 * ## The symbolic specs apply the bridge's DICTIONARY, they do not restate it
 *
 * Writing `lhs` and `rhs` as two hand-typed ASTs that happen to be equal would
 * check nothing but the typist. Each spec below starts from the PREMISE
 * model's expression and pushes it through the bridge's variable dictionary
 * with `substitute`; the CAS then has to show that the result equals the
 * CONCLUSION model's expression. What is checked is the dictionary.
 *
 * @module atlas/witness-specs
 * @internal
 */

import type { ExprNode } from '../dimensional/ast-types.js';
import { sym } from '../dimensional/ast-builders.js';
import { DIMENSIONLESS, LENGTH, MASS } from '../dimensional/types.js';
import { substitute } from '../composition/expr-subst.js';
import {
  CAPACITANCE,
  DAMPING,
  INDUCTANCE,
  RESISTANCE,
  SPRING_CONSTANT,
} from './oscillators/dimensions.js';
import {
  diffusionKernel,
  gaussianSpread,
  heatFtcsCentre,
  randomWalkCentralDensity,
  wickHeatResidual,
} from './diffusion/numerics.js';
import type { HeatFixture, WickFixture } from './diffusion/numerics.js';
import { DENSITY, DIFFUSIVITY, SPECIFIC_HEAT, THERMAL_CONDUCTIVITY } from './diffusion/dimensions.js';
import { wickRotatedFreeKernel } from './witnesses/quantum-support.js';
import type { NumericWitnessSpec } from './witness-numeric.js';
import type { SymbolicWitnessSpec } from './witness-symbolic.js';

/** A symbolic spec bound to the record it supports. @internal */
export interface RegisteredSymbolicWitness {
  /** The `AtlasBridge.id` (or other record id) the witness belongs to. */
  readonly recordId: string;
  readonly kind: 'symbolic';
  readonly spec: SymbolicWitnessSpec;
}

/** A numeric spec bound to the record it supports. @internal */
export interface RegisteredNumericWitness {
  readonly recordId: string;
  readonly kind: 'numeric';
  readonly spec: NumericWitnessSpec;
}

/** One entry of the registry. @internal */
export type RegisteredWitness = RegisteredSymbolicWitness | RegisteredNumericWitness;

const op = (o: '*' | '/' | '+' | '-' | '^', ...args: ExprNode[]): ExprNode => ({
  kind: 'op',
  op: o,
  args,
});
const n = (value: number): ExprNode => sym(String(value), DIMENSIONLESS);

/**
 * Push `expr` through a variable dictionary, REFUSING a mapping that matches no
 * leaf. A zero-occurrence substitution is a silent no-op that would leave the
 * premise variable in place and let the check pass or fail for the wrong
 * reason — the same guard `composeSymbolic` applies (Adam A-3).
 */
function applyDictionary(expr: ExprNode, dictionary: Readonly<Record<string, ExprNode>>): ExprNode {
  let out = expr;
  for (const [name, replacement] of Object.entries(dictionary)) {
    const r = substitute(out, name, replacement);
    if (r.count === 0) {
      throw new Error(`witness-specs: dictionary entry '${name}' matches no leaf`);
    }
    out = r.expr;
  }
  return out;
}

// Spring and LC symbols, with the dimensions the oscillator models declare.
const m = sym('m', MASS);
const k = sym('k', SPRING_CONSTANT);
const b = sym('b', DAMPING);
const L = sym('L', INDUCTANCE);
const C = sym('C', CAPACITANCE);
const R = sym('R', RESISTANCE);

/** The spring ↔ circuit dictionary of `ab-spring-lc` / `ab-damped-rlc`: m ↔ L, k ↔ 1/C, b ↔ R. */
const SPRING_TO_CIRCUIT: Readonly<Record<string, ExprNode>> = {
  m: L,
  k: op('/', n(1), C),
  b: R,
};

// ── Diffusion family (S4.4) ────────────────────────────────────────────────

/** WD1 fixture: D and t, fixed while the walk is refined. @internal */
export const WD1_FIXTURE = { D: 0.5, t: 2 } as const;

/**
 * WD2 fixture. κ, ρ and c_p are chosen so the heat equation's own variables
 * are all different from 1 while κ/(ρ c_p) = 1: a dictionary that dropped or
 * inverted a factor would move the answer.
 *
 * @internal
 */
export const WD2_FIXTURE: HeatFixture = {
  kappa: 2,
  rho: 4,
  cp: 0.5,
  s0: 0.05,
  tEnd: 0.2,
  halfWidth: 4,
};

/** WD3 fixture: an off-centre point, so no symmetry zeroes a derivative. @internal */
export const WD3_FIXTURE: WickFixture = { hbar: 1, m: 0.5, s: 0.7, x: 0.3, tau: 0.4, h0: 0.1 };

const kappa = sym('kappa', THERMAL_CONDUCTIVITY);
const rho = sym('rho', DENSITY);
const cp = sym('cp', SPECIFIC_HEAT);
const D = sym('D', DIFFUSIVITY);
const q = sym('q', { ...LENGTH, L: -1 });

/**
 * Every witness the results artifact covers, in a fixed order (the artifact is
 * emitted in this order, so reordering is a reviewable diff, not churn).
 *
 * @internal
 */
export const WITNESS_REGISTRY: readonly RegisteredWitness[] = [
  {
    // ω0² of the spring, pushed through the dictionary, is ω0² of the LC circuit.
    recordId: 'ab-spring-lc',
    kind: 'symbolic',
    spec: {
      id: 'W1s',
      lhs: applyDictionary(op('/', k, m), { m: SPRING_TO_CIRCUIT['m']!, k: SPRING_TO_CIRCUIT['k']! }),
      rhs: op('/', n(1), op('*', L, C)),
    },
  },
  {
    // ζ² of the damped spring, b²/(4mk), pushed through the dictionary, is ζ² of
    // the RLC circuit, R²C/(4L). The squared form avoids a fractional exponent
    // on a dimensioned base, which the grammar forbids.
    recordId: 'ab-damped-rlc',
    kind: 'symbolic',
    spec: {
      id: 'W2s',
      lhs: applyDictionary(op('/', op('^', b, n(2)), op('*', n(4), m, k)), SPRING_TO_CIRCUIT),
      rhs: op('/', op('*', op('^', R, n(2)), C), op('*', n(4), L)),
    },
  },
  {
    // Coarse-graining: the walk's density at the origin converges to the
    // diffusion kernel as the closure D = Δx²/(2Δt) is held and Δt → 0.
    recordId: 'ab-walk-diffusion',
    kind: 'numeric',
    spec: {
      id: 'WD1',
      evaluate: (steps) => randomWalkCentralDensity(steps, WD1_FIXTURE.D, WD1_FIXTURE.t),
      target: diffusionKernel(0, WD1_FIXTURE.t, WD1_FIXTURE.D),
      coarseResolution: 100,
      fineResolution: 1000,
      tolerance: 1e-4,
    },
  },
  {
    // Exact equivalence: the HEAT equation, solved in κ, ρ, c_p, reproduces the
    // FICK solution with D = κ/(ρ c_p).
    recordId: 'ab-heat-diffusion',
    kind: 'numeric',
    spec: {
      id: 'WD2',
      evaluate: (cells) => heatFtcsCentre(cells, WD2_FIXTURE),
      target: gaussianSpread(
        0,
        WD2_FIXTURE.tEnd,
        WD2_FIXTURE.kappa / (WD2_FIXTURE.rho * WD2_FIXTURE.cp),
        WD2_FIXTURE.s0,
      ),
      coarseResolution: 80,
      fineResolution: 160,
      tolerance: 5e-4,
    },
  },
  {
    // The heat side's Fourier-mode decay rate κq²/(ρ c_p), pushed through the
    // inverse dictionary κ ↦ D ρ c_p, is the Fick side's D q².
    recordId: 'ab-heat-diffusion',
    kind: 'symbolic',
    spec: {
      id: 'WD2s',
      lhs: applyDictionary(op('/', op('*', kappa, op('^', q, n(2))), op('*', rho, cp)), {
        kappa: op('*', D, rho, cp),
      }),
      rhs: op('*', D, op('^', q, n(2))),
    },
  },
  {
    // Analytic continuation: the Wick-rotated free kernel satisfies the
    // diffusion equation with D = ħ/(2m); the residual's target is zero.
    recordId: 'ab-schrodinger-diffusion',
    kind: 'numeric',
    spec: {
      id: 'WD3',
      evaluate: (resolution) => wickHeatResidual(resolution, WD3_FIXTURE, wickRotatedFreeKernel),
      target: 0,
      coarseResolution: 1,
      fineResolution: 4,
      tolerance: 1e-3,
    },
  },
];
