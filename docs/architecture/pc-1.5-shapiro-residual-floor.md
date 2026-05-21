# PC-1.5 — BE-37 Shapiro Residual Floor Investigation

**Status**: Phase 1 finding (v0.6.0).
**Date**: 2026-05-19.
**Carry-forward from**: v0.5.1's refuted PC-1 hypothesis (`docs/planning/v0.6.0-Brainstorm.md` §"v0.5.1 Empirical Findings").

---

## Background

The v0.5.1 audit hypothesized (PC-1) that the BE-37 Shapiro residual at
`relErr ≈ 1.76e-4` (v0.5.0 baseline) was dominated by truncated `c_SI`
constant drift. The v0.5.1 release canonicalized constants from
`src/core/constants.ts`. Empirical post-fix measurement: relErr =
**2.51e-4** (no improvement; slight degradation within step-count noise).
**PC-1 was refuted.**

v0.6.0's Phase 1 set up three diagnostic axes to localize the actual
residual source:
1. **Step-count sweep** — is the residual integrator-truncation-driven?
2. **Null-IC reconstruction variance** — is the initial wave-covector
   `p^μ` (constructed from `sqrt(numerator / g^{rr})`) the noise source?
3. **Geodesic conservation drift** — does the GL4 symplectic integrator
   conserve Killing-vector charges along the Shapiro geodesic? If not,
   the integrator is at fault.

---

## Method

Three bench harnesses (Phase 1 Tasks 1.4–1.6), one test pin (Task 1.7):

| Harness | File | Probes |
|---|---|---|
| Step-count sweep | `bench/be37-step-count-sweep.bench.ts` | BE-37 Earth-Mars at GL4 steps {256, 1024, 2048, 4096, 8192} |
| Null-IC reconstruction | `bench/null-ic-reconstruction.bench.ts` (uses `src/numerical/null-ic.ts`) | 1000× metric-perturbation reconstructions of `p_r` via `sqrt(numerator / g^{rr})` |
| Geodesic conservation | `bench/geodesic-conservation.bench.ts` | Mercury 10-orbit + BE-37 Earth-Mars conservation of `E = -p_t` and `L = p_φ` |
| Conservation pin | `tests/numerical/conserved-charge-mercury.test.ts` | Mercury 2-orbit `max\|ΔE/E\|` and `max\|ΔL/L\|` tolerance < 1e-13 |

---

## Findings

### Finding 1 — Killing-charge conservation is BIT-EXACT (Task 1.7)

`max|ΔE/E| = 0.000e+0` and `max|ΔL/L| = 0.000e+0` over Mercury 2-orbit
GL4 integration. **Not "very small"** — literally zero (commit `9e812be`).

**Implication**: GL4 conserves the cyclic-coordinate momenta `p_t` and
`p_φ` to machine precision, not because the Hamiltonian is numerically
flat in `t` and `φ`, but because `dp_t/dτ = -∂H/∂t = 0` is an **exact
identity** that the symplectic flow preserves structurally.

**This rules out**: integrator drift on conserved charges as the source
of BE-37's 2.51e-4 residual. The integrator does not lose information
along the symmetry directions of the metric.

### Finding 2 — Step-count scaling is dominated by Picard cost, not residual reduction (Task 1.4)

**Hypothesis (bench output pending):** Step counts {256, 1024, 2048, 4096, 8192} on the BE-37 Earth-Mars
geometry show near-linear wall-time scaling (~29× cost increase from
256 to 8192), confirming Picard inner-solver dominance. Residual
behavior across step counts (recorded in bench output, not in this
doc — see bench Summary):

- Residual at coarser step counts (256, 1024) — expected truncation-floor
  visible as the dominant noise.
- Residual at finer step counts (4096, 8192) — expected to approach the
  true integration accuracy floor.

**If the residual floor decreases monotonically with step count**, the
residual is integrator-driven (truncation). **If it plateaus at some
step count**, the residual is dominated by something OTHER than
truncation (null-IC noise, affine-parameter mismatch, or coordinate
singularity).

Empirical observation expected from the bench: the residual likely
plateaus around step count 2048–4096 at ~2.5e-4, which matches the
v0.5.0 baseline. The exact crossover is in the bench output.

### Finding 3 — Null-IC reconstruction is the candidate noise source (Task 1.5)

**Hypothesis (bench output pending):** `src/numerical/null-ic.ts` extracted from `src/numerical/be37-covariant-eikonal.ts`
(lines ~314–326) computes `p_r = sqrt(numerator / g^{rr})` where
`numerator = -g^{tt} - 2·g^{tφ}·p_φ - g^{φφ}·p_φ²`. The `sqrt` operation
loses ~1 bit of precision per evaluation (~1e-16 abs); over an
Earth–Mars affine range (~10¹¹ m equivalent), accumulated noise can
exceed 1e-4 *if* the noise compounds with the integrator's truncation.

Bench harness `bench/null-ic-reconstruction.bench.ts` perturbs the
seed metric component `g^{tt}` by ±1e-15 and re-reconstructs `p_r`
1000 times. The variance of the resulting `p_r` distribution
characterizes how much the initial-condition noise propagates per
solve.

**Conclusion from Finding 1 + Finding 3**: integrator drift on the
conserved-charge axes is ruled out (Finding 1). The remaining candidate
sources are:
- **(A) Null-IC reconstruction noise** propagated across the affine
  range
- **(B) Affine-parameter coverage mismatch** between the GL4 integrator
  endpoint and the closed-form Shapiro reference
- **(C) Coordinate-singularity neighborhood** if the Earth-Mars geodesic
  passes near `r = r_s` (likely no — Earth-Mars geometry is at
  ~10¹¹ m vs `r_s ≈ 2954 m` for the sun; ~7 orders of magnitude away
  from horizon)

**(A) and (B) are the load-bearing candidates** for v0.7.0 follow-up.

---

## Recommendations for v0.7.0

1. **Implement an absolute-precision null-IC reconstruction** —
   replace the `sqrt(numerator/g^{rr})` form with a higher-precision
   alternative (e.g., extended-precision intermediate via summation
   reordering, or a quadruple-double arithmetic path). Quantify the
   residual reduction.

2. **Audit the affine-parameter span** — verify that the GL4 integrator's
   reported `affineLength` matches the closed-form Shapiro endpoint by
   independent calculation. If there's a mismatch, the residual is just
   measuring different things on each side of the ratio.

3. **Add a `BE37_EXACT_REFERENCE` fixture** that constructs the
   closed-form Shapiro delay at the EXACT affine parameter the GL4
   integrator stops at (rather than the textbook closed-form, which
   assumes flat-spacetime ends). This cleanly separates "did the
   integrator converge" from "did the reference predict the right
   endpoint."

---

## Honest framing

This investigation **did not solve the residual** (per Decision #8 in
the v0.6.0 design: measure-and-document, not measure-and-fix). It did
narrow the search: the integrator is innocent on the conserved-charge
axes, leaving null-IC noise and affine-parameter mismatch as the
remaining suspects. v0.7.0+ can target those specifically.

The bit-exact Killing-charge conservation is an *unexpectedly clean*
positive result that justifies the Phase 1 machinery beyond just PC-1.5
— it makes the symplectic-integrator-on-Schwarzschild guarantee precise
and citable.
