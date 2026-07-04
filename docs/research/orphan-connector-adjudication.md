# Orphan-Connector Adjudication — the isolated frontier is genuinely isolated

**Dates:** Round 1 2026-06-21 (CI-1…3); Round 2 2026-07-04 (CI-4…7, incl. the
holographic pair). **Reviewers:** Adam (gemini-2.5-pro) + Eve (o3), independent.
**Subject:** the "same-kind connectors" `upt connectors` flags as the most-motivated
candidates to pull an ISOLATED bridge into the connected core. **Running total: 0 of 7
adjudicated genuine.**

## Question

Of the ~17 isolated bridges (share no quantity with any other edge), 7 have a
**same-kind connector** — a quantity that matches a core quantity in *both* dimension
*and* name token (e.g. `*-rate ≟ *-rate`). Same-kind is a stronger prior than bare
same-dimension, so these are the catalog's structural frontier. But is any of them a
*genuine physical identity* (the two quantities really denote one thing, so the
bridges should be linked), or are they all **decoys** (same name-category, different
physics)? Reviewers were told to default to DECOY without a specific physical reason.

The top three (incl. CI-1, previously flagged "genuinely motivated" in
`Linkage-Candidate-Proposals.md`):

## Verdicts — unanimous DECOY (0 of 3 genuine)

| # | Connector | Adam | Eve | Decision |
|---|---|---|---|---|
| CI-1 | `coarsening-length` (BE-15, Kibble–Zurek quench) ≟ `quantum-correlation-length` (BE-33, quantum-critical ξ) | DECOY | DECOY | **Decoy** |
| CI-2 | `tunneling-mass` (BE-26, DNA proton in a double well) ≟ `effective-mass` (BE-23, SYK quasiparticle) | DECOY | DECOY | **Decoy** |
| CI-3 | `mutation-rate` (BE-26, DNA point mutation) ≟ `decoherence-rate` (BE-11, environmental decoherence) | DECOY | DECOY | **Decoy** |

- **CI-1.** A coarsening length is a *non-equilibrium* domain size formed by quenching
  *through* a critical point; the quantum correlation length ξ is an *equilibrium*
  static property *at* it. Different processes — not the same length.
- **CI-2.** A proton's inertia in a specific biomolecular potential vs. an emergent
  electronic quasiparticle's effective mass in a strongly-correlated metal. Different
  particles, different Hamiltonians, unrelated scales.
- **CI-3.** A decoherence rate (loss of quantum phase to the environment) vs. a
  mutation rate (frequency of a permanent, classical change to a DNA sequence). Same
  units, no shared physical meaning — decoherence may *precede* a mutation, but they
  are not one quantity.

## Outcome & refinement

**0 of the motivated orphan connectors survive adjudication.** This *refines* the
earlier `Linkage-Candidate-Proposals.md` conclusion, which had flagged CI-1 (the
critical-dynamics correlation length) as the one "genuinely motivated" missing link
worth a physicist's hour: on that hour of review, it too is a decoy.

The takeaway is a positive one for the framework's honesty: **the isolated-bridge
frontier is isolated because the physics genuinely does not connect, not because of a
vocabulary gap.** The ~17 orphans are an honest reflection of disconnected speculative
physics — exactly what UPT's standing caveat predicts ("most cross-cluster links are
dimensional coincidences"). Same-*kind* (shared token) is a stronger prior than
same-*dimension*, yet here it still yields zero genuine links — a useful calibration
of how weak even the strongest purely-structural prior is. No
`QUANTITY_IDENTIFICATIONS` entry is added; the orphans stay isolated.

Contrast with the one alias that *did* survive review (`thermal-de-broglie-wavelength
≡ thermal-wavelength`, see `bridges-vs-canonical-map.md`): there, two names denoted
the *same* physical quantity (the thermal de Broglie wavelength). Here, the names
rhyme but the physics differs. That is the whole distinction the firewall protects.

## Round 2 (2026-07-04) — the strongest remaining candidates, incl. the holographic pair

A second pass took the four candidates a physicist is *least* likely to dismiss on
sight — the ones with a real theoretical story behind the name match, not the generic
`*-energy`/`*-mass`/`*-length` decoys. Same reviewers, same strict bar: a connector is
genuine only if the two names denote the **same physical quantity** (a true alias),
not if they are merely dimensionally equal, share a functional form, or are related by
an approximation. Default DECOY.

| # | Connector | Adam | Eve | Decision |
|---|---|---|---|---|
| CI-4 | `boundary-entanglement-entropy` (BE-14, Ryu–Takayanagi, S=A/4G) ≟ `bh-entropy` (Bekenstein–Hawking, S=A/4G) | DECOY | DECOY (0.88) | **Decoy** |
| CI-5 | `wormhole-entanglement-entropy` (BE-43, ER=EPR) ≟ `bh-entropy` | DECOY | DECOY (0.86) | **Decoy** |
| CI-6 | `attempt-frequency` (BE-26, WKB/Kramers escape ν₀) ≟ `debye-frequency` (phonon cutoff ω_D) | DECOY | DECOY (0.91) | **Decoy** |
| CI-7 | `gravitational-wave-speed` (BE-36) ≟ `speed-of-light` c | DECOY | DECOY (0.92) | **Decoy** |

- **CI-4 / CI-5 (the holographic pair).** The sharpest test of the firewall: RT
  entanglement entropy and Bekenstein–Hawking entropy *both* equal Area/4G, so the
  name and the form match. But they are different systems — a boundary-QFT subregion's
  entanglement vs a bulk horizon's thermodynamic entropy. "Equality without identity"
  (Eve): they obey the same holographic *law*, they are not the same *quantity*. Same
  ruling as the BE-29 Landauer form-coincidence — a shared formula is not a partnership.
- **CI-6.** The escape "attempt frequency" ν₀ is set by the curvature of a specific
  barrier potential; the Debye frequency ω_D is a solid's phonon band-edge cutoff. ν₀
  is *estimated* as ~ω_D in escape models — an order-of-magnitude convenience, never a
  definitional alias.
- **CI-7.** v_GW is the very observable BE-36 exists to *bound* against c
  (|c_GW − c|/c). GR predicts v_GW = c (GW170817 confirms to ~1e-15), but that is a
  *testable prediction*, not a definition — encoding the alias would assert precisely
  what the bridge is built to test. Keep distinct.

## Running total: 0 of 7 connector candidates genuine

Across both rounds (CI-1…CI-7), **zero** of the most-motivated same-kind connectors
survive adjudication — including the holographic entropy pair, the strongest
theoretical case in the whole surface. The isolated-bridge frontier is isolated
because the physics genuinely does not connect, not because of a vocabulary gap. No
`QUANTITY_IDENTIFICATIONS` entry is added; the orphans stay isolated. This is the
honest result of "build the connectors" — run through the firewall, there is nothing
genuine to build.

## Reproduce

```bash
node bin/upt.mjs connectors    # the same-kind connector surface (review queue)
# adjudication is a human/review record.
```
