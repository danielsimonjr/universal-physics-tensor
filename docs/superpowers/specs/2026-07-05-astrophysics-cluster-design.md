# Astrophysics Bridge Cluster (BE-63…66): Design

**Date:** 2026-07-05 · **Status:** r2 — Adam/Eve vet COMPLETE (2026-07-05) + owner decision.
Vet outcome: BE-63 YELLOW/YELLOW (not tight — super-Chandrasekhar SNe reach 2.4–2.8 M_⊙),
BE-64 RED(Adam)/GREEN(Eve) (super-Eddington sources exist), BE-65 GREEN/YELLOW (order-of-mag),
BE-66 **DEFER/DEFER unanimous** (TOV max mass is EOS-dependent, not a single constant; neither
a clean evaluator nor clean data). **Owner decision: ship 3, drop TOV.** All three encode as
CONSISTENCY-WITH-CAVEAT (astrophysics scatters more than lab physics). Spine 16→19, catalog
52→55, established 16→19. Numbers verified: M_Ch≈1.46 M_⊙ (m_u convention), L_Edd(M_⊙)≈1.26e31 W.

## Motivation

The second branch-physics expansion. Unlike the condensed-matter cluster (which tested the
topology/statistics axes and measured them dormant), this cluster is **spine-focused**: four
established, data-confrontable stellar-astrophysics results with clean closed forms. They
carry the gravitational force axis (already gated), so they do **not** populate any ungated
axis — this is deliberate, chosen for maximum clean spine growth, not an axis test. The
Symmetry axis remains untested (deferred to a future particle-physics cluster).

Evidence spine **16 → 20**; catalog **52 → 56**; established **16 → 20**.

## Part 1 — Four established bridges (BE-63…66), closed-form-evaluator pattern

Same pattern as BE-55…62: catalog entry + evaluator + `EXPECTED_DIMENSION_BY_BRIDGE` +
orphan-signature allowlist, no AST round-trip. Every bridge Adam/Eve-vetted, every number
primary-source-verified before encoding (the BE-11/BE-55 lesson).

| id | bridge | equation | evaluator out | confrontation |
|---|---|---|---|---|
| BE-63 | **Chandrasekhar mass** | M_Ch = (ω₃⁰√(3π)/2)(ℏc/G)^{3/2}(μ_e m_H)⁻² | mass [M] | ≈1.4 M_⊙ vs white-dwarf max mass + Type Ia SN uniformity (tight) |
| BE-64 | **Eddington luminosity** | L_Edd = 4πGM m_p c/σ_T | power [L²MT⁻³] | AGN/X-ray-binary luminosities capped at L_Edd (tight) |
| BE-65 | **Jeans mass** | M_J = (5k_BT/Gμm_H)^{3/2}(3/4πρ)^{1/2} | mass [M] | molecular-cloud fragmentation scale (CONSISTENCY + order-of-magnitude caveat) |
| BE-66 | **TOV neutron-star max mass** | M_TOV (EOS-dependent, ≈2.2–2.9 M_⊙) | mass [M] | observed max pulsar mass ~2.08 M_⊙ (PSR J0740+6620) < M_TOV (CONSISTENCY BOUND + EOS caveat) |

**Physics-correctness flags for the vet (honest-claude):**
- BE-63 μ_e is the mean molecular weight per electron (2 for C/O white dwarfs). Verify ω₃⁰≈2.018
  (Lane-Emden n=3) and M_Ch≈1.44 M_⊙ against Chandrasekhar 1931 / Shapiro-Teukolsky.
- BE-64 uses the Thomson cross-section σ_T=6.6524587×10⁻²⁹ m²; verify L_Edd(M_⊙)≈1.26×10³¹ W.
- **BE-65 (Jeans) and BE-66 (TOV) are the fuzzy pair** (like BE-61/62 last cluster): Jeans mass
  is an order-of-magnitude collapse criterion, and the TOV limit is EOS-dependent (2.2–2.9 M_⊙).
  Both confront as CONSISTENCY-WITH-CAVEAT, not tight tests — the caveat is recorded in the
  confrontation provenance. If the vet finds either uncomputable/too-fuzzy to confront honestly,
  DEFER it (BE-57-Unruh precedent) rather than fabricate agreement.

## Part 2 — Axis measurement (confirmatory, expected null)

These quantities carry gravitational force (gated) + cosmological/classical scale; they do NOT
carry topology/statistics/symmetry. Re-run `auditAxisDiscrimination` to confirm the ungated
axes are unchanged (still `fires=0`) — a one-line confirmation, not a new result. No graph
tagging of new-axis attributes (there is none to add honestly).

## Testing & invariants

- Per-bridge: `tests/bridges/be-63…66-*.test.ts` (evaluator + confrontation + catalog entry).
- Invariant updates (the BE-59…62 checklist re-applied): catalog 52→56, established 16→20,
  `DATA_CONFRONTED_IDS` 16→20, membership 44→48 bridges, `EXPECTED_DIMENSION_BY_BRIDGE` 50→54,
  orphan allowlist +4 (→14), IDs 11→66 contiguous, catalog-adapter submittable 31→35,
  canonical gap 44→48, catalog-json + goldens + public-surface snapshot regen.
- Full gate + DGT clean; release (v0.43.0).

## Non-goals (YAGNI + honesty)

- No axis-gate flips (astrophysics populates only the already-gated gravity axis).
- No AST encodings (closed-form evaluators only).
- If BE-65/66 cannot be honestly confronted, DEFER rather than inflate.
- Four bridges is the scope — not an open-ended astrophysics sweep.
