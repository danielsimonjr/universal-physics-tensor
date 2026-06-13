# Deriving the Bridge Equations — a Dimensional-Analysis Audit

> **Provenance:** 2026-06-13 (branch
> `claude/bridge-equations-specs-review-4mfy38`). Points the Buckingham-π
> engine (`src/dimensional/buckingham.ts`) at all 41 bridge edges and
> asks: how many of the catalog's bridge equations can be DERIVED by
> dimensional analysis? Every number below is pinned by
> `tests/dimensional/bridge-derivation-audit.test.ts`.

## Method

For each bridge edge (`sources → target`, with an evaluator) the audit:

1. **Searches for a dimensional closure** — the smallest subset of the
   fundamental constants {ℏ, c, G, k_B, e} which, added to the bridge's
   own source variables, makes the target dimensionally determined
   (`dimensionallyDetermines` returns a unique monomial).
2. **Verifies the closure numerically** — builds the candidate
   `target = Π(source^e)·Π(constant_SI^e)` and evaluates it against the
   bridge's actual evaluator at several input points. If the ratio is
   **constant**, the monomial is the right form and that ratio is the
   dimensionless prefactor (which dimensional analysis cannot supply, but
   the numerical match recovers). If the ratio **varies**, the closure is
   a *decoy* — dimensionally valid, physically wrong.

This is the epistemics note's "(A) form by dimensions, the constant by
physics" made operational, and audited against the catalog itself.

## Result (41 edges)

| outcome | count |
|---|---|
| **Derived** (form matches the evaluator; prefactor recovered) | 11 |
| **Decoy-only** (closures exist, none match the evaluator) | 5 |
| **Unclosable** (no constant subset closes it) | 25 |

**Roughly a quarter of the bridge equations are dimensional
consequences; three-quarters carry physics that dimensions cannot
reach.** This is the epistemics note's "dimensional matching is a weak
filter" confirmed empirically on the project's own catalog.

## Derived — and the recovered prefactors

The striking part: where the form *is* a dimensional consequence, the
numerical match against the bridge's evaluator hands back the famous
dimensionless constant the engine itself could never produce.

| bridge | engine derives (form) | recovered prefactor |
|---|---|---|
| be-16 Landauer | `E ∝ k_B·temperature` | **0.69315 = ln 2** |
| be-21 KSS bound | `η/s ∝ ℏ·k_B⁻¹` | **0.079577 = 1/4π** |
| be-42-via-rs Hawking | `T_H ∝ ℏ·c·r_s⁻¹·k_B⁻¹` | **0.079577 = 1/4π** |
| be-20 vacuum energy | `ρ_Λ ∝ Λ·c²·G⁻¹` | **0.039789 = 1/8π** |
| law-schwarzschild | `r_s ∝ G·mass·c⁻²` | **2.0000** |
| be-12 thermal de Broglie | `λ ∝ ℏ·(mass·k_B·temperature)⁻¹ᐟ²` | **2.5066 = √(2π)** |
| be-13 Einstein trace | `R ∝ cosmological-constant-curvature` | **4.0000** (R = 4Λ) |
| be-48 GRW localization | `λ_GRW ∝ mass·c²·ℏ⁻¹` | 7.03×10⁻⁴¹ (the GRW rate, an empirical parameter) |
| be-15 model-A coarsening | `L ∝ (mobility·time)¹ᐟ²` | 1.000 |
| be-17 torsion–spin | `spin² ∝ coupling²·torsion-scalar` | 1.000 |
| be-36 GW speed ratio | (dimensionless target — degenerate) | — |

ln 2, 1/4π (twice), 1/8π, √(2π), the factor 2 in r_s, the 4 in R = 4Λ —
each is the *physics* constant, recovered not by the dimensional engine
but by matching its derived form against the catalog's encoded evaluator.

## Decoy-only — the cautionary cases

Dimensionally valid, physically wrong. These are the vivid illustration
of why dimensional matching cannot be a *discovery* engine:

- **be-42 (Hawking, from mass directly).** The only closure of a
  temperature from {mass, c, k_B, …} is `mass·c²·k_B⁻¹` — the *rest-mass
  temperature* Mc²/k_B, which grows with M. The real Hawking temperature
  falls as 1/M; with {ℏ, G} added there is a free group (ℏc/GM²), so it
  is genuinely *not* a dimensional consequence. (Note the asymmetry:
  be-42-**via-rs** *is* derivable, because r_s already absorbs GM/c².)
- **be-51 (Eddington lensing).** The deflection angle is dimensionless,
  so dimensional analysis fixes it only as "a constant" — it cannot see
  the `4GM/bc²` dependence at all (the ratio varies with the inputs).
- **be-27 (effective temperature).** `T_eff = T + (noise/k_B)` is a
  *sum*, not a monomial — no power-product can match it.
- **be-14, be-43 (entanglement entropies).** Area-law forms whose
  coefficient needs the Planck area (ℏG/c³); with those constants
  supplied a free group appears, so no unique monomial.

## Unclosable — the irreducible majority (25)

be-11-zurek, be-11-master, be-37, be-52, be-19, be-53, be-54, be-18,
be-22, be-23, be-24, be-25, be-26, be-30, be-31, be-33, be-34, be-38,
be-39, be-41, be-45, be-46, be-47, be-49, be-50.

These admit *no* constant subset that closes them: each carries an
irreducible free dimensionless group (multiple independent
dimensionless ratios → the relation is a *function* of them, not a
monomial) or a dimensionless target. This is exactly where the form is
genuine physics — the specific functional shape, the dimensionless
couplings, the mechanism — and dimensional analysis, honestly, says
nothing.

## Takeaway

The audit is a clean, quantitative confirmation of the project's
governing thesis (`Bridge-Inference-Epistemics-Note.md`): dimensional
analysis is a *form* filter, not a discovery engine. It derives the
skeleton of ~1/4 of the catalog; for those, matching the engine's form
against the encoded evaluator recovers the textbook constants (ln 2,
1/4π, 1/8π, √2π, …). For the other ~3/4 it correctly declines — and the
decoy cases show it would actively mislead if trusted as a generator.
Form by dimensions; constant, and everything harder, by physics.

## Reproduce

```bash
npx vitest run tests/dimensional/bridge-derivation-audit.test.ts
```
