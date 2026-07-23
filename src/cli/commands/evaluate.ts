/**
 * `upt evaluate <be-NN> key=value …` — numerically evaluate a closed-form /
 * spacetime bridge (BE-51/52/55…65) via its registered evaluator. Closes the gap
 * where `upt explain <be-NN>` redirected to a "evaluated directly" capability that
 * did not exist. With no bridge id, lists the evaluable bridges + their inputs.
 */
import type { FlagSpec } from '../args.js';
import { registerCommand, type Command, type CommandCtx } from '../command.js';
import { emitJson } from '../output.js';
import { UsageError } from '../errors.js';
import { CliError } from '../errors.js';

const FLAGS: FlagSpec[] = [{ name: '--json', valueStyle: 'none' }];

const HELP = `upt evaluate <be-NN> key=value ...
        Numerically evaluate a closed-form / spacetime bridge (BE-51/52/55..65).
        e.g.  upt evaluate be-63 mu_e=2   → Chandrasekhar mass ≈ 1.44 M_⊙
              upt evaluate be-55 C=1      → quantum Hall R_H = von Klitzing constant
        With no bridge id, lists the evaluable bridges and their input keys.`;

function parseInputs(args: readonly string[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const a of args) {
    const eq = a.indexOf('=');
    if (eq < 0) {
      throw new UsageError(`upt evaluate: '${a}' must be key=value (e.g. mu_e=2). See \`upt help\`.`);
    }
    const key = a.slice(0, eq);
    const raw = a.slice(eq + 1);
    const num = Number(raw);
    if (raw === '' || !Number.isFinite(num)) {
      throw new UsageError(`upt evaluate: '${a}' is not a finite number. Expected ${key}=<number>.`);
    }
    out[key] = num;
  }
  return out;
}

async function run(ctx: CommandCtx): Promise<number> {
  const { args, api, out } = ctx;
  const [target, ...rest] = args.positionals;

  if (!target) {
    const specs = [...api.BRIDGE_EVALUATORS.values()];
    if (args.flags.has('json')) {
      emitJson(
        {
          command: 'evaluate',
          result: specs.map((s) => ({ bridgeId: s.bridgeId, name: s.name, inputKeys: s.inputKeys })),
        },
        ctx.write,
      );
      return 0;
    }
    out('\nEvaluable bridges  (upt evaluate <be-NN> key=value ...)');
    for (const s of specs) {
      out(`  be-${s.bridgeId}  ${s.name.padEnd(34)} inputs: ${s.inputKeys.join(', ')}`);
    }
    return 0;
  }

  const m = /^be-(\d+)$/i.exec(target);
  if (!m) {
    throw new UsageError(`upt evaluate: '${target}' is not a bridge id (be-NN). See \`upt help\`.`);
  }
  const id = Number(m[1]);
  const inputs = parseInputs(rest);

  let result: unknown;
  try {
    result = api.evaluateBridge(id, inputs);
  } catch (e) {
    // unknown-id / missing-input / out-of-range → bad value, exit 1 (documented contract).
    throw new CliError((e as Error).message);
  }

  if (args.flags.has('json')) {
    emitJson({ command: 'evaluate', result: { bridgeId: id, inputs, output: result } }, ctx.write);
    return 0;
  }
  out(`\n● be-${id}  ${api.BRIDGE_EVALUATORS.get(id)?.name ?? ''}`);
  out('  inputs: ' + Object.entries(inputs).map(([k, v]) => `${k}=${v}`).join(', '));
  for (const [k, v] of Object.entries(result as Record<string, unknown>)) {
    out(`  ${k} = ${typeof v === 'number' ? v : JSON.stringify(v)}`);
  }
  return 0;
}

export const command: Command = {
  name: 'evaluate',
  aliases: [],
  flags: FLAGS,
  help: HELP,
  run,
};

registerCommand(command);
