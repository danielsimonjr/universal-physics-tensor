/**
 * Optional scientific-relation metadata overlay.
 *
 * Lives here (not in `src/canonical/`) so probe can import canonical without
 * a cycle. This is **not** a registry: missing keys mean "no overlay", never
 * a fabricated evidence claim.
 *
 * @internal
 */

import type { ScientificRelationRecord, ScientificRelationRef } from './types.js';

const overlay = new Map<string, ScientificRelationRecord>();

function keyOf(ref: ScientificRelationRef): string {
  return `${ref.kind}:${ref.id}`;
}

/** Store overlay metadata for a relation pointer. @internal */
export function setRelationMetadata(record: ScientificRelationRecord): void {
  overlay.set(keyOf(record.ref), record);
}

/** Look up overlay metadata. @internal */
export function getRelationMetadata(
  ref: ScientificRelationRef,
): ScientificRelationRecord | undefined {
  return overlay.get(keyOf(ref));
}

/** List overlay records (sorted by kind:id). @internal */
export function listRelationMetadata(): readonly ScientificRelationRecord[] {
  return [...overlay.values()].sort((a, b) => keyOf(a.ref).localeCompare(keyOf(b.ref)));
}

/** Test helper: drop every overlay record. @internal */
export function clearRelationMetadata(): void {
  overlay.clear();
}
