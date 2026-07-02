/**
 * Tests for `src/dimensional/validator-registry.ts` — the pattern-A/B/C
 * dispatch registry extracted from `validator.ts`'s `infer()` switch
 * (v0.6.1 Phase 2).
 *
 * Scope: this file pins the REGISTRY machinery itself (lookup, dispatch,
 * propagation-flag), not the per-kind validator correctness — that is
 * already covered by the dedicated `tests/dimensional/{riemann-tensor,
 * ricci,curvature-invariants,...}.test.ts` files. One fixture per pattern
 * (A: riemann-tensor, B: ricci-tensor, C: kretschmann-scalar) is enough to
 * prove the registry wires the callback correctly; the expected numeric
 * results below are taken directly from those dedicated test files so the
 * fixtures double as a cross-check that dispatch produces the same output
 * as calling the validator directly.
 *
 * @module tests/dimensional/validator-registry
 */
import { describe, it, expect } from 'vitest';
import {
  lookupValidatorEntry,
  dispatchValidator,
  shouldPropagateFreeIndices,
} from '../../src/dimensional/validator-registry.js';
import type { RiemannTensorNode } from '../../src/dimensional/connection-validators.js';
import type { RicciTensorNode } from '../../src/dimensional/curvature.js';
import type { KretschmannScalarNode } from '../../src/dimensional/curvature-invariants.js';
import type { MetricTensorNode } from '../../src/dimensional/metric-validators.js';

const DIMENSIONLESS = { L: 0, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 } as const;
const L_NEG2 = { L: -2, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 };
const L_NEG4 = { L: -4, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 };

/** Minimal valid RiemannTensorNode — same shape as tests/dimensional/curvature-invariants.test.ts's makeRiemann(). */
function makeRiemann(): RiemannTensorNode {
  return {
    kind: 'riemann-tensor',
    upperIndex: { label: 'rho', variance: 'upper' },
    lowerIndices: [
      { label: 'sigma', variance: 'lower' },
      { label: 'mu', variance: 'lower' },
      { label: 'nu', variance: 'lower' },
    ],
    gLower: {
      kind: 'metric-tensor',
      name: 'g',
      indices: [{ label: 'a', variance: 'lower' }, { label: 'b', variance: 'lower' }],
      signature: '-,+,+,+',
      dim: DIMENSIONLESS,
    },
    gInverse: {
      kind: 'metric-tensor',
      name: 'g_inv',
      indices: [{ label: 'c', variance: 'upper' }, { label: 'd', variance: 'upper' }],
      signature: '-,+,+,+',
      dim: DIMENSIONLESS,
    },
    xCoord: {
      kind: 'tensor-symbol',
      name: 'x',
      indices: [{ label: 'e', variance: 'upper' }],
      dim: { L: 1, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 },
    },
  };
}

describe('lookupValidatorEntry', () => {
  it('tags the 5 pattern-A kinds correctly', () => {
    for (const kind of [
      'riemann-tensor', 'killing-vector', 'stress-energy', 'einstein-equation', 'weyl-tensor',
    ]) {
      expect(lookupValidatorEntry(kind)?.pattern).toBe('A');
    }
  });

  it('tags the 3 pattern-B kinds correctly', () => {
    for (const kind of ['ricci-tensor', 'einstein-tensor', 'bianchi-residual']) {
      expect(lookupValidatorEntry(kind)?.pattern).toBe('B');
    }
  });

  it('tags the 3 pattern-C kinds correctly', () => {
    for (const kind of ['conserved-charge', 'cosmological-constant', 'kretschmann-scalar']) {
      expect(lookupValidatorEntry(kind)?.pattern).toBe('C');
    }
  });

  it('returns undefined for a kind outside the 11-kind registry', () => {
    expect(lookupValidatorEntry('op')).toBeUndefined();
    expect(lookupValidatorEntry('not-a-real-kind')).toBeUndefined();
  });
});

describe('dispatchValidator', () => {
  it('pattern A (riemann-tensor): dispatches with the raw node, no callback — dim L⁻² and 4 free indices', () => {
    const entry = lookupValidatorEntry('riemann-tensor')!;
    const result = dispatchValidator(entry, makeRiemann());
    expect(result.dim).toEqual(L_NEG2);
    expect(result.freeIndices.size).toBe(4);
    expect(result.freeIndices.get('rho')).toEqual({ upper: 1, lower: 0 });
    expect(result.freeIndices.get('sigma')).toEqual({ upper: 0, lower: 1 });
  });

  it('pattern B (ricci-tensor): injects the riemann-child callback and contracts to 2 free indices, dim L⁻²', () => {
    const entry = lookupValidatorEntry('ricci-tensor')!;
    const node: RicciTensorNode = { kind: 'ricci-tensor', riemann: makeRiemann() };
    const result = dispatchValidator(entry, node);
    expect(result.dim).toEqual(L_NEG2);
    expect(result.freeIndices.size).toBe(2);
    // Per Carroll Eq. 3.91 (R_μν = R^λ_{μλν}): sigma/nu survive, rho/mu are dummied.
    expect(result.freeIndices.get('sigma')).toEqual({ upper: 0, lower: 1 });
    expect(result.freeIndices.get('nu')).toEqual({ upper: 0, lower: 1 });
    expect(result.freeIndices.has('rho')).toBe(false);
    expect(result.freeIndices.has('mu')).toBe(false);
  });

  it('pattern B: the injected callback re-validates the embedded Riemann — throws on a malformed child', () => {
    const entry = lookupValidatorEntry('ricci-tensor')!;
    const badRiemann: RiemannTensorNode = {
      ...makeRiemann(),
      upperIndex: { label: 'rho', variance: 'lower' as never }, // WRONG — must be 'upper'
    };
    const node: RicciTensorNode = { kind: 'ricci-tensor', riemann: badRiemann };
    expect(() => dispatchValidator(entry, node)).toThrow();
  });

  it('pattern C (kretschmann-scalar): dispatches with the raw node — scalar result (empty freeIndices), dim L⁻⁴', () => {
    const entry = lookupValidatorEntry('kretschmann-scalar')!;
    const metricNode: MetricTensorNode = {
      kind: 'metric-tensor',
      name: 'g',
      indices: [{ label: 'p', variance: 'lower' }, { label: 'q', variance: 'lower' }],
      signature: '-,+,+,+',
      dim: DIMENSIONLESS,
    };
    const node: KretschmannScalarNode = { kind: 'kretschmann-scalar', riemann: makeRiemann(), metric: metricNode };
    const result = dispatchValidator(entry, node);
    expect(result.dim).toEqual(L_NEG4);
    expect(result.freeIndices.size).toBe(0);
  });

  it('throws when handed an entry with an unrecognized pattern tag (exhaustiveness guard)', () => {
    const bogusEntry = { pattern: 'D', validator: () => ({ dim: DIMENSIONLESS, freeIndices: new Map() }) };
    expect(() => dispatchValidator(bogusEntry as never, makeRiemann())).toThrow(
      /validator-registry: unknown pattern/,
    );
  });
});

describe('shouldPropagateFreeIndices', () => {
  it('is true for pattern-A and pattern-B entries', () => {
    expect(shouldPropagateFreeIndices(lookupValidatorEntry('riemann-tensor')!)).toBe(true);
    expect(shouldPropagateFreeIndices(lookupValidatorEntry('killing-vector')!)).toBe(true);
    expect(shouldPropagateFreeIndices(lookupValidatorEntry('ricci-tensor')!)).toBe(true);
    expect(shouldPropagateFreeIndices(lookupValidatorEntry('bianchi-residual')!)).toBe(true);
  });

  it('is false for pattern-C entries (scalar result — merge loop is a no-op)', () => {
    expect(shouldPropagateFreeIndices(lookupValidatorEntry('kretschmann-scalar')!)).toBe(false);
    expect(shouldPropagateFreeIndices(lookupValidatorEntry('conserved-charge')!)).toBe(false);
    expect(shouldPropagateFreeIndices(lookupValidatorEntry('cosmological-constant')!)).toBe(false);
  });
});
