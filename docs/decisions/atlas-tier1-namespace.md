# Decision: the Tier 1 `atlas` namespace stays after a negative study result

**Decided:** 2026-09-23, by Mothership, acting as the lead with the user's delegation for
ADR-level calls on this repository. No independent human reviewer took part.
**Recorded by:** the UPT session that implemented the namespace.
**Status:** accepted.

## Context

- The ROADMAP (Phase 6) says: "promotion of the atlas subpath to `src/index.ts` only if the
  study justifies it".
- Tier 1 was promoted as the root `atlas` namespace in commit `07041cc`, BEFORE the study ran.
  The selection is in `docs/planning/Atlas-API-Review.md`.
- The study then ran. Its pre-registered criterion 2 is NOT MET: the atlas rejected 6 of 61
  invalid items, the best local LLM baseline rejected 51 of 61, and the 95% interval for the
  difference is −73.8% [−82.7%, −58.7%] (`docs/research/atlas-study-results.md`).

So the practice and the rule, read literally, disagree.

## Decision

The Tier 1 namespace STAYS.

## Rationale

- **Tier 1 was selected on API-quality grounds, not on the benchmark.** The criteria were: a
  contract unchanged across sprints, independent tests, no coupling to repository data, and
  closure under type references. None of these depends on the benchmark.
- **The study did not test what Tier 1 exposes.** Tier 1 holds contracts and algebra: the
  relation and bound types, `composeBounds` / `composeBoundPath`, `regimeHolds`, and the
  composition table. The benchmark measured one claim: that the atlas condition rejects invalid
  bridges at a higher rate than an LLM. That claim is refuted, and nothing in Tier 1 asserts it.
- **The refuted capability is not public.** The benchmark runner (`runAtlasCondition`) and
  the applicability checker are `@internal`, on the `universal-physics-tensor/atlas` subpath.

## The reading of the roadmap rule

"Only if the study justifies it" applies to symbols whose value DEPENDS ON A BENCHMARK CLAIM.
For any symbol whose value is the claim that the atlas rejects invalid bridges better than
alternatives, the study now says no, and such a symbol is not promoted. Symbols selected on
API-quality grounds alone do not wait on the study. The ROADMAP sentence is amended to say this,
so the rule and the practice agree.

## Consequences

- Nothing changes in `src/`.
- No public document may claim or imply that the atlas rejects invalid bridges better than
  alternatives. An audit on 2026-09-23 found no such claim in `README.md`, `cli/README.md`,
  `docs/specification/` or `docs/README.md`. `ROADMAP.md` names the comparison as the proposal's
  headline test, and it now points to the result beside that line.
- The atlas made 1 wrong accept against 5–13 for the LLM baselines, but only because it
  abstained on 116 of 125 items. That is a statement about how few formal fields the items
  carry, not an advantage that could justify promoting the checker.
