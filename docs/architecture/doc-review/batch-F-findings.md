# Batch F — sub-READMEs — Doc Integrity Findings

**Reviewer**: sonnet subagent. **Date**: 2026-05-20. **Files**: `src/bridges/README.md`, `src/dimensional/README.md`, `bench/README.md`.

## Summary

8 findings: 1 CRITICAL, 3 HIGH, 2 MEDIUM, 2 LOW. The bridges README has a critical stale bridge-count (40 vs 42), points to an archived BE-25 module, and is silent on all v0.6.0 additions. The dimensional README omits all 9 v0.6.0 new files. The bench README omits all 4 v0.6.0 new bench suites and references outdated version milestones.

---

## Findings

### F-1 — CRITICAL — `src/bridges/README.md`:header

- **Claim**: `"Machine-readable catalog of the 40 bridge equations defined in the UPT specification"`
- **Verification**: `grep -c '^\s+id:' src/bridges/index.ts` → 42 matches (IDs 11–52). IDs 51 (gravitational lensing) and 52 (Mercury perihelion) were added in v0.4.0, per the comment at `index.ts:1702`.
- **Reality**: The catalog contains 42 bridges (IDs 11–52), not 40. The "original 40-bridge spec catalog (IDs 11-50)" comment in `index.ts` documents this explicitly.
- **Verdict**: INACCURACY
- **Suggested fix**: Change "40 bridge equations" → "42 bridge equations (IDs 11–52; IDs 51–52 added v0.4.0)".

---

### F-2 — HIGH — `src/bridges/README.md`:AST-encoded table, BE-25 row

- **Claim**: `"| 25 | Penrose-Hameroff Orch-OR collapse time | highly-speculative | [time] | be-25-orch-or.ts |"`
- **Verification**: `src/bridges/equations/be-25-orch-or.ts` line 1–10 — banner reads "ARCHIVED MODULE — DO NOT USE FOR BE-25 DIMENSIONAL CLAIMS"; active module is `be-25-iit-phi.ts`. Catalog entry at `index.ts:742–787` shows `id: 25`, `name: "Consciousness - Information Integration Bridge (IIT Φ)"`, `status: 'speculative'`, `dimensional_signature: '[1]'`.
- **Reality**: BE-25 was reformulated from Penrose-Hameroff Orch-OR (`[time]`, highly-speculative) to IIT Φ_max (`[1]`, speculative) in Wave P-D (2026-05-06). The linked module `be-25-orch-or.ts` is archived and load-bearing only as a historical artifact; the current encoding is `be-25-iit-phi.ts`.
- **Verdict**: INACCURACY (three wrong fields: name, status, dim-signature; wrong module link)
- **Suggested fix**: Update table row: name → `Consciousness — Information Integration (IIT Φ)`, status → `speculative`, dim signature → `[1]`, module → `be-25-iit-phi.ts`.

---

### F-3 — HIGH — `src/bridges/README.md`:entire file

- **Claim**: (implicit) AST table lists 9 encoded bridges; BE-20 re-encoding with `CosmologicalConstantNode` (v0.6.0) is not mentioned; no mention of v0.6.0 changes at all.
- **Verification**: `src/bridges/equations/be-20-vacuum-energy.ts` line 82 — `BE20_COSMOLOGICAL_CONSTANT` typed as `CosmologicalConstantNode`; node imported from `dimensional/stress-energy-validators.js` (v0.6.0 addition). Glob of `src/bridges/equations/` shows 41 files — many more bridges are AST-encoded beyond the 9 listed in the README table (e.g., `be-12-coherence-length.ts`, `be-13-einstein-trace.ts`, `be-15-emergence.ts`, `be-16-landauer.ts`, `be-17-einstein-cartan.ts`, `be-18-higgs-mass.ts`, `be-21-kss-bound.ts`, `be-23-syk-planckian.ts`, `be-24-foerster-fret.ts`, `be-27-effective-temperature.ts`, `be-28-onsager-entropy-production.ts`, `be-29-jarzynski.ts`, `be-30-flm-first-law.ts`, `be-31-causal-set-bd.ts`, `be-32-quantum-reference-frame.ts`, `be-33-hertz-millis.ts`, `be-35-conformal-bootstrap.ts`, `be-36-gw-speed-bound.ts`, `be-37-shapiro-delay.ts`, `be-38-mond.ts`, `be-39-asymptotic-safety.ts`, `be-40-composite-higgs.ts`, `be-42-hawking-temperature.ts`, `be-43-er-epr.ts`, `be-44-soft-hair.ts`, `be-45-tcc.ts`, `be-46-multiverse-measure.ts`, `be-48-grw-localization.ts`, `be-49-quantum-darwinism.ts`, `be-50-wheeler-feynman.ts`, `be-15-emergence.ts`).
- **Reality**: The AST-encoded table in the README lists only 9 modules; as of the current codebase the `equations/` directory has 41 `.ts` files, meaning ~32 additional encoded bridges are unmentioned. Additionally, v0.6.0's BE-20 re-encoding with `CosmologicalConstantNode` is absent.
- **Verdict**: STALE (severely — table represents ~22% of actual encoded bridges)
- **Suggested fix**: Update the table to reflect all encoded modules, or replace the hand-maintained table with a note that the full list is in the `equations/` directory. Add a v0.6.0 change note for BE-20.

---

### F-4 — HIGH — `src/dimensional/README.md`:entire file

- **Claim**: The README describes the dimensional module with no mention of `killing-validators.ts`, `stress-energy-validators.ts`, `einstein-equation.ts`, `weyl-validators.ts`, `curvature-invariants.ts`, `curvature-composite.ts`, `connection-validators.ts`, or `metric-validators.ts`.
- **Verification**: Glob of `src/dimensional/` lists 19 files. The README section "What's NOT in MVP" and "How to use" reference only legacy content (`ExprNode`, `validate`, `inferDimensionForBridge`). The following files in the directory are entirely absent from the README: `killing-validators.ts`, `stress-energy-validators.ts`, `einstein-equation.ts`, `weyl-validators.ts`, `curvature-invariants.ts`, `curvature-composite.ts`, `connection-validators.ts`, `metric-validators.ts`, `fresh-label.ts`, `metric.ts`, `tensor.ts`, `errors.ts` (plus the v0.4.0 `connection.ts` already present).
- **Reality**: The README describes only the original Tier-4 scalar dimensional analyzer. The module has grown substantially with v0.5.0–v0.6.0 tensor-level validators (Killing vectors, stress-energy, Einstein field equations, Weyl tensor, Kretschmann scalar, curvature composites). None of the 6 v0.6.0 additions appear.
- **Verdict**: STALE (v0.6.0 additions entirely absent; overall module scope significantly understated)
- **Suggested fix**: Add a section describing the tensor-level validator modules added in v0.5.0–v0.6.0 (`killing-validators.ts`, `stress-energy-validators.ts`, `einstein-equation.ts`, `weyl-validators.ts`, `curvature-invariants.ts`, `curvature-composite.ts`). At minimum add a "v0.6.0 additions" subsection listing the new node kinds and their source modules.

---

### F-5 — HIGH — `bench/README.md`:Files table

- **Claim**: Files table lists only `sanity.bench.ts`.
- **Verification**: Glob of `bench/` → 9 items: `sanity.bench.ts`, `ad.bench.ts`, `geodesic.bench.ts`, `be37-eikonal.bench.ts`, `be37-step-count-sweep.bench.ts`, `null-ic-reconstruction.bench.ts`, `geodesic-conservation.bench.ts`, `gl4-mercury-1000step.bench.ts`, `fixtures/schwarzschild.ts`. The README mentions only 1 of 8 bench files.
- **Reality**: 7 additional bench files exist, including 4 added in v0.6.0 (`be37-step-count-sweep.bench.ts`, `null-ic-reconstruction.bench.ts`, `geodesic-conservation.bench.ts`, `gl4-mercury-1000step.bench.ts`) and 3 pre-v0.6.0 (`ad.bench.ts`, `geodesic.bench.ts`, `be37-eikonal.bench.ts`).
- **Verdict**: STALE (7 of 8 bench files unmentioned)
- **Suggested fix**: Expand the Files table to include all 8 bench files with purpose annotations.

---

### F-6 — MEDIUM — `bench/README.md`:Philosophy section

- **Claim**: `"No gates fail CI in v0.4.5. Threshold-gated performance regression is deferred to v0.5.0 scope."`
- **Verification**: `package.json` line 3: `"version": "0.6.0"`. The project is at v0.6.0.
- **Reality**: This statement was written during v0.4.x. At v0.6.0 the "deferred to v0.5.0" note is obsolete. Whether thresholds were ever added is unclear (bench README doesn't say), but the version reference is stale.
- **Verdict**: STALE
- **Suggested fix**: Update or remove the version-pinned philosophy note. If no threshold gates have been added, restate as "No threshold gates as of v0.6.0; performance regression tracking is deferred."

---

### F-7 — MEDIUM — `src/dimensional/README.md`:bridge-index reference

- **Claim**: `"The 40 entries in src/bridges/index.ts carry formula_latex strings"` (line 62)
- **Verification**: Catalog count established in F-1: 42 entries (IDs 11–52).
- **Reality**: Same stale count as F-1 — 42 not 40.
- **Verdict**: INACCURACY
- **Suggested fix**: Change "40 entries" → "42 entries".

---

### F-8 — LOW — `src/bridges/README.md`:Schema section, `dimensional_signature` list

- **Claim**: `"currently populated for hand-encoded entries only (BE-11, BE-14, BE-18, BE-29, BE-47, BE-48 as of 2026-05-04) and null for the rest"`
- **Verification**: The catalog now has many more populated `dimensional_signature` fields — e.g. BE-25 has `dimensional_signature: '[1]'` (set per `index.ts:785`) and the 41-file `equations/` directory implies most or all bridges have been AST-encoded. This was accurate as of 2026-05-04 but the parenthetical date anchors the claim to a historical snapshot.
- **Reality**: The "as of 2026-05-04" qualifier makes this technically a dated snapshot, but the text still reads as current state and is misleading now that Tier-5 encoding is largely complete.
- **Verdict**: STALE (low severity due to date qualifier)
- **Suggested fix**: Remove the parenthetical list and replace with "populated for all AST-encoded entries; see `equations/` for the full set."
