# CLI persona retest on 0.47.1 — after the W1–Q2 fix batch

**Reviewer:** a model instance instructed to act as an applied physicist using the
`upt` CLI to test formulas and bridge ideas. **It is not a human physicist.**
This is a second dogfood pass on the built checkout at `0.47.1`
(`a9eff31`), after the dispositions in `cli-physicist-persona-0.47.1.md`.
It does not re-open fixed W1–W3 / L1–L4 / Q1–Q2 except where a new hole
appears beside them.

**Date:** 2026-09-26. **Access:** CLI only (`node bin/upt.mjs …`) plus the
public help text and `cli/README.md`. Atlas bridge *records* were not read for
adjudication; `upt path` / `upt regime` / `upt atlas` were exercised as a user
would. Every claim below was reproduced on this tree; exit codes were measured
**one command at a time** (a piped `awk`/`head`'s `$?` is not a claim —
`TOOLS.md`).

## How the session was run

Workflow an applied physicist would try after the prior fixes:

1. Confirm the prior batch still holds (W1 `c`↔`speed-of-light`, W2 kebabs,
   L1 named dim products, L4 Wien `T`, `canonical --vars`, probe searchable
   default, discover sort).
2. Drop textbook SI formulas the field actually writes: Kepler III,
   Schwarzschild, Planck length, Stefan–Boltzmann, Ideal gas, Landauer,
   Hooke, Unruh.
3. Deliberately wrong prefactors beside the correct ones.
4. Ask discover / probe / path / confront what to look at next.

Severity: **W** = wrong or silently misleading about physics;
**L** = clarity / friction that blocks the intended workflow; **Q** = question;
**I** = idea.

## Prior fixes still hold (keep this)

| Check | Result |
|---|---|
| `rest-energy = 2*mass*c^2` | exit 3, factor 2 |
| `rest_energy = 2*mass*speed_of_light^2` | exit 3, factor 2 (W1) |
| `length = 2*planck-length` | parses; no longer a subtract error (W2) |
| `peak-wavelength = b/T` | agrees with CE-wien (L4) |
| `derive flux:power/area …` | parses the dim product (L1) |
| `canonical --vars` | prints target + governing names (L2) |
| `probe scan` | 0 searchable; points at discover / `--all` (L3) |
| pendulum / kinetic / Stokes / Stefan(`sigma_sb`) / Landauer(`ln2`) | agree when vocabulary matches |
| `path` horizon at `t=1000` | exit 3, VIOLATED |
| `confront --frontier` | rigor split visible; Cassini at 0.91σ |

## Findings

| ID | Sev | Where | Finding | Repro (exit) |
|---|---|---|---|---|
| W4 | W | `compareWithCanonical` monomial + tabled prefactor | **Textbook Kepler III and Schwarzschild fail the prefactor check with absurd ratios.** `period = 2*pi*sqrt(semi_major_axis^3/(G*mass))` → factor **122404**; `radius = 2*G*mass/c^2` → factor **7.426e-28**. Both exit **3**. Halving the prefactor also exits 3 with half the nonsense ratio — the exit code cannot tell correct from wrong. Cause: governing `G`/`c` are peeled to SI on the *user* side, but the *canonical* monomial evaluator does `p[name] ?? 1`, so constants become **1**. Ratio ≈ user(SI)/canonical(1). Pendulum and Stokes are spared because their free variables are not in `CONSTANTS`. | both forms above → 3 |
| W5 | W | `map --equation` / user-equation gate | **Planck length is refused entirely.** `planck_length = sqrt(hbar*G/c^3)` → `upt: no source quantities in '…' (only constants/numbers?)` (exit 2). CE-planck-length's latex is exactly that form; every governing name is a `CONSTANTS` entry. A physicist copying the CE cannot check it. | that equation → 2 |
| W6 | W | formula name binding | **Bare `a` silently binds to perihelion's `a`, not acceleration.** `unruh_temperature = hbar*a/(2*pi*k_B*c)` reports RHS dimension `[T^2 Theta]` (wrong for temperature), nearest CE-perihelion-precession, exit **0**. With `acceleration` the RHS is `[temperature]` — still no CE to agree with, but at least dimensionally sane. A one-letter catalog collision invents a wrong dimension and calls it fine. | `a` form → 0 |
| W7 | W | Landauer compare | **Latex `ln(2)` is not compared; stub `ln2` agrees.** `erasure_energy = k_B*temperature*ln(2)` → dimensional ✓, then `not-compared` because `evalExpr` rejects `transcendental` (exit 0). `…*ln2` → agrees, exit 0. CE latex is `E = k_B T \ln 2`. Writing the math fails; writing the AST stub succeeds. | both forms → 0 |
| L5 | L | Stefan–Boltzmann vocabulary | CE governing name is `sigma_sb`; latex is `\sigma`. `radiative_flux = sigma*temperature^4` → UNKNOWN (sigma dimensionless), exit 0, nearest CE-stefan-boltzmann — the target matches, the constant does not. `sigma_sb` agrees. Did-you-mean does not suggest `sigma_sb` for `sigma`. | `sigma` form → 0 |
| L6 | L | Ideal-gas compare | CE latex `P = N k_B T/V`, but `N` is only in the AST (dimensionless), not in `dimensional.governing`. Writing the latex form with `N` reports "no canonical equation has this target and these variables" (exit 0). `pressure = number_density*k_B*temperature` is dimensionally fine and nearest CE-ideal-gas, but never compared (different variables). The answer key's own latex is not a checkable input. | `N*k_B*temperature/V` → 0 |
| L7 | L | `map --equation` output | After the equation verdict, the **full 40-component linkage map** still dumps (~100 edge ids in the anchored cluster). N4 moved the verdict first; for formula vetting the map is still the majority of the screen. No `--equation-only` / `--quiet`. | any successful `--equation` |
| L8 | L | Product B empty frontier | `probe scan` correctly reports 0/232 searchable. An applied user who came to *search expressions* still has nowhere to start without authoring a `--problem` file; help points at discover, which is Product A. | `probe scan` → 0 |
| Q3 | Q | W4 scope | Are CE-kepler-third and CE-schwarzschild-radius the only tabled-prefactor monomials whose governing set intersects `CONSTANTS`? Stokes works (no G/c). Should the monomial evaluator bind peeled constants to SI the way `scalarAst` does, or should these two drop the tabled check until they have an L1 AST? | code inspection |
| Q4 | Q | discover PROMISING | After Q1 reordering, top is `landauer-erasure-energy ≟ dark-fermion-mass` (novel-consequence, no magnitude). Still coincidence-heavy energy aliases. Is "novel-consequence" without a magnitude the right first minute, or should magnitude-backed rows lead even when consequence is inconclusive? | `discover` |
| I5 | I | `compareWithCanonical` | Bind peeled governing constants into the monomial `canonicalAt` the same way `constBindings` feed `userAt` (SI values from `CONSTANTS`). That makes W4's ratio become the tabled prefactor check (1 vs ½), which is what the sourced table claimed to buy. | — |
| I6 | I | Planck / all-constant CEs | Allow an all-constant RHS when the target is a catalog quantity and every token is in `CONSTANTS` or numeric — evaluate at SI and compare to the tabled/L1 form — or document that those CEs are display-only for `--equation`. | — |
| I7 | I | aliases | `sigma`→`sigma_sb`, `ln(2)`→`ln2` (or evaluate `ln` of a literal), and refuse one-letter bindings that collide (`a`) unless `--as a=acceleration`. | — |
| I8 | I | `map --equation` | `--equation-only` (or default when `--equation` is set): print the verdict block, skip the full linkage dump. Keep today's dump behind `--map`. | — |

## Corrections (physics / product, not code)

- Geometrized `bh_entropy = A/(4*planck_length^2)` still dimensionally mismatches SI entropy (RHS `[1]`). The tool is right; help still does not say the L-layer stores the SI form. Carried from the prior note's correction.
- `upt explain hawking-temperature` still refuses to treat be-42 / be-42-via-rs as independent. Good.
- Unruh *evaluator* (`upt evaluate be-57`) and `upt eval 'hbar*a/(2*pi*k_B*c)'` agree numerically when `a` is a bare number — the collision is only in `--equation` name resolution against the catalog.

## Out of scope this pass

- Atlas Phase 0 claim adjudication.
- Fixing W4–W7 in this note (docs only; Mothership triage).
- npm-package / published tarball contents.

## Disposition

Open for Mothership triage. Suggested severity order: **W4 → W5 → W6 → W7**, then L5–L8.
