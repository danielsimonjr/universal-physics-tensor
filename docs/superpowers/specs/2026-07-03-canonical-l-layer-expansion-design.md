# Canonical L-Layer Expansion — Design / Plan

**Date:** 2026-07-03 · **Status:** r1 — **SCOPE A CONFIRMED (owner, 2026-07-03):
fill the algebraic-law gaps across all domains, ~110 new equations, ~tripling
the L-layer.** Awaiting Adam/Eve plan vet, then SDD execution by domain batch.
**Goal:** grow the canonical "known-physics" L-layer from its current curated
66 equations toward a genuine core-reference set, so the library is a
comprehensive, well-validated physics-equation reference — strengthening every
bridge confrontation and the framework's usefulness as a symbolic physics tool.

This is deliberately UNLIKE the just-closed discovery-machinery roadmap: it is
**honest textbook content**, not speculative machinery. The value is clear and
the risk is scope + per-entry correctness, not "is it real."

## Current state (verified 2026-07-03)

66 canonical equations across 9 domains, skewed: mechanics 25, EM 13, quantum
11, GR 6, thermodynamics 4, gravitation 2, statistical 2, cosmology 2,
information 1. Encoding: 53 scalar-AST (L1), 13 dimensional-only (L0). The
`CanonicalDomain` enum has exactly those 9 categories.

## The load-bearing constraint: the L-layer is MONOMIAL-based

The L0 dimensional model represents each law as a **monomial** — a product of
governing-quantity powers (`target = const · Πxᵢ^eᵢ`). Its explicit bar
(entry-file docstrings, Adam+Eve pass 2026-06-20): *"generic, purely dimensional
MONOMIAL laws — the only laws that genuinely fit the dimensional L-layer."* So:

- **Algebraic monomial laws fit cleanly** (F=ma, E=mc², KE=½mv², PV=NkT,
  v=fλ, Coulomb, Rydberg, half-life, Fermi energy, …) — encodable as
  `l1(target, governing, {…, scalarAst})` with a unique dimensional monomial.
  There are *hundreds* of these across physics; the current 66 barely scratch
  the surface. **This tier is the expansion's target.**
- **Sums / differences** (E = KE + PE; thermodynamic potentials) fit only as
  `epistemicStatus: 'dimensional'` or via a scalar-AST sum — supported but not a
  clean monomial; encoded case-by-case where the sum is standard.
- **Field / differential equations** (Maxwell in differential form, Schrödinger,
  Navier-Stokes, Dirac, the heat/wave PDEs) are **NOT monomials** — they need
  the L2 `fieldEquation` encoding, a much larger per-entry effort. **This tier
  is explicitly OUT of scope for this expansion** (deferred as a separate,
  later L2 project); attempting it here would blow scope and per-entry cost.

Framed honestly: this plan makes the L-layer a comprehensive reference of the
**algebraic/monomial** known-physics laws — the vast majority of what a
physics-equation reference actually contains — and defers the field-equation
tier.

## Scope target (the decision to confirm)

Three bounded options, in ascending size:

- **Option A (recommended) — fill the algebraic-law gaps across all domains.**
  Add the standard monomial/algebraic textbook laws in the thin + missing areas,
  plus a few new domains, targeting **~100–150 new equations** (roughly
  tripling the L-layer to ~170–220). Monomial-tractable, high value-per-effort,
  bounded and reviewable by domain batch.
- **Option B — expand only the existing 9 domains** (no new domains): deepen
  thermo/stat-mech/quantum/EM to textbook-core depth, ~50–70 new equations.
  Smaller, no `CanonicalDomain` enum change.
- **Option C — comprehensive incl. field equations:** A + the L2
  field-equation heavy-hitters. Much larger, needs the `fieldEquation` encoding
  effort; NOT recommended as one project (the L2 tier should be its own).

**Recommendation: Option A.** It delivers a genuinely comprehensive
algebraic-law reference (the bulk of "known physics equations"), stays
monomial-tractable, and is cleanly decomposable.

## Option-A domain decomposition (batches)

New domains (require adding to `CanonicalDomain`): **waves, optics, fluids,
nuclear, condensed-matter, atomic** (or fold atomic into quantum). Each batch is
a self-contained `src/canonical/entries/<domain>.ts` file + registry
registration + a per-batch test, encoded as `l1(...)` entries.

| batch (domain) | example laws (each cited + dim-validated) | ~count |
|---|---|---|
| waves & oscillation | v=fλ, ω=2πf, T=2π√(m/k), Q-factor, damped-ω, Doppler, beat freq | ~12 |
| optics | thin-lens 1/f, lensmaker, magnification, n=c/v, Bragg, grating, Rayleigh criterion, Snell (ratio) | ~12 |
| fluids | ρgh, continuity Av, Bernoulli terms, Reynolds, Stokes drag, Poiseuille, buoyancy, surface tension | ~12 |
| thermodynamics (expand) | Q=mcΔT, PV=NkT, Stefan-Boltzmann, Wien, latent heat, thermal expansion, efficiency, dS=dQ/T | ~12 |
| statistical mech (expand) | Boltzmann factor, equipartition, MB speed, mean free path, diffusion D, pressure kinetic | ~10 |
| atomic/quantum (expand) | Bohr radius/energy, Rydberg, de Broglie, photoelectric, Compton shift, Planck, fine-structure | ~12 |
| nuclear/particle | binding energy, decay law N=N₀e^−λt, half-life, Q-value, cross-section, activity | ~10 |
| condensed matter | Fermi energy, Debye freq, Hall coefficient, drift velocity, conductivity σ=nqμ, plasma freq | ~10 |
| EM (expand) | Coulomb, capacitance, RC/LC τ, energy density, Poynting, cyclotron, Larmor, Biot-Savart (mag) | ~12 |
| relativity (expand) | E²=(pc)²+(mc²)², time dilation γ, length contraction, relativistic Doppler, mass-energy | ~8 |

Total ~110 new equations. Each batch is one atomic commit + review.

## Per-equation workflow (the established pattern)

Each equation is an `l1({name, dim}, governing[], {…metadata})` entry:
1. Identify target quantity + governing quantities + their SI dimensions.
2. Determine the monomial exponents (the dimensional relation) and
   `epistemicStatus` (`fully-quantitative` if the prefactor is known/clean;
   `scalar-up-to-constant` if a numeric prefactor like ½; `dimensional` if
   √/fractional or free groups).
3. Encode `scalarAst` (via `op`/`sym`/`pow`) where the form is a monomial.
4. `references`: a real citation (textbook + author/year) — **never fabricated**.
5. `regime` placement (scale/force), `assumptions` (the law's validity domain).

## Quality gates (binding)

- **Dimensional validation** — the registry machinery validates every entry's
  target dim against its monomial; a wrong dimension fails the build. This is
  the automatic correctness gate.
- **Normal-form dedup** — `normalForm` catches accidental duplicates of an
  existing law (structural hash).
- **No fabrication (HS)** — every equation is real textbook physics with a real
  citation; every dimension is verified, not guessed. Where a value/prefactor is
  uncertain, `epistemicStatus` records it honestly rather than overclaiming.
- **Per-batch test** — each domain file gets a test pinning every entry's
  dimensional signature + a spot-check of the monomial (the established
  `tests/canonical/<domain>.test.ts` pattern).
- **Adam+Eve physics review per batch** — each domain batch's equations are
  adversarially reviewed for physics correctness (wrong dimension, wrong
  governing set, misattributed law) before commit — the repo's standing review
  tier for physics-judgment content.
- **`catalog-json` + public-surface** stay in sync (regenerate; the drift guard).

## Execution shape

SDD: one domain batch per implementer subagent (encode the ~10-12 entries),
Adam+Eve physics review per batch, then the registry/test wiring. Batches are
independent (different entry files) → parallel-safe, sequential commits.
Release as a minor bump (v0.34.0) once the batches land + the full gate passes.

## Out of scope

Field/differential equations (the L2 tier — its own later project); any
non-textbook or speculative relation (those are bridges, not canonical); numeric
prefactors that aren't textbook-standard; equations whose dimensional form is
ambiguous without a model (recorded as `dimensional` or skipped, not forced).

## The decision this design needs

Confirm the scope target (A / B / C) — this sets the batch list and the ~count.
The recommendation is **A** (fill the algebraic-law gaps across all domains,
~110 new equations, ~tripling the L-layer). On confirmation: Adam/Eve vet this
plan, then SDD-execute the domain batches.
