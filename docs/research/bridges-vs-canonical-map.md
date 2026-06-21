# Bridges vs. Standard Physics — a Location Map

**Snapshot:** codebase v0.27.0, 2026-06-20. Point-in-time research finding
(re-derive with the commands at the end; numbers will move as the catalog/canonical
registry evolve).

## Question

Where do the **bridge equations** sit relative to **standard physics**? Concretely:
overlay each catalog bridge onto the canonical (textbook L-layer) graph and ask
which bridges share a quantity with established physics — and through which
quantities — versus which float free of it.

## Method

Each catalog bridge edge (`CATALOG_GRAPH`) is injected into the canonical graph
(`CANONICAL_GRAPH`) as a `user` junction — the same mechanism as
`upt map --source=canonical --equation "…"` — and its **landing** is read off
(`equationLanding`): the connected component it joins, the quantities that link it
there, and the canonical laws in that component.

**"Location" = shared-quantity adjacency**, which is the graph's actual linkage
rule: exact and formula-independent (we feed each bridge's quantity *set*; the RHS
operator is irrelevant to where a junction lands). The dimensional verdict that
`--equation` also prints is *not* used here — it is synthetic for a bare quantity
set. **Sharing a quantity name is necessary, not sufficient, for a real physical
connection** — many such adjacencies are dimensional coincidences, not derivations
(see `upt discover` and the rest of `docs/research/`).

## Result

41 catalog edges mapped onto the canonical graph (47 quantities / 26 law edges):

| | count |
|---|---|
| **Connect** to standard physics (share a quantity with a textbook law) | **17** |
| **Isolated** from it (share no quantity with the L-layer) | **24** |

### The 17 that connect

Almost all dock at the same two observables the canonical graph itself hubs on.
"→ core" = joins the 16-law anchored cluster (`mass`/`temperature` hub); the rest
attach to an otherwise-isolated canonical law (cosmology / Planck units).

| Bridge | name | shares with canonical | lands |
|---|---|---|---|
| `law-schwarzschild-radius` | Schwarzschild radius `r_s = 2GM/c²` | `{mass}` | → core (16) |
| BE-12 | Mesoscopic coherence length (Caldeira–Leggett) | `{mass, temperature}` | → core (16) |
| BE-16 | Information–thermodynamics (Landauer) | `{temperature}` | → core (16) |
| BE-23 | Strange-metal ↔ black-hole (SYK Planckian) | `{temperature}` | → core (16) |
| BE-27 | Fluctuation–dissipation violation (active matter) | `{temperature}` | → core (16) |
| BE-33 | Quantum-classical critical-point mapping (Hertz) | `{temperature}` | → core (16) |
| BE-37 | Shapiro gravitational time delay | `{mass}` | → core (16) |
| BE-38 | Entropic-gravity / MOND force | `{mass}` | → core (16) |
| BE-42 | Hawking temperature (1975) | `{mass, temperature}` | → core (16) |
| BE-42-via-rs | Hawking temperature (via `r_s`) | `{temperature}` | → core (16) |
| BE-48 | GRW/CSL mass-amplified localization rate | `{mass}` | → core (16) |
| BE-51 | Gravitational lensing (Eddington 1919) | `{mass}` | → core (16) |
| BE-52 | Mercury perihelion precession (Einstein 1915) | `{mass, semi-major-axis}` | → core (16) |
| BE-19 | Quantum Bounce equation | `{hubble-rate-squared}` | → Friedmann (1) |
| BE-54 | Randall–Sundrum brane cosmology | `{hubble-rate-squared}` | → Friedmann (1) |
| BE-31 | Causal-set continuum limit | `{planck-length}` | → Planck-length law (1) |
| BE-41 | Swampland distance conjecture | `{planck-mass}` | → Planck-mass law (1) |

**Bridgehead quantities** (how many bridges attach through each):

| quantity | bridges |
|---|---|
| `mass` | 8 |
| `temperature` | 7 |
| `hubble-rate-squared` | 2 |
| `planck-length` | 1 |
| `planck-mass` | 1 |
| `semi-major-axis` | 1 |

### The 24 isolated from standard physics

Share no quantity with the textbook L-layer — the speculative frontier with no
observable to pin it to known physics:

BE-11 (decoherence — both the master-equation and Zurek encodings, 2 edges),
BE-13 (information-geometry / Jacobson),
BE-14 (QEC holographic mapping), BE-15 (universal emergence / Hohenberg–Halperin),
BE-17 (Einstein–Cartan torsion–spin), BE-18 (non-Abelian dark matter),
BE-20 (cosmological-constant density), BE-21 (KSS viscosity bound),
BE-22 (topological entanglement entropy), BE-24 (photosynthesis coherence / FRET),
BE-25 (IIT consciousness / Φ), BE-26 (DNA mutation tunnelling),
BE-30 (entanglement–geometry / FLM), BE-34 (Kibble–Zurek in curved spacetime),
BE-36 (MOND–dark-matter interpolation / TeVeS), BE-39 (asymptotic safety),
BE-43 (ER=EPR wormhole–entropy), BE-45 (trans-Planckian censorship),
BE-46 (multiverse measure), BE-47 (BBN dark-sector coupling),
BE-49 (quantum Darwinism), BE-50 (retrocausal QFT), BE-53 (Yang–Mills β-function).

## Reading

This quantifies UPT's founding tension. The catalog *aspires* to a connected
rank-6 tensor of physics, but against the textbook L-layer it is **~40% attached,
~60% adrift**, and the attachment is funnelled through just two quantities:
**`mass` (8) and `temperature` (7)** — the same gravitational/thermal hubs the
canonical graph and the bridge catalog both cluster on. The bridges that earn a
foothold in known physics do so where everything else already crowds; the
genuinely exotic proposals (consciousness, DNA tunnelling, ER=EPR, MOND, soft
hair, the multiverse measure) share no observable with standard physics at all.

The handful that dock on canonical physics' *isolated tail* are the cosmology /
Planck-scale bridges: BE-19 & BE-54 ↔ the Friedmann equation
(`hubble-rate-squared`), BE-31 ↔ the Planck length, BE-41 ↔ the Planck mass.

## Reproduce

```bash
# single bridge, via the CLI:
node bin/upt.mjs map --source=canonical --equation "temperature = mass"   # BE-42 shape
# the full sweep is a short script over CATALOG_GRAPH + CANONICAL_GRAPH using the
# public buildVizModel + equationLanding (the same engine --equation uses).
```
