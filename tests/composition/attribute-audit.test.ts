/**
 * Phase-2 D2 — adjudicated regime-attribute AUDIT (2026-07-02).
 *
 * Pins the END-STATE `attributes` for every row the binding adjudication
 * record (`.superpowers/sdd/phase2/audit-table-draft.md`, "ADJUDICATION
 * RECORD" section) changes: 4 strips + 5 completes. Also pins the
 * `boundary-length` NO-CHANGE row (its COMPLETE was rejected — BE-22
 * topological-entanglement-entropy grounds, not the RT/horizon family),
 * the two named generics' attribute-free invariant, and a union-validity
 * walk over every registry quantity.
 *
 * Consumer enumeration (Task 2 Step 1): `placeQuantity`/`buildRegimeTensor`
 * (src/composition/bridge-prediction.ts, `upt predict`) read
 * `Quantity.attributes` directly — pinned below as the BEFORE/AFTER predict
 * surface. `canonical-graph.ts`'s `attributesOf()` stamps a CANONICAL
 * EQUATION's own `regime` field onto its governing variables — a wholly
 * separate mechanism this audit does not touch (Task-0 Finding F1; the
 * adjudication record's Option-A resolver instead has the not-yet-built
 * identity gate ignore canonical stamps entirely). `src/bridges/membership.ts`
 * does NOT compute from `Quantity.attributes` — `adjudicateBridgeEntry` uses
 * only the catalog `bridges: [a, b]` tuple + the `rejected.ts` overlay; its
 * docstring's "regime attribute" language is descriptive, not computed.
 */
import { describe, it, expect } from 'vitest';
import * as quantities from '../../src/composition/quantities.js';
import type { Quantity, RegimeAttributes } from '../../src/composition/index.js';
import { placeQuantity, regimeKey } from '../../src/composition/bridge-prediction.js';

const SCALES = ['quantum', 'mesoscopic', 'classical', 'cosmological'];
const FORCES = ['gravitational', 'electromagnetic', 'weak', 'strong', 'emergent'];
const INFORMATION = ['von-neumann', 'shannon', 'kolmogorov', 'discord'];

const nodes = Object.entries(quantities).filter(
  (e): e is [string, Quantity] =>
    typeof e[1] === 'object' &&
    e[1] !== null &&
    'name' in (e[1] as object) &&
    'attributes' in (e[1] as object),
);
const byName = new Map(nodes.map(([, q]) => [q.name, q]));

function attrsOf(name: string): RegimeAttributes {
  const q = byName.get(name);
  if (!q) throw new Error(`no registry quantity named '${name}'`);
  return q.attributes;
}

describe('adjudicated end-state attributes (audit-table-draft.md, ADJUDICATION RECORD)', () => {
  it('STRIP: mass carries no attributes (was {scale: classical, force: gravitational})', () => {
    expect(attrsOf('mass')).toEqual({});
  });

  it('STRIP: temperature carries no attributes (was {scale: classical}; also resolves the hawking-temperature fold conflict)', () => {
    expect(attrsOf('temperature')).toEqual({});
  });

  it('STRIP (split→abstain): decoherence-rate scale is stripped (was {scale: classical})', () => {
    expect(attrsOf('decoherence-rate')).toEqual({});
  });

  it('STRIP (split→abstain): relaxation-rate scale is stripped (was {scale: classical})', () => {
    expect(attrsOf('relaxation-rate')).toEqual({});
  });

  it('COMPLETE: boundary-entanglement-entropy gains force: gravitational (RT holographic entropy)', () => {
    expect(attrsOf('boundary-entanglement-entropy')).toEqual({
      scale: 'quantum',
      information: 'von-neumann',
      force: 'gravitational',
    });
  });

  it('COMPLETE: donor-acceptor-distance gains force: electromagnetic (FRET dipole-dipole coupling)', () => {
    expect(attrsOf('donor-acceptor-distance')).toEqual({
      scale: 'mesoscopic',
      force: 'electromagnetic',
    });
  });

  it('COMPLETE: foerster-radius gains force: electromagnetic (same FRET family)', () => {
    expect(attrsOf('foerster-radius')).toEqual({
      scale: 'mesoscopic',
      force: 'electromagnetic',
    });
  });

  it('COMPLETE: mass-density gains force: gravitational (BE-19 LQC-bounce family)', () => {
    expect(attrsOf('mass-density')).toEqual({
      scale: 'cosmological',
      force: 'gravitational',
    });
  });

  it('COMPLETE: wormhole-entanglement-entropy gains force: gravitational (ER=EPR family)', () => {
    expect(attrsOf('wormhole-entanglement-entropy')).toEqual({
      scale: 'quantum',
      information: 'von-neumann',
      force: 'gravitational',
    });
  });

  it('NO CHANGE: boundary-length stays {scale: quantum} — its COMPLETE proposal was REJECTED (BE-22 topological-entanglement-entropy grounds, not the RT/horizon family)', () => {
    expect(attrsOf('boundary-length')).toEqual({ scale: 'quantum' });
  });
});

describe('generics invariant', () => {
  it('mass, temperature, time carry no attributes', () => {
    expect(attrsOf('mass')).toEqual({});
    expect(attrsOf('temperature')).toEqual({});
    expect(attrsOf('time')).toEqual({});
  });
});

describe('union validity — every stated axis value is within the RegimeAttributes unions', () => {
  for (const [, q] of nodes) {
    it(`${q.name}: attributes are within-union`, () => {
      const { scale, force, information } = q.attributes;
      if (scale !== undefined) expect(SCALES).toContain(scale);
      if (force !== undefined) expect(FORCES).toContain(force);
      if (information !== undefined) expect(INFORMATION).toContain(information);
    });
  }
});

describe('upt predict surface (placeQuantity) — before/after the audit', () => {
  it('mass is now unplaceable (BEFORE: scale=classical|force=gravitational; AFTER: null — the strip removes it from the regime plane)', () => {
    expect(placeQuantity(byName.get('mass')!)).toBeNull();
  });

  it('temperature is now unplaceable (BEFORE: scale=classical; AFTER: null)', () => {
    expect(placeQuantity(byName.get('temperature')!)).toBeNull();
  });

  it('decoherence-rate is now unplaceable (BEFORE: scale=classical; AFTER: null)', () => {
    expect(placeQuantity(byName.get('decoherence-rate')!)).toBeNull();
  });

  it('relaxation-rate is now unplaceable (BEFORE: scale=classical; AFTER: null)', () => {
    expect(placeQuantity(byName.get('relaxation-rate')!)).toBeNull();
  });

  it('boundary-entanglement-entropy now places with the completed force coordinate (BEFORE: scale=quantum; AFTER: scale=quantum|force=gravitational)', () => {
    expect(regimeKey(placeQuantity(byName.get('boundary-entanglement-entropy')!)!)).toBe(
      'scale=quantum|force=gravitational',
    );
  });

  it('donor-acceptor-distance now places with the completed force coordinate (BEFORE: scale=mesoscopic; AFTER: scale=mesoscopic|force=electromagnetic)', () => {
    expect(regimeKey(placeQuantity(byName.get('donor-acceptor-distance')!)!)).toBe(
      'scale=mesoscopic|force=electromagnetic',
    );
  });

  it('foerster-radius now places with the completed force coordinate (BEFORE: scale=mesoscopic; AFTER: scale=mesoscopic|force=electromagnetic)', () => {
    expect(regimeKey(placeQuantity(byName.get('foerster-radius')!)!)).toBe(
      'scale=mesoscopic|force=electromagnetic',
    );
  });

  it('mass-density now places with the completed force coordinate (BEFORE: scale=cosmological; AFTER: scale=cosmological|force=gravitational)', () => {
    expect(regimeKey(placeQuantity(byName.get('mass-density')!)!)).toBe(
      'scale=cosmological|force=gravitational',
    );
  });

  it('wormhole-entanglement-entropy now places with the completed force coordinate (BEFORE: scale=quantum; AFTER: scale=quantum|force=gravitational)', () => {
    expect(regimeKey(placeQuantity(byName.get('wormhole-entanglement-entropy')!)!)).toBe(
      'scale=quantum|force=gravitational',
    );
  });

  it('boundary-length placement is unchanged (scale=quantum, no force — NO CHANGE row)', () => {
    expect(regimeKey(placeQuantity(byName.get('boundary-length')!)!)).toBe('scale=quantum');
  });
});
