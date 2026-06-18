# Canonical Equation Registry — Sub-project A Design

> Design artifact (brainstorm output). This is **Sub-project A** of a four-part
> program to deliver UPT's founding premise: use the tensor to *validate*
> existing equations against standard physics and *discover* new bridge
> candidates. Implementation plan (bite-sized tasks) follows separately.

## Program context (A–D)

| Sub-project | Deliverable | Depends on |
|---|---|---|
| **A. Canonical registry + encodings** *(this doc)* | `CanonicalEquation` type + registry, populated into the tensor L-layer; promote existing encodings; encode a first tranche. | — |
| B. Bridge↔canonical linkage | Numerical-recovery + structural-containment checks ("validate against standard physics"). | A |
| C. Discovery filter upgrade | Canonical "kinds" screen the `discover`/`candidates` numerology. | A |
| D. CLI + research surfacing | `upt canonical` / `upt recover`; regenerate novel-candidate docs. | A, B |

Sub-project A is **data + structure only**. It deliberately does *not* implement
the bridge↔canonical checks — those are B, and keeping them out of A keeps A
shippable and reviewable on its own.

## Goal

A single, queryable registry of **canonical (textbook) physics equations** that:
1. lives in the tensor's **L-layer** (`Π = L + B + E`; the `addLaw` diagonal
   cells, currently empty of real encoded equations);
2. **unifies** the canonical physics already encoded in scattered places (the
   9-case dimensional-derivation benchmark; the `EinsteinFieldEquationNode` /
   Friedmann / Ricci / gauge-field nodes);
3. **extends** that set with a first tranche of new entries chosen to cover the
   bridges that need a correspondence partner;
4. is **consumable** by the tensor, the CLI, and (later) the discovery and
   linkage layers — not a test-only fixture.

This is the ground truth that turns "validate the current equations" from
*"the units balance"* into *"this recovers known physics,"* and that gives the
discovery loop a filter stronger than shared dimensions.

## Keystone architecture: fidelity levels

"Encode all of physics" is tractable only if the registry stores equations at
**multiple fidelity levels**, because the scalar grammar cannot express Dirac or
Navier–Stokes today — but it *can* express their dimensional content now.

| Level | Representation | Reuses | Example equations |
|---|---|---|---|
| **L0 — dimensional** | target dim + governing vars (+ π-structure) | `dimensionallyDetermines`, `buckinghamPi` (the benchmark engine) | every canonical equation |
| **L1 — scalar AST** | an `ExprNode` RHS | the existing dimensional `validator` | Coulomb, Newton gravity, Bekenstein–Hawking, Landauer, Stefan–Boltzmann |
| **L2 — field-equation node** | tensor/PDE predicate node | `EinsteinFieldEquationNode`, anticipated `MaxwellEquationNode`/`KleinGordonEquationNode` | EFE, Friedmann; Maxwell/KG if cheap |

Rules:
- A `CanonicalEquation` carries **whichever levels it can** (L0 is mandatory;
  L1/L2 optional).
- Later linkage (B) runs at the **highest level a bridge and a canonical
  equation share**.
- Equations needing **new** node kinds (Dirac → spinors; Navier–Stokes →
  nonlinear vector PDE; Lindblad → superoperator) are encoded at **L0 only** in
  this tranche; deepening them is deferred to dedicated grammar-extension specs.
  No grammar work is on A's critical path.

## Data structure

```ts
// src/canonical/canonical-equation.ts  (new module dir: src/canonical/)
export interface CanonicalEquation {
  /** Stable id, e.g. 'CE-newton-gravitation'. */
  readonly id: string;
  /** Display name. */
  readonly name: string;
  /** Physics domain (for indexing + the future kind filter). */
  readonly domain:
    | 'mechanics' | 'gravitation' | 'general-relativity' | 'cosmology'
    | 'electromagnetism' | 'quantum' | 'thermodynamics' | 'statistical'
    | 'information';
  /** LaTeX rendering (display only). */
  readonly formula_latex: string;

  /** L0 — always present. */
  readonly dimensional: {
    readonly target: DimensionalVariable;
    readonly governing: readonly DimensionalVariable[];
    /** Textbook monomial exponents, when the form is dimensionally determined
     *  (null for equations with ≥1 free dimensionless group). */
    readonly monomial: Readonly<Record<string, number>> | null;
  };
  /** L1 — optional scalar-AST RHS (validated to `dimensional.target`). */
  readonly scalarAst?: ExprNode;
  /** L2 — optional field-equation predicate node. */
  readonly fieldEquation?: FieldEquationNode;

  /** Regime coordinates for the L-layer cell it occupies (scale, force, …). */
  readonly regime: TensorIndices;
  /** Sources (citations / textbook refs). */
  readonly references: readonly string[];
  /** Bridges this canonical law is the intended correspondence partner for
   *  (advisory; the actual check is Sub-project B). */
  readonly partnerBridges: readonly string[];
}
```

Registry surface (parallel to `BRIDGE_EQUATIONS` / `BRIDGE_RHS_BY_ID`):

```ts
export const CANONICAL_EQUATIONS: readonly CanonicalEquation[];
export const CANONICAL_BY_ID: Readonly<Record<string, CanonicalEquation>>;
export function canonicalById(id: string): CanonicalEquation | undefined;
export function canonicalByDomain(domain): readonly CanonicalEquation[];
```

## L-layer integration

`UniversalTensor.addLaw(law)` already populates diagonal cells. A small adapter
`canonicalToLaw(ce: CanonicalEquation): PhysicalLaw` maps a registry entry to the
existing `PhysicalLaw` shape and seeds the L-layer, so `populatedCells()` /
`getStats()` finally report a non-empty L. **No change to `tensor.ts`'s public
contract** — we feed it through the existing `addLaw`.

## First tranche (~16 equations)

**Promoted from existing encodings** (no new physics, just lifted into the registry):

| id | name | level | partner bridges |
|---|---|---|---|
| CE-pendulum-period | Pendulum period | L0 | — |
| CE-kepler-third | Kepler's third law | L0 | — |
| CE-schwarzschild-radius | Schwarzschild radius | L0 | BE-42-via-rs (graph law) |
| CE-string-wave-speed | Wave speed on a string | L0 | — |
| CE-planck-length / -mass / -time | Planck units | L0 | BE-41 (planck-mass) |
| CE-compton-wavelength | Compton wavelength | L0 | — |
| CE-thermal-de-broglie | Thermal de Broglie wavelength | L0/L1 | **BE-12** |
| CE-einstein-field-eq | Einstein field equations | L2 | **BE-13, BE-20, BE-51, BE-52** |
| CE-friedmann | Friedmann equation | L2 | cosmology bridges |

**New entries, chosen for bridge-coverage + domain breadth:**

| id | name | level | partner bridges |
|---|---|---|---|
| CE-bekenstein-hawking | `S = k_B c³ A / (4 G ℏ)` | L1 | **BE-21, BE-42** |
| CE-landauer | `E = k_B T ln2` | L1 | **BE-16** |
| CE-newton-gravitation | `F = G m₁ m₂ / r²` | L1 | gravitational bridges |
| CE-coulomb | `F = q₁ q₂ / (4πε₀ r²)` | L1 | (EM domain breadth) |
| CE-stefan-boltzmann | `j = σ T⁴` | L1 | thermo/radiation bridges |

**Explicitly L0-only this tranche** (need grammar later): Maxwell & Klein–Gordon
at L2 *only if* the anticipated nodes are cheap to wire; otherwise L0. Dirac,
Navier–Stokes, Lindblad → L0 only, deepening deferred.

Overlap with existing bridges (Landauer≡BE-16, thermal-de-Broglie≡BE-12,
Bekenstein–Hawking≈BE-21/42, Schwarzschild≡graph law) is **intentional**: the
canonical entry is the textbook ground truth; the bridge is the *claim*; the
recovery check (B) verifies the bridge reproduces the canonical form.

## Testing strategy

- **Round-trip (mirrors the bridge catalog):** every L1 `scalarAst` validates to
  its declared `dimensional.target`; every L0 `monomial` (when non-null) is
  reproduced by `dimensionallyDetermines` (reuses the benchmark engine — the
  9 promoted cases keep their existing assertions, now sourced from the registry).
- **L2 nodes** validate via the existing field-equation predicate validators.
- **Registry invariants:** unique ids; every entry has ≥1 reference; `regime`
  coordinates are valid `TensorIndices`; `partnerBridges` reference real BE ids.
- **L-layer:** after seeding, `tensor.getStats()` reports the expected non-zero
  law count and the cells are queryable.
- **No fabrication:** the benchmark's "dimensions recover exponents only, not the
  leading constant" honesty carries over — L0 entries never claim a prefactor.

## Out of scope for A (named, so it isn't silently assumed)

- Bridge↔canonical **recovery / containment / reduction-limit** checks → B.
- Discovery **kind-filter** using canonical membership → C.
- New CLI commands → D.
- Grammar extensions for Dirac / Navier–Stokes / Lindblad → separate specs.

## Open questions for Adam + Eve (physics adversarial vet)

1. Is the **L0/L1/L2 fidelity split** physically coherent, or does it create
   equations that are "validated" at L0 in a way that misleads (e.g. an L0-only
   Lindblad entry implying more than dimensions warrant)?
2. Is the **first-tranche selection** the right ground-truth set to partner the
   bridges, or are there higher-value canonical partners we're missing
   (esp. for the 25 OPEN bridges with free dimensionless groups)?
3. Are the **L1 forms** correct and unambiguous as written (Bekenstein–Hawking
   `S = k_B c³A/4Gℏ`, Landauer `k_B T ln2`, Stefan–Boltzmann `σT⁴`)?
4. Does encoding Bekenstein–Hawking / Landauer / thermal-de-Broglie as canonical
   ground truth **when they are also bridges** create a circularity that would
   make the later recovery check (B) vacuous?
