/**
 * `upt explain` — explain how the graph determines a quantity: the
 * identifiability verdict, recovered value, derivation chains, and whether
 * the inputs are dimensionally sufficient. Transposed verbatim from
 * bin/upt.mjs's `explain()` + `parseKnown()` (lines 183-235), plus
 * `--source` (the old CLI's module-level `GRAPH` was always the catalog
 * graph) and `--json`.
 *
 * `parseKnown`'s two-mode positional contract (bare names XOR name=value,
 * never mixed) and its malformed-input rejections are pinned by
 * `tests/cli/upt-explain-inputs.test.ts` against the old bin — ported here
 * unchanged, with `process.exit(2)` sites converted to `UsageError` (same
 * message text; `main.ts`'s catch maps it to exit 2).
 */
import type { FlagSpec } from '../args.js';
import { registerCommand, type Command, type CommandCtx } from '../command.js';
import { resolveGraph } from '../graphs.js';
import { emitJson } from '../output.js';
import { UsageError } from '../errors.js';

const FLAGS: FlagSpec[] = [
  { name: '--source', valueStyle: 'attached' },
  { name: '--json', valueStyle: 'none' },
];

const HELP = `upt explain <quantity> [name=value | name] ...
        Explain how the graph determines a quantity: the identifiability
        verdict, recovered value, derivation chains, and whether the inputs
        are dimensionally sufficient.
        e.g.  upt explain hawking-temperature mass=1.989e30`;

/**
 * Two modes, never mixed: bare names (structural analysis) OR name=value
 * (adds value recovery). Malformed inputs are rejected with a `UsageError`
 * rather than silently coerced — `mass=abc`→dropped, `mass=`→0,
 * `mass=1e500`→∞, and a bare name alongside a valued one were all silent
 * wrong-physics footguns.
 */
function parseKnown(args: readonly string[]): string[] | Record<string, number> {
  const valued = args.filter((a) => a.includes('='));
  if (valued.length === 0) return [...args]; // names mode

  if (valued.length !== args.length) {
    const bare = args.filter((a) => !a.includes('=')).join(', ');
    throw new UsageError(
      `upt: cannot mix bare names (${bare}) with name=value inputs. `
        + 'Use all names (structural) or all name=value (with recovery). See `upt help`.'
    );
  }

  const values: Record<string, number> = {};
  for (const a of args) {
    const eq = a.indexOf('=');
    const name = a.slice(0, eq);
    const raw = a.slice(eq + 1);
    const num = Number(raw);
    if (raw === '' || !Number.isFinite(num)) {
      throw new UsageError(`upt: '${a}' is not a finite number. Expected ${name}=<number>. See \`upt help\`.`);
    }
    values[name] = num;
  }
  return values;
}

async function run(ctx: CommandCtx): Promise<number> {
  const { args, api, out } = ctx;
  const { graph, source } = resolveGraph(api, args.flags);

  const [target, ...rest] = args.positionals;
  if (!target) {
    throw new UsageError('upt explain needs a quantity name. See `upt help`.');
  }

  const known = parseKnown(rest);
  const x = api.explainQuantity(graph, target, known);

  if (args.flags.has('json')) {
    emitJson({ command: 'explain', source, result: x }, ctx.write);
    return 0;
  }

  out(`\n● ${target}`);
  out(`  ${x.summary}`);
  if (x.derivations.length) {
    out('  derivations:');
    for (const d of x.derivations) {
      const val = d.value !== undefined ? ` = ${d.value.toExponential(4)}` : '';
      const chain =
        d.leafInputs.join(',') !== d.sources.join(',') ? `  [from leaves: ${d.leafInputs.join(', ')}]` : '';
      out(`    - ${d.edge} (${d.label})${val}${chain}`);
      if (d.dimensionalForm) out(`        ${d.dimensionalForm.formula}`);
    }
  }
  if (x.blockingFrontier.length) {
    out(`  to determine it, also supply: ${x.blockingFrontier.join(', ')}`);
  }
  return 0;
}

export const command: Command = {
  name: 'explain',
  aliases: [],
  flags: FLAGS,
  help: HELP,
  run,
};

registerCommand(command);
