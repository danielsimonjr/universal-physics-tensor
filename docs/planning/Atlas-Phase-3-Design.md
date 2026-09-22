# Atlas Phase 3 — design note (Sprint 3: hyperedges, models, and the poster index)

Authoritative over `Atlas-Roadmap-Implementation-Plan.md` where the two disagree. The plan is a
frozen record written before Sprints 0–2 ran; this note is written after them and carries what they
taught.

**Status:** DRAFT. §4, §6 and §7 are now filled from SC3b's measurements. **§5 is BLOCKED on a
source document that is not in this repo** — see §5. Q2 (L1 registration) and Q3 (the canonical
count) are still unanswered: SC3a wedged after Q1 and was stopped. Nothing here is filled from the
plan's assertions — see §0.

---

## 0. The invariant this sprint is most likely to break, stated first

**A hyperedge composes only when EVERY premise edge is exact, and the composite's premises are the
union of the inputs' premises MINUS the internal conclusions.** Everything else in this sprint is
bookkeeping; this is the rule that can silently produce a false claim.

Sprint 2 established why, and the reasoning transfers directly. `IDENTITY_BOUND` is the identity
**only in the norm a bridge states**, so a path mixing a normed approximation with an unnormed exact
equivalence yields the right magnitude attached to the wrong norm — an error invisible in the
arithmetic, which is why `boundPath` gates it by TYPE rather than by comment. A hyperedge has the
same exposure with more inputs: a Derivation over four premises has four chances to pool an
incompatible context and one composite number that will look fine.

**⚠ THE PLAN'S COUNT CLAIM IS A HYPOTHESIS, NOT A FACT.** The plan states that no test pins the
canonical count at 103 and that the number lives only in `CHANGELOG.md`, `ROADMAP.md` and the
architecture docs. **This repo was bitten twice on 2026-09-21 by a number restated in several
places, and both times the stated list of places was incomplete** — the CLI command count was in
FOUR locations, two of which disagreed with each other by four. SC3 is therefore instructed to
report the count it MEASURES and every literal it FINDS, not whether the plan's claim was true.
Whatever it returns, adding L1 entries must be gated the way the command count now is: a test that
asserts each prose figure against the LIVE registry, never against a literal, because a literal in
the test is one more place to rot.

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
whose Sprint 1 contract is that `undefined` means UNKNOWN and is never a mismatch — an absent
declaration must not read as agreement. **Incompatible assumptions are NEVER pooled** (Blueprint v2
§5.2 step 2): a derivation whose premises assume mutually exclusive conditions has no context union
and therefore no composite, and that refusal is the correct output rather than an error.

This mirrors `boundPath`'s no-claim: the result type must make "these do not compose" expressible
without a number attached, so a caller cannot read a conclusion off a union that was never formed.

## 3. Multicategory composition

Only EXACT hyperedges compose. The composite's premises are the union of the inputs' premises minus
those premises satisfied by an input's conclusion (the internal conclusions).

The Sprint 1 composition table governs the relation of each edge, and its 56 `no-composite-claim`
cells apply unchanged — a hyperedge cannot launder a pair that the binary table refuses. If a
Derivation's edges compose pairwise to `no-composite-claim`, the hyperedge does too.

## 4. The `Model` record

Promotes Sprint 0's `AtlasModel`, adding `boundaryData`, `initialData` and `symmetryGroup?`.
`CanonicalEquation` gains `model?: string`.

**MEASURED (SC3b).** `AtlasModel` is `src/atlas/types.ts:137-155` — nine readonly fields: `id`,
`family`, `stateSpace`, `dynamics`, `observables`, `parameters`, `dimensionlessInputs`,
`canonicalRefs`, `regime`. The nine models are `ATLAS_MODELS` at `src/atlas/oscillators/models.ts:48`,
in the order pinned by `tests/atlas/models.test.ts:82-95`: spring · lc · damped-spring · rlc ·
pendulum · chain · wave-1d · cubic-spring · first-order. `family` and `regime` come from the local
`model()` helper (`models.ts:36-46`), so each literal writes only the other seven.

**DECISION — `boundaryData` and `initialData` are OPTIONAL, against the plan's wording.** The plan
marks only `symmetryGroup` optional. SC3b flagged that as self-contradictory and it is: no
boundary or initial data is recorded anywhere for these nine ODE models, so a required field forces
either nine fabricated values or nine empty ones asserting "none". `models.ts:5-10` already refuses
exactly that fabrication for `inequalities`, and the same reasoning transfers unchanged — **an
absent field says "not recorded"; a present empty one says "there are none", and only one of those
is true.** Optional also preserves the additive-overlay discipline Sprints 1 and 2 both held to:
nine literals stay byte-identical.

**The one real migration risk is the serializer, not the type.** `src/atlas/serialize.ts:111-123`
enumerates fields EXPLICITLY, so a new optional field is invisible to JSON until added there — good
— but a naive spread would change every serialized model and break
`tests/atlas/atlas-json.test.ts`'s deep-equal against the committed artifact. Append conditionally,
matching the existing optional-field idiom at `serialize.ts:107`.

`AtlasModel` has zero hits in `tests/api/public-surface.test.ts`, so widening it is not pinned by
the public-surface guard — but it IS on the `src/cli-api.ts:146` surface.

## 5. The poster index

**⛔ BLOCKED — the sixteen entries are not enumerated anywhere in this repo.** SC3a measured it and
correctly refused to reconstruct them: Blueprint v2 and its Appendix A are EXTERNAL source
documents, cited but never vendored. `ROADMAP.md:12-24` lists the three source documents "written
2026-09-20" as inputs; `find . -iname "*blueprint*"` returns nothing outside `node_modules`. Every
"Appendix A" hit in the tree is a REFERENCE to it except `docs/specification/Part-I.md:575`, which
is UPT's own unrelated Notation Glossary.

So no file maps entry number → name, and **this section cannot be filled by measurement — it needs
the source document.** Reconstructing sixteen poster entries from the edge relations quoted below
would be fabrication of exactly the kind §0 exists to prevent, and it would be undetectable:
plausible entries that no one can check against anything. The remainder of Sprint 3 (§1–§4, §6)
does not depend on this and proceeds.

⏳ SC3 Q2 (the L1 registration mechanism) is still unanswered — SC3a wedged before reaching it.

`7 ↔ 16` is an ASSOCIATION for the historical link only — NOT a derivation edge. Otherwise the link
between the full Maxwell set and spacetime structure is the hyperedge
`{full Maxwell, spacetime structure} → 16`. `6 ↔ 13` carries self-adjoint and lower-bounded, with
`V = 0` only for the Gaussian kernel.

## 6. `upt map --source=poster`

**MEASURED (SC3b), and the answer is better than the section assumed.** Junctions enter
`buildVizModel` from exactly two places (`graph-viz.ts:557-560`): `edges.map(edgeToJunction)` and
`opts.extraJunctions`. Filtering happens AFTER that merge, over both, at `565-580` via `judge`
(`241-255`). **So a `poster` source fed in as `extraJunctions` cannot quietly bypass the filters** —
it is filtered, clustered and legended like every other junction, and one carrying neither
`relation` nor `beId` lands in the legend's `droppedMissingMetadata` bucket by construction.
Clusters are union-find over junctions sharing a canonical quantity (`componentsOf`, `327-370`);
`anchored` keys on `'law'|'established'` only (`362`), so poster junctions never anchor a cluster —
correct by default, recorded because it is a decision rather than an accident.

**The trap SC3b found: adding `'poster'` to `VizStatus` forces three edits and only two of them
fail loudly.** `STATUS_STYLE` is `Record<VizStatus, …>` (`176-185`) so a missing entry is a COMPILE
error; `VizStatus` is on the public surface (`tests/api/public-surface.test.ts:335`) so widening it
is a public-API change; but `STATUSES_IN_ORDER` (`402-409`) is a plain array, so a missing entry
**silently omits the Mermaid classDef**. That is the vacuous-pass shape again — add the entry and
break it deliberately to confirm the omission is visible before trusting it.

Note that Sprint 2 added
`VizOptions.relation?` and `.evidence?` with a legend that reports two DISTINCT drop reasons —
"did not match" and "no overlay metadata" — because a silent drop makes an incomplete graph look
complete. A `poster` source must state how it interacts with those filters rather than quietly
bypassing them.

Sprint 2's measured lesson applies: `--relation=approximation` keeps ZERO edges today because 137 of
144 carry no relation overlay, and the legend is what made that visible. A poster source that
returns an empty or partial graph must say why in the same way.

## 7. Boundaries

- Every new symbol is `@internal` and stays off `src/index.ts` before Phase 6.
- **NEVER THE BARREL.** `src/bridges/` and `src/composition/` must not import `src/atlas/index.ts`.
  **SC3b corrected this note's first draft**, which said "types only, from `src/atlas/types.ts`" after
  `CLAUDE.md`: the tree has never done that, and value imports exist at `bridges/index.ts:40`,
  `composition/compose.ts:46-47` and `graph-viz.ts:28`. `docs:deps` reports 0 circular dependencies, so
  the INVARIANT holds and only the overstated rule was false. Both are now corrected.
- **Q4 ANSWERED.** `EinsteinFieldEquationNode` is at `src/dimensional/ast-types.ts:196`, and
  `src/dimensional/**` imports nothing from atlas, composition or bridges. A `Statement` referencing it
  runs atlas → dimensional, the same direction the tree already uses, so it introduces no cycle.
  **There is no `Statement` type in the repo today** — grep returns zero — so Sprint 3 creates it.
- Adding L1 entries moves a count stated in prose in several files. Gate it (see §0) or it drifts.

## 8. Out of scope, deliberately

- Evaluating hidden supporting nodes. They are named and linked; that is the deliverable.
- Widening the composition table. That remains a reviewed act per Phase 2 §4.
- Anything that changes what `upt confront` prints — `tests/cli/golden/confront.txt` stays byte-identical.

## 9. Adam A3 — questions to put, once ⏳ sections are filled

**Questions 1–3 are UNASKABLE until Appendix A is in the repo** (see §5): each asks whether this
note matches a document neither Adam nor I can read. Do not put them and accept an answer — a
reviewer asked to check against a source it cannot see will produce a plausible verdict that
verifies nothing, which is the vacuous-pass shape this sprint has now found in four places. Ask 4,
5 and 6 now; hold 1–3.

6. **NEW.** Whether making `boundaryData` and `initialData` optional (§4) is right, or whether it
   defers a modelling decision that ought to be forced now. The argument for optional is that no
   such data exists for the nine ODE models and a required field would manufacture it; the argument
   against is that an optional field lets Sprint 4 build on models that silently have no boundary
   conditions. Put BOTH sides — this is the decision most likely to be wrong here.

1. Every poster edge type against Appendix A, line by line.
2. That `7 ↔ 16` is an association for the historical link only, and that the hyperedge
   `{full Maxwell, spacetime structure} → 16` is the correct form otherwise.
3. That `6 ↔ 13` carries self-adjoint + lower-bounded, with `V = 0` only for the Gaussian kernel.
4. **Whether the hidden-node test is MEANINGFUL** — i.e. whether it can fail. A test over nodes that
   are named-but-not-evaluated is exactly the shape that passes vacuously, and this project has now
   found three tests that asserted a defect as intent plus one filter that could not match anything.
5. Whether `contextUnion`'s refusal path is reachable from the sixteen entries as specified, or
   whether it is a guard against a condition this sprint's data cannot produce — dead code that
   LOOKS like a safeguard, which `path-bound.ts` already documents as a failure to refuse.
