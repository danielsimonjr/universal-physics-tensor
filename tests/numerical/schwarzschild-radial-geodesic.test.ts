import { describe, it, expect } from 'vitest';
import { integrateGeodesic } from '../../src/numerical/geodesic-integrator.js';
import { schwarzschildChristoffelFn } from '../fixtures/schwarzschild.js';
import { C_SI, G_SI } from '../../src/core/constants.js';

describe('Schwarzschild radial-infall geodesic vs. cycloid closed form', () => {
  it("matches cycloid r(η), τ(η) within ±1e-6 over a free-fall arc", () => {
    // v0.5.1 Task 4: canonical constants from src/core/constants.ts —
    // must match the Schwarzschild fixture (now also canonicalized) so
    // the analytic cycloid baseline tracks the integrator's r_s exactly.
    const M_kg = 1.989e30, G = G_SI, c = C_SI;
    const r_s = (2 * G * M_kg) / (c * c);
    const r0 = 100 * r_s;

    // Cycloid: r(η) = (r0/2)(1+cos η);
    //          τ(η) = (r0/2)·sqrt(r0/r_s)(η+sin η)/c.
    const cyc_r = (eta: number) => (r0 / 2) * (1 + Math.cos(eta));
    const cyc_tau = (eta: number) =>
      (r0 / 2) * Math.sqrt(r0 / r_s) * (eta + Math.sin(eta)) / c;

    const etaFinal = 0.5;
    const tauFinal = cyc_tau(etaFinal);
    const rExpected = cyc_r(etaFinal);
    expect(rExpected).toBeGreaterThan(3 * r_s);

    // Schwarzschild normalization: u^μ u_μ = −c²; for radial timelike geodesic
    // with r₀=100·r_s, dt/dτ = 1/√(1−r_s/r₀) ≈ 1.005.
    const v0: [number, number, number, number] = [1 / Math.sqrt(1 - r_s / r0), 0, 0, 0];
    const result = integrateGeodesic({
      christoffelFn: schwarzschildChristoffelFn(M_kg),
      x0: [0, r0, Math.PI / 2, 0],
      v0,
      tauStart: 0, tauEnd: tauFinal, steps: 5000,
      domainMinRadius: 3 * r_s,
    });
    expect(result.xFinal[1]).toBeCloseTo(rExpected, 6);
  });

  it("throws when r0 < domainMinRadius (E11: explicit option, not monkey-patch)", () => {
    const M_kg = 1.989e30;
    const r_s = (2 * G_SI * M_kg) / (C_SI ** 2);
    expect(() => integrateGeodesic({
      christoffelFn: schwarzschildChristoffelFn(M_kg),
      x0: [0, 2.9 * r_s, Math.PI / 2, 0],
      v0: [1 / Math.sqrt(1 - r_s / (2.9 * r_s)), 0, 0, 0],
      tauStart: 0, tauEnd: 1, steps: 100,
      domainMinRadius: 3 * r_s,
    })).toThrow(/domainMinRadius|r0/);
  });
});
