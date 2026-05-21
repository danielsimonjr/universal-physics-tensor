# UPT Benchmarks

Benchmark suite for `universal-physics-tensor`. Uses [Vitest bench](https://vitest.dev/guide/features.html#benchmarking) (tinybench under the hood, already bundled with Vitest — no extra install).

## Requirements

- **Node ≥ 18** (Vitest 4 bench worker-isolation behavior varies by Node version; `engines` field in `package.json` already enforces this)

## Running

```sh
# Interactive benchmark run (human-readable output)
npm run bench

# CI mode — writes bench/results.json for artifact tracking
npm run bench:ci
```

## Files

| File | Purpose |
|---|---|
| `sanity.bench.ts` | Toolchain validation only. Benchmarks `Math.sqrt` — no UPT imports. Runs even with a broken build. |
| `ad.bench.ts` | Autodiff forward + reverse mode on `fn(x) = x·x`, across shapes `[10] … [100,100]`; `Float64ReferenceEngine` always, `MathTSEngine` when the optional mathts deps are present. |
| `geodesic.bench.ts` | Schwarzschild radial-geodesic RK4 integration (cycloid-radial infall, `M = M_sun`, `r₀ = 100·r_s`) at 1k / 5k / 10k step counts. |
| `be37-eikonal.bench.ts` | BE-37 Shapiro-delay RK4 eikonal evaluator — the 4096-step solar-grazing `evaluateBE37EikonalNumerical` path vs. the covariant `evaluateBE37CovariantEikonalNumerical` path. |
| `be37-step-count-sweep.bench.ts` | BE-37 covariant-eikonal evaluator swept across RK4 step counts (Earth–Mars superior-conjunction geometry) — probes the Shapiro residual-floor vs. step-count trade-off. |
| `null-ic-reconstruction.bench.ts` | PC-1.5 null-IC reconstruction-variance bench: 1000 machine-epsilon-scale perturbations of `g^{tt}` probe whether BE-37's null-IC `Math.sqrt` drives the ~2.5e-4 Shapiro residual floor. |
| `geodesic-conservation.bench.ts` | PC-1.5 conservation diagnostic: Mercury 100-orbit GL4 integration recording max `|ΔE/E|` and max `|ΔL/L|` (conserved-charge drift via Killing-vector contractions). |
| `gl4-mercury-1000step.bench.ts` | BR-2 profiling baseline: GL4 Mercury 1000-step integration, split into full-integrator vs. Christoffel-evaluation-isolated cases to measure the Christoffel share of GL4 wall-time. |

## Philosophy

These benchmarks establish **baselines**, not thresholds. As of v0.6.0 there are still **no threshold gates that fail CI** — performance-regression tracking via threshold gates remains deferred (the benches record baselines for artifact tracking via `bench:ci`, but a regression does not break the build).

## Exclusion from npm tarball

`bench/` is excluded from the published npm tarball. The `files` field in `package.json` whitelists only `dist/`, `README.md`, and `LICENSE`. Verified with `npm pack --dry-run`.
