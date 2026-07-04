/**
 * PI-instrument Phase 1 — the epistemic-grounding ledger. A pure, derived view
 * over a `VettedCandidate`'s already-computed falsifier results: which gates RAN
 * a real comparison and the candidate SURVIVED (`passed`), which could not test
 * it or produced an unadjudicated result (`gaps`), and the honest ceiling — no
 * mechanism test (axis-compatibility is a proxy, not a mechanism test) and no
 * data confrontation. Annotation-only: it changes no verdict, score, or count.
 *
 * The ledger's job is to expose WEAKNESS so a PI knows how much weight a verdict
 * bears. A gate lands in `passed` ONLY if it ran a real comparison and the
 * candidate survived; anything untestable (an abstained gate) or unadjudicated
 * (a novel machine-derived consequence) is a `gap`, never a strength. There is
 * deliberately NO single "tier": magnitude (numeric) and axis (regime) are
 * orthogonal evidence and must not collapse into one rank a PI could misread as
 * credibility.
 *
 * @module composition/grounding
 */
import type { VettedCandidate } from './discovery.js';
import type { ConsequenceSignal } from './consequence.js';

/** The epistemic-grounding ledger for one discovery candidate. @public */
export interface CandidateGrounding {
  /** Gates that ran a real comparison AND the candidate survived. */
  readonly passed: readonly string[];
  /** Gates that could NOT test the candidate, or produced an unadjudicated result. */
  readonly gaps: readonly string[];
  /**
   * Honest ceiling — no mechanism test has run (axis-compatibility is a regime
   * PROXY, not a mechanism test). Always `false` in Phase 1; the field exists so
   * the ceiling is never a silent omission and so Phase 2 can flip it.
   */
  readonly mechanismTested: false;
  /**
   * Honest ceiling — this candidate is not confronted with real data. Always
   * `false` in Phase 1; Phase 3 (the propose→confront loop) flips it.
   */
  readonly dataTested: false;
}

/**
 * Derive the grounding ledger from a candidate's existing falsifier results.
 * `consequence` is the optional consequence-annotation signal (from
 * `annotateConsequences`); omit it when the consequence layer did not run.
 *
 * Designed for `promising` candidates (the ones a PI reviews), but honest for
 * any candidate: it never reports a gate as `passed` unless it actually ran and
 * the candidate survived it.
 *
 * @public
 */
export function describeGrounding(
  c: VettedCandidate,
  consequence?: ConsequenceSignal,
): CandidateGrounding {
  const passed: string[] = [];
  const gaps: string[] = [];

  // Numerical-consistency: the retrodiction filter always runs. It is `passed`
  // only when the candidate is actually consistent (a contradictory candidate's
  // failure is its verdict, not a grounding line — this view is for survivors).
  if (c.numericallyConsistent) passed.push('numerical-consistency');

  // Magnitude gate: ran only when both endpoints had a representative value.
  if (c.magnitudeChecked) {
    const parts: string[] = [];
    if (c.ordersApart != null) parts.push(`${c.ordersApart.toFixed(1)} orders`);
    if (c.magnitudeUsedAnchor) parts.push('anchor-derived');
    passed.push(parts.length ? `magnitude (${parts.join(', ')})` : 'magnitude');
  } else {
    gaps.push('magnitude (no representative value)');
  }

  // Axis-compatibility: honestly PARTIAL — "≥1 regime axis resolved and agreed",
  // never "fully axis-checked". Cleared only when an axis was resolved AND none
  // clashed. (A clash is the axis-clash verdict, not a survivor's grounding.)
  if (c.axisChecked && c.axisClashes.length === 0) {
    passed.push('axis-compatible (≥1 regime axis)');
  } else if (!c.axisChecked) {
    gaps.push('axis (regime attributes unresolved)');
  }

  // Consequence: ONLY `entailed` clears (the consequence re-derives a known
  // canonical law — a real check against standard physics). `novel-consequence`
  // is an UNADJUDICATED machine-surfaced relation — a weakness to investigate,
  // not a passed test. `inconclusive` means the consequence layer could not test.
  if (consequence === 'entailed') passed.push('consequence: entailed');
  else if (consequence === 'novel-consequence') gaps.push('consequence: novel (unadjudicated)');
  else if (consequence === 'inconclusive') gaps.push('consequence: inconclusive');

  return { passed, gaps, mechanismTested: false, dataTested: false };
}
