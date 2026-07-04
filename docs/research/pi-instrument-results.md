# The UPT PI Instrument — What It Rejects, What It Confronts, Where the Frontier Is

**Date:** 2026-07-04 · **Scope:** the physicist-facing output of the PI-instrument
program — UPT read not as a unification engine but as an **honest falsification
instrument**: a trustworthy *no*, an extraordinary *yes*. Every figure below
regenerates from a `upt` command named in-line; nothing is asserted without a
reproducer.

## Premise

A working scientist stakes a claim on this tool: every time it calls a
cross-regime relationship a coincidence, that verdict is acted on; every
confrontation is a claim one would put a name to. So the instrument's value is
that its **no** is defensible and its **yes** is rare and data-backed. Below are
the three first-class outputs — the null-result catalog, the evidence spine, and
the frontier — plus the honest ceilings that bound them.

## 1. The null-result catalog — the honest negatives

`upt discover` proposes cross-cluster quantity identifications (a ≡ b) and vets
each through an ordered falsifier stack. On the 44-bridge catalog:

```
132 candidates  →  7 promising · 35 inert · 20 magnitude-clash · 0 contradictory · 70 axis-clash
```

- **0 contradictory** — the framework does not contradict itself numerically.
- **70 axis-clash + 20 magnitude-clash = 90 falsified** as cross-regime
  coincidences (a black-hole radius is not a condensed-matter coarsening length).
- **7 promising** are a *review surface* ("worth a physicist's minute"), not
  claims. Across every review round the funnel has surfaced **0 of 8** that a
  human adjudicator marked genuine. This is the central honest result: **UPT is a
  rigorous coincidence-rejector**, and a framework that can prove *why* something
  is a coincidence is more scientifically useful than one that manufactures
  unifications.

**Every promising verdict now carries its epistemic provenance** (PI-instrument
Phase 1 — the grounding ledger, in `upt discover`): which falsifiers it *passed*
(ran a real comparison and survived) vs the *gaps* (abstained or unadjudicated),
plus the honest ceiling. The weakest survivors pass only `numerical-consistency`
(every other gate abstained); an unadjudicated `novel-consequence` is shown as a
*gap to investigate*, never a strength; an anchor-derived magnitude value is
flagged as weaker. A PI reads not just "promising" but exactly how much weight it
bears. Reproduce: `upt discover` (the `[grounding: …]` trailer) / `--json`.

## 2. The evidence spine — the honest positives

Where UPT's *established* bridges encode real physics, they confront real data
within error. `upt confront` runs **8 committed confrontations**:

| bridge | confrontation | result |
|---|---|---|
| BE-52 | GR perihelion precession vs Mercury (Clemence 1947) | **within 1σ** (0.26σ) |
| BE-37 | GR Shapiro delay (PPN γ) vs Cassini (Bertotti 2003) | **within 1σ** (0.91σ) |
| BE-51 | GR light deflection (PPN γ) vs VLBI (Lambert 2009) | **within 1σ** (0.67σ) |
| BE-35 | Conformal-bootstrap 3D-Ising ν vs experiment (Pelissetto-Vicari 2002) | **within 1σ** (0.015σ) |
| BE-23 | Planckian dissipation α vs overdoped cuprates (Legros 2019) | α = 1.0 ± 0.4, residual 0.00σ |
| BE-21 | KSS η/s bound vs quark-gluon plasma (Bernhard-Moreland-Bass 2019) | satisfies + nearly saturates 1/(4π), ~26% above |
| BE-36 | GW speed vs GW170817 bound | encoded bound not excluded |
| BE-48 | GRW collapse rate vs LISA-Pathfinder bound (Carlesso 2016) | not excluded (GRW≠CSL caveat recorded) |

The **three classic tests of general relativity** — Mercury perihelion, Shapiro
delay, light deflection — are now all reproduced within 1σ, each computed from
the bridge's *own* formula against an independent measurement, not a textbook
lookalike. BE-21 adds condensed/strongly-coupled matter: the QGP, the "most
perfect fluid," sits just above the string-theory KSS bound. BE-35 adds critical
phenomena: the conformal bootstrap's parameter-free 3D-Ising exponent ν agrees
with the measured value (0.015σ) — though honestly, experiment (±0.002) is far
coarser than the bootstrap (±0.000004), so this confirms consistency rather than
stress-testing it. Reproduce: `upt confront`; pinned per-bridge in
`tests/bridges/be*-confrontation*.test.ts`.

## 3. The frontier — what physics has not connected

`upt map` finds the catalog+canonical graph sparse (**37 components over 144
edges**) — a hub-and-spoke star, not a connected manifold. `upt connectors` reads
the isolated-bridge frontier: **16 isolated bridges have a same-kind connector**
(a candidate that would pull them into the anchored core), and **11 are truly
unconnected** — sharing no quantity with any other edge:

`CE-bohr-magneton · CE-snell-law · be-17 · be-21 · be-25 · be-30 · be-39 · be-46 · be-49 · be-50 · be-53`

The same-kind connectors have been run through the firewall: across two rounds,
**0 of 7 adjudicated genuine** (`orphan-connector-adjudication.md`) — including the
strongest theoretical case, the Ryu–Takayanagi ≟ Bekenstein–Hawking S=A/4G pair,
ruled a form-coincidence ("equality without identity"), not an alias. The frontier is
isolated by *physics*, not vocabulary.

This is the legible frontier: the physics the catalog has not yet linked, and the
highest-value input for a physicist (a sourced data confrontation, or an
adjudicated identification). Reproduce: `upt map`, `upt connectors`, `upt coverage`.

## The honest ceilings (what the instrument cannot do — stated, not hidden)

The PI-instrument program tested two deeper capabilities and found both bounded
by physics, not effort — the same discipline that returns null results in §1:

- **Mechanism (PI-instrument Phase 2): not testable on candidates.** A
  mechanism-proxy falsifier beyond regime-axis compatibility is not buildable
  without fabricating coupling physics the catalog does not have. Dimensional
  matching cannot see mechanism — the instrument says so and keeps
  `mechanismTested = false` on every candidate. The one genuine proxy
  (`entailed` — a consequence re-derives a known law) is honest and fires on
  0/7: the coincidences are not disguised known physics.
- **Data on candidates (Phase 3): no confrontable target.** A cross-cluster
  dimensional identification has no implied observable to measure. The scientific
  loop is closed not by confronting candidates but by the **epistemic firewall**:
  a candidate must graduate to an established bridge — human review + citation —
  before it can be data-confronted (§2). No machine verdict ever mutates the
  catalog.

These are not gaps to be papered over with more machinery; they are the honest
boundary of a dimensional instrument, and stating them is what makes the *yes* in
§2 trustworthy.

## Reproducibility

Every number regenerates: funnel counts + grounding — `upt discover` (`--json`,
`--source=canonical|both`); confrontations — `upt confront`; frontier —
`upt map`, `upt connectors`, `upt coverage`. The 0/8-genuine, 0-contradictory,
70-axis-clash, and 7-confrontation figures are standing regression gates — a
future change that manufactures a false `genuine`, resurfaces a falsified
coincidence, or fabricates a confrontation fails CI.
