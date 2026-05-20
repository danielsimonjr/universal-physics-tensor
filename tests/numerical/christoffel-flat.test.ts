import { describe, it, expect } from 'vitest';
import { christoffelFnFlat, encodeChristoffelIndex } from '../../src/numerical/christoffel-flat.js';
import { schwarzschildChristoffelFn } from '../fixtures/schwarzschild.js';

const M_SUN = 1.989e30;
const G = 6.67430e-11;
const C = 299792458;
const r_s = (2 * G * M_SUN) / (C * C);

describe('christoffelFnFlat', () => {
  it('returns Float64Array(64)', () => {
    const flat = christoffelFnFlat(M_SUN);
    const arr = flat([0, 3 * r_s, Math.PI / 2, 0]);
    expect(arr).toBeInstanceOf(Float64Array);
    expect(arr.length).toBe(64);
  });

  it('every entry matches schwarzschildChristoffelFn (both flat post-BR-2) within machine epsilon', () => {
    // BR-2 Task 2.9: schwarzschildChristoffelFn now returns Float64Array(64),
    // same layout as christoffelFnFlat. Both should be byte-identical since
    // they use the same formulas and SI constants.
    const fixtureFn = schwarzschildChristoffelFn(M_SUN);
    const flatFn = christoffelFnFlat(M_SUN);
    const x: [number, number, number, number] = [0, 5 * r_s, Math.PI / 3, 0.5];
    const fromFixture = fixtureFn(x);
    const fromFlat = flatFn(x);
    expect(fromFixture).toBeInstanceOf(Float64Array);
    expect(fromFlat).toBeInstanceOf(Float64Array);
    for (let i = 0; i < 64; i++) {
      expect(fromFlat[i]).toBeCloseTo(fromFixture[i], 15);
    }
  });
});
