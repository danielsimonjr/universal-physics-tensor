# Canonical Equation Registry — Sub-project A Review Findings

Adversarial physics/architecture review of `Canonical-Equation-Registry-A-Design.md`
by the UPT Adam (Gemini 2.5 Pro) + Eve (OpenAI o3) pair, 2026-06-17.

**Both verdicts: YELLOW** — promising, proceed only after the convergent defects
below are folded into the design. The four findings below were raised
*independently* by both reviewers (high confidence). The design doc has been
revised to incorporate every fix; this file preserves the findings.

## Convergent findings (both reviewers)

### F1 — L0 "overclaim" risk
An `L0-only` entry (e.g. Lindblad) sits in the same registry cell as a full
L2 Einstein equation but carries orders-of-magnitude less information. Code that
treats every `CanonicalEquation` as "a validated law" would claim unwarranted
support for anything that merely preserves dimensions. Eve: a Buckingham-π "law"
is underdetermined — any dimensionless function of the free groups passes.

**Fix (applied):** per-level `epistemicStatus ∈ {dimensional, scalar-up-to-constant,
fully-quantitative}` + `freeDimensionlessGroups: number`. Consumers must not use an
equation above its status; the CLI states the fidelity level of every check
("dimensionally consistent (L0)", never "recovered"). No generic "validated" flag.

### F2 — first tranche too thin for the OPEN bridges
The 25 OPEN bridges (≥1 free dimensionless group) are exactly the ones L0 can't
pin, and the tranche under-covers mechanics / E&M / QM anchors. Missing, per the
reviewers: ideal gas `PV=Nk_BT`, Lorentz force, Planck–Einstein `E=hν`, de Broglie
`λ=h/p`, Bohr radius, Wien's displacement, Maxwell/Gauss.

**Fix (applied):** tranche expanded to ~24; **coverage rule** — every OPEN bridge
must have ≥1 canonical partner in the same dimensional hull, else it is flagged
`on-hold` (logged, never silently "covered").

### F3 — L1 form ambiguities
- **Bekenstein–Hawking** depends on horizon **area A [L²]**, not radius (radius
  smuggles in spherical symmetry).
- **Landauer** is `k_B T ln2`, **natural** log; pin base-e in metadata (ln2 is a
  dimensionless constant ≈0.693 — dimensional validation alone can't catch a
  log₁₀ slip).
- **Stefan–Boltzmann** `j=σT⁴` is **flux**; luminosity `L=σAT⁴` changes the
  constant by a factor A. σ is composite `(2π⁵k_B⁴)/(15c²h³)`.

**Fix (applied):** schema fields `areaOrRadius`, `logBase`, `quantityKind`;
composite constants expanded to fundamentals (or referenced via the constant
registry); numeric-prefactor unit tests at canonical defaults (M☉ BH, T=300 K
Landauer, T=5778 K Stefan–Boltzmann).

### F4 — circularity (most severe)
Loading BH/Landauer/thermal-de-Broglie as canonical ground truth while BE-21/42,
BE-16, BE-12 still "discover" them makes the Sub-project B recovery check vacuous
(`X≡X`), and on numeric disagreement B wouldn't know which side is the reference.

**Fix (applied):**
- Strict namespace separation — canonical entries live in **L**; discovery /
  linkage may **read** L, never **write** it.
- `restatesBridge?: string` provenance on canonical entries that are literally a
  bridge's own relation; `partnerBridges` is an advisory signpost only.
- Constraint carried into B's spec: B hashes the bridge AST and canonical AST **up
  to dimensionless factors**; an identical hash on a `restatesBridge` pair is
  reported as `restates-canonical` and does **not** count as a recovery
  "discovery." A real recovery = a bridge *deriving* the canonical form via
  composition / limit, not being a copy of it.

## Additional (raised by one, accepted)
- **Constant registry** (both): a single `{symbol, value, dimension}` source
  referenced by id, not constants hard-coded per `ExprNode`. UPT already has
  `src/composition/symbolic-constants.ts` — **extend** it (add ε₀, σ-as-derived),
  don't rebuild.
- **Assumption / regime tags** (Eve): equations carry implicit regime assumptions
  (Stefan–Boltzmann ⇒ blackbody equilibrium). Add `assumptions: string[]`
  alongside `regime`; B/C check overlap before comparing.

## Corrected reviewer assumption
Adam flagged uncertainty that the grammar supports `ln` / dimensionless
constants. It does: v0.18 added the `transcendental` node (incl. `ln`), and
dimensionless literals are first-class. Landauer's `ln2` is a plain dimensionless
constant — **no grammar work** is required for this tranche.
