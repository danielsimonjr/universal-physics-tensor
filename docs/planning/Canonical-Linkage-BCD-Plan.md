# Canonical Linkage (Sub-projects B/C/D) Implementation Plan

> **For agentic workers:** TDD per task; checkbox steps. Builds on Sub-project A
> (`src/canonical/`). Design lineage: `Canonical-Equation-Registry-A-Design.md`.

**Goal:** Validate bridge equations against the canonical (standard-physics)
registry — the "validate against standard physics" payoff — then use canonical
membership to sharpen discovery, and surface both via the CLI.

**Architecture:** B compares each bridge's RHS AST (`BRIDGE_RHS_BY_ID`) against
each canonical scalar-AST using a *normalized form up to dimensionless factors*
(flatten `*`, drop dimensionless multiplicative factors, sort commutative
operands). Identical normal forms ⇒ structural match; the F4 guard then asks
whether the canonical's `restatesBridge` names that bridge (⇒ trivial
`restates-canonical`, NOT a discovery) or whether it's a genuine, undeclared
`recovers`. C reuses canonical membership as a discovery "kind" filter. D wires
`upt canonical` / `upt recover`.

**Tech Stack:** TS ESM, vitest. Reuses `src/dimensional/validator.ts` (`validate`,
`ExprNode`), `src/composition/expr-eval.ts` (`evalExpr`), `src/bridges/rhs-registry.ts`
(`BRIDGE_RHS_BY_ID`), `src/canonical/registry.ts`.

## Global Constraints

- ESM relative imports include `.js`; single quotes; no prettier.
- Catalog bridge ids are **numbers** (11–54); `restatesBridge`/`partnerBridges`
  store them as **strings**. Compare with `String(id)`.
- "Up to dimensionless factors" = drop multiplicative operands whose dimension is
  all-zero (numeric literals AND dimensionless symbols). Exponents in `^` are
  **kept** (T⁴ ≠ T). Sums keep all terms.
- A symbol is dimensionless iff every one of its 7 dim exponents is 0.

---

## Sub-project B — bridge↔canonical linkage

### B-T1: normalized structural form (the F4 hash)

**Files:** Create `src/canonical/normal-form.ts`; Test `tests/canonical/normal-form.test.ts`

**Produces:** `normalForm(node: ExprNode): string`; `structurallyEqual(a, b): boolean`.

- [ ] Failing test: bridge-16 RHS `(k_B·T)·ln_2_constant` and CE-landauer
      `k_B·T·ln2` have equal `normalForm` (dimensionless log dropped, product
      flattened+sorted); `σ·T⁴` ≠ `σ·T` (exponent kept); a bare dimensionless
      symbol normalizes to the empty/`1` token.
- [ ] RED → implement `normalForm` (recursive: flatten `*`, drop dimensionless
      factors, sort `*`/`+` operands by child normal form, keep `^` exponent and
      `/` numerator/denominator) → GREEN → build → commit.

### B-T2: linkage classification + numerical recovery + scan

**Files:** Create `src/canonical/linkage.ts`; Test `tests/canonical/linkage.test.ts`

**Produces:** `LinkageResult { canonicalId, bridgeId, dimMatch, structuralMatch,
recovery: {tested:boolean, maxRelErr:number}|null, classification:
'restates-canonical'|'recovers'|'dimensional-only'|'unrelated' }`;
`classifyLinkage(canonicalId, bridgeId)`; `scanLinkages(): LinkageResult[]`.

- [ ] Failing test: `classifyLinkage('CE-landauer', 16)` ⇒ `restates-canonical`
      (structuralMatch true, `restatesBridge==='16'`), with numerical recovery
      tested and `maxRelErr < 1e-9`; `scanLinkages()` contains it and contains NO
      `restates-canonical` that lacks a real `restatesBridge`; a same-dimension
      non-matching pair ⇒ `dimensional-only`.
- [ ] RED → implement (dim via `validate(rhs).inferredDimension` vs
      `canonical.dimensional.target.dim`; structural via `structurallyEqual`;
      recovery: when structural + shared leaf names, `evalExpr` both at a sample
      assignment and compare up to a constant ratio; classification per the F4
      rule) → GREEN → build → commit.

### B-T3: public surface + honest report

**Files:** Modify `src/index.ts`; Test extend `tests/api/public-surface.test.ts`

- [ ] Export `normalForm`, `structurallyEqual`, `classifyLinkage`, `scanLinkages`,
      `LinkageResult`; update snapshot; build; commit.

---

## Sub-project C — discovery kind-filter

### C-T1: canonical-kind screen for `discover`

**Files:** Modify `src/composition/discovery.ts`; Test `tests/composition/discovery-canonical-kind.test.ts`

**Idea:** A canonical "kind" of a quantity = membership in a canonical equation's
governing/target set (by name). An identification `a≡b` is *kind-supported* when a
and b appear in canonical equations of the same `domain`. Add a `kindSupported`
signal to `VettedCandidate` (advisory, additive — does not change existing
verdicts) and a small bonus to `score`.

- [ ] Failing test: a candidate whose both endpoints appear in canonical entries
      of the same domain has `kindSupported: true`; one that doesn't has `false`;
      existing verdicts unchanged. RED → implement (read `CANONICAL_EQUATIONS`,
      build a name→domains index) → GREEN → build → commit.

---

## Sub-project D — CLI surfacing

### D-T1: `upt canonical` + `upt recover`

**Files:** Modify `bin/upt.mjs`; (smoke via `node bin/upt.mjs`)

- [ ] `upt canonical` — list the registry (id, name, domain, fidelity, partners)
      + the coverage gap count (`bridgesWithoutCanonicalPartner`).
- [ ] `upt recover` — run `scanLinkages()`; print `restates-canonical` (the F4
      circularity, flagged as NOT discoveries) and `recovers` (genuine
      correspondences) groups, with the dimensional-only count.
- [ ] Verify both run on Windows (`node bin/upt.mjs canonical`, `... recover`);
      update help; commit.

## Self-Review
- B's `restates-canonical` requires a real `restatesBridge` (F4); a structural
  match without one is `recovers` (a finding), never silently a restatement.
- Coverage/anti-overclaim: B reports `dimensional-only` honestly rather than
  inflating it to `recovers`. C is additive (no verdict regressions). D is
  read-only.
