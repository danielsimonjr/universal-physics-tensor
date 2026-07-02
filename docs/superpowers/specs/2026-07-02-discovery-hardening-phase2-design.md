# Discovery-Hardening Phase 2 (v0.32.0): Axis-Compatibility Falsifier + Honest Connectivity — Design

**Date:** 2026-07-02 · **Status:** r3 — r2 was Adam GREEN, but the Phase-2
Task-0 verification gate measured a substrate that invalidates r2's premises
(see "Corrected substrate"); r3 pivots D2 from tag-ADDITION to tag-AUDIT and
reorders audit-before-gate. Pending Adam+Eve re-vet.
**Program:** `2026-07-02-discovery-hardening-program-design.md` Phase 2 (P1 + P6)
**Substrate recon:** r1 recon verified at `b8e97cb`; r3 corrections measured
by Task 0 (`.superpowers/sdd/phase2/task-0-report.md`) and controller-verified
by direct grep.

## Corrected substrate (Task-0 measurements; r2's premises struck)

1. **The registry is NOT sparse.** 58 of 59 in-scope registry quantities
   already carry `RegimeAttributes`. Under r2's gate, **90 of 132 catalog
   candidates (68%) and 332 of 439 both-source candidates would axis-clash
   on day one from EXISTING tags** — including 7 of the 12 catalog promising
   (`grw-localization-rate ≟ hubble-rate`, `grw ≟ mutation-rate`,
   `mass ≟ scalar-field-{reference,value}`, `schwarzschild-radius ≟
   {boundary,coarsening}-length`, `thermal-wavelength ≟ coarsening-length`).
   r2's "conservative tranche makes the gate fire only where uncontroversial"
   is false as written: the tags already exist and were never reviewed for
   this purpose.
2. **`mass` — r2's own first "never tag" generic — is already tagged**
   `{scale:'classical', force:'gravitational'}`
   (`quantities/fields.ts:25-29`); `temperature` (also generic) is tagged
   `{scale:'classical'}`; `planck-length` (r2: "pre-decided UNTAGGED") is
   tagged `{quantum, gravitational}`.
3. **`regimesDiffer` has ZERO call sites** (grep: definition only at
   `quantity.ts:69`). It drives nothing at runtime; edge kinds are
   hand-authored literals, and `canonicalToEdges`' `toEdge` hardcodes
   `kind:'law'`. r2's D4 rationale ("regimesDiffer drives projected edges'
   kind") is false.
4. **Candidate names are post-canonicalization** (QUANTITY_IDENTIFICATIONS
   folding: `hawking-temperature`→`temperature`, …). Attribute lookups must
   resolve through the same fold, and folds can carry attribute CONFLICTS
   (`temperature`: base `classical`; folded-in `hawking-temperature`
   contributors `quantum`/`gravitational`).
5. **Attributes ARE runtime-load-bearing elsewhere:** `placeQuantity`/
   `buildRegimeTensor` (`upt predict`) read scale/force — attribute edits
   have predict-side blast radius (goldens checked in the audit commit).

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

### D0 — Sequencing (r3: AUDIT BEFORE GATE)

Land in this order: D4 enum-fix first (isolated, attributable), then **D2
attribute AUDIT** (the tags must be trustworthy before anything gates on
them), then D1 gate + CLI surfacing (one commit), then D3 defaults, then D5
cleanups (union growth commits BEFORE the root co-export commit). The
Adam+Eve adjudication of the audit table happens BEFORE the audit task
dispatches.

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
- **Fold-conflict abstention (r3, Task-0 #4):** candidate names are
  post-canonicalization, so a node's effective attributes must be resolved
  through the same QUANTITY_IDENTIFICATIONS fold. Where folded contributors
  DISAGREE on an axis (`temperature`: base `classical` vs folded-in
  `quantum`/`gravitational`), that axis counts as UNSTATED for the gate —
  conflict → abstain, with a dedicated regression test using the
  temperature fold as its fixture (Eve r3 #5). **Single resolver mandate
  (Eve r3 #2, accepted):** ONE exported effective-attributes-through-fold
  function lives with the fold data; the gate (and any future consumer)
  imports it — no second implementation may exist.
- **Machine-readable delta (Eve r3 #6, accepted):** the calibration
  benchmark pins not only the new counts but the LIST of pairs that
  flipped verdict at the gate commit — later drift fails fast in CI, not
  in an appendix.
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

### D2 — Attribute AUDIT tranche (r3 pivot: the tags exist; review them)

The work is no longer adding tags to a blank registry — it is making the
EXISTING 58-quantity attribute surface trustworthy enough to gate on:

- **Strip generics** (the r2 rule, now enforced against reality): `mass`,
  `temperature`, `radius`, `time`, `energy`, and similar multi-regime
  generics LOSE any attributes they carry. This is a behavior change to
  `upt predict`'s regime placement (attributes are read by
  `placeQuantity`) — measured, golden-checked, and called out in the
  commit. It also REVERSES two of Task-0's day-one flips
  (`mass ≟ scalar-field-*` return to promising via abstention) — the
  generic rule working as intended.
- **Resolve fold conflicts**: where QUANTITY_IDENTIFICATIONS folds
  quantities with conflicting attributes into one node (`temperature`),
  the audit records the conflict and the resolution. Safety net in D1: the
  gate ALSO implements conflict→abstain (an axis whose folded contributors
  disagree counts as unstated), with a test — defense in depth.
- **Adjudicate the contested**: `planck-length`'s existing
  `{quantum, gravitational}` and every other already-tagged in-scope
  quantity gets an explicit keep/strip/change row in the audit table with
  rationale. Task-0's 6 proposed second-axis completions are additional
  rows. The FULL table (keeps included) gets the Adam+Eve adjudication
  pass — the r2 promise, now over the real surface.
- **Integrity test**: generics carry no attributes; every audited
  assignment matches the adjudicated table; values within the unions.
- **Consumer enumeration (r4, Eve #4's kernel — her named consumers were
  verified fabricated):** the audit task grep-enumerates EVERY runtime
  consumer of quantity attributes before stripping. Known at design time:
  `bridge-prediction.ts` (`upt predict` placements — gets its own
  EXPECTED-style before/after pin in the audit commit, Eve #1 accepted),
  `canonical-graph.ts` projection, and `src/bridges/membership.ts` (the
  bridge-membership criterion is phrased over shared regime attributes —
  the audit must check whether membership adjudication is COMPUTED from
  attributes and pin its outputs if so).
- **Impact measurement, not a dark gate (Eve #3, alternative accepted):**
  the audit commit re-runs Task-0's would-be-gate measurement post-audit
  and records "would-clash 90 → N" in its report; the gate commit's
  benchmark delta must MATCH that prediction (cross-checked pair by
  pair). This gives reviewers two separately-reviewed numbers without
  shipping dark-mode/enforce-flag machinery (rejected: Adam's
  no-escape-hatch grounds + YAGNI).
- **Governance (Adam r3 loose end, accepted):** post-audit attribute
  changes are conscious commits — the integrity test pins the table, so
  any change requires updating the pinned table with a rationale, same
  protocol as the benchmark counts and the adjudication ledger.
- **Placement** (unchanged from r2): the `attributes` fields in the
  quantity definition files remain the single source of truth; the
  adjudicated audit table is the review artifact.
- **Day-one honesty**: even after the audit, the gate WILL flip several
  currently-promising candidates immediately (e.g. `grw-localization-rate ≟
  hubble-rate` if its endpoints' tags survive audit). That is now a
  deliberate, tag-quality-assured outcome — recorded pair-by-pair in the
  benchmark delta and the calibration-doc appendix — not the gradual
  ramp-up r2 imagined.

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
commands re-pin; **an explicit `--source=catalog` golden case is ADDED for
map** (r3, Task-0 finding: the default `map-text` golden would otherwise
become byte-identical to `map-text-both`, silently losing catalog-only
coverage). CHANGELOG headline behavior change.

**Law-edge tranche: NOT built.** Canonical law-edges via the both-default do
the connecting; hand-added catalog law-edges would duplicate them. Recorded
non-feature; revisit only if catalog-only isolation reporting misleads again.

### D4 — Information-enum reconciliation (lands first; r3 rationale corrected)

`attributesOf` in `canonical-graph.ts` maps camelCase `InformationMeasure` →
kebab `RegimeAttributes.information`, so projection stops silently dropping
the axis. **r2's edge-kind rationale was false** (Task 0 + grep:
`regimesDiffer` has zero call sites; `toEdge` hardcodes `kind:'law'`), so
there is no kind path and no delta ceremony — this is a pure
annotation-correctness fix, TDD'd, with the hardcoded-kind fact recorded in
the module docstring for the next reader. Information stays
annotation-only for vetting this phase.

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

## r3 → r4 re-vet record (2026-07-02)

Adam (gemini-2.5-pro) r3: **GREEN** — endorsed the audit pivot, generic
stripping (predict trade explicitly reasoned: correctness over coverage),
fold-conflict abstention over a ban, NO escape-hatch flag; one loose end
folded (audit-table governance). Eve (o3) r3: **YELLOW**, dispositions:
#1 predict EXPECTED pin in the audit commit — ACCEPTED; #2 single shared
fold/effective-attributes resolver — ACCEPTED as a design mandate; #3
dark-gate/enforce-flag sequencing — REJECTED (Adam's no-escape-hatch
grounds + YAGNI), its review-value kernel folded as the audit-commit
would-clash re-measurement that the gate commit's delta must match; #4
consumer list — her four named consumers verified FABRICATED by grep
(no dedupe-trainer, no attribute-driven map legend or explain line); the
kernel folded as mandatory consumer enumeration, which surfaced the REAL
additional consumer she missed (`bridges/membership.ts`); #5 temperature
fold regression test — ACCEPTED; #6 machine-readable flipped-pair pin —
ACCEPTED; #7 "dead kind-path branch" — FABRICATED (no such branch;
docstring records reality); #8a enum-fix-with-dark-gate — moot with #3
rejected.

## Verification-gate revision record (r2 → r3, 2026-07-02)

Phase-2 Task 0 (the plan's own pre-execution gate) measured the substrate
and invalidated r2's premises: the registry is densely tagged (68% of
catalog candidates would clash day-one; 7/12 promising flip), `mass` and
`planck-length` were already tagged in violation of r2's rules, and
`regimesDiffer` has zero call sites (D4's kind rationale false). r3 pivots
D2 to an AUDIT tranche (strip generics — with measured `upt predict`
blast radius; adjudicate keeps/strips/changes over the full existing
surface; resolve fold conflicts), reorders audit-before-gate, adds the
fold-conflict→abstain rule to D1, corrects D4's rationale, and adds the
explicit catalog-only map golden to D3. Day-one funnel impact is now an
explicit, tag-quality-assured, pair-by-pair-recorded outcome rather than
r2's imagined gradual ramp. Controller-verified Task-0's key claims by
direct grep (mass/temperature/planck-length tags; regimesDiffer call
sites) before revising.

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
