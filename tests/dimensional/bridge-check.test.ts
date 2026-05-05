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

  // --- bridgeId is now consulted (Wave-F repair, theme B). When the id is
  // present in EXPECTED_DIMENSION_BY_BRIDGE, the inferred dim is checked
  // against the expected and a mismatch returns null. Unknown ids fall
  // through to the inferred dim unchanged. ---

  it('known bridge id (BE-14) with matching inferred dim returns the inferred dim', () => {
    // BE-14 expects ENTROPY. The Ryu-Takayanagi-shape AST infers ENTROPY.
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
    expect(inferDimensionForBridge(14, expr)).toEqual(ENTROPY);
  });

  it('known bridge id (BE-14) with mismatched inferred dim returns null', () => {
    // Pass a perfectly-valid expression whose inferred dim is AREA, not
    // ENTROPY. BE-14's expected-dim guard should reject it.
    const areaOnly: ExprNode = sym('A', AREA);
    expect(inferDimensionForBridge(14, areaOnly)).toBeNull();
  });

  it('unknown bridge id passes through to inferred dim (current MVP)', () => {
    // Bridge id 99999 is not in EXPECTED_DIMENSION_BY_BRIDGE. Returns the
    // inferred dim unchanged.
    const areaOnly: ExprNode = sym('A', AREA);
    expect(inferDimensionForBridge(99999, areaOnly)).toEqual(AREA);
  });
});
