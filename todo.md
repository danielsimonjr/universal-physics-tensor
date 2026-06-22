# UPT TODO

Durable cross-session task tracker. Update this file as work progresses — checkboxes flip when tasks complete, items move between sections as state changes.

> The in-conversation task tracker (TaskCreate/TaskUpdate) is ephemeral. This file is the source of truth for "what's next" across sessions.

---

## ⏩ SESSION CHECKPOINT (2026-06-22 → resume in a fresh session)

Audit-backlog implementation is **IN PROGRESS**. Session 1 (2026-06-21): 15
commits `c7bbce2..feccf42` (all Round-2 HIGH+MED, registry collapse, all of
Round 3, the Round-1 `collectSymbols`/`op('/')`/`DATA_CONFRONTED`/`dim()`-order
items, `buckinghamPi` single-RREF). Session 2 (2026-06-22): 10 commits
`a5c0e1f..1d1fb04`, all pushed/green —
**Round-2 algorithmic perf ALL DONE** (discovery candidate-invariant hoist;
`scanLinkages` per-operand precompute; `linkageMap`→`clusterMap` O(E²) split;
curvature Bianchi center-Γ reuse; `equals` 7-base unroll), **Round-1 Batch-1**
(`FUNDAMENTAL_CONSTANT_SUBSETS` hoist + `mapGetOrInsert`), **Round-1 Batch-2**
(geodesic Christoffel scratch buffer; curvature `nestedZeros4/5` dedup), and
**part of Batch-4** (un-exported 8 internal types + deleted dead `evalFormulaAst`;
`gradientToNamed` length guard + `bound !== undefined`).

**REMAINING (lower-value tail — pick up here):**
- **Batch-4 leftovers:** dedup `sym()`/`dim()`/`l0()` (calibration ↔
  proposed-bridges ↔ dimensional-classics ↔ `_l1-build`); dedup AD dispatch in
  `float64-engine.ts`; narrow the `[key:string]:any` tensor ambient
  (`mathts-tensor.ambient.d.ts`).
- **Round-2 robustness line:** `inferUnknownDimension` integrality tolerance;
  `connection.ts` dimensionless-metric assertion; `forwardEvaluate` finite-seed
  guard; `setActiveEngine` async staleness; CLI `--anchor`/`--max-orders` bad-value
  validation; `bisectCubic` warm-start. (`gradientToNamed` length already done.)
- **Round-2 test-coverage backfills** (reconstructNullPr, dimensional-fields
  biconditional, derivative-lowering, lowering-utils, metric-inverse,
  normal-form hash property test).
- **Architecture remainder (ADR-level — scope explicitly before starting):**
  `catalog-full.ts` 1209-line god-file split; `quantities.ts` literals;
  L1 entry-file split; CLI stable entrypoint (deep `dist/` paths).
- **Deferred:** type-only-cycle refactor (`dimensional/ast-types.ts`); `js-yaml`
  4→5 major.

Continue via `/dev-workflow` (TDD-strict, atomic commits). Gotchas: read
background test output with `PowerShell Get-Content -Tail` (Bash output files
read flaky); **un-exporting a type used by an exported value needs `npm run
build` (declaration emit), NOT just `--noEmit`, to verify** — `.d.ts` keeps it
as a local decl so it passes; run the full build before pushing such changes.

---

## Codebase audit backlog (2026-06-21, 5-agent Sonnet audit → Opus fix team)

Findings from the parallel read-only audit (correctness/dead-code/simplification/
performance/type-safety). Grounded + verified against source; false positives
(normToExpr unary-minus, RetrodictionOutcome union) excluded. Partitioned into
disjoint file-batches for the Opus implementation team.

**Batch 1 — `bridge-analysis.ts` hotspot** (`composition/bridge-analysis.ts`, `bridges/confrontation-coverage.ts`)
- [x] ✅ (2026-06-21) Stale `DATA_CONFRONTED_BE_IDS = {23,36}` (missing 52) — FIXED: `bridge-analysis.ts` now imports the single `DATA_CONFRONTED_IDS` ({23,36,52}) from `confrontation-coverage.ts`; local dup deleted.
- [x] ✅ (2026-06-21) `dim()` param order aligned to canonical `(L,M,T,I,Theta)`; `k_B`/`e` callsites updated; resulting dims byte-identical.
- [x] ✅ (2026-06-22) Perf: hoist `subsetsBySize(FUNDAMENTAL_CONSTANTS)` to a module const (`FUNDAMENTAL_CONSTANT_SUBSETS`) — DONE. `anchoringDistance` was already single-pass; the redundant `linkageMap`/`enumerateCompositions` calls were eliminated by the earlier `clusterMap` split.
- [x] ✅ (2026-06-22) `mapGetOrInsert` helper to remove the `!` Map assertions — DONE: applied to the 5 get-or-insert sites (anchoringDistance adjacency, clusterMap qToEdges/groups, proposeOrphanConnectors qToEdges). Guaranteed-present `!` reads (distOf/edgeCluster/qDim) left as-is (legit, not get-or-insert). 62 tests green.

**Batch 2 — numerical perf + bug** (`numerical/{christoffel-flat,geodesic-integrator,curvature-lowering-helpers,lowering}.ts`)
- [x] ✅ (2026-06-22) Pre-allocate the `Float64Array(64)` in `christoffel-flat.ts` (~160k allocs/geodesic run) — DONE: closure takes an optional `out` buffer (non-breaking; fresh-alloc default kept); `integrateGeodesic` threads one reused scratch through all 4 RK4 Christoffel evals/step (safe — each `geodesicRHS` consumes Γ before the next call). Numerically identical; 9 tests green incl. 2 new buffer-reuse tests. The optional `geodesicRHS` `dx`/`dv` scratch was left as-is (more invasive RK4 rewrite, smaller gain).
- [x] ✅ (2026-06-22) Use a nested-zeros helper for the 6 nested zero-tensor allocations in `curvature-lowering-helpers.ts` — DONE: added typed local `nestedZeros4`/`nestedZeros5` (latter reuses former), replaced all 6 inline `Array.from` builders. Used typed helpers rather than the generic `NestedArray`-returning `buildNestedZeros` to keep concrete types without casts. Identical allocations; 24 curvature tests green.
- [x] ✅ (2026-06-21) `op('/')` empty/1-arg convention ALIGNED across validator/expr-eval/lowering (empty→1, 1-arg→operand left-fold); `lowering.ts` no longer throws on empty `/`. Resolves this + the Batch-3 alignment item. `tests/numerical/lowering-contract.test.ts`.

**Batch 3 — correctness: symbolic/dimensional** (`composition/{compose-symbolic,expr-eval,retrodiction}.ts`, `dimensional/{algebra,validator}.ts`, `canonical/linkage.ts`)
- [x] ✅ (2026-06-21) `collectSymbols` must recurse into `transcendental`/`abs`/`dirac-delta`/`variational-derivative` (compose-symbolic.ts) — FIXED; was dropping inner leaves for BE-37/26/41-style symbolic forms. RED→GREEN via `tests/composition/collect-symbols-transcendental.test.ts`.
- [ ] `format()` named-dimension lookup table (algebra.ts).
- [x] ✅ (2026-06-21) Align `op('/')` empty/1-arg convention — DONE (see Batch-2 entry; all three layers now agree).
- [ ] Remove no-op `try/catch` + identity wrapper `resolveChildForCovariantDerivative` (validator.ts).
- [ ] `numericalRecovery` `bv===0` over-skip (linkage.ts); `relativeSpread` sign-cancellation → normalize by `max|v|` (retrodiction.ts).

**Batch 4 — minimization + type-safety + dedup** (`numerical/{formula,quadrature,float64-engine}.ts`, `composition/{symbolic-constants,proposed-bridges}.ts`, `canonical/entries/{_l1-build,dimensional-classics,relativity}.ts`, `bridges/equations/calibration`, `diff/{bridge-gradient,bridge-ast-gradient}.ts`, `numerical/mathts-tensor.ambient.d.ts`)
- [x] ✅ (2026-06-22) Un-export genuinely-unused internal types — DONE: deleted dead `evalFormulaAst`; un-exported `NamedConstantValue`/`GaussLegendreNode`/`L1Rest`/`EFE_NODE` + `proposed-bridges` `EquationSource`/`PromotionEvidence`/`PromotionRequest`/`ProposedBridgeEntry` (kept `ProposedBridge` — has external consumers). Verified non-public via build (declaration emit) + public-surface snapshot (unchanged). All still used within-module so `.d.ts` keeps local decls. 59 API/module tests green.
- [x] ✅ (2026-06-22) Dedup `sym()` + `dim()` — DONE: new zero-runtime-dep `dimensional/ast-builders.ts` is the single source; `_be-helpers`/`_l1-build` re-export (their ~55+8 importers untouched); the 5 local copies (`bridge-analysis`, `dimensional-classics`, `edges/calibration`, `proposed-bridges`, `formula-dimension`) import directly. `l0` left local to `dimensional-classics` (not duplicated). Runtime circular 0; full suite 2989 green.
- [x] ✅ (2026-06-22) Dedup AD dispatch in `float64-engine.ts` — DONE: `add`/`sub`/`mul` repeated the same dual/tape/primal three-way branch; extracted one `adBinary(a, b, method, prim)` helper (6 instanceof branches → 1 helper + 3 one-liners). Type-safe via the shared dual/tape method signature. 470 diff/numerical tests green.
- [x] ✅ (2026-06-22) Runtime-validate the `as unknown as Input` cast (bridge-gradient.ts); `if(bound)`→`!==undefined` (bridge-ast-gradient.ts) — DONE (scoped): added a `gradientToNamed` length-mismatch `RangeError` (the real public-input guard; RED→GREEN); `if (bound !== undefined)` clarity fix. The `as unknown as Input` cast left as-is (generic type param, no runtime schema; unpacked-length invariant is construction-guaranteed). Non-null `sum` init left as-is (null-accumulator is idiomatic/correct). 74 diff tests green.
- [x] ✅ (2026-06-22) Narrow the `[key:string]:any` tensor ambient — EVALUATED & DECLINED (not deferred): the index signature is a deliberate, load-bearing decoupling for the OPTIONAL peer `@danielsimonjr/mathts-tensor`. The code uses ~16 static + ~10 instance `Tensor` members (einsum/contract/mergeAxes/splitAxis/addCell/…); a hand-written structural interface would duplicate the peer's full API as a fragile fallback, break the no-peer build on any newly-used member, and add zero safety in the real dev env (the peer's `.d.ts` shadows the shim there). Added an anti-re-flag note to the shim docstring documenting the rationale. No code change to the type itself (a narrow would be net-negative).

**Deferred (NOT for the parallel team — risk/conflict):**
- [ ] **Type-only-cycle refactor**: extract `dimensional/ast-types.ts` so `validator.ts`/`tensor.ts`/`curvature.ts` share node types, breaking the 2 type-only cycles and letting `CovariantDerivativeNode.of` be `ExprNode` (eliminates the `as ExprNode` cast cascade). Touches validator.ts (conflicts with Batch 3) — do solo after the team merges.
- [ ] `js-yaml` devDep 4.2.0 → 5.0.0 (major; no security impact).

---

## Codebase audit backlog — ROUND 2 (2026-06-21, 5-agent Opus deep audit)

Deeper second pass (physics-correctness / architecture / edge-cases / test-quality /
algorithmic). NEW findings beyond Round 1. Grounded (file:line) + cross-verified.

**🔴 New correctness bugs**
- [x] ✅ **GL4 step-halving advances by the wrong step** (`numerical/gl4-integrator.ts`) — FIXED 2026-06-21: recovery path now sub-steps the macro-step at the converging size (state update uses `subH`, not full `h`); norm conserved. RED→GREEN via new `tests/numerical/gl4-step-halving.test.ts` (synthetic metric forces halving deterministically — closes the "invisible because skip-by-default" gap).
- [x] ✅ **CLI `parseKnown` silently drops/coerces inputs** (`bin/upt.mjs`) — FIXED 2026-06-21: rejects malformed `name=value`, non-finite values, and name/value mixing with exit 2 + diagnostic. RED→GREEN via `tests/cli/upt-explain-inputs.test.ts`.
- [x] ✅ (2026-06-21) **BE-37 `eikonalResidual` hardcoded 0 on a false null-condition** — FIXED: now computes `|g^μν p_μ p_ν|/Σ|term|` on the real reconstructed null covector (~machine-ε); the `<1e-9`/`<1e-10` tests now meaningfully verify the null construction. Shapiro path unchanged.
- [x] ✅ (2026-06-21) **Finiteness-guard inconsistency** — FIXED: `integrateGaussLegendre` (bounds+result), `formula` evaluator (`upt eval`), and `bridgeGradientNumerical` (`Number.isFinite` param check + `relStep>0` guard) now all throw on non-finite instead of returning NaN/∞. RED→GREEN via `tests/numerical/finiteness-guards.test.ts` + bridge-gradient cases.
- [x] ✅ (2026-06-21) **Discovery magnitude-clash asymmetric validation** — FIXED: static-table path now shares the `isFinite && !=0` gate with the anchor path. RED→GREEN via `tests/composition/discovery.test.ts` (zero + non-finite cases).
- [x] ✅ (2026-06-21) **`equals()` fractional-exponent ULP compare** — FIXED: tolerance compare (`EXPONENT_TOL=1e-9`) absorbs round-off in `M^0.5`-style exponents while preserving genuine distinctions (steps ≥~1/3). RED→GREEN via `tests/dimensional/algebra.test.ts`; 627-test sweep green. (Tolerance in `equals` makes a separate `power` snap unnecessary.)

**🟡 New robustness/doc (lower)**
- [x] ✅ Round-2 robustness line — COMPLETE (2026-06-22):
  - [x] ✅ (2026-06-22) `inferUnknownDimension` integrality tolerance — DONE: snaps exponents to nearest integer within `EXPONENT_TOL` (now exported from `algebra`), abstains only on genuinely-fractional results. RED→GREEN (noisy-target). Scan confirmed clean integer roots are FP-exact; the reachable case is a noisy target dim.
  - [x] ✅ (2026-06-22) `gradientToNamed` length-mismatch (done earlier in the diff commit).
  - [x] ✅ (2026-06-22) `connection.ts` dimensionless-metric assertion — DONE: `christoffel` throws `TypeError` unless both metric args are dimensionless (the geometrized convention it + the numerical lowering require). RED→GREEN (MASS metric); 591 dimensional+canonical tests green.
  - [x] ✅ (2026-06-22) `forwardEvaluate` finite-seed guard — DONE: throws `TypeError` on a NaN/∞ ground-truth seed (computed values were already guarded; the seed wasn't). RED→GREEN; retrodiction+discovery green.
  - [x] ✅ (2026-06-22) `setActiveEngine` async staleness — DONE: a synchronous `_override` recorded by `setActiveEngine` and re-checked by the detection IIFE makes a mid-detection override win for the in-flight awaiter (matching the docstring's "invalidate in-flight detection"). `resetEngineForTesting` clears it. RED→GREEN.
  - [x] ✅ (2026-06-22) CLI `--anchor`/`--max-orders` silent no-op on bad value — DONE: `parseDiscoveryOpts` now exits 2 on non-numeric/empty/negative `--max-orders` (empty coerced to 0 silently before) and on malformed `--anchor` (missing `=v` or non-finite). RED→GREEN via new `tests/cli/upt-discover-opts.test.ts`; 30 CLI tests green.
  - [x] ✅ (2026-06-22) `bisectCubic` warm-start discarded — DONE: the `sInitial` evaluation (previously computed then discarded) now narrows the guaranteed bracket before bisecting (sign-bracket invariant preserved → identical root, smaller starting interval). Behavior-identical; perihelion + Mercury tests green (precession within 1σ).
- [x] ✅ (2026-06-21) Docstring value errors: BE-21 KSS `6.075e-12`→`6.078e-13` (10×); BE-20 vacuum-energy `7e-10`→`5.30e-10 J/m³`. Adam+Eve confirmed; evaluators/tests were already correct (comments only).

**⚡ New algorithmic (deeper than Round 1's micro-opts)**
- [x] ✅ (2026-06-22) **Discovery recomputes candidate-invariant state per candidate** (`composition/discovery.ts`) — FIXED: hoisted `forwardEvaluate`/`quantityComponents`/base-`forwardClosure` into a shared `DiscoveryContext` (`buildDiscoveryContext`); `vetInContext` is the pure per-candidate body, `vetLinkCandidate` delegates (signature unchanged), `rankDiscoveries` builds context once. 3 invariant graph walks now run once instead of 132×. Behavior-preserving; new equivalence-guard test pins shared-context == per-candidate byte-for-byte. 18 tests green.
- [x] ✅ (2026-06-22) **`scanLinkages` recomputes `validate`/`normalForm` per (canonical×bridge) pair** (`canonical/linkage.ts`) — FIXED: each bridge validated + normal-formed ONCE into `BridgePrecomp`; each canonical's normal-form computed once per outer iter; inner loop compares precomputed strings/dims via the new `classifyAgainst` core. ~3·C·B walks → ~2·B + C. `classifyLinkage` signature unchanged (delegates); equivalence-guard test pins scan == brute-force per-pair. 8 tests green (body 348ms → 66ms).
- [x] ✅ (2026-06-21) **`buckinghamPi` runs RREF twice** — FIXED: `nullSpace` returns `{basis, rank}` (rank = pivot count from the single RREF); the separate rank-RREF is gone. Behavior identical; 37 tests green.
- [x] ✅ (2026-06-22) **`linkageMap`'s O(E²) `enumerateCompositions` count fires transitively** on discover/candidates/connectors (`bridge-analysis.ts`) — FIXED: extracted the cheap cluster core into internal `clusterMap`; `linkageMap` wraps it + adds the count. `proposeLinkCandidates`/`proposeOrphanConnectors` now call `clusterMap` (never read `.compositions`), so the quadratic count only fires for `upt map`. `linkageMap` output/signature unchanged; 60 tests green.
- [x] ✅ (2026-06-22) **Curvature nested FD-on-FD recomputes Christoffel** (`numerical/curvature-lowering-helpers.ts`) — FIXED (scoped): grounding the audit claim showed the FD layers (`dGammaAt`/`dRiemannLowerAt`) sample `christoffelAt` at *perturbed* coords that never coincide, so the only genuine same-coordinate redundancy was the center `christoffelAt(x)` recomputed in the Bianchi path (`covariantDerivRiemannLowerAt`: `gamma` + `riemannLowerAt(x)` internally redoing it). Threaded an optional precomputed Γ through `riemannUpperAt`/`riemannLowerAt` (defaulted → all other callers unchanged) and reuse the center Γ. Numerically identical (pure fn of x; residuals ≤1e-6 to the bit; 17 curvature tests green). Full coordinate-keyed cache DECLINED — net-negative churn/risk on the precision-tuned pipeline for no further gain.
- [x] ✅ (2026-06-22) Unify `equals` on the unrolled `dimEqual` + packed-signature LUT for `format` — DONE (scoped): `equals` unrolled over the 7 bases (short-circuit, no iterator/dynamic-key), **tolerance preserved** so it stays distinct from linkage's exact `dimEqual` (the "unify" can't apply — different predicates after the v0.20 ULP fix). `format` LUT DECLINED: format is error-path/one-time-build only (not hot), and unrolling `equals` already speeds its named-dim scan. 499 dimensional tests green.

**🏛️ New architecture/structural**
- [x] ✅ (2026-06-21) **Collapse the per-bridge registries onto one descriptor** — DONE via the facade+guard approach (user-chosen): `src/bridges/descriptor.ts` `BridgeDescriptor`/`BRIDGE_DESCRIPTORS`/`getBridge(id)` JOINs metadata + RHS + edges into one view; `tests/bridges/descriptor-consistency.test.ts` (7 tests) fails loudly on cross-registry drift. Derived facade (no risky hand-merge of the 1906+1209-line catalog core). Full physical collapse deliberately NOT done — net-negative risk for the same anti-drift benefit.
- [ ] Consolidate the vintage-split edge files (`catalog-full.ts` is a 1209-line god-file); `quantities.ts` 1117 LOC of literals; L1 entry files split by size not domain (inconsistent `l1-` naming).
- [ ] CLI (`bin/upt.mjs`) depends on deep `dist/` internal module paths — give it a stable entrypoint.

**🧪 New test/coverage**
- [x] ✅ **Peer-gated tests silently skip with green CI** — FIXED 2026-06-21: `tests/peers-required.test.ts` fails loud when `UPT_REQUIRE_PEERS` is set but the autograd peer is absent; CI now sets `UPT_REQUIRE_PEERS=1`. Shared detection in `tests/helpers/peers.ts`.
- [ ] Long-running GL4/Shapiro accuracy tests are `skip`-by-default (not in CI) — add a CI/nightly job or a fast reduced-orbit variant (this is why the GL4 bug is invisible).
- [ ] Untested: `reconstructNullPr` (null-ic.ts) incl error path; `dimensional-fields` biconditional invariant; `derivative-lowering.ts`; `lowering-utils` guards; `metric-inverse` null arms.
- [ ] Add a `normal-form` hash property test (idempotence + constant-insensitivity + stub-sensitivity). (TEST_COVERAGE.md's "14 untested" has ~6 false positives.)

**Cross-agent convergence (strongest signals):** (1) finiteness-guard discipline is applied inconsistently library-wide; (2) the GL4 bug exists *because* its accuracy test is skipped — fix both together; (3) the discovery/linkage/bridge-analysis pipeline is the recompute hotspot (deep + micro agents agree); (4) `algebra.ts equals/power` flagged by both correctness (fractional exponents) and perf (unrolled compare).

---

## Codebase audit backlog — ROUND 3 (2026-06-21, 4-agent Haiku sweep, honest-claude-vetted)

Haiku is hallucination-prone, so every finding was VETTED by reading the cited
source. Only verified items below. Hit rate: ~1 of 4 lenses fully reliable
(doc-accuracy 3/3); the others had real underlying observations but inflated/false
significance — the verbatim-quote requirement prevented fabrication (quotes existed),
so errors were in *interpretation*, not invention.

**✅ VERIFIED — stale "symbol stub" doc comments (real doc rot; worth fixing)**
These bridges were re-encoded to real `transcendental` AST nodes (v0.19/v0.21) but
their HEADER docstrings still describe the old symbol-stub encoding:
- [x] ✅ (2026-06-21) `bridges/equations/be-40-composite-higgs.ts` — "The AST has no transcendental primitives … symbol stubs" — contradicted by `:72-73` `transcendental` sin/cos. (Also stale at `:84`.)
- [x] ✅ (2026-06-21) `bridges/equations/be-25-iit-phi.ts` — "the AST has no `log` … symbol stub `log2_ratio_ii`" — contradicted by `:186` `transcendental` `fn:'log2'`.
- [x] ✅ (2026-06-21) `bridges/equations/be-26-dna-tunneling.ts` — "The AST has no `exp` primitive … symbol stub" — contradicted by `:97,109` `transcendental(exp, …)` (v0.21).

**✅ VERIFIED — trivial (low value)**
- [x] ✅ (2026-06-21) `bridges/equations/be-20-vacuum-energy.ts` — deduped behind `PLANCK_2018_LAMBDA`; `1.1e-52` while `DEFAULT_LAMBDA` (`:139`) holds the same value — reference the const (needs hoisting it above `:86`).
- [x] ✅ (2026-06-21) JSDoc-consistency nits (cosmetic): `validate` (`dimensional/validator.ts:853`) and `validateEquation` (`:885`) lack JSDoc while `validateInverseMetricPair` has it; the arithmetic fns in `dimensional/algebra.ts:24-66` lack JSDoc while `format` (`:86`) has it; `UniversalTensor` (`core/tensor.ts:121`) lacks a `@public` tag. Optional.

**❌ Rejected on vetting (recorded so we don't re-chase):** the be-37:475 `1.989e30`
"comment contradiction" (comment is about *constants* centralization; line is a demo
input); pderiv/uncertainty "same exact formula" (floors differ: `1` vs `1e-30`);
the `1e-10/1e-12/4096/1e-3` "duplications" (different semantics); agent-3's claim
that `validateEquation` HAS JSDoc (it doesn't); the `_l1-build` vs `l1-` file-naming
item (excluded + intentional: `_`=helper, `l1-`=data). Dead-code sweep: genuinely
CLEAN (the `src/composition/expr-simplify.ts` `console.*` are deliberate
warning-silencing, not debug logging).

---

## Active queue

- [x] ✅ **DONE — Phase 2: AST consolidation, 2026-06-20.** Unified
      `formula-dimension.ts`'s two parallel transpilers into one: both parse-trees
      (MathTS AST, built-in `FormulaAstNode`) adapt to a normalized `PNode`, then
      one `normToExpr` (dimensional transpile) + one `pnodeConstant` (constant
      exponent fold). `ExprNode` is now unambiguously the single semantic IR;
      parse-trees are transient. Behavior-preserving (convergence test: both
      front-ends → identical `ExprNode`) with one deliberate, pinned narrowing
      (function/named-const in an exponent rejected). `CompiledFormula`'s evaluator
      untouched (lower-risk variant). Design:
      `docs/superpowers/specs/2026-06-20-phase2-ast-consolidation-design.md`.
      **Program complete — ready for the single npm publish after the v0.27.0
      GitHub release (owner triggers publish).**

- [x] ✅ **GitHub-RELEASED v0.26.0 — Phase 1: `parsePhysics` + dimensionally-aware
      `--equation` (+ user-equation injection), 2026-06-20. Tag `v0.26.0` + GitHub
      release; NOT yet on npm (publish after all phases). npm `latest` = 0.25.0.** Public `parsePhysics(text,dims)→{expr,dimension}`
      (the string→ExprNode entry, MathTS-or-built-in via the registry); closed the
      scalar grammar gap (faithful `transcendental`/`abs` nodes; `exp(energy)` now
      rejected); `inferUnknownDimension`/`substituteSymbolDim` (probe-based
      single-unknown solve, abstains otherwise); `analyzeUserEquation` rewires
      `--equation` to dimensionally validate (✓/⚠ vs target catalog dim, constants
      carry real dims) + dimension-based "did you mean?" (else name-similarity);
      non-homogeneous RHS → exit 2. Design:
      `docs/superpowers/specs/2026-06-20-parsephysics-and-dimensional-equation-design.md`.

- [x] ✅ **DONE — user-equation injection (`upt map --equation`), 2026-06-20 (UNRELEASED).**
      Drop a free-form `TARGET = EXPR` onto the map as a violet `user` junction;
      reports where it lands (cluster / shared quantities) + a "did you mean?" hint.
      New pure lib `src/composition/user-equation.ts` (parseUserEquation —
      MathTS-or-built-in via `getFormulaParser()` per owner guidance "leverage
      mathts"; resolveToCatalogName `_`↔`-`; suggestQuantities relevance-gated;
      equationLanding; UserEquationError) + `user` VizStatus. Firewall: never
      written to catalog/graphs. Design:
      `docs/superpowers/specs/2026-06-20-user-equation-injection-design.md`.
      **Next (optional):** typed `name:dim` input → dimension-based "did you mean?".

- [x] ✅ **RELEASED — v0.25.0 (2026-06-19; tagged `v0.25.0`, published to npm).**
      Ships the two physics-map features below (mermaid/dot + svg). Pre-flight:
      `npm audit` 0 vulns, `npm outdated` none; counts refreshed (178 files /
      1281 exports / suite 2874 / 92.1%). The only new dep is the **optional**
      `@viz-js/viz` peer (svg only) — zero hard deps preserved.

- [x] ✅ **DONE — Physics-map visualization (`upt map --format=mermaid|dot`), 2026-06-19.**
      Render the physics hypergraph (quantities = nodes, equations = junctions)
      as Mermaid + Graphviz DOT **source text** from live graph data. Bipartite,
      clustered-by-connected-component (honors the disjointedness), status-colored
      junctions; proposed overlay opt-in via `--proposed` (visually quarantined).
      New pure lib `src/composition/graph-viz.ts` (`buildVizModel`/`edgeToJunction`/
      `toMermaid`/`toDot`); CLI `upt map` gains `--format=text|mermaid|dot` (default
      text unchanged) + `--out=PATH`. Docs page `docs/architecture/PHYSICS_MAP.md`.
      Design: `docs/superpowers/specs/2026-06-19-physics-map-visualization-design.md`.

- [x] ✅ **DONE — SVG output (`upt map --format=svg`), 2026-06-19.** Renders the
      map's DOT layout to an SVG graphic in one step via the optional `@viz-js/viz`
      peer (pure-WASM Graphviz — no native binary, no child_process). New public
      `renderDotToSvg(dot)` + `SvgRendererUnavailableError`
      (`src/composition/graph-viz-svg.ts`, lazy-loads the peer, actionable error if
      absent); `@viz-js/viz` in `optionalDependencies` so the package keeps zero hard
      deps. Committed rendered SVGs under `docs/architecture/maps/`. Design:
      `docs/superpowers/specs/2026-06-19-physics-map-svg-output-design.md`.

- [x] ✅ **RELEASED — v0.24.0 identity-consequence surfacer (2026-06-19;
      tagged `v0.24.0`, published to npm).** Release pre-flight: `npm audit` = 0
      vulns, `npm outdated` → bumped `@types/node` `^25.9.1` → `^26.0.0` (gates
      clean); security/correctness/hygiene review of the full diff since `v0.23.0`
      found no Critical/Important issues. `deriveProposedBridges()`
      (`src/composition/proposed-bridges.ts`) derives the one algebraic relation a
      `promising` canonical identification implies, via monomial elimination of the
      two source `scalarAst`s. Pilot = the Landauer photon `ν = (k_B·ln2/h)·T`
      (`erasure-energy ≟ photon-energy`). `upt discover --derive`. Firewall:
      status literal `'unadjudicated'`, no catalog/graph write, fully-quantitative +
      monomial gates (Jarzynski excluded), `promoteProposal` requires human evidence.
      Design/plan/review in `docs/planning/v0.24.0-*`. Now also: a separate
      `PROPOSED_BRIDGES` surface (catalog field-shape, `toProposedEntry`, own
      registry — `BRIDGE_EQUATIONS` stays the faithful 44, owner-chosen disposition
      2026-06-19), candidate-set-agnostic scope (`discover --derive` honors
      `--source=catalog|canonical|both`), `dedupByNormalForm` cross-proposal dedup,
      and the **bridge-source adapter** (`EquationSource`/`resolveSources`): bridge
      edges with a clean-monomial `symbolic` form now feed the generator (BE-16
      independently derives the Landauer photon at `--source=both`), and
      **leaf-name canonicalization** (`leafCanonMap`/`renameLeaves`, T→temperature
      by unique dim match) collapses the canonical + BE-16 derivations into ONE
      proposal with `alsoDerivableFrom`. Yield widened: **3 new bridge symbolic
      forms** (BE-51/18/20, drift-guarded) + **source enumeration** (`resolveSources`
      returns all sources, `derivePair` enumerates, BE-42 de-ambiguated, stub-gate
      refined to allow dimensionless input couplings). BE-18 unlocks a new
      dark-fermion temperature proposal at `--source=both`. Suite 2841. **Next
      (optional):** symbolic forms for the remaining monomial bridges; a
      bridge↔canonical leaf-name map so any residual `T`/`temperature` variants
      always collapse.

- [x] ✅ **DONE — canonical-only analysis follow-ups (2026-06-18), branch
      `claude/upt-analysis-no-bridge-kduiw0`.** Acted on the canonical-only discovery
      run (`upt discover --source=canonical`): (1) **magnitude-gate fix** — sourced
      representative values for `compton-wavelength`/`bohr-radius` so the gate stops
      false-rejecting atomic-scale links (Compton≟Bohr was a ~61-order anchor
      artifact); genuine clashes (planck≟bohr ~24 orders) preserved. (2) **canonical
      variable-name unification** — `T`→`temperature`, `M`→`mass`, Newton
      `m_1`/`m_2`→`mass`/`secondary-mass` (not both `mass`: buckinghamPi needs unique
      names + it's Newton's free mass-ratio). scalarAst untouched (linkage preserved).
      De-fragments the canonical map (14→12 components, anchored cluster 8→15) and
      drops the `mass≟m_1`/`m_2`/`temperature≟T` artifacts (funnel 66→44), 0
      contradictory throughout. Then (a) recorded the run as
      `docs/research/v0.23.0-canonical-only-baseline.md` (indexed) and (b)
      declared `de-broglie-wavelength → compton-wavelength` in
      `QUANTITY_IDENTIFICATIONS` (Compton = de Broglie at p=mc; folded onto the
      sourced compton node so the genuine planck≟compton clash survives) —
      funnel 44→33, promising 6→2, map 12→11 components, cluster 15→16, still 0
      contradictory. Suite 2813 passing. In `CHANGELOG.md [Unreleased]`.

- [x] ✅ **DONE — architecture-doc count refresh, 2026-06-18.** Ran `npm run
      docs:deps` and reconciled current-state docs against its reports: 174 source
      files, 1245 exports (489 re-exports), composition 26 files, suite 2806 passing
      / 275 files (coverage 160/174 = 92.0%). Updated `README.md`,
      `docs/architecture/ARCHITECTURE.md` + `COMPONENTS.md`. Generated
      `DEPENDENCY_GRAPH.md`/`TEST_COVERAGE.md`/JSON/YAML already current (re-run gave
      only a timestamp diff, reverted). `docs/planning/*` left as historical records.

- [x] ✅ **DONE — CLI documentation (`cli/README.md`), 2026-06-18,
      branch `claude/upt-analysis-no-bridge-kduiw0`.** New root `cli/` folder with a
      full `upt` reference: all 15 commands + aliases, the three run modes
      (`node bin/upt.mjs`, `npm run upt --`, `npx`), the
      `--source=catalog|canonical|both` flag, input syntax, flags, exit codes, and
      troubleshooting. The executable stays at `bin/upt.mjs` (package.json `bin`);
      the folder documents it rather than relocating it. Root `README.md` Quick Start
      now links to it and lists `canonical`/`recover`/`discover --source=canonical`.
      Examples verified against the live CLI. In `CHANGELOG.md [Unreleased]`.

- [x] ✅ **DONE — canonical-only discovery (no bridges in the mix), 2026-06-18,
      branch `claude/upt-analysis-no-bridge-kduiw0`.** Projects the standard-physics
      L-layer (`CANONICAL_EQUATIONS`) into the composition-graph edge vocabulary
      (`src/composition/canonical-graph.ts`: `canonicalToEdges` → `CANONICAL_GRAPH`,
      `CANONICAL_CONSTANTS`) so the existing discovery/analysis funnel runs on
      textbook physics ALONE, bridges excluded. Universal constants (G, c, ℏ, k_B,
      ε₀, σ_sb, b, e, m_e) baked into the evaluators (parity with the bridge graph —
      not graph nodes), with a DIMENSION guard so a future same-named variable
      (eccentricity `e`) is not silently baked. Every canonical equation → an
      `established` `law` edge; monomial-null entries get a NaN evaluator (retrodict
      abstains). CLI `--source=catalog|canonical|both` on `discover`/`candidates`/`map`
      (default `catalog` unchanged). Canonical-only run: 66 candidates → 8 promising
      (e.g. `compton-wavelength ≟ de-broglie-wavelength`) → **0 contradictory** — the
      regression harness pinned in `tests/composition/canonical-graph.test.ts`.
      Exported from the public manifest alongside `CATALOG_GRAPH`. In `CHANGELOG.md
      [Unreleased]`. Suite green (2806 passing). Adam+Eve-equivalent review applied
      (baked `m_e`, added dimension guard). **NOT yet released to npm.**
      - [ ] (follow-up, optional) the canonical registry uses two names for the same
            physical kind (`M`/`mass`, `T`/`temperature`, Newton's `m_1`/`m_2`) —
            canonical-only `discover`/`map` surface these as candidates/separate
            nodes. Unify the governing names in `src/canonical/entries/*` if desired.
      - [ ] (follow-up, optional) `docs/architecture/COMPONENTS.md` header is stale
            at v0.10.0 (pre-existing, beyond this change); only the file/export
            counts were refreshed here. Full refresh is a separate doc task.

- [x] ✅ **DONE (Sub-project A) — canonical-equation registry (2026-06-17).**
      Founding-premise work: use the tensor to validate existing equations against
      standard physics + discover new bridge candidates. Decomposed A→D (see
      `docs/planning/Canonical-Equation-Registry-A-{Design,Review-Findings,Implementation-Plan}.md`).
      Shipped first: **CLI Windows fix** (pathToFileURL — all 13 `upt` cmds run on
      Windows) and the **`discover` magnitude-clash falsifier**
      (`src/composition/representative-values.ts`; kills 6 scale-clash decoys, keeps
      close coincidences for review). Then Sub-project A (22 canonical entries,
      L0/L1/L2 fidelity, engine-derived L0 fields, L-layer seeding, public surface)
      and B/C/D (linkage engine + F4 guard, discovery kinds, CLI).
      Suite 2774. **Held at npm publish for user review.**
  - [x] A-T1 — `CanonicalEquation` type + registry accessors (`src/canonical/`).
  - [x] A-T2 — promote 9 dimensional-derivation classics (L0).
  - [x] A-T3 — constant-registry extension (ε₀, derived σ_sb).
  - [x] A-T4 — L1 gravitation+thermo entries. (Resolved the freeGroups Q: computed
        from the Buckingham engine, so `monomial!==null ⟺ freeGroups===0` holds by
        construction — no invariant relaxation needed.)
  - [x] A-T5 — L1 quantum+EM entries (Coulomb/Planck-Einstein/de-Broglie/Bohr/Wien/Lorentz).
  - [x] A-T6 — numeric-prefactor self-tests (area/log-base/flux guards).
  - [x] A-T7 — registry invariants + OPEN-bridge coverage (`bridgesWithoutCanonicalPartner`, 39 gaps logged).
  - [x] A-T8 — L-layer seeding adapter (`canonicalToLaw` / `seedCanonicalLaws` / `CANONICAL_TENSOR_CONFIG`).
  - [x] A-T9 — L2 EFE node + Friedmann (L1) + public surface export.
  - [x] B — bridge↔canonical linkage (`src/canonical/{normal-form,linkage}.ts`):
        `normalForm` hash up-to-dimensionless-factors + `classifyLinkage`/`scanLinkages`
        with the F4 guard. Scan: Landauer≡16 restates-canonical (recovery exact);
        Landauer~29 Jarzynski genuine recovers; 17 dimensional-only. Exported.
  - [x] C — discovery canonical kinds: `canonicalKinds` (dimension-aligned) +
        `touchesCanonical` on `VettedCandidate`, additive/informational.
  - [x] D — CLI: `upt canonical` (registry+coverage) + `upt recover` (linkage scan).
        Verified on Windows.
  - [x] (release) **v0.22.0 published to npm** (2026-06-18, tag v0.22.0, CI green).
  - [x] (deferred-item) grew the canonical tranche: +Hawking temperature (restates 42),
        +light-deflection (partners 51), +perihelion (partners 52). 22→25 entries,
        gap 39→37, restates-canonical 1→2.
  - [~] (deferred-item) composition-derived recovery — **DEFERRED as premature**:
        only 5/41 edges have symbolic forms; CT-1 chain matches no canonical.
        Revisit when symbolic-form coverage + tranche grow.
  - [ ] (future, when warranted) add symbolic forms to more composition edges, then
        build composition-derived recovery; continue tranche growth for established
        bridges only (most remaining gap bridges are speculative — no standard partner).

- [x] ✅ **DONE — post-0.22.0 discovery/linkage hardening (2026-06-18,
      branch `claude/upt-physics-tensor-analysis-9s38dp`).** Acts on a fresh
      analysis run (`upt audit`/`recover`/`predict`/`discover`). Shipped, in
      `CHANGELOG.md [Unreleased]`: **`CE-jarzynski`** canonical entry — BE-29's
      L-layer partner (registry 25→26, gap 37→36, restates-canonical 2→3);
      **normal-form stub-identity tagging** — `normalForm` keeps named
      non-constant dimensionless stubs (`ln⟨e^−βW⟩`) distinct from constants
      (`ln2`), demoting the two BE-29 form-coincidences `recovers`→`dimensional-only`
      while preserving the 3 declared restatements; **discovery funnel hardening** —
      anchor-derived magnitude fallback + generic↔specialization bar +
      sourced BE-24/BE-26 representative values (funnel 23→12 promising, 6→20
      magnitude-clash); `docs/research/BE-29-Landauer-Recovery.md`; and a
      dependency-graph regen (`npm run docs:deps`) + architecture/README/CLAUDE
      stat refresh (173 files / 8 modules / 1236 exports / suite ~2796).
      **Merged to master** (auto-PRs #65–#69). **v0.23.0 prepped 2026-06-18:**
      `package.json` 0.22.0 → 0.23.0, CHANGELOG `[Unreleased]` finalized as
      `[0.23.0]` with the dep-health snapshot (audit 0 vulns, outdated none).
      **v0.23.0 PUBLISHED to npm 2026-06-18** (tag `v0.23.0` at `2c646cf`,
      `npm latest` = 0.23.0, CI green). Suite 2796 passing.

- [x] ✅ **RELEASE DONE — single rollup tag v0.14.0 at final HEAD (2026-06-16)**.
      Reconciled the lagged package.json version (0.10.0 → 0.14.0), updated the
      optional mathts-* peers to latest in-range + re-validated the suite against
      them (2620 passing; GL4_LONG=1 release-prep tier 8 passing), committed
      (d1fdd3b), pushed master + tag v0.14.0, **published to npm** (latest;
      `npm publish --ignore-scripts --access public`, 624 files), CI green. First
      npm publish since 0.7.3 (rolls up the UNRELEASED 0.8.0–0.13 milestones).
      Research note + Zenodo DOI still user-only (below).
- [x] ✅ **v0.15.0 — bridge-gradient numerical path + audit honesty (2026-06-16)**.
      Discovered `bridgeGradient` (reverse/forward AD) CANNOT differentiate the
      plain-JS catalog evaluators (empirically throws even with MathTSEngine — the
      TapedTensor doesn't survive `engine.toNested`); tape/dual AD only sees
      engine-traced ops, and P8 Decision #1 keeps evaluators plain-JS. Added
      `bridgeGradientNumerical` (central FD, cbrt-eps step, Adam-vetted) +
      `BridgeNumericalGradientResult`; replaced the dead `it.skip` placeholder with
      real analytic cross-checks (BE-42 −T_H/M, BE-11 multi-param) + a MathTS
      throw-guard; corrected the false "autograd would handle this" comments. Also
      fixed the plan-doc audit to skip `*-Brainstorm.md` ("not promises") + flipped
      7 audit-verified done items (`audit:plans` now exits 0). Published 0.15.0.
- [x] ✅ **DONE 2026-06-16 (v0.16.0) — bridge gradients ARE AD-differentiable.**
      Solved via a *different* lever than feared: NOT an evaluator rewrite, but
      reverse-mode AD over the symbolic RHS AST (`bridgeGradientAST`). Lowers the
      `*_RHS: ExprNode` through mathts-autograd's TapedTensor ops (var → traced
      input; other symbols → constant tape leaves), so the gradient is EXACT and
      the plain-JS evaluators stay untouched (P8 #1 intact). Scalar grammar is
      `symbol + op(+ − * / ^)` only (transcendentals are typed-stub symbols), so
      faithful encodings (BE-42) differentiate exactly; stub-encoded bridges
      differentiate w.r.t. the stub. Validated BE-42 `dT_H/dM=−T_H/M` exact + vs
      numerical + repeated-var accumulation. Published 0.16.0.
- [x] ✅ **DONE 2026-06-16 (v0.17.0) — by-id registry.** `BRIDGE_RHS_BY_ID`
      (`src/bridges/rhs-registry.ts`, 42 bridges, single source of truth — the
      round-trip test now derives from it) + `bridgeGradientASTById('BE-42','M',…)`
      + `astDifferentiableBridgeIds()` (exact-AD coverage discovery). Published 0.17.0.
- [x] ✅ **DONE 2026-06-16 (v0.18.0) — transcendental grammar + first faithful batch.**
      Added the `transcendental` scalar-AST node (exp/ln/logₙ/sin/cos/tan/sinh/cosh/
      tanh; dimensionless→dimensionless) across validator + numerical lowering +
      traced AD lowering + coverage predicate; `TranscendentalFn` is `@public`.
      Adam-vetted (YELLOW→addressed). Faithfully re-encoded **BE-37** (ln(R_far/R_near))
      and **BE-34** (exp(−mc²/k_BT_reh)) from stub symbols → exact AD w.r.t. the
      exposed variables; round-trip dimensional_signature preserved. Published 0.18.0.
- [x] ✅ **DONE 2026-06-16 (v0.19.0) — remaining exposable-variable bridges.** Added
      the `abs` node (dimension-preserving) and faithfully re-encoded BE-25 (log2),
      BE-40 (sin/cos of h/f), BE-41 (exp + abs of |φ−φ₀|), BE-45 (two natural logs),
      BE-46 (exp(−α/Λ)) — exact AD w.r.t. the exposed variables; round-trip preserved.
      Published 0.19.0. **The exposable-variable transcendental stubs are now
      exhausted** — remaining stubs are NOT exposable without further work: BE-29
      (ensemble average ⟨…⟩), BE-26/BE-38 (interpolation-function stubs f()/ν(z)),
      and BE-26's WKB `sqrt` of a dimensionful quantity (blocked on the deferred
      rational-exponent Dimension algebra below).
- [x] ✅ **NOT NEEDED — already supported (verified 2026-06-17).** The earlier
      "deferred rational-exponent Dimension algebra" item was based on a misread.
      `Dimension` exponents are already `number`; `power(D,n)` handles any rational n;
      and `^` with a NUMERIC-LITERAL exponent already works on a dimensionful base —
      `(m)^0.5` validates to `[M^0.5]`, lowers, and is exactly AD-differentiable
      (`TapedTensor.pow(k)`, fractional k). BE-12 (λ_T ∝ T^(−1/2)) was exactly AD-able
      all along. No dedicated `sqrt`/`cbrt` NODE exists, but it'd be redundant sugar
      (= `^0.5`). Regression guard: tests/dimensional/dimensionful-power-ad.test.ts.
      CHANGELOG [Unreleased] corrects the record.
- [x] ✅ **DONE 2026-06-17 (v0.20.0) — differentiable definite integrals.** The
      `integral` node gained optional `lower`/`upper` bounds; numerical lowering +
      traced AD via 16-pt Gauss–Legendre (`src/numerical/quadrature.ts`).
      `bridgeGradientAST` differentiates definite integrals (Leibniz parameter
      gradient + boundary term; nested ∫∫ via a scoped bound-var env). Adam-vetted
      YELLOW→addressed (honest framing: exact gradient of the quadrature, which
      approximates the true integral for non-polynomial integrands; exact for
      constant/polynomial). Published 0.20.0.
- [x] ✅ **DONE 2026-06-17 (v0.21.0) — BE-26 WKB re-encoded with explicit barrier
      bounds.** `∫_{x₁}^{x₂}√(2m(V−E))dx` (constant integrand → GL exact, matches the
      canonical evaluator to <1e-9) + Gamow factor `transcendental(exp, −1·WKB)`.
      bridgeGradientASTById('BE-26',…) now differentiates exactly w.r.t. m, V−E, x₁,
      x₂ (physical signs verified; f(T,pH,EM) stays a stub). **Adam + Eve both GREEN**
      (Eve back on o3 after the reload). Round-trip [frequency] preserved. Published.
- [ ] **Frontier (research-level):** ensemble averages (BE-29 `⟨…⟩`) and
      interpolation-function stubs (BE-26 `f()`, BE-38 `ν(z)`) remain non-closed-form;
      `bridgeGradientNumerical` (FD) serves them. No clean lever — large/open scope.
- [ ] **v0.11 headline: full 44-edge catalog→graph migration** + the
      per-edge quantity-NAMESPACING design (the aliasing finding in the
      Phase-D report is the forcing function), + O-4 flat migration,
      + C2/C3 calibration targets, + second data confrontation.

## Open & pending — consolidated 3-agent audit, 2026-06-11

(Every line verified against HEAD `a18b64d`; stale claims from dated
audit docs were dropped — e.g. "EXPECTED_DIMENSION_BY_BRIDGE missing
BE-53/54" and "CLAUDE.md 42-bridge tally" are both already fixed.)

### User-only

- [x] ✅ **DONE 2026-06-16** — branch already merged to master (PR #64);
      **tagged v0.14.0** at final HEAD (not v0.10.0 — version field was lagged,
      reconciled to the documented v0.14 feature level); published
      (`npm publish --ignore-scripts --access public`); CI green (the workflow
      had in fact already run for PRs #63/#64 — the "never executed" note was
      stale). Strict `tsc -p tsconfig.tests.json` gate passes.
- [ ] Zenodo DOI for `docs/research/v0.10.0-Composition-Research-Note.md`
      + actually send it to a physicist.

### Code (next sessions, roughly priority-ordered)

- [x] ✅ **G-9 units-normalization — INCREMENT 2 (additive core) — EXECUTED
      2026-06-16** (`docs/planning/v0.14-G9-Increment2-Design.md`, Adam YELLOW +
      Eve YELLOW, all folded). Shipped deliverables 1–3: (1) the adapters
      (`toGeometrized`/`fromGeometrized`/`geometrizedFactor`/
      `NonGeometrizableDimensionError`) promoted `@internal`→`@public` + exported
      from `src/index.ts` (the x⁰=ct boundary API); (2) a geometrized-native
      Schwarzschild fixture (`tests/fixtures/schwarzschild-geometrized.ts`, ships
      `gFn`+`gInverseFn`); (3) the SI↔geometrized Kretschmann equivalence test —
      adapter exercised on the MASS input (`M_geom=GM/c²≈1477 m`), validated vs
      `K=48 M_geom²/r⁶` through the full FD pipeline, matched to the SI fixture's
      K. Adam caught the circular `fromGeometrized(K,L⁻⁴)` (factor=1 no-op) +
      the t-vs-ct chart conflation; Eve caught the `@public`-tag invariant gate +
      that the fixture needs `gInverseFn` + CUT the FD claw-back (provable
      unit-invariant ceremony, already covered by `pderiv-order*.test.ts`).
      STRICTLY ADDITIVE; default SI pipeline untouched. Suite **2595 passing**
      (+11); tsc src+tests, build, smoke ✓.
- [x] ✅ **G-9 INCREMENT 3 — DISPOSITIONED 2026-06-16**
      (`docs/planning/v0.14-G9-Increment3-Disposition.md`, Adam GREEN on the
      decline). The default-pipeline migration was **DECLINED**: its premise
      (c=G=1 improves FD precision) is refuted — relative FD error is unit-
      invariant and MEASURED no-better (Adam reproduced + extended: geometrized
      far-field Kretschmann relErr DIVERGES, 0.40 at r=1000·r_s vs SI ~3.8e-8);
      the dynamical consumers use analytic closures not FD, and E=−p_t≈9e16 is
      conserved bit-exact (symplectic, cyclic coord). No precision win, no
      maintenance win (pipeline is convention-agnostic) → strictly losing trade.
      The **fixture-name consolidation was DONE**: hard-renamed all `unitless*`
      (c=1) closures → `geometrized*` (shared Minkowski fixture + its importer +
      the bianchi-residual test-local de Sitter/Schwarzschild closures), so the
      suite carries exactly SI + geometrized with consistent naming. Suite **2595
      passing** (pure rename); tsc src+tests ✓.
- [ ] **G-9 follow-on (separate axis, deferred):** the Eve M-1 per-quantity
      unit-convention tag (GeV/J, bits/nats) — distinct from c/G geometrization.
- [x] ✅ **Distributional / variational grammar primitives (v0.14) — EXECUTED
      2026-06-16** (`docs/planning/v0.14-Distributional-Grammar-Design.md`,
      Adam GREEN + Eve YELLOW→GREEN, all findings folded). Closes the ROADMAP
      "grammar extensions for genuinely-deferred primitives". Two new SCALAR
      `ExprNode` arms: `dirac-delta` (`[δ(x)]=[x]⁻¹`) + `variational-derivative`
      (`[δF/δφ]=[F]/([φ]·[μ])`, `over` = measure dim, dual of `integral`). Both
      reject tensor children (`TensorInScalarOpError`) and throw in `lowering`
      (non-numerical, beside integral/derivative). Makes BE-15's Model-A
      Langevin/FDT relation dimensionally homogeneous (marquee test + a negative
      test); BE-15 docstring records barriers 1+2 lifted, bare-Langevin Γ
      disambiguated from coarsening Γ=L²/T. Adam caught the expr-simplify.ts
      audit gap + the Γ self-contradiction; Eve caught the README "21 node
      kinds"→23 count + the null short-circuit / 3-child guard. INLINE union
      members ⟹ zero public-surface change (1162 exports unchanged); no new src
      files. CATALOG re-encoding (BE-15 faithful Langevin, BE-28 MEPP σ=ΣJX
      definiendum-warning) + barrier 3 (functional integration) deferred to
      physicist. Gates: both tsc ✓, full suite **2566 passing** (+16), build +
      smoke ✓. FOLLOW-UP (2026-06-16): grammar applicability tested across the
      full catalog (`tests/bridges/catalog-grammar-applicability.test.ts`, +10).
      Survey of 44 bridges + known laws → 3 applicable: BE-15 fully expressible;
      BE-46 (δ expressible, functional metric-integral = barrier 3); BE-28
      (variational-δ expressible on ∫σ dt, Lagrange-multiplier + index-sum
      remain). Regression: BE-15/28/46 encoded RHS unchanged, use neither new
      kind. Suite **2576 passing**.
- [x] ✅ **G-9 increment 1 — geometrized boundary adapters — EXECUTED
      2026-06-15** (`src/numerical/geometrized.ts`, internal;
      `docs/planning/v0.13-G9-Adapters-Plan.md`, Eve-vetted on the Adam-vetted
      r2 design). Dimension-functor-driven SI↔geometrized conversion
      `G^M·c^(T−2M)` + I/Θ/N/J domain guard (NonGeometrizableDimensionError
      extends UPTError). Eve caught the design's M_sun pin (1476.6 m IAU-nominal
      ≠ repo's 1477.06 m); pins fixed + error-class convention. ADDITIVE, zero
      blast radius. src 156→157; exports 1158→1162 (internal); no public-surface
      change. Gates: both tsc ✓, full suite **2550 passing** (+9), build ✓.
- [x] ✅ **Symbolic exponents on a dimensionless base (v0.13) — EXECUTED
      2026-06-15** (`docs/planning/v0.13-Symbolic-Exponent-Design.md`,
      Adam+Eve-vetted, both YELLOW → all r2/r3 revisions folded). Bounded core
      `^`-grammar extension: a non-literal (input-dependent) exponent is now
      accepted when the base is DIMENSIONLESS (sound:
      dimensionless^dimensionless = dimensionless). validator.ts `^` arm +
      evalExpr relaxed; literal exponents unchanged; dimensionful-base
      non-literal still violates (test 206 pinned). Consumer: be33Edge now
      carries the faithful `ξ_0·(T/T_0)^(−1/z)` symbolic form (was pinned z=1),
      drift-guarded vs evaluateHertzMillis with z=2; catalog AST unchanged.
      Adam caught the tensor-exponent throw + null short-circuit; Eve caught
      that be33Edge already exists in catalog-full.ts (mutate, don't recreate).
      No new exports (1158). Gates: both tsc ✓, full suite **2541 passing**
      (+9, no regressions), build+smoke ✓. Broadens symbolic coverage to
      scaling-law bridges; does NOT make CI-1 checkable (over-determination).
- [x] ✅ **Orphan-connector analysis (v0.12) — EXECUTED 2026-06-15**
      (`proposeOrphanConnectors` / `upt connectors`;
      `docs/research/Orphan-Connector-Analysis.md`; spec Part-IX §9 note).
      Used the new feature map to analyze the catalog's 20 isolated bridges:
      intersect cross-cluster same-dim candidates with the isolated/anchored
      partition. 7 orphans have a same-kind connector, 12 are unconnectable.
      Physics review CONFIRMED CI-1/CI-2 (BE-15→BE-33/34 criticality) as the
      only motivated ones and REJECTED the rest with grounded reasoning (BE-22
      TEE gapped; Förster≠horizon; proton-mass≠carrier-mass;
      hubble≡decoherence decoy) — a quantified negative, nothing registered.
      Also documented: a "rich" arbitrary anchor turns all 132 discover
      candidates contradictory (consistency needs a physically-consistent
      seed). **CORRECTION (2026-06-15, after investigating the "symbolic test
      CI-1" follow-on):** CI-1 is an OVER-DETERMINATION, not a composition —
      both `coarsening-length` and `quantum-correlation-length` are only ever
      targets (never sources), so identifying them merges two independent
      derivations, not a chain; `composeSymbolic` does not apply. Its
      confirmation is fundamentally a physicist's dynamic-scaling judgment, not
      more tooling (see the corrected §"Can CI-1 be mechanically checked?" in
      `docs/research/Orphan-Connector-Analysis.md`). Separately, BE-33/34 are
      grammar-blocked (variable critical-exponent powers `(T/T₀)^(−1/z)`); a
      bounded `^`-on-dimensionless-base extension is a candidate FUTURE
      foundation cycle (Adam+Eve), but would not make CI-1 checkable. exports
      1157→1158; no new src file (added to bridge-analysis.ts); no
      public-surface change. Gates: both tsc ✓, full suite **2532 passing**
      (+6), build ✓.
- [x] ✅ **MathTS-backed symbolic simplification (v0.12) — EXECUTED
      2026-06-15** (`docs/planning/v0.12.0-Symbolic-Simplification-Design.md`,
      Adam+Eve-vetted). Optional supplement removing the "unsimplified composed
      AST" caveat: `simplifyExpr`/`simplifyObservable`
      (`src/composition/expr-simplify.ts`, internal; `upt symbolic --simplify`)
      gensym-render → MathTS `parse`+`simplify` → walk back, behind the
      Path-A/Path-B contract (absent peer = graceful no-op). THREE guards
      (dimensional `equals`, structural subset, numeric agreement over ≥2
      probes) make the black-box CAS safe. CT-1 folds
      `k_B·(ℏc³/8πG·mass·k_B)·ln2` → `ℏc³·ln2/(8πG·mass)` (k_B cancels); CT-1b
      no-ops (a MathTS simplify BigInt bug on `a/(b/c²)` — caught + degraded).
      Adam+Eve: both YELLOW, 11 r2/r3 revisions folded (node API + round-trip
      runtime-verified; Eve caught the `^`-base precedence bug EVE-A + the
      `<2 probes` vacuous-pass EVE-C; claims grep-verified). FULL MathTS npm
      perspective recorded: mathjs-lineage CAS (`simplify`/`derivative`);
      `mathts-core` also has a units engine + `BigNumber`/`Fraction` (out of
      scope — UPT's ℤ⁷ Dimension is bespoke). `derivative` is a future hook for
      the gradient/uncertainty layers. src 155→156; exports 1153→1157; no
      public-surface change. Gates: both tsc ✓, full suite **2526 passing**
      (+6), build+smoke ✓.
- [x] ✅ **Symbolic bridge composition / Observable contract (v0.12) —
      EXECUTED 2026-06-15** (`docs/planning/v0.12.0-Symbolic-Composition-Design.md`,
      Adam+Eve-vetted). Pushes composition from numeric-only to SYMBOLIC:
      `composeSymbolic(first, second)` substitutes `first.symbolic` into
      `second.symbolic` at the junction → an `Observable` (validated AST +
      evaluable). Resolves the Part-IX §4 deferral via option (d): optional
      `symbolic?: ExprNode` on `BridgeEdge` (additive/non-breaking). Built the
      missing scalar `evalExpr` + `substitute` primitives + a `CONSTANTS`
      registry. Authored symbolic forms for the CT-1/CT-1b chain edges; a
      drift guard binds each to its numeric evaluator (rel tol 1e-9). Marquee:
      CT-1b recovers solar-mass T_H = 6.17e-8 K SYMBOLICALLY, matching the
      numeric composeEdges. Adam+Eve: both YELLOW, 13 r2/r3 revisions folded
      in (Opus-subagent stand-ins per the MCP-down fallback; Eve's file:line
      claims grep-verified — she caught the recon misnaming
      `landauer-erasure-energy`). Public: +composeSymbolic/Observable/
      SymbolicCompositionError/SymbolicEvalError/ComposeSymbolicOptions. src
      151→155; exports 1137→1153. CLI: `upt symbolic`. Gates: both tsc ✓, full
      suite **2520 passing** (+19), build+smoke ✓, snapshot updated.
      NEXT (future): author `symbolic` forms for more edges; symbolic
      simplification (constant-folding) is deliberately out of scope.
- [x] ✅ **Premise-extension directions (v0.12) — EXECUTED 2026-06-15**
      (`docs/planning/v0.12.0-Premise-Extensions-Design.md`). Four extensions
      advancing the tensor-maps-physics premise by wiring existing
      verification primitives into generative tools. **D3** — equation-level
      valence homogeneity in `validateEquation` (closes the deferred Task-7
      free-index check; a tensor=scalar is now caught even when units match).
      **D1** — `bridge-prediction.ts` (internal; `upt predict`): projects
      CATALOG_GRAPH onto the (scale×force) plane, populates a real
      `UniversalTensor`, ranks empty regime cells as link hypotheses
      (40/41 edges placed). **D2** — `discovery.ts` (internal; `upt discover`):
      vets `proposeLinkCandidates` via merge/unlock/retrodict →
      promising/inert/contradictory (132 → 26/106/0). **D4** —
      `confrontation-coverage.ts` (internal; `upt coverage`): grounding-tier
      audit (2 data-confronted, 36 graph-computable, 6 encoded-only, 0 thin),
      fabricates nothing. All review surfaces, not automated discovery. src
      148→151; exports 1130→1137. Gates: both tsc ✓, full suite **2501
      passing** (+24, no regressions), build+smoke ✓, 3 new CLI commands ✓.
      NEXT (human): physicist review of the `upt discover` promising set and
      the `upt predict` top regime-gaps; both are explicitly review surfaces.
- [x] ✅ **Dependabot fix + dep refresh — EXECUTED 2026-06-15.** Resolved
      the 2 default-branch Dependabot alerts (1 high RCE GHSA-gv7w-rqvm-qjhr
      + 1 low GHSA-g7r4-m6w7-qqqr) by removing the dead `@yao-pkg/pkg`
      dev-dep + `build:exe` `.exe`-packaging path from all three `tools/`
      utilities — it transitively pulled vulnerable esbuild 0.27.7 and every
      `@yao-pkg/pkg` release still pins `esbuild@^0.27.3` (no upgrade path;
      the tools run via tsx, the `.exe` was never committed/used). Deleted
      the lone committed tool lockfile (the only Dependabot scan target;
      siblings never had one). Within-range `npm update` refresh (mathts
      0.2.1→0.2.2 / 0.2.2→0.2.3, @types/node, vitest 4.1.7→4.1.8). Dep
      health now: `npm audit` 0 vulns, `npm outdated` clean. Gates: both
      tsc ✓, full suite 2477 passing (unchanged), build+smoke ✓.
- [x] ✅ **Lean sprint — EXECUTED 2026-06-14** (S1/S2/S3/S4/M1/M2;
      `docs/planning/Lean-Sprint-Plan.md`). Post-v0.8–v0.11 simplify pass:
      dep-graph deep dive found 0 dead files / 0 cycles → wins are dedup +
      surface trim, no behavior change. S1: extract the 41-edge graph
      (rebuilt ~10 places) into the `@public` `CATALOG_GRAPH`. S2: audit
      test imports `attemptDerivation`/`dimensionalFreedom` instead of
      private copies. S3: shared `tests/fixtures/dimension.ts` `D` factory.
      S4: extract `quantityCanonicalizer`/`quantitiesOf` (anchoringDistance
      raw-name behavior preserved). M1+M2: un-exported 10 internal-only
      symbols (`FieldSpec`/`LowerNodeRecur` + result-type interfaces
      retained — params/returns of exported fns, `.d.ts` emit). Dep-tool
      unused exports 37→27; src files 147→148; exports 1135→1130. Gates:
      both tsc ✓, full suite 2477 passing (unchanged), build+smoke ✓.
- [x] ✅ **v0.11 headline — EXECUTED 2026-06-11**: namespacing gate
      landed first (Option D per Adam r2 — all six acceptance criteria
      pass: CompositionAliasError name-collision rule,
      SOURCE_ALIAS_DISPOSITIONS registry, renameSecond input-remap,
      centralized quantities.ts (~120 nodes, uniqueness-pinned),
      M_E_SI, be48 docstring fix, λ_T(m_e,T_H)=3.0012e-4 m pins) —
      then the full migration: **+26 catalog-full edges → 41-edge
      graph** (5 NOT-A-BRIDGE skipped per rejected.ts; BE-44 honestly
      skipped — array-input evaluator incompatible with the scalar edge
      contract). Naming judgments recorded (effective-mass /
      tunneling-mass distinct from gravitational mass). Enumeration over
      the full graph: 11 compositions, **7 novel candidates** (all via
      the T_H identification), 1 collision correctly held at the gate —
      docs/research/v0.11.0-novel-candidates.md. REMAINING HUMAN: the
      ~90 new quantity-naming judgments are standing review surface
      (CONTRIBUTING).
- [x] ✅ **Identifiability classifier — EXECUTED 2026-06-13**
      (`src/composition/identifiability.ts`: classifyIdentifiability /
      classifyAll / forwardClosure; 15 tests). Structural over/exactly/
      under-determined + given verdicts over the directed edge
      hypergraph; honors QUANTITY_IDENTIFICATIONS; target-removed closure
      excludes circular self-support; blockingFrontier for
      under-determined. Real anchor: from {mass}, hawking-temperature is
      over-determined (be-42 + be-42-via-rs). Implements Consequence 1 of
      docs/planning/Bridge-Inference-Epistemics-Note.md (design note:
      Identifiability-Classifier-Design-Note.md). 3 runtime exports added
      (surface 155→158; snapshot updated).
- [x] ✅ **Buckingham-π enumerator — EXECUTED 2026-06-13**
      (`src/dimensional/buckingham.ts`: buckinghamPi /
      dimensionallyDetermines / RationalizationError; 11 tests). Null
      space of the dimension matrix in EXACT rational arithmetic → the
      n − r dimensionless groups; dimensionallyDetermines returns the
      target's monomial UP TO A DIMENSIONLESS CONSTANT. Result types
      carry FORM only (no value/constant field) — the honest boundary
      enforced in the API. Pins pendulum T=const·√(L/g), r_s=const·GM/c²,
      and that mass alone does NOT determine r_s. Build target 1 — the
      LAST piece of the epistemics note; all three inference primitives
      now shipped. 3 runtime exports (surface 160→163; snapshot updated).
- [x] ✅ **Retrodiction harness — EXECUTED 2026-06-13**
      (`src/composition/retrodiction.ts`: retrodict / retrodictNode; 10
      tests). Masks each over-determined node, recovers it via every
      independent derivation from ground-truth inputs, scores relative
      spread (consistent / inconsistent / single / unrecoverable; headline
      allConsistent). Pass bar PRE-REGISTERED (spread ≤ 1e-6) in
      docs/planning/Retrodiction-Harness-Design-Note.md. First-run anchor
      (passing): {mass: M_sun} → hawking-temperature consistent (be-42 vs
      be-42-via-rs agree to float precision) + recovers 6.17e-8 K. `classifyAll`
      is the feeder, as the epistemics note anticipated. Implements
      Consequence 2. 2 runtime exports (surface 158→160; snapshot updated).
      REMAINING from the epistemics note: the Buckingham-π enumerator
      (build target 1) is the last unbuilt piece.
- [x] ✅ **`explainQuantity` unified entry point — EXECUTED 2026-06-13**
      (`src/composition/explain.ts`: explainQuantity; 7 tests).
      Synthesizes the identifiability classifier + retrodiction harness +
      Buckingham-π into one QuantityExplanation with a plain-language
      summary (how the graph computes the target, whether redundant
      derivations agree, the recovered value, and whether the known set
      is dimensionally sufficient). Closes the bridge-inference suite —
      three primitives + the unifying entry point all shipped. 1 runtime
      export (surface 163→164; snapshot updated).
- [x] ✅ **Full-chain derivations + explain CLI + dimensional-derivation
      benchmark — EXECUTED 2026-06-13.** (a) `DerivationExplanation` now
      carries `leafInputs` (last-hop sources traced to the leaves) +
      optional `dimensionalForm`; `traceLeaves` helper. (b)
      `examples/explain.mjs` + `npm run explain` surface the summary for
      non-TS users. (c) Benchmark of 9 textbook equations (pendulum,
      Kepler, Schwarzschild, string wave, Planck length/mass/time,
      Compton, thermal de Broglie/BE-12) + Reynolds re-derived by the
      Buckingham-π engine, pinned in
      tests/dimensional/derivation-benchmark.test.ts and recorded in
      docs/research/Dimensional-Derivation-Benchmark.md (verbatim engine
      output).
- [x] ✅ **Bridge-equation dimensional audit — EXECUTED 2026-06-13**
      ("try to derive the bridge equations"). Pointed the Buckingham-π
      engine at all 41 catalog edges: 11 DERIVED (form closes + monomial
      matches the evaluator, recovering prefactors ln2, 1/4π, 1/8π, 2,
      √2π, 4), 5 DECOY-ONLY (dimensionally valid but wrong form — e.g.
      be-42-direct → rest-mass temperature; be-27 → additive), 25
      UNCLOSABLE (irreducible free group). Empirical confirmation of the
      epistemics-note thesis on the catalog itself.
      tests/dimensional/bridge-derivation-audit.test.ts +
      docs/research/Bridge-Equation-Dimensional-Audit.md.
- [x] ✅ **Dimensional-complexity spectrum + orthogonality caveat —
      EXECUTED 2026-06-13.** Graded the non-derived bridges by free
      dimensionless-parameter count (0→6); 11 are one ratio from a
      monomial (incl. established perihelion/Shapiro). Cross-tab vs
      catalog status proves derivability ⊥ credibility (unclosable holds
      5 established; derived is 8/11 speculative). Audit doc gained the
      "not a credibility score" caveat + triage guidance. Possible future
      promotion: `freeParameters`/`dimensionalComplexity` as a public
      engine primitive (currently test-side).
- [x] ✅ **Bridge-priority scorecard — EXECUTED 2026-06-13.** Internal
      `src/composition/bridge-analysis.ts` (dimensionalFreedom /
      attemptDerivation / anchoringDistance / bridgePriority) ranks the 32
      non-established bridges by structural DECIDABILITY (grounding +
      complexity + anchoring + data-confrontation flag) into Tiers 1/2/3
      (8/6/18). Runnable via `npm run bridge-priority`; doc
      docs/research/Bridge-Priority-Scorecard.md; 11 tests. Framed
      throughout as triage, NOT credibility (orthogonality pinned).
      Internal — not on the public surface. Future option: promote to a
      public analysis API alongside adjudicateCatalog.
- [x] ✅ **Custom equations in the CLI (Path B) — EXECUTED 2026-06-14.**
      Self-contained scalar formula parser (src/numerical/formula.ts,
      behind a `FormulaParser` interface for Path A swap) + dimension-spec
      parser (src/dimensional/dimension-spec.ts), both internal/safe.
      CLI: `upt eval` (evaluate a user formula) + `upt derive
      <target:dim> <var:dim>… [--formula]` (derive a user equation's
      dimensional form + recover the prefactor). 17 tests. Pendulum demo
      recovers 2π. **Path A (MathTS parse/AST) deferred — user will
      publish synced MathTS package versions (`create(all)` currently
      breaks on a missing `Unit` export, core 0.1.2 vs expression 0.2.x);
      then swap a MathTS `FormulaParser` impl behind the same interface.**
      Full plan written:
      `docs/planning/MathTS-Formula-Integration-Design-Note.md` (blocker,
      seam, registry+conformance design mirroring engine-registry/
      engine-conformance, Phase-2 dimensional-checking payoff, rollout
      steps). BLOCKED on the upstream MathTS `create(all)` assembly gate.
- [x] ✅ **Path A (MathTS formula parser) — EXECUTED 2026-06-14.**
      Upstream gate met (mathts-core@0.1.3 exports `Unit`,
      mathts-functions@0.2.2 ships assembled `parse`/`evaluate`).
      formula-mathts.ts + formula-registry.ts +
      mathts-functions.ambient.d.ts; shared conformance suite both parsers
      pass; CLI wired through the registry (--debug shows the active
      parser). MathTS stays optional (UPT still zero-hard-dep); diverges
      from Path B only on `e` (Euler).
- [x] ✅ **Path A Phase 2 (formula dimensional check) — EXECUTED
      2026-06-14.** src/numerical/formula-dimension.ts transpiles the
      MathTS formula AST → UPT ExprNode and runs validate(), so
      `upt derive --formula` reports homogeneity + inferred dimension +
      target match (pendulum → [time]; length+gravity → not homogeneous;
      sin(length) → rejected; Hawking → [temperature]). Transcendentals
      via the typed-stub pattern. MathTS-only (needs the AST). Design:
      docs/planning/Formula-Dimensional-Check-Design-Note.md. 9 tests.
      Closes the MathTS integration arc.
- [x] ✅ **Phase 2 made default-on — EXECUTED 2026-06-14.** Exposed Path
      B's AST (parseFormulaToAst/evalFormulaAst) + a transpilePathB so the
      dimensional check works WITHOUT MathTS; getFormulaDimensionChecker()
      never null (MathTS AST when present, built-in AST otherwise — same
      ExprNode, builtin↔mathts parity test). The MathTS-only limitation is
      gone; MathTS is now a parity-equivalent alternate AST source.
- [x] ✅ **Catalog linkage map — EXECUTED 2026-06-14.** linkageMap in
      bridge-analysis.ts: connected components of the catalog graph by
      shared quantity (+ identifications). 23 components — one anchored
      cluster of 16 (mass/temperature hubs), a cosmological-constant
      cluster (3), a Friedmann cluster (2), 20 isolated; 11 compositions.
      `upt map` command; docs/research/Catalog-Linkage-Map.md; 6 tests.
      The capstone "map their linkage" deliverable. Structural, NOT
      credibility.
- [x] ✅ **Link-candidate proposals — EXECUTED 2026-06-14.**
      proposeLinkCandidates uses the map to surface cross-cluster
      same-dimension identification candidates: 132 → 98 core → 36
      same-kind → ≈3 genuinely motivated (critical-dynamics correlation
      length linking isolated be-15 to the Kibble-Zurek cluster). Funnel
      quantifies the dimensional false-positive rate; output is a REVIEW
      surface only. `upt candidates`; Linkage-Candidate-Proposals.md; 6
      tests. HUMAN follow-up: physicist review of the ≈3 (esp.
      coarsening-length ≟ correlation-length).
- [x] ✅ **3 candidates added to the spec — EXECUTED 2026-06-14.**
      Part-IX §9 (Phase-D candidate identifications): CI-1 correlation
      length, CI-2 critical timescale, CI-3 info–cosmology energy, all
      marked PROPOSED/UNADJUDICATED with an adjudication checklist; NOT in
      QUANTITY_IDENTIFICATIONS. Spec README + spec CHANGELOG updated.
      Pending: physicist adjudication before any promotion.
- [ ] C2 (Einstein-Cartan Newtonian limit — needs weak-field-limit
      machinery) + C3 (Higgs→Λ residue) calibration targets; P-3
      pre-registration required. **(2026-06-16 disposition: NOT engineering —
      physics-blocked.** C2 needs weak-field-limit machinery that does not exist
      AND a physicist's derivation — BE-17 encodes a torsion-norm scalar with
      none of the quantities a Newtonian limit relates. C3 has no closed-form
      relation or literature anchor in the repo (the edges share no quantity; the
      Λ "residue" is the famous unsolved problem). Implementing either = fabricating
      physics. **Stays on the human-physicist surface.**)
- [x] ✅ Second data confrontation — EXECUTED 2026-06-11: BE-23 vs
      Legros et al. 2019 Nat. Phys. 15:142 Planckian-dissipation claim
      (confrontBE23 + uncertainty; HONEST AGGREGATE encoding — network
      blocked per-material table verification, refused to fabricate:
      α = 1.0±0.4 abstract-level claim with machine-readable
      encodingHonestyLevel marker; upgradeable in place; 14 tests).
- [ ] G-9 units-normalization implementation — note VETTED 2026-06-11
      (Adam YELLOW; r2 revisions applied in the note: x⁰=ct convention,
      Q_geom = Q_SI·G^m·c^(t−2m) formula, criterion-(b) reframed as a
      measured gate per the FD unit-invariance derivation, unitless*
      fixture subsumption, factor pins). **Implementation = v0.12** (the
      next foundation-change slot).
- [x] ✅ O-4 — EXECUTED 2026-06-11: computeKretschmann/WeylInputs
      widened (non-breaking union), 6 shims removed (2 left with reason
      — evaluateNumerical boundary), sibling fixtures unified to
      Float64Array; PLUS the Kretschmann optimization: exact factored
      raising (4×4⁵ vs 4⁸, no symmetry assumption) → **29.8× compute
      speedup** (pipeline 2.15×, now FD-dominated); value-identity pins
      <1e-15 incl. random non-symmetric tensors.
- [x] ✅ Klein-Gordon evaluator — EXECUTED 2026-06-11
      (src/numerical/klein-gordon.ts: dispersion residual +
      plane-wave verifier, Peskin & Schroeder §2.1; 18 tests; Part-X
      §X.7 updated honestly — FD wave-operator on grids remains
      future).
- [x] ✅ Kretschmann optimization — EXECUTED 2026-06-11 (see O-4 entry:
      factored raising, 29.8×).
- [x] ✅ Flux Rule-3 WARNING→ERROR promotion — **PROMOTED 2026-06-11**
      (user decision Q1; live catalog verified clean first — 23/23,
      zero reverse arrows; reverse bridges now fail-atomic at addCell;
      whitelist is the deliberate-reverse escape hatch; 3 pins updated).
- [x] ✅ Grammar extensions (Dirac-δ correlators for BE-15; variational-δ
      for BE-28 MEPP) — **GRAMMAR DONE v0.14** (see completed-log entry above).
      The two scalar `ExprNode` arms ship + are vetted + proven on the Model-A
      FDT relation. What REMAINS (now a physics-curation surface, not grammar):
      the actual CATALOG re-encoding of BE-15 (faithful Langevin) and BE-28
      (faithful MEPP maximization, mind the σ=ΣJX definiendum warning) — a
      physicist's call (moved to the human-physicist surface below). Barrier 3
      (functional integration over field configurations) stays out of scope.
- [ ] Optional hygiene: `unused-analysis.md` 19-export cull;
      `mergeAxes` rank-changing reshape (labeled-tensor); regime
      built-ins taxonomy (deferred v0.9 in code comments).

### Human-physicist (standing review surface — CONTRIBUTING.md)

- [ ] Contested adjudications: BE-44 (soft hair), BE-46 (multiverse
      measure), BE-50 (Wheeler-Feynman) — both readings in
      `docs/architecture/v0.8.0-catalog-adjudication.md`.
- [ ] Novel-candidate verdicts: 2 candidates in
      `docs/research/v0.10.0-novel-candidates.md` (review protocol in
      the file; `be-42-via-rs>>be-12` is the clean one).
- [ ] `QUANTITY_IDENTIFICATIONS` review (currently the T_H ≡ T
      judgment + each future migration naming).
- [ ] BE-23 encoding check vs Hartnoll 2015; standing
      JSON-catalog/dimensional-signature audits; negative-catalog
      rebuttals (`src/bridges/rejected.ts`).

- [x] ✅ **G-9 design note** shipped 2026-06-11
      (`docs/planning/v0.10.0-Units-Normalization-Design-Note.md`).
      **Implementation remains OPEN** (see Open & pending §code below) —
      one foundation change per cycle; Adam+Eve vet the note before
      planning.

- [x] ✅ **v0.8.0 — composition MVP + GW170817 confrontation + catalog adjudication — IMPLEMENTED + MERGED (PR #28); tag superseded by the single-v0.10.0-tag rollup decision** (2026-06-11, branch `claude/bridge-equations-specs-review-4mfy38`). Implements `docs/planning/v0.8.0-Improvement-Plan.md` top picks via Design r2 (Adam-vetted) + 8-phase plan. Shipped: `src/composition/` graph layer with all three PRE-REGISTERED targets passing (CT-1 derives E_min(M)=ℏc³ln2/(8πGM) from BE-42∘BE-16 — the framework's first derived literature-anchored relation; CT-1b law-mediated chain through the first diagonal-law edge; CT-2 BE-51/52 M-independent ratio); `confrontBE36()` GW170817 real-data confrontation (BE-36's symmetric encoding honestly flagged vs the asymmetric published bound); membership criterion + negative catalog (BE-42 REVERSED to bridge — deferred Adam-HIGH resolved; BE-28/29/32/35/40 NOT-A-BRIDGE upheld incl. the deferred BE-29 reconsider; BE-44/46/50 contested → CONTRIBUTING.md tasks); first CI workflow; fast-check property tests; `data/bridge-catalog.json` review surface + freshness guard; Part-VI §XXX-B promotion protocol. Suite 2126 → **2181/0/5/1** (209 files); tsc/build/smoke clean. *(2026-06-11 audit update: the standalone v0.8.0 tag is superseded — package.json is at 0.10.0 and the recommendation is one v0.10.0 tag at final HEAD; CHANGELOG keeps the per-milestone sections.)* Same branch also carries the spec-review arc (44-bridge spec catalog completion, Part-X, spec CHANGELOG relocation, README condensation). Post-vet punch-list applied pre-tag (identificationUsed provenance, double-evaluation fix, membership barrel merge, M_SUN_SI promotion). **C1 pointer: DONE 2026-06-11 — CT-3 (Zurek decoherence scaling, BE-12∘BE-11) pre-registered (`4fe47f4`) and implemented (`159dd5c`) per the P-3 discipline.**
- [x] ✅ **v0.9.0 hygiene sprint (was "v0.7.2") — EXECUTED 2026-06-11** on branch `claude/bridge-equations-specs-review-4mfy38` (honest deviation: the plan's own branch `claude/changelog-todo-sync-9PdMg` was stale vs post-v0.8.0 HEAD and this env can only push the designated branch). All phases complete: Phase 0 baseline (counts re-verified at HEAD — O-1/O-6 80 non-comment callsites/24 files vs plan's ~53; plan's comment-filter regex was a no-op on grep output); Phase 1 PG pilot (+R-1b); Phase 2 single-reviewer vet YELLOW (H-1 PG-bench silent NaN fixed; M-1 spawned the tsconfig.tests.json diff-gate, 71 legacy errors baselined); Phase 3 Schwarzschild high-volume (fixture Float64Array(16)/(64), 4 hot-path src files dim-stride, 17 test/bench files, R-1/R-1c; killing.ts correctly NOT migrated — lower-metric providers, plan-list error); Phase 4 S-9 registry + compile-time exhaustiveness (+8 pins); Phase 5 bench gate **SHIP-WITH-NOTE: PO-1 1.56×/1.62×** (same-machine ratios; Windows baselines inapplicable). Suite 2186 → **2194/0/5/1**. Carry-forwards intact: O-4, sibling fixtures, MathTS peer docs, BE-25 archive (superseded by v0.8.0 P-4 policy — resolvable any time). Perf-focused sprint carrying v0.7.1's deferred O-1 + O-6 + the v0.7.1-simplify-brainstorm S-9. **Design vetted YELLOW by both Adam (3H/7M/3L at `8f74e95`) + Eve (1H/4M/6L at `c142634`); all HIGH findings closed in design r2 (`9c92d11`).** Plan r1 (`6e57c1b`) operationalizes the design into 15 tasks across 5 phases (+ Phase 0 baseline).
      
      **Sprint goals** (per design r2):
      - **O-6 PG metric** Float64Array migration (Phase 1 pilot — small surface, ~5 callsites).
      - **O-1 Schwarzschild fixture** Float64Array migration (Phase 3 high-volume — ~53 non-comment callsites across ~20 files including 6 hot-path `src/` consumers per Adam A-3).
      - **S-9** lowerNode 5-arm deferred-cluster consolidation via registry dispatch (Phase 4).
      
      **Sprint task queue** (consume design r2 + plan r1 — DO NOT re-design):
      1. **Phase 0** (1 commit, ~30 min): Tasks 0.1-0.6 baseline + per-candidate empirical verification. Re-grep with Adam A-1 revised regex (catches variable-indexed callsites — true count ~109 raw / ~53 non-comment). Re-bench v0.7.1 PO-1 baseline (5% drift gate). Deliverable: `docs/architecture/v0.7.2-baseline.md`.
      2. **Phase 1** (3 commits, ~1-2 hr): PG pilot — `MetricFnFlat` + `MetricFn` union alias; PG fixture BREAKING(public) migration; consumer rewrite + R-1b off-diagonal pin in `tests/numerical/painleve-gullstrand-curvature.test.ts`.
      3. **Phase 2** (2 commits, ~30-45 min): mid-cycle Adam+Eve vet (SERIAL dispatch per Decision #9 — Adam first, Eve on post-Adam HEAD). Reports at `docs/architecture/v0.7.2-phase-1-{adam,eve}-vet.md`.
      4. **Phase 3** (5 commits, ~3-4 hr): Schwarzschild high-volume — fixture migration BREAKING(fixture) + 6-file hot-path `src/` consumer rewrite (gl4-integrator, weyl-lowering, perihelion-finder, killing, null-ic, be37-covariant-eikonal — these BYPASS flattenNA per Adam A-3) + Batch A tests/numerical+dimensional + Batch B tests/fixtures + R-1 / R-1c regression pins.
      5. **Phase 4** (2 commits, ~1 hr): S-9 DEFERRED_EVALUATOR_REGISTRY landing + 5-arm default-arm consolidation + exhaustiveness test per Adam A-8 mitigation against silent prose drift.
      6. **Phase 5** (2 commits, ~1 hr): combined bench gate per Decision #6 3-tier (STRETCH ≥2× / SHIP-WITH-NOTE 1.5-2× / INVESTIGATE 1-1.5× / STOP <1×) + `npm audit` + `npm outdated` pre-flight per CLAUDE.md release discipline + CHANGELOG + todo wrap. Version bump per Decision #2: `v0.7.2` is a placeholder; publishable release MUST be `v0.8.0` minor bump (PG `@public` BREAKING — semver compliance).
      
      **Expected sprint totals**: 15 commits; suite 2103 → 2111 (+8 net new from R-1/R-1b/R-1c/S-9-exhaustiveness pins); net code LOC −45 to −60 from S-9.
      
      **Execution discipline** (per plan §0):
      - Worktree fork-point preamble MANDATORY in every agent brief (Decision #4 + Adam A-13 uncommitted-changes guard).
      - Default dispatch model: **direct execution OR serial subagent** (per Decision #9 + Eve E9 v0.7.1 parallel-agent-friction lesson). Parallel-subagent is the EXCEPTION.
      - Adam+Eve vet pairs always SERIAL (Adam first, commit + push, Eve on post-Adam HEAD).
      - Pre-execution verification gate at every TASK start (re-grep / re-read per the v0.5.0+ pattern).
      - Honest-claude framing: every commit message that deviates from the plan documents the deviation.
      
      **Optional pre-execution gate**: dispatch Adam+Eve plan-vet (serial per Decision #9) before Phase 0. Plan-vet checklist at `docs/planning/v0.7.2-Implementation-Plan.md:872-890`. Not strictly required since design r2 already vetted, but plan-vet catches plan-vs-design drift early.
      
      **Carry-forward to v0.7.3 (explicitly deferred per design r2 §1)**:
      - Sibling fixtures (de-sitter, flrw, minkowski) Float64Array migration (per Decision #8 — MetricFn union accommodates them staying nested-array for now).
      - O-4 `christoffelAt` flat-path migration (per Adam A-10 — touches engine boundary, distinct shape from O-1/O-6).
      - M-13 / M-14 dep-graph generator gap-fill (per Eve E5).
      - BE-25 archive-or-delete catalog-archive-policy decision (per Eve E5).
      - MathTSEngine optional-peer install / CI documentation (P8 AD path's `describe.skipIf(true)` debt from v0.7).
      - Re-export PG in `src/index.ts` or strip `@public` tag (close M-2 deferral, per Adam A-7 out-of-scope recommendation).
      
      **Reference docs** (read these before starting):
      - Design r2: `docs/planning/v0.7.2-Design.md`
      - Plan r1: `docs/planning/v0.7.2-Implementation-Plan.md`
      - Adam design vet: `docs/architecture/archive/v0.7.2-design-adam-vet.md`
      - Eve design vet: `docs/architecture/archive/v0.7.2-design-eve-vet.md`
      - v0.7.1 wrap (what shipped + what was deferred): `CHANGELOG.md` `[Unreleased]` block

- [x] ✅ **v0.7.1 hygiene sprint — Phases 0-6 COMPLETE (O-1 deferred to v0.7.2)** — branch `claude/changelog-todo-sync-9PdMg`, HEAD `84115fa` (pre-tag). Suite **2103 passed / 0 failed / 5 skipped / 1 todo** (+47 net new from 2056 sprint baseline). 26 sprint commits across 6 phases + 1 mid-cycle vet pair. All four mid-cycle Adam+Eve adversarial-review gates passed (design pair pre-sprint, Phase 3 mid-cycle pair — `af8c813` Adam GREEN 0H/0M/2L + `1023210` Eve YELLOW 0H/3M/3L with E1+E2 fixed same-commit; no other vets needed since Phase 4/5/6 changes were behaviour-preserving + bench-only). Phase 1+2 → minimize sweep (M-1 surface restoration + guard test + dep-graph tooling fix; M-3+M-4+M-5 mass-annotation pass); Phase 3 → BE-NN triple-extraction (`_be-helpers.ts` 3 helpers + 43 unit tests; 43 BE modules migrated; rg-flow.ts migrated to `validateComponentDimension`); Phase 4 → validator+lowering coherence (S-5+S-6 dedup; S-13 RiemannChildCallback consolidation; S-14 mergeFreeIndices brainstorm-stale 5×→actual 8× — extracted all 8; Eve E4 prose regression fixed via FieldSpec.description override + 3 new tests); Phase 5 → O-2 Picard ping-pong buffer pre-alloc (bench-measured **1.27× speedup** on solveGL4Stage; below the brainstorm's "2-5×" prediction which assumed paired O-1); Phase 6 → 2 new measure-only bench harnesses (kretschmann-symmetry, painleve-gullstrand-pipeline) + benchmarks.md append. Version bump 0.7.0 → 0.7.1 SKIPPED per user directive (publish still blocked on token rotation). **v0.7.2 sprint queued above carries O-1 + O-6 + S-9 forward; design r2 + plan r1 vetted and ready.**
- [x] ✅ **v0.7-series tag strategy + push** — RESOLVED 2026-05-25. User picked **Option 1 (single v0.7.0 rolling everything)**. Bumped `package.json` 0.6.0 → 0.7.0, committed (`dc800c2`), tagged `v0.7.0`, pushed master + tag, published to npm. v0.6.1 hygiene work folded into v0.7.0 changelog as a subsumed section. See `## Latest shipped` for full disposition.
- [x] ✅ **v0.7 release pre-flight checks** — EXECUTED 2026-05-23 (commit `5cd860a`). All five blocking checks pass: `npm audit` 0 vulnerabilities; `npm outdated` shows 2 deferred majors (typescript 6.x, @types/node 25.x) within-range deps up-to-date; tsc strict clean; suite 1879/0/5/1 (post helper-extraction); `npm run smoke` exits 0. Verdict: READY TO TAG. Full report at `docs/architecture/archive/v0.7-release-preflight-log.md`. Optional `npm run bench:ci` recommended pre-tag for baseline refresh (now feasible via the vitest 4.1.7 reporter fix).
- [x] ✅ **v0.6.1 tag + push** — SUPERSEDED 2026-05-25 by v0.7.0 single-tag ship. v0.6.1 content is in the v0.7.0 changelog as the `## [0.6.1 — subsumed into 0.7.0]` section.
- [x] ✅ **v0.6.0 npm publish — superseded 2026-05-25 by v0.7.0 single-tag ship.** Token rotation (1 of 3 blockers) resolved earlier this session; the remaining two blockers (version mismatch + stale dist/) became moot when the user chose Option 1 (single v0.7.0) — version bumped 0.6.0 → 0.7.0, fresh dist/ built (468 files / 3.1 MB, replacing the 12-file / 67-KB v0.1.0-era stale build), and tag/publish executed against the new label. Registry now at 0.7.0; v0.6.0 was never published independently and is documented as subsumed in `CHANGELOG.md`. Historical detail below for reference.

      Original blocker entry preserved for context:
      **🚧 v0.6.0 npm publish — token rotated 2026-05-25; two additional blockers surfaced.**
      v0.6.0 is code-complete at tag `v0.6.0` (`ac0cf06`): all 36 tasks
      executed, suite 1693 green, build/smoke/audit clean, version bumped,
      tag and `master` pushed. **Token (1 of 3 blockers): RESOLVED 2026-05-25** —
      new Automation token (`npm_`-prefixed, 40 chars) installed via
      `[Environment]::SetEnvironmentVariable('NPM_TOKEN', '<new>', 'User')`;
      `npm whoami` → `danielsimonjr`; `npm token list` shows a single active
      token (id `38b1e9`, created 2026-05-25). **NEW blockers surfaced
      during the rotation session — must resolve before any publish:**
      1. **Version mismatch.** `package.json` is at `0.6.0` but HEAD is
         14 commits past tag `v0.6.0`, carrying the entire v0.7-series
         sprint (commits `552df56` ← `67b37c4` ← ... ← `ac0cf06`).
         Running `npm publish` from `master`/HEAD would ship v0.7-era
         code labeled as `0.6.0` — a semver violation that would also
         confuse `mathts-tensor`/`mathts-autograd` peer consumers.
      2. **`dist/` is wildly stale.** Only 12 files / 67 KB present (just
         `core/types.*` + `index.*` from a v0.1.0-era build). Current
         source has full `bridges/`, `dimensional/`, `numerical/`, `diff/`
         subsystems missing from the build output. The `--ignore-scripts`
         Windows workaround silently bypasses the `prepublishOnly:
         "tsc && vitest run"` hook, so `npm publish` never auto-rebuilds.
      **Two viable paths from here (see this turn's diagnosis):**
      - **(A) Publish v0.6.0 from the tag.** `git worktree add ../upt-v060 v0.6.0`
        → in that worktree: `npm install` + `npm run build` +
        `npm publish --ignore-scripts --access public`. Honors the
        existing tag literally; tag, registry, and published code all
        match. Returns master untouched.
      - **(B) Skip v0.6.0, ship v0.7-series instead.** Resolves todo
        "v0.7-series tag strategy" first — single v0.7.0 vs. split
        v0.7.0/v0.8.0/v0.9.0-alpha. Then bump `package.json`, tag,
        build, publish from that fresh tag. Reaches the latest code on
        npm in one shot.
      Registry currently shows `0.5.1`; no partial-publish state to
      clean up. Whichever path: confirm `npm whoami` still works in the
      publish shell, then `npm view universal-physics-tensor version`
      should report the new version post-publish.
- [x] ✅ **GitHub release notes for v0.6.0 + v0.6.1 + v0.7-series** — EXECUTED 2026-05-25 using the Option 1 body from `docs/architecture/archive/v0.7-release-notes-draft.md` (with suite count refreshed from 2056 → 2103). Release live at <https://github.com/danielsimonjr/universal-physics-tensor/releases/tag/v0.7.0>. Options 2 and 3 from the draft remain as historical reference.

(Completed `[x]` items previously listed here — v0.6.0 doc-integrity
review, BE-33 fix + bridge-physics audit, vendored tooling + C-9 fix,
UPT v0.70 proposals doc, all v0.6.1 sprint phases — are subsumed by
the v0.6.0 and v0.6.1 release entries in "Latest shipped" above and
the corresponding `CHANGELOG.md` `[Unreleased]` block. Removed here
to keep the queue focused on still-open work.)

### v0.7 follow-up execution lessons (carry-forward for v0.8.0+)

- **Verify carry-forward release-note numbers at HEAD before scoping work.** Three audits in the v0.7 follow-up session (PC-1.5, AS-3, BE-module exports triage) all found their carry-forward numbers stale: PC-1.5 Shapiro residual was 4 orders of magnitude better than documented (2.28e-8 vs 2.51e-4); AS-3 site count was 1 order of magnitude smaller (8 vs ~65); BE-module export count was 40% inflated (61 vs ~85). Generalizes the v0.6.1 "verify what tooling actually does" lesson: it also applies to release-note prose and todo-list numeric estimates. **Pattern**: any todo item with a numeric scope estimate, re-run the producing tool/grep at HEAD before treating the number as the work envelope. Stale numbers in carry-forward notes are the default — fresh re-measurement is always cheaper than misallocating session time.

### v0.6.1 execution lessons (carry-forward for v0.7.0+)

- **Verify what tooling flags actually DO, not just that they exist.** Track-C recon for v0.6.1 verified `--include-tests` was wired in the generator's CLI. Adam+Eve verified the flag's existence. But empirically running the generator with the flag showed it triggered a separate test-coverage REPORT and did NOT feed `detectUnused` (test parsing happened after the unused-detection scan). Caught at Phase 0 baseline run, not Adam+Eve review. **Pattern**: for any "this flag/setting/script does X" claim, the design's adversarial review must include a runtime empirical check, not just a code-presence grep.
- **Test-imports count as external in TypeScript ESM.** The v0.6.1 design's original bucket-(a) "internal-only" definition included "symbols used only by tests" — but `tsc` does not treat `tests/` imports as internal. Dropping `export` on a test-imported symbol breaks the build. Adam+Eve S1 caught this with grep-verified file:line evidence. **Pattern**: four buckets, not three. The (a') "test-only importer, keep export + @internal JSDoc" bucket is the correct treatment.
- **The "11 arms follow identical pattern" claim is the v0.5.0 ricci-slot trap re-played.** The v0.6.1 design said 10 validator arms had identical shape; verified at validator.ts:592-740 showed 11 arms across 3 patterns (3 pass riemann-child closure, 3 are scalar/skip-merge, 5 are standard). A boolean `propagateFreeIndices: boolean` flag would have produced the v0.5.0 ricci-slot bug shape — silent miscompute. **Pattern**: registry-driven dispatch contracts must use a discriminated union (`pattern: 'A' | 'B' | 'C'`) so the per-arm callback shape typechecks exhaustively, not a flag-bag.
- **Eve fabrication rate dropped 5/9 → 1/13.** The v0.5.1 retrospective ("always grep-verify Eve's specific-evidence claims") was applied consistently in v0.6.1: every Eve claim with a file:line citation got an immediate `grep -rn` before being accepted as load-bearing. Net result: only 1 fabrication (E-R10 — a speculative claim that `tools/plan-doc-audit/` imports from `src/`, verified false in 5 seconds). The discipline works.
- **Phase 0 baseline capture saved the sprint.** Before any code change, Phase 0 ran `npm test` against `master`-HEAD and found 5 pre-existing test failures (1672/5-failed, not the v0.6.0-tag's 1693/0). Without that capture, the sprint would have shipped on top of broken master, and the "suite stays green" goal would have meant something different (or been silently fudged). **Pattern**: always re-baseline against HEAD at sprint start; never trust the previous-release's CHANGELOG number as the "current" state.

### v0.5.1 execution lessons (carry-forward — still relevant)

- **Audit hypothesis can be empirically wrong.** PC-1's prediction that `c_SI` drift dominates the BE-37 Shapiro residual was REFUTED via Tasks 1+4 measurement. The constants canonicalization was still net-positive hygiene but the residual is integrator-driven. Pattern: every audit prediction with a numerical target should be RED-test-verified before being declared "shipped". Honest negative results are valuable.
- **Eve (OpenAI o3) hallucinated 5/9 audit-vet challenges.** Fabricated `src/core/constants.ts` (didn't exist pre-Phase-1), NYC coverage report (no NYC), BE-60 v0.6.x branch (no such bridge), JIT micro-benchmarks (none), v0.5.0-rc2 (no rc tags). See `feedback_eve_o3_hallucinations.md`. **Always grep-verify Eve's specific-evidence claims.** Use her for severity-recalibration judgment (3/3 correct there) not fact-claim verification.
- **The c²-cancellation noise pattern is the v0.5.1 silent footgun.** It manifested twice: Task 16 (Minkowski curvature tests) had to switch to unitless `c=1` fixture; Task 4 (Schwarzschild fixture migration) had to escalate by migrating 3 consumer test files because the cycloid blew up at relErr 3.4e-6. Anywhere SI metric carries `c²` scale (~6e16 on g_tt), 2nd-order FD propagation is at risk. PD-7's opt-in 4th-order `pderiv` is the v0.5.1 mitigation; future bridges differentiating `c²·g_tt` should use `{ order: 4 }`.
- **Multi-agent file-disjoint parallelism is a real strategy.** Phases ran in parallel-batches (Phase 1 + my Phase-3 doc edits concurrently) with zero merge conflicts because we strictly partitioned file scope. CHANGELOG.md was the single read-modify-write contention point — kept sequential.
- **Adam+Eve MCP availability is fragile.** llm-gemini and llm-openai MCPs disconnected mid-cycle; required `/kill-plugins` + `/reload-plugins` recovery. For v0.6.0+ adversarial vets, consider Opus subagents as a built-in fallback (per Daniel's v0.5.1 directive when MCP was down).

### Notable v0.5.0 execution lessons (load-bearing for v0.6.0+ planning)

- **Two plan-correctness bugs slipped past Adam+Eve adversarial review** and were only caught at TDD-RED:
  1. Schwarzschild Riemann formula: plan template wrote leading-order `2GM/r³`, correct coordinate-basis form is `r_s/(r²(r-r_s))` (off ~33% at r=3·r_s). Caught Task 0. Memory: `feedback_v0_5_0_plan_template_riemann_bug.md`.
  2. Ricci contraction slot: plan + design + S1 correction all wrote `lowerIndices[0]`, correct is `lowerIndices[1]` (Carroll Eq. 3.91). Caught Task 7 via de-Sitter `R=4Λ` failing to vanish. Memory: `feedback_v0_5_0_ricci_contraction_bug.md`.
- **4th-order finite-difference stencils** required for ≤1e-9 Riemann lowering accuracy — the c²·g_tt ~ 6e16 scale causes catastrophic cancellation at 2nd-order. v0.4.0 `pderiv` defaults need scrutiny anywhere SI-c² metrics are differentiated.
- **Curvature-layer pattern** (first-class AST node `{kind, …refs}` + walk-directly lowering; no AST rewrite, no contraction-graph) crystallized across Riemann/Ricci/Einstein/Bianchi. Next curvature-layer addition (Weyl? Bianchi-2nd-form?) is the threshold to extract a shared `CurvatureCompositeNode<K,S>` factory.
- **GL4 + Picard inner solver** is shape-agnostic: null geodesics worked without Picard pathology (Task 12). Mercury matched GR closed-form to 7 sig figs (Task 10). The symplectic Hamiltonian flow does not care whether `g^μν p_μ p_ν` is timelike or null.
- **Cross-bridge `c` constant inconsistency** discovered Task 11: `src/numerical/be37-covariant-eikonal.ts` uses `c = 2.998e8`; `evaluateShapiroDelay` uses exact `299792458`. Dominant ~1.8e-4 BE-37 residual. **v0.5.0+ cleanup item.**

---

## Latest shipped

- **v0.7.3** (2026-05-25) — **SHIPPED TO NPM.** Declaration-only patch release. Added 6 newly-shipped MathTS workspace packages to `optionalDependencies` (`mathts-expression ^0.2.0`, `mathts-matrix ^0.1.3`, `mathts-functions ^0.2.1`, `mathts-parallel ^0.2.0`, `mathts-workerpool ^0.2.0`, `mathts-wasm ^0.1.3`) following today's MathTS monorepo release sweep. **Unblocks P4 Bridge DSL horizon item** (was previously "BLOCKED on mathts-expression peer install"). Aspirational declarations — UPT source doesn't yet consume them, but the declarations signal roadmap intent and let consumers pre-install peer chains for future UPT features. No source change; no test surface change (2126/0/5/1 identical to v0.7.2). Tag `v0.7.3` at commit `4eace8d`. GitHub release: <https://github.com/danielsimonjr/universal-physics-tensor/releases/tag/v0.7.3>.
- **v0.7.2** (2026-05-25) — **SHIPPED TO NPM.** Patch release fixing latent `MathTSEngine` AD-dispatch bugs surfaced by the typed-function EOVERRIDE resolution. Two bug patterns fixed: Pattern A (6 failures, real integration bug in `src/numerical/mathts-engine.ts` add/sub/mul/scale — never dispatched DualTensor/TapedTensor inputs to the autograd peer despite documentation saying it should); Pattern B (2 failures, absence-tests in `mathts-engine-typing.test.ts` that ran when the peer was actually present). Suite: 2103 → **2126 passed (+23 net new AD conformance tests now running)**. Tag `v0.7.2` at commit `1dd372f`. GitHub release: <https://github.com/danielsimonjr/universal-physics-tensor/releases/tag/v0.7.2>. **Partial close of P8 horizon item**: AD conformance suite now runs against MathTSEngine whenever peer is installed. **Lesson captured (v0.8+ execution lesson)**: deferred test enablement via `.skipIf(true)` is silent debt — the gate prevents validation in EVERY environment (local, CI, peer-installed contributor). Right pattern is `describe.skipIf(!peerPresent)`, not `.skipIf(true)`.
- **typed-function EOVERRIDE fix** (2026-05-25, sister repo `~/Dropbox/Github/typed-function` commit `5711dab`) — **SHIPPED**. Resolved upstream blocker preventing UPT's `@danielsimonjr/mathts-*` optional peers from installing. Bumped `@rollup/plugin-terser` ^0.4.4 → ^1.0.0 + `rollup` 4.53.3 → ^4.60.2 to match override intent; pruned redundant override entries; rebuilt `build/` artifacts under new majors. Tests: 1684/0 in typed-function. Pushed to `origin/develop`. The fix propagates to all downstream MathTS consumers globally without requiring republish, since `mathts-core@0.1.2` references typed-function via the GitHub URL (resolves to default-branch HEAD at install time).
- **Sister-repo hygiene sweep** (2026-05-25, post-v0.7.2):
  - **workerpool** (`~/Dropbox/github/workerpool` commit `9faaf33` → `origin/master`): dropped redundant `@rollup/plugin-terser` + `rollup` override entries (direct devDeps already matched at `^1.0.0` / `^4.60.2` per earlier commit `cb20784`). Pattern parity with the typed-function cleanup. No behavior change.
  - **MathTS** (`~/Dropbox/github/Mathts` commit `b9a940d` → `origin/main`): closed MathTS-side TODO #7 — fixed `tensor/tests/contraction-sequence.test.ts:304` 16-tensor DP test that was being killed at vitest's default 5000ms before its `elapsed < 10_000` assertion ran. Added `{ timeout: 15_000 }` as the **2nd argument** to `it()` per Vitest 4's API (the MathTS TODO entry had suggested the trailing-options 3rd-argument form, which was deprecated in Vitest 3 and is a hard error in Vitest 4). Also updated MathTS's TODO.md to flag the API change for future readers — a concrete instance of the "documented fix recipes also decay across major framework versions" pattern (close cousin of the [numeric-claims-decay convention](#numeric-claims-in-todo-entries-decay-faster-than-checkbox-state) added today).
- **v0.7.1** (2026-05-25) — **SHIPPED TO NPM.** Patch release: dev-dep validation under newer toolchain. No source changes. Refreshed installed deps to v0.7.0's declared versions (`@types/node` 25.9.1, `typescript` 6.0.3, `vitest` 4.1.7), rebuilt `dist/` under TS 6.0.3 (v0.7.0's `dist/` was TS-5.9-compiled despite the `^6.0.3` declaration — half-state closed). Full suite re-validated: 2103/0/5/1, no regressions. Tag `v0.7.1` at commit `438db4c`. Tarball: 471 files / 563.9 KB / 2.1 MB unpacked. GitHub release: <https://github.com/danielsimonjr/universal-physics-tensor/releases/tag/v0.7.1>. Known limitation documented: MathTS optional peers can't install due to upstream `typed-function` EOVERRIDE — tracked as a new "fix typed-function" item in the active queue.
- **v0.7.0** (2026-05-25) — **SHIPPED TO NPM.** Single tag rolling everything from v0.5.1 → 0.7.0: v0.6.0 work (never published) + v0.6.1 hygiene sprint (never tagged) + six v0.7-series proposals (P3/P2/P1/P5/P8/P6-A) + v0.7 hygiene follow-up + v0.7.1 hygiene sprint. Registry jumps 0.5.1 → 0.7.0. Tag `v0.7.0` at commit `dc800c2`; preceded by `c8ebdb1` (Windows backslash fix for the v0.7.1 public-surface guard test, caught at release-gate run on Windows). Suite **2103 passed / 0 failed / 5 skipped / 1 todo**, 0 audit findings. npm publish via Automation token (rotated earlier this session — see todo #4 resolution). Tarball: 471 files / 563.9 KB / 2.1 MB unpacked. GitHub release: <https://github.com/danielsimonjr/universal-physics-tensor/releases/tag/v0.7.0>. Tag-strategy decision was Option 1 (single v0.7.0); Options 2/3 from `docs/architecture/archive/v0.7-release-notes-draft.md` remain as historical record.
- **v0.7-series sprint** (2026-05-23, on branch `claude/changelog-todo-sync-9PdMg` — **tag shipped 2026-05-25 as v0.7.0**). **Six v0.7-series proposals shipped in one session**, stacked on the still-untagged v0.6.1 work:
  - **P3** — Typed `Cell` discriminated union (`src/core/cell.ts`): `Cell = LawCell | BridgeCell | EmergenceCell`, `compose(laws, bridges, emergences, config)` factory. 7 public symbols. Per Eve-R2/R3: `CellConfidence` is string-literal union; legacy `PhysicalLaw.confidence: number` stays autonomous. `UniversalTensor.addCell(cell)` exhaustive dispatch.
  - **P2** — Sparse semantic catalog + flux rules (`src/core/flux-rules.ts`, `src/bridges/catalog-adapter.ts`): 3-rule registry with `_exhaustive: never` dispatch (Rule 1 = dimensional-consistency from catalog adapter per Decision #3 resolving Adam-V3; Rule 2 = L/B/E coordinate matching ERROR-tier; Rule 3 = causality WARNING-tier). `UniversalTensor` gets 4 new methods: `populatedCount`, `populatedCells`, `unpopulatedNeighborhoods`, `fluxDiagnostics`. `catalogToCells` / `scanCatalog` / `ingestCatalog` two-pass adapter per Decision #11. **Empirical (Eve-R1 lesson held)**: live BRIDGE_EQUATIONS catalog passes Rule 1 with 0 errors; 5 submittable + 37 unsubmitted (per strict `PhysicalScale` mapping; freeform `microscale`/`information`/`Newtonian gravity`/etc. labels filtered). 10 public symbols. **Redrafted once** after first Adam+Eve pass caught 3 SHOWSTOPPER issues (Adam-V2 compile-blocking, Eve-R1 empirical, Eve-R7 storage-design); redraft Adam+Eve = 0 HIGH READY.
  - **P1** — Intelligent Index layer (`src/core/universal-index.ts`, `axes-registry.ts`, `labeled-tensor.ts`): `UniversalIndex<Axis>` + branded `UniversalIndexId` (UUID); `Axes` module-singleton with 18 frozen references (4 scales + 5 forces + 5 symmetries + 4 info measures); `LabeledTensor<L>` wrapper composing `EngineTensor + TensorEngine + labels`; `contract(other)` matches by `UniversalIndexId` equality (Decision #3). 4 error classes. BE-52 single-bridge demo at `src/bridges/perihelion-precession-labeled.ts` (Cross-Phase Invariant 4 verified preserved: zero edits to `TensorSymbolNode` / `computeContraction` / `src/bridges/equations/`). 12 public symbols.
  - **P5** (ahead of v0.8 target) — `RegimeType` extension system (`src/core/regime-registry.ts`, `regimes-builtins.ts`, `regime-rule-install.ts`): `defineRegime` + 6 per-axis convenience APIs + lookup helpers + 18 v0.6 built-ins pre-registered. Sibling-registry pattern for `attachRegimesToCell` (per Adam-M1: avoids breaking P3 surface + adapter round-trip). `FluxRuleKind` extended with `'regime-consistency'` (per Eve-M2 union extension); rule body installed via registered-callable pattern (avoids circular import). `RegimeCollisionError` with idempotent re-registration. 16 public symbols.
  - **P8** (ahead of v0.9 target) — Bridge Parameter AD (`src/diff/bridge-gradient.ts`, `bridge-specs.ts`): `bridgeGradient(spec, engine, params)` async wrapper over `MathTSEngine.reverseGrad`; 4 differentiable bridge specs (BE-11, BE-37, BE-42, BE-52) using verified struct-arg signatures (per Eve M1-M3 reconciliation). `gradientToNamed` unpack helper. Graceful degradation via `EngineCapabilityError`. **Honest scope** (per Adam-H1): `node_modules/@danielsimonjr/` empty in sandboxed dev env (`npm install --include=optional` was no-op against registry-less env); real-AD tests `describe.skipIf(true)`-marked, run on consumer envs with peer installed. `Float64ReferenceEngine` AD-tracing limitation documented (dual-numbers can't trace plain-JS bridge math). 7 public symbols.
  - **P6 Phase A** (research-track, docs-only per Adam-F2) — Bridge Composition spec at `docs/specification/Part-IX-Composition.md` (avoiding Part-VII collision per Eve-E2). Defines composition as numerical-cascade primary + categorical secondary (Decision #1). Names C1-C5 calibration set for Phase B (BE-IDs verified). Open-Questions doc with 5 questions for Phase B (Q1 surface, Q2 tolerance, Q3 flux interaction, Q4 identity, Q5 v1.0 escalation). Adam+Eve review-findings doc. Phase A optional `src/composition/` prototype DEFERRED — existing bridge evaluators have ad-hoc TS return shapes with no shared `Observable` contract; translation-layer design IS Phase B's deliverable.
  - **Session totals**: 1675 → **1853 passed (+178 net new tests)**, 0 failed, 2 skipped (P8 real-AD), 1 todo. 11 new test files, 10 new source files, 9 new docs. Public surface: +44 symbols. 6 Adam+Eve adversarial-review cycles (1 redraft on P2). Opus-subagent stand-ins per session pragma (Gemini/OpenAI MCP tools unavailable). HEAD `9fa940f`.
  - **Tag strategy (user's call)** — three options laid out in `CHANGELOG.md`:
    1. Single v0.7.0 (everything in one release).
    2. Split v0.7.0 (P3+P2+P1) / v0.8.0 (P5 + P6 Phase A) / v0.9.0-alpha (P8, alpha while autograd-peer CI install is documented).
    3. Some other partitioning.
- **v0.6.1** (2026-05-23, on branch `claude/changelog-todo-sync-9PdMg` — tag PENDING) — Minimize / Simplify / Optimize sprint. Six phases (0→3→1→2→5→4 explicit order per Adam+Eve adversarial-review fix). 21 commits. Suite: **1675 passed / 0 failed / 1 skipped / 1 todo** (recovered from a 1672/5-failed master state via Phase 0 cleanup). Highlights: **24 internal-only exports dropped** (bucket-(a)) + **6 `@public` JSDoc tags added** (bucket-(b')) per the v0.6.1-baseline.md per-symbol classification; **`validator.ts` 816→715 LOC** (-101) via new `validator-registry.ts` 3-pattern discriminated-union dispatch; **`lowering.ts` 1015→903 LOC** (-112) via `lowerBianchiResidual` + `lowerWeylTensor` extraction into `curvature-lowering-helpers.ts`; **dep-graph generator** now consumes test imports + parses `package.json exports` field (unused-files 44→2, both intentional ambient .d.ts); **three bench harnesses landed** (PO-1 gl4-picard-alloc, PO-2 ricci-lowering, PD-grid pderiv — carry-forward from v0.5.1's deferred Phase 7); **five pre-existing test failures fixed** (mathts-engine test-file gating × 2, stale 0.5.x version regex, BE-33 formula-latex assertion, missing spec-date marker) + lockfile resync. Adam+Eve adversarial review (Opus subagent fallback per v0.5.1 carry-forward — no llm-gemini/llm-openai MCPs in remote-execution env) caught 3 critical issues before plan-drafting (S1 test-importer misclassification, S2 validator-registry 3-pattern not 2, S3 dep-graph generator semantics). Eve fabrication rate 1/13 (vs v0.5.1's 5/9 baseline). New `mathts-tensor.ambient.d.ts` mirrors v0.5.1 TS-4 precedent for autograd. `npm publish` still blocked on expired `NPM_TOKEN` (carried from v0.6.0). Detail: `docs/planning/v0.6.1-Design.md`, `docs/planning/v0.6.1-Review-Findings.md`, `docs/architecture/archive/v0.6.1-baseline.md`.
- **v0.6.0** (2026-05-20) — Einstein field equation closure + curvature classification + Shapiro investigation. 36 tasks across 4 phases. Killing-vector conserved-charge machinery (`KillingVectorNode`, `ConservedChargeNode`, `verifyKillingEquation`); Einstein field equation now structurally encodable (`StressEnergyTensorNode`, `CosmologicalConstantNode`, `EinsteinFieldEquationNode`) — closes BE-17's "cannot be encoded" docstring gap; Weyl tensor + Kretschmann scalar completing the curvature-classification surface; `CurvatureCompositeNode<K,S>` factory (PD-6 trigger fired on Weyl as 5th curvature primitive). BREAKING: `christoffelFn` returns `Float64Array(64)` (BR-2, 5-6× RK4 speedup); `pderivNumericalFn` default order flipped 2→4 (FD-flip). **PC-1.5 finding**: integrator cleared as Shapiro residual suspect via bit-exact Killing-charge conservation; remaining suspects are null-IC noise + affine-parameter mismatch (documented, deferred per Decision #8). Suite 1693 passed, 179 files. Tag `v0.6.0` at commit `ac0cf06`; `master` since advanced with post-ship maintenance (HEAD `b814a71` at last todo update). **npm publish PENDING — blocked on expired `NPM_TOKEN` (see Active queue); registry still at `0.5.1` until the token is rotated.** **Post-ship maintenance (2026-05-20):** documentation-integrity review (8-batch opus+sonnet team, RLM + honest-claude skills, 63 findings) + 4-phase doc refresh — README was 6 releases stale, 5 architecture docs 2 releases stale, spec catalog count 40→42, all sub-READMEs refreshed; master report `docs/architecture/archive/v0.6.0-doc-integrity-review.md`. Separately, BE-33 Hertz-Millis finite-T exponent corrected `-ν/z → -1/z` + 42-bridge Adam+Eve physics-correctness audit landed (`docs/architecture/archive/BRIDGE-PHYSICS-AUDIT.md`).
- **v0.5.1** (2026-05-19) — Stability/hygiene patch on v0.5.0 GR foundations. 22 task commits across 8 phases. Constants canonicalization (new `src/core/constants.ts` flat exports); diagnostic propagation (`scanForMetricPair` walks v0.5.0 curvature kinds); type-safety hardening (bianchiResidual 6× `any` → `import type`); test-coverage backfill (connection-validators ~250 LOC, fresh-label, flat-Minkowski curvature zero-tests, real Mercury N-orbit Picard); algorithmic dedup (contractRiemannJS, makeSchwarzschildContext); `pderiv.ts` opt-in 4th-order; 5 LC doc-vs-code skews; 7 zombie `it.todo` retired. **Honest framing: PC-1 hypothesis REFUTED** — BE-37 Shapiro residual stayed at 2.51e-4 after constants migration (not <1e-5 as audit predicted); root cause is integrator-driven (see `docs/planning/v0.6.0-Brainstorm.md` "PC-1.5 investigation"). Suite 1595/1597. npm: `universal-physics-tensor@0.5.1`. Tag `v0.5.1`, HEAD `bd98028`.
- **v0.5.0** (2026-05-18) — GR foundations. 25 tasks across 4 phases. GL4 symplectic integrator on canonical (x, p) state (Picard inner solver), bisection perihelion finder, curvature layer (RiemannTensorNode AST + ricci/einstein/bianchiResidual helpers). Both v0.4.0 `it.skip` debts cleared: BE-52 Mercury Δφ to relErr 1.77e-7 (10⁴× tighter than I6 target); BE-37 Shapiro to relErr 1.76e-4. Bridge validation sweep: BE-51/52 structural siblings + BE-17/20/45/46/50 physics anchors + 42-bridge catalog integrity test. Suite 1,554/1,563. npm: `universal-physics-tensor@0.5.0`. Tag `v0.5.0`, HEAD `e2c84b2`.

(Older releases — v0.4.6 and earlier — rolled off into `CHANGELOG.md` for historical record.)

---

## Deferred from prior releases

### From v0.4.0
- [x] ✅ **BE-52 Mercury perihelion geodesic cross-validation** — shipped Task 10 of v0.5.0. relErr 1.77e-7 (10⁴× tighter than ±2×10⁻³ target).
- [x] ✅ **BE-37 full Shapiro cross-check** via geodesic integration — shipped Tasks 11+12 of v0.5.0. relErr 1.76e-4.

### From v0.4.5
- [x] ✅ **Vitest 4.1.4 async-bench reporter limitation** — CLOSED 2026-05-23 (v0.7 follow-up). Bumped vitest 4.1.4 → 4.1.7 (commit `28f6f8b`). Re-running `bench/be37-eikonal.bench.ts` (the original v0.4.5 reporter-limitation case) at 4.1.7 confirms async benches now report the full per-bench hz table (e.g., `evaluateBE37EikonalNumerical 4,258.52 hz` with p75/p99/p995/p999 distribution; covariant-eikonal `2.18 hz`). The "watch for 4.2+" note resolved at 4.1.x patch. **Fourth stale carry-forward in this session** (after PC-1.5, AS-3, BE-module exports).

### From v0.4.6
- (None — all 32 audit findings landed)

### From v0.5.0
- [x] ✅ **`c` constant canonicalization** — shipped v0.5.1 Theme A (Tasks 0-4). New `src/core/constants.ts`. **BUT PC-1 hypothesis REFUTED**: BE-37 Shapiro residual still 2.51e-4 (not <1e-5 as predicted). Real cause is integrator-driven — see `docs/planning/v0.6.0-Brainstorm.md` "PC-1.5 investigation".
- [x] ✅ **`schwarzschildRiemannFn` fixture is COMPLETE** — CLOSED 2026-05-25 via post-v0.7.0 audit (HonestClaude + RLM verification pass). Original todo claim "8 of 256 entries populated" was stale by an OOM (v0.5.0-era count). Current state per `tests/fixtures/schwarzschild.ts:297` docstring: **12 independent physical values × 2 (antisymmetric partner) = 24 non-zero entries** — the mathematically complete set for Schwarzschild coordinate-basis mixed-index Riemann, with Carroll *Spacetime and Geometry* App. B + Hartle *Gravity* Ch. 9 textbook citations confirming canonicity. No additional consumer needs identified.
- [x] ✅ **Plan/design Ricci-slot bug** — annotated v0.5.0-Implementation-Plan.md with post-S1 addendum in v0.5.1 (Task PD-3/LC-2).
- [x] ✅ **GL4_LONG=1 Mercury 100-orbit Picard-convergence test** — wired in v0.5.1 Task 17 (PD-4). `solveGL4Stage` has iteration counter; gated test asserts `failureFraction < 0.001`. Default 20-orbit (~6 min); `GL4_LONG_ORBITS=100 GL4_LONG=1` for release-prep.

### From v0.5.1
- [x] ✅ **PC-1.5 investigation** — CLOSED 2026-05-23 (v0.7 session). Step-count sweep (2048/4096/8192) shows BE-37 Shapiro relErr at **~2.3e-8** — 4 orders of magnitude tighter than the carried-forward 2.51e-4 number. Non-monotone in step count → FP arithmetic floor, not integrator truncation. Improvement was a side effect of v0.6.0's BR-2 christoffelFn → Float64Array(64) migration (`5c786cc`) that was never re-measured end-to-end at the time. Findings doc: `docs/architecture/archive/v0.7-pc15-shapiro-floor.md`. Smoke gate at `tests/numerical/be37-shapiro-step-sweep.test.ts` asserts relErr stays in `[1e-10, 1e-6]` band; long-run sweep gated behind `GL4_LONG=1`.
- [x] ✅ **BR-2 carry-forward**: `christoffelFn` nested-array → `Float64Array(64)` flat — shipped v0.6.0 Phase 2 (BREAKING, 5-6× RK4 speedup). Carry-forward closed.
- [x] ✅ **AS-3 `schwarzschildPin` helper** — AUDITED 2026-05-23 (v0.7 follow-up), closed WON'T-DO. The v0.5.1 estimate ("~65 invocation sites") was stale by an order of magnitude. Actual count via `grep -rnE "Fn\(M[a-zA-Z0-9_]*\)\(\[" tests/` is **8 sites** total. At that count the inline `schwarzschildFn(M)([0, r, PI_2, 0])` pattern is clearer than a `schwarzschildPin(M, r).dgInverse` abstraction; helper is overkill. Stale-claim audit: another instance of the pattern PC-1.5 surfaced (carry-forward numbers re-verify at HEAD).
- [x] ✅ **Bench harnesses (PO-1, PO-2, PD-grid)** — shipped v0.6.1 Phase 5 (2026-05-23, commit `48a7bb1`). All three files landed: `bench/gl4-picard-alloc.bench.ts`, `bench/ricci-lowering.bench.ts`, `bench/pderiv-grid.bench.ts`. Per Decision #5 of the v0.6.1 design, informational-only (no threshold gates) — baselines in `docs/architecture/benchmarks.md` v0.6.1 section. Findings: Ricci contraction is essentially free vs FD-Riemann (1.01× ratio); order=4 pderiv is 2.41× slower than order=2 (acceptable tradeoff for ~10⁴× truncation reduction).

### From v0.6.0
- [x] ✅ **PC-1.5 follow-up** — CLOSED 2026-05-23 (v0.7 session). See v0.5.1-deferred entry above + `docs/architecture/archive/v0.7-pc15-shapiro-floor.md`. The v0.6.0 BR-2 christoffelFn refactor silently resolved the residual; HEAD measurement shows ~2.3e-8 relErr (FP floor), not 2.51e-4. Decision #8's "measure-and-document, not measure-and-fix" held — measurement was the entire work; no code path modified.
- [x] ✅ **Near-horizon Kretschmann** — CLOSED 2026-05-23 (v0.7 follow-up). Painlevé-Gullstrand implementation shipped: `src/numerical/painleve-gullstrand-metric.ts` (closed-form PG metric + inverse; ~120 LOC). The architectural question dissolved during implementation — `computeKretschmann` is already coordinate-agnostic (takes raw arrays); the existing FD pipeline (christoffelAt + dGammaAt + buildRiemann from curvature-lowering-helpers.ts) assembles Riemann from any metric fn supplied. PG is the only new code at the engine level. Single test file (`tests/numerical/painleve-gullstrand-curvature.test.ts`, 9 tests across 2 describe blocks) covers far-field/mid-range/near-horizon/AT-horizon/inside-horizon Kretschmann + metric-inverse identity + asymptotic flatness. Original design-note scope (~600 LOC across 4 files) over-estimated; actual ~300 LOC. Per the v0.7 stale-carry-forward pattern, even the design-note estimates need rechecking.
- [x] ✅ **`TensorEquationNode<LHS,RHS>` Phase 0 + Phase 1** — Phase 0 SHIPPED 2026-05-23 (commit `5cd860a`, helper extraction + 25 unit tests). Phase 1 SHIPPED 2026-05-23 (this round): `KleinGordonEquationNode` for `(□+m²)φ = J` as the first new field-equation demonstrator. Uses all 3 field-equation-helpers per the design pattern; validator body is THIN (~30-40 LOC) vs the ~80 LOC of pre-extraction `validateEinsteinFieldEquation`. 9 KG tests + the existing EFE tests both stay green (error-keyword vocabulary `"index label"` / `"dimension"` / `"symmetry"` pinned across the helper extraction). Suite 1888 → 1897 (+9).
- [x] ✅ **Kretschmann O(4⁸) symmetry optimization** (P-6) — **SUPERSEDED /
      WON'T-DO (2026-06-16).** The factored-raising optimization already shipped
      (O-4, ~70× contraction / 29.8× pipeline) and the pipeline is now
      FD-dominated, so further optimizing the contraction targets a non-bottleneck.
      More importantly, the symmetry-pair reduction was EXPLICITLY REJECTED for
      correctness in `kretschmann.ts` (the 6×6 pair formula is NOT identical to
      the full sum for the FD-built Riemann, which has small antisymmetry
      violations). Implementing it would trade correctness-on-real-inputs for a
      speedup of a non-bottleneck. No code change; disposition recorded.
- [x] ✅ **Catalog extension — BE-53 + BE-54** (2026-05-24, parallel-agent dispatch sibling to the BE-X re-encoding sprint):
  - **BE-53 Yang-Mills one-loop β-function** (sonnet, commits `bedd385` + `acae340`): structural dual of BE-39's NGFP via the same `BetaFunctionNode` primitive (asymptotic-freedom UV-FP at g*=0). QCD value b₀=7 pinned; pure SU(3) b₀=11; asymptotic-freedom boundary at N_f≈16.5 (SU(3)). Status: `'established'` (Nobel 2004). +32 tests.
  - **BE-54 Randall-Sundrum brane cosmology** (sonnet, commits `0ef5253` + `c400185` + my follow-up `b8153f6`): exercises BE-19's `FriedmannEquationNode` `'brane'` variant slot. Brane-tension correction `(1+ρ/(2σ))` is dimensionless; correction=3/2 at ρ=σ; H²≥0 always. Status: `'speculative'` (real framework, experimentally unconstrained). +32 tests (incl. 7 from the structural follow-up I added when the agent's worktree was too stale to see `friedmann-equation.ts`).
  - 5 catalog-length-pin conflicts resolved cleanly during cherry-pick (BE-53 worktree forked from `ccda66a`, BE-54 from `fb7ff8b`; both bumped 42 → 43 from their fork-points; resolved manually to 44).
  - Suite: 2017 → 2056 (+39). Catalog now **44 entries** (40 original + BE-51/52/53/54 post-spec extensions).
  - Pattern observation: agent worktree fork-points vary by launch time. Pre-flight `git merge-base` check helps surface but doesn't fix the issue; the harness creates worktrees from a non-current point. **Recommended for next parallel dispatch**: have agents do `git pull origin claude/changelog-todo-sync-9PdMg` + `git rebase` as the FIRST step if their worktree HEAD doesn't match `origin/...HEAD`.
- [x] ✅ **Bridges assessed but NOT re-encoded in v0.6.0 — ALL 4 SHIPPED 2026-05-24** via parallel-agent dispatch (2× sonnet, 2× opus, isolated worktrees). Per `docs/architecture/archive/v0.7-be-x-reencoding-design-note.md`. Each agent ran independently; cherry-picked back onto the main branch with zero conflicts. Per-bridge results:
  - **BE-13 Einstein-trace** (sonnet, commits `55a59af` + `f57fad5`): `TensorTraceNode` + `TracableTensorNode` structural-interface input (mirrors Klein-Gordon's ScalarFieldNode pattern); `BE13_T_TRACE_NODE` additive-new-export. +20 tests.
  - **BE-19 quantum-bounce** (opus, commits `5ebffa8` + `af27132`): `FriedmannEquationNode` with 5-variant discriminator (`classical | lqc | brane | dgp | massive`); `BE19_LQC_FRIEDMANN_STRUCTURAL` additive-new-export. +23 tests. Recommends Randall-Sundrum brane cosmology as next variant exerciser.
  - **BE-39 asymptotic-safety** (opus, commits `76afe1e` + `5e7e812`): `BetaFunctionNode` + `RGCouplingNode`; `BE39_BETA_G_STRUCTURAL` + `BE39_BETA_LAMBDA_STRUCTURAL` additive-new-exports. +28 tests. **Honest deviation**: agent's worktree forked from pre-v0.7 baseline (b67481b); improvised against `einstein-equation.ts` instead of `field-equation-helpers.ts`. Functional output correct; future cleanup migrates to helpers pattern. Recommends BE-26 Yang-Mills β-function as next RG entry.
  - **BE-50 Wheeler-Feynman** (sonnet, commits `3860d7b` + `e8d3df0`): `GaugeFieldNode` + `TimeSymmetryPredicateNode` with `arrowOfTime` discriminator; `BE50_TIME_SYMMETRY_PREDICATE_STRUCTURAL` additive-new-export. +24 tests.
  All used additive-new-export strategy — legacy AST exports unchanged; legacy tests untouched. Net suite: 1897 → 1992 (+95). Lessons-log entry: verify `git merge-base` of worktree branches BEFORE agent starts (BE-39 surfaced this — its worktree forked from master not the working branch).
- [x] ✅ **Dev-dep updates — VALIDATED + SHIPPED as v0.7.1** (2026-05-25). `npm install --include=optional` refreshed `@types/node` 24.12.2 → 25.9.1, `typescript` 5.9.3 → 6.0.3, `vitest` 4.1.4 → 4.1.7. Full suite re-validated under the new toolchain (2103/0/5/1 — no regressions). `dist/` rebuilt with TS 6.0.3 (v0.7.0's dist/ was TS-5.9-compiled despite the `^6.0.3` declaration). Tag `v0.7.1` at `438db4c`; npm registry now at 0.7.1; GitHub release at <https://github.com/danielsimonjr/universal-physics-tensor/releases/tag/v0.7.1>.
- [x] ✅ **Fix `typed-function` EOVERRIDE blocker** — CLOSED 2026-05-25 (typed-function commit `5711dab` pushed to origin/develop; surfaced and fixed during v0.7.1 dev-dep validation). MathTS optional-peer chain now installs cleanly in UPT. Surfaced latent MathTSEngine integration bugs that v0.7.2 then fixed — see `## Latest shipped` for full disposition.

### From v0.6.1 (2026-05-23)
- [x] ✅ **`it.todo` cleanup pass** — AUDITED 2026-05-23 (v0.7 follow-up). 11 references checked: **4 real skip/todo lines, all intentional and documented** (3 × `describe.skip` for optional-dep absent in mathts-engine-typing / engine-conformance × 2; 1 × `it.todo` in catalog-integrity.test.ts:137 pinning the BE-42 "N/A as currently encoded" placeholder). **7 comment-references, all useful historical narrative** (gl4-integrator GL4_LONG gating note; the new be37-shapiro-step-sweep gate; covariant-eikonal-real test geometry-deviation rationale citing Task 11 history; perihelion-precession v0.4.0 reactivation note; tensor-spec-vs-impl drift-guard pattern docs; tensor-symbol v0.5.1 PD-9 cleanup banner; covariant-derivative-preview v0.3.5 reactivation note). No zombie `it.todo()` calls found; no code changes needed.
- [x] ✅ **Newly-surfaced BE-module internal exports** — TRIAGED 2026-05-23 (v0.7 follow-up). Re-running `npm run docs:deps` at HEAD found **61 unused BE-module exports** (not the v0.6.1 estimate of "~85" — 40% inflation, same stale-carry-forward pattern as PC-1.5 and AS-3). Applied bucket-(a) drops to **20 confirmed-no-external-consumer constants/functions** across 14 files (11× `*_LHS` AST builders, 2× `*_FIELD`, 1× `*_CONSTANT`, 1× `*_DIM`, 1× `BE37_TWO`, 3× `validate*Dimensions`, 1× extra `*_LHS`). The remaining **44 `*Inputs` interfaces** are bucket-(a') deferred to a future `@internal`-tag annotation pass (rationale: future-promotion path, test ergonomics, naming-discriminator signal — see audit doc). Build clean, suite unchanged. Audit doc: `docs/architecture/archive/v0.7-be-module-exports-audit.md`.
- [x] ✅ **`lowering.ts` LOC target** — CLOSED 2026-05-23 (v0.7 follow-up, commit `1ce7dc3`). Extracted `tensor-partial-derivative` + `covariant-derivative` arms (~298 LOC) into new `src/numerical/derivative-lowering.ts` (341 LOC) + `src/numerical/lowering-utils.ts` (72 LOC). Track-B's medium-risk forward-import concern resolved via thunk pattern (`recur: LowerNodeRecur` parameter). `lowering.ts` 903 → 597 LOC (beat the ≤890 target by 293). Suite + build unchanged.

### From v0.6.0 doc-integrity review (2026-05-20)
- [x] ✅ **C-9 dep-graph generator bug** — FIXED 2026-05-20. The `create-dependency-graph` tool was vendored into `tools/create-dependency-graph/` (from the `memoryjs` sister repo); the comment-as-symbol leak (source-comment text in multi-line `export {…} from` blocks bleeding into re-export symbol rows) was fixed in-tree via `stripBraceBlockComments`/`splitBraceSymbols`. `DEPENDENCY_GRAPH.md` regenerated clean — the stale "C-9 unfixed" banner is gone. Run `npm run docs:deps` to regenerate.
- [ ] **BRIDGE-PHYSICS-AUDIT.md per-bridge follow-ups** — the 42-bridge Adam+Eve physics audit flagged ~19 contested framings + several questionable `dimensional_signature` tags. **v0.7 follow-up FULL DISPOSITION (2026-05-23 + 2026-05-24)**:
      - ✅ Audit §1 `encoded_form` field added to BridgeEquationEntry + applied to BE-13/47/48 (commit `3ad5404`).
      - ✅ Audit §3 unknown↔unknown bridge naming applied (commit `e9e870c`): 17 renamed + 9 NOT-A-BRIDGE classified per the user-approved proposals doc.
      - ✅ Audit §5 status recalibration applied (commit `9d2c20c`): 1 status flip (BE-14 demoted) + 3 audit-considered notes footnotes (BE-16/29/40) + 1 deferral (BE-34 coupled to Boltzmann dispute).
      - ✅ Audit §4 BE-34 Boltzmann factor: notes-only audit-followup documenting the non-canonical extension (commit `e9e870c`).
      - ✅ BE-33 (`−ν/z` → `−1/z`) literature check: discovered already-corrected on 2026-05-20 (7th stale carry-forward).
      - ✅ **BRIDGE-PHYSICS-AUDIT v2 shipped 2026-05-24** (`docs/architecture/BRIDGE-PHYSICS-AUDIT-v2.md`, commits `77cd02e` Adam + Eve append): parallel Adam+Eve opus reviewers against the post-v0.7 catalog state (now 44 bridges with BE-53/54 extensions). 5 actionable findings from Adam + 13 gap findings from Eve. Highest-priority v2 findings closed in same commit cycle:
        - ✅ **Eve-E1** (silent test-coverage gap — `EXPECTED_DIMENSION_BY_BRIDGE` didn't register BE-53/54; verification test still pinned `.toBe(40)` and iterated ids 11-50 only) FIXED commit `e2ae944` — added [53, DIMENSIONLESS] + [54, T_INV2]; test now expects 42 with extended id range.
        - ✅ **Eve-E13** (pre-tag stale pins — `1854` references in pre-tag-flow docs while HEAD is 2056) FIXED commit `e2ae944` — refreshed `v0.7-release-preflight-log.md` + `v0.7-release-notes-draft.md` to HEAD counts.
      - ✅ **Adam-MEDIUM `encoded_form` mass-population** SHIPPED 2026-05-24 (commit `6fcf9fd`): applied to 12 of the 13 candidates (BE-17/18/20/21/27/29/32/35/36/44/46/50). BE-42 explicitly skipped (its AST encodes T_H scalar directly with no reduction; its NOT-A-BRIDGE reclassification is a separate Adam-HIGH finding still deferred). Catalog now has 15 of 44 entries with `encoded_form` set (BE-13/47/48 from prior + 12 new).
      - ⏸ **Deferred to user physics-judgment session (v0.8)**:
        - Adam-HIGH BE-42 Hawking T NOT-A-BRIDGE reversal: Adam argues it's the archetypal quantum↔gravity bridge (contains ℏ + G); Adam himself flagged for Eve-perspective second opinion before applying.
        - Adam-MEDIUM BE-29 Jarzynski NOT-A-BRIDGE reconsider: similar single-reviewer concern as BE-42.
        - Eve-E8 marginal BE-22/31 rename review.
        - ✅ Eve-E10 BE-54 arXiv refs CLOSED 2026-05-25 (commit `014fe03`). User-confirmed via PDF (sandbox blocks arxiv.org outbound): the citation paired `arXiv:hep-ph/9905221` (RS-I "A Large Mass Hierarchy…" PRL 83:3370) with PRL 83:4690 (which is actually RS-II "An Alternative to Compactification", `arXiv:hep-th/9906064`). BE-54 encodes the RS-II single-brane model per docstring line 11 — fixed arXiv ID + added title. Other two refs (BDEL `hep-th/9910219`; Maartens-Koyama review `1004.3962`) unverified but format-plausible.
        - Eve-E2-E6 stale carry-forward in 4 historical docs (be-module-exports-audit, etc. — historical records, low-priority refresh).
        - Eve-E9 consolidate stale-carry-forward retrospective into one v0.8 doc.

---

## Conventions

### Swarm/dev-workflow stage mapping (codified 2026-06-11, after the v0.11 sprint review)

The dev-workflow stages run at the ORCHESTRATION level; dispatched
subagents execute stages within it, never the whole loop:

- **Lead (orchestrator) owns:** design docs, plan docs, pre-registrations,
  Phase-0 baselines, vet dispatch, ALL commits/pushes (single-writer),
  shared wrap artifacts (CHANGELOG/todo/public surface/snapshots), and
  cross-agent file-scope partitioning.
- **Implementation agents carry, baked into every brief:** pre-execution
  verification gates (read the real source FIRST; never fabricate —
  e.g. the BE-23 agent refusing to encode an unverifiable data table),
  TDD with scoped tests, honest-deviation reporting, no-commit, explicit
  file-scope boundaries, "ignore parallel-work errors not in your files".
- **Review agents (Adam/Eve) are always INDEPENDENT of the authoring
  agent** — self-vet is worthless. Adam = design/plan adversarial vet
  (pre-implementation); Eve = empirical value-level verification
  (post-implementation).
- **STANDING RULE (the v0.11 lesson): every swarm sprint ends with an
  Eve post-implementation verification BEFORE the wrap commit — not
  on-request.** In the v0.11 open-items sprint, Eve ran only when the
  user asked; she then found 3 value-blind test pins, a propagated
  count error (41 vs 42 edges), and 2 doc drifts that all gates had
  passed. Gates check consistency; only adversarial recomputation
  checks truth.
- Agent reports are inputs, not records: claims get spot-verified by
  the lead before commit (precedent: the "already migrated by a prior
  session" misreport; the 16+26 arithmetic).
- **STANDING RULE (the second v0.11 lesson): every sprint ends with the
  stale-docs gate BEFORE the final changelog/wrap commit — not
  on-request.** The gate is a user-added dev-workflow stage and it was
  skipped in the v0.11 open-items sprint (last run at the v0.10.0 wrap):
  README counts/roadmap, CONTRIBUTING review tasks, CLAUDE.md release
  state, the 5 living architecture docs
  (ARCHITECTURE/OVERVIEW/COMPONENTS/API/DATAFLOW), research-note
  cross-references, and `npm run docs:deps` all drifted at once.
  Checklist: grep the docs for counts/version claims touched by the
  sprint, refresh the living arch docs, regen the dep graph, then wrap.


### Repo state
- **UPT repo**: `~/Dropbox/Github/universal-physics-tensor`, branch `master` (NOT `main`). Direct-push workflow, no PR flow.
- **MathTS sister repo**: `~/Dropbox/Github/Mathts`, branch `main`. Houses `@danielsimonjr/mathts-tensor` and `@danielsimonjr/mathts-autograd`. Both published to npm.
- **npm publish on Windows**: use `npm publish --ignore-scripts --access public` to bypass the slow `prepublishOnly` hook (vitest startup on Windows ~3-5 min; the suite is verified at every task commit, so re-running it at publish time is redundant).
- **NPM_TOKEN**: stored at Windows User-level env var. `~/.npmrc` and `~/Dropbox/Github/Mathts/.npmrc` use `${NPM_TOKEN}` interpolation. Token rotation: regenerate at https://www.npmjs.com/settings/danielsimonjr/tokens, then `[Environment]::SetEnvironmentVariable('NPM_TOKEN', '<new>', 'User')`.

### Plan + audit doc locations
- `docs/planning/v0.X.Y-Design.md` — design (per brainstorming skill)
- `docs/planning/v0.X.Y-Implementation-Plan.md` — implementation plan (per writing-plans skill)
- `docs/planning/v0.X.Y-Review-Findings.md` — Adam+Eve adversarial review findings
- `docs/architecture/` — auto-generated dependency graph + hand-written architecture docs + per-release audit reports (e.g., `v0.4.6-minimize-targets.md`, `bridge-coverage-audit.md`)

### Reasoning tier
- For UPT specifically, **Adam (Gemini 2.5 Pro) + Eve (OpenAI o3)** are the default review-tier models. Invoke liberally on design review, adversarial cross-check, physics-correctness verification.
- MCP llm-tools are TEXT-ONLY — inline source content into the `prompt` string when asking Adam/Eve to verify code claims.

### Vendored audit tooling (in-tree since v0.6.0 maintenance)
Re-runnable codebase analysis via the in-tree `tools/` directory.
The dep-graph generator was vendored from the memoryjs sister repo in
commit `384db01` (v0.6.0 post-ship maintenance); v0.6.1 Phase 3 then
taught its `detectUnused` to consume test-file imports and to parse
`package.json` `exports` for subpath reachability.

```bash
# Regenerate the dependency graph + unused analysis + test-coverage report.
# v0.6.1: docs:deps now passes --include-tests by default.
npm run docs:deps

# Scan plan docs for stale/unchecked checkboxes.
npm run audit:plans
```

Re-run before any future minimize/audit/refactor release.

### Plan-template imperfections (known pattern)
Plan-writing subagents produce illustrative inline test templates that often have wrong tensor-input formats / wrong AST node kinds / wrong method names. Implementers at execution time MUST cross-check against existing fixtures and correct as needed; honest deviation documented in commit message. Examples from v0.4.5/v0.4.6: incorrect nested-array shapes in covariant-derivative tests, `op:'*'` vs `kind:'tensor-product'`, `evaluateNumericalRaw` claim to bypass `validate()` (it doesn't), wrong method names (`f64.mul` vs actual). Pre-execution verification gates on risky tasks are the systemic mitigation — the v0.5.0 plan has these on Tasks 0, 3, 6, 7, 10, 12.

### Adam+Eve review process for design and plan docs
Both design AND plan get adversarial-reviewed. For v0.5.0: design caught 19 findings (notably the Ruth-4-not-symplectic-on-non-separable-Hamiltonian showstopper that Adam missed but Eve caught); plan caught 25 MORE findings including the ricci-slot reintroduction (plan-writing reintroduced a bug the design had fixed) and the Picard-masquerading-as-Newton showstopper. **Never assume the plan inherits the design's fixes** — review the plan independently.

### Numeric claims in todo entries decay faster than checkbox state

A todo that says "fix the bug" stays accurate until the bug is fixed. A todo that says "fix the 65 sites where X happens" becomes increasingly fictional as the codebase evolves — refactors merge sites, deletions remove them, additions inflate them. **Every silent-staleness finding so far has been a numeric drift**, not a forgotten checkbox:

| Carry-forward | Stated number | Actual at re-measurement | Drift |
|---|---|---|---|
| PC-1.5 Shapiro residual | 2.51e-4 | 2.28e-8 | 4 OOM (3 releases stale) |
| AS-3 `schwarzschildPin` sites | ~65 | 8 | 1 OOM |
| BE-module unused exports | ~85 | 61 | 40% inflated |
| `schwarzschildRiemannFn` populated entries | 8 of 256 | 24 of 256 (mathematically complete) | 1 OOM |
| Unknown↔unknown bridge count | ~9 | 26 | 3× |
| Near-horizon Kretschmann scope | ~600 LOC across 4 files | ~300 LOC | 2× over |

**Convention**: when a todo entry cites a number, suffix it with the date the number was measured, e.g., *"65 sites (as of 2026-05-19)"*. This signals to future readers that the number is a snapshot, not a live measurement, and re-checking at HEAD is the first action before treating the number as work scope.

This applies to: counts of files/sites/symbols/tests, performance numbers (residuals, speedups, LOC budgets), and any other claim that would be invalidated by an unrelated refactor. It does NOT need to apply to canonical/fixed constants (e.g., "42-bridge catalog" is a structural cardinality, not a measurement).

**Re-baseline trigger**: before scoping any work whose effort estimate depends on a cited number, re-run the producing tool (`grep`, `npm run docs:deps`, `wc -l`, bench harness) at HEAD. If the number drifts by more than ~20%, update the todo entry's date suffix in the same commit that closes or re-scopes the item.

### How to update this file
- When a task completes: flip `[ ]` → `[x]` AND move it to the "Latest shipped" section if it represents a release
- When a new task is identified: add it to the appropriate section (active queue / deferred)
- Keep the "Latest shipped" section to 3-5 entries; older releases roll off into `CHANGELOG.md` for historical record
- Commit this file alongside the work it tracks (it's NOT in `.gitignore`)

---

## Post-v0.7 horizon (notes only, no commitments)

- **v0.7+ proposal set** in `docs/planning/UPT v0.70 - Proposals.md` (2026-05-22) — 8 proposals grounded in the MathTS CHANGELOG. **Status (2026-05-23 session):**
  - P1 (Intelligent Index): ✓ SHIPPED on v0.7-series branch
  - P2 (Sparse semantic catalog): ✓ SHIPPED on v0.7-series branch
  - P3 (Typed L+B+E): ✓ SHIPPED on v0.7-series branch
  - P4 (Bridge DSL): peer install unblocked as of v0.7.3 (2026-05-25 — `mathts-expression ^0.2.0` now declared in UPT's `optionalDependencies`); actual P4 implementation code still pending
  - P5 (`RegimeType`): ✓ SHIPPED ahead of v0.8 target
  - P6 (Bridge composition): **Phase A shipped** as docs-only research spec (`Part-IX-Composition.md`); Phases B/C/D are v0.9α / v0.9β / v1.0
  - P7 (Workbooks): BLOCKED on `mathts-workbook` peer install
  - P8 (Bridge param AD): ✓ SHIPPED ahead of v0.9 target (real-AD tests skip-marked pending CI peer install)
- **P6 Phase B** (v0.9α calibration) — five open questions in `docs/planning/v0.7-Proposal-6-PhaseA-Open-Questions.md` (Q1 composition surface, Q2 tolerance, Q3 flux interaction, Q4 identity, Q5 v1.0 escalation) need Phase B answers before opening `src/composition/` code.
- **P8 real-AD test enablement** — when CI installs `@danielsimonjr/mathts-autograd` (the optional peer), remove `.skipIf(true)` in `tests/diff/bridge-gradient.test.ts` and add AD-vs-analytic gradient assertions per the v0.9 design's Phase 2 spec.
- **P5 closed-taxonomy follow-up** — v0.9 per-bridge physics review to decide which new physics regimes (classical-mechanics, QFT, GR, cosmology, condensed-matter, statistical-mechanics, information-theoretic, …) to add as built-ins beyond the 18 v0.6-shipped values. Per P5 Decision #1 (research task, not engineering). **(2026-06-16 reconfirmed physicist-surface: the `defineRegime` mechanism is shipped + tested; the taxonomy DECISION is a physicist's call, not a mechanical pass. Left here, not implemented.)**
- [x] ✅ **`LabeledTensor` explicit axis-order invariant — EXECUTED 2026-06-16**
      (`docs/planning/v0.14-LabeledTensor-AxisOrder-Design.md`, Adam GREEN + Eve
      YELLOW→resolved). The prerequisite the mergeAxes vet surfaced: replaced the
      implicit "engine axis = sorted-key position" assumption with an explicit
      `axisOrder` field + `axisOf(key)`, maintained by transpose/contract/reshape;
      optional 4th ctor param (backward-compatible). Fixed the latent
      transpose/contract desync + Eve's collision-suffix duplicate bug. New
      `AxisOrderError` (@public). Suite **2605 passing** (+10); tsc src+tests,
      build, smoke ✓.
- [x] ✅ **`mergeAxes` / `splitAxis` (rank-changing reshape) — EXECUTED
      2026-06-16** (`docs/planning/v0.14-MergeAxes-SplitAxis-Design.md`, Adam
      design-GREEN + Eve impl-YELLOW→resolved). Rank-changing reshape on
      `LabeledTensor`: `mergeAxes` fuses a contiguous run of ENGINE axes (via
      `axisOf`, correct on transposed/contract-derived non-sorted axisOrder),
      `splitAxis` is the inverse; caller owns the new axis identities. New
      `@public` `AxisMergeError`/`AxisSplitError`. Eve caught Y1 (two split parts
      sharing one id → contract-illegal tensor; now guarded). 15 tests. Suite
      **2620 passing** (+15); tsc src+tests, build, smoke ✓. Closes the
      `RankPreservationError` "future helper" promise.
- Faraday-tensor mixed-component-dim BREAKING refactor (3 nodes affected per Part-VIII §VIII.10)
- Browser float32 `TensorEngine` impl
- threejs visualization bootstraps
- TensorJS v1.0: stable public API + numerical surface + declarative viz spec (north star)
