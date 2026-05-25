/**
 * Validator registry for curvature- and GR-object node kinds.
 *
 * Extracted from `validator.ts`'s `infer()` switch in v0.6.1 Phase 2.
 * Eleven `infer()` arms — `riemann-tensor`, `ricci-tensor`, `einstein-
 * tensor`, `bianchi-residual`, `killing-vector`, `conserved-charge`,
 * `stress-energy`, `cosmological-constant`, `einstein-equation`,
 * `weyl-tensor`, `kretschmann-scalar` — all follow the same shape
 * (call a `validateX(...)` function, then either propagate the
 * returned `freeIndices` into the parent context or skip the merge
 * for scalar kinds). Capturing that shape in a registry eliminates
 * 11×~10 LOC of boilerplate in `validator.ts` and makes the per-arm
 * pattern explicit at the registry-definition site.
 *
 * **Three patterns**, per the Adam+Eve adversarial review of the
 * v0.6.1 Design (S2): a naive `propagateFreeIndices: boolean` flag is
 * insufficient — three arms (`ricci-tensor`, `einstein-tensor`,
 * `bianchi-residual`) pass a riemann-child closure into their
 * validator, while the other eight do not. The pattern tag captures
 * this asymmetry exhaustively:
 *
 * - **Pattern A** — `validateX(node)`, propagate freeIndices.
 *   Used by: `riemann-tensor`, `killing-vector`, `stress-energy`,
 *   `einstein-equation`, `weyl-tensor`.
 *
 * - **Pattern B** — `validateX(node, riemannCallback)`, propagate
 *   freeIndices. Used by: `ricci-tensor`, `einstein-tensor`,
 *   `bianchi-residual`. The callback re-validates an embedded
 *   Riemann sub-node so its signature checks fire while only the
 *   outer (post-contraction) free indices propagate to the parent.
 *
 * - **Pattern C** — `validateX(node)`, freeIndices is empty (scalar
 *   result); skip the merge loop entirely. Used by:
 *   `conserved-charge`, `cosmological-constant`, `kretschmann-scalar`.
 *
 * The discriminated union type below makes adding a new GR-object
 * node-kind a compile-time decision: the new entry must explicitly
 * declare its pattern, or TypeScript will fail to typecheck the
 * registry. This guards against the v0.5.0 ricci-slot-bug shape
 * (silent miscompute when a new arm follows the "wrong" pattern by
 * default).
 *
 * @module dimensional/validator-registry
 */

import type { Dimension } from './types.js';
import { validateRiemannTensor } from './connection-validators.js';
import {
  validateRicciTensor,
  validateEinsteinTensor,
  validateBianchiResidual,
  type RiemannChildCallback,
} from './curvature.js';
import { validateKillingVector, validateConservedCharge } from './killing-validators.js';
import { validateStressEnergyTensor, validateCosmologicalConstant } from './stress-energy-validators.js';
import { validateEinsteinFieldEquation } from './einstein-equation.js';
import { validateWeylTensor } from './weyl-validators.js';
import { validateKretschmannScalar } from './curvature-invariants.js';

/** Shape of every `validateX` result the registry dispatches over. */
type ValidatorResult = {
  readonly dim: Dimension;
  readonly freeIndices: Map<string, { upper: number; lower: number }>;
};

/**
 * The canonical riemann-child callback used by all pattern-B
 * validators. Re-validates an embedded Riemann sub-node so its
 * structural checks fire, and forwards the result as
 * `{dim, freeIndices}` (without the result's `violations` list,
 * because pattern-B validators handle merging themselves).
 *
 * Uses the `RiemannChildCallback` type re-exported from
 * `curvature.ts` (v0.7.1 Phase 4 Task 4.2 — consolidates the
 * three identical inline callback shapes across the pattern-B
 * validators into a single named alias).
 */
const riemannChildCallback: RiemannChildCallback = (riemannChild) => {
  const rr = validateRiemannTensor(riemannChild);
  return { dim: rr.dim, freeIndices: rr.freeIndices };
};

/**
 * The set of node-kinds dispatched through this registry. Keep in
 * sync with the `case` labels in `validator.ts`'s `infer()` switch —
 * a TypeScript exhaustiveness check below enforces the contract.
 */
type RegistryKind =
  | 'riemann-tensor'
  | 'ricci-tensor'
  | 'einstein-tensor'
  | 'bianchi-residual'
  | 'killing-vector'
  | 'conserved-charge'
  | 'stress-energy'
  | 'cosmological-constant'
  | 'einstein-equation'
  | 'weyl-tensor'
  | 'kretschmann-scalar';

/** Discriminated-union entry per node-kind. */
type ValidatorEntry =
  | { pattern: 'A'; validator: (node: never) => ValidatorResult }
  | { pattern: 'B'; validator: (node: never, cb: RiemannChildCallback) => ValidatorResult }
  | { pattern: 'C'; validator: (node: never) => ValidatorResult };

/**
 * The registry. Indexed by `node.kind` for the 11 curvature/GR
 * arms; misses are handled by the caller (validator.ts's `infer()`
 * has a `default` arm for unknown kinds).
 */
const VALIDATOR_REGISTRY: { [K in RegistryKind]: ValidatorEntry } = {
  // Pattern A — single-arg validator, propagate freeIndices.
  'riemann-tensor':       { pattern: 'A', validator: validateRiemannTensor as (node: never) => ValidatorResult },
  'killing-vector':       { pattern: 'A', validator: validateKillingVector as (node: never) => ValidatorResult },
  'stress-energy':        { pattern: 'A', validator: validateStressEnergyTensor as (node: never) => ValidatorResult },
  'einstein-equation':    { pattern: 'A', validator: validateEinsteinFieldEquation as (node: never) => ValidatorResult },
  'weyl-tensor':          { pattern: 'A', validator: validateWeylTensor as (node: never) => ValidatorResult },

  // Pattern B — two-arg validator with riemann-child callback, propagate freeIndices.
  'ricci-tensor':         { pattern: 'B', validator: validateRicciTensor as (node: never, cb: RiemannChildCallback) => ValidatorResult },
  'einstein-tensor':      { pattern: 'B', validator: validateEinsteinTensor as (node: never, cb: RiemannChildCallback) => ValidatorResult },
  'bianchi-residual':     { pattern: 'B', validator: validateBianchiResidual as (node: never, cb: RiemannChildCallback) => ValidatorResult },

  // Pattern C — single-arg validator, scalar (skip freeIndices merge).
  'conserved-charge':     { pattern: 'C', validator: validateConservedCharge as (node: never) => ValidatorResult },
  'cosmological-constant': { pattern: 'C', validator: validateCosmologicalConstant as (node: never) => ValidatorResult },
  'kretschmann-scalar':   { pattern: 'C', validator: validateKretschmannScalar as (node: never) => ValidatorResult },
};

/**
 * Look up the registry entry for a node-kind, returning `undefined`
 * for kinds not covered by this registry (the caller falls through
 * to its own switch arms or the default exhaustiveness guard).
 */
export function lookupValidatorEntry(kind: string): ValidatorEntry | undefined {
  return (VALIDATOR_REGISTRY as Record<string, ValidatorEntry>)[kind];
}

/**
 * Apply the registry-dispatched validator to a node. The caller
 * (validator.ts's `infer()`) is responsible for merging the returned
 * `freeIndices` into its context.
 *
 * Returns the validator's full result so the caller can decide
 * whether to merge or skip per the pattern tag. (Pattern C's result
 * still has a `freeIndices` field — empty Map — for shape uniformity;
 * the merge loop is a no-op rather than a missing field.)
 */
export function dispatchValidator(
  entry: ValidatorEntry,
  node: unknown,
): ValidatorResult {
  switch (entry.pattern) {
    case 'A':
      return entry.validator(node as never);
    case 'B':
      return entry.validator(node as never, riemannChildCallback);
    case 'C':
      return entry.validator(node as never);
    default: {
      // Exhaustiveness guard
      const _exhaustive: never = entry;
      void _exhaustive;
      throw new Error(`validator-registry: unknown pattern in entry`);
    }
  }
}

/**
 * Returns true if the entry's pattern propagates freeIndices to the
 * parent context. Patterns A and B propagate; pattern C skips
 * (scalar result).
 */
export function shouldPropagateFreeIndices(entry: ValidatorEntry): boolean {
  return entry.pattern === 'A' || entry.pattern === 'B';
}
