# Canonical Equation Registry — Sub-project A Design

> Design artifact (brainstorm output, **revised post Adam+Eve review** — see
> `Canonical-Equation-Registry-A-Review-Findings.md`). This is **Sub-project A**
> of a four-part program to deliver UPT's founding premise: use the tensor to
> *validate* existing equations against standard physics and *discover* new
> bridge candidates. Implementation plan (bite-sized tasks) follows separately.

## Program context (A–D)

| Sub-project | Deliverable | Depends on |
|---|---|---|
| **A. Canonical registry + encodings** *(this doc)* | `CanonicalEquation` type + registry, populated into the tensor L-layer; promote existing encodings; encode a first tranche. | — |
| B. Bridge↔canonical linkage | Numerical-recovery + structural-containment checks ("validate against standard physics"). | A |
| C. Discovery filter upgrade | Canonical "kinds" screen the `discover`/`candidates` numerology. | A |
| D. CLI + research surfacing | `upt canonical` / `upt recover`; regenerate novel-candidate docs. | A, B |

Sub-project A is **data + structure only**. It deliberately does *not* implement
the bridge↔canonical checks — those are B. Keeping them out of A keeps A
shippable and reviewable on its own; A only *carries the data B needs* (the
provenance + epistemic fields below).

## Goal

A single, queryable registry of **canonical (textbook) physics equations** that:
1. lives in the tensor's **L-layer** (`Π = L + B + E`; the `addLaw` diagonal
   cells, currently empty of real encoded equations);
2. **unifies** the canonical physics already encoded in scattered places (the
   9-case dimensional-derivation benchmark; the `EinsteinFieldEquationNode` /
   Friedmann / Ricci / gauge-field nodes);
3. **extends** that set with a first tranche chosen so every analytically
   relevant bridge has a canonical correspondence partner;
4. is **consumable** by the tensor, the CLI, and (later) the discovery and
   linkage layers — not a test-only fixture.

This is the ground truth that turns "validate the current equations" from
*"the units balance"* into *"this recovers known physics,"* and gives the
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
- A `CanonicalEquation` carries **whichever levels it can** (L0 mandatory;
  L1/L2 optional).
- Later linkage (B) runs at the **highest level a bridge and a canonical
  equation share**.
- Equations needing **new** node kinds (Dirac → spinors; Navier–Stokes →
  nonlinear vector PDE; Lindblad → superoperator) are encoded at **L0 only** in
  this tranche; deepening them is deferred to dedicated grammar-extension specs.
  No grammar work is on A's critical path.

### Anti-overclaim discipline (review finding F1)

L0 is a *weak* statement: a Buckingham-π form with ≥1 free dimensionless group is
underdetermined (any function of the free groups passes). The registry therefore
records, and consumers must honor:

- `epistemicStatus: 'dimensional' | 'scalar-up-to-constant' | 'fully-quantitative'`
  — the **highest** claim the entry actually supports.
- `freeDimensionlessGroups: number` — `0` only when the L0 monomial is fully
  determined; ≥1 means dimensions cannot pin the form.

Consumers (discovery, linkage, CLI) **must not use an entry above its
`epistemicStatus`**, and must not treat a bridge that "derives" an entry with
`freeDimensionlessGroups ≠ 0` as having pinned it. The CLI states the fidelity
level of every check ("dimensionally consistent (L0)"); there is **no generic
'validated' flag**.

## Data structure

```ts
// src/canonical/canonical-equation.ts  (new module dir: src/canonical/)
export interface CanonicalEquation {
  readonly id: string;                  // e.g. 'CE-newton-gravitation'
  readonly name: string;
  readonly domain:
    | 'mechanics' | 'gravitation' | 'general-relativity' | 'cosmology'
    | 'electromagnetism' | 'quantum' | 'thermodynamics' | 'statistical'
    | 'information';
  readonly formula_latex: string;

  // ── epistemic honesty (F1) ──────────────────────────────────────────────
  readonly epistemicStatus:
    | 'dimensional' | 'scalar-up-to-constant' | 'fully-quantitative';
  readonly freeDimensionlessGroups: number; // 0 ⇒ monomial fully determined

  // ── L0 (always present) ─────────────────────────────────────────────────
  readonly dimensional: {
    readonly target: DimensionalVariable;
    readonly governing: readonly DimensionalVariable[];
    readonly monomial: Readonly<Record<string, number>> | null; // null ⇒ free groups
  };
  // ── L1 / L2 (optional) ──────────────────────────────────────────────────
  readonly scalarAst?: ExprNode;          // validated to dimensional.target
  readonly fieldEquation?: FieldEquationNode;

  // ── disambiguation (F3) ─────────────────────────────────────────────────
  readonly forms?: {
    readonly areaOrRadius?: 'area' | 'radius';     // Bekenstein–Hawking ⇒ 'area'
    readonly logBase?: 'e' | '2' | '10';           // Landauer ⇒ 'e'
    readonly quantityKind?: 'flux' | 'power' | 'energy'; // Stefan–Boltzmann ⇒ 'flux'
  };

  // ── placement + provenance ──────────────────────────────────────────────
  readonly regime: TensorIndices;          // L-layer cell coordinates
  readonly assumptions: readonly string[]; // e.g. ['blackbody equilibrium'] (F-extra)
  readonly references: readonly string[];
  /** Bridges this law is the intended correspondence partner for (advisory
   *  signpost; the actual check is Sub-project B). */
  readonly partnerBridges: readonly string[];
  /** Set when this canonical law is LITERALLY a bridge's own relation (BH≡BE-21,
   *  Landauer≡BE-16, …). B uses it to discount the trivial X≡X match (F4). */
  readonly restatesBridge?: string;
}
```

Registry surface (parallel to `BRIDGE_EQUATIONS` / `BRIDGE_RHS_BY_ID`):

```ts
export const CANONICAL_EQUATIONS: readonly CanonicalEquation[];
export const CANONICAL_BY_ID: Readonly<Record<string, CanonicalEquation>>;
export function canonicalById(id: string): CanonicalEquation | undefined;
export function canonicalByDomain(domain): readonly CanonicalEquation[];
```

## Constants (review finding: shared registry)

L1/L2 ASTs reference physical constants **by id** from the existing
`src/composition/symbolic-constants.ts` (ħ, c, G, k_B, e, ln2, π, …) — **extended**
here with what the tranche needs (ε₀; σ as a *derived* `(2π⁵k_B⁴)/(15c²h³)`, not an
opaque literal). No constant is hard-coded inside an `ExprNode`. Composite
constants are expanded to fundamentals so the form is reasoned-from, not asserted.

## Circularity resolution (review finding F4)

Overlap between canonical entries and bridges (Landauer≡BE-16,
thermal-de-Broglie≡BE-12, Bekenstein–Hawking≈BE-21/42, Schwarzschild≡graph law)
is *intended* — the canonical entry is the textbook answer key, the bridge is the
claim. But a naïve recovery check would just confirm `X≡X`. A enforces:

1. **Namespace separation** — canonical entries live in **L**; discovery and
   linkage may **read** L, never **write** it.
2. **Provenance** — `restatesBridge` marks entries that are literally a bridge's
   own relation; `partnerBridges` is advisory only.
3. **Constraint carried into B** (documented in A because A's data must support
   it): B hashes the bridge AST and the canonical AST **up to dimensionless
   factors**; an identical hash on a `restatesBridge` pair is reported as
   `restates-canonical` and does **not** count as a recovery "discovery." A real
   recovery is a bridge *deriving* the canonical form via composition / limit.

## First tranche (~24 equations)

**Promoted from existing encodings** (lifted into the registry, no new physics):

| id | name | level | partner |
|---|---|---|---|
| CE-pendulum-period | Pendulum period | L0 | — |
| CE-kepler-third | Kepler's third law | L0 | — |
| CE-schwarzschild-radius | Schwarzschild radius | L0 | graph law (`restatesBridge`) |
| CE-string-wave-speed | Wave speed on a string | L0 | — |
| CE-planck-length / -mass / -time | Planck units | L0 | BE-41 (mass) |
| CE-compton-wavelength | Compton wavelength | L0 | — |
| CE-thermal-de-broglie | Thermal de Broglie wavelength | L0/L1 | **BE-12** (`restatesBridge`) |
| CE-einstein-field-eq | Einstein field equations | L2 | **BE-13/20/51/52** |
| CE-friedmann | Friedmann equation | L2 | cosmology bridges |

**New entries (bridge-coverage + domain breadth):**

| id | name | level | partner |
|---|---|---|---|
| CE-bekenstein-hawking | `S = k_B c³ A /(4 G ℏ)` (**area**) | L1 | **BE-21/42** (`restatesBridge`) |
| CE-landauer | `E = k_B T ln2` (**base-e**) | L1 | **BE-16** (`restatesBridge`) |
| CE-newton-gravitation | `F = G m₁ m₂ / r²` | L1 | gravitational bridges |
| CE-coulomb | `F = q₁ q₂ /(4π ε₀ r²)` | L1 | EM bridges |
| CE-stefan-boltzmann | `j = σ T⁴` (**flux**) | L1 | thermal/radiation bridges |
| CE-ideal-gas | `P V = N k_B T` | L1 | kinetic/thermo bridges |
| CE-planck-einstein | `E = h ν` | L1 | quantum bridges |
| CE-de-broglie | `λ = h / p` | L1 | quantum bridges |
| CE-bohr-radius | `a₀ = 4π ε₀ ℏ² /(mₑ e²)` | L1 | atomic bridges |
| CE-wien | `λ_max T = b` | L1 | radiation bridges |
| CE-lorentz-force | `F = q v B` (magnitude; full vector L2 deferred) | L1 | EM bridges |
| CE-maxwell-gauss | Gauss's law `∇·E = ρ/ε₀` | L2 if cheap, else L0 | EM bridges |

**Coverage rule (F2):** every **OPEN** bridge (≥1 free dimensionless group) must
have ≥1 canonical partner sharing its dimensional hull. Bridges with no partner
after this tranche are flagged **`on-hold`** and logged — never silently treated
as covered. The tranche is sized to satisfy this rule for the current OPEN set;
gaps it can't close are reported, not hidden.

**L0-only this tranche** (need grammar later): Dirac, Navier–Stokes, Lindblad.

## Testing strategy

- **Round-trip:** every L1 `scalarAst` validates to its `dimensional.target`;
  every L0 `monomial` (when non-null) is reproduced by `dimensionallyDetermines`
  (the 9 promoted cases keep their assertions, now sourced from the registry).
- **Numeric-prefactor tests (F3):** substitute canonical defaults and assert the
  leading constant — M☉ Bekenstein–Hawking entropy; Landauer `k_B·300·ln2`;
  Stefan–Boltzmann flux at T=5778 K. These catch area-vs-radius, log-base, and
  flux-vs-power slips that dimensional validation cannot.
- **Epistemic invariants (F1):** `epistemicStatus` never exceeds the encoded
  level; `freeDimensionlessGroups = 0` ⇔ `monomial !== null`.
- **Provenance/circularity (F4):** every `restatesBridge` references a real BE id;
  every `partnerBridges` entry is a real BE id.
- **Coverage (F2):** a test enumerates OPEN bridges and asserts each has a partner
  or is on the explicit `on-hold` list.
- **L-layer:** after seeding, `tensor.getStats()` reports the expected non-zero
  law count and the cells are queryable.
- **No fabrication:** L0 entries never claim a prefactor (dimensions give
  exponents only); the CLI never prints "validated".

## Out of scope for A (named, so it isn't silently assumed)

- Bridge↔canonical **recovery / containment / reduction-limit** checks → B
  (A only carries the `restatesBridge` / `epistemicStatus` data B consumes).
- Discovery **kind-filter** using canonical membership → C.
- New CLI commands → D.
- Grammar extensions for Dirac / Navier–Stokes / Lindblad → separate specs.

## Status

Adam + Eve: **YELLOW → fixes folded in** (this revision). Ready for user review,
then `writing-plans` for the bite-sized implementation plan.
