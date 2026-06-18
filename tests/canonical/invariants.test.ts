/**
 * Registry-wide invariants + OPEN-bridge coverage (Task 7, review findings
 * F1/F2/F4). These guard the whole `CANONICAL_EQUATIONS` set, not one entry.
 *
 * @module tests/canonical/invariants
 */
import { describe, it, expect } from 'vitest';
import {
  CANONICAL_EQUATIONS,
  partneredBridgeIds,
  bridgesWithoutCanonicalPartner,
} from '../../src/canonical/registry.js';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';

const CATALOG_IDS = new Set(BRIDGE_EQUATIONS.map((b) => String(b.id)));

describe('canonical registry invariants', () => {
  it('ids are unique', () => {
    const ids = CANONICAL_EQUATIONS.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every entry cites at least one reference', () => {
    for (const e of CANONICAL_EQUATIONS) {
      expect(e.references.length, e.id).toBeGreaterThanOrEqual(1);
    }
  });

  it('partnerBridges / restatesBridge reference real catalog bridges (F4)', () => {
    for (const e of CANONICAL_EQUATIONS) {
      for (const b of e.partnerBridges) {
        expect(CATALOG_IDS.has(b), `${e.id} → partner ${b}`).toBe(true);
      }
      if (e.restatesBridge) {
        expect(
          CATALOG_IDS.has(e.restatesBridge),
          `${e.id} → restates ${e.restatesBridge}`,
        ).toBe(true);
      }
    }
  });

  it('partner/restates ids are bare numeric strings (F4 authoring guard)', () => {
    // A non-numeric form like "BE-21" would silently demote restates-canonical
    // to recovers in the linkage F4 guard (String(bridgeId) is "21").
    for (const e of CANONICAL_EQUATIONS) {
      if (e.restatesBridge) {
        expect(/^\d+$/.test(e.restatesBridge), `${e.id} restates`).toBe(true);
      }
      for (const b of e.partnerBridges) {
        expect(/^\d+$/.test(b), `${e.id} partner ${b}`).toBe(true);
      }
    }
  });

  it('L0 fields are self-consistent: monomial !== null ⟺ freeGroups === 0 (F1)', () => {
    for (const e of CANONICAL_EQUATIONS) {
      expect(e.dimensional.monomial !== null, e.id).toBe(
        e.freeDimensionlessGroups === 0,
      );
    }
  });

  it('a scalar-AST means the status is at least scalar-up-to-constant (F1)', () => {
    for (const e of CANONICAL_EQUATIONS) {
      if (e.scalarAst) {
        expect(e.epistemicStatus, e.id).not.toBe('dimensional');
      }
    }
  });
});

describe('OPEN-bridge coverage (F2 — gaps are logged, not silent)', () => {
  it('the partnered set is exactly the current correspondences', () => {
    expect([...partneredBridgeIds()].sort()).toEqual([
      '12',
      '13',
      '16',
      '29',
      '41',
      '42',
      '51',
      '52',
    ]);
  });

  it('un-partnered catalog bridges are enumerated and the count is pinned', () => {
    const gap = bridgesWithoutCanonicalPartner();
    // 44 catalog bridges − 8 partnered. Shrinking this is a deliberate act
    // (add a canonical partner, then update this number). Most remaining gap
    // bridges are SPECULATIVE — they correctly have no standard-physics partner.
    expect(gap.length).toBe(36);
    // every gap id is a real catalog id (and none is partnered)
    const partnered = partneredBridgeIds();
    for (const id of gap) {
      expect(CATALOG_IDS.has(id)).toBe(true);
      expect(partnered.has(id)).toBe(false);
    }
  });
});
