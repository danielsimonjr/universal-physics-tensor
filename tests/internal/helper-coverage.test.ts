import { describe, expect, it } from 'vitest';
import { DIMENSIONLESS, FREQUENCY, LENGTH, MASS, TIME } from '../../src/dimensional/types.js';
import { sym } from '../../src/dimensional/ast-builders.js';
import { op, pow, l1 } from '../../src/canonical/entries/_l1-build.js';
import { parseDiscoveryOpts } from '../../src/cli/commands/_discovery-opts.js';
import { BE18_SYMBOLIC, BE20_SYMBOLIC, BE33_HERTZ_MILLIS_SYMBOLIC, isFin } from '../../src/composition/edges/_catalog-helpers.js';
import { ENERGY_DIM, FREQUENCY_DIM, MASS_DENSITY, T_INV2 } from '../../src/composition/quantities/_dims.js';
import { evalExpr } from '../../src/composition/expr-eval.js';

describe('internal shared helpers', () => {
  it('_l1-build derives dimensional fields instead of trusting hand-entered metadata', () => {
    const target = { name: 'speed', dim: { L: 1, M: 0, T: -1, I: 0, Theta: 0, N: 0, J: 0 } };
    const governing = [
      { name: 'length', dim: LENGTH },
      { name: 'time', dim: TIME },
    ] as const;
    const scalarAst = op('/', [sym('length', LENGTH), sym('time', TIME)]);
    const entry = l1(target, governing, {
      id: 'CE-test-speed', name: 'test speed', domain: 'mechanics', formula_latex: 'v=L/t',
      epistemicStatus: 'fully-quantitative', scalarAst, regime: { scale: 'classical' },
      assumptions: [], references: [], partnerBridges: [],
    });
    expect(entry.dimensional.monomial).toEqual({ length: 1, time: -1 });
    expect(entry.freeDimensionlessGroups).toBe(0);
    expect(pow(sym('length', LENGTH), '2')).toEqual({
      kind: 'op', op: '^', args: [sym('length', LENGTH), sym('2', DIMENSIONLESS)],
    });
  });

  it('_discovery-opts parses repeated anchors and validates numeric thresholds', () => {
    const flags = new Map<string, string[]>([
      ['max-orders', ['3.5']],
      ['anchor', ['c=299792458,G=6.6743e-11', 'M=1.989e30']],
    ]);
    expect(parseDiscoveryOpts(flags)).toEqual({
      maxOrdersOfMagnitude: 3.5,
      groundTruth: { c: 299792458, G: 6.6743e-11, M: 1.989e30 },
    });
    expect(() => parseDiscoveryOpts(new Map([['max-orders', ['NaN']]]))).toThrow(/non-negative finite/);
    expect(() => parseDiscoveryOpts(new Map([['anchor', ['broken']]]))).toThrow(/expects k=v/);
  });

  it('_catalog-helpers symbolic forms evaluate to their documented algebra', () => {
    expect(isFin(1)).toBe(true);
    expect(isFin(Number.NaN)).toBe(false);
    expect(evalExpr(BE18_SYMBOLIC, { 'yukawa-coupling': 0.2, 'vacuum-expectation-value': 246 })).toBeCloseTo(49.2);
    expect(evalExpr(BE20_SYMBOLIC, { c: 3, 'cosmological-constant-curvature': 2, '8pi': 8 * Math.PI, G: 4 }))
      .toBeCloseTo((9 * 2) / (8 * Math.PI * 4));
    expect(evalExpr(BE33_HERTZ_MILLIS_SYMBOLIC, {
      'reference-correlation-length': 2, temperature: 4, 'reference-temperature': 1, 'dynamic-exponent-z': 2,
    })).toBeCloseTo(1);
  });

  it('_dims aliases match canonical SI-dimension definitions', () => {
    expect(FREQUENCY_DIM).toEqual(FREQUENCY);
    expect(ENERGY_DIM).toEqual({ L: 2, M: 1, T: -2, I: 0, Theta: 0, N: 0, J: 0 });
    expect(MASS_DENSITY).toEqual({ L: -3, M: 1, T: 0, I: 0, Theta: 0, N: 0, J: 0 });
    expect(T_INV2).toEqual({ L: 0, M: 0, T: -2, I: 0, Theta: 0, N: 0, J: 0 });
    expect(MASS).not.toEqual(ENERGY_DIM);
  });
});
