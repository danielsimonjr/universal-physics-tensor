# Atlas Roadmap — subagent-driven implementation plan

**Executes:** [`ROADMAP.md`](../../ROADMAP.md) (2026-09-20), phases 0–6.
**Baseline:** `universal-physics-tensor@0.45.2`, `master`, suite ≈ 3,700 passing across ~353 files.
**Status:** plan. Nothing in this document is authorized until the Lead promotes a sprint into
[`ACTIVE.md`](ACTIVE.md). Phase 0 is the only sprint specified at brief-level detail on every
task; later phases are specified to the same structure but their briefs are finalized by the
Lead after the preceding phase's Eve report, because each phase's types depend on what the
previous phase measured.

This plan follows the swarm/dev-workflow stage mapping codified in `todo.md` §Conventions:
the **Lead** (orchestrator) owns design notes, plan text, dispatch, all commits, and wrap
artifacts; **implementation agents** execute file-scoped briefs and never commit;
**Adam** (design/plan adversarial vet, pre-implementation) and **Eve** (empirical value-level
verification, post-implementation) are always independent of the authoring agent. Model
mapping for Adam/Eve lives in `todo.md` §Reasoning tier.

---

## 0. Orchestration contract (applies to every sprint)

### 0.1 Roles and agent types

| Role | Agent type (Claude Code `Agent` tool) | Runs | Owns |
|---|---|---|---|
| Lead | the interactive session | foreground | design note, `ACTIVE.md` line, dispatch, scoped-test runs between waves, commits, CHANGELOG, `todo.md`, `bun run docs:deps`, stale-docs gate |
| Scout | `Explore` (read-only) | background, before Wave 1 | pre-flight facts the briefs cite (signatures, fixture formats, pinned counts) |
| Implementer | `general-purpose` | background, one per brief, parallel within a wave | exactly the files its brief lists; scoped vitest; a deviation report |
| Adam | per `todo.md` §Reasoning tier (text-only MCP; inline the design note) | after the design note, before Wave 1 | GREEN / YELLOW / RED on the design note and on every brief |
| Eve | per `todo.md` §Reasoning tier | after the last wave, before wrap | recomputes every numeric claim from first principles; value-blind-test hunt; doc-drift hunt |

### 0.2 Standing rules baked into every implementer brief

1. **Pre-execution verification gate first.** Read the real source files named in the brief
   before writing a test. Never trust an inline snippet in this plan over the source; the
   house lesson (`CLAUDE.md` §Workflow gotchas) is that plan snippets are routinely wrong about
   node kinds, builder names, and fixture shapes. Report every mismatch as a deviation.
2. **File scope is a hard boundary.** Create or modify only the paths under "Owns". If the
   task needs a change outside the scope, stop, write the need into the deviation report, and
   continue with everything that does not depend on it.
3. **TDD with scoped vitest only.** `bunx vitest run tests/<path>` per cycle. Never run the
   full suite (that is the Lead's job at the wave boundary). Never bare `bun test`.
4. **No commits, no pushes, no `git add`.** The Lead is the single writer.
5. **Never fabricate.** A witness that cannot be derived from the cited source is reported as
   `unresolved` with the reason, not approximated. A metadata field whose value is unknown is
   left `undefined` / `'not-yet-audited'`.
6. **Ignore errors in files outside your scope** (parallel agents are editing them).
7. **Deviation report** (mandatory, last section of the agent's final message):
   `Followed as written / Deviated (what, why, evidence) / Blocked (what is needed) /
   Tests added (paths + counts) / Symbols added (for the plan-doc audit)`.
8. **ESM `.js` extensions on every relative import.** `tsc` is the pretest; a missing
   extension fails the wave.

### 0.3 Wave mechanics

- Agents in one wave own disjoint file sets and run concurrently on the same working tree
  (house convention; no per-agent worktrees, so nothing needs merging).
- Between waves the Lead runs `bun run build` and `bunx vitest run tests/atlas` (plus any
  test directories the wave touched), reads every deviation report, spot-verifies at least one
  claim per report against the source (agent reports are inputs, not records), and only then
  dispatches the next wave.
- A wave is not done until every brief's tests pass in isolation **and** together.
- Sprint end, in this order: Eve report → fixes → stale-docs gate (README counts, CONTRIBUTING
  review tasks, the five living `docs/architecture/` docs, research cross-references,
  `bun run docs:deps`) → full `bun run test` → CHANGELOG + `todo.md` + `ROADMAP.md` §7 pointer
  → commit → push.

### 0.4 Invariants no brief may violate (from `CLAUDE.md` and the discovery plan §0)

- No Python; zero hard dependencies; optional peers degrade gracefully.
- Nothing new is re-exported from `src/index.ts` before Phase 6. New surface lives on the
  `universal-physics-tensor/atlas` subpath and is `@internal`.
- `BridgeEquationStatus`, `EdgeConfidence`, `EpistemicStatus`, `VettedCandidate`,
  `AdjudicationVerdict` are never replaced or adapted into one another.
- `upt discover`, `candidates`, `ground`, `connectors`, `predict`, `confront` are frozen verbs.
- The 41-edge `CATALOG_GRAPH` and the 55-entry `BRIDGE_EQUATIONS` do not change shape; the
  pinned funnel counts (132 / 7 / 35 / 20 / 0 / 70) do not move.
- Nothing under `src/` imports a `scorer/` fixture directory (extend the existing import-graph
  guard pattern to `tests/fixtures/atlas/`).

### 0.5 Brief template

Every brief below is written in this shape; the Lead pastes it verbatim into the `Agent`
prompt, prefixed with §0.2.

```
BRIEF <id> — <title>
Agent: <type>   Wave: <n>   Depends on: <brief ids or none>
Owns (create): ...        Owns (modify): ...        Forbidden: everything else
Pre-execution gate: <files to read, commands to run, facts to confirm>
Tasks: <numbered, each with the test to write first and the assertion it makes>
Definition of done: <tests, counts, invariants>
Report: deviation report per §0.2 item 7
```

---

## Sprint 0 — Oscillator pilot (ROADMAP Phase 0, target v0.46)

**Goal.** Five typed bridges, one rejection, fifteen executable witnesses, one complete record,
the `(K, δ)` algebra, and the family's regime records, all under `src/atlas/`, off the public
barrel, with no change to any existing type. Measure curation cost per bridge by relation type.

**Entry conditions.** `ACTIVE.md` carries the Sprint 0 line; the design note
`docs/planning/Atlas-Phase-0-Design.md` exists and Adam has returned GREEN or a resolved
YELLOW on it.

### S0.W0 — Lead + Scout + Adam (sequential)

**Lead task L0.1 — design note.** Write `docs/planning/Atlas-Phase-0-Design.md` fixing:
the `src/atlas/` module layout below; the minimal type set (§S0 types); the decision that pilot
types are throwaway if Phase 1 disagrees; the curation-cost log format (one row per bridge:
relation type, person-hours authoring, person-hours review, witness count). Include the
witness table from ROADMAP Phase 0 with the numeric expectations from §S0.W2 below.

**Scout brief SC0 — pre-flight facts** (`Explore`, "medium" breadth). Return, with file:line:

- Exact export list of `src/dimensional/buckingham.ts` (`buckinghamPi`, `DimensionalVariable`,
  `PiGroup`, `BuckinghamResult`) and how `PiGroup.exponents` names variables.
- The `l1` builder signature in `src/canonical/entries/_l1-build.ts` and the four oscillator
  entries' ids and `regime` values (`CE-simple-harmonic-frequency`, `CE-lc-resonance`,
  `CE-oscillator-energy`, `CE-spring-potential-energy`).
- The named dimension constants used by those entries (`FREQUENCY`, `SPRING_CONSTANT`, `MASS`,
  `INDUCTANCE`, `CAPACITANCE`) and where they are defined.
- The `D(L, M, T, Theta)` fixture in `tests/fixtures/dimension.ts`.
- How `package.json` `exports` declares `./probe`, and whether any test pins the exports map
  or the `src/index.ts` export count (look in `tests/api/`, `tests/composition/probe/modules.test.ts`).
- The `tests/composition/probe/import-graph.test.ts` guard, verbatim.
- The `data/schemas/discovery-run.v0.json` header and the test that validates a manifest
  against it (`tests/composition/probe/discovery-run-schema.test.ts`): which validator is used
  (in-tree, no dependency).
- Whether `src/numerical/` exposes an RK4 or GL4 integrator usable from a test for a scalar
  ODE (`geodesic-integrator.ts`, `gl4-integrator.ts`): signature and whether it accepts a plain
  `f(t, y)` right-hand side. If not, W2 witnesses use a local fixed-step RK4 in the test helper.

**Adam vet A0.** Inputs: the design note + every S0 brief inlined. Required outputs: a verdict
per brief; specifically whether the fifteen witnesses' numeric expectations are derivable from
the stated models (Adam recomputes at least: pendulum relative period error at 0.2 rad, the
damping side-condition identity, the chain dispersion error coefficient 1/24, the chirped
Gaussian product). RED on any brief blocks that brief only.

### S0 types (fixed by the design note; the W1 agent implements them verbatim or reports why not)

```ts
// src/atlas/types.ts  (@internal throughout)
export type RelationType =
  | 'derivation' | 'exact-equivalence' | 'restriction' | 'approximation'
  | 'coarse-graining' | 'analytic-continuation' | 'structural-analogy'
  | 'deformation-quantization';

export type EvidenceTag =
  | 'proposed' | 'reviewed' | 'dimension-checked' | 'convention-checked'
  | 'symbolically-checked' | 'numerically-supported' | 'formally-proved'
  | 'empirically-supported' | 'contradicted' | 'unresolved';

export type LimitCharacter = 'regular' | 'singular' | 'unknown';

export interface RegimeInequality {
  /** Name of a π-group produced by buckinghamPi over the family's variables. */
  readonly group: string;
  readonly op: '<' | '<=' | '>' | '>=';
  readonly bound: number;
}
export interface Regime {
  readonly family: string;                       // 'oscillators'
  readonly inequalities: readonly RegimeInequality[];
  readonly groupDefinitions: Readonly<Record<string, PiGroup>>; // traceability to the dimension matrix
}

export interface ApproximationBound {
  readonly K: number;               // Lipschitz constant of the map, stated norm
  readonly delta: number;           // uniform error, same norm
  readonly norm: string;            // 'sup over t in horizon', 'relative period', ...
  readonly domain: string;          // where the bound holds
  readonly horizon: string;         // MANDATORY: 't << 16*T0/theta0^2'
  readonly limitCharacter: LimitCharacter;
}

export interface AtlasModel {
  readonly id: string;              // 'model-spring', 'model-lc', ...
  readonly family: string;
  readonly stateSpace: string;
  readonly dynamics: string;        // display form of the ODE
  readonly observables: readonly string[];
  readonly parameters: readonly DimensionalVariable[];
  readonly canonicalRefs: readonly string[];   // 'CE-simple-harmonic-frequency', ...
  readonly regime: Regime;
}

export interface Counterexample {
  readonly description: string;
  readonly witness: string;         // test id, e.g. 'W3'
}

export interface AtlasBridge {
  readonly id: string;              // 'ab-spring-lc'
  readonly relation: RelationType;
  readonly premises: readonly string[];   // model ids (many)
  readonly conclusion: string;            // model id (one)
  readonly preserves: readonly string[];
  readonly doesNotPreserve: readonly string[];
  readonly sideConditions: readonly string[];
  readonly bound?: ApproximationBound;    // required iff relation === 'approximation'
  readonly regime: Regime;
  readonly counterexamples: readonly Counterexample[];
  readonly evidence: ReadonlySet<EvidenceTag>;
  readonly witnesses: readonly string[];  // 'W1', 'W1a', ...
  readonly citations: readonly string[];
}

export interface AtlasRejection {
  readonly id: string;              // 'ax-cubic-spring-lc'
  readonly claimed: RelationType;
  readonly premises: readonly string[];
  readonly conclusion: string;
  readonly reason: string;
  readonly survivingGroup: string;  // 'epsilon = beta*x0^2/k'
  readonly witnesses: readonly string[];
}
```

### S0.W1 — foundation (2 agents, parallel)

**BRIEF S0.1 — atlas types, error algebra, regime derivation**
Agent: general-purpose. Wave 1. Depends on: SC0.
Owns (create): `src/atlas/types.ts`, `src/atlas/error-algebra.ts`, `src/atlas/regime.ts`,
`src/atlas/index.ts`, `tests/atlas/error-algebra.test.ts`, `tests/atlas/regime.test.ts`.
Owns (modify): none. Forbidden: everything else, including `package.json`.
Pre-execution gate: read `src/dimensional/buckingham.ts` lines 30–80 and 260–330; read
`src/composition/probe/types.ts` lines 14–60 to confirm the atlas types do not shadow the
probe's `RelationKind` / `AuditState` names (they must not: use `RelationType`, and do not
define `AuditState` in Sprint 0); read `src/composition/probe/index.ts` for the `@internal`
barrel style.
Tasks:
1. `types.ts` exactly as §S0 types (report any deviation).
2. `error-algebra.ts`: `composeBounds(outer: {K, delta}, inner: {K, delta})` returning
   `{ K: outer.K * inner.K, delta: outer.K * inner.delta + outer.delta }`; `IDENTITY_BOUND =
   { K: 1, delta: 0 }`; `composeBoundPath(bounds: readonly ({K, delta} | null)[])` that throws
   `MissingLipschitzError` when a `null` (K-less) bound sits anywhere but the **last** position
   and returns the folded bound otherwise.
   Tests first: associativity on three random triples (exact arithmetic on small integers, e.g.
   `(2,1)∘((3,2)∘(5,4)) === ((2,1)∘(3,2))∘(5,4) === (30, 2*3*4 + 2*2 + 1) = (30, 29)`); identity
   both sides; `[b1, null, b2]` throws; `[b1, b2, null]` returns `b2∘b1`; geometric growth:
   folding `(2, 0.1)` ten times gives `K = 1024`.
3. `regime.ts`: `deriveRegimeGroups(family: string, variables: DimensionalVariable[]): Record<string, PiGroup>`
   wrapping `buckinghamPi` and keying groups by their `formula`; `regimeHolds(regime: Regime,
   groupValues: Record<string, number>): { ok: boolean; violated: RegimeInequality[] }`.
   Tests first: `{m, b, k}` with dims `M`, `M T⁻¹`, `M T⁻²` yields exactly one group whose
   exponents are `{m: 1, k: 1, b: -2}` up to overall sign (assert on the sign-normalized
   vector); `regimeHolds` with `zeta < 1` at `zeta = 0.5` ok and at `zeta = 2` violated,
   naming the inequality.
4. `index.ts` re-exports everything `@internal`.
Definition of done: the two test files pass; `tsc` clean on `src/atlas`; no import from
`src/composition/probe/`.

**BRIEF S0.2 — subpath export, import-guard, JSON schema skeleton**
Agent: general-purpose. Wave 1. Depends on: SC0.
Owns (create): `data/schemas/atlas-record.v0.json`, `tests/atlas/import-graph.test.ts`,
`tests/atlas/exports-subpath.test.ts`, `tests/fixtures/atlas/README.md`.
Owns (modify): `package.json` (`exports["./atlas"]` only, mirroring `./probe`; and add
`"test:atlas": "vitest run tests/atlas"` to `scripts`).
Pre-execution gate: read `package.json` `exports`; read
`tests/composition/probe/import-graph.test.ts`; read `data/schemas/discovery-run.v0.json`
and `tests/composition/probe/discovery-run-schema.test.ts` to reuse the same in-tree
validation approach (no new dependency); confirm via SC0 whether any test pins the
`exports` map, and if so extend that pin in the same edit (report it).
Tasks:
1. `exports["./atlas"]` → `dist/atlas/index.{js,d.ts}`. Test: `exports-subpath.test.ts`
   reads `package.json` and asserts the three keys exist and point under `dist/atlas/`.
2. `tests/atlas/import-graph.test.ts`: nothing under `src/` mentions
   `fixtures/atlas` together with `scorer`.
3. `data/schemas/atlas-record.v0.json`: draft-07 schema for the JSON projection of
   `AtlasModel`, `AtlasBridge`, `AtlasRejection` (a top-level `{ schemaVersion: "0",
   packageVersion, family, models[], bridges[], rejections[] }`); `bound.horizon` is
   `required` whenever `relation === "approximation"` (use `if/then`). No test yet: the S0.4
   agent validates the real export against it.
Definition of done: both tests pass; `bun run build` still succeeds (empty `src/atlas` from
S0.1 may not exist yet in your view; that is fine, the Lead builds at the wave boundary).

### S0.W2 — the five bridges, one rejection, fifteen witnesses (3 agents, parallel)

All three W2 briefs share this pre-execution gate: read `src/atlas/types.ts` (from W1); read
the SC0 answer on integrators; read the four oscillator canonical entries. Numeric witnesses
use a local fixed-step RK4 helper in `tests/atlas/_ode.ts` (created by S0.3; S0.4 and S0.5
import it and must not edit it — if it lacks something, report, do not fork). Tolerances are
stated per witness; an agent may tighten, never loosen, and must report the tightened value.

**BRIEF S0.3 — models + bridges 1 and 2 (exact equivalence, side condition)**
Agent: general-purpose. Wave 2. Depends on: S0.1.
Owns (create): `src/atlas/oscillators/models.ts`, `src/atlas/oscillators/bridges-exact.ts`,
`tests/atlas/_ode.ts`, `tests/atlas/oscillators-exact.test.ts`.
Tasks:
1. `_ode.ts`: `rk4(f: (t, y: number[]) => number[], y0, t0, t1, steps)` returning the final
   state and a sampled trajectory. Test it against `y' = -y` (relative 1e-8 at 1000 steps).
2. `models.ts`: `MODEL_SPRING` (`m x'' + k x = 0`), `MODEL_LC` (`L q'' + q/C = 0`),
   `MODEL_DAMPED_SPRING` (`m x'' + b x' + k x = 0`), `MODEL_RLC` (`L q'' + R q' + q/C = 0`),
   `MODEL_PENDULUM` (`θ'' + (g/ℓ) sin θ = 0`), `MODEL_LINEAR_OSC_ND` (`u'' + u = 0`),
   `MODEL_CHAIN` (`m u_n'' = κ(u_{n+1} − 2u_n + u_{n−1})`), `MODEL_WAVE_1D` (`u_tt = c² u_xx`),
   `MODEL_CUBIC_SPRING` (`m x'' + k x + β x³ = 0`), each with `canonicalRefs` pointing at the
   real `CE-*` ids where one exists (only the four listed exist; the rest get `[]`).
   Regime for each from `deriveRegimeGroups`.
3. Bridge 1 `ab-spring-lc` (`exact-equivalence`): preserves `['natural frequency',
   'energy up to scale', 'phase portrait']`; does not preserve `['physical interpretation',
   'units']`; side conditions `['m, k, L, C > 0', 'lossless', 'unforced', 'x0, q0 nonzero']`;
   evidence `{'dimension-checked', 'numerically-supported', 'symbolically-checked'}` only if the
   corresponding witness passes in this test file (W1, W1a, W1b).
   - **W1** (symbolic, no peer): with `u = x/x0`, `τ = ω0 t`, `ω0² = k/m`, substitute into
     `m x'' + k x` and assert the coefficient of `u` after dividing by `k x0` is exactly `1`
     (do this with rational arithmetic on the exponent bookkeeping, not floating point).
     Same for LC with `ω0² = 1/(LC)`.
   - **W1a** (numeric): integrate spring `(m=2, k=8)` and LC `(L=0.5, C=0.25)` from
     `u(0)=1, u'(0)=0` in their own variables, map both to `u(τ)` at `τ ∈ {π/2, π, 3π/2, 2π}`,
     assert `|u_spring − u_lc| < 1e-8` and both within `1e-8` of `cos τ`.
   - **W1b** (inverse maps): `x = x0 u`, `t = τ/ω0` round-trip on a sampled trajectory
     recovers the original within 1e-12.
4. Bridge 2 `ab-damped-rlc` (`exact-equivalence` with side condition): side condition
   `b/√(mk) = R√(C/L)`.
   - **W2** (numeric, condition satisfied): choose `m=1, k=4, b=1` so
     `ζ_mech = b/(2√(mk)) = 0.25`, and `L=2, C=0.125` so `√(C/L) = 0.25`; the side condition
     `b/√(mk) = R√(C/L)` then requires `R = 2` (`ζ_RLC = (R/2)√(C/L) = 0.25`); both
     nondimensionalize to `u'' + 0.5 u' + u = 0`; trajectories agree within 1e-8 at four τ
     values. (An earlier draft of this brief said `R = 1`; that gives `ζ_RLC = 0.125` and is
     wrong — the agent must derive `R` from the side condition, not copy it.)
   - **W2b** (counterexample): same `L, C` with `R = 4` gives `ζ_RLC = 0.5 ≠ 0.25`;
     assert the trajectories differ by more than 1e-2 at `τ = π`. Register the
     counterexample on **bridge 1**: "adding R to bridge 1 breaks it" (`witness: 'W2b'`).
Definition of done: all witnesses pass; `bridges-exact.ts` exports `BRIDGE_SPRING_LC`,
`BRIDGE_DAMPED_RLC`; the evidence set on each bridge contains only tags whose witness is in
this file.

**BRIEF S0.4 — bridges 3 and 4 (non-uniform approximation, singular limit)**
Agent: general-purpose. Wave 2. Depends on: S0.1, and imports `tests/atlas/_ode.ts` from S0.3
(if it is not present yet, write the tests against the documented signature and report).
Owns (create): `src/atlas/oscillators/bridges-limits.ts`, `tests/atlas/oscillators-limits.test.ts`.
Tasks:
1. Bridge 3 `ab-pendulum-linear` (`approximation`), bound
   `{ K: 1, delta: θ0²/16 (relative period), norm: 'relative period error', domain:
   'θ0 ≤ 0.5 rad', horizon: 't ≪ 16 T0/θ0²', limitCharacter: 'regular' }`.
   - **W7** (period error): exact period via the complete elliptic integral
     `T = (2/π) T0 K(sin(θ0/2))` computed by the AGM (`K(k) = π / (2·AGM(1, √(1−k²)))`);
     at `θ0 = 0.2` assert `T/T0 − 1 ∈ [0.002505, 0.002507]` (Blueprint: 0.002506) and that the
     series estimate `θ0²/16 = 0.0025` differs from it by less than `2e-6`
     (next term is `11θ0⁴/3072 ≈ 5.7e-6`; assert the residual is below `1e-5` and above `5e-6`).
   - **W7b** (non-uniformity): phase drift per cycle is `2π·(T/T0 − 1)`; assert the cycle
     count at which the drift reaches `π/2` lies in `[99, 101]` for `θ0 = 0.2`, and that the
     bridge's `bound.horizon` string is non-empty (admission rule).
   - Numeric cross-check: RK4 the nonlinear pendulum for 100 periods `T0` with 20,000 steps
     per period, locate the last zero crossing, and assert the accumulated phase lag is
     within 3° of 90° (tolerance accounts for integrator error; report the measured value).
2. Bridge 4 `ab-damped-massless` (`approximation`, singular), bound with
   `limitCharacter: 'singular'`, `horizon: 't ≫ m/b (outside the boundary layer)'`,
   `norm: 'sup |x − x_reduced| for t ≥ 5 m/b'`. `K` and `delta` are stated for the
   reduced-model comparison on that domain.
   - **W8** (order drop and roots): for `k=1, b=1`, `m ∈ {1e-1, 1e-2, 1e-3}` the two
     characteristic roots satisfy `r_slow → −k/b` (assert `|r_slow + 1| < 2m` for each `m`)
     and `r_fast·m → −b` (assert `|r_fast·m + 1| < 2m`).
   - **W8b** (lost initial condition): integrate the full model from `x(0)=1, x'(0)=v0` with
     `v0 ∈ {0, 5}`; the reduced model `b x' + k x = 0` has one solution from `x(0)=1`; assert
     that for `t ≥ 5m/b` both full solutions agree with the reduced one within `1e-3`
     (for `m = 1e-3`), and that at `t = 0.5 m/b` the `v0 = 5` case differs from the reduced
     solution by more than `1e-2`. That is the boundary layer of thickness `~m/b`.
Definition of done: witnesses pass; both bridges carry a non-empty `horizon`; a test asserts
that constructing an `approximation` bridge with an empty `horizon` throws
`MissingHorizonError` (export it from `bridges-limits.ts`; the Lead may move it to
`types.ts` at wrap).

**BRIEF S0.5 — bridge 5 (coarse-graining), the rejection, and the two quantum witnesses**
Agent: general-purpose. Wave 2. Depends on: S0.1; imports `tests/atlas/_ode.ts`.
Owns (create): `src/atlas/oscillators/bridges-coarse.ts`, `src/atlas/oscillators/rejections.ts`,
`src/atlas/witnesses/quantum-support.ts`, `tests/atlas/oscillators-coarse.test.ts`,
`tests/atlas/quantum-support.test.ts`.
Tasks:
1. Bridge 5 `ab-chain-wave` (`coarse-graining`): reduction map `u_n(t) → u(x = na, t)`,
   information lost `'modes with q > π/a'`, closure `'long-wavelength, qa ≪ 1'`.
   - **W9** (dispersion): lattice `ω(q) = 2√(κ/m)|sin(qa/2)|`, continuum `ω = c q` with
     `c² = κa²/m`. For `κ = m = a = 1` and `qa ∈ {0.1, 0.2, 0.4}` assert the relative error
     `1 − ω_lattice/ω_cont` equals `(qa)²/24` within 5% of itself (the next term is
     `(qa)⁴/1920`). Assert the lattice band edge at `qa = π` has `ω = 2√(κ/m)` and the
     continuum has no band edge (state it as the information-loss witness).
2. Rejection `ax-cubic-spring-lc`: claimed `exact-equivalence`, premises
   `['model-cubic-spring', 'model-lc']`, surviving group `ε = βx0²/k`.
   - **W3** (Buckingham survival): `buckinghamPi` over `{m, k, β, x0}` with `β` of dimension
     `M L⁻² T⁻²` yields ≥ 1 group whose exponents restricted to `{β, x0, k}` are
     proportional to `{1, 2, −1}`; assert that group is present and that the LC model's
     variable set `{L, C, q0}` admits **no** group at all (`verdict === 'dimensionally-independent'`).
     Assert `rejections.ts` lists the rejection with `witnesses: ['W3']`.
3. `quantum-support.ts` (pure functions, no bridge yet; consumed by Phase 3):
   `chirpedGaussianUncertaintyProduct(s, alpha, hbar = 1)` returning `(ħ/2)√(1 + 16α²s⁴)`, and
   `wickRotatedSchrodingerCoefficients(hbar, m)` returning `{ diffusion: hbar/(2m),
   reactionSign: -1, reactionScale: 1/hbar }`.
   - **W4**: at `α = 0` the product is exactly `ħ/2`; at `s = 1, α = 0.5` it is
     `(ħ/2)·√5`; numerically confirm via direct quadrature that for the discretized
     wavefunction `ψ = N exp(−x²/4s² + iαx²)` on `x ∈ [−12s, 12s]` with 4001 points,
     `σx = s` (rel 1e-6) and `σp` computed as `‖−iħ ψ'‖`-based variance matches the closed
     form within 1e-4 relative. (Report the measured values.)
   - **W5**: the substitution `t = −iτ` in `iħ∂tψ = −(ħ²/2m)∇²ψ + Vψ` yields
     `∂τφ = (ħ/2m)∇²φ − Vφ/ħ`; test by verifying that `φ(τ) = ψ(−iτ)` for the free Gaussian
     packet solves the heat equation: numerically apply the closed-form free-particle
     Gaussian with complex time and check the residual of `∂τφ − (ħ/2m)∂xxφ` is below
     `1e-6` relative on the grid (central differences, 2001 points, `s = 1`, `τ = 0.3`).
Definition of done: all witnesses pass; W3's LC assertion uses `verdict`, not a count.

### S0.W3 — assembly, export, cost log (1 agent)

**BRIEF S0.6 — family assembly, JSON projection, schema validation, evidence-tag rule**
Agent: general-purpose. Wave 3. Depends on: S0.1–S0.5.
Owns (create): `src/atlas/oscillators/index.ts`, `src/atlas/serialize.ts`,
`scripts/emit-atlas-json.mjs`, `tests/atlas/serialize.test.ts`, `tests/atlas/evidence-rule.test.ts`,
`data/atlas/oscillators.json`.
Owns (modify): `src/atlas/index.ts` (add re-exports), `package.json` (`"atlas:json"` script only).
Pre-execution gate: read `scripts/emit-catalog-json.mjs` and copy its conventions (runs
against built `dist/`, writes `packageVersion` from `package.json`); read every W2 module.
Tasks:
1. `OSCILLATOR_FAMILY = { family: 'oscillators', models, bridges, rejections }`.
2. `serialize.ts`: `toAtlasJson(family)` producing the shape of `atlas-record.v0.json`;
   sets serialized to sorted arrays; `PiGroup` exponents emitted as-is.
3. `evidence-rule.test.ts`: for every bridge in the family, every `EvidenceTag` present has
   at least one witness id in `bridge.witnesses`, and every witness id appears as a test name
   substring in `tests/atlas/oscillators-*.test.ts` (read the files; this is the anti-theatre
   pin: a tag without a test is a failure).
4. `serialize.test.ts`: the emitted object validates against `data/schemas/atlas-record.v0.json`
   using the same in-tree validation approach the probe schema test uses; the `approximation`
   bridges carry `horizon`; a mutated copy with `horizon` removed **fails** validation.
5. `scripts/emit-atlas-json.mjs` writes `data/atlas/oscillators.json`; commit the output.
Definition of done: `bunx vitest run tests/atlas` green; `node scripts/emit-atlas-json.mjs`
regenerates a byte-identical file.

### S0 — Eve verification brief E0 (independent, after W3)

Inline for Eve: `src/atlas/**`, `tests/atlas/**`, `data/atlas/oscillators.json`, the design
note. Eve must, from first principles and without the tests:
1. Recompute `T/T0 − 1` at `θ0 = 0.2` via the elliptic integral and via the series to four
   significant figures; state both; confirm the test window brackets the truth.
2. Recompute the cycle count for a 90° phase lag; confirm `[99, 101]` is honest.
3. Recompute the RLC side condition from `ζ_mech = b/(2√(mk))`, `ζ_RLC = (R/2)√(C/L)`.
4. Recompute the dispersion coefficient `1/24` from the Taylor expansion of `2 sin(qa/2)`.
5. Recompute the chirped-Gaussian product and confirm the `α = 0.5, s = 1` value.
6. Confirm the singular-limit roots and the boundary-layer scale.
7. Hunt for value-blind tests: any `expect(x).toBeDefined()` or `toBeGreaterThan(0)` standing
   in for a physics assertion; list them.
8. Hunt for evidence-tag theatre: any tag not backed by a witness the rule test would catch.
9. Read `data/atlas/oscillators.json` and confirm no field was populated by guess (every
   `citations[]` entry resolves to a real source; every `preserves[]` item is defended by a
   witness or a side condition).
Verdict per item; the Lead fixes RED/YELLOW items before wrap.

### S0 — Lead wrap checklist (L0.2)

- [ ] Curation-cost log filled from the agents' reports (hours per bridge by relation type)
      into the design note; this number gates Sprint 4 and Sprint 5 scope.
- [ ] `bun run build && bun run test` full suite green; count recorded in CHANGELOG.
- [ ] `bun run docs:deps` (new `src/atlas/` changes the dependency graph); the hand-written
      `docs/architecture/OVERVIEW.md` / `COMPONENTS.md` metric tables re-measured (this is the
      drift class that failed `master` twice; do not skip).
- [ ] `CLAUDE.md` source map gains one row for `src/atlas/`.
- [ ] `ROADMAP.md` §7 Phase 0 row → `shipped vX.Y.Z` + pointer to this plan.
- [ ] `todo.md` Active queue entry; `ACTIVE.md` line closed.
- [ ] Independent physicist review requested via `CONTRIBUTING.md` physics-review surface
      (five contracts + the rejection); the request text is in the CHANGELOG entry.

**Sprint 0 exit criteria** = ROADMAP Phase 0 exit criteria. If Eve's item 9 finds any guessed
field, the sprint does not close until it is `undefined` or sourced.

---

## Sprint 1 — Relation contracts as an additive overlay (ROADMAP Phase 1, target v0.47–v0.48)

**Goal.** `relation?`, `evidenceTags?`, `conventions?`, `counterexamples?` on existing records
as optional fields; an `Association` registry; the composition table with `no-composite-claim`
as the default; one overlay reconciled with the probe's existing `RelationKind` / `AuditState`.

### S1.W0 — Lead + Scout + Adam

**Lead task L1.1 — design note** `docs/planning/Atlas-Phase-1-Design.md`. Must contain the
**reconciliation table**: for each field of the discovery plan §3 `ScientificRelationRecord`
sketch and each field of the Sprint 0 `AtlasBridge`, the single name that survives, where it
lives (`src/atlas/types.ts` becomes the home; `src/composition/probe/types.ts` keeps
`RelationKind` and `AuditState` and imports nothing from atlas), and the rule that maps the
probe's `RelationKind` (what a record *is*) onto the atlas `RelationType` (how two records
*relate*): they are orthogonal and both stay. Must also contain the complete composition
table (Blueprint v2 §4.2) as a matrix over the eight types with `'no-composite-claim'` in
every unspecified cell, and the truthful-migration rule (§3.1 of the discovery plan).

**Scout brief SC1.** Return with file:line: every consumer of `BridgeEdge` construction
(object literals with `kind: 'bridge' | 'law'`) under `src/composition/edges/*.ts`, the
`edgeToJunction` / `buildVizModel` signatures and `VizOptions` fields in
`src/composition/graph-viz.ts`, the `src/bridges/membership.ts` precedence rule that reads
`REJECTED_BRIDGE_ADJUDICATIONS`, the `CanonicalForms` interface, the `upt recover` command's
flags, and every test that pins `Object.keys(edge)` or a `BridgeEdge` snapshot (an added
optional field must not break a deep-equality pin; list them).

**Adam vet A1.** Specifically: does the reconciliation leave exactly one overlay; does the
composition matrix agree with Blueprint v2 §4.2 row by row; is the derived-tag rule in S1.3
incapable of inventing evidence.

### S1 briefs

**BRIEF S1.1 — overlay fields on `BridgeEdge` and `CanonicalEquation` (types only)**
Agent: general-purpose. Wave 1.
Owns (modify): `src/composition/edge.ts` (add `relation?: RelationContract`,
`evidenceTags?: ReadonlySet<EvidenceTag>`, `conventions?: Conventions`,
`counterexamples?: readonly Counterexample[]`), `src/bridges/index.ts` (the same four
optional fields on `BridgeEquationEntry`; the catalog row is the per-bridge home, and the 13
closed-form bridges BE-51/52/55…65 have no graph edge, so the row is the only place their
overlay can live; interface change only, no row edits), `src/canonical/canonical-equation.ts`
(add `conventions?`, `evidenceTags?`), `src/atlas/types.ts` (add `RelationContract` as the
discriminated union over the eight types with each type's required content from Blueprint
v2 §4.1, and `Conventions { heatWorkSign?: 'Q-W' | 'Q+W'; metricSignature?: '-+++' | '+---';
fourierNormalization?: 'unitary' | 'physics' | 'none'; unitSystem?: 'SI' | 'gaussian' |
'natural'; capacitorChargeSign?: '+' | '-' }`).
Owns (create): `tests/atlas/overlay-types.test.ts`.
Pre-execution gate: read SC1's list of deep-equality pins; run them scoped before and after.
Tasks: add the fields; write a test that constructs a `BridgeEdge` without any overlay field
(type-checks) and one with each relation type carrying exactly its required content (a
missing `bound.horizon` on `approximation` is a **type** error via a required field, not a
runtime check). Definition of done: `tsc` clean for `src` and `tests`; SC1's pins unchanged.

**BRIEF S1.2 — composition table and `UndefinedCompositionError`**
Agent: general-purpose. Wave 1 (parallel with S1.1; owns different files, imports the
`RelationType` union from Sprint 0 which already exists).
Owns (create): `src/atlas/composition-table.ts`, `tests/atlas/composition-table.test.ts`.
Owns (modify): `src/composition/compose.ts` (one guarded block only), `src/composition/edge.ts`
is **not** owned (S1.1 owns it) — export the error from `composition-table.ts` and have the
Lead re-home it at wrap.
Tasks:
1. `composeRelation(first: RelationType, second: RelationType): RelationType | 'no-composite-claim'`
   as a literal 8×8 matrix. Tests: every row of Blueprint v2 §4.2 (equivalence∘equivalence =
   equivalence; exact∘exact = derivation; exact∘approximation either order = approximation;
   coarse∘coarse = coarse; analytic∘X only when X is in the stated set; analogy∘analogy =
   analogy; analogy∘derivation = 'no-composite-claim' unless flagged transport, which the
   pure table cannot know, so `'no-composite-claim'`; limit∘quantization =
   'no-composite-claim'), plus a test that **counts** the `'no-composite-claim'` cells and pins
   the count so a silent widening of the table fails.
2. In `composeEdges`: if **both** operands carry `relation`, call `composeRelation`; on
   `'no-composite-claim'` throw `UndefinedCompositionError` (message names both ids and
   types); otherwise set `relation` on the composed edge to the composite type with a
   `derivedFrom: [first.id, second.id]` note. If either operand lacks `relation`, behaviour is
   byte-identical to today. Test: the 41-edge `CATALOG_GRAPH` composes exactly as before (run
   `tests/composition/compose*.test.ts` scoped, unchanged); two Sprint 0 bridges wrapped as
   `BridgeEdge`s compose per the table; an `approximation` after `deformation-quantization`
   throws.
Definition of done: no existing composition test changes; the matrix test pins the
`no-composite-claim` count.

**BRIEF S1.3 — derived evidence tags (truthful migration)**
Agent: general-purpose. Wave 2. Depends on: S1.1.
Owns (create): `src/atlas/derive-evidence.ts`, `tests/atlas/derive-evidence.test.ts`,
`src/atlas/coverage.ts`, `tests/atlas/coverage.test.ts`.
Pre-execution gate: read `src/bridges/confrontations.ts` (`CONFRONTATIONS`,
`CONFRONTATION_RIGOR`), `src/bridges/rejected.ts`, `src/canonical/linkage.ts`
(`classifyLinkage`), and `tests/bridges/dimensional-signature-catalog.test.ts` to learn what
"the pin passes" means mechanically (the derivation must call the same validator the test
calls, not read the test).
Tasks:
1. `deriveEvidenceTags(beId): ReadonlySet<EvidenceTag>` with exactly three rules:
   `dimension-checked` iff the catalog RHS validates to its registered `dimensional_signature`
   (call the validator); `empirically-supported` iff `CONFRONTATIONS.has(beId)`, and the
   returned set carries the rigor tier in a parallel `notes` map; `contradicted` iff
   `REJECTED_BRIDGE_ADJUDICATIONS` names it (with the reason linked as a `Counterexample`).
   **No fourth rule.** Test: BE-37 → `{dimension-checked, empirically-supported}` with
   `stringent`; BE-28 → `{dimension-checked, contradicted}`; a bridge with no AST → `∅` for
   `dimension-checked` (not `unresolved`, which is reserved for a check that ran and timed out).
2. `coverage.ts`: `overlayCoverage()` → `{ schema: n, audited: n, verified: n, notYetAudited: n }`
   over all 55 bridges + 103 canonical entries, where "audited" means a human set
   `relation` or `conventions`, and "verified" means a derived tag set is non-empty. Test pins
   the initial numbers (`audited = 0` at this sprint unless S1.5 lands; state which).
Definition of done: the three-rule test is exhaustive; a fourth branch added to
`deriveEvidenceTags` would need a test that names it.

**BRIEF S1.4 — `Association` registry and the convention check**
Agent: general-purpose. Wave 2. Depends on: S1.1.
Owns (create): `src/atlas/association.ts`, `src/atlas/conventions.ts`,
`tests/atlas/association.test.ts`, `tests/atlas/conventions.test.ts`.
Pre-execution gate: read `docs/research/orphan-connector-adjudication.md` and
`src/composition/adjudication.ts` (`ADJUDICATIONS`, verdict `'decoy'`) — the seed population
is the decoy verdicts and the named shared-constant coincidences; read `CanonicalForms`.
Tasks:
1. `Association { id; kind: 'shared-constant' | 'shared-symbol' | 'shared-structure' |
   'historical-influence'; between: [string, string]; note; citation }` and
   `ASSOCIATIONS` seeded from every `'decoy'` adjudication (id-linked, note copied verbatim,
   no new physics). Test: every seed's `between` pair resolves to real quantity or bridge ids;
   `ASSOCIATIONS` contains no pair that is also a `CATALOG_GRAPH` edge.
2. `checkConventions(a: Conventions | undefined, b: Conventions | undefined)` → list of
   mismatched keys (undefined on either side is "unknown", never a mismatch). Wire it into
   `composeEdges` behind the same "both operands carry it" guard as S1.2 (coordinate: S1.2 has
   landed by Wave 2; edit only the block S1.2 added, and report). Test: `'Q-W'` vs `'Q+W'`
   mismatches; `'-+++'` vs `undefined` does not.
Definition of done: associations never appear in `buildVizModel`'s edge list (a test
asserts it).

**BRIEF S1.5 — audit the five Sprint 0 bridges and ten catalog bridges through the overlay**
Agent: general-purpose (physics-literate). Wave 3. Depends on: S1.1–S1.4.
Owns (modify): `src/atlas/oscillators/bridges-*.ts` (re-register through `RelationContract`),
and exactly ten catalog rows in `src/bridges/index.ts` (`BRIDGE_EQUATIONS`) chosen by the
Lead from the established, data-confronted set (BE-37, BE-51, BE-52, BE-55, BE-58, BE-59,
BE-21, BE-35, BE-11, BE-48), adding `relation`, `conventions`, and `counterexamples` only
where the cited source supports each value. Where the bridge also has a graph edge (check
`beId` under `src/composition/edges/*.ts`; BE-37 is in `calibration.ts`), copy the same
`relation` onto the edge in this brief so row and edge never disagree; a test asserts the
agreement for every `beId` present in both registries.
Owns (create): `tests/atlas/audited-catalog.test.ts`.
Rule: every added value carries a `// source:` comment naming the reference and section; a
value the agent cannot source is left `undefined` and listed in the report. Test: each of the
ten carries `relation`; `overlayCoverage().audited === 10 + 5`.
Definition of done: Eve samples three of the ten against the sources.

### S1 — Eve brief E1
Spot-check three audited bridges' `relation` and `conventions` against the cited sources;
attempt to construct an evidence tag by any path other than the three rules; attempt to
compose two overlay-carrying edges whose types are not in the table and confirm the throw;
confirm the 41-edge graph's composition results are unchanged (recompute two composed values
from before/after `dist/`); confirm `overlayCoverage` numbers by independent count.

### S1 — Lead wrap
Standard checklist (§0.3) plus: re-home `UndefinedCompositionError` into `edge.ts` beside
`DomainViolationError`; `CLAUDE.md` bridge-encoding patterns section gains "relation contract
+ conventions" bullets; `cli/README.md` unchanged (no CLI this sprint).

---

## Sprint 2 — Regimes and error-carrying paths (ROADMAP Phase 2, target v0.49–v0.50)

**Goal.** `Regime` on edges beside `ValidityDomain`; uniformity fields enforced at admission;
`(K, δ)` path bounds through `propagateUncertainty`; `upt regime` and `upt path` verbs;
`upt map --relation= --evidence=` filters.

### S2.W0
**Lead L2.1 design note** `Atlas-Phase-2-Design.md`: the `regime?: Regime` field semantics (on
`BridgeEdge` and on `BridgeEquationEntry`) relative to `ValidityDomain.predicate` (both may be present; when both are, `evaluateEdge`
checks the predicate as today and **additionally** `regimeHolds` when the caller supplies
group values; a regime never replaces a predicate silently); the path-bound API; the two
verbs' flag specs and `--json` shapes; the GR spine re-expression (`r_s/r`, `v/c`) that must
leave every confrontation number unchanged.
**Scout SC2:** `src/cli/args.ts` `FlagSpec` shape and `valueStyle` options; `src/cli/output.ts`
`emitJson` envelope and the non-finite sanitizer; how `map.ts` parses `--source` and
`--format`; `src/cli-api.ts` barrel export style (the CLI reaches internals only via the
barrel); the `tests/cli/*.test.ts` in-process `runCli` convention (they import from `dist/`,
so `bun run build` precedes them); `VizOptions` fields.
**Adam A2:** does the path-bound rule refuse a K-less middle edge; is the regime check
additive; are the CLI verbs flat and registered via the barrel.

### S2 briefs

**BRIEF S2.1 — `regime?` on `BridgeEdge`, admission rules, regime intersection**
Owns (modify): `src/composition/edge.ts` (`regime?: Regime`), `src/atlas/regime.ts`
(`intersectRegimes`, `regimeOverlap(a, b): 'disjoint' | 'overlap' | 'nested'` on the shared
group names; `admitApproximation(bridge)` throwing `MissingHorizonError` moved here from
Sprint 0). Owns (create): `tests/atlas/regime-admission.test.ts`.
Tests: overlap classification on the oscillator family's `ζ` and `θ0` inequalities; admission
throws on empty horizon; the Sprint 0 five bridges all admit.

**BRIEF S2.2 — path bounds through `propagateUncertainty`**
Owns (create): `src/atlas/path-bound.ts`, `tests/atlas/path-bound.test.ts`.
Owns (modify): `src/composition/uncertainty.ts` — add an **optional** fourth parameter
`opts?: { bound?: ApproximationBound }` whose only effect is to include `bound.delta` in the
returned `sigma` in quadrature and to echo `bound` in the result; default behaviour unchanged
(scoped `tests/composition/enumerate-uncertainty.test.ts` must not change).
Tasks: `boundPath(edges: BridgeEdge[])` → `composeBoundPath` over `edge.relation.bound ?? null`
(non-approximation exact types contribute `IDENTITY_BOUND`; a K-less approximation in the
middle throws `MissingLipschitzError`). Test: `[exact, approx(K=1, δ=0.0025), exact]` →
`(1, 0.0025)`; `[approx(K=2, δ=0.1), approx(K=3, δ=0.2)]` → `(6, 0.5)`; K-less middle throws;
K-less last is allowed and the result says `terminal: true`.

**BRIEF S2.3 — `upt regime` and `upt path`**
Owns (create): `src/cli/commands/regime.ts`, `src/cli/commands/path.ts`,
`tests/cli/regime.test.ts`, `tests/cli/path.test.ts`.
Owns (modify): `src/cli/commands/index.ts` (two import lines), `src/cli-api.ts` (export the
atlas functions the commands need: `OSCILLATOR_FAMILY`, `regimeHolds`, `regimeOverlap`,
`boundPath`, `findPath`), `src/cli/main.ts` (help text lines only), `cli/README.md`.
Pre-execution gate: read `confront.ts` end to end and copy its structure (flags, HELP, `run`,
`emitJson`, exit codes: 0 ok, 1 bad value, 2 unknown flag via the parser).
Tasks: `upt regime <family> [--at group=value ...] [--json]` lists models valid at the point
and, for each invalid one, the violated inequality; `upt path <fromModel> <toModel> [--json]`
finds a bridge path (BFS over `premises`/`conclusion`; the first sprint supports only
single-premise chains) and prints the composite relation type per the table, the composed
`(K, δ)`, and `'no composite claim'` when the table says so. Tests: exit 0/1/2 cases; `--json`
envelope shape; `path model-pendulum model-lc` returns `approximation` with `(1, 0.0025)` via
`ab-pendulum-linear` then `ab-spring-lc`; `path` across a `no-composite-claim` pair prints the
phrase and exits 0 (it is an answer, not an error).

**BRIEF S2.4 — `upt map --relation= --evidence=`**
Owns (modify): `src/composition/graph-viz.ts` (`VizOptions.relation?`, `VizOptions.evidence?`
filters; edges lacking the overlay are **kept** when no filter is set and **dropped** when a
filter is set, and the legend line states how many were dropped for lacking metadata),
`src/cli/commands/map.ts` (two flags), `cli/README.md`. Owns (create):
`tests/composition/graph-viz-filters.test.ts`, `tests/cli/map-filters.test.ts`.
Tests: `--relation=approximation` on `--source=both` yields exactly the audited approximation
edges (count pinned from S1.5); the dropped-for-lack-of-metadata count is printed.

**BRIEF S2.5 — GR spine regimes (physics-literate)**
Owns (modify): the three GR spine catalog rows (BE-37, BE-51, BE-52) in `src/bridges/index.ts`,
plus BE-37's graph edge in `src/composition/edges/calibration.ts`, gain `regime` on the groups `r_s/r` and `v/c` (weak field, slow motion) with bounds sourced
from the confrontation's own inputs. Owns (create): `tests/atlas/gr-spine-regime.test.ts`.
Test: `upt confront --json` output (via `runCli`) for be-37/51/52 is byte-identical before and
after (snapshot the three `residualInSigma` values from the current tree in the test);
`regimeHolds` is true at each confrontation's inputs.

### S2 — Eve E2
Recompute the composed `(K, δ)` for the pendulum→linear→LC path; verify the horizon
enforcement by querying past `16T0/θ0²`; verify that the three GR residuals are unchanged to
all printed digits; attempt to get a K-less edge into the middle of a path through the CLI.

### S2 — Lead wrap
Standard, plus `cli/README.md` command table (+2 verbs, `CLAUDE.md` says "19 data-bearing
commands" → 21), `docs/architecture/DATAFLOW.md` gains the path query.

---

## Sprint 3 — Hyperedges, models, and the poster index (ROADMAP Phase 3, target v0.51–v0.52)

**Goal.** `Statement` and `Derivation` (many premises → one conclusion), the `Model` record
promoted from Sprint 0's `AtlasModel`, the sixteen poster entries with hidden supporting nodes,
correctly typed edges and associations, `upt map --source=poster`.

### S3.W0
**Lead L3.1 design note** `Atlas-Phase-3-Design.md`: `Statement { id; context: Context;
model: ModelId; ast?: ExprNode; sourceExpression: string; display: string }` with `Context`
carrying quantity types, gauge/frame choices, conventions, and assumptions;
`Derivation { id; premises: StatementId[]; conclusion: StatementId; sideConditions;
contextUnion }`; the multicategory composition (only exact hyperedges compose; the result's
premises are the union minus internal conclusions); the poster table (Blueprint v2 Appendix A)
with, per entry, the existing `CE-*` id or "new L1 entry"; the hidden-node list (action
principle, Noether, full Maxwell set, Lorentz group, central limit theorem) each as a
`Statement` with its `sourceExpression`.
**Scout SC3:** which of the sixteen poster entries already exist in `src/canonical/entries/`
(search formula_latex and names for: first law, Boltzmann entropy, uncertainty, rest energy,
Schrödinger (L2?), Faraday, Einstein field equation (`FieldEquationNode`), Newton I/II/III,
gravitation, normal density, superposition, Lorentz factor); the `l1` and `nonmonomial.ts`
patterns for adding L1 entries; whether `EinsteinFieldEquationNode` can be referenced from a
`Statement`; `buildVizModel`'s cluster/junction model for adding a `'poster'` source.
**Adam A3:** every poster edge type against Appendix A line by line; that `7 ↔ 16` is an
association; that `6 ↔ 13` carries the `V = 0` condition; that the hidden-node "prediction"
test is meaningful (removing a hidden node leaves a premise dangling).

### S3 briefs (file scopes fixed at dispatch; structure below)

- **S3.1 statements + derivations + multicategory compose** — `src/atlas/statement.ts`,
  `src/atlas/derivation.ts`, tests. Tests: composing `D1: {A, B} ⊢ C` with `D2: {C, E} ⊢ F`
  yields `{A, B, E} ⊢ F`; composing when `D2` does not consume `C` throws; context union
  merges assumptions and reports convention conflicts via S1.4's `checkConventions`.
- **S3.2 missing L1 canonical entries** (physics-literate) — only the poster entries SC3
  reports absent, added via `l1` / `nonmonomial.ts` patterns with sources; the L-layer count
  test pin (103 →  N) updated in the same brief and stated in the report.
- **S3.3 poster statements, hidden nodes, typed edges, associations** (physics-literate) —
  `src/atlas/poster/{statements,derivations,associations}.ts` and tests: sixteen statements
  each with a non-empty `context.assumptions` matching Appendix A; the typed edges exactly as
  ROADMAP Phase 3 lists them; `7 ↔ 16` and `3, 14 → *` in `associations`, not derivations; the
  chirped-Gaussian and Wick witnesses from Sprint 0 attached to `13 ↔ 4` and `6 ↔ 13`.
- **S3.4 hidden-node test + `upt map --source=poster`** — `graph-viz.ts` poster source,
  `map.ts` flag, tests: removing `statement-noether` from the registry makes at least two
  derivations report a dangling premise (`validatePoster()` returns them); association edges
  render dashed (a string assertion on the Mermaid/DOT output).

### S3 — Eve E3
Line-by-line check of the sixteen qualifications and the typed edges against Blueprint v2
Appendix A; attempt to find a poster edge recorded as a derivation that Appendix A calls an
association or approximation; confirm the L-layer count pin was updated honestly (count the
files).

---

## Sprint 4 — Verification workflow and checked bridges (ROADMAP Phase 4, target v0.53–v0.55)

**Goal.** The five-step workflow as code paths; symbolic witnesses through the optional MathTS
peer with `unresolved` on absence or timeout; `formalRef` with a fidelity field; CI-derived
`formally-proved` / `symbolically-checked`; diffusion and wave families; ≥ 20 bridges across
≥ 5 relation types.

**Scope rule.** The Sprint 0 curation-cost log sets the bridge count. If measured cost makes
20 unreachable in the sprint window, the Lead cuts the count in the design note and says so;
the exit criterion "≥ 5 relation types" is not cut.

### S4.W0
**Lead L4.1 design note**: the `Witness` record (`{ id; kind: 'symbolic' | 'numeric' |
'formal'; test: string; tolerance?; convergence?; peer?: string }`); the rule that
`symbolically-checked` and `formally-proved` tags are **computed** from witness results at
test time and never hand-set (an `evidence` literal containing either tag fails a lint test);
`formalRef { system: 'lean4-physlib' | 'other'; statement: string; version: string; axioms:
string[]; fidelity: 'two-formalizers' | 'back-translation' | 'sanity-lemmas' | 'unreviewed' }`;
the applicability checker's side-condition rules (division needs nonzero; squaring adds
solutions; transcendental arguments dimensionless — the last already exists in
`validator.ts`); the diffusion and wave family model lists.
**Scout SC4:** how `compose-symbolic.ts` / `expr-simplify.ts` detect the MathTS peer and
degrade (`FormulaParser` registry, `--debug` reporting); `tests/peers-required.test.ts`
semantics; the `it.skip`/`GL4_LONG` pattern for long tests; `src/canonical/entries/fluids-waves.ts`
diffusion/wave entries (`CE-wave-speed`, `CE-sound-speed`, …).
**Adam A4:** can any path set `formally-proved` without a reviewed `formalRef`; is
`unresolved` the outcome of every timeout and peer-absence path.

### S4 briefs (structure)

- **S4.1 applicability checker** — `src/atlas/applicability.ts`: dimensions (existing
  validator), conventions (S1.4), side conditions (nonzero-divisor and squaring rules over the
  AST), model compatibility (premise models share a family or a declared bridge). Tests on
  synthetic ASTs: `a / b` without `b ≠ 0` side condition → finding; `x² = y²` → "adds
  solutions" finding.
- **S4.2 symbolic witness runner** — `src/atlas/witness-symbolic.ts`: peer-present path calls
  the MathTS simplifier on `lhs − rhs` with a wall-clock budget and returns `checked |
  unresolved`; peer-absent path returns `unresolved` with reason `'peer-absent'`. Tests run
  both paths by stubbing the parser registry (existing pattern in `tests/…formula…`).
- **S4.3 `formalRef` + fidelity + tag derivation** — extend `deriveEvidenceTags` with exactly
  two new rules (`formally-proved` iff `formalRef.fidelity !== 'unreviewed'`;
  `symbolically-checked` iff a symbolic witness returned `checked` in the recorded results
  file `data/atlas/witness-results.json`, regenerated by `bun run test:atlas`). Lint test:
  grep `src/atlas/**` for literal `'formally-proved'` / `'symbolically-checked'` inside an
  `evidence:` initializer → must be zero hits.
- **S4.4 diffusion family** (physics-literate) — models (Fick, heat equation, random walk),
  bridges: random walk → diffusion (coarse-graining, with the `Δx²/Δt` closure), heat ↔
  diffusion (exact equivalence), Schrödinger free particle ↔ heat (analytic continuation,
  reusing Sprint 0 W5), each with witnesses; regime groups (Fourier number, Péclet where
  applicable).
- **S4.5 wave family** (physics-literate) — models (1D wave, d'Alembert solution, string,
  sound in a fluid), bridges: chain → wave (already), string → 1D wave (restriction),
  sound-speed relation (derivation from linearized Euler + adiabatic EOS, a **hyperedge** with
  two premises), dispersion-free limit; witnesses.
- **S4.6 five formal references** (physics-literate, out-of-tree work) — identify five
  statements among the ~20 bridges that have a checked counterpart in Physlib (or record
  `system: 'other'`); fill `formalRef` with `version` and `axioms`; fidelity set by a
  reviewer who has not seen the source (`back-translation`) or by sanity lemmas the brief
  writes as tests in `tests/atlas/formal-sanity.test.ts` (instantiate the statement on a
  known case). Any statement without a real checked counterpart is left without a
  `formalRef` and reported; the count target moves, the honesty rule does not.

### S4 — Eve E4
Attempt to obtain `formally-proved` on a bridge with `fidelity: 'unreviewed'`; kill the peer
and confirm every symbolic witness reports `unresolved`; recompute two diffusion and two wave
witness numbers; count relation types across admitted bridges (≥ 5).

---

## Sprint 5 — The invalid-bridge benchmark (ROADMAP Phase 5, target v0.56)

**Goal.** A frozen, independently authored, taxonomy-balanced benchmark with a scorer no
`src/` file can import; κ reported; pre-registered thresholds.

**Independence rule.** The items are authored by physicists who have not read
`src/atlas/`. Subagents may **not** author benchmark items. Subagents build the harness,
the scorer, the statistics, the leakage checks, and the pre-registration template, and they
may draft *candidate* items only into a `contested/` staging area that is excluded from the
frozen set until an independent author accepts or rewrites them.

### S5.W0
**Lead L5.1 design note**: the eight failure kinds with one worked example each (drawn from
Blueprint v2 §7.2 and the Sprint 0 rejection); the item schema (`{ id; kind: 'valid' |
'invalid'; failureKind?; premises; conclusion; claimedRelation; family; renamedVariant?:
boolean; source }`); the held-out family (fix it now: **waves** is held out; oscillators and
diffusion are in-distribution); the pre-registration note template with the seven thresholds
of Blueprint v2 §7.3.
**Scout SC5:** the Family B fixture layout and its `score.ts` contract; how the probe's
`serialize.ts` hashes a problem (reuse for item hashing).

### S5 briefs (structure)

- **S5.1 item schema + loader + leakage checks** — `tests/fixtures/atlas/benchmark/{public,scorer}/`,
  `src/atlas/benchmark/loader.ts` (reads `public/` only), tests: a scorer file mentioned in
  `src/` fails the import guard; an item whose normal-form hash (via `canonical/normal-form.ts`)
  collides with an in-distribution family item is flagged as leakage; renamed-variable
  variants are detected as the same item by hash and must be in the **same** split.
- **S5.2 atlas condition runner** — `src/atlas/benchmark/run-atlas.ts`: for each item, run the
  applicability checker + composition table + regime check and emit `accept | reject |
  abstain` with the failure kind it detected; abstention is a first-class outcome.
- **S5.3 baseline runners (in-tree, deterministic)** — text retrieval (token overlap), symbol
  matching, typed structural search (normal-form match). Embeddings and LLM conditions are
  **out of process** via the probe's backend NDJSON protocol (`backend-protocol.ts`); this
  brief adds the request/response shapes only.
- **S5.4 statistics** — `src/atlas/benchmark/stats.ts`: Wilson interval, McNemar paired
  test, Cohen's κ; tests against textbook values (Wilson at 48/60 = 0.80 → [0.68, 0.88];
  McNemar on a known 2×2; κ on a known confusion matrix).
- **S5.5 pre-registration note** (Lead-owned, not an agent): `docs/research/atlas-benchmark-
  preregistration.md` with thresholds frozen **before** any condition runs; committed with
  the hash of the frozen item set.

### S5 — Eve E5
Recompute Wilson/McNemar/κ on the test cases; attempt to import a scorer from `src/`; check
that no item in the held-out family shares a normal-form hash with an in-distribution item;
confirm the pre-registration commit precedes the first results commit in `git log`.

---

## Sprint 6 — Study, scoped release, discovery hypothesis (ROADMAP Phase 6, target v0.57+)

**Goal.** Run the seven conditions and the ablation; test the link-prediction hypothesis
once; publish the versioned export; API review.

### S6 briefs (structure)

- **S6.1 condition orchestration** — `scripts/run-atlas-study.mjs` driving the in-tree
  conditions and the out-of-process ones through the backend protocol, logging versions;
  results to `docs/research/atlas-study-results.md` with the reproducer command per figure
  (house rule: every figure regenerates from a command).
- **S6.2 ablation** — `types only / + assumptions / + dimensions & conventions / + regimes`
  as four configurations of the S5.2 runner; paired statistics per configuration.
- **S6.3 link prediction over the typed graph** — a deterministic structural predictor
  (common-premise / common-model neighbourhood) against the typed-search baseline on held-out
  known bridges; **one** result, stated as ROADMAP Phase 6 requires, no hub/gap claims beyond
  "hypothesis about the representation". Product A untouched (a test asserts `discovery.ts`
  is not imported by anything under `src/atlas/`).
- **S6.4 versioned export** — `data/atlas/atlas.json` (all families), JSON-LD projection
  with stable ids, QUDT/SI-DF identifiers where they resolve (a resolution table checked in;
  unresolved kinds left blank), PROV-O-shaped provenance; schema bump to `v1` only if a
  breaking field change happened.
- **S6.5 `upt atlas <id>`** — per-bridge report with every qualification visible
  (relation, side conditions, regime, bound + horizon, evidence tags with their witnesses,
  counterexamples, formalRef fidelity).
- **S6.6 API review (Lead + Adam)** — decide, symbol by symbol, what moves from `@internal`
  on the subpath to `@public` on `src/index.ts`; update `tests/api/` pins; `package.json`
  stays `0.x`.

### S6 — Eve E6
Fresh-environment reproduction of every published check from a clean clone; verify the
paired statistics against the raw per-item outputs; verify that no output hides a
qualification (`upt atlas` on three bridges vs. their source records).

---

## Cross-sprint test strategy

| Invariant | Pinned by | Sprint |
|---|---|---|
| Nothing under `src/` imports an atlas or discovery `scorer/` | `tests/atlas/import-graph.test.ts` | 0 |
| Every evidence tag on a bridge has a named, existing witness test | `tests/atlas/evidence-rule.test.ts` | 0 |
| Approximation bridges carry a horizon (type + schema + admission) | S0.4 / S1.1 / S2.1 tests + `atlas-record.v0.json` | 0–2 |
| `(K, δ)` composition is associative with identity `(1, 0)` | `tests/atlas/error-algebra.test.ts` | 0 |
| K-less bound never in the middle of a path | `tests/atlas/path-bound.test.ts` | 2 |
| Composition table `no-composite-claim` cell count is pinned | `tests/atlas/composition-table.test.ts` | 1 |
| Edges without overlay compose byte-identically to today | existing `tests/composition/compose*.test.ts` unchanged | 1 |
| Only three (later five) rules derive evidence tags | `tests/atlas/derive-evidence.test.ts` + literal-grep lint | 1, 4 |
| 41 edges, 55 bridges, funnel pins 132/7/35/20/0/70 unchanged | existing pins | all |
| GR spine residuals unchanged after regimes | `tests/atlas/gr-spine-regime.test.ts` snapshot | 2 |
| Associations never rendered as graph edges | `tests/atlas/association.test.ts` | 1 |
| Hidden poster nodes are load-bearing | `validatePoster()` test | 3 |
| `formally-proved` requires reviewed `formalRef` | lint + derivation test | 4 |
| Held-out family has no normal-form collision with in-distribution items | S5.1 leakage test | 5 |
| Product A not imported by atlas | S6.3 import test | 6 |

## Scheduling and cost notes

- Sprint 0 is three waves: W1 (2 agents) → W2 (3 agents) → W3 (1 agent), plus Scout, Adam,
  Eve. Six implementer dispatches total. Each W2 brief is sized to one agent session; if an
  agent reports it could not finish, the Lead splits the remaining witnesses into a W2b
  dispatch rather than extending the brief.
- Physics-literate briefs (S0.3–S0.5, S1.5, S2.5, S3.2–S3.3, S4.4–S4.6) should run on the
  strongest available implementer model; mechanical briefs (S0.2, S2.3, S2.4, S5.4) can run
  on a faster tier. The mapping is the Lead's call at dispatch and is recorded in the sprint's
  Review-Findings note.
- No sprint starts until the previous sprint's Eve items are closed and its curation-cost row
  is in the log. Sprint 4 and Sprint 5 scopes are set from that log, not from this plan.

## Documents this plan will create (per sprint)

`docs/planning/Atlas-Phase-<n>-Design.md` · `docs/planning/Atlas-Phase-<n>-Review-Findings.md`
(Adam + Eve, verbatim) · the sprint's `ACTIVE.md` line · CHANGELOG entry · `ROADMAP.md` §7 row
update · for Sprint 5 and 6, the `docs/research/` pre-registration and results notes.
