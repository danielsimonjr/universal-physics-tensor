/**
 * `upt connectors` — of the isolated bridges, which could connect to the
 * anchored core via a same-dimension identification. Transposed verbatim
 * from bin/upt.mjs's `connectorsCmd()` (lines 780-798), plus `--source`
 * (module-level `GRAPH` in the old CLI was always the catalog graph) and
 * `--json`.
 */
import type { FlagSpec } from '../args.js';
import { registerCommand, type Command, type CommandCtx } from '../command.js';
import { resolveGraph } from '../graphs.js';
import { emitJson } from '../output.js';

const FLAGS: FlagSpec[] = [
  { name: '--source', valueStyle: 'attached' },
  { name: '--json', valueStyle: 'none' },
];

const HELP = `upt connectors
        Of the 20 ISOLATED bridges, which could connect to the anchored
        core via a same-dimension identification? The structural frontier —
        same-kind connectors are the motivated set for physicist review.`;

const EPISTEMICS =
  '⚠ A REVIEW SURFACE: same dimension is a WEAK prior; most are decoys (a Förster\n' +
  '  radius is not a Schwarzschild radius). Same-kind (shared name token) = stronger.';

async function run(ctx: CommandCtx): Promise<number> {
  const { args, api, out } = ctx;
  const { graph, source } = resolveGraph(api, args.flags);
  const r = api.proposeOrphanConnectors(graph);

  if (args.flags.has('json')) {
    emitJson({ command: 'connectors', source, epistemics: EPISTEMICS, result: r }, ctx.write);
    return 0;
  }

  out('\nOrphan connectors — same-dimension identifications that would pull an ISOLATED');
  out("bridge into the anchored core (the catalog's structural frontier).");
  out('⚠ A REVIEW SURFACE: same dimension is a WEAK prior; most are decoys (a Förster');
  out('  radius is not a Schwarzschild radius). Same-kind (shared name token) = stronger.\n');
  out(
    `  ${r.connectedOrphans.length} of the isolated bridges have a same-kind connector; ` +
      `${r.unconnectedOrphans.length} are truly unconnected.\n`
  );
  out('  SAME-KIND connectors (the motivated set — orphan ≟ core via shared token):');
  let lastOrphan = '';
  for (const c of r.connectors.filter((x) => x.sameKind)) {
    if (c.orphanEdge !== lastOrphan) {
      out(`    ── ${c.orphanEdge} (isolated):`);
      lastOrphan = c.orphanEdge;
    }
    out(`        ${(c.orphanQuantity + ' ≟ ' + c.coreQuantity).padEnd(54)} [${c.dim}]  → ${c.coreEdge}`);
  }
  out(`\n  truly unconnected (no same-dimension bridge into them): ${r.unconnectedOrphans.join(', ')}`);
  out('\n  Physicist-reasoned ranking + the genuinely-motivated few (e.g. coarsening-length ≟');
  out('  quantum-correlation-length; tunneling-mass ≟ effective-mass) are written up in');
  out('  docs/research/Orphan-Connector-Analysis.md and proposed in spec Part-IX §9.');
  return 0;
}

export const command: Command = {
  name: 'connectors',
  aliases: ['orphans'],
  flags: FLAGS,
  help: HELP,
  run,
};

registerCommand(command);
