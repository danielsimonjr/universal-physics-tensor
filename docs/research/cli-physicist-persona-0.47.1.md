# CLI persona pass on 0.47.1 — applied physicist, not a human reviewer

**Reviewer:** a model instance instructed to act as an applied physicist using the
`upt` CLI to test formulas and bridge ideas. **It is not a human physicist.**
This is a CLI dogfood pass on the built checkout at `0.47.1`
(`a95a63a`), after the N1–N5 patch batch. It does not re-open those findings.

**Date:** 2026-09-26. **Access:** CLI only (`node bin/upt.mjs …`) plus the
public help text and `cli/README.md`. Atlas bridge *records* were not read for
adjudication; `upt path` / `upt regime` / `upt atlas` were exercised as a user
would. Every claim below was reproduced on this tree; exit codes were measured
one command at a time (a multi-command script's last `$?` is not a claim).

## How the session was run

Workflow an applied physicist would try:

1. Orient (`help`, `coverage`, `canonical`, `evaluate`).
2. Check known textbook formulas (`derive` / `map --equation`).
3. Deliberately wrong prefactors (½ missing, factor of 2, forgot the 4 in
   Bekenstein–Hawking).
4. Drop “new idea” forms onto the map (geometrized `S = A/4ℓ_P²`, Wien with a
   named constant, holographic entropy).
5. Ask the discovery / probe surfaces what to look at next.
6. Use the atlas route tools on the oscillator pilot.

What works well is recorded first; then the defects; then questions and
product ideas. Severity: **W** = wrong or silently misleading about physics;
**L** = clarity / friction that blocks the intended workflow; **Q** = question;
**I** = idea.

## What already works (keep this)

- Prefactor catching on the *right* vocabulary: `rest-energy = 2*mass*c^2` and
  `bh-entropy = k_B*c^3*A/(G*hbar)` report `yours/canonical = 2` / `4` and exit
  3. Kinetic energy with/without ½ behaves the same way (N1 still holds for
  `velocity` ↔ `speed`).
- `upt path` withholds a warrant when the horizon is violated (exit 3 at
  `t=1000` for the pendulum route) and prints the bound at the point when it
  holds.
- `upt confront --frontier` ranks by margin to exclusion and refuses to count
  19 equal confirmations — the rigor split is the first thing a skeptic needs.
- `upt probe run` on the pendulum fixture recovers `CE-pendulum-period` and
  labels it “algebraically equivalent … (not novel)” — the right epistemic
  label for a rediscovery.
- Honesty banners on `discover` / `candidates` / `predict` (“worth a
  physicist's minute, not true”) are visible and repeated.

## Findings

| ID | Sev | Where | Finding | Repro (exit) |
|---|---|---|---|---|
| W1 | W | `map --equation` / `compareWithCanonical` | **`c` vs `speed-of-light` silently disables the prefactor check.** `rest-energy = 2*mass*c^2` exits 3 (factor 2). `rest_energy = 2*mass*speed_of_light^2` prints “prefactor is NOT checked” and exits **0**. Cause: `c` is in `CONSTANTS` and is stripped from the user's free symbols, so CE-mass-energy is compared as a one-variable law; `speed-of-light` is a catalog *quantity*, so the source sets no longer match. A physicist who writes the catalog's own name for *c* gets a weaker check than one who writes the constant token. | `map --equation 'rest_energy = 2*mass*speed_of_light^2'` → 0; same with `c` → 3 |
| W2 | W | formula parser on `--equation` RHS | **Hyphenated catalog names are parsed as subtraction.** `length = 2*planck-length` → `upt: Cannot subtract [length] with running [1]` (exit 2). The catalog and every `connects to:` line print kebab-case; help says “use underscores”; typing what the tool just printed fails with a dimension-arithmetic error that never names the hyphen. LHS hyphens happen to work (`rest-energy = …`); RHS hyphens do not. | `map --equation 'length = 2*planck-length'` → 2 |
| W3 | W | `map --equation` landing report | **“Joins the ANCHORED cluster … connects to: be-11-zurek, …” overclaims.** A correct pendulum or Wien equation is reported as connecting to decoherence, soft-hair adjacent edges, etc., because it shares `length` / `temperature`. The footer says this is structural connectivity, but the per-equation line reads like a physics claim. For a new formula the user is trying to *vet*, that list is the loudest signal on the screen and the least informative. | any successful `--equation` that hits the big component |
| L1 | L | `upt derive` dimension grammar | **Compound named dimensions are refused.** `flux:power/area` → `unrecognized dimension term 'power/area'`; `b:length*temperature` → `unknown base dimension 'length'`. Help advertises named dimensions (`length`, `time`, …) and `L^3.M^-1.T^-2`, but not quotients/products of named dims. Stefan–Boltzmann and Wien-with-declared-`b` are the first things an applied user tries after the pendulum. | `derive 'flux:power/area' …` → 2 |
| L2 | L | `upt canonical` | **No variable vocabulary on the answer key.** The table lists id / domain / partners, not the governing names (`c` vs `speed-of-light`, `T` in the Wien AST vs `temperature` in the quantity graph, `b` for Wien’s constant). Matching a formula to a CE is trial-and-error; `upt canonical` is where those names should live. | `canonical` text mode |
| L3 | L | `upt probe scan` | **232 gaps, 0 searchable in the default listing.** Every printed line is `relation-link / not-searchable` pointing at `upt discover`. Product B’s entry point, for a user who came to *search expressions*, is a wall of “use the other product.” | `probe scan` head |
| L4 | L | CE-wien / formula latex | **LaTeX/`T` form of Wien fails; catalog `temperature` works.** `peak-wavelength = b/T` treats `T` as an unknown dimensionless placeholder (UNKNOWN, exit 0). `peak-wavelength = b/temperature` agrees with CE-wien. The CE’s own `formula_latex` is `λ_max = b/T`. A user copying the latex token is punished; a user who invents the long name is rewarded. | both forms above |
| Q1 | Q | discover PROMISING | Is `landauer-erasure-energy ≟ inflation-hubble-energy` (score 7, consequence inconclusive) still worth the top slot of the printed list, or should inconclusive + no magnitude be sorted below magnitude-backed novel-consequence rows? The banner is honest; the ordering still spends the physicist’s first minute on a coincidence. | `discover` |
| Q2 | Q | CONTRIBUTING.md vs `coverage` | CONTRIBUTING still says the JSON catalog is a “44-entry” projection; `upt coverage` reports 55. Which number should a reviewer trust when opening the JSON? | docs vs CLI |
| I1 | I | CLI | A `upt vocab` (or `canonical --vars`) that prints quantity names, dimensions, and which CEs use them would remove L2 and most of W1’s user-facing confusion. | — |
| I2 | I | `map --equation` | When the RHS fails with a subtraction involving a token that is a catalog prefix (`planck-…`), emit: “`-` is arithmetic; multi-word names use underscores (`planck_length`).” That is a one-line fix for W2’s clarity even before a lexer change. | — |
| I3 | I | `map --equation` | Cap or summarise `connects to:` (e.g. “shares {temperature} with the 100-edge anchored component; nearest CEs: CE-wien, CE-stefan-boltzmann, …”) instead of dumping ~100 edge ids. | — |
| I4 | I | probe | `probe scan --searchable-only` (or default to hiding Product-A wrappers) so the first screen is the frontier Product B can actually attack. | — |

## Corrections (physics / product, not code)

- The geometrized form `bh_entropy = area/(4*planck_length^2)` is a *different
  equation* from CE-bekenstein-hawking (`S = k_B c³ A / (4 G ℏ)`). The tool
  correctly refuses to pretify it into a match when names miss; users will
  still try the geometrized form first. A note in `help map` that the L-layer
  stores the SI form would save a cycle.
- `upt explain hawking-temperature` correctly refuses to treat be-42 /
  be-42-via-rs as independent (L5 fix still holding). Good.

## Out of scope this pass

- Atlas Phase 0 claim adjudication (already covered by
  `phase-0-model-persona-review.md`).
- Re-testing N1–N5 except where a new hole appears beside them (W1 is adjacent
  to N1, not a regression of it).
- npm-package contents / published tarball (clone + build only).

## Disposition

Fixed on branch `cursor/persona-cli-fixes-b6c5` (2026-09-26), one finding per
commit. Dispositions:

| ID | Disposition |
|---|---|
| W1 | Fixed. `peelConstantAliases` in `canonical-compare.ts`; sources that restate a governing constant (speed-of-light ↔ c) bind to the SI value so the prefactor check still runs. |
| W2 | Fixed. `rewriteCatalogHyphens` before parse; subtract-error hint names the underscore form. |
| W3 / I3 | Fixed. `formatConnectedSummary` ranks by shared-quantity overlap, caps the list, states the structural caveat. |
| L1 | Fixed. `parseDimensionSpec` accepts named `*` / `/` products (power/area, length*temperature). |
| L2 / I1 | Fixed. `upt canonical --vars` prints target and governing names. |
| L3 / I4 | Fixed. `upt probe scan` defaults to searchable-only; empty case points at `upt discover` / `--all`. |
| L4 | Fixed. Formula alias `T` → `temperature`; CE-wien AST symbol aligned with governing name. |
| Q1 | Fixed. PROMISING print order: consequence signal, then magnitude-backed, then score. |
| Q2 | Fixed. CONTRIBUTING.md 44 → 55. |
| I2 | Covered by W2's subtract-error hint. |
