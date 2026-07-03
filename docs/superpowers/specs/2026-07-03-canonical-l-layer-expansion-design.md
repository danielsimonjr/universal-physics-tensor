# Canonical L-Layer Expansion — Design / Plan

**Date:** 2026-07-03 · **Status:** r2 — **Adam RED + Eve YELLOW: the r1 ~110
count over-included NON-MONOMIAL laws (~40–60%) that don't fit L0.** Corrected:
the genuine monomial subset is ~50–70; a **monomial-fit audit is now the gating
first step** (Task-0), non-monomials are relegated to a separate tier, and the
domain-enum expansion is reconsidered. Scope A stands *as "fill the algebraic
MONOMIAL gaps,"* re-counted honestly. Owner-confirmed scope A (2026-07-03).

## r2 correction — the monomial-fit reality (the vet's core HIGH)

Both reviewers correctly caught that a large fraction of r1's example laws are
**not monomials** and would repeat the Phase-6 type-honesty error if forced into
the L0 `target = const · Π(gov_i^exp_i)` model:

- **Sums / differences** (NOT L0 monomials): Bernoulli (½ρv²+ρgh+P), thin-lens
  (1/f=1/dₒ+1/dᵢ), lensmaker, photoelectric (K=hf−W), energy-momentum
  (E²=(pc)²+(mc²)²), Q-value, Rydberg (1/λ ∝ 1/n₁²−1/n₂²), Carnot (1−T_c/T_h).
- **Transcendentals** (NOT monomials): decay (e^−λt), Boltzmann factor, Planck
  (e^x−1), Snell/Bragg/grating (sines), Compton (1−cosθ), damped-ω & γ
  (√ with an internal difference).
- **Genuine monomials** (fit L0 cleanly): v=fλ, ω=2πf, ρgh, continuity Av,
  Q=mcΔT, PV=NkT, Stefan-Boltzmann (T⁴), Wien, de Broglie (h/p), Bohr radius,
  Fermi energy, σ=nqμ, Coulomb, capacitance, drift velocity, Poiseuille,
  Stokes drag, thermal expansion, cross-section, activity, plasma freq, … —
  plus √-monomials as `dimensional` (SHM T∝√(m/k), the pendulum precedent).

**Honest count: ~50–70 genuine monomial laws, NOT ~110.** The non-monomial
relations are real physics but belong in a **separate L1-sum / L2 field-equation
tier** (their own later project), NOT force-fit into L0.

## GATING FIRST STEP — Task-0 monomial-fit audit (mandatory, before any encoding)

Produce `docs/research/canonical-expansion-candidate-audit.md`: a full candidate
list of the standard textbook laws across the target areas, EACH classified:
`monomial (fully-quantitative)` / `monomial-with-prefactor (scalar-up-to-constant)`
/ `fractional-monomial (dimensional)` / `NON-MONOMIAL → relegated to L1-sum/L2
tier` / `duplicate of existing`. This audit:
1. Yields the REAL monomial-compliant count and the honest per-batch list.
2. Decides the taxonomy (see below) from the actual law distribution.
3. Is the go/no-go: if the genuine-monomial yield in an area is tiny, that batch
   is dropped, not padded.

Only the audited monomial subset is encoded. Non-monomials are logged in the
audit as the L1-sum/L2 backlog.

**AUDIT DONE 2026-07-03** — `docs/research/canonical-expansion-candidate-audit.md`.
Result: **~61 monomial candidates (~50–55 net after de-dup)** — confirms the
vet's ~50–70, refutes r1's ~110. **3 new domains** (`fluids`, `nuclear`,
`condensed-matter`; waves→mechanics, optics→EM, atomic→quantum, relativity
dropped as all-non-monomial). **9 SDD batches**, pilot = condensed-matter (10
clean monomials, 0 non-monomial). Non-monomial physics (Bernoulli, Rydberg,
photoelectric, Compton, decay-exp, Planck, Snell/Bragg, the relativistic
γ-family, …) logged as the explicit L1-sum/L2 backlog. Optics + relativity are
documented as genuinely beyond the monomial L0 model.

## Domain taxonomy — reconsidered (Adam #3 / Eve #3)

The r1 "6 new enum values" is taxonomy inflation. r2: **add a new
`CanonicalDomain` value only where the audited monomial laws genuinely don't fit
an existing domain** — `fluids`, `nuclear`, and `condensed-matter` are plausibly
distinct; `atomic` folds into `quantum`, `waves`/`optics` into `mechanics`/
`electromagnetism` (waves are a cross-cutting phenomenon, classical optics is a
sub-field of EM). The audit's law distribution decides the minimal enum change.

## Quality gate — strengthened (Adam #4 / Eve #4)

Automatic dimensional validation only checks exponent consistency — it CANNOT
catch a wrong-but-dimensionally-consistent governing set (e.g. a missing ε₀, a
wrong μ). So: (a) a written **monomial-standard checklist** in the workflow;
(b) the per-batch Adam+Eve review explicitly verifies the GOVERNING SET and
prefactor of each entry against the cited source, not just the dimension;
(c) a **PILOT batch** (one clean domain) is encoded + reviewed first to validate
the process/standard before the rest.

---

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
