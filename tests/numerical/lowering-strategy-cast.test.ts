// tests/numerical/lowering-strategy-cast.test.ts
//
// UC-1 regression guard (v0.4.6).
//
// TDD honesty: this is a PRE-GREEN regression-guard test, NOT a true RED→GREEN
// cycle. The test PASSES both before and after the refactor in lowering.ts.
// Its purpose is to document the invariant — "strategy='zero' never reaches
// getMetricDerivFlat" — and to catch future drift: if someone removes the
// early-return guard at lowering.ts:457-459, the test will fail, flagging
// the regression.

import { describe, it, expect, vi } from 'vitest';
import { evaluateNumerical } from '../../src/numerical/index.js';
import * as connectionLoweringHelpers from '../../src/numerical/connection-lowering-helpers.js';
import { buildCovariantDerivativeOfMetricNode_FlatSpace } from '../fixtures/flat-cov-deriv.js';

describe('lowering: strategy cast narrowing (UC-1)', () => {
  it('getMetricDerivFlat is NEVER called with strategy="zero" — zero path returns early', async () => {
    const spy = vi.spyOn(connectionLoweringHelpers, 'getMetricDerivFlat');

    const ast = buildCovariantDerivativeOfMetricNode_FlatSpace();
    await evaluateNumerical(ast, {
      tensors: new Map([
        ['g', [[-1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]],
        ['g_inv', [[-1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]],
        ['x', [0, 0, 0, 0]],
      ]),
      dimension: 4,
    });

    // If 'zero' strategy had fallen through to the getMetricDerivFlat call,
    // the spy would have been called with strategy='zero'. It must NOT be called
    // at all for strategy='zero' — the early-return at lowering.ts:457-459 exits first.
    expect(spy).not.toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.anything(),
      'zero',
      expect.anything(),
      expect.anything(),
    );
    spy.mockRestore();
  });
});
