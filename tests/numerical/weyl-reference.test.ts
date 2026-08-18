import { describe, expect, it } from 'vitest';
import { computeWeylTensor } from '../../src/numerical/weyl-lowering.js';

function directWeyl(R: number[][][][], Ric: number[][], RS: number, g: number[][], gi: number[][]): number[][][][] {
  const mixed = Array.from({ length: 4 }, (_, r) => Array.from({ length: 4 }, (_, n) =>
    gi[r].reduce((s, v, a) => s + v * Ric[a][n], 0)));
  return Array.from({ length: 4 }, (_, r) => Array.from({ length: 4 }, (_, s) =>
    Array.from({ length: 4 }, (_, m) => Array.from({ length: 4 }, (_, n) => {
      const drm = r === m ? 1 : 0, drn = r === n ? 1 : 0;
      return R[r][s][m][n]
        - 0.5 * (drm * Ric[s][n] - drn * Ric[s][m] - g[s][m] * mixed[r][n] + g[s][n] * mixed[r][m])
        + (RS / 6) * (drm * g[s][n] - drn * g[s][m]);
    }))));
}

describe('computeWeylTensor — independent formula oracle', () => {
  it('matches the unfactored textbook formula on a dense deterministic fixture', () => {
    const g = [
      [-2, 0.1, 0.2, 0], [0.1, 1.5, 0.05, 0.1], [0.2, 0.05, 2, -0.1], [0, 0.1, -0.1, 1.2],
    ];
    // Numerically precomputed inverse of g (fixture is intentionally dense/non-diagonal).
    const gi = [
      [-0.496787315, 0.028350331, 0.050322224, 0.001833675],
      [0.028350331, 0.672168585, -0.014471769, -0.057180836],
      [0.050322224, -0.014471769, 0.497677304, 0.042659923],
      [0.001833675, -0.057180836, 0.042659923, 0.841052301],
    ];
    const Ric = Array.from({ length: 4 }, (_, i) => Array.from({ length: 4 }, (_, j) => ((i + 2) * (j + 3) - 7) / 17));
    const R = Array.from({ length: 4 }, (_, r) => Array.from({ length: 4 }, (_, s) =>
      Array.from({ length: 4 }, (_, m) => Array.from({ length: 4 }, (_, n) => ((r + 1) * 31 + (s + 2) * 17 + (m + 3) * 7 - (n + 4) * 11) / 101))));
    const RS = -0.3725;
    const expected = directWeyl(R, Ric, RS, g, gi);
    const actual = computeWeylTensor({ riemann: R, ricci: Ric, ricciScalar: RS, metric: g, metricInverse: gi });
    for (let r = 0; r < 4; r++) for (let s = 0; s < 4; s++) for (let m = 0; m < 4; m++) for (let n = 0; n < 4; n++) {
      expect(actual[r][s][m][n]).toBeCloseTo(expected[r][s][m][n], 13);
    }
  });
});
