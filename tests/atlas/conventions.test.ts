/**
 * Atlas Phase 1 S1.4 — `checkConventions`.
 *
 * The asymmetry under test: a DECLARED difference is a mismatch; an ABSENCE
 * never is. Most of these cases exist to prove the second half, because that
 * is the one a naive implementation gets wrong at scale.
 */
import { describe, it, expect } from 'vitest';
import { checkConventions } from '../../src/atlas/conventions.js';
import type { Conventions } from '../../src/atlas/types.js';

describe('checkConventions — declared differences', () => {
  it("'Q-W' vs 'Q+W' mismatches on heatWorkSign", () => {
    expect(checkConventions({ heatWorkSign: 'Q-W' }, { heatWorkSign: 'Q+W' })).toEqual([
      'heatWorkSign',
    ]);
  });

  it('agreeing declarations do not mismatch', () => {
    expect(checkConventions({ heatWorkSign: 'Q-W' }, { heatWorkSign: 'Q-W' })).toEqual([]);
  });

  it('reports every mismatched key, in Conventions declaration order', () => {
    const a: Conventions = {
      heatWorkSign: 'Q-W',
      metricSignature: '-+++',
      unitSystem: 'SI',
    };
    const b: Conventions = {
      unitSystem: 'gaussian',
      heatWorkSign: 'Q+W',
      metricSignature: '-+++',
    };
    expect(checkConventions(a, b)).toEqual(['heatWorkSign', 'unitSystem']);
  });
});

describe('checkConventions — absence is UNKNOWN, never a mismatch', () => {
  it("'-+++' vs undefined does NOT mismatch", () => {
    expect(checkConventions({ metricSignature: '-+++' }, { metricSignature: undefined })).toEqual(
      [],
    );
  });

  it('a declared key against a silent record does NOT mismatch', () => {
    expect(checkConventions({ metricSignature: '-+++' }, {})).toEqual([]);
  });

  it('an undefined record on either side yields no mismatches', () => {
    const declared: Conventions = { heatWorkSign: 'Q-W', metricSignature: '+---' };
    expect(checkConventions(undefined, declared)).toEqual([]);
    expect(checkConventions(declared, undefined)).toEqual([]);
    expect(checkConventions(undefined, undefined)).toEqual([]);
  });

  it('disjoint declarations do not mismatch — no key is shared', () => {
    expect(
      checkConventions({ heatWorkSign: 'Q-W' }, { metricSignature: '+---' }),
    ).toEqual([]);
  });

  it('a shared key mismatches even when the records also differ by absence', () => {
    // Control for the two rules above: absence is skipped, presence is not.
    expect(
      checkConventions(
        { heatWorkSign: 'Q-W', unitSystem: 'SI' },
        { heatWorkSign: 'Q+W' },
      ),
    ).toEqual(['heatWorkSign']);
  });
});

describe('the key list covers the whole Conventions interface', () => {
  it('every Conventions key is compared', () => {
    // A key added to `Conventions` but missed in CONVENTION_KEYS would be
    // silently never compared — the failure mode this pins. Each pair below
    // differs on exactly one key and must report exactly that key.
    const cases: readonly (readonly [Conventions, Conventions, string])[] = [
      [{ heatWorkSign: 'Q-W' }, { heatWorkSign: 'Q+W' }, 'heatWorkSign'],
      [{ metricSignature: '-+++' }, { metricSignature: '+---' }, 'metricSignature'],
      [
        { fourierNormalization: 'unitary' },
        { fourierNormalization: 'physics' },
        'fourierNormalization',
      ],
      [{ unitSystem: 'SI' }, { unitSystem: 'natural' }, 'unitSystem'],
      [{ capacitorChargeSign: '+' }, { capacitorChargeSign: '-' }, 'capacitorChargeSign'],
    ];
    for (const [a, b, key] of cases) {
      expect(checkConventions(a, b), `key '${key}' is not compared`).toEqual([key]);
    }
    // And the count matches the interface's field count, so a NEW field shows
    // up as a failure here rather than passing unnoticed.
    const allKeys = cases.map(([, , k]) => k);
    const everyKeyDeclared: Required<Conventions> = {
      heatWorkSign: 'Q-W',
      metricSignature: '-+++',
      fourierNormalization: 'unitary',
      unitSystem: 'SI',
      capacitorChargeSign: '+',
    };
    expect(Object.keys(everyKeyDeclared).sort()).toEqual([...allKeys].sort());
  });
});
