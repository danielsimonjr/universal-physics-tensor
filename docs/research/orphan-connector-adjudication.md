# Orphan-Connector Adjudication — the isolated frontier is genuinely isolated

**Date:** 2026-06-21. **Reviewers:** Adam (gemini-2.5-pro) + Eve (o3), independent.
**Subject:** the "same-kind connectors" `upt connectors` flags as the most-motivated
candidates to pull an ISOLATED bridge into the connected core.

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

## Reproduce

```bash
node bin/upt.mjs connectors    # the same-kind connector surface (review queue)
# adjudication is a human/review record.
```
