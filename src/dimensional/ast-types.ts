/**
 * The dimensional AST type system — `ExprNode` and every node/index interface
 * it unions, in ONE leaf module.
 *
 * Previously `ExprNode` lived in `validator.ts` and pulled its member node types
 * from ~9 sibling modules (`tensor`, `metric-validators`, `connection-
 * validators`, `curvature`, …). Two of those (`tensor`, `curvature`) imported
 * `ExprNode` back, forming type-only cycles, and several node interfaces used
 * `of: unknown` casts to dodge importing `ExprNode`. Consolidating the *types*
 * here (this module imports only `types.ts` + the leaf `curvature-composite.ts`,
 * so it has no back-edges) breaks both cycles and lets the derivative nodes type
 * `of`/`wrt` as real `ExprNode`.
 *
 * Each origin module now re-exports its types from here (so existing importers
 * are unchanged) and keeps only its validation FUNCTIONS.
 *
 * @module dimensional/ast-types
 */

import type { Dimension } from './types.js';
import type { CurvatureCompositeNode } from './curvature-composite.js';

// ── index types ─────────────────────────────────────────────────────────────

export type Variance = 'upper' | 'lower';
export type Role = 'coordinate' | 'field' | 'constant';

export interface TensorIndex {
  readonly label: string;
  readonly variance: Variance;
}

/** A strictly-lower tensor index. */
export interface CovariantIndex {
  readonly label: string;
  readonly variance: 'lower';
}

/** A strictly-upper tensor index. */
export interface UpperIndex {
  readonly label: string;
  readonly variance: 'upper';
}

// ── transcendental functions ────────────────────────────────────────────────

/**
 * Elementwise transcendental functions usable in a `transcendental` node. All
 * take a DIMENSIONLESS argument and return a DIMENSIONLESS result. (`sqrt`/`cbrt`
 * are excluded — they produce fractional dimensions.)
 */
export type TranscendentalFn =
  | 'exp'
  | 'ln'
  | 'log2'
  | 'log10'
  | 'sin'
  | 'cos'
  | 'tan'
  | 'sinh'
  | 'cosh'
  | 'tanh';

// ── tensor nodes ────────────────────────────────────────────────────────────

export interface TensorSymbolNode {
  readonly kind: 'tensor-symbol';
  readonly name: string;
  readonly indices: ReadonlyArray<TensorIndex>;
  readonly dim: Dimension;
  /** Semantic classification (default 'field'). Structural metadata only. */
  readonly role?: Role;
  /** v0.3.5 numerical pderiv strategy when this is a partial-derivative `of`
   *  operand (default 'symbolic'). */
  readonly numericalForm?: 'symbolic' | 'numerical-fn' | 'grid';
}

export interface TensorProductNode {
  readonly kind: 'tensor-product';
  readonly args: ReadonlyArray<ExprNode>;
}

// ── metric nodes ────────────────────────────────────────────────────────────

export interface MetricTensorNode {
  readonly kind: 'metric-tensor';
  readonly name: string;
  readonly indices: ReadonlyArray<TensorIndex>;
  readonly signature: string;
  readonly dim: Dimension;
  /** v0.4.0 numerical-lowering hint for ∂g (default 'computed'). */
  readonly derivativeStrategy?: 'computed' | 'zero' | 'supplied';
}

export interface KroneckerDeltaNode {
  readonly kind: 'kronecker-delta';
  readonly indices: ReadonlyArray<TensorIndex>;
  readonly dim: Dimension;
}

export interface TensorPartialDerivativeNode {
  readonly kind: 'tensor-partial-derivative';
  readonly of: ExprNode;
  readonly wrt: ExprNode;
  readonly wrtIndex: CovariantIndex;
}

// ── connection / curvature nodes ────────────────────────────────────────────

export interface CovariantDerivativeNode {
  readonly kind: 'covariant-derivative';
  readonly of: ExprNode;
  readonly wrt: ExprNode;
  readonly wrtIndex: CovariantIndex;
  readonly gLower: MetricTensorNode;
  readonly gInverse: MetricTensorNode;
}

export type RiemannTensorNode = CurvatureCompositeNode<'riemann-tensor', {
  readonly upperIndex: UpperIndex;
  readonly lowerIndices: readonly [CovariantIndex, CovariantIndex, CovariantIndex];
  readonly gLower: MetricTensorNode;
  readonly gInverse: MetricTensorNode;
  readonly xCoord: TensorSymbolNode;
}>;

export type RicciTensorNode = CurvatureCompositeNode<'ricci-tensor', {
  /** The Riemann tensor whose first two slots are contracted. */
  readonly riemann: RiemannTensorNode;
}>;

export type EinsteinTensorNode = CurvatureCompositeNode<'einstein-tensor', {
  /** The Riemann tensor whose contraction yields the inner Ricci R_μν. */
  readonly riemann: RiemannTensorNode;
  /** Lower metric g_μν — supplies the `½ R g_μν` subtraction tensor. */
  readonly gLower: MetricTensorNode;
  /** Upper metric g^μν — supplies the scalar trace `R = g^μν R_μν`. */
  readonly gInverse: MetricTensorNode;
}>;

export type BianchiResidualNode = CurvatureCompositeNode<'bianchi-residual', {
  /** The Riemann tensor whose cyclic-derivative identity is checked. */
  readonly riemann: RiemannTensorNode;
}>;

export type WeylTensorNode = CurvatureCompositeNode<'weyl-tensor', {
  /** Metric g_{μν} (both-lower). Present for numerical lowering consumers. */
  readonly metric: MetricTensorNode;
  /** Contravariant (upper) index ρ. */
  readonly upperIndex: UpperIndex;
  /** Three covariant (lower) indices [σ, μ, ν]. */
  readonly lowerIndices: readonly [CovariantIndex, CovariantIndex, CovariantIndex];
  /** Dimensional signature of each component: [L⁻²], same as Riemann. */
  readonly componentDim: Dimension;
}>;

export type KretschmannScalarNode = CurvatureCompositeNode<'kretschmann-scalar', {
  /** Riemann tensor R^ρ_{σμν}. */
  readonly riemann: RiemannTensorNode;
  /** Metric (both-lower preferred). */
  readonly metric: MetricTensorNode;
}>;

// ── Killing / stress-energy / field-equation nodes ──────────────────────────

export interface KillingVectorNode {
  readonly kind: 'killing-vector';
  readonly vector: TensorSymbolNode;
  readonly metric: MetricTensorNode;
}

export interface ConservedChargeNode {
  readonly kind: 'conserved-charge';
  /** The Killing vector ξ^μ (rank-1, upper variance). */
  readonly killing: KillingVectorNode;
  /** The covariant momentum p_μ (rank-1, lower variance), sharing the Killing
   *  vector's index label so ξ^μ p_μ is well-formed. */
  readonly momentum: TensorSymbolNode;
}

export interface StressEnergyTensorNode {
  readonly kind: 'stress-energy';
  readonly symbol: 'T';
  readonly indices: readonly [CovariantIndex, CovariantIndex];
  readonly symmetry: 'symmetric';
  readonly componentDim: Dimension;
}

export interface CosmologicalConstantNode {
  readonly kind: 'cosmological-constant';
  readonly symbol: 'Λ';
  readonly dim: Dimension; // [L⁻²]
  readonly value?: number; // optional numeric value (e.g., 1.1056e-52 m⁻²)
}

export interface EinsteinFieldEquationNode {
  readonly kind: 'einstein-equation';
  readonly lhs: EinsteinTensorNode;
  readonly cosmological: CosmologicalConstantNode | null;
  readonly metric: MetricTensorNode;
  readonly rhs: StressEnergyTensorNode;
  readonly coupling: 'einstein';
}

// ── the ExprNode union ──────────────────────────────────────────────────────

export type ExprNode =
  | { kind: 'symbol'; name: string; dim: Dimension }
  | { kind: 'op'; op: '+' | '-' | '*' | '/' | '^'; args: ExprNode[] }
  // ∫ integrand d(over); optional lower/upper bounds make it a DEFINITE integral.
  | { kind: 'integral'; over: ExprNode; integrand: ExprNode; lower?: ExprNode; upper?: ExprNode }
  | { kind: 'derivative'; of: ExprNode; wrt: ExprNode }
  // Dirac-δ correlator: ∫δ(x)dx=1 ⟹ [δ(x)]=[x]⁻¹.
  | { kind: 'dirac-delta'; arg: ExprNode }
  // Functional derivative δF/δφ "over" the measure dμ: [δF/δφ]=[F]/([φ]·[μ]).
  | { kind: 'variational-derivative'; functional: ExprNode; field: ExprNode; over: ExprNode }
  // Elementwise transcendental of a DIMENSIONLESS arg → DIMENSIONLESS result.
  | { kind: 'transcendental'; fn: TranscendentalFn; arg: ExprNode }
  // Absolute value |x| — dimension-PRESERVING (unlike the transcendentals).
  | { kind: 'abs'; arg: ExprNode }
  | TensorSymbolNode
  | TensorProductNode
  | MetricTensorNode
  | KroneckerDeltaNode
  | TensorPartialDerivativeNode
  | CovariantDerivativeNode
  | RiemannTensorNode
  | RicciTensorNode
  | EinsteinTensorNode
  | BianchiResidualNode
  | KillingVectorNode
  | ConservedChargeNode
  | StressEnergyTensorNode
  | CosmologicalConstantNode
  | EinsteinFieldEquationNode
  | WeylTensorNode
  | KretschmannScalarNode;
