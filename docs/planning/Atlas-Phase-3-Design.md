# Atlas Phase 3 — design note (Sprint 3: hyperedges, models, and the poster index)

Authoritative over `Atlas-Roadmap-Implementation-Plan.md` where the two disagree.

---

## 0. The invariant this sprint is most likely to break, stated first

**A hyperedge composes only when EVERY premise edge is exact, and the composite's premises are the
union of the inputs' premises MINUS the internal conclusions.** Everything else in this sprint is
bookkeeping; this is the rule that can silently produce a false claim.

`IDENTITY_BOUND` is the identity **only in the norm a bridge states**, so a path mixing a normed
approximation with an unnormed exact equivalence yields the right magnitude attached to the wrong
norm — an error invisible in the arithmetic, which is why `boundPath` gates it by TYPE rather than
by comment. A hyperedge has the same exposure with more inputs: a Derivation over four premises has
four chances to pool an incompatible context and one composite number that will look fine.

**⚠ THE PLAN'S COUNT CLAIM IS A HYPOTHESIS, NOT A FACT.** The plan states that no test pins the
canonical count at 103 and that the number lives only in `CHANGELOG.md`, `ROADMAP.md` and the
architecture docs. **That list of places is unverified, and this repo has twice been bitten by a
number restated in several places where the stated list was incomplete** — the CLI command count
was in FOUR locations, two of which disagreed with each other by four. The count to trust is the one
MEASURED against the live registry, together with every literal found by grep. Whatever it turns
out to be, adding L1 entries must be gated the way the command count now is: a test that asserts
each prose figure against the LIVE registry, never against a literal, because a literal in the test
is one more place to rot.

---

## 1. `Statement` — a claim in a context, not a string

```
Statement {
  id;
  context: Context;          // quantity types, gauge/frame choices, conventions, assumptions
  model: ModelId;
  ast?: ExprNode;
  sourceExpression: string;
  display: string;
}
```

`context` is the load-bearing field and the reason `Statement` exists at all rather than reusing
`CanonicalEquation`. Two statements that render identically can be claims about different things
when their gauge, frame or assumption set differs, and the poster index will place exactly such
pairs next to each other.

`ast?` is optional on purpose: the sixteen poster entries include hidden supporting nodes (the
action principle, Noether, the full Maxwell set, the Lorentz group, the central limit theorem) whose
value is that they are NAMED and linked, not that they are evaluable. Requiring an AST would force
either a fabricated encoding or their exclusion, and both are worse than an honest
`sourceExpression` with no `ast`.

No `Statement` type exists in the tree — grep returns zero hits — so Sprint 3 creates it.

## 2. `Derivation` — many premises, one conclusion

```
Derivation {
  id;
  premises: StatementId[];
  conclusion: StatementId;
  sideConditions;
  contextUnion;              // COMPATIBILITY-CHECKED, never a merge
}
```

**`contextUnion` is checked, not computed.** Convention conflicts go through `checkConventions`,
whose contract is that `undefined` means UNKNOWN and is never a mismatch — an absent declaration
must not read as agreement. **Incompatible assumptions are NEVER pooled** (Blueprint v2 §5.2 step
2): a derivation whose premises assume mutually exclusive conditions has no context union and
therefore no composite, and that refusal is the correct output rather than an error.

This mirrors `boundPath`'s no-claim: the result type must make "these do not compose" expressible
without a number attached, so a caller cannot read a conclusion off a union that was never formed.

## 3. Multicategory composition

Only EXACT hyperedges compose. The composite's premises are the union of the inputs' premises minus
those premises satisfied by an input's conclusion (the internal conclusions).

The composition table governs the relation of each edge, and its 56 `no-composite-claim` cells apply
unchanged — a hyperedge cannot launder a pair that the binary table refuses. If a Derivation's edges
compose pairwise to `no-composite-claim`, the hyperedge does too.

## 4. The `Model` record

Promotes `AtlasModel`, adding `boundaryData`, `initialData` and `symmetryGroup?`.
`CanonicalEquation` gains `model?: string`.

`AtlasModel` is `src/atlas/types.ts:137-155` — nine readonly fields: `id`, `family`, `stateSpace`,
`dynamics`, `observables`, `parameters`, `dimensionlessInputs`, `canonicalRefs`, `regime`. The nine
models are `ATLAS_MODELS` at `src/atlas/oscillators/models.ts:48`, in the order pinned by
`tests/atlas/models.test.ts:82-95`: spring · lc · damped-spring · rlc · pendulum · chain · wave-1d ·
cubic-spring · first-order. `family` and `regime` come from the local `model()` helper
(`models.ts:36-46`), so each literal writes only the other seven.

**`boundaryData` and `initialData` are OPTIONAL, against the plan's wording**, which marks only
`symmetryGroup` optional. No boundary or initial data is recorded anywhere for these nine ODE
models, so a required field forces either nine fabricated values or nine empty ones asserting
"none". `models.ts:5-10` refuses exactly that fabrication for `inequalities`, and the same reasoning
transfers unchanged — **an absent field says "not recorded"; a present empty one says "there are
none", and only one of those is true.** Optional also preserves the additive-overlay discipline the
earlier atlas sprints hold to: the nine literals stay byte-identical.

**The migration risk is the serializer, not the type.** `src/atlas/serialize.ts:111-123` enumerates
fields EXPLICITLY, so a new optional field is invisible to JSON until added there — good — but a
naive spread would change every serialized model and break `tests/atlas/atlas-json.test.ts`'s
deep-equal against the committed artifact. Append conditionally, matching the existing
optional-field idiom at `serialize.ts:107`.

`AtlasModel` has zero hits in `tests/api/public-surface.test.ts`, so widening it is not pinned by
the public-surface guard — but it IS on the `src/cli-api.ts:146` surface.

## 5. The poster index

**The poster index's source of truth is Appendix A of Blueprint v2, which is an EXTERNAL document,
cited but not vendored.** `ROADMAP.md:12-24` lists it among the source documents;
`find . -iname "*blueprint*"` returns nothing outside `node_modules`; every "Appendix A" hit in the
tree is a REFERENCE to it except `docs/specification/Part-I.md:575`, which is UPT's own unrelated
Notation Glossary. **No file in this repo maps entry number → name, so the sixteen entries are
specified by that document and by nothing here.**

They must be transcribed from it, never reconstructed from the edge relations below: an invented
entry would be plausible and uncheckable, which is the failure §0 exists to prevent.

`7 ↔ 16` is an ASSOCIATION for the historical link only — NOT a derivation edge. Otherwise the link
between the full Maxwell set and spacetime structure is the hyperedge
`{full Maxwell, spacetime structure} → 16`. `6 ↔ 13` carries self-adjoint and lower-bounded, with
`V = 0` only for the Gaussian kernel.

## 6. `upt map --source=poster`

Junctions enter `buildVizModel` from exactly two places (`graph-viz.ts:557-560`):
`edges.map(edgeToJunction)` and `opts.extraJunctions`. Filtering happens AFTER that merge, over
both, at `565-580` via `judge` (`241-255`). **So a `poster` source fed in as `extraJunctions` cannot
quietly bypass the filters** — it is filtered, clustered and legended like every other junction, and
one carrying neither `relation` nor `beId` lands in the legend's `droppedMissingMetadata` bucket by
construction. Clusters are union-find over junctions sharing a canonical quantity (`componentsOf`,
`327-370`); `anchored` keys on `'law'|'established'` only (`362`), so poster junctions never anchor a
cluster — correct by default, recorded because it is a decision rather than an accident.

**Adding `'poster'` to `VizStatus` forces three edits and only two of them fail loudly.**
`STATUS_STYLE` is `Record<VizStatus, …>` (`176-185`), so a missing entry is a COMPILE error;
`VizStatus` is on the public surface (`tests/api/public-surface.test.ts:335`), so widening it is a
public-API change; but `STATUSES_IN_ORDER` (`402-409`) is a plain array, so a missing entry
**silently omits the Mermaid classDef**. That is the vacuous-pass shape — add the entry and break it
deliberately to confirm the omission is visible before trusting it.

`VizOptions.relation?` and `.evidence?` carry a legend reporting two DISTINCT drop reasons — "did
not match" and "no overlay metadata" — because a silent drop makes an incomplete graph look
complete. A `poster` source must state how it interacts with those filters rather than quietly
bypassing them. The measured case: `--relation=approximation` keeps ZERO edges because 137 of 144
carry no relation overlay, and the legend is what makes that visible. A poster source that returns
an empty or partial graph must say why in the same way.

## 7. Boundaries

- Every new symbol is `@internal` and stays off `src/index.ts` before Phase 6.
- **NEVER THE BARREL.** `src/bridges/` and `src/composition/` must not import `src/atlas/index.ts`.
  The stricter rule stated elsewhere — "types only, from `src/atlas/types.ts`" — does not describe
  this tree: value imports exist at `bridges/index.ts:40`, `composition/compose.ts:46-47` and
  `graph-viz.ts:28`. `docs:deps` reports 0 circular dependencies, so the INVARIANT holds while the
  overstated rule does not. A rule stricter than the invariant it protects gets silently violated by
  working code.
- `EinsteinFieldEquationNode` is at `src/dimensional/ast-types.ts:196`, and `src/dimensional/**`
  imports nothing from atlas, composition or bridges. A `Statement` referencing it runs
  atlas → dimensional, the same direction the tree already uses, so it introduces no cycle.
- Adding L1 entries moves a count stated in prose in several files. Gate it (see §0) or it drifts.

## 8. Out of scope, deliberately

- Evaluating hidden supporting nodes. They are named and linked; that is the deliverable.
- Widening the composition table. That remains a reviewed act per Phase 2 §4.
- Anything that changes what `upt confront` prints — `tests/cli/golden/confront.txt` stays byte-identical.

## 9. Adam A3 — questions to put

**Questions 4–6 are askable from the tree. Questions 1–3 are not**, because each asks whether this
note matches Appendix A, which is not in the repo (§5). Do not put them and accept an answer: a
reviewer asked to check against a source it cannot see returns a plausible verdict that verifies
nothing — the same vacuous-pass shape §6 and question 4 both describe. Hold them until the source
document is here.

1. Every poster edge type against Appendix A, line by line.
2. That `7 ↔ 16` is an association for the historical link only, and that the hyperedge
   `{full Maxwell, spacetime structure} → 16` is the correct form otherwise.
3. That `6 ↔ 13` carries self-adjoint + lower-bounded, with `V = 0` only for the Gaussian kernel.
4. **Whether the hidden-node test is MEANINGFUL** — i.e. whether it can fail. A test over nodes that
   are named-but-not-evaluated is exactly the shape that passes vacuously, and this project has
   found three tests that asserted a defect as intent plus one filter that could not match anything.
5. Whether `contextUnion`'s refusal path is reachable from the sixteen entries as specified, or
   whether it is a guard against a condition this sprint's data cannot produce — dead code that
   LOOKS like a safeguard, which `path-bound.ts` already documents as a failure to refuse.
6. Whether making `boundaryData` and `initialData` optional (§4) is right, or whether it defers a
   modelling decision that ought to be forced now. For optional: no such data exists for the nine ODE
   models and a required field would manufacture it. Against: an optional field lets later sprints
   build on models that silently have no boundary conditions. Put BOTH sides — this is the decision
   most likely to be wrong here.
