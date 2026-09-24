/**
 * Run the atlas invalid-bridge study (Phase 6, S6.1).
 *
 * Loads the FROZEN items (public half) and the answer key (scorer half — this is
 * a script, not `src/`, so it may), runs every in-process condition, scores each,
 * compares the atlas against every other condition on the SAME invalid items, and
 * writes `docs/research/atlas-study-results.md` with the reproducer command.
 *
 * **Exit 3, and write NOTHING, when the frozen set is empty.** An empty set is
 * not a study, and a results file generated from it would carry a table that
 * reads like a measurement. The pre-registration note records why the set is
 * empty (no agent may author a frozen item).
 *
 * Out-of-process conditions (embeddings, LLMs) run through the probe's NDJSON
 * worker protocol with the shapes in `src/atlas/benchmark/backend-shapes.ts`.
 * No such worker exists in the repository yet; the script says so in its output
 * rather than scoring a condition it did not run.
 *
 * Run via `bun run atlas:study` (builds dist/ first).
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..');
const distImport = (...parts) => import(pathToFileURL(resolve(repoRoot, 'dist', ...parts)).href);

const { loadFrozenItems } = await distImport('atlas', 'benchmark', 'loader.js');
const { runAtlasCondition, ABLATION_CONFIGS } = await distImport('atlas', 'benchmark', 'run-atlas.js');
const { scoreCondition, pairedRejection, scoreAblation, validateLabels } = await distImport('atlas', 'benchmark', 'study.js');

const benchmarkDir = resolve(repoRoot, 'tests', 'fixtures', 'atlas', 'benchmark');
const items = loadFrozenItems(benchmarkDir);
if (items.length === 0) {
  console.error(
    'run-atlas-study: the frozen item set is EMPTY (0 items). No condition is scored and no ' +
      'results file is written. See docs/research/atlas-benchmark-preregistration.md §1.',
  );
  process.exit(3);
}

const labels = JSON.parse(readFileSync(resolve(benchmarkDir, 'scorer', 'labels.json'), 'utf-8'));
const labelProblems = validateLabels(items.map((i) => i.id), labels);
if (labelProblems.length > 0) {
  console.error(`run-atlas-study: the answer key does not fit the frozen set: ${labelProblems.map((p) => `${p.id}: ${p.problem}`).join('; ')}`);
  process.exit(4);
}
const pkg = JSON.parse(readFileSync(resolve(repoRoot, 'package.json'), 'utf-8'));

const conditions = { atlas: runAtlasCondition(items) };

// Out-of-process LLM conditions (pre-registration Amendment 4). Each model's answers are read
// from the file the local runner wrote. A model whose file is missing or does not cover every
// frozen item is NOT scored: a partial run would be scored on a different item set.
const llmNotes = [];
const llmConfigPath = resolve(benchmarkDir, 'conditions', 'llm-local.config.json');
const llmNames = [];
const llmErrors = {};
if (existsSync(llmConfigPath)) {
  const llmConfig = JSON.parse(readFileSync(llmConfigPath, 'utf-8'));
  for (const m of llmConfig.models) {
    const file = resolve(benchmarkDir, 'conditions', 'llm-local', `${m.name.replace(/[^A-Za-z0-9._-]/g, '_')}.json`);
    if (!existsSync(file)) {
      llmNotes.push(`- \`${m.name}\`: not run (no answers file).`);
      continue;
    }
    const results = JSON.parse(readFileSync(file, 'utf-8'));
    // A transport failure is an UNFINISHED item (the runner re-asks it on resume), not an answer.
    const missing = items.filter(
      (it) => results[it.id] === undefined || results[it.id].error === 'transport failed twice',
    ).length;
    if (missing > 0) {
      llmNotes.push(`- \`${m.name}\`: NOT scored, ${missing} item(s) are unfinished (no record, or a transport failure the runner will retry).`);
      continue;
    }
    const name = `llm-local:${m.name}`;
    // An errored item (malformed reply or failed transport) has no outcome: it is UNANSWERED.
    conditions[name] = items
      .filter((it) => results[it.id].outcome !== null)
      .map((it) => ({
        itemId: it.id,
        outcome: results[it.id].outcome,
        ...(results[it.id].failureKind ? { detectedFailure: results[it.id].failureKind } : {}),
      }));
    llmNames.push(name);
    llmErrors[name] = items.filter((it) => results[it.id].error).length;
  }
}

const metrics = Object.entries(conditions).map(([name, answers]) => scoreCondition(name, answers, labels));
const byName = Object.fromEntries(metrics.map((m) => [m.condition, m]));

// The pre-registered "best LLM baseline": highest balanced accuracy, ties on invalid-rejection
// count, then on name. Fixed in Amendment 4 before any model was called.
const balanced = (m) => (m.validAccepted / m.nValid + m.invalidRejected / m.nInvalid) / 2;
const best = [...llmNames].sort((x, y) => {
  const a = byName[x];
  const b = byName[y];
  return balanced(b) - balanced(a) || b.invalidRejected - a.invalidRejected || x.localeCompare(y);
})[0];

const comparisons = Object.entries(conditions)
  .filter(([name]) => name !== 'atlas')
  .map(([name, answers]) => pairedRejection('atlas', conditions.atlas, name, answers, labels));

const ablation = scoreAblation(
  ABLATION_CONFIGS.map(([name, cfg]) => [name, runAtlasCondition(items, cfg)]),
  labels,
);

const pct = (x) => (Number.isFinite(x) ? `${(100 * x).toFixed(1)}%` : 'n/a');
const lines = [
  '# Atlas invalid-bridge study — results',
  '',
  `Generated by \`bun run atlas:study\` from package v${pkg.version}. Do not edit by hand.`,
  '',
  '| Condition | invalid rejected | 95% Wilson | kind named | wrong accepts | valid accepted | false rejects | abstentions | unanswered |',
  '|---|---|---|---|---|---|---|---|---|',
  ...metrics.map(
    (m) =>
      `| ${m.condition} | ${m.invalidRejected}/${m.nInvalid} | [${pct(m.invalidRejectionInterval.lower)}, ` +
      `${pct(m.invalidRejectionInterval.upper)}] | ${m.kindNamedCorrectly} | ${m.wrongAccepts} | ` +
      `${m.validAccepted}/${m.nValid} | ${m.falseRejects} | ${m.abstentions} | ${m.unanswered} |`,
  ),
  '',
  comparisons.length === 0
    ? '**No paired comparison:** no out-of-process condition has a finished run. The local LLM ' +
      'runner is `scripts/atlas-benchmark-llm-local.mjs`; no embedding condition exists.'
    : [
        '## Criterion 2 — atlas vs the LLM baselines (pre-registration Amendment 4)',
        '',
        'The LLM baselines are LOCAL models. A MET result says the atlas beats these models, not ' +
          'that it beats the best available LLM.',
        '',
        '| LLM condition | balanced accuracy | errors (unanswered) | atlas − LLM rejection, 95% Newcombe | McNemar exact p | criterion |',
        '|---|---|---|---|---|---|',
        ...comparisons.map(
          (c) =>
            `| ${c.conditionB}${c.conditionB === best ? ' **(best)**' : ''} | ${pct(balanced(byName[c.conditionB]))} | ` +
            `${llmErrors[c.conditionB] ?? 0} | ${pct(c.difference.diff)} [${pct(c.difference.lower)}, ${pct(c.difference.upper)}] | ` +
            `${c.mcnemar.exactP.toPrecision(3)} | ${c.aBetterExcludingZero ? 'MET' : 'NOT met'} |`,
        ),
        '',
        best === undefined
          ? ''
          : `**Pre-registered criterion 2 (atlas vs the best baseline, \`${best}\`): ` +
            `${comparisons.find((c) => c.conditionB === best).aBetterExcludingZero ? 'MET' : 'NOT MET'}.**`,
        '',
        // The finding stated NEXT TO the verdict, not beneath it: the atlas decides only what an
        // item states formally, and on prose claims that is rarely enough. Computed, never typed.
        (() => {
          const a = byName.atlas;
          const n = a.nValid + a.nInvalid;
          const llmWrong = llmNames.map((x) => `${byName[x].wrongAccepts} (${x.replace('llm-local:', '')})`).join(', ');
          return (
            `**The atlas abstained on ${a.abstentions} of ${n} items.** Most items do not state the ` +
            'formal fields its instruments check (regime values, conventions, a claimed chain), so ' +
            'the atlas could not decide them. Its one advantage, ' +
            `${a.wrongAccepts} wrong accept${a.wrongAccepts === 1 ? '' : 's'} against ${llmWrong} ` +
            'for the LLM baselines, is bought by that abstention. This is a finding about the ' +
            'interface between natural-language claims and the formal apparatus: what the atlas ' +
            'can check depends on what a claim states in machine-readable form.'
          );
        })(),
      ].join('\n'),
  ...(llmNotes.length > 0 ? ['', ...llmNotes] : []),
  '',
  '## Ablation (S6.2) — cumulative configurations of the atlas condition',
  '',
  '| Configuration | invalid rejected | wrong accepts | abstentions | step over previous (Δ, 95% Newcombe) |',
  '|---|---|---|---|---|',
  ...ablation.map(
    (r) =>
      `| ${r.configuration} | ${r.metrics.invalidRejected}/${r.metrics.nInvalid} | ${r.metrics.wrongAccepts} | ` +
      `${r.metrics.abstentions} | ${
        r.stepOverPrevious === undefined
          ? '—'
          : `${pct(r.stepOverPrevious.difference.diff)} [${pct(r.stepOverPrevious.difference.lower)}, ` +
            `${pct(r.stepOverPrevious.difference.upper)}]`
      } |`,
  ),
  '',
];
// Criterion 3 (pre-registration Amendment 8) is scored by `tools/criterion3-study/run.ts`, which
// writes its own section. It is included here as written, so that this file holds every criterion.
const criterion3 = resolve(repoRoot, 'docs', 'research', 'criterion3', 'results-interim.md');
if (existsSync(criterion3)) lines.push(readFileSync(criterion3, 'utf8').trimEnd(), '');
writeFileSync(resolve(repoRoot, 'docs', 'research', 'atlas-study-results.md'), lines.join('\n'));
console.log(`run-atlas-study: scored ${items.length} items over ${metrics.length} condition(s)`);
