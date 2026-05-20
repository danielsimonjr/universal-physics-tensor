# Batch D — specification Part I–IV — Doc Integrity Findings
**Reviewer**: opus subagent. **Date**: 2026-05-20. **Files**: Part-I..IV.md.

## Summary
9 findings: 0 CRITICAL, 4 HIGH, 4 MEDIUM, 1 LOW. The spec is a formal/visionary
document that is internally careful and heavily self-hedged, but it has drifted
from the implemented catalog: the bridge count is stated as 40 throughout while
the codebase ships 42 (IDs 11–52), and BE-36/BE-37 carry stale formulations.
No outright hallucinations of implemented behavior were found.

## Findings

### D-1 — HIGH — Part-II §V "BE-37 Variable Speed of Light Cosmology" status
- **Claim**: "**Status**: **INVALID** (R3 disposition, 2026-05-05). Preserved as historical record; not a falsifiable physical claim." / "**Formula (excised 2026-05-06)**".
- **Verification**: `src/bridges/index.ts` lines 1190–1240 — BE-37 `id: 37`, `name: 'Modified light-propagation: Shapiro gravitational time delay'`, `status: 'speculative'`, `formula_latex: \\Delta t = \\frac{2 G M}{c^3} \\ln(R_far/R_near)`. AST module `src/bridges/equations/be-37-shapiro-delay.ts` exists.
- **Reality**: BE-37 was reformulated (Wave Z-F) from the invalid VSL ansatz to the canonical Shapiro gravitational time delay. The catalog entry is now `speculative` with a live formula and a Tier-5 AST encoding; it is no longer INVALID or excised.
- **Verdict**: STALE
- **Suggested fix**: Rewrite Part-II BE-37 to the Shapiro-delay formulation (name, status `speculative`, formula `Δt = (2GM/c³)·ln(R_far/R_near)`), keeping the VSL ansatz only as a historical-record note.

### D-2 — HIGH — Part-II §V "BE-36 MOND/TeVeS" formulation vs encoded bridge
- **Claim**: BE-36 "Mathematical Formulation (canonical Bekenstein 2004 TeVeS): S = S_g + S_φ + S_A + S_matter" with the TeVeS action presented as the operative formula.
- **Verification**: `src/bridges/index.ts` lines 1131–1189 — BE-36 `formula_latex: \\frac{|c_{GW}-c|}{c} \\leq 10^{-15}`, `dimensional_signature: '[1]'`; AST module `be-36-gw-speed-bound.ts`; notes record "Reformulated 2026-05-07 (Wave Y): replaced the operator-valued TeVeS action … with the canonical GW170817 graviton-speed bound."
- **Reality**: The catalog's encoded BE-36 bridge is the GW170817 dimensionless graviton-speed bound `|c_GW−c|/c ≤ 10⁻¹⁵`. TeVeS is retained only as the bridge *framing* in `references`/`notes`. The spec still presents the TeVeS action as the formula.
- **Verdict**: STALE
- **Suggested fix**: Update Part-II BE-36 to present the GW170817 bound as the Mathematical Formulation, with TeVeS demoted to framing context (mirrors the codebase Wave Y reformulation).

### D-3 — HIGH — Part-I/II/III "40-bridge catalog" count
- **Claim**: Part-I Appendix A: "BE-11 through BE-50"; Part-III Definition 8.1: "I(Π) = log_2 N_populated (currently log_2 40 ≈ 5.32 bits)"; Part-IV Appendix B.1: "The catalog is finite (40 BE entries × 6 label sets)."
- **Verification**: `src/bridges/index.ts` — 42 catalog entries, `id` 11–52 (grep `id:\s*\d+` → 11..52). Entries 51 (gravitational lensing) and 52 (Mercury perihelion) are labeled in-source "beyond the original 40-bridge spec catalog (IDs 11-50)".
- **Reality**: The implemented catalog has 42 bridges (IDs 11–52). The spec consistently says 40 / IDs 11–50 and omits BE-51 and BE-52 entirely. The `log_2 40 ≈ 5.32` figure in Part-III Def 8.1 is now numerically off (`log_2 42 ≈ 5.39`).
- **Verdict**: STALE (spec predates the v0.4.0 BE-51/BE-52 additions)
- **Suggested fix**: Either add BE-51/BE-52 to the Part-II catalog, or add a spec-scope note that the formal catalog covers IDs 11–50 and IDs 51–52 are codebase-only v0.4.0 additions. Update the `log_2 40` numeral.

### D-4 — HIGH — Part-III Computational Complexity / Part-IV §12.2 stale "formally-divergent" tractability claim
- **Claim**: Part-IV §12.2.1 "many entries are formally divergent (e.g., BE-20 cosmological-constant integral, BE-50 distributional path integral)"; §12.2.1 also "BE-25 … formally divergent" implied via §D10.
- **Verification**: BE-25 catalog status `speculative` (line ~742), AST module `be-25-iit-phi.ts` exists; Part-II §BE-25 itself states "**Wave Q B1 / CS iter-6 C1** corrected the prior `formally-divergent` label" → tractability is now `numerical-asymptotic`. BE-50 reformulated to Wheeler-Feynman (`be-50-wheeler-feynman.ts`).
- **Reality**: Part-II was updated to retract the `formally-divergent` label for BE-25, but Part-IV §12.2.1's bullets still cite the old tractability framing and the BE-25/BE-50 examples are partially superseded by their reformulations.
- **Verdict**: STALE / CONSISTENCY (Part-II vs Part-IV disagree on BE-25 tractability)
- **Suggested fix**: Reconcile Part-IV §12.2.1 tractability examples with the current per-bridge `tractability_class` values; drop or update the BE-25 example.

### D-5 — MEDIUM — Part-II preamble status note bridge-range
- **Claim**: Part-II status note: "This document catalogs Bridge Equations 21-50." and "the off-diagonal BEs 11-50" (Part-I §1.3 invariant 4 note).
- **Verification**: Catalog IDs run 11–52; Part-II actually documents BE-21..BE-50 in body text. BE-51/52 are uncatalogued in the spec.
- **Reality**: Internally Part-II is self-consistent (21–50), but the framework-wide "11-50" range statements are stale by two entries — same root cause as D-3.
- **Verdict**: STALE
- **Suggested fix**: Same as D-3; once BE-51/52 are addressed, update the range strings.

### D-6 — MEDIUM — Part-I §1.3 / Part-III "the validator's named SI dimensions"
- **Claim**: Part-IV §12.2.1.1: validator works "over named SI dimensions (`L, M, T, I, Theta, N, J`)."
- **Verification**: `src/dimensional/types.ts` lines 19–33 — `interface Dimension { L; M; T; I; Theta; N; J }` (7 base dimensions). Comment line 5 enumerates the same 7.
- **Reality**: ACCURATE — the spec's 7-dimension list exactly matches the `Dimension` interface. (Note: the review brief's "22 SI dimensions" figure is not a spec claim and does not match the codebase; the spec is correct here.)
- **Verdict**: FALSE-ALARM-OK
- **Suggested fix**: none — Part-IV §12.2.1.1 is accurate; flagged only to record that the "22 dimensions" premise is wrong, the spec's "7" is right.

### D-7 — MEDIUM — Parts I–IV omit the v0.5.0/v0.6.0 curvature & Killing-vector AST layer
- **Claim**: Part-I "Dimensional AST grammar" implicitly: ExprNode primitives are `symbol | op | integral | derivative` (+ v0.4.0 `CovariantDerivativeNode`). Part-IV §12.2.1.1 lists validated primitives as the same four and says tensor-index tracking is "Tier-4.5 follow-up."
- **Verification**: `src/dimensional/validator.ts` lines 47–98 — `ExprNode` union now also includes `CovariantDerivativeNode, RiemannTensorNode, RicciTensorNode, EinsteinTensorNode, BianchiResidualNode, KillingVectorNode, ConservedChargeNode, WeylTensorNode, KretschmannScalarNode` (v0.5.0/v0.6.0). Validator dispatches `validateRiemannTensor`, `validateRicciTensor`, `validateEinsteinTensor`, `validateKillingVector`, `validateWeylTensor`, `validateKretschmannScalar`.
- **Reality**: The implemented AST grammar has expanded well beyond what Parts I/IV describe — a whole curvature/Killing-vector node family now exists. The spec describes an earlier (pre-v0.5.0) state of the validator.
- **Verdict**: STALE
- **Suggested fix**: Add a spec note (Part-I AST grammar / Part-IV §12.2.1.1) acknowledging the v0.5.0+ curvature node family, or explicitly scope the spec as describing the pre-curvature MVP validator.

### D-8 — MEDIUM — Part-II BE-25 AST-encoding note vs module set
- **Claim**: Part-II BE-25: "AST encoding (Tier 5): `src/bridges/equations/be-25-orch-or.ts` — **archived 2026-05-06** … It has been removed from `EXPECTED_DIMENSION_BY_BRIDGE` and from the round-trip catalog test. A future Tier-5 sweep could re-encode BE-25 to the IIT Φ_max form."
- **Verification**: `ls src/bridges/equations/` shows BOTH `be-25-orch-or.ts` AND `be-25-iit-phi.ts`.
- **Reality**: The "future Tier-5 sweep could re-encode BE-25 to the IIT Φ_max form" has already happened — `be-25-iit-phi.ts` exists. The spec text describes only the archived Orch-OR module and frames the IIT encoding as not-yet-done.
- **Verdict**: STALE
- **Suggested fix**: Update the BE-25 AST-encoding note to point at `be-25-iit-phi.ts` as the live encoding, with `be-25-orch-or.ts` noted as archived.

### D-9 — LOW — Part-III Algorithm numbering breadcrumb
- **Claim**: Part-I "Algorithm 3A … (Part-III Algorithm 3B provides the comprehensive implementation)"; Part-III "Algorithm 3B … extends the Part-I Algorithm 3A; the 3 / 3A / 3B numbering reconciliation completed in Wave J Tier E4 / Wave L."
- **Verification**: Both files cross-reference consistently; no contradiction found. Algorithm 3B is pseudocode only ("None of these algorithms are currently implemented" — Part-III preamble), consistent with codebase (only `VALIDATE_DIMENSIONS` is implemented per Part-IV §12.2.1.1).
- **Reality**: ACCURATE and internally consistent; the numbering note is a stale-but-harmless history breadcrumb the spec itself already flags as "retained only as a numbering-history breadcrumb."
- **Verdict**: FALSE-ALARM-OK
- **Suggested fix**: none.
