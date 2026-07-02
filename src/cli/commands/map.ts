/**
 * `upt map` — how the equations LINK: the text linkage map, the visual
 * (mermaid/dot/svg) physics map, and the `--equation` user-junction
 * injection. Transposed verbatim from bin/upt.mjs's `proposedJunctions()`/
 * `analyzeEquation()`/`printEquationReport()`/`mapCmd()` (lines 387-545),
 * plus `--json` and the `--json`/`--format` conflict guard.
 *
 * `parseEquationFlag` is REPLACED by the `either`-style `--equation` FlagSpec
 * (`args.ts` already extracts `--equation=...` or `--equation "..."` into
 * `flags.get('equation')`). `parseDiscoveryOpts` moved to `_discovery-opts.ts`
 * — the old CLI's `proposedJunctions` fed `map`'s raw args through it
 * (bin/upt.mjs line 392), so `--proposed` shares `discover`'s
 * `--max-orders`/`--anchor` validation here too.
 */
import { writeFileSync } from 'node:fs';
import type { FlagSpec, ParsedArgs } from '../args.js';
import { registerCommand, type Command, type CommandCtx } from '../command.js';
import { resolveGraph } from '../graphs.js';
import { emitJson } from '../output.js';
import { UsageError, CliError } from '../errors.js';
import { parseDiscoveryOpts } from './_discovery-opts.js';
import type { BridgeEdge } from '../../composition/edge.js';
import type { VizJunction, VizModel } from '../../composition/graph-viz.js';
import type { EquationAnalysis } from '../../composition/user-equation.js';

const FLAGS: FlagSpec[] = [
  { name: '--source', valueStyle: 'attached' },
  { name: '--format', valueStyle: 'attached' },
  { name: '--out', valueStyle: 'attached' },
  { name: '--max-orders', valueStyle: 'attached' },
  { name: '--anchor', valueStyle: 'attached', repeatable: true },
  { name: '--proposed', valueStyle: 'none' },
  { name: '--equation', valueStyle: 'either' },
  { name: '--json', valueStyle: 'none' },
];

const HELP = `upt map [--source=catalog|canonical|both] [--format=text|mermaid|dot|svg]
        [--proposed] [--out=PATH] [--equation "TARGET = EXPR"]
        Map how the equations LINK: connected components (clusters) of the
        graph by shared quantities, the anchored core, the link hubs, and
        the isolated tail.
        --format=mermaid|dot|svg emits the VISUAL map (quantities = nodes,
        equations = junctions colored by status, one subgraph per component).
        text (default) is the unchanged linkage printout. svg renders the dot
        layout via the optional @viz-js/viz peer (npm i @viz-js/viz; or pipe
        dot through "dot -Tsvg"). --proposed overlays the unadjudicated
        identity-consequence relations (gray dashed). --out writes to a file
        (default stdout).
        --equation "TARGET = EXPR" injects YOUR OWN equation as a violet 'user'
        node and reports where it lands (which cluster / shared quantities), with
        a "did you mean?" hint for names that miss the catalog vocabulary. Use
        underscores for multi-word quantities (photon_energy -> photon-energy).
        e.g.  upt map --equation "period = 2*pi*sqrt(length/gravity)"`;

// Convert the derived identity-consequence proposals into viz junctions
// (gray-dashed, status 'proposed'). The library never imports proposed-bridges;
// the CLI does the conversion, keeping the epistemic firewall intact.
function proposedJunctions(
  api: CommandCtx['api'],
  graph: readonly BridgeEdge[],
  flags: ParsedArgs['flags']
): VizJunction[] {
  const opts = parseDiscoveryOpts(flags);
  const ranked = api.rankDiscoveries(graph, opts);
  return api.deriveProposedBridges(ranked).map((p) => ({
    id: p.id,
    label: p.id,
    status: 'proposed' as const,
    sources: (p.governing || []).map((g) => g.name),
    target: p.target.name,
  }));
}

// Build the catalog quantity name→dimension map for the chosen graph, then run
// the (testable) library analysis: parse + dimensional validation + "did you
// mean?" hints. The library owns the physics (constants' dimensions, inference);
// the CLI only formats.
async function analyzeEquation(
  api: CommandCtx['api'],
  equation: string,
  graph: readonly BridgeEdge[]
): Promise<EquationAnalysis> {
  const catalogDims = new Map<string, import('../../dimensional/types.js').Dimension>();
  for (const e of graph) {
    for (const q of [...e.sources, e.target]) catalogDims.set(q.name, q.dim);
  }
  return api.analyzeUserEquation(equation, catalogDims);
}

// Print the dimensional verdict, where the equation landed, and any hints.
// `out` is ctx.out (text mode → stdout) or ctx.err (visual → stderr).
function printEquationReport(
  api: CommandCtx['api'],
  model: VizModel,
  user: EquationAnalysis,
  out: (line?: string) => void
): void {
  out('');
  if (user.consistent === true) {
    out(`  ✓ dimensionally consistent: ${api.format(user.rhsDimension!)}`);
  } else if (user.consistent === false) {
    out(
      `  ⚠ dimensional MISMATCH: RHS is ${api.format(user.rhsDimension!)} but the target is ${api.format(
        user.targetDimension!
      )}`
    );
  } else if (user.rhsDimension) {
    out(`  · RHS dimension: ${api.format(user.rhsDimension)} (target not in the catalog, so no comparison)`);
  }
  const L = api.equationLanding(model, 'user-equation');
  if (L.isolated) {
    out('  ⚠ your equation is ISOLATED — it shares no quantity with this graph.');
  } else {
    out(
      `  ● your equation joins ${L.anchored ? 'the ANCHORED cluster' : 'a cluster'} of ${L.clusterSize} via {${L.sharedQuantities.join(', ')}}`
    );
    if (L.connectedJunctionIds.length) out(`     connects to: ${L.connectedJunctionIds.join(', ')}`);
  }
  for (const h of user.hints ?? []) {
    if (!h.suggestions.length) {
      out(`  ⚠ '${h.name}' did not match a catalog quantity (run \`upt canonical\` for the vocabulary).`);
    } else if (h.byDimension) {
      out(`  ⚠ '${h.name}' is unknown — by its inferred dimension, did you mean: ${h.suggestions.join(', ')}?`);
    } else {
      out(`  ⚠ '${h.name}' did not match a catalog quantity — did you mean: ${h.suggestions.join(', ')}?`);
    }
  }
}

async function run(ctx: CommandCtx): Promise<number> {
  const { args, api, out, err, write } = ctx;
  const { graph, label, source } = resolveGraph(api, args.flags);

  const fmtValues = args.flags.get('format');
  const fmt = fmtValues && fmtValues.length > 0 ? fmtValues[fmtValues.length - 1] : 'text';
  const isJson = args.flags.has('json');

  if (isJson && fmt !== 'text') {
    throw new UsageError('upt: pick one output form: --json or --format');
  }

  // --equation injects a user-supplied "TARGET = EXPR" as a 'user' junction.
  let user: EquationAnalysis | null = null;
  const equationValues = args.flags.get('equation');
  const equation = equationValues && equationValues.length > 0 ? equationValues[equationValues.length - 1] : null;
  if (equation != null) {
    if (!equation.trim()) {
      throw new UsageError('upt: --equation requires "TARGET = EXPR"');
    }
    try {
      user = await analyzeEquation(api, equation, graph); // throws UserEquationError on malformed structure
    } catch (e) {
      throw new UsageError('upt: ' + (e && (e as Error).message ? (e as Error).message : String(e)));
    }
    if (user.parseError) {
      throw new UsageError('upt: ' + user.parseError); // dimensionally malformed RHS
    }
  }

  const overlay = (extra: VizJunction[]): VizJunction[] => [
    ...(args.flags.has('proposed') ? proposedJunctions(api, graph, args.flags) : []),
    ...extra,
  ];

  if (isJson) {
    const linkage = api.linkageMap(graph);
    let landing: ReturnType<typeof api.equationLanding> | undefined;
    let userEquation: Record<string, unknown> | undefined;
    if (user) {
      const model = api.buildVizModel(graph, {
        title: `UPT physics map — ${label}`,
        extraJunctions: overlay([user.junction]),
      });
      landing = api.equationLanding(model, 'user-equation');
      userEquation = {
        equation: user.junction.label,
        consistent: user.consistent,
        rhsDimension: user.rhsDimension,
        targetDimension: user.targetDimension,
        hints: user.hints,
      };
    }
    emitJson(
      {
        command: 'map',
        source,
        result: { linkage, ...(user ? { landing, userEquation } : {}) },
      },
      write
    );
    return 0;
  }

  if (fmt === 'mermaid' || fmt === 'dot' || fmt === 'svg') {
    const extraJunctions = overlay(user ? [user.junction] : []);
    const model = api.buildVizModel(graph, {
      title: `UPT physics map — ${label}`,
      extraJunctions,
    });
    // svg is the dot layout rendered by the optional @viz-js/viz peer.
    let src: string;
    if (fmt === 'svg') {
      try {
        src = await api.renderDotToSvg(model.toDot());
      } catch (e) {
        throw new CliError(e && (e as Error).message ? (e as Error).message : String(e));
      }
    } else {
      src = fmt === 'mermaid' ? model.toMermaid() : model.toDot();
    }
    const outValues = args.flags.get('out');
    if (outValues && outValues.length > 0) {
      const path = outValues[outValues.length - 1];
      if (!path) {
        throw new CliError('upt: --out= requires a non-empty PATH');
      }
      try {
        writeFileSync(path, src);
      } catch (e) {
        throw new CliError((e as Error).message);
      }
      err(`upt: wrote ${fmt} (${model.junctions.length} junctions, ${model.clusters.length} clusters) to ${path}`);
    } else {
      write(src);
    }
    // Landing report goes to stderr so stdout/--out stays pure diagram source.
    if (user) printEquationReport(api, model, user, err);
    return 0;
  }
  if (fmt !== 'text') {
    throw new CliError(`upt: unknown --format='${fmt}' (expected: text | mermaid | dot | svg)`);
  }

  const m = api.linkageMap(graph);
  const mix = (s: Readonly<Record<string, number>>) =>
    Object.entries(s)
      .map(([k, v]) => `${v} ${k}`)
      .join(', ');
  out(`\nLinkage map — how the equations connect via shared quantities  [source: ${label}]`);
  out(`(${m.componentCount} components over ${graph.length} edges; ${m.compositions} compose into chains)\n`);
  for (const c of m.clusters.filter((x) => x.size > 1)) {
    out(`  ● cluster of ${c.size}${c.anchored ? '  [ANCHORED to known physics]' : ''}`);
    out(`     edges:  ${c.edges.join(', ')}`);
    out(`     status: ${mix(c.statusMix)}`);
    out(`     link hubs: ${c.hubs.join(', ')}\n`);
  }
  out(`  ○ isolated (${m.isolated.length}) — share no quantity with any other edge:`);
  out(`     ${m.isolated.join(', ')}`);
  out('\n  (a structural map — shared-quantity connectivity, NOT a credibility signal)');

  // --equation: where does the user's equation land in this graph?
  if (user) {
    const model = api.buildVizModel(graph, {
      title: `UPT physics map — ${label}`,
      extraJunctions: overlay([user.junction]),
    });
    out(`\nYour equation:  ${user.junction.label}`);
    printEquationReport(api, model, user, out);
  }
  return 0;
}

export const command: Command = {
  name: 'map',
  aliases: ['linkage'],
  flags: FLAGS,
  help: HELP,
  run,
};

registerCommand(command);
