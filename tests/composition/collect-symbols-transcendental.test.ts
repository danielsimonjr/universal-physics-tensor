/**
 * `collectSymbols` must recurse into transcendental / abs / dirac-delta /
 * variational-derivative arms (Round-1 audit, Batch-3 correctness).
 *
 * `freeLeaves` (via `makeObservable`) drove an Observable's declared inputs.
 * Its `collectSymbols` walker handled only symbol/op/integral/derivative, so a
 * symbolic form whose leaves sit *inside* a `transcendental` (BE-37 ln, BE-26
 * exp) or `abs` (BE-41) node silently lost those inputs — the Observable would
 * then reject a valid call (missing-leaf) or accept a wrong one. The walker now
 * descends every scalar arm that carries an inner expression.
 *
 * @module tests/composition/collect-symbols-transcendental
 */
import { describe, it, expect } from 'vitest';
import { makeObservable } from '../../src/composition/compose-symbolic.js';
import type { ExprNode } from '../../src/dimensional/validator.js';

const DIMLESS = { L: 0, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 } as const;
const sym = (name: string): ExprNode => ({ kind: 'symbol', name, dim: { ...DIMLESS } });

describe('collectSymbols recurses transcendental/abs/dirac-delta (Batch-3)', () => {
  it('includes leaves inside transcendental and abs arms', () => {
    const expr: ExprNode = {
      kind: 'op',
      op: '*',
      args: [
        { kind: 'transcendental', fn: 'ln', arg: sym('ratio') },
        { kind: 'abs', arg: sym('phase') },
      ],
    };
    const obs = makeObservable('test', 'X', { ...DIMLESS }, expr);
    expect(obs.leaves).toContain('ratio');
    expect(obs.leaves).toContain('phase');
  });

  it('includes the leaf inside a dirac-delta arm', () => {
    const expr: ExprNode = { kind: 'dirac-delta', arg: sym('q') };
    const obs = makeObservable('test', 'X', { ...DIMLESS }, expr);
    expect(obs.leaves).toContain('q');
  });
});
