# Discovery-Hardening Phase 4 Unit B (v0.34.0) — Bounded Buckingham-π Cross-Cluster Discovery: Design

**Date:** 2026-07-03 · **Status:** ❌ **CANCELLED — vet-killed as numerology
(Adam RED + Eve RED, 2026-07-03).** Do NOT implement. The approach is
statistically vacuous and contradicts the program's own coincidence-rejector
ethos; the cancellation rationale is the valuable output. See the adjudication
record at the end. The r1 design below is preserved as the record of what was
tested and why it fails.

---

## CANCELLATION — why bounded cross-cluster Buckingham-π discovery is not built

Both adversarial reviewers returned RED on r1, converging on three fundamental,
unfixable objections. The math is decisive and uses THIS session's real Task-0
numbers:

1. **Statistically vacuous (multiple comparisons).** Task-0 measured 16,979
   single-invariant π-groups and a 4.3 % background constant-hit rate at the
   fixed tolerance. Expected pure-chance "hits" = **16,979 × 0.043 ≈ 730**
   against an 8-constant table. Hundreds of chance coincidences swamp any real
   signal; reporting the background rate *discloses* the look-elsewhere problem
   but does not correct the family-wise error. Every surfaced hit is almost
   certainly a false positive.
2. **Scale-choice artifact.** The π-value compared to constants is a direct
   function of each quantity's chosen representative magnitude. `schwarzschild-
   radius` at solar-mass vs electron-mass swings it by tens of orders of
   magnitude, so hit/no-hit is manufacturable by the value choice — an artifact
   of the reviewer's scale, not a property of physics. The "well-posedness gate"
   does not fix this; it just requires *a* value, and the value *determines* the
   hits.
3. **Form-not-value numerology.** `buckingham.ts`'s own docstring states that
   dimensional analysis returns FORM, not value — "exactly what separates
   dimensional analysis from numerology." A π-group being numerically near 4π is
   not evidence of a physical law; elevating it to an `'unadjudicated hit'`
   lends a coincidence unearned weight.

**The decisive project-level reason:** the discovery-hardening program's central
honest result (`docs/research/v0.33.0-discovery-hardening-results.md`) is that
**UPT correctly REJECTS cross-cluster coincidences** (0/8 genuine, 70 axis-clash
falsifications). Unit B is a machine that would GENERATE cross-cluster
coincidences and surface them as review items — it directly contradicts the
program's integrity and would damage, not advance, the "best physics library"
goal.

**What replaces it:** nothing is built. The Task-0 measurement (the lightweight
research probe Eve #6 correctly noted was the right instrument) already
delivered the knowledge: bounded cross-cluster π-search is statistically
vacuous. This is recorded as an honest negative methodological result in the
research corpus. The frontier bridges remain isolated *by physics*, exactly as
the program's other falsifiers concluded.

**Findings dispositioned:** Adam #1/#2/#3 + Eve #1/#2 (the three HIGHs above) —
CONFIRMED, cause of cancellation. Eve #3 (enumeration budget on ill-posed
groups), #4 (firewall bleed), #5 (YAGNI command), Adam #4–#7 — all moot (nothing
built). Eve #6 / Adam #5 (research probe not a shipped feature) — ACCEPTED: the
Task-0 probe was the right scope; no CLI command, no sourced-value expansion, no
maintenance debt is incurred.

---


**Program:** the deferred Unit B of Phase 4
(`docs/superpowers/specs/2026-07-03-discovery-hardening-phase4-design.md`), split
out post-Task-0. This is its own design + vet cycle.
**Premise:** the 20 isolated bridges share no quantity with the anchored core;
the equal-dimension pair generator (`proposeLinkCandidates`) can only pair
quantities of the *same* dimension, so it is blind to dimensionless invariants
that span *unequal* dimensions. A dimensionless π-group linking an
isolated-bridge quantity to core quantities — one whose numeric value lands
near a recognizable constant (1, 2π, ln 2, α) — is a discovery hint of a hidden
relation that no existing falsifier surfaces.

## What this session already measured (the design is data-grounded, not assumed)

Unit B's Task-0 measurement (2026-07-03, `docs/research/`-adjacent) established:

- **Enumeration is tractable.** 23 frontier seeds × a 20-variable pool,
  size-≤3 subsets = **31,050 `buckinghamPi` calls in 1.3 s**; 16,979 turned out
  `single-invariant`. (Answers the program vet's Eve-HIGH "intractable over 131
  quantities" — the frontier-seed bound cuts it to ~10⁴ cheap exact-rational
  RREFs.)
- **The algorithm works where data exists.** Restricted to the 13 quantities
  that have representative values, the recognizable-constant filter gives a
  clean, non-saturating hit curve: **5.0 % (tol 1e-2) → 4.3 % (1e-3) → 4.2 %
  (1e-4)**.
- **The blocker is data, and it is partly ill-posed.** Of the 37 catalog-graph
  quantities, **only 2 currently have representative values usable by the
  graph**; 35 lack them, and that missing set is *mixed*: some are specific and
  sourceable (`schwarzschild-radius`, `hawking-temperature`,
  `thermal-de-broglie-wavelength`, `perihelion-advance`, `shapiro-delay`),
  while others have **no single well-defined representative magnitude**
  (`anthropic-probability`, `intrinsic-information`, `resistivity` [material-
  dependent], `deflection-angle` [geometry-dependent], `time-symmetry-residual`).

So Unit B is not a data-entry task — it turns on a **well-posedness gate**: which
quantities even *have* a representative scale. That gate is the r1 design's core.

## Unit 1 — the well-posedness gate (the load-bearing decision)

A quantity participates in the π-group **numeric filter** only if it has a
**canonical characteristic scale**: a single defensible representative magnitude
with a physics citation (e.g. `schwarzschild-radius` → the solar-mass value
≈ 2.95 km; `hawking-temperature` → the solar-mass value ≈ 6.2×10⁻⁸ K;
`thermal-de-broglie-wavelength` → H atom at 300 K ≈ 100 pm). A quantity is
**ill-posed** and excluded from the numeric filter if its magnitude is
irreducibly context-dependent (material, geometry, or free parameter) or
abstract/dimensionless-stub.

**Consequence of the gate (honest degradation):** a π-group is
numerically constant-filtered ONLY if *every* quantity in it is well-posed. A
group containing an ill-posed quantity is still enumerated dimensionally (it may
be `single-invariant`), but it **cannot be surfaced as a hit** — we have no
honest numeric value to test it against a constant. Such groups are counted and
reported as "un-evaluable (ill-posed member)", never as discoveries. This is the
firewall against manufacturing a coincidence from a made-up magnitude.

**The sourced expansion (Task-0 of the plan, not this design):** source
canonical representative values — each with a citation, never fabricated — for
the well-posed subset of the frontier + core quantities. The design NAMES the
candidate well-posed quantities; the plan's Task-0 verifies each has a
defensible sourced value and DROPS any that turns out ill-posed on review
(the same measure-first discipline as Unit A / the confrontations). Ballpark
target: ~15–20 well-posed additions; the exact count is whatever survives
sourcing.

## Unit 2 — the bounded π-search

Resolves each deferred vet concern with the Task-0 data:

1. **Seed from the frontier** (Eve program-HIGH — intractability). Enumerate
   only groups containing ≥1 quantity from an isolated/small-cluster bridge
   (~20–23 seeds), never the full 131. Measured tractable.
2. **Companion pool = the 5 fundamental constants (c, ħ, G, k_B, e) + ALL
   well-posed core quantities** (Adam #3 — "K≈15 arbitrary"). K is NOT a knob:
   it is exactly the count of well-posed core quantities (those with a sourced
   representative value), which the well-posedness gate fixes. If that count is
   large enough to threaten the enumeration cap, the pool is capped by
   graph-degree (hub quantities first) and the cap is `log()`-reported — no
   silent truncation.
3. **Group size ≤ 4, single-invariant only** (Eve #10 — recall). Keep
   `buckinghamPi` verdict `single-invariant` (n−r=1). Multi-invariant groups
   have ≥2 free exponents — not a single meaningful relation; they are counted
   and reported, not surfaced. Accepted recall trade with an audit line.
4. **Hard enumeration cap** (Eve #8 — RREF load). A test asserts the bounded
   search issues **≤ N `buckinghamPi` calls** (N set from Task-0 headroom, e.g.
   50 000) so a future catalog growth cannot silently make it intractable.

## Unit 3 — the recognizable-constant filter (the discovery signal)

A surviving single-invariant, fully-well-posed group is a **hit** iff its
π-value, evaluated at the members' representative values, lies within a **fixed**
relative tolerance of a constant from a fixed table
{1, 2π, 4π, ½, ln 2, α, 1/α, √(2π)}.

**Anti-unfalsifiability (Eve #9 — tolerance is a free knob).** Three binding
mitigations: (a) the tolerance is **fixed in code** at the Task-0-calibrated
value (tol = 1e-3, the 4.3 %-hit point) — NOT a per-run flag a user can loosen
to manufacture hits; (b) every report prints the **background hit-rate** (what
fraction of ALL single-invariant well-posed groups hit *some* constant at this
tolerance) beside the hits, so a physicist reads each hit against the
coincidence density — a 4 % background means most hits are chance; (c) the
epistemics banner states these are **numerology candidates** for a physicist to
reject or investigate, not discoveries.

## Program invariants (bind Unit B)

- **Epistemic firewall.** π-group hits are `'unadjudicated'` review items only
  (same firewall as `proposed-bridges`); nothing mutates `BRIDGE_EQUATIONS` /
  the graph; no sourced representative value is invented.
- **Funnel benchmark untouched.** The π-search is a SEPARATE discovery mode,
  orthogonal to the a≡b identification funnel — it never calls `rankDiscoveries`
  and the calibration benchmark stays byte-identical (a Task-0 check).
- **Zero hard deps.** `buckinghamPi` / `representativeValue` are peer-independent.

## Architecture (files)

| File | Responsibility |
|---|---|
| `src/composition/representative-values.ts` (modify) | +sourced well-posed values (each with a citation comment). |
| `src/composition/pi-search.ts` (create) | `boundedPiSearch(edges): PiSearchResult` — frontier seeding, bounded enumeration, single-invariant + well-posedness filter, constant-recognition, background-rate. |
| `src/cli/commands/pi-search.ts` (create) | `upt pi-search [--json]` — surfaces hits + the background rate + epistemics banner. (A distinct command, not a `discover` flag: the output shape — π-groups, not a≡b candidates — is genuinely different.) |
| `tests/composition/pi-search.test.ts` | enumeration-cap assertion; a fixture well-posed group with a known single-invariant π near a constant surfaces; an ill-posed-member group is counted-not-surfaced; a random group misses. |

## Testing

- Enumeration cap: `boundedPiSearch` issues ≤ N `buckinghamPi` calls (hard cap).
- Well-posedness gate: a group with an ill-posed member is `un-evaluable`, never
  a hit (the anti-fabrication guard).
- Constant filter: a fixture group whose π is (say) exactly 2π surfaces at tol
  1e-3; a fixture group whose π is 3.7 misses. Background-rate is reported.
- Firewall/orthogonality: `pi-search.ts` never imports `rankDiscoveries`;
  `discovery-calibration.test.ts` unchanged.
- Every sourced representative value is pinned with its magnitude (a drift guard;
  the citation lives in the source comment).

## Out of scope

Promotion of any π-hit to the catalog (human review only); representative values
for ill-posed quantities (excluded by design); a general π-search over the full
131-quantity space (frontier-bounded only); tuning the tolerance at runtime.

## The scope question for the vet + owner

Unit B bundles two things: (1) the sourced representative-values expansion
(physics-data work, gated by well-posedness), and (2) the π-search machinery.
They are sequenced (machinery needs the data), and the plan's Task-0 sources the
data measure-first. If the well-posed sourced set turns out too small to make
the π-search fire above background at Task-0, Unit B ships as a measured negative
result (the machinery + the honest "no super-background hits found") rather than
being cut — the same go/no-go discipline as Unit A.
