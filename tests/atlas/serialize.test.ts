/**
 * Atlas Phase 0 S0.6 — the JSON projection itself.
 *
 * Three properties, and the third is why this file exists: the horizon check
 * is run against a MUTATED copy as well as the real record, because a check
 * that cannot fail proves nothing.
 */
import { describe, it, expect } from 'vitest';
import { toAtlasJson } from '../../src/atlas/serialize.js';
import { OSCILLATOR_FAMILY } from '../../src/atlas/oscillators/index.js';

const VERSION = '0.0.0-test';
const record = toAtlasJson(OSCILLATOR_FAMILY, VERSION);

type Bridge = Record<string, unknown>;

/**
 * Names every `approximation` bridge in the OUTPUT whose bound does not carry
 * a non-empty prose horizon. Returns the offending ids, so the same function
 * can be pointed at a deliberately broken record.
 */
function approximationsMissingHorizon(bridges: readonly Bridge[]): string[] {
  const bad: string[] = [];
  for (const b of bridges) {
    if (b['relation'] !== 'approximation') continue;
    const bound = b['bound'] as Record<string, unknown> | undefined;
    const horizon = bound?.['horizon'];
    if (typeof horizon !== 'string' || horizon.trim() === '') {
      bad.push(String(b['id']));
    }
  }
  return bad;
}

describe('toAtlasJson — record shape', () => {
  it('emits schemaVersion 0, the family name and every collection', () => {
    expect(record.schemaVersion).toBe('0');
    expect(record.packageVersion).toBe(VERSION);
    expect(record.family).toBe('oscillators');
    expect(record.models.length).toBe(OSCILLATOR_FAMILY.models.length);
    expect(record.bridges.length).toBe(OSCILLATOR_FAMILY.bridges.length);
    expect(record.rejections.length).toBe(OSCILLATOR_FAMILY.rejections.length);
  });

  it('serializes the evidence Set as a SORTED array, never as {}', () => {
    const bridges = record.bridges as unknown as Bridge[];
    for (const b of bridges) {
      const evidence = b['evidence'];
      expect(Array.isArray(evidence)).toBe(true);
      const tags = evidence as string[];
      expect(tags.length).toBeGreaterThan(0);
      expect(tags).toEqual([...tags].sort());
    }
    // The trap this guards: a raw Set round-trips to an empty object.
    expect(JSON.parse(JSON.stringify(new Set(['a'])))).toEqual({});
  });

  it('drops horizonHolds — a predicate is not data', () => {
    const json = JSON.stringify(record);
    expect(json).not.toContain('horizonHolds');
    for (const b of record.bridges as unknown as Bridge[]) {
      const bound = b['bound'] as Record<string, unknown> | undefined;
      if (bound !== undefined) expect(bound['horizonHolds']).toBeUndefined();
    }
  });

  it('emits PiGroup exponents as-is under every regime group definition', () => {
    const model = (record.models as unknown as Array<Record<string, unknown>>).find(
      (m) => m['id'] === 'model-damped-spring',
    );
    const regime = model?.['regime'] as Record<string, unknown>;
    const defs = regime['groupDefinitions'] as Record<string, Record<string, unknown>>;
    const keys = Object.keys(defs);
    expect(keys.length).toBeGreaterThan(0);
    for (const k of keys) {
      expect(typeof defs[k]?.['formula']).toBe('string');
      expect(typeof defs[k]?.['exponents']).toBe('object');
    }
  });
});

describe('toAtlasJson — determinism', () => {
  it('is stable across two calls, byte for byte', () => {
    const a = JSON.stringify(toAtlasJson(OSCILLATOR_FAMILY, VERSION), null, 2);
    const b = JSON.stringify(toAtlasJson(OSCILLATOR_FAMILY, VERSION), null, 2);
    expect(a).toBe(b);
  });

  it('survives a JSON round-trip unchanged (the output is pure JSON)', () => {
    expect(JSON.parse(JSON.stringify(record))).toEqual(
      JSON.parse(JSON.stringify(record)),
    );
    expect(JSON.parse(JSON.stringify(record))).toEqual(record);
  });
});

describe('toAtlasJson — every approximation carries its horizon', () => {
  it('leaves no approximation bridge without a non-empty bound.horizon', () => {
    expect(approximationsMissingHorizon(record.bridges as unknown as Bridge[])).toEqual(
      [],
    );
  });

  it('CONTROL: the same check FAILS on a copy with the horizon removed', () => {
    const mutated = JSON.parse(JSON.stringify(record)) as { bridges: Bridge[] };
    const victim = mutated.bridges.find((b) => b['relation'] === 'approximation');
    expect(victim).toBeDefined();
    delete (victim?.['bound'] as Record<string, unknown>)['horizon'];
    expect(approximationsMissingHorizon(mutated.bridges)).toEqual([
      String(victim?.['id']),
    ]);
  });

  it('CONTROL: an empty-string horizon is rejected too, not just a missing key', () => {
    const mutated = JSON.parse(JSON.stringify(record)) as { bridges: Bridge[] };
    const victim = mutated.bridges.find((b) => b['relation'] === 'approximation');
    (victim?.['bound'] as Record<string, unknown>)['horizon'] = '   ';
    expect(approximationsMissingHorizon(mutated.bridges)).toEqual([
      String(victim?.['id']),
    ]);
  });
});
