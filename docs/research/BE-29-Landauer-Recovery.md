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
>
> **UPDATE (2026-06-18, same branch):** recommendation 3 below has since been
> **applied** — `normal-form.ts` now tags dimensionless *stubs* (named
> non-constant symbols like `ln⟨e^−βW⟩`) distinctly from droppable *constants*
> (`ln2`, `6pi`, …). As a result the CE-landauer ↔ BE-29 hit is **no longer a
> `recovers`**; the scan now reports it as `dimensional-only` (same dimension,
> genuinely different relation), which is the correct verdict this note argued
> for. The sections below are preserved as the analysis that motivated the fix;
> "recovers" now reads "the match the *pre-fix* scan reported."

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
2. **The real gap (RESOLVED 2026-06-18):** BE-29 had no canonical partner of its
   own (it was one of the 37 catalog bridges without one). A canonical Jarzynski
   entry **`CE-jarzynski`** is now in the registry
   (`ΔF = −k_B T ln⟨exp(−W/k_B T)⟩`, domain `statistical`,
   `epistemicStatus: 'scalar-up-to-constant'` — the leading dimensionless factor
   `ln⟨exp(−βW)⟩` is an ensemble functional, not a universal constant, so the
   honest claim is the form up to that factor; `references: ['Jarzynski 1997 PRL
   78:2690']`, `partnerBridges: ['29']`, `restatesBridge: '29'`). The scan now
   reports `CE-jarzynski ≡ bridge 29` as a **declared restatement** (BE-29's true
   L-layer ground truth) while `CE-landauer ~ bridge 29` is now
   `dimensional-only` (see recommendation 3). The coverage gap drops 37 → 36.
3. **Stub-identity tagging (APPLIED 2026-06-18):** the `k_B T ln(stub)` collapse
   showed `structurallyEqual` could not distinguish two different dimensionless
   `ln` arguments — it dropped *every* dimensionless symbol, not only constants.
   `normal-form.ts` now keeps a dimensionless symbol that is NOT a recognized
   constant (a numeric literal, a registered constant, a `\d*pi`, or the
   spelled-out `ln_2_constant`) as a distinct `stub:<name>` token. So
   `ln⟨e^−βW⟩` no longer collapses onto `ln2`, the two BE-29 form-coincidences
   (CE-landauer ~ 29 and CE-jarzynski ~ 16) demote to `dimensional-only`, and the
   three declared restatements (Landauer↔16, Hawking↔42, Jarzynski↔29) are
   preserved. Pinned by `tests/canonical/normal-form.test.ts` (the functional-
   stub-≠-constant case) and `tests/canonical/linkage.test.ts`.

`CE-jarzynski` is a registry change with physics content (a new L1 entry with
its own scalar-AST). It was applied on 2026-06-18 because the Jarzynski equality
is uncontested canonical statistical mechanics serving as BE-29's *own* ground
truth (the `restatesBridge` case), not a speculative cross-domain claim — the
conservative `scalar-up-to-constant` status keeps the encoding honest about the
ensemble-functional factor. Recommendations 1 and 3 remain physicist surfaces.
