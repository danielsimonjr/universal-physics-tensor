# Discovery-Hardening Phase 3 (v0.33.0) — Evidence Channels: Design

**Date:** 2026-07-02 · **Status:** r1 — DRAFT, awaiting Adam/Eve adversarial vet
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
  | 'consistency'; // qualitative floor/approach (Bérut: measured heat approaches kT ln2)
```

Existing inline records (`MERCURY`, the BE-23 cuprate rows, the BE-36 bound)
are MOVED into this registry behind re-exports so no consumer breaks
(behavior-identical refactor, golden-pinned).

### U2 — Confrontation registry + `upt confront` (CLI)

- `src/bridges/confrontations.ts`: a typed registry
  `CONFRONTATIONS: ReadonlyMap<number, ConfrontationEntry>` where each entry
  carries `bridgeId`, `title`, `kind: ObservationKind`, and
  `run(): ConfrontationOutcome` (a normalized shape:
  `{predicted, observed, sigma?, residualInSigma?, satisfied, units, provenance}`).
  `DATA_CONFRONTED_IDS` in `confrontation-coverage.ts` becomes a projection
  of this registry (single source of truth — coverage and confront can no
  longer drift).
- `upt confront [--bridge=be-XX] [--sensitivity] [--json]`: new command
  module per the v0.30 CLI architecture (FlagSpec, `ctx.api` only, `--json`
  envelope additive, goldens for text output). No `--source` (not
  graph-parameterized). Default: run all registered confrontations, print a
  table (bridge, predicted, observed, residual/σ or bound verdict, citation),
  then the epistemics banner: confrontation ≠ confirmation; a passing
  confrontation is consistency, not proof.
- `upt coverage` gains nothing new — it already reads the (now
  registry-backed) confronted-id set.

### U3 — Five new confrontations (the Tier-1 targets)

Each follows the `be52-mercury-confrontation.ts` module pattern (typed
observation, pure `confrontBE1x()` function, dedicated test pinning the
numbers). Physics content per target — **all values below are DESIGN-TIME
CANDIDATES; Task 0 re-verifies each against the primary source before
implementation, and the implementation transcribes from the verified list,
not from this table**:

| id | bridge | prediction (closed form) | dataset (candidate) | kind |
|---|---|---|---|---|
| be-16 | Landauer | `E_min = k_B T ln 2` at T = 300 K | Bérut et al. 2012, Nature 483:187 — measured erasure heat approaches the Landauer bound (~0.7 kT reported asymptote vs ln 2 ≈ 0.693) | consistency |
| be-12 | thermal de Broglie | `λ_dB = h/√(2π m k_B T)`; BEC onset at `n λ³ ≈ ζ(3/2) ≈ 2.612` | a cold-atom condensation measurement (e.g. ⁸⁷Rb; exact dataset chosen at Task 0 — criterion: published n and T_c with uncertainties) | value |
| be-48 | GRW localization | GRW rate λ (bridge's encoded value ~1e-16 s⁻¹) vs experimental upper bound | LISA-Pathfinder bound (Carlesso et al. 2016, PRD 94:124036 — λ upper bound at r_C = 1e-7 m) | upper-bound |
| be-38 | MOND | `a₀ ≈ c H₀ / (2π)` from the bridge's cosmological-coincidence form | SPARC radial-acceleration relation, McGaugh et al. 2016, PRL 117:201101 — a₀ = 1.20 ± 0.02(stat) ± 0.24(sys) ×10⁻¹⁰ m s⁻² | value |
| be-23 | Planckian α table | `τ = ħ/(α k_B T)`, α per material | extend the existing confrontation to a per-material table (Bruin et al. 2013 Science 339:804 + Legros et al. 2019 Nat. Phys. 15:142 — α ≈ 1 across cuprates/heavy fermions) | value (per row) |

Confrontation count 3 → 8. `upt coverage`'s data column and the scorecard's
DATA flags update mechanically (registry-backed).

### U3b — Deciding-measurement sensitivity (P7)

`confront --sensitivity` (and a library fn `decidingMeasurement(bridgeId)`):
for `value`-kind confrontations, compute `|∂P/∂xᵢ| · σ(xᵢ)` per input via
`src/diff` (AST gradient when the bridge has an encoded RHS + peer present;
central-FD fallback), normalize to the prediction, and rank: "the residual
is most sensitive to improving measurement of X". Output is a ranked list
with the derivative values; for `upper-bound`/`consistency` kinds it reports
not-applicable honestly. This is the P7 deliverable scoped to confrontation
inputs only (NOT a general catalog-wide sensitivity sweep — YAGNI until a
consumer exists).

## Task-0 verification gate (mandatory, before any plan execution)

1. Verify each candidate dataset value/uncertainty against its primary
   source; produce `.superpowers/sdd/phase3/dataset-verification.md` with a
   per-number ✓/✗/replaced table. Any ✗ without a replacement drops that
   confrontation from the phase (ship 4 instead of 5 honestly).
2. Verify the bridge-side closed forms against the catalog encodings
   (`BRIDGE_EQUATIONS` RHS / evaluators) — the confrontation must use the
   bridge's OWN formulation, not a textbook lookalike (the BE-28 lesson).
3. Verify `src/diff` gradient coverage for the 5 bridges (which have AST
   encodings vs evaluator-only — BE-51/52 precedent says evaluator-only
   bridges need the FD path).
4. Re-measure the calibration benchmark EXPECTED at HEAD (must be untouched
   by this phase).

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

## Out of scope

Automated status promotion (governance text only); new bridge encodings;
uncertainty propagation through chains (Phase 5); catalog-wide sensitivity
sweeps; any dataset the Task-0 gate cannot verify.
