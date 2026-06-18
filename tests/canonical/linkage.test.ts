/**
 * Bridge↔canonical linkage (B-T2) — recovery/containment classification with
 * the F4 circularity guard. The crisp case: Landauer's canonical form vs bridge
 * 16 (Landauer's principle) is a `restates-canonical` (declared restatement,
 * NOT a discovery); vs bridge 29 (Jarzynski) it is a genuine `recovers`
 * (undeclared structural correspondence — both are energy = k_B·T·dimensionless).
 *
 * @module tests/canonical/linkage
 */
import { describe, it, expect } from 'vitest';
import {
  classifyLinkage,
  scanLinkages,
} from '../../src/canonical/linkage.js';
import { canonicalById } from '../../src/canonical/registry.js';

describe('bridge↔canonical linkage', () => {
  it('Landauer ↔ bridge 16 is restates-canonical (F4), with exact recovery', () => {
    const r = classifyLinkage('CE-landauer', 16);
    expect(r.classification).toBe('restates-canonical');
    expect(r.structuralMatch).toBe(true);
    expect(r.dimMatch).toBe(true);
    expect(r.recovery?.tested).toBe(true);
    expect(r.recovery?.maxRelErr).toBeLessThan(1e-9);
  });

  it('Landauer ↔ bridge 29 (Jarzynski) is a genuine recovers, not a restatement', () => {
    const r = classifyLinkage('CE-landauer', 29);
    expect(r.classification).toBe('recovers');
    expect(r.structuralMatch).toBe(true);
    // recovers, NOT restates — the canonical does not name bridge 29.
    expect(canonicalById('CE-landauer')?.restatesBridge).not.toBe('29');
    expect(r.recovery?.maxRelErr).toBeLessThan(1e-9);
  });

  it('a different-dimension bridge is unrelated', () => {
    // bridge 42 is Hawking TEMPERATURE; Landauer is ENERGY.
    expect(classifyLinkage('CE-landauer', 42).classification).toBe('unrelated');
  });

  it('scan: every restates-canonical has a real restatesBridge (F4 invariant)', () => {
    const restates = scanLinkages().filter(
      (r) => r.classification === 'restates-canonical',
    );
    expect(restates.length).toBeGreaterThanOrEqual(1);
    for (const r of restates) {
      expect(canonicalById(r.canonicalId)?.restatesBridge).toBe(
        String(r.bridgeId),
      );
    }
  });

  it('scan surfaces the Landauer↔16 restatement and ≥1 dimensional-only pair', () => {
    const all = scanLinkages();
    expect(
      all.some(
        (r) =>
          r.canonicalId === 'CE-landauer' &&
          r.bridgeId === 16 &&
          r.classification === 'restates-canonical',
      ),
    ).toBe(true);
    expect(all.some((r) => r.classification === 'dimensional-only')).toBe(true);
  });
});
