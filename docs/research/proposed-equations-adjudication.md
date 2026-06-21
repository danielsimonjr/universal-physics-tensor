# Proposed Equations — Adjudication (Status-Promotion Protocol)

**Date:** 2026-06-21. **Reviewers:** Adam (gemini-2.5-pro) + Eve (o3), independent
adversarial physics review (Part-VI §XXVII-B). **Subject:** the 5 machine-derived
proposed equations (`upt discover --source=both --derive`; Part-XI), all carrying
`status: 'unadjudicated'`.

## Question

Each proposed equation is the algebraic consequence of *identifying* two
equal-dimension quantities from textbook laws. The identification — not the algebra
— is what needs judging. For each, is the identity `a ≡ b`:

- **A — recognized** physical law/identity,
- **B — trivial/redundant** (true, but a restatement or definitional consequence of
  the two source laws, not a new relation), or
- **C — dimensional coincidence** (same dimension, no mechanism → reject)?

Reviewers were instructed to default to **C** unless a genuine mechanism exists.

## Verdicts

| PE | Identification | Derived | Adam | Eve | Decision |
|---|---|---|---|---|---|
| PE-1 | erasure-energy ≡ photon-energy | `ν = k_B·ln2·T/h` | C | C | **Reject — coincidence** |
| PE-2 | dark-fermion-mass ≡ erasure-energy | `T = vg/(k_B·ln2)` | C | C | **Reject — coincidence** |
| PE-3 | photon-energy ≡ rest-energy | `m = hν/c²` | A | B | **Recognized, redundant — do NOT promote** |
| PE-4 | dark-fermion-mass ≡ rest-energy | `m = vg/c²` | B | C | **Reject — trivial/definitional** |
| PE-5 | peak-wavelength ≡ hubble-distance | `T = bH/c` | C | C | **Reject — coincidence** |

### Notes per proposal

- **PE-1 (Landauer photon).** Landauer's `k_B T ln2` is a statistical lower bound on
  heat dissipated to a reservoir; equating it to a single photon's `hν` has no
  universal mechanism — it rewrites thermal energy in frequency units. *Landauer 1961,
  IBM J. Res. Dev. 5:183.*
- **PE-2.** A speculative hidden-sector mass `m = gv` set equal to a context-dependent
  erasure energy — no model links a particle mass to an arbitrary processor's
  temperature. *Alexander et al., "Dark Sectors 2016", arXiv:1608.08632.*
- **PE-3 (mass–frequency).** Real and foundational — `ν = mc²/h` is the Compton /
  de-Broglie frequency, central to e⁺e⁻ annihilation — **but already entailed by the
  L-layer's `E=hν` (CE-planck-einstein) and `E=mc²` (CE-mass-energy)**. Adam read it
  as *recognized* (A), Eve as a *trivial textbook consequence* (B); both agree it is
  **not a new discovery**, so it is not promoted into the catalog. *Einstein 1905; de
  Broglie 1924; Essen, Metrologia 21:149 (1985).*
- **PE-4.** `m = vg/c²` re-expresses the dark-fermion mass via `E=mc²` instead of via
  Landauer (cf. PE-2) — a definitional application, not a new bridge. (The CLI's
  derived form is dimensionally consistent; the `gv`-vs-`mc²` unit concern Eve raised
  applies to the naive identity, not the c²-corrected relation the surfacer emits.)
- **PE-5 (Hubble–Wien).** A blackbody peak wavelength equated with the cosmological
  horizon — disparate domains, no mechanism; numerically off by ~10²⁹ for the CMB.
  The clearest "coincidence, not physics" case. *Wien 1893; Hubble 1929.*

## Outcome

**0 of 5 promoted.** 4 rejected as dimensional coincidences / trivial restatements;
1 (PE-3) recognized as real but already entailed by the L-layer (redundant, not a
discovery). No catalog change (`BRIDGE_EQUATIONS` untouched; the epistemic firewall
holds — nothing was promoted via `promoteProposal`).

This is the intended end state of the discovery pipeline: **discover → surface as
unadjudicated → firewall → independent adjudication → zero false positives promoted.**
The honest yield of automated link-discovery over standard physics is *nothing new* —
and that conclusion now has two independent reviews on record. The proposals remain
useful only as a documented review surface (Part-XI), not as physics.

## Reproduce

```bash
node bin/upt.mjs discover --source=both --derive    # regenerate the 5 proposals
# adjudication is a human/review record; the surfacer always emits 'unadjudicated'.
```
