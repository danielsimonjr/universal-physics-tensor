/**
 * BE-37 Shapiro RK4 eikonal benchmark.
 *
 * F1 PRECONDITION VERIFIED (2026-05-17):
 *   - `evaluateBE37EikonalNumerical` in src/bridges/equations/be-37-shapiro-delay.ts
 *     is the ACTUAL RK4 Shapiro-delay evaluator (4096-step RK4, hardcoded solar
 *     grazing scenario, no inputs — scenario is internal).
 *   - `evaluateBE37CovariantEikonalNumerical` in src/numerical/be37-covariant-eikonal.ts
 *     is the v0.4.0 STRUCTURAL PREVIEW: returns eikonalResidual=0 by construction,
 *     shapiroDelaySec=0 stub. No numerical integration is performed. Benching it
 *     measures only async wrapper + domain-guard overhead (not RK4 cost).
 *   - Both are benched here: the RK4 one is the primary baseline; the structural
 *     preview is benched separately so v0.5.0 can detect when the stub is replaced
 *     with real geodesic integration.
 *
 * F11 BENCH TIMEOUT: benchmarkTimeout raised to 30 000 ms (30s) per-bench via the
 *   third argument to bench(). The default vitest bench timeout is 10s; 10k-step
 *   RK4 on a slow machine (or under valgrind / coverage) may exceed that.
 *   The 4096-step path actually used by evaluateBE37EikonalNumerical is well within
 *   30s on any modern machine, but the raised limit is kept for forward compatibility
 *   with v0.5.0's planned 10k-step geodesic integrator.
 *
 * SETUP HOISTING (F4): inputs are constructed outside bench() callbacks to measure
 *   the evaluator cost, not allocator/GC cost.  evaluateBE37EikonalNumerical takes
 *   no inputs (scenario is hardcoded internally); evaluateBE37CovariantEikonalNumerical
 *   takes { M_kg, R_far_m, R_near_m } — pre-built as COVARIANT_INPUTS below.
 *
 * Physical parameters (canonical solar grazing scenario, internal to evaluateBE37EikonalNumerical):
 *   M_sun = 1.989e30 kg, R_near = 1.0e9 m, R_far = 1.5e11 m (~1 AU)
 *   G = 6.67430e-11 m³/(kg·s²) — CODATA 2018 (matched to evaluateShapiroDelay)
 *   c = 299 792 458 m/s — exact SI definition
 *
 * v0.4.5: establishes the AST→lowering→RK4 roundtrip baseline for v0.5.0
 *   Faraday-cascade regression detection. No threshold gates in v0.4.5.
 *
 * @see src/bridges/equations/be-37-shapiro-delay.ts (evaluateBE37EikonalNumerical)
 * @see src/numerical/be37-covariant-eikonal.ts (evaluateBE37CovariantEikonalNumerical)
 */
import { bench, describe } from 'vitest';
import { evaluateBE37EikonalNumerical } from '../src/bridges/equations/be-37-shapiro-delay.js';
import { evaluateBE37CovariantEikonalNumerical } from '../src/numerical/be37-covariant-eikonal.js';

// ---------------------------------------------------------------------------
// Setup hoisted outside bench callbacks (F4 discipline).
// ---------------------------------------------------------------------------

// evaluateBE37EikonalNumerical takes no inputs — scenario is internal.
// Nothing to hoist for this bench.

// evaluateBE37CovariantEikonalNumerical inputs — canonical solar grazing scenario,
// mirroring the internal scenario in evaluateBE37EikonalNumerical for consistency.
// Fields verified from BE37CovariantEikonalInputs interface (F1 precondition):
//   M_kg: source mass (kg), R_far_m: far-point radius (m), R_near_m: near-point radius (m).
const COVARIANT_INPUTS = {
  M_kg: 1.989e30,     // solar mass
  R_far_m: 1.5e11,    // ~1 AU (far-point radius)
  R_near_m: 1.0e9,    // inner radius (≤ R_far_m, required by API)
} as const;

// ---------------------------------------------------------------------------
// Bench suite 1: RK4 Shapiro-delay evaluator (the real numerical path).
// ---------------------------------------------------------------------------

describe('BE-37 Shapiro delay — RK4 numerical integration (primary baseline)', () => {
  bench(
    'evaluateBE37EikonalNumerical (4096 RK4 steps, solar grazing)',
    async () => {
      await evaluateBE37EikonalNumerical();
    },
    { benchmarkTimeout: 30_000 },  // F11: raised from default 10s
  );
});

// ---------------------------------------------------------------------------
// Bench suite 2: v0.5.0 covariant-eikonal real evaluator.
// Now runs a full GL4 null-geodesic Shapiro integration (Task 12, Phase 2c).
// Cost reflects 2048 implicit Picard stage solves; was a near-zero stub in
// v0.4.0 (regression detection signal: ~5 s wall-clock here vs ~0 in v0.4.x).
// ---------------------------------------------------------------------------

describe('BE-37 covariant eikonal — v0.5.0 GL4 null-geodesic Shapiro', () => {
  bench(
    'evaluateBE37CovariantEikonalNumerical (GL4, 2048 steps, solar geometry)',
    async () => {
      await evaluateBE37CovariantEikonalNumerical(COVARIANT_INPUTS);
    },
    { benchmarkTimeout: 30_000 },  // F11: raised from default 10s (forward-compat)
  );
});
