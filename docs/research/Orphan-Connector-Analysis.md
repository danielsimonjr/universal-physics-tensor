# Orphan-Connector Analysis — The Isolated-Bridge Frontier

> **Provenance:** 2026-06-15 (branch
> `claude/bridge-equations-specs-review-4mfy38`). Uses the v0.12 feature map —
> `upt connectors` (`proposeOrphanConnectors`), `upt discover`
> (`rankDiscoveries`), `upt predict`, `upt coverage`, and `upt symbolic` — to
> analyze the catalog's isolated bridges and propose / reject candidate
> cross-cluster identifications. Reproduce with `upt connectors`; pinned by
> `tests/composition/orphan-connectors.test.ts`.
>
> ⚠ **REVIEW SURFACE, not discovery.** Same dimension is a weak prior; every
> candidate's only path is human adjudication (Part-VI §XXVII-B). The honest
> result below is largely a *confirmation* plus a *quantified negative*, not a
> pile of new bridges.
>
> **⟳ Refreshed 2026-07-04 (v0.36.0).** The isolated-bridge frontier below is
> **catalog-derived and stable** (the 44-bridge catalog → 41 edges → 20 isolated
> is unchanged). What HAS grown is the *connector surface*: the canonical L-layer
> expanded 66 → 103 (v0.34.0 + the v0.35–0.36 L1-sum tier), so `upt connectors`
> now offers more same-dimension canonical targets for each orphan. Current CLI:
> **16 of the isolated bridges have a same-kind connector; 11 are truly
> unconnected** (`upt connectors`, `--source=both`). The qualitative conclusion —
> same-dimension is a weak prior, most candidates are decoys, the honest result
> is a quantified negative — is unchanged.

## Why a new view was needed

`upt discover` vets candidate identifications numerically, but its consistency
check needs a **physically-consistent** seed that propagates through the graph
(the default `{mass: M_sun}`). An experiment with a "rich" anchor — all 94 leaf
inputs set to arbitrary independent values — turned **all 132 candidates
contradictory**, because `be-42` and `be-42-via-rs` (and every other
over-determined node) agree only at a *consistent* mass/r_s, not at independent
arbitrary values. So the numeric channel is anchor-limited *by design*: reaching
a cluster requires a consistent seed for it, which is the very physics judgment
the tool defers to. The `{mass}` anchor therefore surfaces only
mass-reachable coincidences (`mass ≟ planck-mass`) and misses the motivated
candidates in other clusters.

The **structural** channel has no such limit. `proposeOrphanConnectors`
intersects the cross-cluster same-dimension candidates with the linkage map's
isolated/anchored partition: a *connector* is a candidate with one endpoint on
an **isolated** (single-edge) bridge and the other on an **anchored** cluster.
Accepting it would pull orphaned physics into the established core — the
catalog's real frontier (20 of 41 edges are isolated).

## The frontier, quantified

Of the **20 isolated bridges**, **7 have a same-kind connector** (a shared name
token — the stronger prior) to the anchored core; **12 are truly unconnected**
(no same-dimension bridge into them at all).

| Orphan | What it is | Same-kind connector → core | Physics verdict |
|---|---|---|---|
| **BE-15** | Hohenberg-Halperin Model A (dissipative coarsening) | `coarsening-length ≟ quantum-correlation-length` → BE-33 | **MOTIVATED** (= CI-1). The correlation length is *the* object shared across the Hertz-Millis quantum↔classical mapping; classical coarsening and quantum criticality are one dynamic-scaling universality (Kibble-Zurek, BE-34). |
| **BE-15** | (as above) | `time ≟ microscopic-relaxation-time` → BE-34 | **MOTIVATED** (= CI-2). Companion of CI-1 — the characteristic timescale of the same universality class. |
| **BE-22** | Topological entanglement entropy ↔ QG | `boundary-length ≟ quantum-correlation-length` → BE-33 | **REJECT.** A topological phase is *gapped* — TEE is a constant `−γ` independent of boundary size, and there is no diverging correlation length. Equating its entangling boundary with a QCP correlation length conflates a region size with a (here absent) physical scale. |
| **BE-24** | Förster resonance energy transfer (FRET) | `foerster-radius ≟ schwarzschild-radius` / `far/near-radius` → BE-42-via-rs/BE-51 | **REJECT** (the canonical decoy). A ~5 nm FRET distance is not a black-hole horizon or a lensing radius. Pure dimensional coincidence. |
| **BE-26** | DNA mutation via proton tunneling (WKB) | `tunneling-mass ≟ effective-mass` → BE-23; `mutation-rate ≟ decoherence-rate` → BE-11 | **REJECT.** BE-26's `tunneling-mass` is a *proton* (base-pair tautomerization); BE-23's `effective-mass` is a *strange-metal carrier*. Different particles, different systems — "same KIND" but not the same quantity. The rate identification is likewise too strong (mutation ≪ decoherence). |
| **BE-41** | Swampland distance / mass tower | `swampland-tower-mass ≟ mass / effective-mass / …` → BE-12/23 | **REJECT.** The `X ≟ mass` family — a specific mass equated with a generic one. The catalog deliberately keeps these distinct (`effective-mass ≠ mass`); promoting any needs the swampland framework, not a dimensional match. |
| **BE-45** | Trans-Planckian censorship (inflation) | `inflation-hubble-energy ≟ landauer-erasure-energy` → BE-16 | **FLAGGED, not recommended** (= CI-3). Both are characteristic energies bridging information thermodynamics and cosmology — the *kind* of link the catalog seeks — but different *scales*; most likely a context-specific relation, not a global identification. |
| **BE-47** | Primordial nucleosynthesis | `{neutron,proton,nucleon}-density ≟ carrier-density` → BE-23; `hubble-rate ≟ decoherence-rate` → BE-11 | **REJECT.** A cosmological baryon density is not a condensed-matter carrier density; the cosmic expansion rate is not a decoherence rate (the documented `decoherence-rate ≟ hubble-rate` decoy). |

## Findings

1. **CI-1 and CI-2 are confirmed as the only genuinely-motivated orphan
   connectors** — and the new structural view independently re-derives them
   (BE-15's coarsening length and time connecting to the Hertz-Millis /
   Kibble-Zurek criticality cluster). They remain the strongest candidates in
   the catalog and are already proposed in spec Part-IX §9.
2. **No NEW strongly-motivated candidate emerges.** Of the 7 connectable
   orphans, physics review rejects 5 outright (BE-22/24/26/41/47) as dimensional
   decoys or context-specific same-kind matches, and re-flags BE-45 as the
   already-recorded, not-recommended CI-3. This is a *quantified negative*: the
   orphan frontier is decoy-dominated, exactly as the dimensional audit's decoy
   finding predicts.
3. **The real frontier is the 12 unconnectable orphans** — BE-14, BE-17, BE-21,
   BE-25, BE-30, BE-36, BE-39, BE-43, BE-46, BE-49, BE-50, BE-53. These cannot be
   joined to the core by *identification* (no anchored quantity shares their
   dimensions), so they need **new bridges or new shared quantities**, not
   re-labeling. That is where catalog growth (and physicist attention) should go.

## Can CI-1 be mechanically checked? A corrected analysis (2026-06-15)

The tempting next step is to *symbolically compose* CI-1 with `composeSymbolic`,
as was done for CT-1. **On investigation this is the wrong framing**, and the
correction is itself a finding:

1. **CI-1 is an OVER-DETERMINATION, not a composition.** Both
   `coarsening-length` (BE-15) and `quantum-correlation-length` (BE-33) are
   *only ever targets* — neither is a source of any edge (verified over
   `CATALOG_GRAPH`). Identifying them therefore does **not** form a chain
   `BE-15 ∘ BE-33`; it merges two *independent derivations* of one node
   (Model-A dynamics from `{Γ, t}`; Hertz-Millis statics from
   `{ξ₀, T, T₀, ν, z}`). The right structural tool is the identifiability
   classifier's over-determined verdict + the retrodiction consistency check,
   **not** `composeSymbolic`.

2. **The consistency check encodes the physics it cannot supply.** The two
   derivations depend on *disjoint* input sets, so they agree only on the locus
   where a specific dynamic-scaling relation links the coarsening time `t` to
   the Hertz-Millis tuning `(T/T₀, ν, z)`. That relation **is** the physical
   content of CI-1 (dynamic-scaling universality). The retrodiction harness can
   only check agreement *given* a physically-consistent seed fixing both input
   sets to a coincident point — i.e., given the very relation under test. As the
   `{mass}`-vs-rich-anchor experiment showed, the tool cannot synthesize such a
   seed; it is the physicist's input.

3. **A symbolic encoding is additionally grammar-blocked.** Even setting (1)–(2)
   aside, BE-33/34 cannot get a `symbolic` form in the current scalar AST: their
   powers are the **critical exponents themselves** — `ξ = ξ₀·(T/T₀)^(−1/z)`,
   `n = (τ_Q/τ₀)^(−dν/(1+zν))·exp(…)` — i.e. *input-dependent* exponents, but the
   `^` arm admits only a numeric-literal exponent (BE-34 adds a transcendental
   `exp`). BE-15 alone *is* encodable (`coarsening-length = (Γ·t)^½`,
   dim-verified), but with nothing to compose it with, that is moot here.

**Corrected conclusion.** CI-1/CI-2 advance from "proposed" to "checkable" only
by a physicist's dynamic-scaling-universality judgment (adjudication checklist
(a): are they the *same observable*?), optionally formalized as a pre-registered
CT-style calibration that *supplies* the consistent criticality seed. More
tooling — symbolic composition included — cannot mechanically confirm them; the
framework's correct role here is exactly what it already does: surface CI-1/CI-2
as the strongest candidates and hand them to a physicist.

**Scoped grammar follow-on — DONE (2026-06-15).** Independently of CI-1, the
bounded AST extension landed (v0.13, Adam+Eve-vetted —
`docs/planning/v0.13-Symbolic-Exponent-Design.md`): the `^` arm now accepts a
symbolic (input-dependent) exponent on a **dimensionless** base — sound because
`dimensionless^(dimensionless) = dimensionless`. `be33Edge` consequently carries
the faithful `ξ_0·(T/T₀)^(−1/z)` symbolic form (previously the catalog pinned
z=1 to satisfy the literal-exponent grammar), dim-validated and drift-guarded.
This broadens symbolic-composition coverage to scaling-law bridges — but it does
NOT, by itself, make CI-1 checkable (per (1)–(2): CI-1 is an over-determination,
not a composition).

## Honest framing

This analysis proposes **nothing new** to register in `QUANTITY_IDENTIFICATIONS`
— it confirms the two standing proposals (CI-1/CI-2), rejects the rest with
grounded reasoning, and reframes the frontier. Manufacturing weak candidates to
pad a list would betray the project's discipline; the value here is the
reproducible tool, the grounded verdicts, and the redirection toward the 12
bridges that need new physics.
