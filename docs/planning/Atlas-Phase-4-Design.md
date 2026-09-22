# Atlas Phase 4 — verification workflow and checked bridges (design note, L4.1)

Authorized by [`ACTIVE.md`](ACTIVE.md) Sprint 4. Briefs in
[`Atlas-Roadmap-Implementation-Plan.md`](Atlas-Roadmap-Implementation-Plan.md) §Sprint 4.
Where this note and the plan disagree, **this note wins and the deviation is stated here**,
in the same way Phase 3's note superseded the plan's wording on `boundaryData`.

Scope: S4.1 applicability checker · S4.2 witness runners · S4.3 `formalRef`, the results
artifact and the two derived tags · S4.4 diffusion family · S4.5 wave family · S4.6 formal
references.

---

## 1. The applicability checker (S4.1)

`src/atlas/applicability.ts` answers one question: **before you believe a bridge, what about
it is not checked?** It returns FINDINGS, never a boolean. A boolean would have to choose
between "unchecked" and "wrong", and the whole point of the module is that those differ.

### 1.1 Four check families, and what each can actually decide

| Family | Decides | Source |
|---|---|---|
| dimensions | the transformation's AST is dimensionally homogeneous | `src/dimensional/validator.ts`, unchanged |
| conventions | the premise and conclusion records declare no conflicting sign/unit choice | `checkConventions` + `unknownConventionKeys` (S1.4) |
| side conditions | every division has a stated non-vanishing divisor; a difference of equal even powers is flagged as solution-adding | this module, over the AST |
| model compatibility | the premise models share a family, or a bridge between their families is declared | this module, over `AtlasModel.family` |

### 1.2 Severity is two-valued, and `question` is not a weaker `blocking`

A finding is `'blocking'` when the data CONTRADICTS itself (a dimensional failure, a declared
convention mismatch, a literal zero divisor) and `'question'` when the data is SILENT (a
divisor with no stated side condition, a convention only one side declares, models whose
relationship is unrecorded).

This is the same asymmetry `conventions.ts` already argues for at length: **absence is not
disagreement.** Collapsing the two into one severity would let a caller report "4 findings"
for a record whose only defect is that nobody wrote something down — and, in the other
direction, would bury a real dimensional contradiction among them.

### 1.3 The division rule, stated so it cannot quietly pass

For every `{ kind: 'op', op: '/' }` node the DIVISOR (`args[1]`) is examined:

- a divisor that is a numeric literal leaf (a `symbol` whose `name` parses to a finite
  non-zero number) is safe and produces nothing;
- a literal `0` divisor is `blocking`;
- otherwise the divisor needs a side condition NAMING it together with a non-vanishing
  marker (`≠ 0`, `!= 0`, `<> 0`, `nonzero`, `non-zero`, `> 0`, `positive`). Absent ⇒ `question`.

**The matcher is deliberately shallow, and that is a stated limit rather than an oversight.**
It matches the divisor's symbol names against side-condition PROSE. A side condition is free
text; no parser exists for it, and inventing one here would be a second grammar nobody
maintains. The failure mode is therefore a FALSE QUESTION (a genuinely guarded divisor phrased
in words the matcher does not know), never a false clearance for a divisor nobody mentioned —
a divisor absent from the prose cannot match. The asymmetry is the right way round: the check
over-asks rather than over-clears.

### 1.4 The squaring rule — what it actually detects

The plan's example is `x² = y²` → "adds solutions". `ExprNode` has no equation node, so the
representable form of that claim is the DIFFERENCE `x² − y²`. The rule fires on an `op` node
`'+'` or `'-'` **two of whose arguments are `^` with the same literal even exponent**. Squaring
both sides of a relation admits the sign-flipped branch, so the bridge needs a side condition
fixing the sign; the finding is a `question` naming the exponent.

It does NOT fire on an isolated `x²` elsewhere in an expression, because an even power is not
by itself a solution-adding step — only equating two of them is. A rule that fired on every
square would report a finding on nearly every record in the atlas and be switched off within a
week, which is worse than not having the rule.

### 1.5 Model compatibility

Premises are compatible when they all share `family` with each other and with the conclusion.
When they do not, the caller may supply `declaredBridges` — unordered family pairs already
bridged — and a pair found there is compatible. Anything else is a `question`: an unrecorded
cross-family step is exactly the thing the atlas exists to make visible.

---

## 2. Witness runners (S4.2)

### 2.1 The parser is INJECTED, and no test touches the registry

`src/numerical/formula-registry.ts` caches the parser in module scope and exposes no reset
hook. A test that registered a stub would leak it into every later test in the same worker.
So `runSymbolicWitness(w, parser = getFormulaParser())` takes the parser as a parameter:
tests pass a stub for the present path and `null` for the absent path, and the registry is
never written. A third test exercises the REAL registry under the existing skip-when-absent
pattern (`tests/numerical/formula-mathts.test.ts`, `UPT_REQUIRE_PEERS`).

**As built (S4.2), two corrections to the wording above.** (1) The injected capability is a
SIMPLIFIER, not the parser: a parser cannot decide `lhs − rhs = 0`, and simplification lives in
`src/composition/expr-simplify.ts` over a different peer (`@danielsimonjr/mathts-functions`). So
the signature is `runSymbolicWitness(w, simplifier?)`. (2) An OMITTED argument resolves through
`isSimplifierAvailable()` to `simplifyExpr` or `null`, because `simplifyExpr` alone returns
`simplified: false` for both an absent peer and an irreducible expression. Without that step
the default path reported absence as `not-simplified`. Tests still pass `null` or a stub
explicitly and never touch the registry.

**A defect found by the real-peer test, fixed at its cause.** The CAS returns a bare,
dimensionless `0` for `x − x` with `x` a length, and `simplifyExpr`'s dimension guard read that
as "the simplified form changed dimension" and threw. No dimensioned identity could ever reach
`checked`. The first version of the real-peer test asserted only "not refuted", so it passed
while the defect was live. `simplifyExpr` now gives a literal zero the original dimension, and
the test asserts `checked`.

### 2.2 `unresolved` is the outcome of every non-answer, and it carries a reason

Peer absent, budget exhausted, and parser throw are all `unresolved` — distinguished by
`reason: 'peer-absent' | 'timeout' | 'parse-error' | 'not-simplified'`, never by a thrown
error and never by `refuted`. **A check that did not run is not a check that failed**; this
repo has been bitten by exactly that conflation. `refuted` is reserved for a simplification
that COMPLETES and is demonstrably non-zero.

### 2.3 Numeric convergence

`runNumericWitness` evaluates at two resolutions and records
`convergence: { coarse, fine, ratio }` with `ratio = |coarse − target| / |fine − target|`.
A ratio at or below 1 means refinement did not improve the answer; it is reported and does
NOT earn `numerically-supported`. The ratio is REPORTED rather than compared against an
expected order, because the witnesses in hand do not all declare their scheme's order and
asserting an order nobody recorded would be fabrication.

---

## 3. `formalRef`, the results artifact, and the two derived tags (S4.3)

```ts
interface FormalRef {
  system: 'lean4-physlib' | 'other';
  statement: string;
  version: string;
  axioms: readonly string[];
  fidelity: 'two-formalizers' | 'back-translation' | 'sanity-lemmas' | 'unreviewed';
}
```

**Both tags are derived from a committed artifact, never hand-set.**
`scripts/emit-witness-results.mjs` (Lead-run, like `emit-atlas-json.mjs`) writes
`data/atlas/witness-results.json`; `tests/atlas/witness-results.test.ts` deep-equals the
committed artifact against a fresh in-process run — the `atlas-json` pattern. A test NEVER
writes the artifact; that is this sprint's load-bearing invariant, and E4 checks it by running
the atlas suite twice and confirming the tree stays clean.

- `formally-proved` iff `formalRef !== undefined && formalRef.fidelity !== 'unreviewed'`.
- `symbolically-checked` iff the artifact records `status: 'checked'` for a symbolic witness
  of that record.

`deriveEvidence` already emits `symbolically-checked` from a passing symbolic witness. That is
not a second rule: the artifact is what DEFINES which symbolic witnesses pass, so the artifact
feeds the `passingWitnessIds` argument. The tag keeps exactly one derivation.

A file allow-list test pins that the literals `'formally-proved'` and `'symbolically-checked'`
appear under `src/atlas/` only in `types.ts` and `derive-evidence.ts`. **An allow-list of
FILES, not a heuristic over initializers** — a heuristic that inspects how a tag is assigned is
defeated by assigning it a different way, and that is the defeat that matters.

**As built (S4.3).**

- **Where the symbolic witnesses come from.** `src/atlas/witness-specs.ts` holds the executable
  form of each witness the artifact covers. The first two, `W1s` (`ab-spring-lc`) and `W2s`
  (`ab-damped-rlc`), start from the PREMISE model's expression (ω0² = k/m; ζ² = b²/(4mk)) and push
  it through the bridge's dictionary with `substitute`, refusing a mapping that matches no leaf.
  The CAS then has to reduce the difference from the CONCLUSION model's expression to zero. Two
  hand-typed equal ASTs would have checked only the typist. A negative control pins that the WRONG
  dictionary (k ↔ C) does not check.
- **Stored `evidence` no longer carries `symbolically-checked`.** `ab-spring-lc` stored it by hand
  from Phase 0. It is removed and is now earned through `artifactPassingWitnessIds` → `deriveEvidence`.
  So `data/atlas/oscillators.json` loses the tag from the record, and the derived view keeps it.
  `ab-damped-rlc` now EARNS the tag (W2s) that it never had.
- **The artifact drops `elapsedMs`**, because a pin that deep-equals wall-clock time can never pass
  twice. The pin test round-trips the live run through JSON so that a ratio of `Infinity` compares
  as the `null` the file holds.
- **The emitter refuses to write when the CAS peer is absent.** An artifact emitted without the
  peer would record every symbolic witness as `peer-absent` and strip the tag from every record
  that earned it. The pin test skips its freshness check in the same state unless
  `UPT_REQUIRE_PEERS=1`.
- **The allow-list lint strips comments before it scans.** Doc comments name the tags in code
  spans, and a comment cannot set a tag. Backtick literals in CODE still match, because a
  template literal sets a tag as well as a quoted string does. Matcher controls pin every quote
  style, both comment forms, and code after a comment.
- `ALL_EVIDENCE_TAGS` moved from `coverage.ts` to `types.ts` (re-exported unchanged) so the
  tag list is not a third file that can spell a derived tag.

---

## 4. Families and counts (S4.4–S4.6)

Diffusion: Fick, heat equation, random walk. Wave: 1D wave, d'Alembert, string, sound in a
fluid. Both carry regime groups traceable to the dimension matrix (Fourier number, Péclet,
Mach) exactly as Phase 0 does — **derived through `buckinghamPi` and keyed by
`PiGroup.formula`, never hand-written**, because a hand-written group is not traceable and
`regime.ts` refuses it.

**Scope rule (carried from the plan, restated because it is the one most likely to be quietly
dropped).** ROADMAP Phase 4's exit criteria are "≥ 20 bridges" AND "≥ 5 relation types". If
measured curation cost makes 20 unreachable in the window, **the bridge count is cut here, in
writing, with the measured cost that forced it — and the relation-type criterion is not cut.**
Cutting the count silently would turn an exit criterion into a description of whatever was
finished.

**S4.6 honesty rule.** A statement with no real checked counterpart is left with NO
`formalRef` and is reported as such. Five is a target, not a quota; `fidelity: 'unreviewed'`
exists precisely so an unreviewed reference can be recorded without earning a tag, and
`formally-proved` is unreachable from it by construction.
