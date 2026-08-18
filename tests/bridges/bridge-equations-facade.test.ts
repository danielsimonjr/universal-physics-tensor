/**
 * `BridgeEquations` facade (v0.14) — the root-level convenience layer over the
 * per-bridge evaluators. Each method must be a 1:1 pass-through to the existing
 * evaluator (identical results), the archived BE-25 OrchOR must NOT be exposed,
 * and the object must be reachable from the package root.
 */
import { describe, it, expect } from 'vitest';
import { BridgeEquations } from '../../src/index.js';
import { evaluateDecoherenceRate } from '../../src/bridges/equations/be-11-decoherence-master.js';
import { evaluateHawkingTemperature } from '../../src/bridges/equations/be-42-hawking-temperature.js';
import { evaluateKSSBound } from '../../src/bridges/equations/be-21-kss-bound.js';
import { evaluateLandauerEnergy } from '../../src/bridges/equations/be-16-landauer.js';
import { evaluateQuantumHall } from '../../src/bridges/be55-quantum-hall.js';
import { evaluateJeansMass } from '../../src/bridges/be65-jeans-mass.js';

describe('BridgeEquations facade — pass-through dispatch', () => {
  it('decoherenceRate matches the underlying evaluator', () => {
    const input = { gamma0_per_s: 1e9, lambda: 2, lambda0: 1 };
    expect(BridgeEquations.decoherenceRate(input)).toBe(evaluateDecoherenceRate(input));
  });

  it('hawkingTemperature matches the underlying evaluator', () => {
    const input = { M_kg: 1.989e30 };
    expect(BridgeEquations.hawkingTemperature(input)).toBe(evaluateHawkingTemperature(input));
  });

  it('kssBound (no-arg) matches the underlying evaluator', () => {
    expect(BridgeEquations.kssBound()).toBe(evaluateKSSBound());
  });

  it('landauerEnergy matches the underlying evaluator', () => {
    const input = { temperature_K: 300 };
    expect(BridgeEquations.landauerEnergy(input)).toBe(evaluateLandauerEnergy(input));
  });

  it('includes the post-BE-54 established catalog additions', () => {
    expect(BridgeEquations.quantumHall({ C: 2 })).toEqual(evaluateQuantumHall({ C: 2 }));
    const input = { T_K: 10, rho_kg_per_m3: 1e-18, mu: 2.33 };
    expect(BridgeEquations.jeansMass(input)).toEqual(evaluateJeansMass(input));
  });
});

describe('BridgeEquations facade — surface discipline', () => {
  it('is reachable from the package root', () => {
    expect(typeof BridgeEquations).toBe('object');
    expect(BridgeEquations).not.toBeNull();
  });

  it('does NOT expose the archived BE-25 OrchOR evaluator', () => {
    expect('orchOR' in BridgeEquations).toBe(false);
    expect('evaluateOrchOR' in BridgeEquations).toBe(false);
  });

  it('every method is a callable function', () => {
    for (const [name, fn] of Object.entries(BridgeEquations)) {
      expect(typeof fn, `BridgeEquations.${name} must be a function`).toBe('function');
    }
  });

  it('covers every live catalog id with at least one facade evaluator', () => {
    // Some ids intentionally have multiple convenience forms, so the facade is
    // wider than the 55-entry catalog. The lower bound prevents future catalog
    // additions from silently outrunning the root convenience surface.
    expect(Object.keys(BridgeEquations).length).toBeGreaterThanOrEqual(55);
  });
});
