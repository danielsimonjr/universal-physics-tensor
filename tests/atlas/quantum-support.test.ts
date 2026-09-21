/**
 * W4 (chirped-Gaussian uncertainty product) and W5 (Wick-rotated Schrödinger
 * equation) for `src/atlas/witnesses/quantum-support.ts`.
 */

import { describe, expect, it } from 'vitest';

import {
  chirpedGaussianUncertaintyProduct,
  wickRotatedFreeKernel,
  wickRotatedSchrodingerCoefficients,
} from '../../src/atlas/witnesses/quantum-support.js';

/** Composite Simpson over an even number of equal intervals. */
function simpson(values: readonly number[], h: number): number {
  const n = values.length - 1;
  if (n % 2 !== 0) throw new Error('simpson needs an even interval count');
  let sum = values[0] + values[n];
  for (let i = 1; i < n; i++) sum += values[i] * (i % 2 === 1 ? 4 : 2);
  return (sum * h) / 3;
}

describe('W4 — chirped Gaussian uncertainty product', () => {
  it('is exactly ħ/2 at α = 0', () => {
    expect(chirpedGaussianUncertaintyProduct(1, 0)).toBe(0.5);
    expect(chirpedGaussianUncertaintyProduct(3.7, 0, 2)).toBe(1);
  });

  it('is (ħ/2)√5 at s = 1, α = 0.5', () => {
    const p = chirpedGaussianUncertaintyProduct(1, 0.5);
    expect(p).toBeCloseTo(Math.sqrt(5) / 2, 12);
    expect(p).toBeCloseTo(1.118033988749895, 12);
  });

  it('is confirmed by direct quadrature of ψ = N exp(−x²/4s² + iαx²)', () => {
    // ψ ~ exp(−A x²), A = 1/(4s²) − iα. With ψ′ = (−x/(2s²) + 2iαx) ψ:
    //   |ψ|²  = N² exp(−x²/2s²)
    //   |ψ′|² = |ψ|² x² (1/(4s⁴) + 4α²)
    //   ψ*ψ′  = |ψ|² x (−1/(2s²) + 2iα)      (odd ⇒ ⟨p⟩ = 0)
    const hbar = 1;
    const points = 4001;
    for (const [s, alpha] of [
      [1, 0],
      [1, 0.5],
      [0.7, 1.3],
      [2.1, -0.4],
    ] as const) {
      const xmax = 12 * s;
      const h = (2 * xmax) / (points - 1);
      const rho: number[] = [];
      const x2rho: number[] = [];
      const dpsi2: number[] = [];
      const reCross: number[] = [];
      const imCross: number[] = [];
      for (let i = 0; i < points; i++) {
        const x = -xmax + i * h;
        const r = Math.exp(-(x * x) / (2 * s * s));
        rho.push(r);
        x2rho.push(x * x * r);
        dpsi2.push(r * x * x * (1 / (4 * s ** 4) + 4 * alpha * alpha));
        reCross.push(r * x * (-1 / (2 * s * s)));
        imCross.push(r * x * 2 * alpha);
      }
      const norm = simpson(rho, h);
      const sigmaX = Math.sqrt(simpson(x2rho, h) / norm);
      const pMeanRe = -hbar * (simpson(imCross, h) / norm); // ⟨p⟩ = −iħ∫ψ*ψ′
      const pMeanIm = hbar * (simpson(reCross, h) / norm);
      const pMeanSq = pMeanRe * pMeanRe + pMeanIm * pMeanIm;
      const sigmaP = Math.sqrt(hbar * hbar * (simpson(dpsi2, h) / norm) - pMeanSq);

      expect(sigmaX).toBeCloseTo(s, 6);
      expect(Math.abs(sigmaX / s - 1)).toBeLessThan(1e-6);
      const product = sigmaX * sigmaP;
      const closed = chirpedGaussianUncertaintyProduct(s, alpha, hbar);
      expect(Math.abs(product / closed - 1)).toBeLessThan(1e-6);
    }
  });
});

describe('W5 — Wick-rotated Schrödinger equation', () => {
  it('reports the reaction–diffusion coefficients ħ/2m, −1, 1/ħ', () => {
    expect(wickRotatedSchrodingerCoefficients(1, 1)).toEqual({
      diffusion: 0.5,
      reactionSign: -1,
      reactionScale: 1,
    });
    expect(wickRotatedSchrodingerCoefficients(2, 8)).toEqual({
      diffusion: 0.125,
      reactionSign: -1,
      reactionScale: 0.5,
    });
  });

  it('satisfies ∂τφ = (ħ/2m) ∂xxφ on the free heat kernel (sup-norm ratio < 1e-4)', () => {
    // The norm is a SUP-NORM RATIO on purpose: a pointwise relative error is
    // undefined at the zeros of ∂τφ.
    const hbar = 1;
    const m = 1;
    const s = 1;
    const tau = 0.3;
    const points = 2001;
    const xmax = 8;
    const h = (2 * xmax) / (points - 1);
    const dtau = 1e-3;
    const { diffusion } = wickRotatedSchrodingerCoefficients(hbar, m);

    let supResidual = 0;
    let supDtau = 0;
    for (let i = 1; i < points - 1; i++) {
      const x = -xmax + i * h;
      const f = (xx: number, tt: number) => wickRotatedFreeKernel(xx, tt, s, hbar, m);
      const dPhiDtau = (f(x, tau + dtau) - f(x, tau - dtau)) / (2 * dtau);
      const d2PhiDx2 = (f(x + h, tau) - 2 * f(x, tau) + f(x - h, tau)) / (h * h);
      const residual = Math.abs(dPhiDtau - diffusion * d2PhiDx2);
      if (residual > supResidual) supResidual = residual;
      if (Math.abs(dPhiDtau) > supDtau) supDtau = Math.abs(dPhiDtau);
    }
    expect(supDtau).toBeGreaterThan(0);
    expect(supResidual / supDtau).toBeLessThan(1e-4);
  });

  it('carries the potential as −Vφ/ħ: φ = e^{−Vτ/ħ} × free kernel solves it', () => {
    const hbar = 2;
    const m = 3;
    const s = 1.4;
    const V = 0.75;
    const tau = 0.2;
    const h = 0.004;
    const dtau = 1e-4;
    const { diffusion, reactionSign, reactionScale } = wickRotatedSchrodingerCoefficients(hbar, m);
    const f = (xx: number, tt: number) =>
      Math.exp((-V * tt) / hbar) * wickRotatedFreeKernel(xx, tt, s, hbar, m);

    let supResidual = 0;
    let supDtau = 0;
    for (let x = -6; x <= 6; x += 0.05) {
      const dPhiDtau = (f(x, tau + dtau) - f(x, tau - dtau)) / (2 * dtau);
      const d2PhiDx2 = (f(x + h, tau) - 2 * f(x, tau) + f(x - h, tau)) / (h * h);
      const rhs = diffusion * d2PhiDx2 + reactionSign * reactionScale * V * f(x, tau);
      supResidual = Math.max(supResidual, Math.abs(dPhiDtau - rhs));
      supDtau = Math.max(supDtau, Math.abs(dPhiDtau));
    }
    expect(supResidual / supDtau).toBeLessThan(1e-4);
  });
});
