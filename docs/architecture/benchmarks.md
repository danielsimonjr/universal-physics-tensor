# UPT Performance Benchmarks

This file records AD benchmark baselines established in v0.4.5. These are
baselines for regression detection starting in v0.5.0 — no threshold gates
exist in v0.4.5.

## Measurement notes

- Runner: `vitest bench` v4.1.4 (tinybench), Node 18+, Windows 11
- Machine: Daniel's dev box (platform-specific; not a cloud CI machine)
- Bench discipline: tensors pre-built outside the bench callback (F4 — measures
  AD cost only, not allocator/GC cost)
- `fromNested` is sync on `Float64ReferenceEngine`; no await overhead in setup
- `forwardGrad` / `reverseGrad` are async per v0.4.0 contract — Promise
  wrapper overhead is included in the measurement (no internal sync path
  is exposed on the public API)
- vitest 4.1.4 verbose reporter does not display per-bench hz tables for async
  bench callbacks (only the BENCH Summary with relative comparisons is shown).
  Absolute hz values are not captured in this baseline.
- MathTSEngine: optional dep (`@danielsimonjr/mathts-tensor` +
  `@danielsimonjr/mathts-autograd`) not installed on this machine — skipped
  gracefully with `[bench/ad] MathTSEngine unavailable` warning.

## v0.4.5 AD baseline — `fn(x) = x*x`, Float64ReferenceEngine

Run date: 2026-05-17  
Function: element-wise self-multiplication (`engine.mul(t, t)`)  
Engine: `Float64ReferenceEngine` (always present)  
MathTSEngine: skipped (optional dep absent)

### Relative performance (from BENCH Summary, two representative runs)

| Shape | Elements | Forward mode | Reverse mode | Rev/Fwd speedup |
|-------|----------|--------------|--------------|-----------------|
| `[10]` | 10 | slower | faster | ~5x |
| `[100]` | 100 | slower | faster | ~70x |
| `[10, 10]` | 100 | slower | faster | ~70x |
| `[100, 100]` | 10 000 | slower | faster | ~8 000–14 000x |

**Interpretation:** Reverse-mode shows dramatically higher throughput than
forward-mode at large tensor sizes in `Float64ReferenceEngine`. This is
expected: the reverse-mode pass only traverses the tape once, while the
forward-mode dual-number path pays per-element tangent propagation cost on
every operation. At `[100, 100]` (10 000 elements), the per-element tangent
cost in forward mode dominates the async wrapper overhead, making the
reverse-mode speedup appear very large in the BENCH Summary ratios. These
ratios are not a tuning signal — both modes are naive O(n) implementations
and the ratios are a property of the dual-number vs. tape traversal costs at
this scale.

**Absolute hz values:** not captured in this baseline (vitest 4.1.4 async
bench limitation — see measurement notes above). The BENCH Summary provides
relative comparisons only. Absolute measurements can be captured by switching
to a sync bench wrapper or upgrading to a vitest version that reports async
bench hz tables.

### MathTSEngine

Not measured — optional dependency absent. The skip path prints:

```
[bench/ad] MathTSEngine unavailable — skipping MathTS AD benchmarks.
```

MathTS benches will appear in this table once the optional dep is installed.

---

## v0.4.5 BE-37 Shapiro RK4 baseline — `bench/be37-eikonal.bench.ts`

Run date: 2026-05-17  
Machine: Daniel's dev box (Windows 11, vitest bench v4.1.4 tinybench)  
Physical scenario: solar grazing ray — M_sun = 1.989e30 kg, R_near = 1.0e9 m, R_far = 1.5e11 m (~1 AU)

**F1 note:** Two functions are benched:

1. `evaluateBE37EikonalNumerical` (`src/bridges/equations/be-37-shapiro-delay.ts`) — the actual
   RK4 Shapiro-delay evaluator (4096 fixed steps, no arguments, scenario hardcoded internally).
   This is the primary AST→lowering→engine roundtrip baseline.

2. `evaluateBE37CovariantEikonalNumerical` (`src/numerical/be37-covariant-eikonal.ts`) — the
   v0.4.0 structural preview. Returns `eikonalResidual=0` by construction (null-ray identity),
   `shapiroDelaySec=0` (stub). No RK4 inside. Benched as a stub baseline: when v0.5.0 wires
   `integrateGeodesic` through this path, this bench will show a step-change in cost.

### Results (hz tables available — sync-like throughput for both async benches)

| Benchmark | hz | mean (ms) | p75 (ms) | p99 (ms) | rme | samples |
|---|---|---|---|---|---|---|
| `evaluateBE37EikonalNumerical` (4096 RK4 steps) | **813** | 1.23 | 1.31 | 3.79 | ±4.62% | 407 |
| `evaluateBE37CovariantEikonalNumerical` (stub, no RK4) | **762 074** | 0.0013 | 0.0012 | 0.0022 | ±2.96% | 381 037 |

**Interpretation:**

- The RK4 evaluator runs at ~813 hz (1.2 ms/call mean), dominated by 4096 × 4 = 16 384 derivative
  evaluations per call. This is the baseline for v0.5.0 symplectic integrator comparison.
- The structural-preview evaluator runs at ~762 000 hz (1.3 µs/call mean), measuring only async
  wrapper + three guard checks. The ~940× speedup vs. the RK4 path is consistent with the absence
  of any numerical integration.
- F11 benchmarkTimeout raised to 30 000 ms (per-bench). Default 10s is insufficient for 10k-step
  RK4 paths planned in v0.5.0.
- MathTSEngine: not applicable — BE-37 uses a direct RK4 loop, not the TensorEngine path.

### BENCH Summary (from vitest output)

```
BE-37 Shapiro delay — RK4 numerical integration (primary baseline):
  evaluateBE37EikonalNumerical (4096 RK4 steps, solar grazing)
  813 hz | mean 1.2297 ms | p99 3.7886 ms | ±4.62% | 407 samples

BE-37 covariant eikonal — v0.4.0 structural preview (stub baseline):
  evaluateBE37CovariantEikonalNumerical (structural preview, eikonalResidual=0 stub)
  762 073 hz | mean 0.0013 ms | p99 0.0022 ms | ±2.96% | 381 037 samples
```
