/**
 * BE-26 DNA tunneling — v0.21 faithful re-encoding of the Gamow exponential as
 * `transcendental(exp, −(2/ℏ)∫_{x₁}^{x₂}√(2m(V−E))dx)` (definite integral, constant
 * integrand → Gauss–Legendre exact). bridgeGradientASTById now differentiates the
 * tunneling rate exactly w.r.t. m, V_minus_E, and the barrier endpoints x₁, x₂
 * (the f(T,pH,EM) interpolation factor stays an opaque stub).
 *
 * Gated on the optional mathts-autograd peer.
 *
 * @module tests/diff/be-26-ad
 */
import { describe, it, expect } from 'vitest';
import {
  bridgeGradientASTById,
  astDifferentiableBridgeIds,
} from '../../src/diff/bridge-ast-gradient.js';
import { evaluateDNATunneling } from '../../src/bridges/equations/be-26-dna-tunneling.js';
import { hasAutogradSupport } from '../../src/numerical/tensor-engine.js';
import { MathTSEngine } from '../../src/numerical/mathts-engine.js';

const peerPresent = hasAutogradSupport(new MathTSEngine());
const relErr = (a: number, b: number) => Math.abs((a - b) / b);
const eV = 1.602176634e-19;

// Barrier width L = x₂ − x₁; matches the evaluator's rectangular barrier_width.
const base: Record<string, number> = {
  nu_0: 1e13,
  m: 1.67e-27, // proton mass
  V_minus_E: 0.4 * eV,
  x_1: 0,
  x_2: 1e-10, // 1 Å
  'f(T,pH,EM)': 1,
};

describe('BE-26 — faithful integral re-encoding under AD', () => {
  it('BE-26 is now exactly-AD-eligible', () => {
    expect(astDifferentiableBridgeIds()).toContain(26);
  });

  it.runIf(peerPresent)('AST value matches the canonical evaluator (rectangular barrier L=x₂−x₁)', async () => {
    const { value } = await bridgeGradientASTById('BE-26', 'm', base);
    const ref = evaluateDNATunneling({
      nu_0: 1e13,
      m: 1.67e-27,
      V_minus_E: 0.4 * eV,
      barrier_width: 1e-10,
      f_correction: 1,
    });
    expect(relErr(value, ref)).toBeLessThan(1e-9);
  });

  it.runIf(peerPresent)('physical signs: ∂Γ/∂m, ∂Γ/∂(V−E), ∂Γ/∂x₂ < 0; ∂Γ/∂ν₀ > 0', async () => {
    expect((await bridgeGradientASTById('BE-26', 'm', base)).gradient).toBeLessThan(0);
    expect((await bridgeGradientASTById('BE-26', 'V_minus_E', base)).gradient).toBeLessThan(0);
    expect((await bridgeGradientASTById('BE-26', 'x_2', base)).gradient).toBeLessThan(0);
    expect((await bridgeGradientASTById('BE-26', 'nu_0', base)).gradient).toBeGreaterThan(0);
  });

  it.runIf(peerPresent)('barrier-width degeneracy: ∂Γ/∂x₁ = −∂Γ/∂x₂ (Eve)', async () => {
    const g1 = (await bridgeGradientASTById('BE-26', 'x_1', base)).gradient;
    const g2 = (await bridgeGradientASTById('BE-26', 'x_2', base)).gradient;
    expect(relErr(g1, -g2)).toBeLessThan(1e-9);
  });

  it.runIf(peerPresent)('AD ∂Γ/∂m matches central finite differences (self-consistency)', async () => {
    const h = base.m * 1e-6;
    const vp = (await bridgeGradientASTById('BE-26', 'm', { ...base, m: base.m + h })).value;
    const vm = (await bridgeGradientASTById('BE-26', 'm', { ...base, m: base.m - h })).value;
    const fd = (vp - vm) / (2 * h);
    const { gradient } = await bridgeGradientASTById('BE-26', 'm', base);
    expect(relErr(gradient, fd)).toBeLessThan(1e-5);
  });
});
