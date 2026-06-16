/**
 * Tests for the by-id ergonomics of AST-based bridge gradients:
 * `bridgeGradientASTById` (registry lookup) and `astDifferentiableBridgeIds`
 * (which catalogued bridges have an exactly-differentiable scalar RHS).
 *
 * Gated on the optional mathts-autograd peer for the gradient calls; the
 * coverage helper is pure and always runs.
 *
 * @module tests/diff/bridge-ast-gradient-byid
 */
import { describe, it, expect } from 'vitest';
import {
  bridgeGradientAST,
  bridgeGradientASTById,
  astDifferentiableBridgeIds,
} from '../../src/diff/bridge-ast-gradient.js';
import { BRIDGE_RHS_BY_ID } from '../../src/bridges/rhs-registry.js';
import { BE42_HAWKING_TEMPERATURE_RHS } from '../../src/bridges/equations/be-42-hawking-temperature.js';
import { hasAutogradSupport } from '../../src/numerical/tensor-engine.js';
import { MathTSEngine } from '../../src/numerical/mathts-engine.js';

const peerPresent = hasAutogradSupport(new MathTSEngine());

describe('bridgeGradientASTById — registry lookup', () => {
  it.runIf(peerPresent)('matches the direct AST call for BE-42, for number / "42" / "BE-42"', async () => {
    const M = 1.989e30;
    const direct = await bridgeGradientAST(BE42_HAWKING_TEMPERATURE_RHS, 'M', { M });
    for (const id of [42, '42', 'BE-42', 'be-42'] as const) {
      const byId = await bridgeGradientASTById(id, 'M', { M });
      expect(byId.value).toBeCloseTo(direct.value, 12);
      expect(byId.gradient).toBeCloseTo(direct.gradient, 12);
    }
  });

  it('throws for a bridge id with no encoded RHS (BE-51 is closed-form)', () => {
    // Synchronous throw (before the async peer import) — id 51 is not in the registry.
    expect(() => bridgeGradientASTById('BE-51', 'M', { M: 1 })).toThrow(/no encoded RHS|BE-51/);
  });

  it('throws on an unparseable bridge id', () => {
    expect(() => bridgeGradientASTById('nonsense', 'M', { M: 1 })).toThrow(/parse|bridge id/i);
  });
});

describe('astDifferentiableBridgeIds — exact-AD coverage', () => {
  const ids = astDifferentiableBridgeIds();

  it('returns a sorted, de-duplicated subset of the registry ids', () => {
    const registryIds = new Set(BRIDGE_RHS_BY_ID.keys());
    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length); // no dups
    for (const id of ids) expect(registryIds.has(id)).toBe(true);
    expect([...ids]).toEqual([...ids].sort((a, b) => a - b)); // sorted ascending
  });

  it('includes the fully-expanded BE-42 (Hawking)', () => {
    expect(ids).toContain(42);
  });

  it('genuinely filters — at least one encoded bridge is NOT exactly-differentiable', () => {
    // Bridges encoded with integral / tensor / curvature nodes (or whose physics
    // hides behind grammar this helper does not treat as differentiable) are
    // excluded; if the filter returned everything it would be a no-op bug.
    expect(ids.length).toBeLessThan(BRIDGE_RHS_BY_ID.size);
  });
});
