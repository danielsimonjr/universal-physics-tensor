import { bench, describe } from 'vitest';
import { computeWeylTensor } from '../src/numerical/weyl-lowering.js';

describe('Weyl tensor assembly (Schwarzschild vacuum approx)', () => {
  // Setup inputs similar to what would come out of the curvature pipeline
  // for a vacuum spacetime (Riemann non-zero, Ricci approx 0, R approx 0)
  const N = 4;
  const R = new Array<number[][][]>(N);
  const Ric = new Array<number[]>(N);
  const g = new Float64Array(N * N);
  const gInv = new Float64Array(N * N);

  for (let rho = 0; rho < N; rho++) {
    const arr3 = new Array<number[][]>(N);
    const rowRic = new Array<number>(N);
    for (let sigma = 0; sigma < N; sigma++) {
      const arr2 = new Array<number[]>(N);
      for (let mu = 0; mu < N; mu++) {
        const arr1 = new Array<number>(N);
        for (let nu = 0; nu < N; nu++) {
          arr1[nu] = Math.random() * 0.01; // dummy Riemann data
        }
        arr2[mu] = arr1;
      }
      arr3[sigma] = arr2;
      rowRic[sigma] = 0;
      g[rho * N + sigma] = rho === sigma ? (rho === 0 ? -1 : 1) : 0;
      gInv[rho * N + sigma] = rho === sigma ? (rho === 0 ? -1 : 1) : 0;
    }
    R[rho] = arr3;
    Ric[rho] = rowRic;
  }
  const RS = 0;

  const input = {
    riemann: R,
    ricci: Ric,
    ricciScalar: RS,
    metric: g,
    metricInverse: gInv,
  };

  bench('computeWeylTensor', () => {
    computeWeylTensor(input);
  });
});
