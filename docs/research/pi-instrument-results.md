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
within error. `upt confront` runs **12 committed confrontations**:

| bridge | confrontation | result |
|---|---|---|
| BE-52 | GR perihelion precession vs Mercury (Clemence 1947) | **within 1σ** (0.26σ) |
| BE-37 | GR Shapiro delay (PPN γ) vs Cassini (Bertotti 2003) | **within 1σ** (0.91σ) |
| BE-51 | GR light deflection (PPN γ) vs VLBI (Lambert 2009) | **within 1σ** (0.67σ) |
| BE-35 | Conformal-bootstrap 3D-Ising ν vs experiment (Pelissetto-Vicari 2002) | **within 1σ** (0.015σ) |
| BE-23 | Planckian dissipation α vs overdoped cuprates (Legros 2019) | α = 1.0 ± 0.4, residual 0.00σ |
| BE-11 | Decoherence master eq. vs collisional decoherence (Hornberger 2003) | parameter-free 9-gas agreement within ~15% |
| BE-55 | Quantum-Hall universality — graphene vs GaAs (Janssen 2012) | topological quantization material-independent to **8.6×10⁻¹¹** |
| BE-58 | Johnson-Nyquist S_V=4k_BTR via JNT k_B (Flowers-Jacobs 2017) | **within 1σ** (0.81σ) |
| BE-56 | Casimir force vs corrected theory (Mohideen-Roy 1998) | ~1% agreement (systematics-dominated) |
| BE-21 | KSS η/s bound vs quark-gluon plasma (Bernhard-Moreland-Bass 2019) | satisfies + nearly saturates 1/(4π), ~26% above |
| BE-36 | GW speed vs GW170817 bound | encoded bound not excluded — **one-sided** (+side only) |
| BE-48 | GRW collapse rate vs LISA-Pathfinder bound (Carlesso 2016) | not excluded (GRW≠CSL caveat recorded) |

The **three classic tests of general relativity** — Mercury perihelion, Shapiro
delay, light deflection — are now all reproduced within 1σ, each computed from
the bridge's *own* formula against an independent measurement, not a textbook
lookalike. BE-21 adds condensed/strongly-coupled matter: the QGP, the "most
perfect fluid," sits just above the string-theory KSS bound. BE-35 adds critical
phenomena: the conformal bootstrap's parameter-free 3D-Ising exponent ν agrees
with the measured value (0.015σ) — though honestly, experiment (±0.002) is far
coarser than the bootstrap (±0.000004), so this confirms consistency rather than
stress-testing it. BE-36 carries a caveat worth stating plainly: `upt confront`
now surfaces that its "not excluded ✓" passes only the GW170817 **+side**
(6.5e-16) — the observation's **−side bound is −3.1e-15, which exceeds the
symmetric ±1e-15 the bridge encodes**. The confrontation is honest about testing
half the bound, not the full asymmetric constraint. Reproduce: `upt confront`;
pinned per-bridge in `tests/bridges/be*-confrontation*.test.ts`.

### Evidence-spine rigor — a hierarchy, not twelve equal confirmations

Reading the table as "12 confirmations" would overstate it. The twelve rows
differ by many orders of magnitude in stringency:

- **The most stringent row is now condensed-matter, not GR.** BE-55, the
  quantum-Hall UNIVERSALITY test, confirms the topological quantization is
  material-independent to **8.6×10⁻¹¹** (graphene vs GaAs) — the tightest
  confrontation in the whole spine, and a genuinely non-circular one (post-2019 SI
  makes the *value* definitional; the material-independence is empirical). BE-58
  (Johnson-Nyquist k_B via noise thermometry, 0.81σ, ppm-level) sits just behind.
- **Precision GR, ~10⁻⁵, across two independent PPN parameters.** PPN γ is
  confirmed twice by independent methods — Shapiro delay (BE-37, 0.000023/1.000021
  ≈ 2.3e-5 relative precision) and light deflection (BE-51, 0.000105/1.7516 ≈
  6e-5) — and PPN β once, more coarsely, via Mercury's perihelion (BE-52, ±0.45″/cy
  on 43.11″/cy ≈ 1%). Two parameters, three independent measurements, all within 1σ.
- **Moderate-precision consistency checks.** BE-56 (Casimir, ~1% vs the CORRECTED
  theory — systematics-dominated, not a clean coefficient test), BE-35 (3D-Ising
  ν, 0.015σ, but
  experiment's ±0.002 is ~500× coarser than the bootstrap's ±0.000004 — the test
  is limited by experiment, not by the theory), BE-23 (Planckian α = 1.0 ± 0.4,
  a factor-of-2 window), BE-11 (parameter-free but only ~15% gas-to-gas
  agreement), BE-21 (satisfies the KSS bound but sits ~26% above it — a
  consistency check, not a stringent test of the bound itself).
- **Weak, one-sided bounds — "not excluded," not "confirmed."** BE-48 (GRW
  collapse rate sits ~8 orders of magnitude below the LISA-Pathfinder bound —
  loose enough that the confrontation cannot yet stress the theory) and BE-36
  (one-sided, per the caveat above — GW170817's asymmetric bound is only half
  tested by the bridge's symmetric encoding).

None of this diminishes the spine — the two-PPN-parameter, ~10⁻⁵ core is a real,
independently-reproducible confirmation of GR — but the honest picture is a
hierarchy, and the weaker rows should not be read as carrying the same evidential
weight as the GR core.

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
70-axis-clash, and 9-confrontation figures are standing regression gates — a
future change that manufactures a false `genuine`, resurfaces a falsified
coincidence, or fabricates a confrontation fails CI.
