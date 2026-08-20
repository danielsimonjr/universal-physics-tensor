/**
 * `upt probe <subverb>` — experimental Product B expression/residual search.
 *
 * Orthogonal to `upt discover` (Product A quantity identification). Relation-
 * link and regime-transition gaps abstain and tell the user to use discover.
 */
import { readFileSync } from 'node:fs';
import type { FlagSpec } from '../args.js';
import { registerCommand, type Command, type CommandCtx } from '../command.js';
import { resolveGraph } from '../graphs.js';
import { emitJson } from '../output.js';
import { UsageError, CliError } from '../errors.js';

const SUBVERBS = ['scan', 'show', 'run', 'candidates', 'falsify', 'rank', 'design', 'reproduce'] as const;
type Subverb = (typeof SUBVERBS)[number];

const FLAGS: FlagSpec[] = [
  { name: '--source', valueStyle: 'attached' },
  { name: '--json', valueStyle: 'none' },
  { name: '--problem', valueStyle: 'attached' },
  { name: '--budget-ms', valueStyle: 'attached' },
  { name: '--holdout-tol', valueStyle: 'attached' },
  { name: '--worker', valueStyle: 'attached' },
  { name: '--bounds', valueStyle: 'attached' },
  { name: '--h1', valueStyle: 'attached' },
  { name: '--h2', valueStyle: 'attached' },
];

const HELP = `upt probe <scan|show|run|candidates|falsify|rank|design|reproduce>
        Experimental expression/residual search (Product B). Orthogonal to
        \`upt discover\`, which vets quantity identifications a≡b and is frozen.
        Relation-link / regime-transition gaps are not searchable here — use
        \`upt discover\`.
        scan                 typed frontier gaps (Product A wrappers + notes)
        show <gap-id>        one gap
        run --problem=FILE   bounded native search (MHC / holdout / budget)
        candidates           same as run; list stored statuses
        falsify              run + print falsification batteries
        rank                 run + Pareto front
        design --h1= --h2= --bounds=   discriminating experiment suggestion
        reproduce --problem=FILE       re-run a problem (same stop contract)
        --budget-ms=N        wall-clock cap (default 5000)
        --holdout-tol=X      relative holdout RMSE cap (default 0.15)
        --worker=PATH        optional NDJSON worker (spawned as node PATH)
        --json               machine envelope`;

const EPISTEMICS =
  '⚠ experimental Product B. Not a discovery claim. `upt discover` is the identification funnel.';

function isSubverb(s: string | undefined): s is Subverb {
  return SUBVERBS.includes(s as Subverb);
}

function budgetFromFlags(api: CommandCtx['api'], flags: Map<string, string[]>) {
  const raw = flags.get('budget-ms')?.[0];
  if (raw === undefined) return undefined;
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) {
    throw new UsageError('upt probe: --budget-ms must be a positive number');
  }
  return { ...api.DEFAULT_SEARCH_BUDGET, maxWallClockMs: n };
}

function problemPath(flags: Map<string, string[]>): string {
  const p = flags.get('problem')?.[0];
  if (!p) throw new UsageError('upt probe: --problem=FILE is required for this subverb');
  return p;
}

async function run(ctx: CommandCtx): Promise<number> {
  const { args, api, out } = ctx;
  const sub = args.positionals[0];
  if (!isSubverb(sub)) {
    throw new UsageError(
      `upt probe needs a subverb (${SUBVERBS.join('|')}). See \`upt help probe\`.`,
    );
  }

  const { graph, source } = resolveGraph(api, args.flags);

  if (sub === 'scan') {
    const gaps = api.scanFrontier(graph);
    if (args.flags.has('json')) {
      emitJson({ command: 'probe', source, epistemics: EPISTEMICS, result: gaps }, ctx.write);
      return 0;
    }
    out(api.formatFrontierScan(gaps));
    return 0;
  }

  if (sub === 'show') {
    const id = args.positionals[1];
    if (!id) throw new UsageError('upt probe show needs a gap id (fg-*). See `upt help probe`.');
    const gap = api.findFrontierGap(graph, id);
    if (!gap) throw new CliError(`upt probe show: no gap '${id}' on this graph`);
    if (args.flags.has('json')) {
      emitJson({ command: 'probe', source, epistemics: EPISTEMICS, result: gap }, ctx.write);
      return 0;
    }
    out(api.formatFrontierGap(gap));
    return 0;
  }

  if (sub === 'design') {
    const h1p = args.flags.get('h1')?.[0];
    const h2p = args.flags.get('h2')?.[0];
    const bp = args.flags.get('bounds')?.[0];
    if (!h1p || !h2p || !bp) {
      throw new UsageError('upt probe design needs --h1=FILE --h2=FILE --bounds=FILE');
    }
    const suggestion = api.suggestDiscriminatingPoint(
      api.parseExprJson(h1p),
      api.parseExprJson(h2p),
      JSON.parse(readFileSync(bp, 'utf8')),
    );
    if (args.flags.has('json')) {
      emitJson({ command: 'probe', epistemics: EPISTEMICS, result: suggestion }, ctx.write);
      return 0;
    }
    if (suggestion.abstained) {
      out(`upt probe design — abstained: ${suggestion.reason}`);
      return 0;
    }
    out('upt probe design — suggested discriminating point (never in a forbidden region)');
    out(`  discrimination |H1-H2|/σ = ${suggestion.discrimination}`);
    out(`  point ${JSON.stringify(suggestion.point)}`);
    out(`  H1=${suggestion.h1}  H2=${suggestion.h2}`);
    return 0;
  }

  const problem = api.loadSearchProblemFromJson(problemPath(args.flags));
  const holdoutTol = args.flags.get('holdout-tol')?.[0];
  const worker = args.flags.get('worker')?.[0];
  const result = await api.runProbeSearch(problem, {
    budget: budgetFromFlags(api, args.flags),
    holdoutTol: holdoutTol !== undefined ? Number(holdoutTol) : undefined,
    backendArgv: worker ? [process.execPath, worker] : undefined,
  });

  if (sub === 'run' || sub === 'reproduce' || sub === 'rank' || sub === 'candidates' || sub === 'falsify') {
    if (args.flags.has('json')) {
      emitJson(
        {
          command: 'probe',
          source,
          epistemics: EPISTEMICS,
          options: { subverb: sub },
          result: {
            stopReason: result.stopReason,
            runId: result.manifest.runId,
            candidates: result.candidates.map((c) => ({
              id: c.id,
              status: c.status,
              fingerprint: c.fingerprint,
              complexity: c.complexity,
            })),
            ranked: result.ranked.map((r) => ({
              id: r.record.id,
              pareto: r.pareto,
              scores: r.scores,
              status: r.record.status,
            })),
            wording: result.wording,
            ...(sub === 'falsify' ? { falsifications: result.falsifications } : {}),
          },
        },
        ctx.write,
      );
      return 0;
    }
    out(api.formatProbeReport(result));
    if (sub === 'falsify') {
      for (const [id, fal] of Object.entries(result.falsifications)) {
        out(`\n  falsify ${id} survived=${fal.survived}`);
        for (const rec of fal.records) out(`    ${rec.battery}: ${rec.outcome} — ${rec.detail}`);
      }
    }
    return 0;
  }

  throw new UsageError(`upt probe: unhandled subverb '${sub}'`);
}

export const command: Command = {
  name: 'probe',
  aliases: [],
  flags: FLAGS,
  help: HELP,
  run,
};

registerCommand(command);
