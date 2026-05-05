/**
 * Tests for the bridge-index integration scaffold.
 *
 * MVP behavior: the helper accepts a hand-supplied ExprNode AST for a bridge
 * equation and returns the inferred SI dimension. Encoding the full 40-bridge
 * AST library is Tier 5 work; here we pin one example (Ryu-Takayanagi-style
 * area / entropy expression) to lock in the contract.
 */

import { describe, it, expect } from 'vitest';
import { inferDimensionForBridge } from '../../src/dimensional/bridge-check.js';
import { ExprNode } from '../../src/dimensional/validator.js';
import {
  AREA,
  ENTROPY,
  DIMENSIONLESS,
  Dimension,
} from '../../src/dimensional/types.js';
import { k_B, l_P } from '../../src/dimensional/constants.js';

const sym = (name: string, dim: Dimension): ExprNode => ({ kind: 'symbol', name, dim });

describe('inferDimensionForBridge', () => {
  it('Ryu-Takayanagi-shape entropy expression infers ENTROPY', () => {
    // S = k_B A / (4 ℓ_P^2)
    const expr: ExprNode = {
      kind: 'op', op: '/',
      args: [
        { kind: 'op', op: '*', args: [sym('k_B', k_B), sym('A', AREA)] },
        {
          kind: 'op', op: '*',
          args: [
            sym('4', DIMENSIONLESS),
            { kind: 'op', op: '^', args: [sym('lP', l_P), { kind: 'symbol', name: '2', dim: DIMENSIONLESS }] },
          ],
        },
      ],
    };
    // Bridge 14 in the index is a Ryu-Takayanagi-family bridge; we pin the dim.
    const d = inferDimensionForBridge(14, expr);
    expect(d).toEqual(ENTROPY);
  });

  it('returns null when the expression itself is dimensionally inconsistent', () => {
    const expr: ExprNode = {
      kind: 'op', op: '+',
      args: [sym('A', AREA), sym('t', { L: 0, M: 0, T: 1, I: 0, Theta: 0, N: 0, J: 0 })],
    };
    expect(inferDimensionForBridge(99, expr)).toBeNull();
  });
});
