/**
 * Catalog invariant: every entry whose `dimensional_signature` is non-null
 * must EITHER have a registered AST module (covered by the round-trip
 * test in `dimensional-signature-catalog.test.ts`) OR appear in the
 * `ORPHAN_DIMENSIONAL_SIGNATURES` allowlist below — and orphans must
 * actually have NO AST module.
 *
 * Why this exists (Wave G TA-F1, confidence 95): the round-trip catalog
 * test only iterates entries that *have* an AST module, so a typo or
 * accidental revert of an orphan signature string (BE-18, BE-29, BE-48
 * today) was silently uncovered. The `be-{18,29,48}-fix.test.ts` files
 * pin formula_latex / status but never read `dimensional_signature`.
 *
 * The test enforces the invariant in BOTH directions:
 *   1. Every id in the orphan allowlist has `dimensional_signature !== null`
 *      AND no AST module exists in `ENCODED_RHS_IDS`. ("Orphans really are
 *      orphans.")
 *   2. Every entry NOT in the allowlist that has `dimensional_signature !== null`
 *      MUST have an AST module. ("New encodings can't bypass round-trip
 *      coverage by accident.")
 *
 * As Tier-5 lands AST modules for BE-18 / BE-29 / BE-48, remove them
 * from `ORPHAN_DIMENSIONAL_SIGNATURES` and add them to `ENCODED_RHS_IDS`.
 *
 * Source: test-analyzer F1.
 *
 * @module tests/bridges/orphan-dimensional-signature
 */
import { describe, it, expect } from 'vitest';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';

/**
 * Bridge ids that pin a `dimensional_signature` string but do NOT yet
 * have an AST module under `src/bridges/equations/`. Each pin guards
 * against typo / revert until the encoding lands.
 *
 * Update protocol when a new encoding lands:
 *   1. Remove the id from this set.
 *   2. Add `import { <BE_N>_RHS } from '...'` plus the `{ id, rhs }` row
 *      to `ENCODED_RHS` in `dimensional-signature-catalog.test.ts`.
 *   3. Add the row to `ENCODED_RHS_IDS` below.
 *   4. Add the per-bridge expected dim to `EXPECTED_DIMENSION_BY_BRIDGE`
 *      in `src/dimensional/bridge-check.ts`.
 */
const ORPHAN_DIMENSIONAL_SIGNATURES: ReadonlySet<number> = new Set([18, 29, 48]);

/**
 * Bridge ids whose AST RHS is already registered in
 * `tests/bridges/dimensional-signature-catalog.test.ts` (via `ENCODED_RHS`).
 * Kept in sync manually; the disjoint-union guard below catches drift.
 */
const ENCODED_RHS_IDS: ReadonlySet<number> = new Set([11, 12, 14, 19, 22, 23, 24, 25, 26, 31, 33, 34, 38, 40, 41, 43, 45, 47, 49]);

describe('Bridge index: orphan dimensional_signature invariants', () => {
  describe('Direction 1 — every orphan really is an orphan', () => {
    for (const id of ORPHAN_DIMENSIONAL_SIGNATURES) {
      it(`BE-${id}: has non-null dimensional_signature and no AST module`, () => {
        const entry = BRIDGE_EQUATIONS.find((e) => e.id === id);
        expect(entry, `BE-${id} must exist in BRIDGE_EQUATIONS`).toBeDefined();
        expect(
          entry!.dimensional_signature,
          `BE-${id}: orphan must keep its pinned dimensional_signature`,
        ).not.toBeNull();
        expect(
          ENCODED_RHS_IDS.has(id),
          `BE-${id}: orphan must NOT also be registered as encoded — ` +
            `if a new AST module landed, remove from ORPHAN_DIMENSIONAL_SIGNATURES.`,
        ).toBe(false);
      });
    }

    it('BE-18 dimensional_signature pinned to [L^8 M^4 T^-8] (no AST yet)', () => {
      const e = BRIDGE_EQUATIONS.find((x) => x.id === 18);
      expect(e!.dimensional_signature).toBe('[L^8 M^4 T^-8]');
    });

    it('BE-29 dimensional_signature pinned to [energy] (no AST yet)', () => {
      const e = BRIDGE_EQUATIONS.find((x) => x.id === 29);
      expect(e!.dimensional_signature).toBe('[energy]');
    });

    it('BE-48 dimensional_signature pinned to [frequency] (no AST yet)', () => {
      const e = BRIDGE_EQUATIONS.find((x) => x.id === 48);
      expect(e!.dimensional_signature).toBe('[frequency]');
    });
  });

  describe('Direction 2 — every signature is in exactly one of (encoded, orphan)', () => {
    it('disjoint union covers every entry with non-null dimensional_signature', () => {
      // Build the universe: ids whose entry has dimensional_signature !== null.
      const populatedIds = BRIDGE_EQUATIONS
        .filter((e) => e.dimensional_signature !== null)
        .map((e) => e.id);

      const uncovered: number[] = [];
      const doubleCovered: number[] = [];
      for (const id of populatedIds) {
        const inEncoded = ENCODED_RHS_IDS.has(id);
        const inOrphan = ORPHAN_DIMENSIONAL_SIGNATURES.has(id);
        if (!inEncoded && !inOrphan) uncovered.push(id);
        if (inEncoded && inOrphan) doubleCovered.push(id);
      }
      expect(
        uncovered,
        `BE-${uncovered.join(',')}: dimensional_signature is set but the id ` +
          `is in neither ENCODED_RHS_IDS nor ORPHAN_DIMENSIONAL_SIGNATURES. ` +
          `Either add the AST encoding to dimensional-signature-catalog.test.ts ` +
          `(and ENCODED_RHS_IDS here), or pin it as an orphan.`,
      ).toEqual([]);
      expect(
        doubleCovered,
        `BE-${doubleCovered.join(',')}: id is BOTH encoded and orphan-listed. ` +
          `Remove from ORPHAN_DIMENSIONAL_SIGNATURES once the encoding lands.`,
      ).toEqual([]);
    });

    it('orphan allowlist contains exactly {18, 29, 48}', () => {
      // Sanity floor: if a future repair removes BE-18 from the allowlist
      // because an AST encoding lands, this test must be updated
      // deliberately — the act of editing it documents the intent.
      expect([...ORPHAN_DIMENSIONAL_SIGNATURES].sort((a, b) => a - b)).toEqual([18, 29, 48]);
    });
  });
});
