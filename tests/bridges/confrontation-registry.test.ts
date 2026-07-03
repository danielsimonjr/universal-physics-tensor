import { describe, it, expect } from 'vitest';
import { CONFRONTATIONS, listConfrontations, runConfrontation } from '../../src/bridges/confrontations.js';
import { DATA_CONFRONTED_IDS } from '../../src/bridges/confrontation-coverage.js';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';

describe('confrontation registry', () => {
  it('registers the three existing confrontations (be-23/36/52)', () => {
    expect(CONFRONTATIONS.has(23)).toBe(true);
    expect(CONFRONTATIONS.has(36)).toBe(true);
    expect(CONFRONTATIONS.has(52)).toBe(true);
  });

  it('every entry bridgeId exists in the catalog', () => {
    const catalogIds = new Set(BRIDGE_EQUATIONS.map((e) => e.id));
    for (const entry of listConfrontations()) {
      expect(catalogIds.has(entry.bridgeId), `be-${entry.bridgeId}`).toBe(true);
    }
  });

  it('DATA_CONFRONTED_IDS is exactly the registry keyset, sorted', () => {
    expect([...DATA_CONFRONTED_IDS]).toEqual([...CONFRONTATIONS.keys()].sort((a, b) => a - b));
  });

  it('runConfrontation(52) returns a value-kind outcome within 1 sigma', () => {
    const outcome = runConfrontation(52);
    expect(outcome?.kind).toBe('value');
    if (outcome?.kind === 'value') {
      expect(outcome.withinObserved).toBe(true);
      expect(outcome.units).toBe('arcsec/century');
    }
  });

  it('runConfrontation on an unregistered id returns undefined', () => {
    expect(runConfrontation(99)).toBeUndefined();
  });
});
