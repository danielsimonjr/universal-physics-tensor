/**
 * Cheap structure probes: regime changepoint, scale symmetry, conserved dQ/dt.
 *
 * Task-0 style: recover a synthetic signal or honestly abstain. Never flips
 * `axes.ts` `gated`.
 *
 * @internal
 */

export interface ChangepointInput {
  readonly x: readonly number[];
  readonly y: readonly number[];
}

export interface ChangepointResult {
  readonly index: number | null;
  readonly score: number;
  readonly abstained: boolean;
  readonly reason?: string;
}

/**
 * Two-mean changepoint: scan split index maximizing |μ_left − μ_right|.
 * Abstains on short series or when the best split is weaker than `minScore`.
 *
 * @internal
 */
export function detectMeanChangepoint(
  input: ChangepointInput,
  minScore = 0.5,
): ChangepointResult {
  const { x, y } = input;
  if (x.length !== y.length || x.length < 6) {
    return { index: null, score: 0, abstained: true, reason: 'series too short' };
  }
  let bestIdx = 1;
  let best = 0;
  for (let i = 2; i < y.length - 2; i++) {
    const left = y.slice(0, i);
    const right = y.slice(i);
    const μL = left.reduce((a, b) => a + b, 0) / left.length;
    const μR = right.reduce((a, b) => a + b, 0) / right.length;
    const score = Math.abs(μL - μR);
    if (score > best) {
      best = score;
      bestIdx = i;
    }
  }
  if (best < minScore) {
    return { index: null, score: best, abstained: true, reason: 'no changepoint above threshold' };
  }
  return { index: bestIdx, score: best, abstained: false };
}

export interface ScaleSymmetryInput {
  readonly x: readonly number[];
  readonly y: readonly number[];
}

/**
 * Ordinary-least-squares log-log slope. Abstains if x or y are non-positive.
 *
 * @internal
 */
export function estimateScaleExponent(input: ScaleSymmetryInput): {
  exponent: number | null;
  abstained: boolean;
  reason?: string;
} {
  const pairs = input.x
    .map((x, i) => [x, input.y[i]!] as const)
    .filter(([x, y]) => x > 0 && y > 0);
  if (pairs.length < 3) {
    return { exponent: null, abstained: true, reason: 'need ≥3 positive (x,y) pairs' };
  }
  const n = pairs.length;
  let sX = 0;
  let sY = 0;
  let sXX = 0;
  let sXY = 0;
  for (const [x, y] of pairs) {
    const lx = Math.log(x);
    const ly = Math.log(y);
    sX += lx;
    sY += ly;
    sXX += lx * lx;
    sXY += lx * ly;
  }
  const denom = n * sXX - sX * sX;
  if (Math.abs(denom) < 1e-18) {
    return { exponent: null, abstained: true, reason: 'degenerate log-x variance' };
  }
  return { exponent: (n * sXY - sX * sY) / denom, abstained: false };
}

/**
 * Finite-difference conservation probe: mean |ΔQ/Δt| ≈ 0.
 *
 * @internal
 */
export function probeConservation(
  q: readonly number[],
  t: readonly number[],
  atol = 1e-6,
): { conserved: boolean; meanAbsRate: number; abstained: boolean; reason?: string } {
  if (q.length !== t.length || q.length < 2) {
    return { conserved: false, meanAbsRate: NaN, abstained: true, reason: 'need ≥2 samples' };
  }
  let acc = 0;
  let n = 0;
  for (let i = 1; i < q.length; i++) {
    const dt = t[i]! - t[i - 1]!;
    if (dt === 0) continue;
    acc += Math.abs((q[i]! - q[i - 1]!) / dt);
    n += 1;
  }
  if (n === 0) {
    return { conserved: false, meanAbsRate: NaN, abstained: true, reason: 'zero Δt' };
  }
  const meanAbsRate = acc / n;
  return { conserved: meanAbsRate <= atol, meanAbsRate, abstained: false };
}
