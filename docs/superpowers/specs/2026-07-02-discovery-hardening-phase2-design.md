# Discovery-Hardening Phase 2 (v0.32.0): Axis-Compatibility Falsifier + Honest Connectivity — Design

**Date:** 2026-07-02 · **Status:** r2 — revised after Adam RED + Eve YELLOW
(dispositions in the review record at the bottom); pending Adam re-vet
**Program:** `2026-07-02-discovery-hardening-program-design.md` Phase 2 (P1 + P6)
**Substrate recon:** verified at HEAD `b8e97cb`

## Problem

The funnel's falsifiers cannot see mechanism. `grw-localization-rate ≟
hubble-rate` scores 7/promising although one is a quantum-collapse rate and
the other a cosmological expansion rate — information the framework's own
axis vocabulary (`RegimeAttributes`) can express but vetting never consults.
Separately, the connectivity picture is dishonest: `upt map`/`connectors`
default to the catalog graph, reporting 20 isolated bridges while the
canonical L-layer's definitional links sit behind a non-default flag.

## What already exists (recon summary)

- `Quantity.attributes: RegimeAttributes` (`src/composition/quantity.ts:24-33`)
  — sparse optional `scale`/`force`/`information`; `regimesDiffer()` (`:69-79`)
  compares with a both-stated rule; it also decides edge `kind:'law'|'bridge'`.
- Vetting verdict/score chain at `src/composition/discovery.ts:371-391`;
  candidates born in `bridge-analysis.ts:471-520`. The magnitude gate already
  models **abstention** (`magnitudeChecked: false`).
- `--source` defaults to `'catalog'` at `src/cli/graphs.ts:20` for all 8
  graph-parameterized commands.
- `canonicalToEdges` (`canonical-graph.ts:132-168`) projects canonical
  equations as `kind:'law'` edges but silently DROPS the information axis
  (kebab-vs-camelCase enum mismatch with `core/types.ts:44-48`) — which also
  means the law/bridge kind classification of projected edges never sees that
  axis.

## Design decisions

### D0 — Sequencing (Eve LOW-6, accepted)

Land in this order: D4 enum-fix first (isolated, attributable), then D1 gate
core, then D2 tranche, then CLI surfacing, then D3 defaults, then D5
cleanups (union growth commits BEFORE the root co-export commit).

### D1 — Axis clash is an IDENTITY falsifier with abstention

Discovery candidates are **identifications** (`a ≡ b` — one quantity, two
names), not bridges. For a literal identity, stated regime attributes must
agree: one quantity cannot be both `scale:'quantum'` and
`scale:'cosmological'`. The gate:

- For the **scale** and **force** axes: BOTH endpoints state the axis and
  values differ → falsified. Either side silent → **abstain**
  (`axisChecked: false` for that axis). Information axis: annotation only
  this phase — deliberately excluded from falsification until its data is
  dense enough to trust (D4 merely stops the data being dropped; this
  resolves Adam #6's ambiguity: excluded now, revisited when load-bearing).
- **Verdict precedence (Adam #1, accepted):** `magnitude-clash` →
  `contradictory` → **`axis-clash`** → promising/inert. The numerical
  falsification is the stronger signal and now outranks the qualitative one;
  magnitude stays first only because that ordering is already pinned.
- `axisClashes: readonly string[]` (e.g. `['scale: quantum ≠ cosmological']`)
  and `axisChecked` are populated on EVERY candidate regardless of which
  verdict wins — no falsifier shadows another's annotation (Adam #1
  corollary).
- **Visibility (Adam #2, partially accepted):** axis-clashed candidates are
  never hidden. They get their own always-printed `AXIS-CLASH` section in
  `upt discover`, exactly like `MAGNITUDE-CLASH` — a labeled falsifier
  bucket, not deletion. Score −1 like other falsified verdicts. No positive
  score for axis agreement (YAGNI).
- **Why this does not recreate the "falsifies what UPT exists to surface"
  trap:** (a) the gate tests identity, and the funnel's own docs define
  candidates as identifications; (b) the magnitude gate already falsifies
  cross-regime coincidences quantitatively — this is its qualitative twin,
  not a new epistemic category; (c) D2's conservative tranche means the gate
  initially fires only where the clash is uncontroversial. Concrete
  discrimination: `grw-localization-rate ≟ hubble-rate` (both endpoints
  clearly taggable, clash) is killed; `thermal-wavelength ≟ planck-length`
  (both contestable, stay untagged) **abstains and remains promising** — the
  Dirac-style coincidence survives for physicist eyes.
- **Union-growth caveat (Eve #2, accepted as documentation + ordering):**
  adding `'axis-clash'` to `VettedCandidate['verdict']` breaks downstream
  exhaustive switches at type-check time. 0.x minor per repo practice, but
  the CHANGELOG carries an explicit TypeScript exhaustive-switch note, and
  the union-growth commit precedes the D5 root co-export commit. Major bump
  / feature flag rejected as disproportionate at 0.x (grounds: precedent —
  v0.13/v0.14 grammar unions grew the same way).

### D2 — Tag densification: conservative, reviewed, generic-free

- Tranche scope: ONLY quantities participating in current cross-cluster
  candidate pairs (measured in plan Task 0), ONLY where standard usage is
  unambiguous, each assignment carrying a rationale.
- **Generic quantities are NEVER tagged** (Adam #3, accepted): `mass`,
  `radius`, `time`, `temperature`, `energy`, and similar multi-regime
  generics stay attribute-free — they are regime-generic by nature, and the
  subsuming guard already handles generic↔specific pairs. Contestable
  specifics (`planck-length`, `thermal-wavelength`) also stay untagged in
  tranche v1: abstention is the honest default.
- **Review treatment (Adam #3, accepted):** the assignment table gets its own
  Adam+Eve adjudication pass during the phase (the seeds precedent), plus an
  integrity test (every assignment has a rationale; values in the allowed
  unions; no generic-list member tagged).
- **Placement (Eve #3, rejected with grounds):** assignments stay in the
  quantity definition files' existing `attributes` field — it IS the
  registry; a sidecar file would create two sources of truth for one field.
  The reviewable artifact is the adjudicated assignment table in the design
  review, not a parallel data structure.

### D3 — Honest connectivity: `both` default for `map` + `connectors` ONLY

(Scope shrunk from r1's map/connectors/discover — Adam #4 + Eve #4,
accepted.) `map` and `connectors` ask pure connectivity questions and get
`--source=both` defaults (per-command, not at `graphs.ts:20`). **`discover`
keeps its catalog default**: its funnel line, goldens, adjudication fold-out,
and JSON counts stay stable, and catalog-triage remains a coherent question;
`both` is one flag away and documented. Fallout checklist (Eve #4, accepted):
`upt help map`/`connectors` text, `cli/README.md` per-command default table +
rationale, README examples, and `docs/architecture/PHYSICS_MAP.md`
regeneration reviewed (its content changing to the both-graph is the
intended honesty — the regeneration commit says so; a catalog-only variant
remains available via flag and is shown alongside). Goldens for the two
commands re-pin; CHANGELOG headline behavior change.

**Law-edge tranche: NOT built.** Canonical law-edges via the both-default do
the connecting; hand-added catalog law-edges would duplicate them. Recorded
non-feature; revisit only if catalog-only isolation reporting misleads again.

### D4 — Information-enum reconciliation (lands first)

`attributesOf` in `canonical-graph.ts` maps camelCase `InformationMeasure` →
kebab `RegimeAttributes.information`, so projection stops silently dropping
the axis. This matters beyond annotation: `regimesDiffer` drives the
projected edges' `law`/`bridge` kind, which currently never sees the
information axis. Annotation-only for vetting this phase. Behavior change to
edge kinds, if any, is measured and reported in the commit (expected: none —
canonical endpoints rarely state information on both sides; verify).

### D5 — Deferred-minor cleanups (after D1 settles)

1. Co-export `VettedCandidate` + `rankDiscoveries` from `src/index.ts`
   (public-surface snapshot per protocol) — lands AFTER the union-growth
   commit.
2. `discover.ts`: compute `annotateAdjudications` only on the non-`--derive`
   path.

### D6 — Benchmark protocol invoked (with the ledger-interaction check)

- `EXPECTED` block in `discovery-calibration.test.ts` updates in the SAME
  commit as the gate, with before→after counts and the per-candidate delta
  list in the commit message; the new `axis-clash` count is pinned.
- **Ledger interaction (Eve #1, the real kernel of a partly-wrong finding):**
  the ledger stores HUMAN verdicts (`decoy`/`entailed`/…), never funnel
  verdicts — there is no stored-verdict string to go stale. But a seeded pair
  whose FUNNEL verdict moves out of `promising` (e.g. to `axis-clash`) drops
  out of the discover summary line's "N of the M promising" count; the
  same-commit golden re-pin must verify those lines and the Phase-1
  benchmark's no-resurface test still passes (it does trivially — the pair
  is no longer promising). This check is an explicit plan step.
- Canonical-only invariants: `contradictory = 0` AND `axis-clash = 0` — the
  latter pinned **for the current tranche** (Adam #5 + Eve #5, accepted): a
  future tag addition that fires it must either fix the tag or consciously
  update the pin with justification, same update protocol as the counts.
- Dated appendix to `docs/research/discovery-precision-calibration.md`
  recording what the gate kills, what it abstains on, and the tranche table.

## Epistemic framing (binding on all user-facing text)

An `axis-clash` is evidence against LITERAL IDENTITY of two quantities, not
against interesting cross-regime physics between them. Output wording:
"identification falsified (stated regimes differ)", never "no connection
possible". The firewall is untouched: tags and verdicts annotate/gate
discovery output; nothing mutates the catalog, graphs, or proposals.

## Out of scope (Phase 2)

Symmetry/topology axes; positive axis scoring; densifying all 131
quantities; information-axis falsification; discover default change; any
`vetLinkCandidate` change beyond the one new gate; π-groups and consequence
propagation (Phase 4); uncertainty on representative values (Phase 5).

## Testing

Unit tests for the axis gate (clash / agree / abstain-one-side /
abstain-both / clash-shadowed-by-contradictory still carries axisClashes);
tranche integrity test (rationale present, union values, no generics);
benchmark EXPECTED update with break-then-restore; golden re-pins for
map/connectors defaults + discover's new AXIS-CLASH section; `--json`
contract additions; canonical-only `axis-clash = 0` invariant; D4
edge-kind-delta measurement.

## Adversarial review record (r1 → r2, 2026-07-02)

Adam (gemini-2.5-pro) **RED** · Eve (o3) **YELLOW**. Folded: precedence
reorder contradictory>axis-clash + always-populated annotations (Adam #1);
never-hidden AXIS-CLASH bucket + generic/contestable quantities untagged +
tranche gets its own Adam+Eve pass (Adam #2/#3 — the concrete
discrimination: grw≟hubble dies, thermal-wavelength≟planck-length survives
via abstention); discover keeps catalog default, D3 shrinks to
map+connectors (Adam #4, Eve #4); canonical axis-clash pin scoped "current
tranche" with update protocol (Adam #5, Eve #5); D4-first + co-export-last
sequencing (Eve #6); union-growth CHANGELOG TS note + intra-release ordering
(Eve #2); information-axis D1-vs-D4 ambiguity resolved in text (Adam #6);
PHYSICS_MAP/help-text fallout checklist (Eve #4). Rejected with grounds:
Eve #1's mechanics (the ledger stores human verdicts only; no funnel-verdict
string exists to go stale — the folded residue is the golden/benchmark
same-commit check); Eve #3's sidecar registry (attributes field is the
single source of truth); major-bump/feature-flag for the union growth
(0.x precedent).
