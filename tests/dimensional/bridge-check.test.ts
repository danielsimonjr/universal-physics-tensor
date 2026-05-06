/**
 * Tests for the bridge-index integration scaffold.
 *
 * MVP behavior: the helper accepts a hand-supplied ExprNode AST for a bridge
 * equation and returns the inferred SI dimension. Encoding the full 40-bridge
 * AST library is Tier 5 work; here we pin one example (Ryu-Takayanagi-style
 * area / entropy expression) to lock in the contract.
 */

import { describe, it, expect } from 'vitest';
import {
  inferDimensionForBridge,
  EXPECTED_DIMENSION_BY_BRIDGE,
} from '../../src/dimensional/bridge-check.js';
import { ExprNode } from '../../src/dimensional/validator.js';
import {
  AREA,
  ENTROPY,
  DIMENSIONLESS,
  TIME,
  FREQUENCY,
  MASS,
  Dimension,
} from '../../src/dimensional/types.js';
import { multiply, power } from '../../src/dimensional/algebra.js';
import { LENGTH } from '../../src/dimensional/types.js';
import { k_B, l_P } from '../../src/dimensional/constants.js';
import { QUANTUM_BOUNCE_RHS } from '../../src/bridges/equations/be-19-quantum-bounce.js';
import { BE22_TOPOLOGICAL_ENTANGLEMENT_RHS } from '../../src/bridges/equations/be-22-topological-entanglement.js';
import { DNA_TUNNELING_RHS } from '../../src/bridges/equations/be-26-dna-tunneling.js';
import { KIBBLE_ZUREK_RHS } from '../../src/bridges/equations/be-34-kibble-zurek.js';
import { SWAMPLAND_RHS } from '../../src/bridges/equations/be-41-swampland.js';
import { BBN_DARK_RHS } from '../../src/bridges/equations/be-47-bbn-dark-sector.js';

const sym = (name: string, dim: Dimension): ExprNode => ({ kind: 'symbol', name, dim });

/** [T^-2] for BE-19 RHS (H² in c²-rescaled Friedmann form). */
const T_INV2: Dimension = { L: 0, M: 0, T: -2, I: 0, Theta: 0, N: 0, J: 0 };
/** [L^-3 T^-1] for BE-47 RHS (per-volume number density rate). */
const INV_VOLUME_PER_TIME: Dimension = multiply(power(LENGTH, -3), { L: 0, M: 0, T: -1, I: 0, Theta: 0, N: 0, J: 0 });

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

  // --- Wave-G repair (CR-F1): cross-check map extended for the 7 new
  //     AST encodings (BE-19, 22, 25, 26, 34, 41, 47). For each, the
  //     module's registered RHS must satisfy the per-bridge expected
  //     dim guard, and a deliberately-wrong AST must be rejected. ---

  describe('Wave-G expected-dimension entries (cross-check map)', () => {
    it('BE-19 (RHS = H² Friedmann): infers [T^-2]', () => {
      expect(inferDimensionForBridge(19, QUANTUM_BOUNCE_RHS)).toEqual(T_INV2);
    });
    it('BE-19 rejects wrong AST (AREA instead of T^-2)', () => {
      expect(inferDimensionForBridge(19, sym('A', AREA))).toBeNull();
    });

    it('BE-22 (TEE RHS): infers DIMENSIONLESS', () => {
      expect(inferDimensionForBridge(22, BE22_TOPOLOGICAL_ENTANGLEMENT_RHS)).toEqual(DIMENSIONLESS);
    });
    it('BE-22 rejects wrong AST (TIME instead of DIMENSIONLESS)', () => {
      expect(inferDimensionForBridge(22, sym('t', TIME))).toBeNull();
    });

    // BE-25 (Orch-OR) cross-check tests REMOVED 2026-05-06 (Wave Q B2,
    // per CS iter-6 C2): the legacy AST module is archived (encodes the
    // dropped Penrose-Hameroff form). BE-25 was reformulated to IIT
    // Φ_max in Wave P-D R-D2; Φ has no SI dimension (units are bits
    // when log₂ is used). The legacy AST module's [time] inference is
    // still tested in `tests/bridges/be-25-encoding.test.ts` as an
    // archive regression — it just no longer participates in this
    // per-bridge cross-check.

    it('BE-26 (DNA-tunneling RHS): infers FREQUENCY', () => {
      expect(inferDimensionForBridge(26, DNA_TUNNELING_RHS)).toEqual(FREQUENCY);
    });
    it('BE-26 rejects wrong AST (TIME instead of FREQUENCY)', () => {
      expect(inferDimensionForBridge(26, sym('t', TIME))).toBeNull();
    });

    it('BE-34 (Kibble-Zurek RHS): infers DIMENSIONLESS', () => {
      expect(inferDimensionForBridge(34, KIBBLE_ZUREK_RHS)).toEqual(DIMENSIONLESS);
    });
    it('BE-34 rejects wrong AST (MASS instead of DIMENSIONLESS)', () => {
      expect(inferDimensionForBridge(34, sym('m', MASS))).toBeNull();
    });

    it('BE-41 (swampland RHS): infers MASS', () => {
      expect(inferDimensionForBridge(41, SWAMPLAND_RHS)).toEqual(MASS);
    });
    it('BE-41 rejects wrong AST (TIME instead of MASS)', () => {
      expect(inferDimensionForBridge(41, sym('t', TIME))).toBeNull();
    });

    it('BE-47 (BBN-dark RHS): infers [L^-3 T^-1]', () => {
      expect(inferDimensionForBridge(47, BBN_DARK_RHS)).toEqual(INV_VOLUME_PER_TIME);
    });
    it('BE-47 rejects wrong AST (FREQUENCY instead of [L^-3 T^-1])', () => {
      expect(inferDimensionForBridge(47, sym('f', FREQUENCY))).toBeNull();
    });

    it('cross-check map size matches the 8 currently-registered AST modules (post Wave Q B2)', () => {
      // Wave-G originally added entries for BE-19, 22, 25, 26, 34, 41, 47
      // alongside BE-11 and BE-14 (total = 9). Wave Q B2 (CS iter-6 C2)
      // removed BE-25 because the legacy Penrose-Hameroff AST module is
      // archived under the Wave P-D R-D2 IIT Φ_max reformulation, leaving
      // 8 entries. If a future encoding lands and forgets to add a row,
      // this guard fails loudly.
      expect(EXPECTED_DIMENSION_BY_BRIDGE.size).toBe(8);
      for (const id of [11, 14, 19, 22, 26, 34, 41, 47]) {
        expect(EXPECTED_DIMENSION_BY_BRIDGE.has(id)).toBe(true);
      }
      expect(EXPECTED_DIMENSION_BY_BRIDGE.has(25)).toBe(false);
    });
  });
});
