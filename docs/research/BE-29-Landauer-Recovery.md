# BE-29 ≈ CE-landauer — the only undeclared structural recovery

> **Provenance:** 2026-06-18 (branch `claude/upt-physics-tensor-analysis-9s38dp`).
> Surfaced by `upt recover` (`scanLinkages` / `classifyLinkage` in
> `src/canonical/linkage.ts`). Reproduce with `upt recover`; the linkage scan is
> pinned by `tests/canonical/linkage.test.ts`.
>
> ⚠ **REVIEW SURFACE, not a discovery.** A structural match is "the same relation
> *up to a dimensionless factor*," and here that factor is physically
> substantive. The honest conclusion below is a **form-coincidence plus a
> registry gap**, not a new physical correspondence.

## What the scan found

Across the full bridge↔canonical scan, every structural match is either a
declared restatement (the `restatesBridge` F4 guard — BE-16≡Landauer,
BE-42≡Hawking) or `dimensional-only` (same dimension, different form). Exactly
**one** match is an *undeclared* structural correspondence:

```
CE-landauer  ~ bridge 29   (recovers; structuralMatch = true, recovery maxRelErr = 0)
```

`classifyLinkage('CE-landauer', 29)` returns `classification: 'recovers'`,
`dimMatch: true`, `structuralMatch: true`, `recovery: { tested: true,
maxRelErr: 0 }`. It is the only non-circular structural hit the validation
suite produces against standard physics.

## Why the forms match

Both relations are **`k_B · T · ln(dimensionless)`**:

| | relation | the `ln(·)` argument |
|---|---|---|
| **CE-landauer** | `E = k_B T ln 2` | `2` (erasing one bit) |
| **BE-29** (Jarzynski 1997) | `ΔF = −k_B T ln⟨exp(−W/k_B T)⟩` | `⟨exp(−W/k_B T)⟩` (work ensemble average) |

`structurallyEqual` (`src/canonical/normal-form.js`) treats the two `ln`
arguments — both encoded as dimensionless stubs (`ln2` vs BE-29's
ensemble-average stub) — as interchangeable dimensionless factors, so the two
ASTs normalise to the same `k_B·T·(dimensionless)` monomial and `maxRelErr`
collapses to 0 with the stubs held at 1.

## Why it is NOT a physical partnership

The "dimensionless factor up to which they agree" is `ln 2` versus
`ln⟨exp(−W/k_B T)⟩`. These are **not** the same quantity:

- **Landauer** `ln 2` is a fixed information-theoretic constant — the minimum
  free-energy cost of erasing one bit, isothermal and quasi-static.
- **Jarzynski** `ln⟨exp(−W/k_B T)⟩` is a *functional of the work distribution*
  of an arbitrary non-equilibrium protocol; it equals `−ΔF/k_B T` exactly for
  any protocol and is the definiendum of the free-energy equality, not a
  constant.

So the match is the **generic `k_B T ln(·)` thermodynamic form** shared by any
energy↔entropy relation, not a correspondence between Landauer erasure and
Jarzynski work. The same caveat the `upt recover` banner prints ("that factor
may itself be physically substantive — e.g. `⟨e^−βW⟩`") applies in full force
here, and BE-29's own catalog entry is explicit that its bridge framing is the
(dropped) curved-spacetime gravitational-work extension, unrelated to Landauer.

This is also *why* the F4 guard leaves it as `recovers` rather than
`restates-canonical`: CE-landauer's `restatesBridge` is `'16'`, and nothing in
the registry declares CE-landauer ↔ BE-29. The guard is behaving correctly — the
match is real at the AST level and spurious at the physics level.

## Recommendation (for physicist review)

1. **Do not** add BE-29 to `CE-landauer.partnerBridges`. That field is
   "the bridge this law is the intended correspondence partner for," and BE-29
   is not a Landauer partner; the link is a shared functional form.
2. **The real gap:** BE-29 has no canonical partner of its own (it is one of the
   37 catalog bridges without one — see `upt canonical`). Its correct partner is
   a **canonical Jarzynski equality** entry, e.g. `CE-jarzynski`
   (`ΔF = −k_B T ln⟨exp(−W/k_B T)⟩`, `epistemicStatus: 'fully-quantitative'`,
   `references: ['Jarzynski 1997 PRL 78:2690']`, `partnerBridges: ['29']`).
   Adding it would (a) give BE-29 its true L-layer ground truth, and (b) let the
   scan reclassify the BE-29↔Jarzynski link as the genuine partnership while the
   BE-29↔Landauer hit stays the form-coincidence it is.
3. **Optional hardening:** the `k_B T ln(stub)` collapse shows `structurallyEqual`
   cannot distinguish two different dimensionless `ln` arguments. If future
   catalog growth produces more `k_B T ln(·)` laws, consider tagging the stub
   identity (e.g. `ln2` vs an ensemble-average stub) so the normal form stops
   conflating distinct dimensionless interiors.

Adding `CE-jarzynski` is a registry change with physics content (a new L1 entry
with its own scalar-AST), so it is left as a **reviewed proposal** here rather
than applied — consistent with the catalog's "physicist adjudicates registry
claims" discipline.
