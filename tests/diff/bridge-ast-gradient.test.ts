/**
 * Tests for `src/diff/bridge-ast-gradient.ts` — reverse-mode AD over a bridge's
 * faithfully-encoded scalar RHS AST (the "traced AST lowering" path).
 *
 * Unlike `bridgeGradient` (which cannot trace the plain-JS evaluators) and
 * `bridgeGradientNumerical` (finite differences), `bridgeGradientAST` lowers the
 * symbolic `*_RHS` ExprNode through `@danielsimonjr/mathts-autograd`'s TapedTensor
 * ops, so the gradient is EXACT (to machine precision), not a finite-difference
 * approximation. Validated on BE-42 (T_H = ℏc³/(8πGM·k_B) ∝ 1/M, so
 * dT_H/dM = -T_H/M exactly), cross-checked against the plain-JS evaluator and the
 * numerical gradient.
 *
 * Gated on the optional mathts-autograd peer (skips gracefully when absent).
 *
 * @module tests/diff/bridge-ast-gradient
 */
import { describe, it, expect } from 'vitest';
import { bridgeGradientAST } from '../../src/diff/bridge-ast-gradient.js';
import {
  BE42_HAWKING_TEMPERATURE_RHS,
  evaluateHawkingTemperature,
} from '../../src/bridges/equations/be-42-hawking-temperature.js';
import { bridgeGradientNumerical } from '../../src/diff/bridge-gradient.js';
import { BE42_HAWKING_DIFF } from '../../src/diff/bridge-specs.js';
import { hasAutogradSupport } from '../../src/numerical/tensor-engine.js';
import { MathTSEngine } from '../../src/numerical/mathts-engine.js';

// The peer is present iff a fresh MathTSEngine reports autograd support AND the
// dynamic import resolves; bridgeGradientAST throws EngineCapabilityError when
// the peer is absent, which we treat as "skip" in CI without the sister repo.
const peerPresent = hasAutogradSupport(new MathTSEngine());

describe('bridgeGradientAST — BE-42 Hawking temperature (faithful RHS)', () => {
  it.runIf(peerPresent)(
    'value matches the plain-JS evaluator; gradient is exact -T_H/M',
    async () => {
      const M = 1.989e30;
      const { value, gradient } = await bridgeGradientAST(
        BE42_HAWKING_TEMPERATURE_RHS,
        'M',
        { M },
      );

      // Value: the traced AST evaluates to the same number as the hand-written evaluator.
      expect(value).toBeCloseTo(evaluateHawkingTemperature({ M_kg: M }), 6);

      // Gradient: AD is exact (machine precision), not an FD approximation.
      const analytic = -value / M;
      expect(Math.abs((gradient - analytic) / analytic)).toBeLessThan(1e-12);
    },
  );

  it.runIf(peerPresent)(
    'agrees with the numerical finite-difference gradient',
    async () => {
      const M = 6e30;
      const { gradient: adGrad } = await bridgeGradientAST(
        BE42_HAWKING_TEMPERATURE_RHS,
        'M',
        { M },
      );
      const { gradient: fdGrad } = bridgeGradientNumerical(BE42_HAWKING_DIFF, {
        M_kg: M,
      });
      // Same physical derivative dT_H/dM; FD is good to ~1e-6.
      expect(Math.abs((adGrad - fdGrad.M_kg) / fdGrad.M_kg)).toBeLessThan(1e-6);
    },
  );

  it.runIf(peerPresent)(
    'throws on a symbol with no binding and no known constant',
    async () => {
      // A made-up RHS referencing an unknown symbol 'Q'.
      const rhs = {
        kind: 'op',
        op: '*',
        args: [
          { kind: 'symbol', name: 'Q', dimension: {} },
          { kind: 'symbol', name: 'M', dimension: {} },
        ],
      } as never;
      await expect(bridgeGradientAST(rhs, 'M', { M: 1 })).rejects.toThrow(
        /unknown symbol|Q/,
      );
    },
  );

  it.runIf(peerPresent)(
    'accumulates gradient when the variable occurs multiple times',
    async () => {
      const sym = (name: string) => ({ kind: 'symbol', name, dimension: {} });
      // f = x*x + (2*x + 3*x)  ⇒ value = x² + 5x; df/dx = 2x + 5.
      const rhs = {
        kind: 'op',
        op: '+',
        args: [
          { kind: 'op', op: '*', args: [sym('x'), sym('x')] }, // alias mul → 2x
          {
            kind: 'op',
            op: '+',
            args: [
              { kind: 'op', op: '*', args: [sym('2'), sym('x')] },
              { kind: 'op', op: '*', args: [sym('3'), sym('x')] },
            ],
          },
        ],
      } as never;
      const x = 4;
      const { value, gradient } = await bridgeGradientAST(rhs, 'x', { x });
      expect(value).toBeCloseTo(x * x + 5 * x, 10);
      expect(gradient).toBeCloseTo(2 * x + 5, 10);
    },
  );

  it.runIf(peerPresent)(
    'throws when the differentiation variable appears as an exponent',
    async () => {
      // M^2 with varName 'M' — variable exponents are unsupported.
      const rhs = {
        kind: 'op',
        op: '^',
        args: [
          { kind: 'symbol', name: 'c', dimension: {} },
          { kind: 'symbol', name: 'M', dimension: {} },
        ],
      } as never;
      await expect(bridgeGradientAST(rhs, 'M', { M: 2 })).rejects.toThrow(
        /exponent/i,
      );
    },
  );
});

describe('bridgeGradientAST — constant expression exponents', () => {
  it.runIf(peerPresent)('supports -1/z when z is a constant binding relative to the differentiated variable', async () => {
    const D = {} as any;
    const rhs = {
      kind: 'op', op: '^', args: [
        { kind: 'symbol', name: 'x', dim: D },
        { kind: 'op', op: '/', args: [
          { kind: 'symbol', name: '-1', dim: D },
          { kind: 'symbol', name: 'z', dim: D },
        ] },
      ],
    } as any;
    const { value, gradient } = await bridgeGradientAST(rhs, 'x', { x: 4, z: 2 });
    expect(value).toBeCloseTo(0.5, 12);
    expect(gradient).toBeCloseTo(-0.0625, 12);
  });

  it.runIf(peerPresent)('still rejects an exponent that depends on the differentiation variable', async () => {
    const D = {} as any;
    const rhs = {
      kind: 'op', op: '^', args: [
        { kind: 'symbol', name: 'base', dim: D },
        { kind: 'op', op: '/', args: [
          { kind: 'symbol', name: '-1', dim: D },
          { kind: 'symbol', name: 'z', dim: D },
        ] },
      ],
    } as any;
    await expect(bridgeGradientAST(rhs, 'z', { base: 4, z: 2 })).rejects.toThrow(/appears as an exponent|variable exponents/i);
  });
});
