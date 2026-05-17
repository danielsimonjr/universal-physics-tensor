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

## Philosophy

These benchmarks establish **baselines**, not thresholds. No gates fail CI in v0.4.5. Threshold-gated performance regression is deferred to v0.5.0 scope.

## Exclusion from npm tarball

`bench/` is excluded from the published npm tarball. The `files` field in `package.json` whitelists only `dist/`, `README.md`, and `LICENSE`. Verified with `npm pack --dry-run`.
