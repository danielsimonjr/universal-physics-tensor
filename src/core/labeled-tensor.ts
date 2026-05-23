/**
 * `LabeledTensor` — engine-level tensor wrapped with
 * `UniversalIndex`-tagged metadata. The catalog-facing surface
 * for physics-axis-aware contractions.
 *
 * Phase 2 + Phase 3 of v0.7 Proposal 1 (Intelligent Index Layer).
 *
 * Composition (Decision #5): `LabeledTensor` owns an `EngineTensor`,
 * a `TensorEngine`, and a labels record. The engine handle is the
 * boundary — `LabeledTensor` doesn't reach into the underlying
 * Float64Array / MathTS handle. Contract matching is strictly
 * `UniversalIndexId` equality (Decision #3) — two indices with the
 * same `axis` and `name` but distinct `id`s do NOT contract.
 *
 * Design: `docs/planning/v0.7-Proposal-1-Design.md` Decisions
 * #1, #3, #5, #6, #7, #9.
 *
 * Cross-Phase Invariants preserved:
 *   - #1 adapter-on-top: this module does NOT import
 *     `src/dimensional/tensor.ts` or `src/numerical/lowering.ts`.
 *   - #4 `TensorSymbolNode` + `computeContraction` UNCHANGED.
 *   - #5 `TensorEngine` interface UNCHANGED (consumes, doesn't
 *     extend).
 *
 * @module core/labeled-tensor
 */

import type { EngineTensor, TensorEngine, EinsumSpec } from '../numerical/tensor-engine.js';
import { UPTError } from '../dimensional/errors.js';
import type { AxisName, UniversalIndex, UniversalIndexId } from './universal-index.js';

// ---------------------------------------------------------------------------
// Error classes (Phase 3 surface, declared here for co-location with
// the guards that throw them)
// ---------------------------------------------------------------------------

/**
 * Thrown by the `LabeledTensor` constructor when the labels record
 * doesn't agree with the underlying tensor's rank
 * (`Object.keys(labels).length !== tensor.shape.length`).
 *
 * @public
 */
export class LabeledTensorConstructionError extends UPTError {
  public readonly labelCount: number;
  public readonly tensorRank: number;
  constructor(labelCount: number, tensorRank: number) {
    super(
      `LabeledTensor: labels record has ${labelCount} entries but ` +
      `tensor rank is ${tensorRank}. Every tensor axis must carry exactly ` +
      `one UniversalIndex label.`,
    );
    this.name = 'LabeledTensorConstructionError';
    this.labelCount = labelCount;
    this.tensorRank = tensorRank;
    Object.setPrototypeOf(this, LabeledTensorConstructionError.prototype);
  }
}

/**
 * Thrown by `contract` when two `UniversalIndex` values share an
 * `id` but disagree on `axis`. Per Decision #7, this is a physics
 * error caught at the wrapper level. Impossible if both operands
 * use the `Axes` registry; defensive against off-registry
 * `makeIndex` consumers.
 *
 * @public
 */
export class AxisMismatchError extends UPTError {
  public readonly indexId: UniversalIndexId;
  public readonly leftAxis: AxisName;
  public readonly rightAxis: AxisName;
  constructor(
    indexId: UniversalIndexId,
    leftAxis: AxisName,
    rightAxis: AxisName,
  ) {
    super(
      `LabeledTensor.contract: indices with the same id '${indexId}' ` +
      `disagree on axis ('${leftAxis}' vs '${rightAxis}'). Cross-axis ` +
      `contraction is a physics error.`,
    );
    this.name = 'AxisMismatchError';
    this.indexId = indexId;
    this.leftAxis = leftAxis;
    this.rightAxis = rightAxis;
    Object.setPrototypeOf(this, AxisMismatchError.prototype);
  }
}

/**
 * Thrown by `contract` when the same `UniversalIndexId` appears in
 * more than one non-contracted (free) position across the two
 * operands. Same physical axis showing up free on both sides is
 * physically meaningful (joint distribution) but the einsum
 * machinery has no canonical way to disambiguate.
 *
 * @public
 */
export class IdentityConflictError extends UPTError {
  public readonly indexId: UniversalIndexId;
  constructor(indexId: UniversalIndexId) {
    super(
      `LabeledTensor.contract: UniversalIndexId '${indexId}' appears as a ` +
      `free axis on both operands. Same physical axis on both sides is ` +
      `ambiguous — rename or contract one side first.`,
    );
    this.name = 'IdentityConflictError';
    this.indexId = indexId;
    Object.setPrototypeOf(this, IdentityConflictError.prototype);
  }
}

/**
 * Thrown by `reshape` when the requested shape would change the
 * tensor rank. v0.7.0 allows only axis-by-axis size change;
 * rank-changing reshape is deferred to v0.8.0+ (`mergeAxes` /
 * `splitAxis` helpers).
 *
 * @public
 */
export class RankPreservationError extends UPTError {
  public readonly fromRank: number;
  public readonly toRank: number;
  constructor(fromRank: number, toRank: number) {
    super(
      `LabeledTensor.reshape: cannot change rank from ${fromRank} to ` +
      `${toRank}. v0.7.0 supports only same-rank reshape; use a future ` +
      `mergeAxes / splitAxis helper for rank changes.`,
    );
    this.name = 'RankPreservationError';
    this.fromRank = fromRank;
    this.toRank = toRank;
    Object.setPrototypeOf(this, RankPreservationError.prototype);
  }
}

// ---------------------------------------------------------------------------
// canonicalLabelOrder — Risk 2 mitigation
// ---------------------------------------------------------------------------

/**
 * Stable lexicographic ordering of label keys. JavaScript's
 * `Object.entries` preserves string-key insertion order, but we
 * route all label-key→axis-position mapping through this helper
 * so the contract algorithm doesn't accidentally depend on
 * constructor-call ordering.
 *
 * @internal
 */
export function canonicalLabelOrder<L extends Record<string, UniversalIndex<AxisName>>>(
  labels: L,
): string[] {
  return Object.keys(labels).sort();
}

// ---------------------------------------------------------------------------
// LabeledTensor (wrapper class)
// ---------------------------------------------------------------------------

/**
 * Engine-agnostic wrapper carrying physics-axis-tagged metadata over
 * an opaque `EngineTensor`. Two `LabeledTensor`s contract over
 * shared `UniversalIndexId` values; non-shared ids become the
 * result's free axes.
 *
 * Construction enforces `Object.keys(labels).length === tensor.shape.length`.
 *
 * @public
 */
export class LabeledTensor<
  L extends Record<string, UniversalIndex<AxisName>> = Record<string, UniversalIndex<AxisName>>,
> {
  public readonly tensor: EngineTensor;
  public readonly engine: TensorEngine;
  public readonly labels: L;

  constructor(tensor: EngineTensor, engine: TensorEngine, labels: L) {
    const labelCount = Object.keys(labels).length;
    if (labelCount !== tensor.shape.length) {
      throw new LabeledTensorConstructionError(labelCount, tensor.shape.length);
    }
    this.tensor = tensor;
    this.engine = engine;
    this.labels = labels;
  }

  /**
   * Identity-aware contraction (Decision #3): match labels by
   * `UniversalIndexId` equality only. Returns a new `LabeledTensor`
   * whose free labels are the union of both operands' free labels
   * minus the contracted ids, evaluated in `this`-first,
   * `other`-second canonical order.
   *
   * Throws:
   *   - `AxisMismatchError` if a shared id disagrees on axis.
   *   - `IdentityConflictError` if a non-shared id appears free on
   *     both operands.
   *
   * @public
   */
  public contract<R extends Record<string, UniversalIndex<AxisName>>>(
    other: LabeledTensor<R>,
  ): LabeledTensor {
    if (this.engine !== other.engine) {
      throw new UPTError(
        `LabeledTensor.contract: engine mismatch (${this.engine.name} vs ` +
        `${other.engine.name}). Both operands must share an engine.`,
      );
    }

    const leftOrder = canonicalLabelOrder(this.labels);
    const rightOrder = canonicalLabelOrder(other.labels);

    // Build id → (operand, axis-position) sites.
    const sites = new Map<UniversalIndexId, Array<{ operand: 0 | 1; axis: number; key: string; axisName: AxisName }>>();
    leftOrder.forEach((key, axis) => {
      const idx = this.labels[key];
      const list = sites.get(idx.id) ?? [];
      list.push({ operand: 0, axis, key, axisName: idx.axis });
      sites.set(idx.id, list);
    });
    rightOrder.forEach((key, axis) => {
      const idx = other.labels[key];
      const list = sites.get(idx.id) ?? [];
      list.push({ operand: 1, axis, key, axisName: idx.axis });
      sites.set(idx.id, list);
    });

    // Classify each id: contracted (in both operands) vs free (in one).
    const contractions: EinsumSpec['contractions'][number][] = [];
    const free: EinsumSpec['free'][number][] = [];
    const resultLabels: Record<string, UniversalIndex<AxisName>> = {};

    for (const [id, occurrences] of sites) {
      if (occurrences.length === 1) {
        // Free axis on exactly one operand. Carry through.
        const o = occurrences[0];
        free.push({ operand: o.operand, axis: o.axis });
        // Preserve the original label key if no collision; otherwise
        // suffix with operand index (rare — only when both operands
        // use the same string key for *different* ids).
        const key = resultLabels[o.key] ? `${o.key}_${o.operand}` : o.key;
        resultLabels[key] = o.operand === 0
          ? this.labels[o.key]
          : other.labels[o.key];
      } else if (occurrences.length === 2) {
        const [a, b] = occurrences;
        if (a.operand === b.operand) {
          // Same id appears twice in one operand: that's a tensor-self-
          // contraction situation; flag as free conflict.
          throw new IdentityConflictError(id);
        }
        if (a.axisName !== b.axisName) {
          throw new AxisMismatchError(id, a.axisName, b.axisName);
        }
        contractions.push({ pair: [[a.operand, a.axis], [b.operand, b.axis]] });
      } else {
        // 3+ occurrences across the two operands: triple+ contraction,
        // not supported by the binary einsum primitive. Reject.
        throw new IdentityConflictError(id);
      }
    }

    const spec: EinsumSpec = { contractions, free };
    const resultTensor = this.engine.einsum(spec, this.tensor, other.tensor);
    return new LabeledTensor(resultTensor, this.engine, resultLabels);
  }

  /**
   * Reorder axes per the given permutation of label keys. The new
   * label record reflects the new axis order; the engine handles
   * the storage-level permutation via `engine.transpose`.
   *
   * @public
   */
  public transpose(newKeyOrder: ReadonlyArray<keyof L & string>): LabeledTensor<L> {
    const currentOrder = canonicalLabelOrder(this.labels);
    if (newKeyOrder.length !== currentOrder.length) {
      throw new UPTError(
        `LabeledTensor.transpose: new key order has ${newKeyOrder.length} ` +
        `entries but tensor has ${currentOrder.length} axes.`,
      );
    }
    const currentIndex = new Map(currentOrder.map((k, i) => [k, i]));
    const perm: number[] = [];
    for (const key of newKeyOrder) {
      const pos = currentIndex.get(key);
      if (pos === undefined) {
        throw new UPTError(
          `LabeledTensor.transpose: key '${String(key)}' not found in labels.`,
        );
      }
      perm.push(pos);
    }
    const transposedTensor = this.engine.transpose(this.tensor, perm);
    return new LabeledTensor(transposedTensor, this.engine, this.labels);
  }

  /**
   * Per-axis size change. Rank must be preserved (Decision #5);
   * rank-changing reshape throws `RankPreservationError`. v0.8.0+
   * may add `mergeAxes` / `splitAxis` for rank-changing operations.
   *
   * Labels survive unchanged (axis identity is preserved across a
   * size-only reshape).
   *
   * @public
   */
  public reshape(shape: ReadonlyArray<number>): LabeledTensor<L> {
    if (shape.length !== this.tensor.shape.length) {
      throw new RankPreservationError(this.tensor.shape.length, shape.length);
    }
    const reshapedTensor = this.engine.reshape(this.tensor, shape);
    return new LabeledTensor(reshapedTensor, this.engine, this.labels);
  }
}
