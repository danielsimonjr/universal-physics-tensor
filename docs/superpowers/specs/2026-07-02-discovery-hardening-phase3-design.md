# Discovery-Hardening Phase 3 (v0.33.0) — Evidence Channels: Design

**Date:** 2026-07-02 · **Status:** r3 — **Adam GREEN + Eve YELLOW** on r2 (all
r1 HIGHs resolved, no new HIGHs). r2 corrected two grep-confirmed design-time
physics errors; r3 folds Eve's two residual MEDIUMs (one real, one
grep-refuted mechanism with a real adjacent fix). **READY FOR PLANNING.**
**Program:** Phase 3 of `2026-07-02-discovery-hardening-program-design.md`
(P3 pinned-dataset confrontations + P7 deciding-measurement sensitivity).
**Premise:** the scorecard concedes the data column is "the only real
credibility signal"; 3 of 44 bridges are confronted (BE-23/36/52). This phase
widens that channel from 3 → 8 bridges and makes every confrontation
machine-runnable behind one CLI verb.

## Non-negotiables (inherited + phase-specific)

- **No fabricated physics data.** Every observation value ships with a
  citation (paper, table/figure, year), a stated 1σ or bound semantics, and a
  provenance note. An implementer who cannot source a number STOPS and
  reports; the number is never estimated. (This is the phase's biggest risk;
  Task 0 verifies every dataset value against its citation before any TDD.)
- **Epistemic firewall.** Confrontation results annotate reports and CLI
  output; they never mutate catalog `status:` fields. The promotion rule
  ("speculative→established requires a confrontation") is a *governance*
  line for humans (Part VI + CONTRIBUTING), not code.
- **Zero hard deps; peer degradation.** Sensitivity ranking uses
  `src/diff/bridge-ast-gradient.ts` (exact AD) when the autograd peer is
  present and `bridge-gradient.ts` central-FD otherwise — behavior-identical
  ranking, documented tolerance.
- **Benchmark gate.** The Phase-1 calibration benchmark runs at the release
  gate. This phase does not touch the funnel, so EXPECTED counts must be
  byte-identical — any drift is a defect.

## Architecture (3 units)

### U1 — Observation registry (`src/bridges/observations/`)

Typed TS data modules, one file per dataset, following the repo's
reviewable-typed-data precedent (`SOURCE_ALIAS_DISPOSITIONS`,
`bridges/rejected.ts`, `ADJUDICATIONS`) rather than runtime-parsed JSON —
type safety, zero I/O, works everywhere the library does. The existing
`data/bridge-catalog.json` stays what it is (a machine-readable *export*,
P10's artifact); this registry is *input* data.

**r2 correction (Adam #4, Eve #8 — @public re-export safety):** the existing
`@public` records (`MERCURY`, the BE-23 rows, the BE-36 bound) are **NOT
moved**. They stay in their current modules; the observation registry is a
new *aggregation* layer that IMPORTS them (data flows registry ← module, not
module ← registry-via-re-export). This inverts the r1 plan and removes all
public-API-break risk: no import path changes, no `.d.ts` churn, existing
goldens untouched. New datasets get new modules under `observations/`; the
three existing records are referenced in place.

```ts
/** Provenance every observation record must carry. @public */
export interface ObservationProvenance {
  readonly citation: string;      // paper + locus, e.g. "Bérut et al. 2012, Nature 483:187, Fig. 4"
  readonly year: number;          // publication year
  readonly retrieved: string;     // ISO date the value was transcribed into the repo
  readonly note?: string;         // caveats: what was digitized, unit conversions applied
}

/** Discriminates how `observed` constrains the prediction. @public */
export type ObservationKind =
  | 'value'        // observed value ± sigma; residual/σ is meaningful (BE-52 pattern)
  | 'upper-bound'  // observation EXCLUDES predictions above `observed` (BE-36 pattern)
  | 'consistency'; // measured quantity approaches a theoretical floor by design (Bérut)
```

**r2 correction (Eve #1, Adam #3 — result shape overfit to value-kind):** the
r1 single normalized `{predicted, observed, sigma?, residualInSigma?, ...}`
shape forced `consistency`-kind runs to invent numbers they don't have. The
outcome type is now a **discriminated union on `kind`**, so each kind carries
only the fields it can honestly populate:

```ts
/** @public */
export type ConfrontationOutcome =
  | { kind: 'value'; predicted: number; observed: number; sigma: number;
      residualInSigma: number; withinObserved: boolean; units: string; provenance: ObservationProvenance }
  | { kind: 'upper-bound'; predicted: number; bound: number;
      satisfied: boolean; units: string; provenance: ObservationProvenance }
  | { kind: 'consistency'; predicted: number; approaches: number;
      fractionalGap: number; units: string; provenance: ObservationProvenance }
  // A dataset with per-row structure (the BE-23 α table) returns:
  | { kind: 'table'; rows: ReadonlyArray<
        { label: string; predicted: number; observed: number; sigma: number; residualInSigma: number }>;
      units: string; provenance: ObservationProvenance };
```

`sigma` is always a single positive number in the *observation's own units*
and drives the verdict (`residualInSigma`); where a source reports asymmetric
or stat+sys uncertainties (SPARC's `±0.02(stat)±0.24(sys)`), the record stores
the **combined 1σ** (quadrature sum, here ≈0.24). **r3 (Eve #1 — preserve the
structure):** the observation record additionally carries an optional
`sigmaComponents?: ReadonlyArray<{label: string; value: number}>` (e.g.
`[{label:'stat',value:0.02},{label:'sys',value:0.24}]`) so the raw
decomposition is machine-readable and auditable, not just prose in
`provenance.note`, and downstream tooling (Phase 5's uncertainty work) can
re-weight. The combined `sigma` remains the single verdict driver; the
combination rule is named in `provenance.note`.

Existing inline records (`MERCURY`, the BE-23 cuprate rows, the BE-36 bound)
are MOVED into this registry behind re-exports so no consumer breaks
(behavior-identical refactor, golden-pinned).

### U2 — Confrontation registry + `upt confront` (CLI)

- `src/bridges/confrontations.ts`: a typed registry
  `CONFRONTATIONS: ReadonlyMap<number, ConfrontationEntry>` where each entry
  carries `bridgeId`, `title`, `kind: ObservationKind`, and
  `run(): ConfrontationOutcome` (the discriminated union defined in U1).
  `DATA_CONFRONTED_IDS` in `confrontation-coverage.ts` becomes a projection
  of this registry (single source of truth — coverage and confront can no
  longer drift). **r2 (Eve #9):** the projection is
  `new Set([...CONFRONTATIONS.keys()].sort((a,b)=>a-b))` — explicitly sorted
  so the derived set's iteration order is pinned regardless of registry
  insertion order (JS `Map` is insertion-ordered, so this is belt-and-braces,
  but it makes the scorecard's consumption order provably stable). A test
  pins `DATA_CONFRONTED_IDS === registry keyset`.
- `upt confront [--bridge=be-XX] [--sensitivity] [--json]`: new command
  module per the v0.30 CLI architecture (FlagSpec, `ctx.api` only, `--json`
  envelope additive, goldens for text output). No `--source` (not
  graph-parameterized). Default: run all registered confrontations, print a
  table (bridge, predicted, observed, residual/σ or bound verdict, citation),
  then the epistemics banner: confrontation ≠ confirmation; a passing
  confrontation is consistency, not proof.
- `upt coverage` gains nothing new — it already reads the (now
  registry-backed) confronted-id set.

### U3 — New confrontations (Tier-1 targets, formulation-verified)

Each follows the `be52-mercury-confrontation.ts` module pattern (typed
observation, pure `confrontBE1x()` function, dedicated test pinning the
numbers). **r2: every prediction below was checked against the bridge's
ACTUAL encoding at HEAD** (Task-0 gate #2 applied at design time). Two r1
targets tested equations the bridge does not encode and are corrected:

| id | bridge encodes (verified) | confrontation | dataset | kind | status |
|---|---|---|---|---|---|
| be-16 | Landauer `E_min = k_B T ln 2` (evaluator) | measured erasure heat approaches k_BT ln2 at T≈300 K | Bérut 2012, Nature 483:187, Fig. 4 | consistency | **IN** |
| be-48 | GRW localization rate λ (encoded value) | encoded λ vs experimental upper bound (prediction must lie below) | LISA-Pathfinder CSL bound λ≤(2.96±0.12)e-8/s at r_C=100nm, Carlesso 2016 **arXiv 1606.03637 / PRD 95:084054** (Task-0 corrected from the r1 "94:124036") | upper-bound | **IN**, GRW-vs-CSL caveat |
| be-37 | γ=1 Shapiro delay form (evaluator) | PPN γ: bridge predicts γ=1; confront vs Cassini γ measurement (residual −0.91σ, within 1σ) | Cassini γ=1+(2.1±2.3)e-5, Bertotti-Iess-Tortora 2003 Nature 425:374 | value | **IN** — Task-0 addition (broaden), fully verified, established bridge not yet data-confronted |
| be-23 | Planckian `τ = ħ/(α k_B T)` | per-material α table (extends the existing single confrontation) | Bruin 2013 Science 339:804 + Legros 2019 Nat. Phys. 15:142 | table | **IN** |
| be-38 | Milgrom force law `F = F_N·ν(z)`, `z=F_N/(m·a_0)` — **`a_0` is an INPUT, not predicted** | deep-MOND limit `F → √(F_N·m·a_0)` reproduces the SPARC radial-acceleration relation `g_obs = √(g_bar·a_0)` at the SPARC-fit `a_0` | SPARC RAR, McGaugh 2016 PRL 117:201101, `a_0 = 1.20±0.24 ×10⁻¹⁰` | value | **IN, reformulated** |
| be-12 | thermal de Broglie `λ_T = h/√(2π m k_B T)` — length of (m,T); **no density `n`** | — | — | — | **DROPPED** |

**Why be-38 was wrong in r1 and how it's fixed (grep-verified):**
`src/bridges/equations/be-38-mond.ts` encodes the Milgrom *force law* with
`a_0` as an evaluator input (`evaluateMONDForce({F_N, m, a_0})`); the value
`a₀≈1.2e-10` is a comment, and `a₀≈cH₀/2π` appears NOWHERE in the bridge. The
r1 confrontation tested a cosmological-coincidence claim the bridge never
makes — the BE-28 "definiendum ≠ principle" trap. The honest confrontation
uses the bridge's OWN deep-MOND limit (which the module documents:
`F → √(F_N·m·a_0)`), i.e. the radial-acceleration relation SPARC actually
measures. This needs the SPARC RAR `a_0` fit (a real datum), not the
Hubble-coincidence number. **If Task-0 finds the deep-MOND-limit confrontation
needs SPARC's binned `(g_bar, g_obs)` data rather than just `a_0`, be-38 also
drops** — better 3 honest confrontations than a fabricated 5th.

**Why be-12 is dropped (grep-verified):** `be-12` (module
`be-12-coherence-length.ts`) encodes `λ_T = h/√(2π m k_B T)` — a length as a
function of (m, T). The r1 BEC-onset criterion `nλ³≈2.612` introduces number
density `n`, which the bridge does not encode; the module's own `known_issues`
says the many-body/BEC extension "would warrant its own BE entry." A `λ_T`
value is not a directly-measured observable (measuring it *is* computing the
formula — reproduction, not confrontation, which `confrontation-coverage.ts`'s
G-3 note explicitly excludes). No honest real-data confrontation of be-12's
encoded content is available this phase; it is deferred, recorded in todo.

**Confrontation count (post Task-0): 3 → 6 firm** (be-16, be-37, be-48, +
be-23 extended to a table), **or 3 → 7 if be-38 clears its contingency.** The
r1 "3 → 8" was inflated by the two mis-formulated targets; Task-0's "broaden"
sweep replaced them with be-37/Cassini (verified strong) and confirmed be-42
Hawking / be-27 effective-temperature are unconfrontable (no measured
observable / free parameter absorbs the residual). Full per-number
verification, citation corrections, and drop rationales:
`docs/research/phase3-dataset-verification.md`. `upt coverage`'s data column
and the scorecard DATA flags update mechanically (registry-backed).

### U3b — Deciding-measurement sensitivity (P7)

**r2 correction (Adam #1, Eve #5 — `σ(xᵢ)` per input was uncomputable):** r1
specified `|∂P/∂xᵢ|·σ(xᵢ)`, but observation records carry σ only on the
*observed* value, and there is no repository store of per-INPUT measurement
uncertainties — so the r1 formula could not be evaluated. Two honest options
were considered; **the design takes (A)**:

**(A) Dimensionless log-sensitivity (elasticity), no input σ required.** Rank
inputs by the normalized partial `E_i = |∂P/∂xᵢ| · xᵢ / P` — the fractional
change in the prediction per fractional change in input `i`, evaluated at the
confrontation's own input point. This needs only the gradient and the input
values (both already available), no σ(xᵢ). It answers "which input does the
prediction depend on most *strongly*" — a genuine deciding-measurement proxy
("a 1% improvement in X moves the prediction most"), and it degrades honestly:
an input with `E_i ≈ 0` cannot change the verdict no matter how precisely
measured. The output labels this precisely as **sensitivity (elasticity)**,
NOT "measurement priority," so it never implies an input-σ it doesn't have.
**r3 (Eve #3 — semantic honesty):** elasticity answers "which input the
prediction depends on most *strongly*," which is NOT the same as "which input
*dominates the uncertainty budget*" (that needs input σ). The `--sensitivity`
help text and JSON field doc say exactly this, so no reader mistakes the
elasticity ranking for a variance decomposition; the variance-budget version
is the Phase-5 extension.

**(B) [deferred]** True variance attribution `(∂P/∂xᵢ)²·σ(xᵢ)²` would need an
input-uncertainty field on observation records. Deferred until Phase 5 (which
introduces log-space uncertainty on `RepresentativeValue`) supplies a
principled σ(xᵢ) source; a `// Phase 5` note marks the extension point.

Gradient source: `src/diff` AST gradient when the bridge has an encoded RHS
AST **and** the autograd peer is present; central-FD fallback otherwise.
**Verified:** be-16/be-48 are evaluator-style; the FD path
(`bridge-gradient.ts`) is the primary route for them, AST-AD is the fast path
only where an encoded RHS exists (be-38's force law does). `--sensitivity`
applies to `value`-kind confrontations only; for `upper-bound`/`consistency`/
`table` it prints `sensitivity: n/a for <kind>-kind` and returns an empty
ranking (never NaN). Scoped to confrontation inputs only (NOT a catalog-wide
sweep — YAGNI).

### CLI contract (r2 — closes Adam #5/#6, Eve #10/#11/#12)

- `upt confront` — run all registered confrontations, print the table, then
  the epistemics banner.
- `--bridge=be-XX` — run one. An unregistered/unknown bridge id is a bad flag
  **value** → **exit 1**, matching the established convention (`bad --source
  value` is exit 1; *unknown flags* are exit 2 — see `cli/README.md` and the
  v0.30 args parser). The two reviewers read this as an inconsistency; it is
  the existing, documented split. No change.
- `--sensitivity` — appends the elasticity ranking under each value-kind
  confrontation. Combined with `--bridge`, ranks that one; without `--bridge`,
  ranks each value-kind confrontation in turn. On a non-value-kind bridge it
  prints the `n/a` line above (exit 0 — a legal request with an honest empty
  answer, not an error).
- `--json` — the envelope `result` is the array of `ConfrontationOutcome`
  (discriminated union above); `--sensitivity` adds a `sensitivity` field per
  value-kind entry (`{input, elasticity}[]`, or `[]` for n/a kinds). Additive
  only. `--json` + `--sensitivity` compose (no exit-2 conflict, unlike
  `map --format=svg --json`).

## Task-0 verification gate (mandatory, before any plan execution)

1. Verify each candidate dataset value/uncertainty against its primary
   source; produce `.superpowers/sdd/phase3/dataset-verification.md` with a
   per-number ✓/✗/replaced table. Any ✗ without a replacement drops that
   confrontation (ship fewer, honestly). **Specifically for be-38:** confirm
   whether the deep-MOND-limit confrontation is computable from `a_0` alone
   or needs SPARC's binned `(g_bar, g_obs)` data — if the latter isn't
   tractably pinnable, drop be-38 (→ 3→5).
2. Verify the bridge-side closed forms against the catalog encodings
   (`BRIDGE_EQUATIONS` RHS / evaluators) — the confrontation must use the
   bridge's OWN formulation, not a textbook lookalike (the BE-28 lesson).
   **Done at design time for be-38/be-12** (see U3); redo for be-16/be-48/
   be-23 before their TDD cycles.
3. Verify `src/diff` gradient coverage for the confrontation bridges (AST
   encoding vs evaluator-only — evaluator-only bridges take the FD path;
   be-16/be-48 confirmed evaluator-style at design time).
4. Re-measure the calibration benchmark EXPECTED at HEAD (must be untouched
   by this phase — confrontations are orthogonal to the funnel).

## Testing

- Per-confrontation test pinning predicted/observed/residual at the
  registered dataset (BE-52 test pattern); bound-kind tests assert the
  exclusion semantics both ways (a prediction above the bound fails).
- Registry invariants: every entry's `bridgeId` exists in `BRIDGE_EQUATIONS`;
  provenance fields non-empty; `DATA_CONFRONTED_IDS` === registry keyset.
- CLI: `confront` goldens (text) + JSON contract + exit-code matrix
  (unknown `--bridge` → exit 1 with the CliError convention).
- Sensitivity: AD-vs-FD agreement test (peer-gated) on one confrontation;
  ranking stability pinned.
- Release gate: full suite + smoke + calibration benchmark byte-identical.

**r3 (Eve #2 — grep-refuted mechanism, real adjacent fix).** Eve claimed the
new confrontations would perturb the funnel benchmark via a "shared
auto-incrementing registry" the benchmark enumerates. **Grep-refuted:** the
calibration benchmark calls `rankDiscoveries(CATALOG_GRAPH)` /
`rankDiscoveries(CANONICAL_GRAPH)` (composition-graph edges), and
`discovery.ts` never imports `DATA_CONFRONTED_IDS`; the confrontation registry
is keyed by bridge id and shares no instance with the funnel. The funnel
benchmark is genuinely untouched — the "shared auto-incrementing registry"
does not exist. **BUT the grep surfaced a real adjacent effect Eve pointed
near:** `composition/bridge-analysis.ts:288` consumes `DATA_CONFRONTED_IDS`
for the scorecard's `hasDataConfrontation` flag, so growing the confronted set
**intentionally changes the `upt priority`/scorecard output** — those goldens
(and any `coverage` golden showing the data column) MUST be re-pinned in the
same task that adds a confrontation, and the change is the desired signal
(new confrontations light up the DATA column). Enumerated as an explicit
test-update obligation per confrontation task, distinct from the
funnel-benchmark's byte-identical requirement.

## Out of scope

Automated status promotion (governance text only); new bridge encodings;
uncertainty propagation through chains (Phase 5); catalog-wide sensitivity
sweeps; true variance-attribution sensitivity (needs input σ — Phase 5); any
dataset the Task-0 gate cannot verify; be-12 (no honest confrontation of its
encoded content available — deferred to todo).

## Adjudication record — Adam RED + Eve RED (r1), 2026-07-02

Both reviewers returned RED. Every finding was adjudicated against the source
(the calibration my memory mandates: grep-verify each concrete before
folding). Physics claims were checked against the actual bridge encodings.

**CONFIRMED → folded into r2:**
- **be-38 formulation error** (Adam #2, Eve #3, both HIGH). Grep-verified
  FALSE: `be-38-mond.ts` encodes `F = F_N·ν(z)` with `a_0` an input, not
  `a₀≈cH₀/2π`. Reframed to the deep-MOND-limit / SPARC-RAR confrontation the
  bridge actually supports; flagged for possible Task-0 drop.
- **be-12 formulation error** (Eve #2 HIGH, Adam #3 MEDIUM). Grep-verified:
  `be-12` encodes `λ_T=h/√(2πmkT)`; `nλ³≈2.612` needs density `n` the bridge
  lacks. DROPPED (deferred), recorded in todo.
- **U3b sensitivity uncomputable** (Adam #1, Eve #5, both HIGH). Real gap —
  no input-σ store. Reframed to dimensionless elasticity `|∂P/∂xᵢ|·xᵢ/P`
  (needs no input σ); true variance attribution deferred to Phase 5.
- **Result shape overfit to value-kind** (Eve #1 HIGH, Adam #3, Eve #6/#7).
  `ConfrontationOutcome` is now a discriminated union on `kind` incl. a
  `table` variant for per-row datasets; asymmetric σ combined-in-quadrature
  with the decomposition in `provenance.note`.
- **@public re-export risk** (Adam #4, Eve #8 MEDIUM). Records no longer
  moved; registry imports them in place (data-flow inverted).
- **--sensitivity/--json/kind interactions** (Adam #6, Eve #10 MEDIUM),
  **evaluator-only gradient path** (Eve #12). Specced in the CLI-contract
  section; FD path is primary for evaluator-style bridges.

**REJECTED (with grounds):**
- **"5 confrontations necessarily change funnel counts / byte-identical
  breach"** (Eve #4 HIGH). FALSE: confrontations are orthogonal to the
  discovery funnel — `confront` never feeds `rankDiscoveries`, so the
  calibration benchmark's funnel counts are untouched. New `confront` goldens
  are NET-NEW (additive), not modifications to existing goldens. The
  byte-identical constraint is on the *funnel benchmark* and *existing*
  goldens, both preserved. Folded only the clarification that confront
  goldens are additive.
- **Exit-code 1 vs 2 inconsistency** (Adam #5 LOW, Eve #11 LOW). The repo
  ALREADY distinguishes unknown-flag (exit 2) from bad-flag-VALUE (exit 1);
  `--bridge=be-99` is a bad value → exit 1 is correct and consistent with
  `--source`. Documented the precedent; no change.
- **Map-enumeration determinism** (Eve #9 MEDIUM). JS `Map` is
  insertion-ordered, so the projected Set was already deterministic; Eve
  overclaimed. Pinned an explicit numeric sort anyway (cheap belt-and-braces).

**Governance-not-code** (Adam #7 LOW): acknowledged and intended — the
epistemic firewall is a program invariant; promotion stays a human act. No
change.

**Net effect of the vet:** it caught two design-time physics errors (the
exact "textbook lookalike ≠ bridge's own formulation" trap my Task-0 gate #2
targets — applied at design time is cheaper than at implementation) and one
uncomputable feature. Honest scope dropped from an inflated 3→8 to a
defensible **3→6 (or 3→5)**.

## Re-vet — Adam GREEN + Eve YELLOW (r2), r3 dispositions

Adam GREEN ("dramatic improvement… the design itself is now sound"); Eve
YELLOW ("all previous HIGH issues satisfactorily fixed; no new HIGH"). r2's
HIGH fixes (elasticity reframe, be-38 deep-MOND reformulation, discriminated
union, in-place import) were all accepted as sound by both. Residuals:

- **Eve MED #1 — asymmetric σ structure still lost.** FOLDED r3: optional
  `sigmaComponents[]` on the observation record preserves the raw stat/sys
  decomposition machine-readably; combined `sigma` still drives the verdict.
- **Eve MED #2 — "confront perturbs the funnel via a shared registry."**
  MECHANISM GREP-REFUTED (the benchmark reads `CATALOG_GRAPH` via
  `rankDiscoveries`; `discovery.ts` never imports `DATA_CONFRONTED_IDS`; no
  shared auto-incrementing registry exists). REAL ADJACENT FIX FOLDED r3: the
  scorecard (`bridge-analysis.ts:288`) *does* read `DATA_CONFRONTED_IDS`, so
  `priority`/`coverage` goldens move intentionally and are re-pinned per
  confrontation task — distinct from the funnel benchmark's byte-identical
  requirement.
- **Eve LOW #3 — elasticity ≠ uncertainty-budget semantic.** FOLDED r3:
  help/JSON docs state the distinction explicitly; variance-budget is Phase 5.
- **Adam new MED #1 / Eve LOW #4 — scope: be-38 contingent, 3→6 or 3→5.**
  Both classify this as a steering/PM call, NOT a design fault (Adam: "not a
  flaw in the submitted design"). **Steering position:** the phase ships
  be-16 + be-48 + be-23-table as the committed floor (3→6 — a doubling of the
  confronted set, plus the first per-material table); be-38 is a fourth iff
  Task-0 confirms the deep-MOND-limit confrontation is tractably pinnable.
  Even the floor is a worthwhile minor version. Accepting this scope is the
  owner's call at plan time; the design is sound either way.

**Verdict: design GREEN/YELLOW, no open HIGH — ready to write the
implementation plan.** (Precedent: Phase 1 and Phase 2 both proceeded from an
Adam-GREEN/Eve-YELLOW state with findings folded.)
