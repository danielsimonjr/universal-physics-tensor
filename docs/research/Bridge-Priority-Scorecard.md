# Bridge-Priority Scorecard — triage by decidability, not credibility

> **Provenance:** 2026-06-13 (branch
> `claude/bridge-equations-specs-review-4mfy38`). A triage tool over the
> composition graph (`src/composition/bridge-analysis.ts`, internal):
> which speculative bridges are closest to being **decidable against
> established physics** — most anchored to the established core and most
> checkable. Pinned by `tests/composition/bridge-priority.test.ts`; run
> it with `npm run bridge-priority`.

## ⚠ What this is, and is not

This ranks **review/confrontation priority**, NOT credibility. The
dimensional and graph signals are *orthogonal* to whether a bridge is
true — see `Bridge-Equation-Dimensional-Audit.md`: the established
Mercury perihelion is "unclosable"; the highly-speculative
Hawking-via-r_s derives cleanly. A Tier-1 bridge is *easier to decide*,
not *more likely true*. Do not prune, rank, or score the catalog's
credibility with this. A genuine credibility estimate needs the
human-review and data-confrontation pipeline; this engine cannot produce
one, and says so.

## The signals

Three from the engine, one joined from the catalog:

| signal | question | source |
|---|---|---|
| **grounding** | does the equation re-derive as a recognized monomial with a CLEAN constant (ln 2, 1/4π, √2π)? `grounded` → `empirical` → `decoy` → `open` | engine (`attemptDerivation`) |
| **complexity** | free dimensionless parameters (lower = nearer a clean, falsifiable prediction) | engine (`dimensionalFreedom`) |
| **anchoring** | graph distance to the established-confidence core (0 = shares a quantity; ∞ = isolated) | engine (`anchoringDistance`) |
| **data confrontation** | is there a committed confrontation (BE-23, BE-36)? | catalog (NOT engine) |

**Tiering** (transparent rules):

- **Tier 1** — anchored (distance < ∞) AND (grounded equation OR complexity ≤ 1). *Most decidable: confront/review first.*
- **Tier 2** — anchored OR grounded, but not both-ideal. *Second pass.*
- **Tier 3** — isolated AND not grounded. *Needs literature/theory review, not structural triage.*

## The board (verbatim, 32 non-established bridges)

**Tier 1 — anchored + grounded/tractable (8):**

| bridge | anchor | grounding | cplx | data | status |
|---|---|---|---|---|---|
| be-12 thermal de Broglie | 0 | grounded (√2π) | 0 | | speculative |
| be-42-via-rs Hawking | 0 | grounded (1/4π) | 0 | | highly-spec |
| be-48 GRW localization | 0 | empirical | 0 | | speculative |
| be-42 Hawking (direct) | 0 | decoy | 0 | | highly-spec |
| be-38 MOND | 0 | open | 1 | | speculative |
| be-16 Landauer | 1 | grounded (ln 2) | 0 | | speculative |
| be-27 effective temperature | 1 | decoy | 0 | | speculative |
| be-23 Planckian resistivity | 1 | open | 1 | **DATA** | speculative |

**Tier 2 — anchored OR grounded (6):** be-33 (anchored, complexity 3);
be-13, be-15, be-17, be-20 (grounded recognized equations — R = 4Λ,
model-A coarsening, torsion–spin, ρ_Λ — but isolated from the GR core);
be-36 GW-speed (grounded, isolated, **DATA**).

**Tier 3 — isolated + multi-parameter (18):** be-14, be-43 (decoy area
laws); then the `open` tail in ascending complexity — be-18/19/24/30/50/54
(1) · be-22/25/26 (2) · be-45/46 (3) · be-31/41/49 (4) · be-39 asymptotic
safety (5) · be-47 nucleosynthesis (6). These carry irreducible
dimensionless structure; dimensional/graph triage gives no purchase, and
they correctly fall to pure literature review.

## How to read it

- **The top of Tier 1 is where structure pays off.** be-16, be-12,
  be-42-via-rs have recognized equations AND anchoring AND tractability —
  a physicist (or a data confrontation) gets the most leverage there.
- **The data column is the only real credibility signal**, and it comes
  from the catalog, not the engine. be-23 and be-36 already have
  confrontations; everything else is unconfronted regardless of tier.
- **Tier is not status.** Tier 1 holds two *highly-speculative* bridges
  (be-42, be-42-via-rs); Tier 3 is almost entirely plain *speculative*.
  The columns deliberately show `status` beside the tier so the
  orthogonality stays visible — and so nobody mistakes one for the other.

## Reproduce

```bash
npm run bridge-priority
npx vitest run tests/composition/bridge-priority.test.ts
```
