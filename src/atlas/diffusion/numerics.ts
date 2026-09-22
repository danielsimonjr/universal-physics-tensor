/**
 * Atlas Phase 4, S4.4 — the numerics behind the diffusion family's witnesses.
 *
 * Each function evaluates one claim at a RESOLUTION, so the numeric witness
 * runner can evaluate it twice and record how the error shrank. None of them
 * asserts an order of convergence; the runner reports the ratio and a reviewer
 * reads it (Phase 4 design note §2.3).
 *
 * @module atlas/diffusion/numerics
 */

/**
 * The Gaussian solution of `∂c/∂t = D ∂²c/∂x²` from a point source of unit
 * mass, evaluated at `x`: `(4πDt)^{-1/2} exp(−x²/(4Dt))`.
 *
 * @internal
 */
export function diffusionKernel(x: number, t: number, D: number): number {
  return Math.exp(-(x * x) / (4 * D * t)) / Math.sqrt(4 * Math.PI * D * t);
}

/** `ln C(n, k)` by summing logs — exact enough for the n ≤ 10⁵ used here. */
function logBinomial(n: number, k: number): number {
  let s = 0;
  for (let i = 1; i <= k; i++) s += Math.log(n - k + i) - Math.log(i);
  return s;
}

/**
 * WD1 — the probability DENSITY at the origin of a symmetric lattice random
 * walk after `steps` steps, under the closure `D = Δx²/(2Δt)` at fixed `D`
 * and `t`.
 *
 * With `Δt = t/steps` and `Δx = √(2DΔt)`, the walker sits at the origin with
 * probability `C(steps, steps/2)/2^steps`. Only every other site is reachable
 * after an even number of steps, so the probability is spread over a cell of
 * width `2Δx`, and the density is that probability divided by `2Δx`.
 * As `steps → ∞` it converges to {@link diffusionKernel}`(0, t, D)`.
 *
 * @param steps - the resolution; rounded up to the next even integer.
 * @internal
 */
export function randomWalkCentralDensity(steps: number, D: number, t: number): number {
  const n = 2 * Math.ceil(steps / 2);
  const dt = t / n;
  const dx = Math.sqrt(2 * D * dt);
  const logP = logBinomial(n, n / 2) - n * Math.LN2;
  return Math.exp(logP) / (2 * dx);
}

/**
 * WD1b — the random walk's density at lattice site `site` after `steps` steps
 * (same closure and grid as {@link randomWalkCentralDensity}). Exactly zero
 * outside the light cone `|site| > steps` and on sites of the wrong parity.
 *
 * @internal
 */
export function randomWalkDensity(site: number, steps: number, D: number, t: number): number {
  const n = 2 * Math.ceil(steps / 2);
  if (Math.abs(site) > n || (site + n) % 2 !== 0) return 0;
  const dx = Math.sqrt((2 * D * t) / n);
  const k = (n + site) / 2;
  return Math.exp(logBinomial(n, k) - n * Math.LN2) / (2 * dx);
}

/** Parameters of the WD2 heat-conduction fixture. @internal */
export interface HeatFixture {
  /** Thermal conductivity κ. */
  readonly kappa: number;
  /** Density ρ. */
  readonly rho: number;
  /** Specific heat capacity c_p. */
  readonly cp: number;
  /** Initial Gaussian width parameter: `T(x, 0) = exp(−x²/(4 s0))`. */
  readonly s0: number;
  /** Final time. */
  readonly tEnd: number;
  /**
   * Half-width of the domain. The edges are held at ZERO, not at the exact
   * solution: the exact solution is the Fick side of the claim, and feeding it
   * to the heat solver would leak the dictionary under test into the side that
   * is supposed to be independent of it. The true edge value is below
   * `exp(−halfWidth²/(4(s0 + D tEnd)))`, far under the tolerance.
   */
  readonly halfWidth: number;
}

/**
 * The exact solution of the DIFFUSION equation with coefficient `D` from the
 * WD2 initial condition: `√(s0/(s0 + D t)) · exp(−x²/(4(s0 + D t)))`.
 *
 * @internal
 */
export function gaussianSpread(x: number, t: number, D: number, s0: number): number {
  const s = s0 + D * t;
  return Math.sqrt(s0 / s) * Math.exp(-(x * x) / (4 * s));
}

/**
 * WD2 — the temperature at `x = 0, t = tEnd` from an explicit FTCS solution of
 * the HEAT equation `ρ c_p ∂T/∂t = κ ∂²T/∂x²` on `cells` intervals.
 *
 * The heat equation is solved in its OWN variables: the step uses `κ`, `ρ` and
 * `c_p`, never a pre-combined `D`. Comparing the result against
 * {@link gaussianSpread} with `D = κ/(ρ c_p)` is what tests the dictionary.
 * The mesh ratio `κΔt/(ρ c_p Δx²)` is held at or below 1/4, inside the FTCS
 * stability limit of 1/2, so refinement halves `Δx` and quarters `Δt`.
 *
 * @param cells - the resolution: the number of spatial intervals (made even so
 * `x = 0` is a node).
 * @internal
 */
export function heatFtcsCentre(cells: number, f: HeatFixture): number {
  const nx = 2 * Math.ceil(cells / 2);
  const dx = (2 * f.halfWidth) / nx;
  const capacity = f.rho * f.cp;
  const dtMax = (0.25 * capacity * dx * dx) / f.kappa;
  const steps = Math.ceil(f.tEnd / dtMax);
  const dt = f.tEnd / steps;
  const r = (f.kappa * dt) / (capacity * dx * dx);

  let u = new Float64Array(nx + 1);
  let next = new Float64Array(nx + 1);
  // The initial condition exp(−x²/(4 s0)) involves no diffusivity at all.
  for (let i = 0; i <= nx; i++) {
    const x = -f.halfWidth + i * dx;
    u[i] = Math.exp(-(x * x) / (4 * f.s0));
  }
  u[0] = 0;
  u[nx] = 0;
  for (let n = 1; n <= steps; n++) {
    for (let i = 1; i < nx; i++) {
      next[i] = u[i]! + r * (u[i + 1]! - 2 * u[i]! + u[i - 1]!);
    }
    next[0] = 0;
    next[nx] = 0;
    [u, next] = [next, u];
  }
  return u[nx / 2]!;
}

/** Parameters of the WD3 Wick-rotation fixture. @internal */
export interface WickFixture {
  readonly hbar: number;
  readonly m: number;
  /** Initial width of the α = 0 Gaussian. */
  readonly s: number;
  /** The point `(x, τ)` the residual is evaluated at. */
  readonly x: number;
  readonly tau: number;
  /** Base finite-difference step; the resolution divides it. */
  readonly h0: number;
}

/**
 * WD3 — the finite-difference residual `|∂_τ φ − (ħ/2m) ∂²_x φ|` of the
 * Wick-rotated free kernel `φ(x, τ)` (`witnesses/quantum-support.ts`, W5) at
 * one point, with step `h = h0/resolution` in both variables.
 *
 * The residual measures whether the Wick rotation `t = −iτ` of the free
 * Schrödinger equation really lands on the DIFFUSION equation with
 * `D = ħ/(2m)`. Its exact value is zero; the finite-difference estimate
 * approaches zero as `h` shrinks, and the runner records how fast.
 *
 * @internal
 */
export function wickHeatResidual(
  resolution: number,
  f: WickFixture,
  kernel: (x: number, tau: number, s: number, hbar: number, m: number) => number,
): number {
  const h = f.h0 / resolution;
  const phi = (x: number, tau: number): number => kernel(x, tau, f.s, f.hbar, f.m);
  const dTau = (phi(f.x, f.tau + h) - phi(f.x, f.tau - h)) / (2 * h);
  const dXX = (phi(f.x + h, f.tau) - 2 * phi(f.x, f.tau) + phi(f.x - h, f.tau)) / (h * h);
  return Math.abs(dTau - (f.hbar / (2 * f.m)) * dXX);
}

/**
 * WD3b — `∫ φ(x, τ)² dx` of the Wick-rotated free kernel, by the trapezoid
 * rule over `[−halfWidth, halfWidth]`. The Schrödinger norm `∫|ψ|² dx` is
 * conserved; this one DECAYS with τ, which is the unitarity the continuation
 * does not preserve.
 *
 * @internal
 */
export function wickKernelSquaredNorm(
  tau: number,
  f: WickFixture,
  kernel: (x: number, tau: number, s: number, hbar: number, m: number) => number,
  halfWidth = 20,
  cells = 4000,
): number {
  const dx = (2 * halfWidth) / cells;
  let sum = 0;
  for (let i = 0; i <= cells; i++) {
    const v = kernel(-halfWidth + i * dx, tau, f.s, f.hbar, f.m);
    sum += (i === 0 || i === cells ? 0.5 : 1) * v * v;
  }
  return sum * dx;
}
