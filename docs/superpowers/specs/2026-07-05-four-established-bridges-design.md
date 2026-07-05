# Four New Established Bridges (BE-55…58): Design

**Date:** 2026-07-05 · **Status:** ✅ **BUILT (r2).** Primary-source-grounded +
adversarial Adam/Eve vet COMPLETE (GREEN/GREEN-YELLOW/DEFER/GREEN) + encoded +
gated. Catalog **44 → 48** (established **8 → 12**); evidence spine **9 → 12**
(BE-55/56/58; BE-57 deferred). The Topology axis is now populated (BE-55). Full
gate 3622/338; DGT clean (0 cycles/unused/exports, 98.4% coverage). Caught + fixed
a 10× arithmetic error in BE-58's σ during verification (residual 8.1σ → 0.81σ).

## Adam/Eve adversarial physics vet (2026-07-05)

- **BE-55 Quantum Hall — GREEN/GREEN.** Equation, conductance dimension, and the
  UNIVERSALITY confrontation (non-circular: compares disparate materials with the
  same constant) all confirmed. Encoding note: graphene's ½-integer shift is
  absorbed into C (Eve).
- **BE-56 Casimir — GREEN(Adam)/YELLOW(Eve).** π²/240, sign, and pressure
  dimension correct. **HONESTY REFINEMENT (Eve):** the raw 1997/1998 results do
  NOT test the *ideal* coefficient to 1–5% by themselves — large model-dependent
  corrections (finite conductivity, surface roughness, temperature, electrostatic
  patches) must be subtracted, and the modern limit is SYSTEMATICS-DOMINATED. The
  confrontation must be framed as "agreement with the CORRECTED theory,
  systematics-dominated, ~1%," NOT a clean test of the bare π²ℏc/240d⁴ coefficient.
  Encode the confrontation provenance with that caveat.
- **BE-57 Unruh — DEFER/DEFER.** 2π factor and temperature dimension confirmed;
  no lab data (T~4×10⁻²⁰ K per 1g). Encode as established bridge, confrontation
  deferred (Hawking's kinematic sibling, BE-42).
- **BE-58 Johnson-Nyquist — GREEN/GREEN.** Factor 4 (one-sided) and S_V dimension
  correct; the JNT-k_B-vs-CODATA confrontation is genuinely independent (resistance
  traceable to QHE, temperature to ITS-90/acoustic thermometry), not circular.
  "Factor-of-4 confirmed to < ppm" (Eve).

## Motivation

A PI audit found the catalog is **82% speculative** (36/44), the **Topology axis of
the rank-6 tensor is nearly empty** (only BE-22 touches topology), and the evidence
spine is starved of established, data-confrontable bridges. These four are all
textbook-established, cross-regime, and (three of four) data-confrontable — chosen
to rebalance the catalog toward falsifiable physics and grow the spine (9 → 12).

## Grounding — equations + data verified against primary sources

Equations are standard textbook physics. Data values + citations verified via
published sources (WebSearch/primary papers), NOT reviewer recollection (the more
reliable check — it caught the reviewers' own fabrication on BE-11).

### BE-55 — Integer Quantum Hall / TKNN (topology ↔ electrical transport)
- **Equation:** σ_xy = C·e²/h (C = integer Chern/TKNN number); equivalently the
  quantized Hall resistance R_H = R_K/C with von Klitzing constant R_K = h/e².
- **Dimension:** σ_xy = electrical conductance = [I² T³ M⁻¹ L⁻²]; R_H = resistance
  = [I⁻² T⁻³ M L²].
- **Confrontation (consistency — UNIVERSALITY, not the definition):** post-2019 SI,
  R_K = h/e² is EXACT by definition, so confronting R_H against h/(Ce²) is circular.
  The genuine empirical content is **material-independence**: the quantized Hall
  resistance is identical across completely different materials. Epitaxial graphene
  vs GaAs/AlGaAs agree to a relative **8.6×10⁻¹¹** (the most stringent universality
  test). Citation: Janssen et al., "Graphene, universality of the quantum Hall
  effect and redefinition of the SI" (arXiv:1105.4055; Metrologia 2012). Encode as
  a consistency confrontation: predicted ratio 1 (material-independent), observed
  ratio 1 within 8.6e-11.
- **Verdict:** GREEN. Fills the empty Topology axis; most precise condensed-matter
  confrontation available.

### BE-56 — Casimir effect (quantum vacuum ↔ classical macroscopic force)
- **Equation:** F/A = −π²ℏc / (240 d⁴) (ideal parallel plates).
- **Dimension:** pressure = [M L⁻¹ T⁻²].
- **Confrontation (consistency):** measured Casimir force agrees with theory (incl.
  finite-conductivity/roughness/temperature corrections) to ~**1%** at smallest
  separation (Mohideen & Roy 1998, PRL 81:4549, arXiv:physics/9805038) / ~**5%**
  (Lamoreaux 1997, PRL 78:5). Real experiments use sphere-plate geometry → encode as
  a consistency statement (agreement within ~1%), not a single-σ residual.
- **Verdict:** GREEN.

### BE-57 — Unruh effect (acceleration/kinematics ↔ quantum-thermal)
- **Equation:** T = ℏ a / (2π c k_B) (a = proper acceleration).
- **Dimension:** temperature = [Θ].
- **Confrontation:** NONE. Lab accelerations give T ~ 10⁻²⁰ K (unmeasurable);
  analog-gravity results are indirect. **DEFER** — encode as an established bridge
  (the kinematic sibling of Hawking, BE-42, which IS in the catalog) with no data
  test, honestly labeled.
- **Verdict:** DEFER-CONFRONTATION (established bridge, unconfrontable for now).

### BE-58 — Johnson-Nyquist / fluctuation-dissipation (thermal ↔ electrical)
- **Equation:** S_V = 4 k_B T R (one-sided voltage-noise power spectral density; the
  factor is 4 one-sided / 2 two-sided).
- **Dimension:** S_V = [V²/Hz] = [M² L⁴ T⁻⁵ I⁻²].
- **Confrontation (value):** NIST Johnson Noise Thermometry measured k_B through the
  Nyquist relation = 1.3806429(69)×10⁻²³ J/K, a relative offset **−4.05×10⁻⁶ ± 5.0×
  10⁻⁶** from CODATA 2014 → residual **0.81σ, within 1σ**. Citation: Flowers-Jacobs
  et al. 2017, Metrologia 54:730. (The catalog already has BE-27, the *speculative
  active-matter FDT violation*; this is the established theorem it violates.)
- **Verdict:** GREEN.

## Encoding plan

Follow the **closed-form-evaluator** pattern (BE-51/52 precedent — catalog entry +
a closed-form evaluator + a confrontation module, NO full AST round-trip encoding;
each is registered in `EXPECTED_DIMENSION_BY_BRIDGE`). Per bridge:
1. Catalog entry in `src/bridges/index.ts` (id 55–58, category, `bridges` regimes,
   status `established`, context, formula_latex, references, dimensional_signature,
   tractability_class, notes).
2. A closed-form evaluator (`src/bridges/be55-quantum-hall.ts`, etc.).
3. `src/dimensional/bridge-check.ts` `EXPECTED_DIMENSION_BY_BRIDGE` entry.
4. Confrontation module + registration (BE-55/56/58; BE-57 deferred) →
   DATA_CONFRONTED_IDS 9 → 12.
5. Update all catalog-count invariants (44 → 48): catalog-integrity, catalog-json,
   descriptor-consistency, membership, bridges-index, confrontation-coverage, cli
   goldens, public surface, status distribution (established 8 → 12).

**Sequential execution** (shared catalog invariants forbid parallel edits): BE-55
→ BE-56 → BE-57 → BE-58, gating + committing each. Then final full gate + DGT.

## Firewall note

Adding to the catalog is normally firewalled behind human adjudication + citation;
the owner's "put all through the pipeline" is that authorization. The adversarial
Adam/Eve physics vet is PENDING (reviewer tools down) and should re-run before these
are considered fully adjudicated — flagged in `notes` on each entry.
