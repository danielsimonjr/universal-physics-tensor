# Dimensional-Derivation Benchmark

> **Provenance:** 2026-06-13 (branch
> `claude/bridge-equations-specs-review-4mfy38`). A benchmark of known
> physics equations DERIVED by the Buckingham-π engine
> (`src/dimensional/buckingham.ts`). Every row below is the engine's
> actual `dimensionallyDetermines` / `buckinghamPi` output, pinned by
> `tests/dimensional/derivation-benchmark.test.ts` — if the engine ever
> stops reproducing a row, that test fails.

## What this shows (and does not)

Each equation is recovered **by dimensions alone**: given the governing
variables, the engine returns the unique monomial (the exponents) such
that the target equals a dimensionless constant times that product. It is
a genuine, mechanical re-derivation of the classical dimensional-analysis
results — Rayleigh's method, made exact and machine-checked.

What it does **not** do, and the result types make structurally
impossible: supply the dimensionless constant. The pendulum's 2π,
Kepler's 4π², the thermal wavelength's √(2π) — none of those are
recoverable from dimensions, and the engine never claims them. That
boundary is the whole point (see
`Bridge-Inference-Epistemics-Note.md`): dimensional analysis fixes the
form, physics fixes the constant.

## The benchmark (engine output)

Each "engine derives" column is verbatim from `dimensionallyDetermines`;
`∝` denotes "up to a dimensionless constant."

| Equation | Governing variables | Engine derives |
|---|---|---|
| Pendulum period, T = 2π√(L/g) | length, gravity | `period ∝ length^0.5·gravity^-0.5` |
| Kepler's third law, T² = 4π²a³/GM | semi-major-axis, G, mass | `period ∝ semi-major-axis^1.5·G^-0.5·mass^-0.5` |
| Schwarzschild radius, r_s = 2GM/c² | mass, G, c | `radius ∝ mass·G·c^-2` |
| Wave speed on a string, v = √(F/μ) | tension, linear-density | `speed ∝ tension^0.5·linear-density^-0.5` |
| Planck length, ℓ_P = √(ℏG/c³) | hbar, G, c | `planck-length ∝ hbar^0.5·G^0.5·c^-1.5` |
| Planck mass, m_P = √(ℏc/G) | hbar, c, G | `planck-mass ∝ hbar^0.5·c^0.5·G^-0.5` |
| Planck time, t_P = √(ℏG/c⁵) | hbar, G, c | `planck-time ∝ hbar^0.5·G^0.5·c^-2.5` |
| Compton wavelength, λ_C = ℏ/mc | hbar, mass, c | `compton-wavelength ∝ hbar·mass^-1·c^-1` |
| Thermal de Broglie (BE-12), λ ∝ ℏ/√(m k_B T) | hbar, mass, boltzmann, temperature | `thermal-wavelength ∝ hbar·mass^-0.5·boltzmann^-0.5·temperature^-0.5` |

Plus one dimensionless-group case via `buckinghamPi` (no single target):

| Group | Variables | Engine finds |
|---|---|---|
| Reynolds number, Re = ρvL/μ | density, velocity, length, dyn-viscosity | one π-group: `density·velocity·length·dyn-viscosity^-1` |

## Notes

- **Rational exponents are exact.** The half-integer powers (Planck
  scales, thermal wavelength) come out as exact `0.5` / `-1.5` / `-2.5`
  because the engine uses exact rational arithmetic over the dimension
  matrix, not floating Gaussian elimination.
- **The thermal de Broglie row is a catalog bridge (BE-12).** The engine
  re-derives the dimensional skeleton of an equation the project actually
  carries — a cross-check that the catalog's encoded form is
  dimensionally what dimensional analysis predicts.
- **Failure modes the benchmark also guards** (in the unit tests, not the
  table): if you withhold a needed dimensionful constant — e.g. ask for
  the Schwarzschild radius from `{mass}` alone — the engine returns
  `determined: false`, "the target's dimension is not in the span." It
  refuses to invent the missing G and c rather than guessing. That honest
  refusal is the same boundary, seen from the other side.

## Reproduce

```bash
npx vitest run tests/dimensional/derivation-benchmark.test.ts
# or, for one quantity through the full inference suite:
npm run explain -- hawking-temperature mass=1.989e30
```
