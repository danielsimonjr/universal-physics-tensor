/**
 * The deprecated BE-35 single-block residual is removed in 0.47.0, as the 0.46.0 notice promised:
 * "`BridgeEquations.crossingResidual` (`evaluateCrossingResidual`) and its ASTs
 * (`BE35_CROSSING_RESIDUAL_RHS`, `BE35_FORWARD_BLOCK`, `BE35_CROSSED_BLOCK`) do not state crossing
 * symmetry. They have no `v^Δφ` / `u^Δφ` prefactors and describe one conformal block. A zero from
 * them is not evidence of crossing, so the evaluator tests nothing. Use
 * `BridgeEquations.crossingEquation`."
 */
import { describe, it, expect } from 'vitest';
import { BridgeEquations } from '../../src/bridges/bridge-equations.js';
import * as be35 from '../../src/bridges/equations/be-35-conformal-bootstrap.js';
import { BRIDGE_RHS_BY_ID } from '../../src/bridges/rhs-registry.js';

describe('BE-35: the deprecated single-block residual is gone', () => {
  it('BridgeEquations has crossingEquation and no crossingResidual', () => {
    expect(typeof BridgeEquations.crossingEquation).toBe('function');
    expect('crossingResidual' in BridgeEquations).toBe(false);
  });

  it('the BE-35 module no longer exports the residual evaluator or its ASTs', () => {
    for (const name of ['evaluateCrossingResidual', 'BE35_CROSSING_RESIDUAL_RHS', 'BE35_FORWARD_BLOCK', 'BE35_CROSSED_BLOCK']) {
      expect(name in be35, name).toBe(false);
    }
  });

  it('the registered BE-35 RHS is still the crossing equation with its prefactors', () => {
    expect(BRIDGE_RHS_BY_ID.get(35)).toBe(be35.BE35_CROSSING_EQUATION_RHS);
    // v^Δφ g(u,v) − u^Δφ g(v,u) vanishes when g(u,v) = g(v,u) = 1 and u = v.
    expect(BridgeEquations.crossingEquation({ u: 0.4, v: 0.4, delta_phi: 0.518, g_uv: 1, g_vu: 1 })).toBe(0);
  });
});
