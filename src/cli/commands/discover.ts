/**
 * `upt discover` — vet the link candidates through the inference suite, and
 * (with `--derive`) emit the algebraic identity-consequence proposals.
 * Transposed verbatim from bin/upt.mjs's `parseDiscoveryOpts()`/`discoverCmd()`/
 * `deriveCmd()` (lines 592-713), plus `--json`. `parseDiscoveryOpts` itself
 * moved to `_discovery-opts.ts` so `map`'s `--proposed` overlay can share it.
 */
import type { FlagSpec } from '../args.js';
import { registerCommand, type Command, type CommandCtx } from '../command.js';
import { resolveGraph } from '../graphs.js';
import { emitJson } from '../output.js';
import { parseDiscoveryOpts } from './_discovery-opts.js';
import type { VettedCandidate } from '../../composition/discovery.js';
import type { AnnotatedCandidate, AdjudicationVerdict } from '../../composition/adjudication.js';
import type { ConsequenceSignal, ConsequenceEvidence } from '../../composition/consequence.js';

/** `annotated` (adjudication layer) composed with the consequence layer —
 *  both are `VettedCandidate & {...}` intersections, so a candidate carries
 *  both `adjudication?` and `consequence?` after composition. */
type FullyAnnotatedCandidate = AnnotatedCandidate & {
  readonly consequence?: {
    readonly signal: ConsequenceSignal;
    readonly evidence: readonly ConsequenceEvidence[];
  };
};

const FLAGS: FlagSpec[] = [
  { name: '--source', valueStyle: 'attached' },
  { name: '--max-orders', valueStyle: 'attached' },
  { name: '--anchor', valueStyle: 'attached', repeatable: true },
  { name: '--derive', valueStyle: 'none' },
  { name: '--show-adjudicated', valueStyle: 'none' },
  { name: '--json', valueStyle: 'none' },
];

const HELP = `upt discover [--source=catalog|canonical|both]
        VET the link candidates through the inference suite: hypothesise
        each identification a≡b and test whether it merges disconnected
        physics, unlocks quantities, and stays numerically consistent.
        Ranks promising / inert / contradictory.
        --source=canonical runs the funnel on the standard-physics L-layer
        ALONE (bridges excluded) — new candidates from established physics,
        and a self-consistency check (expect 0 contradictory).
        --derive emits, for each 'promising' identification, the ONE algebraic
        relation it implies (monomial elimination) as an UNADJUDICATED, math-only
        proposal — NOT a bridge (Part-VI §XXVII-B). Pairs with --source=canonical.
        --max-orders=N tunes the magnitude-clash threshold (default 3); looser N
        keeps more candidates 'promising', tighter N falsifies more as clashes.
        --anchor=k=v[,k2=v2] overrides the numeric anchor (default mass=M_sun)
        for the consistency/closure check. Both reshape the candidate pool that
        --derive consumes.
        Candidates a physicist has already adjudicated (docs/research/*-adjudication.md)
        fold out of the PROMISING list by default (decoy/entailed verdicts only —
        review memory, not a re-litigation prompt); --show-adjudicated lists them
        again with their recorded verdict.`;

const EPISTEMICS =
  '⚠ a REVIEW SURFACE: `promising` means "worth a physicist\'s minute", not "true".\n' +
  '  Each candidate hypothesises an identification a≡b and tests its consequences.';

// ── discover --derive (identity-consequence proposals) ────────────────────
function deriveReport(
  api: CommandCtx['api'],
  ranked: readonly VettedCandidate[],
  label: string,
  out: (line?: string) => void
): void {
  const proposals = api.deriveProposedBridges(ranked);
  out(`\nDerived identity-consequence PROPOSALS — UNADJUDICATED, math-only  [source: ${label}]`);
  out('⚠ Each is the ALGEBRAIC CONSEQUENCE of an unadjudicated identification — NOT a new');
  out('  relation and NOT a bridge. No mechanism asserted. Promotion to the catalog needs');
  out('  adversarial + literature review (Part-VI §XXVII-B). The enumerator proposes; humans dispose.\n');
  if (!proposals.length) {
    out('  no admissible proposal (need two fully-quantitative, monomial canonical targets).');
    return;
  }
  for (const p of proposals) {
    let approx = '';
    try {
      const vals = Object.fromEntries((p.governing || []).map((g) => [g.name, 300]));
      const at = (p.governing || []).map((g) => `${g.name}=300`).join(', ');
      approx = `  ≈ ${p.evaluate(vals).toExponential(2)}${at ? ` (${at})` : ''}`;
    } catch {
      approx = '';
    }
    out(`  ${p.id}`);
    out(`      ${p.formulaLatex}      ${p.dimensionalSignature}${approx}`);
    out(
      `      from: ${p.derivedFrom.identification.a} ≟ ${p.derivedFrom.identification.b}` +
        `  (${p.derivedFrom.sourceEquationIds[0]} = ${p.derivedFrom.sourceEquationIds[1]}); solved for ${p.derivedFrom.solvedFor}`
    );
    if (p.alsoDerivableFrom && p.alsoDerivableFrom.length) {
      out(`      also derivable from: ${p.alsoDerivableFrom.join('; ')}`);
    }
  }
  out('');
}

/** Verdicts that fold a candidate out of the printed PROMISING list by
 *  default — review memory, not news. `deferred`/`genuine` stay listed
 *  (see the module-level docstring on `AdjudicationVerdict`). */
function foldsOut(verdict: AdjudicationVerdict): boolean {
  return verdict === 'decoy' || verdict === 'entailed';
}

/** Tally an annotated candidate set's recorded verdicts, for `--json`'s
 *  `adjudicationSummary` (over ALL candidates, every funnel bucket). */
function summarizeAdjudications(
  candidates: readonly AnnotatedCandidate[]
): { total: number; genuine: number; decoy: number; entailed: number; deferred: number } {
  const summary = { total: 0, genuine: 0, decoy: 0, entailed: 0, deferred: 0 };
  for (const c of candidates) {
    if (!c.adjudication) continue;
    summary.total++;
    summary[c.adjudication.verdict]++;
  }
  return summary;
}

/** The reconciling line printed under PROMISING when some of it carries a
 *  recorded verdict — so the folded/shorter list never looks inconsistent
 *  against the funnel line's raw promising count. */
function adjudicationSummaryLine(promising: readonly AnnotatedCandidate[], promisingCount: number): string {
  const adjudicated = promising.filter((r) => r.adjudication);
  const counts = { genuine: 0, decoy: 0, entailed: 0, deferred: 0 };
  let folded = 0;
  for (const r of adjudicated) {
    const v = r.adjudication!.verdict;
    counts[v]++;
    if (foldsOut(v)) folded++;
  }
  const parts = (['decoy', 'entailed', 'deferred', 'genuine'] as const)
    .filter((v) => counts[v] > 0)
    .map((v) => `${counts[v]} ${v}`);
  const total = adjudicated.length;
  const verb = total === 1 ? 'carries' : 'carry';
  const noun = total === 1 ? 'a recorded verdict' : 'recorded verdicts';
  const foldNote = folded === total ? '— folded' : folded === 0 ? '— shown below' : `— ${folded} folded`;
  return `  adjudicated: ${total} of the ${promisingCount} promising ${verb} ${noun} (${parts.join(', ')}) ${foldNote}; --show-adjudicated to list`;
}

async function run(ctx: CommandCtx): Promise<number> {
  const { args, api, out } = ctx;
  const { graph, label, source } = resolveGraph(api, args.flags);
  const opts = parseDiscoveryOpts(args.flags);
  const ranked = api.rankDiscoveries(graph, opts);
  const isDerive = args.flags.has('derive');
  const annotated = isDerive ? ([] as AnnotatedCandidate[]) : api.annotateAdjudications(ranked);
  const withConsequence: readonly FullyAnnotatedCandidate[] = isDerive
    ? []
    : api.annotateConsequences(annotated);
  const showAdjudicated = args.flags.has('show-adjudicated');

  if (args.flags.has('json')) {
    const result = isDerive ? api.deriveProposedBridges(ranked) : withConsequence;
    const envelope = {
      command: 'discover',
      source,
      options: opts as Record<string, unknown>,
      epistemics: EPISTEMICS,
      result,
      ...(isDerive ? {} : { adjudicationSummary: summarizeAdjudications(withConsequence) }),
    };
    emitJson(envelope, ctx.write);
    return 0;
  }

  if (Object.keys(opts).length) {
    const bits: string[] = [];
    if (opts.maxOrdersOfMagnitude !== undefined) bits.push(`max-orders=${opts.maxOrdersOfMagnitude}`);
    if (opts.groundTruth) {
      bits.push(`anchor={${Object.entries(opts.groundTruth).map(([k, v]) => `${k}=${v}`).join(', ')}}`);
    }
    out(`  [discovery options: ${bits.join('; ')}]`);
  }

  if (isDerive) {
    deriveReport(api, ranked, label, out);
    return 0;
  }

  const by = (v: string) => withConsequence.filter((r) => r.verdict === v);
  const promising = by('promising');
  const inert = by('inert');
  const contra = by('contradictory');
  const clash = by('magnitude-clash');
  const axisClash = by('axis-clash');
  out(`\nDiscovery — link candidates VETTED through the inference suite  [source: ${label}]`);
  out('⚠ a REVIEW SURFACE: `promising` means "worth a physicist\'s minute", not "true".');
  out('  Each candidate hypothesises an identification a≡b and tests its consequences.\n');
  out(
    `  funnel:  ${withConsequence.length} candidates  →  ${promising.length} promising  ` +
      `·  ${inert.length} inert  ·  ${clash.length} magnitude-clash  ` +
      `·  ${contra.length} contradictory (falsified)  ·  ${axisClash.length} axis-clash\n`
  );
  if (promising.length) {
    out('  PROMISING (merges disconnected physics, unlocks quantities, stays consistent):');
    for (const r of promising) {
      if (r.adjudication && foldsOut(r.adjudication.verdict) && !showAdjudicated) continue;
      out(`    ${(r.a + ' ≟ ' + r.b).padEnd(52)} [${r.dim}]  score ${r.score}`);
      out(`        unlocks: ${r.unlocksFromAnchor.join(', ') || '—'}`);
      if (r.consequence) {
        out(`        [consequence: ${r.consequence.signal}]`);
      }
      if (r.adjudication) {
        out(`        [adjudicated: ${r.adjudication.verdict} — ${r.adjudication.grounds}]`);
      }
    }
    if (promising.some((r) => r.adjudication)) {
      out(adjudicationSummaryLine(promising, promising.length));
    }
  } else {
    out('  no candidate is `promising` from the default {mass} anchor.');
  }
  if (clash.length) {
    out(`\n  MAGNITUDE-CLASH (representative values differ by > N orders — a falsifier):`);
    for (const r of clash) {
      const basis = r.magnitudeUsedAnchor ? '  (anchor-derived)' : '';
      out(`    ${(r.a + ' ≟ ' + r.b).padEnd(52)} ~${r.ordersApart!.toFixed(1)} orders apart${basis}`);
    }
  }
  const subsumed = inert.filter((r) => r.subsuming);
  if (subsumed.length) {
    out(`\n  SUBSUMING (generic ≟ specialization — tautological, barred from promising):`);
    for (const r of subsumed) {
      out(`    ${(r.a + ' ≟ ' + r.b).padEnd(52)} [${r.dim}]`);
    }
  }
  if (contra.length) {
    out(`\n  CONTRADICTORY (the identification falsifies itself numerically):`);
    for (const r of contra) {
      out(`    ${(r.a + ' ≟ ' + r.b).padEnd(52)} disagreeing node(s): ${r.inconsistentNodes.join(', ')}`);
    }
  }
  if (axisClash.length) {
    out(`\n  AXIS-CLASH (identification falsified (stated regimes differ)):`);
    for (const r of axisClash) {
      out(`    ${(r.a + ' ≟ ' + r.b).padEnd(52)} ${r.axisClashes.join('; ')}`);
    }
  }
  out('\n  (magnitude gate abstains where a representative value is unknown; weak priors on dimension.)');
  return 0;
}

export const command: Command = {
  name: 'discover',
  aliases: ['discovery'],
  flags: FLAGS,
  help: HELP,
  run,
};

registerCommand(command);
