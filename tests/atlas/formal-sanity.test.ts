/**
 * Atlas Phase 4, S4.6 — sanity lemmas for the formal references.
 *
 * Design note: `docs/planning/Atlas-Phase-4-Design.md` §3–§4.
 *
 * A formal proof of the WRONG statement proves nothing about the physics. A
 * `formalRef` earns `fidelity: 'sanity-lemmas'` only through this file: each
 * test instantiates the formal statement, as written in the proof assistant, on
 * a known case, and checks that the atlas record asserts the SAME thing there.
 * If the record and the formal statement ever disagree on a known case, the
 * reference is to a different claim and the fidelity is wrong.
 *
 * The Lean source quoted below is Physlib at the commit recorded in the
 * reference's `version`.
 */

import { describe, expect, it } from 'vitest';
import { AB_PENDULUM_LINEAR, pendulumPeriodErrorAt } from '../../src/atlas/oscillators/bridges-limits.js';
import { deriveEvidence, NO_PASSING_WITNESSES } from '../../src/atlas/derive-evidence.js';
import { ATLAS_FAMILIES } from '../../src/atlas/families.js';

/** A known pendulum: m = 0.3 kg, g = 9.81 m/s², ℓ = 1.2 m. */
const PENDULUM = { m: 0.3, g: 9.81, ell: 1.2 } as const;

describe('ab-pendulum-linear ↔ ClassicalMechanics.SimplePendulum.linearizedEquationOfMotion_iff', () => {
  it('the reference names the Lean statement and a real fidelity', () => {
    const ref = AB_PENDULUM_LINEAR.formalRef;
    expect(ref).toBeDefined();
    expect(ref!.system).toBe('lean4-physlib');
    expect(ref!.statement).toContain('ClassicalMechanics.SimplePendulum.linearizedEquationOfMotion_iff');
    expect(ref!.fidelity).toBe('sanity-lemmas');
    expect(ref!.version).toMatch(/^physlib@[0-9a-f]{40} lean4:v\d+\.\d+\.\d+$/);
  });

  it('toHarmonicOscillator: mass I = mℓ², spring constant k = mgℓ, so √(k/I) = √(g/ℓ) — the record’s ω0² = g/ℓ', () => {
    // Lean: `toHarmonicOscillator.m := S.inertia` (= m ℓ²), `k := S.m * S.g * S.ℓ`,
    // and `toHarmonicOscillator_ω : S.toHarmonicOscillator.ω = S.ω` with ω = √(g/ℓ).
    const inertia = PENDULUM.m * PENDULUM.ell ** 2;
    const k = PENDULUM.m * PENDULUM.g * PENDULUM.ell;
    const omegaLean = Math.sqrt(k / inertia);
    const omegaRecord = Math.sqrt(PENDULUM.g / PENDULUM.ell);
    expect(omegaLean).toBeCloseTo(omegaRecord, 14);
    // The record states the same dictionary in prose.
    expect(AB_PENDULUM_LINEAR.transformation).toContain('ω0² = g/ℓ');
  });

  it('LinearizedEquationOfMotion: θ(t) = θ0 cos(ωt) satisfies θ̈ + ω²θ = 0 (FD residual → 0)', () => {
    // Lean: `LinearizedEquationOfMotion θ := ∀ t, ∂ₜ (∂ₜ θ) t + (S.ω ^ 2) • θ t = 0`.
    const omega = Math.sqrt(PENDULUM.g / PENDULUM.ell);
    const theta = (t: number) => 0.4 * Math.cos(omega * t);
    const residual = (h: number, t: number) =>
      Math.abs((theta(t + h) - 2 * theta(t) + theta(t - h)) / (h * h) + omega ** 2 * theta(t));
    // Measured: 1.093e-4 at h = 0.01, 2.733e-5 at h = 0.005 — second order, → 0.
    expect(residual(5e-3, 0.37)).toBeLessThan(3e-5);
    expect(residual(1e-2, 0.37) / residual(5e-3, 0.37)).toBeGreaterThan(3.9);
    expect(residual(1e-2, 0.37) / residual(5e-3, 0.37)).toBeLessThan(4.1);
  });

  it('norm_equationOfMotion_residual_le: the linearization error mgℓ|θ − sin θ| ≤ mgℓ|θ|³/6 across the record’s domain θ0 ≤ 0.5', () => {
    // Lean: ‖I θ̈ − τ(θ)‖ ≤ m g ℓ ‖θ‖³ / 6 along a solution of the linearized equation,
    // from `torque_sub_toHarmonicOscillator_force` = m g ℓ (θ − sin θ).
    const mgl = PENDULUM.m * PENDULUM.g * PENDULUM.ell;
    for (const th of [0.01, 0.1, 0.25, 0.4, 0.5]) {
      expect(mgl * Math.abs(th - Math.sin(th))).toBeLessThanOrEqual((mgl * th ** 3) / 6);
    }
    // At the record's domain edge the bound is tight to 1.2%: cubic, as both say.
    const edge = 0.5;
    expect((edge - Math.sin(edge)) / (edge ** 3 / 6)).toBeGreaterThan(0.98);
  });

  it('the formal statement is about the DYNAMICS dictionary, not the period bound — and the record’s bound is not claimed', () => {
    // Physlib's period results (`smallAnglePeriod_le_periodFormula`,
    // `strictMonoOn_periodFormula`) concern `periodFormula`, which Physlib's own
    // TODO has not yet identified with the period of the motion. They are
    // consistent with the record's bound — checked here — but they are NOT the
    // referenced statement, and the reference does not certify `delta`.
    expect(pendulumPeriodErrorAt({ theta0: 0 })).toBeCloseTo(0, 15);
    let prev = -1;
    for (const theta0 of [0.05, 0.1, 0.2, 0.3, 0.4, 0.5]) {
      const e = pendulumPeriodErrorAt({ theta0 });
      expect(e).toBeGreaterThan(0); // T0 ≤ T(θ0): smallAnglePeriod_le_periodFormula
      expect(e).toBeGreaterThan(prev); // strict monotonicity: the edge value is the sup
      prev = e;
    }
  });
});

describe('formally-proved is derived, and reachable only from a reviewed reference', () => {
  it('ab-pendulum-linear derives formally-proved from its reference and stores nothing', () => {
    expect(deriveEvidence(AB_PENDULUM_LINEAR, NO_PASSING_WITNESSES).has('formally-proved')).toBe(true);
    // The record's stored set never carries it: `derived-tag-literals.test.ts`
    // forbids spelling it anywhere a record could set it.
    expect(AB_PENDULUM_LINEAR.evidence.has('formally-proved')).toBe(false);
  });

  it('every bridge with a formalRef has a sanity lemma here, or a fidelity that is not sanity-lemmas', () => {
    const withRef = ATLAS_FAMILIES.flatMap((f) => f.bridges).filter((b) => b.formalRef !== undefined);
    expect(withRef.map((b) => b.id)).toEqual(['ab-pendulum-linear']);
  });
});
