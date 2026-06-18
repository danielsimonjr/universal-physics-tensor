# Canonical Equation Registry (Sub-project A) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax. Design: `Canonical-Equation-Registry-A-Design.md`; review findings: `Canonical-Equation-Registry-A-Review-Findings.md`.

**Goal:** A queryable `CanonicalEquation` registry (textbook physics) seeded into the tensor L-layer, unifying the existing derivation benchmark + field-equation nodes and adding a first tranche, with epistemic-honesty + provenance fields.

**Architecture:** New `src/canonical/` module: a `CanonicalEquation` interface, a `CANONICAL_EQUATIONS` array + id/domain accessors, an `canonicalToLaw` adapter that seeds the tensor via the existing `addLaw`. Entries carry L0 (dimensional, reusing `dimensionallyDetermines`), optional L1 (`scalarAst`, validated by `validate`), optional L2 (`fieldEquation`). No bridge↔canonical checks (that is Sub-project B).

**Tech Stack:** TypeScript ESM, vitest. Reuses `src/dimensional/{types,buckingham,validator}.ts`, `src/bridges/equations/_be-helpers.ts` (`sym`), `src/composition/{symbolic-constants,expr-eval}.ts`, `src/core/{types,tensor}.ts`.

## Global Constraints

- ESM relative imports MUST include the `.js` extension.
- Single quotes; NO prettier (never run `npx prettier --write`).
- Dimension constants from `src/dimensional/types.ts`: `DIMENSIONLESS, LENGTH, AREA, TIME, FREQUENCY, MASS, VELOCITY, ACCELERATION, FORCE, ENERGY, TEMPERATURE`.
- `sym(name, dim)` lives in `src/bridges/equations/_be-helpers.ts`.
- Scalar eval: `evalExpr(node, values)` from `src/composition/expr-eval.ts` (resolves leaves → `CONSTANTS` → numeric literals).
- Dimensional check: `validate(expr)` from `src/dimensional/validator.ts` → `{ ok, inferredDimension, diagnostics }`.
- L0 derivation: `dimensionallyDetermines(target, governing)` → `{ determined, monomial?, upToDimensionlessConstant? }`; `DimensionalVariable = { name, dim }`.
- L-seeding: `UniversalTensor.addLaw(law: PhysicalLaw): boolean`; `PhysicalLaw = { id, name, equation, scales[], forces[], symmetries[], confidence, references? }`.
- Tests live under `tests/canonical/`.
- No fabrication: L0 entries never claim a prefactor; the registry has no "validated" flag.

---

### Task 1: `CanonicalEquation` type + registry accessors

**Files:**
- Create: `src/canonical/canonical-equation.ts`
- Create: `src/canonical/registry.ts`
- Test: `tests/canonical/registry.test.ts`

**Interfaces:**
- Produces: `CanonicalEquation` interface (fields per Design §Data structure); `CANONICAL_EQUATIONS: readonly CanonicalEquation[]`; `CANONICAL_BY_ID: Readonly<Record<string, CanonicalEquation>>`; `canonicalById(id): CanonicalEquation | undefined`; `canonicalByDomain(domain): readonly CanonicalEquation[]`.

- [ ] **Step 1 — failing test** (`tests/canonical/registry.test.ts`): assert `canonicalById` returns an entry for a known seed id and `undefined` for a miss; `canonicalByDomain('mechanics')` returns ≥1; `CANONICAL_BY_ID` has an entry per `CANONICAL_EQUATIONS` element.
- [ ] **Step 2 — RED:** `npx vitest run tests/canonical/registry.test.ts` → fails (module missing).
- [ ] **Step 3 — implement:** write `canonical-equation.ts` (the interface + `CanonicalDomain` union + `EpistemicStatus` union) and `registry.ts` (the array seeded with ONE entry — `CE-pendulum-period`, L0 — plus the derived `CANONICAL_BY_ID` map and the two accessors).
- [ ] **Step 4 — GREEN:** `npx vitest run tests/canonical/registry.test.ts`; then `npm run build` (typecheck).
- [ ] **Step 5 — commit** (`feat(canonical): CanonicalEquation type + registry accessors`).

### Task 2: L0 promotions — the 9 benchmark cases

**Files:**
- Create: `src/canonical/entries/dimensional-classics.ts`
- Modify: `src/canonical/registry.ts` (import + spread the 9 entries)
- Test: `tests/canonical/dimensional-classics.test.ts`

**Interfaces:**
- Consumes: `CanonicalEquation`, `dimensionallyDetermines`, `DimensionalVariable`, dim constants.
- Produces: `DIMENSIONAL_CLASSICS: readonly CanonicalEquation[]` (pendulum, Kepler III, Schwarzschild radius, string wave speed, Planck length/mass/time, Compton, thermal de Broglie) — each `epistemicStatus:'dimensional'`, `freeDimensionlessGroups:0`, `dimensional.monomial` set from the benchmark.

- [ ] **Step 1 — failing test:** for each entry, `dimensionallyDetermines(e.dimensional.target, e.dimensional.governing)` returns `determined:true` and a monomial deep-equal to `e.dimensional.monomial` (mirror the existing `tests/dimensional/derivation-benchmark.test.ts` constants — copy the exact dims `G=D(3,-1,-2)`, `HBAR=D(2,1,-1)`, etc.). Also assert the epistemic invariant `freeDimensionlessGroups===0 ⇔ monomial!==null`.
- [ ] **Step 2 — RED.**
- [ ] **Step 3 — implement** the 9 entries (reuse the benchmark's variable/dim definitions; `regime` coords e.g. pendulum `{scale:'classical', force:'gravitational'}`).
- [ ] **Step 4 — GREEN** + build.
- [ ] **Step 5 — commit** (`feat(canonical): promote 9 dimensional-derivation classics`).

### Task 3: constant-registry extension (ε₀, σ-derived)

**Files:**
- Modify: `src/composition/symbolic-constants.ts`
- Test: `tests/composition/symbolic-constants.test.ts` (extend or create)

**Interfaces:**
- Produces: `CONSTANTS.epsilon_0` ([I²T⁴M⁻¹L⁻³], 8.8541878128e-12) and `CONSTANTS.sigma_sb` (Stefan–Boltzmann, derived value 5.670374e-8, dim `[M T⁻³ Θ⁻⁴]`), each with a comment giving the fundamental-constant expansion.

- [ ] **Step 1 — failing test:** `CONSTANTS.epsilon_0.value` ≈ 8.854e-12 and dim matches permittivity; `CONSTANTS.sigma_sb.value` ≈ 5.670e-8.
- [ ] **Step 2 — RED.**
- [ ] **Step 3 — implement** (add the two entries; keep existing `hbar/c/k_B/ln2/G/...`).
- [ ] **Step 4 — GREEN** + build.
- [ ] **Step 5 — commit** (`feat(constants): add epsilon_0 and derived sigma_sb`).

### Task 4: L1 entries — gravitation + thermodynamics

**Files:**
- Create: `src/canonical/entries/l1-gravity-thermo.ts`
- Modify: `src/canonical/registry.ts`
- Test: `tests/canonical/l1-gravity-thermo.test.ts`

**Interfaces:**
- Produces entries (each `scalarAst` set, `epistemicStatus:'scalar-up-to-constant'` or `'fully-quantitative'`): `CE-bekenstein-hawking` (S=k_B·c³·A/(4Għ), `forms.areaOrRadius:'area'`, `restatesBridge:'BE-21'`, `partnerBridges:['BE-21','BE-42']`), `CE-landauer` (E=k_B·T·ln2, `forms.logBase:'e'`, `restatesBridge:'BE-16'`), `CE-newton-gravitation` (F=G·m1·m2/r²), `CE-stefan-boltzmann` (j=σ·T⁴, `forms.quantityKind:'flux'`), `CE-ideal-gas` (P·V=N·k_B·T → solve for P).

- [ ] **Step 1 — failing test:** each entry's `scalarAst` passes `validate()` with `inferredDimension` equal to its `dimensional.target`. (Build the ASTs with `sym`/`op`; constants `k_B`, `c`, `G`, `hbar`, `ln2`, `sigma_sb` as `sym('<id>', CONSTANTS['<id>'].dim)`.)
- [ ] **Step 2 — RED.**
- [ ] **Step 3 — implement** the 5 entries.
- [ ] **Step 4 — GREEN** + build.
- [ ] **Step 5 — commit** (`feat(canonical): L1 gravitation + thermodynamics entries`).

### Task 5: L1 entries — quantum + electromagnetism

**Files:**
- Create: `src/canonical/entries/l1-quantum-em.ts`
- Modify: `src/canonical/registry.ts`
- Test: `tests/canonical/l1-quantum-em.test.ts`

**Interfaces:**
- Produces: `CE-coulomb` (F=q1·q2/(4π·ε₀·r²)), `CE-planck-einstein` (E=h·ν), `CE-de-broglie` (λ=h/p), `CE-bohr-radius` (a0=4π·ε₀·ℏ²/(m_e·e²)), `CE-wien` (λ_max·T=b → λ_max=b/T), `CE-lorentz-force` (F=q·v·B, magnitude). Charge/current dims via `DimensionalVariable` (charge = [I T]).

- [ ] **Step 1 — failing test:** each `scalarAst` validates to its target dim.
- [ ] **Step 2 — RED.**
- [ ] **Step 3 — implement.**
- [ ] **Step 4 — GREEN** + build.
- [ ] **Step 5 — commit** (`feat(canonical): L1 quantum + electromagnetism entries`).

### Task 6: numeric-prefactor self-tests (review finding F3)

**Files:**
- Test: `tests/canonical/numeric-prefactor.test.ts`

**Interfaces:**
- Consumes: `evalExpr`, `canonicalById`.

- [ ] **Step 1 — verify the eval API first** (UPT pre-execution gate): read `src/composition/expr-eval.ts` to confirm `evalExpr(node, values)` resolves `CONSTANTS` leaves; confirm `epsilon_0`/`sigma_sb` are registered (Task 3) so they resolve.
- [ ] **Step 2 — failing test:** `evalExpr(CE-landauer.scalarAst, {T:300})` ≈ `1.380649e-23*300*Math.LN2` (rel<1e-9); `evalExpr(CE-stefan-boltzmann.scalarAst, {T:5778})` ≈ `5.670374e-8*5778**4` (rel<1e-6); `evalExpr(CE-bekenstein-hawking.scalarAst, {A: <M☉ horizon area>})` matches `k_B·c³·A/(4Għ)` computed directly (rel<1e-9).
- [ ] **Step 3 — RED** (will pass once entries+constants exist; if a prefactor mismatches, the encoding — area/log/flux — is wrong: FIX the entry, not the test).
- [ ] **Step 4 — GREEN** + build.
- [ ] **Step 5 — commit** (`test(canonical): numeric-prefactor guards for L1 entries`).

### Task 7: registry invariants + OPEN-bridge coverage rule (F1/F2/F4)

**Files:**
- Test: `tests/canonical/invariants.test.ts`

**Interfaces:**
- Consumes: `CANONICAL_EQUATIONS`, `BRIDGE_EQUATIONS` (`src/bridges/index.ts`), the audit's OPEN classifier.

- [ ] **Step 1 — failing test:** unique ids; every entry ≥1 reference; every `restatesBridge`/`partnerBridges` id exists in `BRIDGE_EQUATIONS`; epistemic invariant (`freeDimensionlessGroups===0 ⇔ monomial!==null` for L0; `scalarAst` present ⇒ status ≥ `'scalar-up-to-constant'`); **coverage:** every OPEN bridge id is either in some entry's `partnerBridges` OR in an explicit `ON_HOLD_BRIDGES` list exported from the registry (so gaps are logged, not silent).
- [ ] **Step 2 — RED.**
- [ ] **Step 3 — implement:** add `ON_HOLD_BRIDGES` to `registry.ts` listing OPEN bridges with no tranche partner; ensure invariants hold.
- [ ] **Step 4 — GREEN** + build.
- [ ] **Step 5 — commit** (`test(canonical): registry invariants + OPEN-bridge coverage`).

### Task 8: L-layer seeding adapter

**Files:**
- Create: `src/canonical/seed-l-layer.ts`
- Test: `tests/canonical/seed-l-layer.test.ts`

**Interfaces:**
- Produces: `canonicalToLaw(ce: CanonicalEquation): PhysicalLaw`; `seedCanonicalLaws(t: UniversalTensor): number` (returns count added).

- [ ] **Step 1 — failing test:** `canonicalToLaw(CE-pendulum-period)` yields a `PhysicalLaw` with matching id/name/equation, `scales` from `regime.scale`, `confidence:1`; after `seedCanonicalLaws(new UniversalTensor())`, `t.getStats().lawCount` equals `CANONICAL_EQUATIONS.length` and a seeded cell is queryable.
- [ ] **Step 2 — RED.**
- [ ] **Step 3 — implement** (map `regime.scale`→`scales[]`, `regime.force`→`forces[]`, etc.; `equation: formula_latex`).
- [ ] **Step 4 — GREEN** + build.
- [ ] **Step 5 — commit** (`feat(canonical): L-layer seeding adapter`).

### Task 9: L2 promotions (EFE, Friedmann) + public surface

**Files:**
- Create: `src/canonical/entries/l2-field-equations.ts`
- Modify: `src/canonical/registry.ts`, `src/index.ts` (export the registry public surface)
- Test: `tests/canonical/l2-field-equations.test.ts`, `tests/api/public-surface.test.ts`

**Interfaces:**
- Consumes: existing `EinsteinFieldEquationNode` + field-equation validators; Friedmann helper.
- Produces: `CE-einstein-field-eq`, `CE-friedmann` (each with `fieldEquation` set, `epistemicStatus:'fully-quantitative'`); `index.ts` re-exports `CANONICAL_EQUATIONS`, `canonicalById`, `canonicalByDomain`, `CanonicalEquation`.

- [ ] **Step 1 — verify first:** read `src/dimensional/field-equation-helpers.ts` + the EFE node + `friedmann-equation.ts` to get the exact node-construction + validator call.
- [ ] **Step 2 — failing test:** each L2 entry's `fieldEquation` passes the existing field-equation validator; `public-surface.test.ts` sees the new exports.
- [ ] **Step 3 — RED.**
- [ ] **Step 4 — implement** + wire `index.ts`.
- [ ] **Step 5 — GREEN** + build.
- [ ] **Step 6 — commit** (`feat(canonical): L2 EFE+Friedmann + public surface`).

---

## Self-Review

- **Spec coverage:** registry+accessors (T1), L0 promotions (T2), constants (T3), L1 (T4/T5), numeric guards (T6), epistemic+provenance+coverage invariants (T7), L-seeding (T8), L2+public surface (T9). All Design sections covered. Circularity data (`restatesBridge`) is in T4; the enforcement is explicitly Sub-project B (out of scope, named).
- **Type consistency:** `CanonicalEquation`, `canonicalById`, `canonicalByDomain`, `canonicalToLaw`, `seedCanonicalLaws`, `ON_HOLD_BRIDGES` used consistently across tasks.
- **Pre-execution gates** on T6/T9 (verify eval + field-equation APIs against source before writing test code) per the UPT plan-snippet-rot gotcha.
- **No grammar work** required (Landauer `ln2` is a dimensionless constant; `transcendental` node already exists).
