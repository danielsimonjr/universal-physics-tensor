/**
 * An overlay counterexample that cites the adjudication registry as its witness quotes the
 * registry's reason VERBATIM, as its comment says.
 *
 * The BE-35 counterexample said "reason quoted verbatim" while paraphrasing it (a model check with
 * source access found three differences). The registry is the source of truth, so the quote is
 * pinned to it: an edit to either side fails here until the other follows.
 */

import { describe, expect, it } from 'vitest';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';
import { REJECTED_BRIDGE_ADJUDICATIONS } from '../../src/bridges/rejected.js';

const REGISTRY_WITNESS = /REJECTED_BRIDGE_ADJUDICATIONS, beId (\d+)/;

const cases = BRIDGE_EQUATIONS.flatMap((entry) =>
  (entry.counterexamples ?? [])
    .map((c) => ({ id: entry.id, c, beId: REGISTRY_WITNESS.exec(c.witness)?.[1] }))
    .filter((x) => x.beId !== undefined),
);

describe('overlay counterexamples quote the adjudication registry verbatim', () => {
  it('at least one counterexample cites the registry', () => {
    expect(cases.length).toBeGreaterThan(0);
  });

  it.each(cases.map((x) => [x.id, x] as const))('BE-%s quotes its registry reason exactly', (_id, x) => {
    const entry = REJECTED_BRIDGE_ADJUDICATIONS.find((a) => a.beId === Number(x.beId));
    expect(entry).toBeDefined();
    expect(x.c.description).toBe(entry!.reason);
  });
});
