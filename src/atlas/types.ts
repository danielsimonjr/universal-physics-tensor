/**
 * Atlas Phase 0 pilot types (oscillator pilot).
 *
 * Fixed by `docs/planning/Atlas-Phase-0-Design.md` §2 and the implementation
 * plan's §"S0 types" block, implemented here verbatim.
 *
 * **These are throwaway pilot types** (design note §4). If Phase 1's
 * relation-contract work disagrees with any of them, the Phase 0 type is
 * replaced, not adapted: nothing atlas-side is public before Phase 6 and the
 * only consumers are Phase 0's own tests.
 *
 * Name note: the probe's `RelationKind` and `AuditState` are NOT shadowed —
 * this sprint uses `RelationType` and defines no `AuditState`.
 * `src/composition/bridge-prediction.ts` has a module-local, unexported
 * `interface Regime` for tensor-cell placement; different concept, no
 * import collision.
 *
 * @module atlas/types
 */

import type { DimensionalVariable, PiGroup } from '../dimensional/buckingham.js';

/** The relation a bridge asserts between its premises and its conclusion. @internal */
export type RelationType =
  | 'derivation'
  | 'exact-equivalence'
  | 'restriction'
  | 'approximation'
  | 'coarse-graining'
  | 'analytic-continuation'
  | 'structural-analogy'
  | 'deformation-quantization';

/** What kind of support a record carries. Carried only if its witness passes. @internal */
export type EvidenceTag =
  | 'proposed'
  | 'reviewed'
  | 'dimension-checked'
  | 'convention-checked'
  | 'symbolically-checked'
  | 'numerically-supported'
  | 'formally-proved'
  | 'empirically-supported'
  | 'contradicted'
  | 'unresolved';

/** Whether the limit a bridge takes is regular or singular. @internal */
export type LimitCharacter = 'regular' | 'singular' | 'unknown';

/**
 * One inequality on a regime coordinate. The coordinate is either a π-group
 * `buckinghamPi` produced from the family's dimensioned parameters (keyed by
 * `PiGroup.formula`), or a dimensionless INPUT of the model (an initial datum
 * such as θ0, a wavenumber-lattice product qa) declared as a
 * `DimensionalVariable` with the zero dimension, which is its own trivial
 * group. Derived quantities such as ζ = ½ (m k / b²)^(−½) are NOT groups:
 * write the inequality on the group (`m k / b² > 1/4`) and record the display
 * alias in `alias`.
 *
 * @internal
 */
export interface RegimeInequality {
  /** `PiGroup.formula`, or the dimensionless input's name. */
  readonly group: string;
  readonly op: '<' | '<=' | '>' | '>=';
  readonly bound: number;
  /** `'ζ < 1'` — for display only, never evaluated. */
  readonly alias?: string;
}

/** Where in parameter space a model or bridge is claimed to apply. @internal */
export interface Regime {
  /** `'oscillators'`. */
  readonly family: string;
  readonly inequalities: readonly RegimeInequality[];
  /** Traceability back to the dimension matrix, keyed by `PiGroup.formula`. */
  readonly groupDefinitions: Readonly<Record<string, PiGroup>>;
}

/** A Lipschitz-plus-offset error bound with a mandatory horizon. @internal */
export interface ApproximationBound {
  /** Lipschitz constant of the map, in the stated norm. */
  readonly K: number;
  /** Uniform error, same norm. */
  readonly delta: number;
  /** `'relative period'`, `'sup |x − x_reduced| for t ≥ 5 m/b'`, … */
  readonly norm: string;
  /** Where the bound holds. */
  readonly domain: string;
  /** MANDATORY prose horizon: `'t ≪ 16 T0/θ0²'`. */
  readonly horizon: string;
  /** MANDATORY machine form of `horizon`: true while the bound is claimed to hold. */
  readonly horizonHolds: (t: number, params: Readonly<Record<string, number>>) => boolean;
  /** `'θ0 ≤ 0.5 rad'`. */
  readonly parameterRange?: string;
  readonly limitCharacter: LimitCharacter;
}

/** A named check that supports a record, and the test file that runs it. @internal */
export interface Witness {
  /** `'W7b'`. */
  readonly id: string;
  readonly kind: 'symbolic' | 'numeric' | 'formal';
  /** Test file path. */
  readonly test: string;
  /** As stated in the brief. */
  readonly tolerance?: string;
}

/** One model in the atlas. @internal */
export interface AtlasModel {
  /** `'model-spring'`, `'model-lc'`, … */
  readonly id: string;
  readonly family: string;
  readonly stateSpace: string;
  /** Display form of the ODE. */
  readonly dynamics: string;
  readonly observables: readonly string[];
  /** Dimensioned parameters. */
  readonly parameters: readonly DimensionalVariable[];
  /** `'theta0'`, `'qa'` — declared with the zero dimension. */
  readonly dimensionlessInputs: readonly string[];
  /** `'CE-simple-harmonic-frequency'`, … — must resolve in `CANONICAL_EQUATIONS`. */
  readonly canonicalRefs: readonly string[];
  readonly regime: Regime;
}

/** A case a bridge does NOT cover, and the witness that shows it. @internal */
export interface Counterexample {
  readonly description: string;
  /** `'W2b'`. */
  readonly witness: string;
}

/** Field set = Blueprint v2 §3.1 Bridge record + citations. @internal */
export interface AtlasBridge {
  /** `'ab-spring-lc'`. */
  readonly id: string;
  readonly relation: RelationType;
  /** Model ids (many). */
  readonly premises: readonly string[];
  /** Model id (one). */
  readonly conclusion: string;
  /** `'u = x/x0 (or q/q0), τ = ω0 t'`. */
  readonly transformation: string;
  /** `'x = x0 u, t = τ/ω0'` — required for `exact-equivalence`. */
  readonly inverse?: string;
  readonly preserves: readonly string[];
  readonly doesNotPreserve: readonly string[];
  readonly sideConditions: readonly string[];
  /** Required iff `relation === 'approximation'`. */
  readonly bound?: ApproximationBound;
  readonly regime: Regime;
  readonly counterexamples: readonly Counterexample[];
  readonly evidence: ReadonlySet<EvidenceTag>;
  readonly witnesses: readonly Witness[];
  readonly citations: readonly string[];
  readonly reviewStatus: 'proposed' | 'reviewed';
}

/** A claimed bridge the atlas records as REJECTED, with the reason. @internal */
export interface AtlasRejection {
  /** `'ax-cubic-spring-lc'`. */
  readonly id: string;
  readonly claimed: RelationType;
  readonly premises: readonly string[];
  readonly conclusion: string;
  readonly reason: string;
  /** `'beta·x0²·k⁻¹'`. */
  readonly survivingGroup: string;
  readonly witnesses: readonly Witness[];
}

/** Thrown when an `ApproximationBound` is built without its machine horizon. @internal */
export class MissingHorizonError extends Error {}

/** Thrown when a bound path has no Lipschitz constant anywhere but at its end. @internal */
export class MissingLipschitzError extends Error {}
