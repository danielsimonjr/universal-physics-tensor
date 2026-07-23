/**
 * `upt ground <quantityA> <quantityB>` — the epistemic-grounding ledger for a
 * single discovery candidate a≡b: which falsifiers passed, which abstained (gaps),
 * and the honest permanent ceiling (no mechanism test, no data test). Lets you
 * interrogate one candidate directly instead of scanning all of `upt discover`.
 */
import type { FlagSpec } from '../args.js';
import { registerCommand, type Command, type CommandCtx } from '../command.js';
import { resolveGraph } from '../graphs.js';
import { emitJson } from '../output.js';
import { UsageError, CliError } from '../errors.js';

const FLAGS: FlagSpec[] = [
  { name: '--source', valueStyle: 'attached' },
  { name: '--json', valueStyle: 'none' },
];

const HELP = `upt ground <quantityA> <quantityB>
        The epistemic-grounding ledger for one discovery candidate a≡b: which
        falsifiers PASSED, which ABSTAINED (gaps), and the honest ceiling — no
        mechanism test, no data test (permanent for a dimensional candidate;
        real mechanism/data live in \`upt confront\`).`;

const EPISTEMICS =
  '(candidate grounding is a review surface; mechanism/data live in `upt confront`, not candidate space)';

async function run(ctx: CommandCtx): Promise<number> {
  const { args, api, out } = ctx;
  const { graph, source } = resolveGraph(api, args.flags);
  const [a, b] = args.positionals;
  if (!a || !b) {
    throw new UsageError('upt ground needs two quantity names (a b). See `upt help`.');
  }

  const ranked = api.rankDiscoveries(graph);
  const cand = ranked.find(
    (c) => (c.a === a && c.b === b) || (c.a === b && c.b === a),
  );
  if (!cand) {
    throw new CliError(
      `upt ground: no discovery candidate pairs '${a}' with '${b}' — they may not share a dimension, or are already connected (not a cross-cluster coincidence).`,
    );
  }

  const g = api.describeGrounding(cand);
  if (args.flags.has('json')) {
    emitJson(
      { command: 'ground', source, result: { a: cand.a, b: cand.b, verdict: cand.verdict, grounding: g } },
      ctx.write,
    );
    return 0;
  }

  out(`\n● ${cand.a} ≟ ${cand.b}  [${cand.verdict}]`);
  out(EPISTEMICS + '\n');
  out(`  passed:  ${g.passed.join(', ') || '—'}`);
  out(`  gaps:    ${g.gaps.join(', ') || '—'}`);
  out(
    `  ceiling: mechanism-tested ${g.mechanismTested} · data-tested ${g.dataTested} ` +
      '(permanent for a dimensional candidate — see `upt confront`)',
  );
  return 0;
}

export const command: Command = {
  name: 'ground',
  aliases: [],
  flags: FLAGS,
  help: HELP,
  run,
};

registerCommand(command);
