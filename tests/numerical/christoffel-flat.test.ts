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

  it('every entry matches nested-form within machine epsilon', () => {
    const nestedFn = schwarzschildChristoffelFn(M_SUN);
    const flatFn = christoffelFnFlat(M_SUN);
    const x: [number, number, number, number] = [0, 5 * r_s, Math.PI / 3, 0.5];
    const nested = nestedFn(x);
    const flat = flatFn(x);
    for (let lam = 0; lam < 4; lam++) {
      for (let mu = 0; mu < 4; mu++) {
        for (let nu = 0; nu < 4; nu++) {
          const idx = encodeChristoffelIndex(lam, mu, nu);
          expect(flat[idx]).toBeCloseTo(nested[lam][mu][nu], 15);
        }
      }
    }
  });
});
