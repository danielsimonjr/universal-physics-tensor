# Part XI — Proposed Equations (machine-derived, UNADJUDICATED)

> **Status: NON-NORMATIVE review surface.** Every equation in this Part is
> **machine-derived** by the identity-consequence surfacer
> (`src/composition/proposed-bridges.ts`, `upt discover --derive`) and carries
> `status: 'unadjudicated'`. **None is a bridge equation, a law, or validated
> physics.** Each is the *algebraic consequence* of a hypothesised quantity
> identification the discovery funnel flagged as `promising` — a dimensional
> coincidence with **no asserted mechanism and no independent literature**. These
> entries are deliberately kept OUT of the 44-entry `BRIDGE_EQUATIONS` catalog
> (Part II); promotion of any one into the catalog requires the Status-Promotion
> Protocol (Part VI §XXVII-B): an adversarial + literature review recorded via
> `promoteProposal({citation, status, reviewRef})`. Where this Part and the code
> disagree, the code (`src/`) plus its test suite is authoritative.

## 1. What this Part is

The discovery funnel (`upt discover`) hypothesises identifications `a ≡ b` between
two equal-dimension quantities and vets each for structural and numerical
consequence. When both `a` and `b` are the *targets* of monomial equations
(canonical `CE-*` or a bridge edge with a clean-monomial `symbolic` form), the
identity makes their right-hand sides equal, and eliminating the shared quantity
yields one new relation among the union of their inputs. The surfacer derives that
relation by exact monomial division and records it here.

This is **not** equation discovery in the sense of new physics. By construction
the output is an algebraic restatement of a conjunction of two *existing*
equations under an *unadjudicated* identity. Its only claim is dimensional
consistency; its value is to put the consequence in front of a physicist to judge.

Admissibility (both source equations): a determinate monomial form, a closed
constant prefactor (canonical `epistemicStatus: 'fully-quantitative'`, or a bridge
`symbolic` monomial with no operator-valued stub), and — for the listing below —
the widest source scope, `upt discover --source=both --derive` (catalog ∪ canonical).

## 2. Catalog of proposed equations

Snapshot of **2 proposed equations** (regenerate with the command in §4; the count
is a measurement, not a fixed cardinality). The set is currently **saturated at 2**
for `--source=both` (1 for `--source=canonical`): it is invariant under the
discovery knobs — `--max-orders` (3 → 30) and `--anchor` reshape the candidate
funnel (e.g. `--max-orders=12` lifts promising candidates 43 → 50) but add no
proposal, because every additional promising candidate pairs a clean-monomial
source with a non-monomial one. Growing the count requires new clean closed-form
(monomial) relations that pair *cross-cluster* with an existing one — physics
content, not tuning.

| ID | Derived relation | [dim] | From identification | Sources |
|---|---|---|---|---|
| PE-1 | `ν = k_B · ln2 · T / h` | [frequency] | `erasure-energy ≡ photon-energy` | CE-landauer, CE-planck-einstein |
| PE-2 | `T = v · g / (k_B · ln2)` | [temperature] | `dark-fermion-mass ≡ erasure-energy` | BE-18, CE-landauer |

---

### PE-1 — "Landauer photon"

- **Derived relation:** `ν = (k_B · ln₂ · T) / h`  →  `nu = \frac{k_B \cdot ln2 \cdot temperature}{h}`
- **Dimensional signature:** `[frequency]`  (verified: `validate(ast).inferredDimension`)
- **Solved for:** `nu` (photon frequency). Free input: `temperature`. Invertible.
- **Derivation:** Landauer's erasure bound `E = k_B T ln2` (`CE-landauer`) and the
  Planck–Einstein relation `E = h ν` (`CE-planck-einstein`) are identified through
  `erasure-energy ≡ photon-energy`; eliminating the shared energy gives the
  frequency of a photon whose quantum equals one bit's erasure cost,
  `ν = k_B T ln2 / h`.
- **Bridged regimes:** information ↔ quantum.
- **Also derivable from:** `landauer-erasure-energy ≡ photon-energy` (the bridge
  BE-16 form of Landauer's bound yields the identical relation; the two collapse
  under normal-form dedup).
- **Numeric illustration (NOT a prediction):** at `T = 300 K`, `ν ≈ 4.33 × 10¹² Hz`
  (≈ 4.33 THz).
- **References (honest):** machine-derived — the combined relation has no
  independent literature. Source equations: `CE-landauer` (Landauer 1961);
  `CE-planck-einstein` (Planck 1900; Einstein 1905).
- **Known issue:** `phenomenological-ansatz` — a dimensional coincidence with no
  mechanism; pending §XXVII-B review before any catalog promotion.

### PE-2 — dark-fermion / erasure temperature

- **Derived relation:** `T = (v · g) / (k_B · ln₂)`  →  `temperature = \frac{vacuum-expectation-value \cdot yukawa-coupling}{k_B \cdot ln2}`
- **Dimensional signature:** `[temperature]`
- **Solved for:** `temperature`. Free inputs: `vacuum-expectation-value` (v),
  `yukawa-coupling` (g). Invertible.
- **Derivation:** the hidden-sector mass relation `m_dark = g · v` (`BE-18`, the
  first machine-usable bridge symbolic form) and Landauer's bound `E = k_B T ln2`
  (`CE-landauer`) are identified through `dark-fermion-mass ≡ erasure-energy`;
  eliminating the shared energy gives the temperature at which one bit's erasure
  cost equals the dark-fermion mass-energy, `T = g v / (k_B ln2)`.
- **Bridged regimes:** field-A ↔ field-B (BE-18, speculative) ↔ information.
- **Also derivable from:** `landauer-erasure-energy ≡ dark-fermion-mass` (via the
  BE-16 bridge form of Landauer's bound; collapses under dedup).
- **Numeric illustration (NOT a prediction):** with `g ≈ 1` and `v` at the
  electroweak scale (246 GeV ≈ 3.94 × 10⁻⁸ J), `T ≈ 4.12 × 10¹⁵ K` — i.e. the
  electroweak energy scale expressed as a temperature.
- **References (honest):** machine-derived — no independent literature for the
  combined relation. Source equations: `BE-18` (Peskin & Schroeder 1995 §20.1;
  arXiv:1311.0029; arXiv:2005.01515; PDG 2022 — the VEV/Yukawa mass-generation
  references carried by the bridge); `CE-landauer` (Landauer 1961).
- **Known issue:** `phenomenological-ansatz` — a cross-sector dimensional
  coincidence (a hidden-sector mass set equal to a thermodynamic erasure cost) with
  no mechanism; the `dark-fermion-mass` source is itself a `speculative` bridge.
  Pending §XXVII-B review.

## 3. Epistemic firewall (why these are not in Part II)

The surfacer cannot author physics, only restate it under a hypothesis, so the
implementation enforces:

1. **Separate registry.** Proposals live in `PROPOSED_BRIDGES` /
   `ProposedBridgeEntry`, never in `BRIDGE_EQUATIONS`; the generator is pinned not
   to mutate the catalog (reference-identity + content-hash test).
2. **Distinct status.** `status: 'unadjudicated'` is **not** a
   `BridgeEquationStatus`, so a proposal is not assignable where a catalog entry is
   expected, and the type omits every physics-judgment field.
3. **No fabricated literature.** `references` is a derivation note plus the *source*
   equations' citations, clearly tagged — never an unqualified citation for the
   derived relation.
4. **Gated promotion.** `promoteProposal` throws unless given a `{citation, status,
   reviewRef}`, operationalising "null, not guessed".
5. **No graph feedback.** A proposal is never added to a composition graph, so a
   coincidence cannot re-enter discovery as an input.

## 4. Regeneration

```bash
npm run build
node bin/upt.mjs discover --source=both --derive   # full catalog ∪ canonical scope
node bin/upt.mjs discover --source=canonical --derive   # standard-physics-only subset
# discovery knobs (reshape the candidate funnel; do NOT change the proposal set):
node bin/upt.mjs discover --source=both --derive --max-orders=12   # looser magnitude gate
node bin/upt.mjs discover --source=both --derive --anchor=mass=1.673e-27   # atomic-scale anchor
```

The registry and renderer are `deriveProposedBridges` / `toProposedEntry` in
`src/composition/proposed-bridges.ts`, pinned by
`tests/composition/proposed-bridges.test.ts`. Design, implementation plan, and the
Adam+Eve adversarial review: `docs/planning/v0.24.0-{Design,Implementation-Plan,Review-Findings}.md`.
This Part is a snapshot; the code and its tests are authoritative.
