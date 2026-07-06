/**
 * `upt confront` — run the catalog's committed real-data confrontations and
 * report predicted-vs-observed with the epistemics that confrontation ≠
 * confirmation. Not graph-parameterized (no --source).
 */
import type { FlagSpec } from '../args.js';
import { registerCommand, type Command, type CommandCtx } from '../command.js';
import { CliError } from '../errors.js';
import { emitJson } from '../output.js';

const FLAGS: FlagSpec[] = [
  { name: '--bridge', valueStyle: 'attached' },
  { name: '--sensitivity', valueStyle: 'none' },
  { name: '--json', valueStyle: 'none' },
];

const HELP = `upt confront [--bridge=be-XX] [--sensitivity] [--json]
        Run the catalog's committed real-data confrontations (predicted vs
        observed). --bridge runs one; --sensitivity adds a dimensionless
        elasticity ranking of the prediction's inputs (value-kind only) —
        this answers which input the prediction depends on most STRONGLY,
        NOT which dominates the uncertainty budget (that needs input sigma).`;

const EPISTEMICS =
  'confrontation is consistency, not confirmation; a passing confrontation does not prove the bridge.';
const SENSITIVITY_EPISTEMICS =
  ' sensitivity (elasticity) ranks which input the prediction depends on most STRONGLY; ' +
  'it is NOT which input dominates the uncertainty budget (that needs input sigma).';

function parseBridgeId(raw: string): number {
  // Accept "be-37", "BE-37", or "37".
  const m = /^(?:be-?)?(\d+)$/i.exec(raw.trim());
  if (!m) throw new CliError(`upt confront: invalid --bridge='${raw}' (expected be-XX)`);
  return Number(m[1]);
}

const SENSITIVITY_NOTE = 'strongest dependence, not uncertainty budget';

async function run(ctx: CommandCtx): Promise<number> {
  const { args, api, out } = ctx;
  const bridgeFlag = args.flags.get('bridge');
  const wantJson = args.flags.has('json');
  const wantSensitivity = args.flags.has('sensitivity');

  const entries =
    bridgeFlag && bridgeFlag.length
      ? (() => {
          const id = parseBridgeId(bridgeFlag[bridgeFlag.length - 1]);
          const one = api.listConfrontations().find((e) => e.bridgeId === id);
          if (!one) throw new CliError(`upt confront: no confrontation registered for be-${id}`);
          return [one];
        })()
      : api.listConfrontations();

  const results = entries.map((e) => ({
    bridgeId: e.bridgeId,
    title: e.title,
    outcome: e.run(),
    rigor: api.confrontationRigor(e.bridgeId),
  }));

  if (wantJson) {
    const jsonResults = results.map((r) => ({
      bridgeId: r.bridgeId,
      rigor: r.rigor,
      ...(wantSensitivity && r.outcome.kind === 'value'
        ? { ...r.outcome, sensitivity: api.decidingMeasurement(r.bridgeId) }
        : r.outcome),
    }));
    const epistemics = wantSensitivity ? EPISTEMICS + SENSITIVITY_EPISTEMICS : EPISTEMICS;
    emitJson(
      { command: 'confront', epistemics, rigorDistribution: api.rigorDistribution(), result: jsonResults },
      ctx.write,
    );
    return 0;
  }

  out('\nReal-data confrontations — predicted vs observed');
  out('(' + EPISTEMICS + (wantSensitivity ? SENSITIVITY_EPISTEMICS : '') + ')');
  // The spine is a RIGOR HIERARCHY, not N equal confirmations (docs/research/pi-instrument-results.md).
  if (entries.length > 1) {
    const d = api.rigorDistribution();
    out(
      `rigor: ${d.stringent} stringent · ${d.moderate} moderate · ${d.loose} loose — NOT ${entries.length} equal confirmations\n`,
    );
  } else {
    out('');
  }
  for (const { bridgeId, title, rigor, outcome } of results) {
    out(`  be-${bridgeId} [${rigor}]: ${title}`);
    switch (outcome.kind) {
      case 'value':
        out(
          `    predicted ${outcome.predicted} · observed ${outcome.observed} ± ${outcome.sigma} ${outcome.units} · residual ${outcome.residualInSigma.toFixed(2)}σ · ${outcome.withinObserved ? 'within 1σ ✓' : 'outside 1σ'}`
        );
        if (wantSensitivity) {
          const ranked = api.decidingMeasurement(bridgeId);
          if (ranked.length) {
            out(`    sensitivity (elasticity, ${SENSITIVITY_NOTE}):`);
            for (const { input, elasticity } of ranked) {
              out(`      ${input}: ${elasticity}`);
            }
          } else {
            out(`    sensitivity: no ranked-input model for be-${bridgeId}`);
          }
        }
        break;
      case 'upper-bound':
        out(
          `    predicted ${outcome.predicted} ${outcome.units} · bound ${outcome.bound} · ${outcome.satisfied ? 'not excluded ✓' : 'EXCLUDED'}${outcome.caveat ? ` · ${outcome.caveat}` : ''}`
        );
        if (wantSensitivity) out(`    sensitivity: n/a for ${outcome.kind}-kind`);
        break;
      case 'consistency':
        out(
          `    predicted ${outcome.predicted} approaches ${outcome.approaches} ${outcome.units} · gap ${(outcome.fractionalGap * 100).toFixed(1)}%`
        );
        if (wantSensitivity) out(`    sensitivity: n/a for ${outcome.kind}-kind`);
        break;
      case 'table':
        out(`    ${outcome.rows.length} rows (${outcome.units}):`);
        for (const row of outcome.rows) {
          out(
            `      ${row.label}: predicted ${row.predicted} · observed ${row.observed} ± ${row.sigma} · ${row.residualInSigma.toFixed(2)}σ`
          );
        }
        if (wantSensitivity) out(`    sensitivity: n/a for ${outcome.kind}-kind`);
        break;
    }
    out(`    source: ${outcome.provenance.citation}`);
  }
  return 0;
}

export const command: Command = { name: 'confront', aliases: [], flags: FLAGS, help: HELP, run };
registerCommand(command);
