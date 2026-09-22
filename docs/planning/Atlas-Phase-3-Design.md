# Atlas Phase 3 — design note (Sprint 3: hyperedges, models, and the poster index)

Authoritative over `Atlas-Roadmap-Implementation-Plan.md` where the two disagree. The plan is a
frozen record written before Sprints 0–2 ran; this note is written after them and carries what they
taught.

**Status:** DRAFT. Sections marked ⏳ await Scout SC3's measured facts and must not be filled from
the plan's assertions — see §0.

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

⏳ The nine Sprint 0 models and their exact current field set come from SC3 Q6. The migration must
leave every existing `AtlasModel` consumer byte-identical where it supplies no new field — the
additive-overlay discipline that Sprints 1 and 2 both held to.

## 5. The poster index

⏳ SC3 Q1 establishes which of the sixteen entries already exist as `CE-*` in
`src/canonical/entries/` and which are new L1 entries. ⏳ SC3 Q2 establishes the L1 registration
mechanism.

`7 ↔ 16` is an ASSOCIATION for the historical link only — NOT a derivation edge. Otherwise the link
between the full Maxwell set and spacetime structure is the hyperedge
`{full Maxwell, spacetime structure} → 16`. `6 ↔ 13` carries self-adjoint and lower-bounded, with
`V = 0` only for the Gaussian kernel.

## 6. `upt map --source=poster`

⏳ SC3 Q5 establishes `buildVizModel`'s cluster/junction model. Note that Sprint 2 added
`VizOptions.relation?` and `.evidence?` with a legend that reports two DISTINCT drop reasons —
"did not match" and "no overlay metadata" — because a silent drop makes an incomplete graph look
complete. A `poster` source must state how it interacts with those filters rather than quietly
bypassing them.

Sprint 2's measured lesson applies: `--relation=approximation` keeps ZERO edges today because 137 of
144 carry no relation overlay, and the legend is what made that visible. A poster source that
returns an empty or partial graph must say why in the same way.

## 7. Boundaries

- Every new symbol is `@internal` and stays off `src/index.ts` before Phase 6.
- `src/bridges/` and `src/composition/` may import atlas TYPES ONLY, from `src/atlas/types.ts`, never
  the barrel — that closes a cycle `docs:deps` reports. ⏳ SC3 Q4 confirms whether
  `EinsteinFieldEquationNode` can be referenced from a `Statement` without breaching this.
- Adding L1 entries moves a count stated in prose in several files. Gate it (see §0) or it drifts.

## 8. Out of scope, deliberately

- Evaluating hidden supporting nodes. They are named and linked; that is the deliverable.
- Widening the composition table. That remains a reviewed act per Phase 2 §4.
- Anything that changes what `upt confront` prints — `tests/cli/golden/confront.txt` stays byte-identical.

## 9. Adam A3 — questions to put, once ⏳ sections are filled

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
