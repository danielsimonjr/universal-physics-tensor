/**
 * Validator: walks an ExprNode tree and infers / checks SI dimensions.
 *
 * Honest-claude scope notes:
 *   - Tensor index structure IS tracked: tensor-symbol / tensor-product
 *     nodes carry free-index (upper/lower) signatures, contraction is
 *     enforced, and `validateEquation` now checks valence homogeneity
 *     across '=' (so the spec's Bridge Eq 17 rank mismatch — a tensor
 *     equated to a scalar — is caught even when the SI dimensions agree).
 *   - Special functions (log, exp, trig) are out of scope; their arguments
 *     must be dimensionless but the validator does not yet enforce that.
 *
 * @module dimensional/validator
 */

import {
  Dimension,
  DIMENSIONLESS,
} from './types.js';
import {
  multiply,
  divide,
  power,
  add,
  subtract,
  equals,
  format,
  DimensionMismatchError,
} from './algebra.js';
import {
  TensorInScalarOpError,
  FreeIndexMismatchError,
  TensorProductChildInferenceError,
} from './errors.js';
import type { TensorSymbolNode, TensorProductNode, ChildValidationResult } from './tensor.js';
import { validateTensorSymbol, computeContraction } from './tensor.js';
import type {
  MetricTensorNode,
  KroneckerDeltaNode,
  TensorPartialDerivativeNode,
  PartialDerivativeChildResult,
} from './metric-validators.js';
import {
  validateMetricTensor,
  validateKroneckerDelta,
  validatePartialDerivative,
  checkInverseMetricStructure,
} from './metric-validators.js';
import type { CovariantDerivativeNode, RiemannTensorNode } from './connection-validators.js';
import { validateCovariantDerivative } from './connection-validators.js';
import type { RicciTensorNode, EinsteinTensorNode, BianchiResidualNode } from './curvature.js';
import type { KillingVectorNode, ConservedChargeNode } from './killing-validators.js';
import type { StressEnergyTensorNode, CosmologicalConstantNode } from './stress-energy-validators.js';
import type { EinsteinFieldEquationNode } from './einstein-equation.js';
import type { WeylTensorNode } from './weyl-validators.js';
import type { KretschmannScalarNode } from './curvature-invariants.js';
// v0.6.1 Phase 2: 11-arm curvature/GR-object dispatch consolidated into
// the validator-registry module. The individual `validateX` functions
// are still imported by validator-registry.ts (which the registry
// indexes); validator.ts now only needs the dispatcher helpers.
import {
  lookupValidatorEntry,
  dispatchValidator,
  shouldPropagateFreeIndices,
} from './validator-registry.js';

/**
 * Elementwise transcendental functions usable in a scalar `transcendental`
 * node. All take a DIMENSIONLESS argument and return a DIMENSIONLESS result.
 * (`sqrt`/`cbrt` are excluded — they produce fractional dimensions.)
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

export type ExprNode =
  | { kind: 'symbol'; name: string; dim: Dimension }
  | { kind: 'op'; op: '+' | '-' | '*' | '/' | '^'; args: ExprNode[] }
  | { kind: 'integral'; over: ExprNode; integrand: ExprNode }
  | { kind: 'derivative'; of: ExprNode; wrt: ExprNode }
  // v0.14 distributional/variational primitives (scalar, non-numerical).
  // Dirac-δ correlator: ∫δ(x)dx=1 ⟹ [δ(x)]=[x]⁻¹. Multi-arg δ³(x)δ(t) is an
  // `op '*'` of single-arg nodes.
  | { kind: 'dirac-delta'; arg: ExprNode }
  // Functional derivative δF/δφ "over" the integration measure dμ:
  // δF=∫(δF/δφ)δφ dμ ⟹ [δF/δφ]=[F]/([φ]·[μ]). `over` carries [dμ].
  | { kind: 'variational-derivative'; functional: ExprNode; field: ExprNode; over: ExprNode }
  // Elementwise transcendental of a DIMENSIONLESS argument → DIMENSIONLESS
  // result (the Taylor series 1 + x + x²/2 + … only adds across like dimensions
  // when x is dimensionless). Lets bridges encode exp/log/trig of a real
  // sub-expression instead of an opaque typed-stub symbol, so the inner
  // variables become visible to differentiation. `sqrt` is intentionally NOT a
  // member: it maps a dimension D ↦ D^(1/2), which needs rational dimension
  // exponents the algebra does not yet support (deferred).
  | { kind: 'transcendental'; fn: TranscendentalFn; arg: ExprNode }
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

// Re-export tensor types for consumers that import from validator.
// v0.6.1: TensorExprNode removed — it was a forwarder-only alias with
// no downstream consumer.
export type { TensorSymbolNode, TensorProductNode } from './tensor.js';
export type {
  MetricTensorNode,
  KroneckerDeltaNode,
  TensorPartialDerivativeNode,
} from './metric-validators.js';
export type { CovariantDerivativeNode, RiemannTensorNode, UpperIndex } from './connection-validators.js';
export type { RicciTensorNode, EinsteinTensorNode, BianchiResidualNode } from './curvature.js';
export type { KillingVectorNode, ConservedChargeNode } from './killing-validators.js';
export type { StressEnergyTensorNode, CosmologicalConstantNode } from './stress-energy-validators.js';
export type { EinsteinFieldEquationNode } from './einstein-equation.js';
export type { WeylTensorNode } from './weyl-validators.js';
export type { KretschmannScalarNode } from './curvature-invariants.js';

export interface Violation {
  /** Tree path, e.g. "args[1].args[0]". Empty string for the root. */
  location: string;
  expected: Dimension;
  actual: Dimension;
  note: string;
  /** v0.3.5: absent ⇒ 'error'. 'warning'-severity violations do not fail
   *  validation (ValidationResult.ok stays true) but are still reported. */
  severity?: 'error' | 'warning';
}

export interface ValidationResult {
  ok: boolean;
  inferredDimension: Dimension | null;
  /** Map of free (uncontracted) index labels to their upper/lower counts.
   *  Empty for scalar expressions. Populated by tensor-symbol /
   *  tensor-product validation (Tasks 5 and 6). */
  freeIndices: Map<string, { upper: number; lower: number }>;
  violations: Violation[];
}

/**
 * Per-bridge dimensional self-check report. Each `src/bridges/equations/`
 * module exports a `validate*Dimensions(): DimensionValidationReport` helper
 * that runs `validateEquation(LHS, RHS)` and returns LHS/RHS inferred dims
 * alongside the homogeneity verdict. Lifted here so the 9+ bridge modules
 * import a single shared shape rather than redeclaring it byte-for-byte.
 *
 * Source: simplifier F2 (Wave G), confidence 88. The interface satisfies
 * Karpathy's three extraction criteria — single semantic meaning, ≥9
 * consumers, future encodings will use it.
 */
export interface DimensionValidationReport {
  ok: boolean;
  lhsDim: Dimension | null;
  rhsDim: Dimension | null;
}

interface InferContext {
  path: string;
  violations: Violation[];
  /** Free-indices accumulator for the root expression. Tensor-aware node
   *  cases (tensor-symbol, tensor-product) populate this; scalar cases
   *  leave it alone. validate() reads it after walking to construct the
   *  ValidationResult.freeIndices map. Shared by reference across the
   *  recursion so sibling subtrees can contribute. */
  freeIndices: Map<string, { upper: number; lower: number }>;
}

function joinPath(path: string, segment: string): string {
  return path === '' ? segment : `${path}.${segment}`;
}

/**
 * Structural equality for freeIndices maps. Two maps are equal iff they
 * contain the same label set and each label's `{upper, lower}` counts
 * match. Used by `op '+'` / `'-'` (Task 7 / Part-VII §VII.5) to enforce
 * that all operands of a tensor sum share the same free-index signature.
 */
function freeIndicesEqual(
  a: Map<string, { upper: number; lower: number }>,
  b: Map<string, { upper: number; lower: number }>,
): boolean {
  if (a.size !== b.size) return false;
  for (const [label, counts] of a) {
    const other = b.get(label);
    if (!other) return false;
    if (other.upper !== counts.upper || other.lower !== counts.lower) return false;
  }
  return true;
}

/**
 * Human-readable summary of a freeIndices map for use in error messages.
 * Empty map renders as `{}` so a tensor-vs-scalar mismatch is visually
 * obvious in the thrown FreeIndexMismatchError text.
 */
function formatFreeIndices(m: Map<string, { upper: number; lower: number }>): string {
  if (m.size === 0) return '{}';
  const parts: string[] = [];
  for (const [label, counts] of m) {
    parts.push(`${label}:{upper:${counts.upper},lower:${counts.lower}}`);
  }
  return `{${parts.join(', ')}}`;
}

/**
 * Merge every `{label → counts}` entry from `source` into `target`,
 * overwriting any existing entry for the same label. v0.7.1 Phase 4
 * Task 4.3 — consolidates the eight `for (const [label, counts] of …)
 * target.set(label, counts)` instances across the `infer()` switch arms
 * into a single helper (callsites at lines 465, 527, 549, 563, 571, 581,
 * 591, 624 in pre-extraction validator.ts).
 *
 * The semantics are an "overwrite-style" merge — child results are
 * authoritative when their labels collide with the parent context.
 * (This matches the original inline-loop behaviour. There is NO
 * accumulating `.upper +=` variant anywhere in `validator.ts`.)
 *
 * @internal
 */
function mergeFreeIndices(
  target: Map<string, { upper: number; lower: number }>,
  source: Map<string, { upper: number; lower: number }>,
): void {
  for (const [label, counts] of source) {
    target.set(label, counts);
  }
}

/**
 * Infer an arg's dimension and capture its LOCAL freeIndices map. Used by
 * `op '+'` / `'-'` (to compare maps across args) and by `op '*'` / `'/'` /
 * `'^'` (to reject any tensor-valued operand). The arg's freeIndices are
 * NOT merged into `ctx.freeIndices` here — the caller decides whether to
 * merge (op '+' merges after equality check) or discard (op '*' rejects).
 *
 * Violations from the arg's subtree are forwarded to `ctx.violations`, so
 * error reports stay coherent with the rest of the walker.
 */
function inferArgLocal(
  node: ExprNode,
  ctx: InferContext,
  segment: string,
): { dim: Dimension | null; freeIndices: Map<string, { upper: number; lower: number }> } {
  const localFI = new Map<string, { upper: number; lower: number }>();
  const localCtx: InferContext = {
    path: joinPath(ctx.path, segment),
    violations: ctx.violations,
    freeIndices: localFI,
  };
  const dim = infer(node, localCtx);
  return { dim, freeIndices: localFI };
}

/**
 * Resolve a child node for `computeContraction` — returns a LOCAL
 * `{dim, freeIndices}` result with no shared mutable state. This is the
 * cycle-breaker and nested-safety primitive: it lets tensor-product
 * recursion avoid touching `ctx.freeIndices` for any subtree.
 *
 *   - tensor-symbol → forwards to `validateTensorSymbol` (returns a local Map).
 *   - tensor-product → recurses into `computeContraction` with this same
 *     resolver, threading violations + path through `parentCtx` so error
 *     reports stay informative.
 *   - all other kinds → invoke `infer()` against a throwaway context so the
 *     dimension is computed but no free-indices state leaks; non-tensor
 *     nodes contribute an empty freeIndices map.
 *
 * Violations from non-tensor children DO get appended to `parentCtx.violations`
 * (via the throwaway ctx's violations array, which we then splice in). This
 * keeps error reporting equivalent to the inline-recursion shape used by
 * the scalar `op` / `integral` / `derivative` cases.
 */
function resolveChildForContraction(
  node: ExprNode,
  parentCtx: InferContext,
): ChildValidationResult {
  if (node.kind === 'tensor-symbol') {
    return validateTensorSymbol(node);
  }
  if (node.kind === 'metric-tensor') {
    return validateMetricTensor(node);
  }
  if (node.kind === 'kronecker-delta') {
    return validateKroneckerDelta(node);
  }
  if (node.kind === 'tensor-product') {
    return computeContraction(node.args, (grandchild) =>
      resolveChildForContraction(grandchild, parentCtx),
    );
  }
  // Non-tensor child: use `infer()` for dimension only. Use a throwaway
  // freeIndices map (discarded) but forward violations to the parent so
  // error reports remain coherent.
  const probe: InferContext = {
    path: parentCtx.path,
    violations: parentCtx.violations,
    freeIndices: new Map(),
  };
  const dim = infer(node, probe);
  if (dim === null) {
    // Surface as an error rather than silently producing a malformed
    // ContractionResult. The probe already recorded the violation in
    // parentCtx.violations, so the message here is the second signal.
    // Subclass of UPTError (§14.7) so downstream consumers can
    // discriminate UPT-source errors uniformly with `instanceof UPTError`.
    throw new TensorProductChildInferenceError(
      'tensor-product: a non-tensor operand failed dimension inference; ' +
        'see ValidationResult.violations for the underlying cause.',
    );
  }
  return { dim, freeIndices: probe.freeIndices };
}

/**
 * Resolve a child of a tensor-partial-derivative to its local
 * {dim, freeIndices, role?} carrier. Same shape as
 * `resolveChildForContraction` but returns role-aware result so the
 * pderiv validator can pass through `of.role` (Design §13 Q1).
 */
function resolveChildForPartialDerivative(
  node: unknown,
  parentCtx: InferContext,
): PartialDerivativeChildResult {
  const typed = node as ExprNode;
  if (typed.kind === 'tensor-symbol') {
    const result = validateTensorSymbol(typed);
    return { dim: result.dim, freeIndices: result.freeIndices, role: typed.role };
  }
  if (typed.kind === 'metric-tensor') {
    const result = validateMetricTensor(typed);
    return { dim: result.dim, freeIndices: result.freeIndices };
  }
  if (typed.kind === 'kronecker-delta') {
    const result = validateKroneckerDelta(typed);
    return { dim: result.dim, freeIndices: result.freeIndices };
  }
  if (typed.kind === 'tensor-partial-derivative') {
    const result = validatePartialDerivative(typed, (grandchild) =>
      resolveChildForPartialDerivative(grandchild, parentCtx),
    );
    return result;
  }
  // For scalars / op / integral / derivative / tensor-product nodes, use
  // inferArgLocal for dim + freeIndices, no role.
  const probe = inferArgLocal(typed, parentCtx, '<pderiv-child>');
  if (probe.dim === null) {
    throw new TensorProductChildInferenceError(
      'tensor-partial-derivative child failed dimension inference; ' +
        'see ValidationResult.violations for cause.',
    );
  }
  return { dim: probe.dim, freeIndices: probe.freeIndices };
}

/**
 * Resolve a child of a covariant-derivative to its local {dim, freeIndices, role?}
 * carrier. Same recursion pattern as resolveChildForPartialDerivative — reuses
 * the partial-derivative resolver since the same child kinds appear.
 */
function resolveChildForCovariantDerivative(
  node: unknown,
  parentCtx: InferContext,
): PartialDerivativeChildResult {
  return resolveChildForPartialDerivative(node, parentCtx);
}

/**
 * Recursive dimension inference. On any sub-expression error we record a
 * violation, return `null`, and let parent ops propagate the null up.
 */
function infer(node: ExprNode, ctx: InferContext): Dimension | null {
  switch (node.kind) {
    case 'symbol':
      return node.dim;

    case 'op': {
      if (node.op === '^') {
        // a^n — base is an arbitrary expression. A numeric-literal exponent
        // works on any base (power(baseDim, n)). A non-literal (input-dependent)
        // exponent is supported ONLY on a DIMENSIONLESS base (v0.13), where the
        // result is dimensionless regardless of the exponent's value.
        if (node.args.length !== 2) {
          ctx.violations.push({
            location: ctx.path,
            expected: DIMENSIONLESS,
            actual: DIMENSIONLESS,
            note: `^ requires exactly 2 args (base, exponent), got ${node.args.length}`,
          });
          return null;
        }
        const [baseNode, expNode] = node.args;
        // Per Part-VII §VII.5: '^' is a scalar operator. Capture the base's
        // local freeIndices and reject if non-empty (tensor base).
        const baseProbe = inferArgLocal(baseNode, ctx, 'args[0]');
        const baseDim = baseProbe.dim;
        if (baseDim === null) return null;
        if (baseProbe.freeIndices.size > 0) {
          throw new TensorInScalarOpError('^');
        }
        // Classify the exponent. A numeric-literal symbol keeps the existing
        // behavior — it supports a DIMENSIONFUL base (e.g. c^3, r_s = …/c^2).
        const isLiteralExp =
          !!expNode &&
          expNode.kind === 'symbol' &&
          Number.isFinite(Number(expNode.name));
        if (isLiteralExp) {
          return power(baseDim, Number((expNode as { name: string }).name));
        }

        // Non-literal (input-dependent) exponent. SOUND only when the base is
        // DIMENSIONLESS: dimensionless^(dimensionless) = dimensionless, so the
        // result dimension is statically inferable without the exponent's
        // value. (v0.13 — symbolic exponents; e.g. Hertz-Millis (T/T₀)^(−1/z).)
        if (equals(baseDim, DIMENSIONLESS)) {
          if (!expNode) return null; // arity already guarded; defensive
          const expProbe = inferArgLocal(expNode, ctx, 'args[1]');
          if (expProbe.dim === null) return null; // exponent failed — short-circuit
          if (expProbe.freeIndices.size > 0) {
            throw new TensorInScalarOpError('^'); // tensor exponent
          }
          if (!equals(expProbe.dim, DIMENSIONLESS)) {
            ctx.violations.push({
              location: joinPath(ctx.path, 'args[1]'),
              expected: DIMENSIONLESS,
              actual: expProbe.dim,
              note: '^ exponent must be dimensionless',
            });
            return null;
          }
          return DIMENSIONLESS;
        }

        // Dimensionful base + non-literal exponent: not statically inferable —
        // a numeric literal is required. Throwaway-probe the exponent so the
        // violation's `actual` carries its inferred dim (informative; a
        // downstream consumer keying on `equals(expected,actual)` sees the
        // mismatch). Preserves the pinned violation shape.
        let actualDim: Dimension = DIMENSIONLESS;
        if (expNode) {
          const probeCtx: InferContext = { path: joinPath(ctx.path, 'args[1]'), violations: [], freeIndices: new Map() };
          const probed = infer(expNode, probeCtx);
          if (probed !== null && probed !== undefined && okFromViolations(probeCtx.violations)) {
            actualDim = probed;
          }
        }
        ctx.violations.push({
          location: joinPath(ctx.path, 'args[1]'),
          expected: DIMENSIONLESS,
          actual: actualDim,
          note: '^ exponent must be a numeric literal symbol unless the base is dimensionless',
        });
        return null;
      }

      if (node.op === '*' || node.op === '/') {
        if (node.args.length === 0) return DIMENSIONLESS;
        // Per Part-VII §VII.5: '*' / '/' are scalar-only operators. Any
        // arg with non-empty freeIndices is rejected with
        // TensorInScalarOpError; users must use 'tensor-product' for
        // tensor multiplication. Scalar-only operand lists retain the
        // existing dim-accumulation behavior.
        let acc: Dimension | null = null;
        for (let i = 0; i < node.args.length; i++) {
          const probe = inferArgLocal(node.args[i], ctx, `args[${i}]`);
          const childDim = probe.dim;
          if (childDim === null) return null;
          if (probe.freeIndices.size > 0) {
            throw new TensorInScalarOpError(node.op);
          }
          if (i === 0) acc = childDim;
          else if (node.op === '*') acc = multiply(acc!, childDim);
          else acc = divide(acc!, childDim);
        }
        return acc;
      }

      // '+' or '-' — all operands must share a common dimension AND
      // (per Part-VII §VII.5) the same freeIndices signature. Mismatched
      // free-index maps raise FreeIndexMismatchError; this catches both
      // tensor + scalar (one map non-empty, one empty) and tensor + tensor
      // with differing variance / labels / counts.
      if (node.args.length === 0) return DIMENSIONLESS;
      let acc: Dimension | null = null;
      let firstFI: Map<string, { upper: number; lower: number }> | null = null;
      for (let i = 0; i < node.args.length; i++) {
        const probe = inferArgLocal(node.args[i], ctx, `args[${i}]`);
        const childDim = probe.dim;
        if (childDim === null) return null;
        if (i === 0) {
          acc = childDim;
          firstFI = probe.freeIndices;
        } else {
          if (!freeIndicesEqual(firstFI!, probe.freeIndices)) {
            throw new FreeIndexMismatchError(
              `op '${node.op}' args have mismatched freeIndices: ` +
                `args[0] has ${formatFreeIndices(firstFI!)} but ` +
                `args[${i}] has ${formatFreeIndices(probe.freeIndices)}. ` +
                `All operands of a tensor sum must share the same free-index signature.`,
            );
          }
          try {
            acc = node.op === '+' ? add(acc!, childDim) : subtract(acc!, childDim);
          } catch (err) {
            if (err instanceof DimensionMismatchError) {
              ctx.violations.push({
                location: joinPath(ctx.path, `args[${i}]`),
                expected: acc!,
                actual: childDim,
                note: `Cannot ${node.op === '+' ? 'add' : 'subtract'} ${format(childDim)} with running ${format(acc!)} (dimension mismatch).`,
              });
              return null;
            }
            throw err;
          }
        }
      }
      // Propagate the (shared) freeIndices signature to the parent ctx so
      // a tensor-sum can flow into another tensor-aware operator above.
      if (firstFI !== null) {
        mergeFreeIndices(ctx.freeIndices, firstFI);
      }
      return acc;
    }

    case 'integral': {
      // ∫ f dx — result has dim(f) * dim(x).
      // Guard against malformed nodes loaded from JSON / hand-built test
      // fixtures that omit `integrand` or `over` (TypeScript requires them
      // but `as unknown as ExprNode` casts can bypass the check).
      if (!node.integrand || !node.over) {
        ctx.violations.push({
          location: ctx.path,
          expected: DIMENSIONLESS,
          actual: DIMENSIONLESS,
          note: `integral requires both 'integrand' and 'over' fields`,
        });
        return null;
      }
      // v0.3.1 audit fix: shallow `{ ...ctx, path }` shared ctx.freeIndices
      // (a Map, copied by reference), so a tensor-valued integrand silently
      // leaked its free indices into the parent accumulator. Use
      // inferArgLocal() to give each child a fresh local freeIndices Map.
      // v0.3.0 has no tensor-integral semantics; the operator is dimensional
      // scalar and child free-indices stay local.
      const fProbe = inferArgLocal(node.integrand, ctx, 'integrand');
      const xProbe = inferArgLocal(node.over, ctx, 'over');
      if (fProbe.dim === null || xProbe.dim === null) return null;
      return multiply(fProbe.dim, xProbe.dim);
    }

    case 'derivative': {
      // d f / d x — result has dim(f) / dim(x).
      // Same shape guard as `integral` above.
      if (!node.of || !node.wrt) {
        ctx.violations.push({
          location: ctx.path,
          expected: DIMENSIONLESS,
          actual: DIMENSIONLESS,
          note: `derivative requires both 'of' and 'wrt' fields`,
        });
        return null;
      }
      // v0.3.1 audit fix: same shallow-spread ctx.freeIndices leak as the
      // integral case above. Use inferArgLocal() so a tensor-valued `of`
      // doesn't bleed its free indices into the parent. v0.3.0 has no
      // tensor-derivative semantics (tensor-partial-derivative is the
      // dedicated node for that); this `derivative` node stays dimensional
      // scalar.
      const fProbe = inferArgLocal(node.of, ctx, 'of');
      const xProbe = inferArgLocal(node.wrt, ctx, 'wrt');
      if (fProbe.dim === null || xProbe.dim === null) return null;
      return divide(fProbe.dim, xProbe.dim);
    }

    case 'dirac-delta': {
      // δ(x) — Dirac-delta correlator primitive (v0.14). Since ∫δ(x)dx=1 is
      // dimensionless, [δ(x)] = [x]⁻¹ = power(dim(arg), -1). A dimensionless
      // arg gives a dimensionless δ (power of DIMENSIONLESS is DIMENSIONLESS).
      // Scalar operator: a tensor-valued arg is rejected by inferArgLocal via
      // TensorInScalarOpError; free indices stay local (not merged to parent).
      if (!node.arg) {
        ctx.violations.push({
          location: ctx.path,
          expected: DIMENSIONLESS,
          actual: DIMENSIONLESS,
          note: `dirac-delta requires an 'arg' field`,
        });
        return null;
      }
      const argProbe = inferArgLocal(node.arg, ctx, 'arg');
      if (argProbe.dim === null) return null;
      if (argProbe.freeIndices.size > 0) {
        throw new TensorInScalarOpError('dirac-delta');
      }
      return power(argProbe.dim, -1);
    }

    case 'variational-derivative': {
      // δF/δφ — functional derivative primitive (v0.14). From the defining
      // relation δF = ∫ (δF/δφ) δφ dμ we get [F] = [δF/δφ]·[φ]·[μ], so
      // [δF/δφ] = [F]/([φ]·[μ]) = divide(divide([F],[φ]),[μ]). `over` carries
      // the integration-measure dimension [dμ] whose one integration the
      // variational derivative undoes (the dual of `integral`, which MULTIPLIES
      // by [over]). Scalar operator: tensor children rejected by inferArgLocal.
      if (!node.functional || !node.field || !node.over) {
        ctx.violations.push({
          location: ctx.path,
          expected: DIMENSIONLESS,
          actual: DIMENSIONLESS,
          note: `variational-derivative requires 'functional', 'field', and 'over' fields`,
        });
        return null;
      }
      const fnProbe = inferArgLocal(node.functional, ctx, 'functional');
      const phiProbe = inferArgLocal(node.field, ctx, 'field');
      const muProbe = inferArgLocal(node.over, ctx, 'over');
      if (fnProbe.dim === null || phiProbe.dim === null || muProbe.dim === null) {
        return null;
      }
      if (
        fnProbe.freeIndices.size > 0 ||
        phiProbe.freeIndices.size > 0 ||
        muProbe.freeIndices.size > 0
      ) {
        throw new TensorInScalarOpError('variational-derivative');
      }
      return divide(divide(fnProbe.dim, phiProbe.dim), muProbe.dim);
    }

    case 'transcendental': {
      // exp/ln/logₙ/sin/cos/tan/sinh/cosh/tanh of a DIMENSIONLESS argument is
      // DIMENSIONLESS (the function's Taylor series only sums across like
      // dimensions when its argument is dimensionless). A dimensionful argument
      // is a dimension violation; a tensor-valued argument is rejected (scalar
      // operator), mirroring dirac-delta.
      if (!node.arg) {
        ctx.violations.push({
          location: ctx.path,
          expected: DIMENSIONLESS,
          actual: DIMENSIONLESS,
          note: `transcendental '${node.fn}' requires an 'arg' field`,
        });
        return null;
      }
      const argProbe = inferArgLocal(node.arg, ctx, 'arg');
      if (argProbe.dim === null) return null;
      if (argProbe.freeIndices.size > 0) {
        throw new TensorInScalarOpError('transcendental');
      }
      if (!equals(argProbe.dim, DIMENSIONLESS)) {
        ctx.violations.push({
          location: ctx.path,
          expected: DIMENSIONLESS,
          actual: argProbe.dim,
          note: `transcendental '${node.fn}' requires a dimensionless argument`,
        });
        return null;
      }
      return DIMENSIONLESS;
    }

    case 'tensor-symbol': {
      // Real validation per Part-VII §VII.4. Builds the free-indices map
      // from declared indices and merges into the context accumulator so
      // the root validate() call sees them in its ValidationResult.
      const { dim, freeIndices } = validateTensorSymbol(node);
      mergeFreeIndices(ctx.freeIndices, freeIndices);
      return dim;
    }

    case 'tensor-product': {
      // Task 6 — Einstein contraction. We delegate the algebra to the
      // pure `computeContraction(args, validateChild)` helper in tensor.ts
      // and inject `validateChild` to break the module cycle that would
      // otherwise arise from tensor.ts importing the validator.
      //
      // CRITICAL: every nested call uses *local* freeIndices maps; we never
      // mutate ctx.freeIndices from inside the recursion. Only the outer-
      // most tensor-product case merges its final residual map into the
      // shared ctx.freeIndices accumulator. This is what makes
      // (A·B)·C-style nested products correct: the inner product's dummy
      // indices stay scoped to the inner call.
      try {
        const result = computeContraction(node.args, (child) =>
          resolveChildForContraction(child, ctx),
        );
        mergeFreeIndices(ctx.freeIndices, result.freeIndices);
        return result.dim;
      } catch (err) {
        // Errors from the contraction (IndexLabelCollisionError,
        // VarianceMismatchError) are part of the public surface — propagate
        // them so callers / tests can catch by type.
        throw err;
      }
    }

    case 'metric-tensor': {
      const { dim, freeIndices } = validateMetricTensor(node);
      mergeFreeIndices(ctx.freeIndices, freeIndices);
      return dim;
    }

    case 'kronecker-delta': {
      const { dim, freeIndices } = validateKroneckerDelta(node);
      mergeFreeIndices(ctx.freeIndices, freeIndices);
      return dim;
    }

    case 'tensor-partial-derivative': {
      const result = validatePartialDerivative(node, (child) =>
        resolveChildForPartialDerivative(child, ctx),
      );
      mergeFreeIndices(ctx.freeIndices, result.freeIndices);
      return result.dim;
    }

    case 'covariant-derivative': {
      const result = validateCovariantDerivative(node, (child) =>
        resolveChildForCovariantDerivative(child, ctx),
      );
      mergeFreeIndices(ctx.freeIndices, result.freeIndices);
      return result.dim;
    }

    // v0.6.1 Phase 2 Proposal 1 — the 11 curvature/GR-object arms
    // (riemann-tensor, ricci-tensor, einstein-tensor, bianchi-residual,
    // killing-vector, conserved-charge, stress-energy, cosmological-
    // constant, einstein-equation, weyl-tensor, kretschmann-scalar)
    // dispatch through a registry. The registry's discriminated-union
    // entry encodes three patterns (A/B/C) that capture the per-arm
    // callback-shape + freeIndices-propagate asymmetry; see
    // `validator-registry.ts` for the per-kind classification.
    case 'riemann-tensor':
    case 'ricci-tensor':
    case 'einstein-tensor':
    case 'bianchi-residual':
    case 'killing-vector':
    case 'conserved-charge':
    case 'stress-energy':
    case 'cosmological-constant':
    case 'einstein-equation':
    case 'weyl-tensor':
    case 'kretschmann-scalar': {
      const entry = lookupValidatorEntry(node.kind);
      if (!entry) {
        // Defensive: should be unreachable given the `case` labels
        // above match the registry's `RegistryKind` exactly.
        throw new Error(`validator: no registry entry for ${node.kind}`);
      }
      const result = dispatchValidator(entry, node);
      if (shouldPropagateFreeIndices(entry)) {
        mergeFreeIndices(ctx.freeIndices, result.freeIndices);
      }
      return result.dim;
    }

    default: {
      // Exhaustiveness guard: if a future ExprNode arm is added but not
      // handled here, this branch records a shape violation rather than
      // silently returning `undefined` (which validate() would coerce to
      // `ok: true, inferredDimension: undefined` — see silent-failure F1).
      const _exhaustive: never = node;
      void _exhaustive;
      const kind = (node as { kind?: unknown })?.kind;
      ctx.violations.push({
        location: ctx.path,
        expected: DIMENSIONLESS,
        actual: DIMENSIONLESS,
        note: `Validator: unknown ExprNode.kind ${JSON.stringify(kind)}`,
      });
      return null;
    }
  }
}

/**
 * A violation set passes iff it contains no error-severity violation.
 * Violations with `severity` absent default to 'error' (v0.3.5 §4).
 */
function okFromViolations(violations: ReadonlyArray<Violation>): boolean {
  return !violations.some((v) => (v.severity ?? 'error') === 'error');
}

export function validate(expr: ExprNode): ValidationResult {
  const ctx: InferContext = { path: '', violations: [], freeIndices: new Map() };
  const dim = infer(expr, ctx);
  return {
    ok: okFromViolations(ctx.violations) && dim !== null && dim !== undefined,
    inferredDimension: dim ?? null,
    freeIndices: ctx.freeIndices,
    violations: ctx.violations,
  };
}

/**
 * Opt-in symbolic InverseMetricInconsistencyWarning check. Given a
 * lower/upper metric pair, returns a deduplicated (at most one) warning-
 * severity Violation set. v0.3.5 §7. (Deliberately not folded into
 * validate() — that is the hot path for the whole test suite.)
 */
export function validateInverseMetricPair(
  gLower: MetricTensorNode,
  gUpper: MetricTensorNode,
): Violation[] {
  const note = checkInverseMetricStructure(gLower, gUpper);
  if (note === null) return [];
  return [{
    location: `${gLower.name}/${gUpper.name}`,
    expected: gLower.dim,
    actual: gUpper.dim,
    note,
    severity: 'warning',
  }];
}

export function validateEquation(lhs: ExprNode, rhs: ExprNode): ValidationResult {
  const lhsCtx: InferContext = { path: 'lhs', violations: [], freeIndices: new Map() };
  const rhsCtx: InferContext = { path: 'rhs', violations: [], freeIndices: new Map() };
  const lhsDim = infer(lhs, lhsCtx);
  const rhsDim = infer(rhs, rhsCtx);
  const violations = [...lhsCtx.violations, ...rhsCtx.violations];

  if (lhsDim !== null && rhsDim !== null && !equals(lhsDim, rhsDim)) {
    violations.push({
      location: '<equation>',
      expected: lhsDim,
      actual: rhsDim,
      note: `LHS has ${format(lhsDim)} but RHS has ${format(rhsDim)} — equation is not dimensionally homogeneous.`,
    });
  }

  // Equation-level valence (free-index) homogeneity. Both sides of an
  // equation must carry the same free-index signature: a rank-2 tensor
  // cannot equal a scalar, nor A^mu equal B_mu, even when the SI dimensions
  // agree. Only checked when both sides inferred a dimension (a side that
  // already failed inference has reported its own violation). Scalar
  // equations have empty maps on both sides ⇒ no effect.
  if (
    lhsDim !== null &&
    rhsDim !== null &&
    !freeIndicesEqual(lhsCtx.freeIndices, rhsCtx.freeIndices)
  ) {
    violations.push({
      location: '<equation>',
      expected: lhsDim,
      actual: rhsDim,
      note:
        `LHS free indices ${formatFreeIndices(lhsCtx.freeIndices)} but RHS ` +
        `free indices ${formatFreeIndices(rhsCtx.freeIndices)} — equation is ` +
        `not valence-homogeneous (index/rank mismatch across '=').`,
    });
  }

  return {
    ok: okFromViolations(violations) && lhsDim !== null && rhsDim !== null,
    inferredDimension: lhsDim, // by convention, LHS dimension is the canonical answer
    // By convention LHS free-indices map is the canonical answer (mirrors
    // inferredDimension's LHS bias).
    freeIndices: lhsCtx.freeIndices,
    violations,
  };
}
