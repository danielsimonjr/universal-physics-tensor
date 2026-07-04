# L1-Sum Canonical Tier — Design

**Date:** 2026-07-04 · **Status:** r1 — DRAFT, awaiting Adam/Eve vet + a
mandatory Task-0 consumption pilot.
**Program:** Program A (the excluded-law backlog). **L2 field-equation tier is
OUT of scope** — grounding proved it's inert (FieldEquationNode is Einstein-only;
`fieldEquation` is read by nothing but a CLI label — the E-layer write-only trap).

## Goal

Encode the NON-monomial backlog laws — the sums and transcendentals the v0.34.0
L0 expansion deliberately excluded — as `CanonicalEquation` entries carrying a
full **L1 scalar-AST** (`scalarAst`) with `dimensional.monomial = null`. This
extends the canonical reference beyond monomials to the famous algebraic laws
(Bernoulli, Carnot, decay, photoelectric, …) that dimensional analysis alone
can't pin.

## Grounding (verified 2026-07-04)

- The AST grammar ships sums (`op:'+'/'-'`) and transcendentals (exp/ln/trig),
  with the constraint that **transcendental args must be dimensionless**
  (`ast-types.ts:217`).
- `monomial:null` is a supported, precedented state (`dimensional-fields.ts`
  already emits it for unpinnable laws like Newton F, Bekenstein-Hawking); no
  consumer requires `monomial !== null`.
- **L1 scalarAst IS consumed** (the E-layer test): `linkage.ts:246` skips
  entries without a scalarAst, then structurally compares `normalForm(scalarAst)`
  against every bridge RHS; `normalForm` is already sum-aware (`:141-146`) and
  transcendental-aware (`:152-153`); 24 bridge RHS modules carry sum forms. So an
  L1-sum entry is folded into `scanLinkages` / `upt recover` immediately — not
  write-only.
- No canonical entry is currently built WITHOUT `l1()`; these would be the first
  direct-constructed (non-monomial) entries.

## The honest value question (Task-0 must answer it, not assume it)

"Consumed by scanLinkages" is necessary but not sufficient. The open question the
**Task-0 pilot** must MEASURE (the E-layer lesson — measure consumption, don't
assume it): when a canonical sum-law (e.g. Bernoulli) is added, does `upt recover`
(a) find a genuine linkage to some bridge, (b) correctly find NO match (the scan
runs, no bridge is Bernoulli-shaped), or (c) error/misbehave on a `monomial:null`
+ sum entry? Outcomes (a) and (b) are both acceptable — (b) still enriches the
reference and the scan participates honestly; (c) is a blocker. **If the pilot
shows the entries are processed cleanly (a or b), the tier proceeds; the value is
"a richer, linkage-scanned canonical reference of the famous non-monomial laws,"
stated honestly — NOT an inflated "validates N bridges" claim unless the pilot
shows real matches.**

## The encoding pattern (first non-monomial canonical entries)

A small builder `l1Sum()` (sibling to `l1()`) in `entries/_l1-build.ts`, or
direct object construction, producing:
```
{ id, name, domain, formula_latex, epistemicStatus,
  freeDimensionlessGroups: 0,               // determined form, just not a monomial
  dimensional: { target, governing, monomial: null },
  scalarAst: <the sum/transcendental ExprNode>, ... }
```
- `scalarAst` is the actual RHS AST; the dimensional validator checks it
  (each summand shares the target dimension; transcendental args dimensionless).
- `epistemicStatus`: `'fully-quantitative'` when the closed form is exact
  (Bernoulli, decay), `'scalar-up-to-constant'` when a numeric prefactor is
  dropped. `monomial:null` is orthogonal to status (status describes the scalar
  form's completeness, not monomial-ness).

## Transcendental dimensionless-arg handling (the typed-stub idiom, precedented)

Transcendental laws ride the dimension on a symbol OUTSIDE the transcendental:
- Radioactive decay `N = N₀ e^{−λt}`: `exp(−λt)` has a DIMENSIONLESS arg (λ[T⁻¹]·
  t[T]); N and N₀ carry the (dimensionless count) dimension. scalarAst =
  `op('*', [N₀, exp(op('-',[λt]))])` with λt a dimensionless symbol.
- Boltzmann factor `e^{−E/kT}`: arg `E/kT` dimensionless; the factor is
  dimensionless. Same idiom as the existing BE-25/BE-37 log-stubs.

## Candidate laws (cleanest → hardest; final set gated by the pilot)

| law | form | grammar | notes |
|---|---|---|---|
| Bernoulli | ½ρv² + ρgh + P (all pressure) | pure SUM | **PILOT** — cleanest: same-dim summands, no transcendental |
| Carnot efficiency | 1 − T_c/T_h | difference of dimensionless | dimensionless target |
| Radioactive decay | N₀ e^{−λt} | transcendental (dimensionless arg) | typed-stub on N₀ |
| Photoelectric | hf − W | difference (both energy) | clean sum |
| Boltzmann factor | e^{−E/kT} | transcendental | dimensionless |
| Rydberg | 1/λ ∝ (1/n₁² − 1/n₂²) | difference of dimensionless counts | count-stub |
| Compton shift | (h/mc)(1 − cosθ) | transcendental (cos) | product with a trig term |
| Lorentz factor γ | 1/√(1 − v²/c²) | sum-in-a-root | fractional-of-sum |

**Scope: the ~5 cleanest first** (Bernoulli, photoelectric, decay, Carnot,
Boltzmann factor); Rydberg/Compton/γ only if the pilot + these go smoothly.

## Task-0 pilot (MANDATORY before the batch)

1. Encode ONLY Bernoulli as a direct-constructed `monomial:null` + sum-scalarAst
   `CanonicalEquation`; register it.
2. Confirm: it dimensionally validates (each summand is pressure); `tsc` clean;
   the canonical suite green.
3. **MEASURE consumption:** run `upt recover` (and read `scanLinkages`) — record
   whether Bernoulli produces a linkage, no-match, or an error. Report the actual
   behavior. This decides whether the tier's value is "real matches" or "honest
   reference enrichment + clean scan participation."
4. Go/no-go: proceed to the batch only if (2) is green AND (3) is clean
   (no error). Document the measured consumption behavior honestly.

## Architecture

| File | Responsibility |
|---|---|
| `entries/_l1-build.ts` (modify) | add `l1Sum()` builder (monomial:null, takes a prebuilt scalarAst + target/governing) OR document direct construction. |
| `entries/nonmonomial.ts` (create) | the L1-sum entries (pilot: Bernoulli; then the cleanest ~5). |
| `registry.ts` (modify) | register the new array. |
| `tests/canonical/nonmonomial.test.ts` | per-entry: scalarAst validates to target dim, `monomial===null`, `freeDimensionlessGroups===0`, sum summands share dimension, transcendental args dimensionless. |

## Out of scope

L2 field equations (inert — E-layer trap); any law needing a grammar extension;
inflated "validates N bridges" claims unless the pilot shows real matches; laws
whose honest home is still L0 (already encoded).

## Go/no-go

Buildable (grammar + monomial:null + a real consumer all confirmed). The gate is
the Task-0 pilot: prove a `monomial:null` + sum entry validates AND is processed
cleanly by `upt recover`, and report the HONEST consumption behavior before
scaling to the batch.
