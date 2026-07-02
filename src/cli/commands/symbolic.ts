/**
 * `upt symbolic` — compose bridges' SYMBOLIC (AST) forms, not just their
 * numeric evaluators (the Observable contract). Transposed verbatim from
 * bin/upt.mjs's `symbolicCmd()` + `exprToString()` (lines 734-777), plus
 * `--json`.
 */
import type { FlagSpec } from '../args.js';
import { registerCommand, type Command, type CommandCtx } from '../command.js';
import { emitJson } from '../output.js';
import type { ExprNode } from '../../dimensional/validator.js';

const FLAGS: FlagSpec[] = [
  { name: '--simplify', valueStyle: 'none' },
  { name: '--json', valueStyle: 'none' },
];

const HELP = `upt symbolic [--simplify]
        Compose bridges' SYMBOLIC (AST) forms, not just their numeric
        evaluators (the Observable contract). Shows the CT-1 / CT-1b chains
        composed by substitution, dimensionally validated and evaluable.
        With --simplify, folds the composed AST via MathTS (k_B cancels),
        re-validated dimensionally + numerically.`;

function exprToString(n: ExprNode): string {
  if (n.kind === 'symbol') return n.name;
  if (n.kind === 'op') {
    if (n.op === '^') return `${exprToString(n.args[0])}^${exprToString(n.args[1])}`;
    const sep = n.op === '*' ? '·' : ` ${n.op} `;
    const inner = n.args
      .map((a) => {
        const s = exprToString(a);
        return a.kind === 'op' && (a.op === '+' || a.op === '-' || a.op === '/') ? `(${s})` : s;
      })
      .join(sep);
    return inner;
  }
  return `⟨${n.kind}⟩`;
}

async function run(ctx: CommandCtx): Promise<number> {
  const { args, api, out } = ctx;
  const doSimplify = args.flags.has('simplify');
  const isJson = args.flags.has('json');
  const chains = [
    { first: api.be42Edge, second: api.be16Edge, label: 'CT-1  (be-42 ∘ be-16, via hawking-temperature ≡ temperature)' },
    {
      first: api.lawSchwarzschildRadius,
      second: api.be42ViaRsEdge,
      label: 'CT-1b (law-r_s ∘ be-42-via-rs, name-match junction)',
    },
  ];

  const jsonResult: unknown[] = [];

  if (!isJson) {
    out('\nSymbolic bridge composition — composing the SYMBOLIC forms, not just numbers');
    out('(the Observable contract: composed AST, dimensionally validated + numerically evaluable)\n');
  }

  for (const { first, second, label } of chains) {
    const obs = api.composeSymbolic(first, second);
    const num = obs.evaluate({ mass: api.M_SUN_KG });

    if (!isJson) {
      out(`  ● ${label}`);
      out(`      composed:   ${obs.name}(${obs.leaves.join(',')}) = ${exprToString(obs.expr)}`);
    }

    if (doSimplify) {
      const s = await api.simplifyObservable(obs);
      const sNum = s.evaluate({ mass: api.M_SUN_KG });
      if (isJson) {
        jsonResult.push({
          label,
          name: s.name,
          leaves: s.leaves,
          expr: exprToString(s.expr),
          dim: api.format(s.dim),
          value: sNum,
          simplified: true,
        });
      } else {
        const tag = s.expr === obs.expr ? '  (unchanged — minimal, MathTS absent, or not reducible here)' : '';
        out(`      simplified: ${s.name}(${s.leaves.join(',')}) = ${exprToString(s.expr)}${tag}`);
        out(`      value @ mass = M_sun:  ${sNum.toExponential(4)}  (= composed, ${api.format(s.dim)})`);
      }
    } else if (isJson) {
      jsonResult.push({
        label,
        name: obs.name,
        leaves: obs.leaves,
        expr: exprToString(obs.expr),
        dim: api.format(obs.dim),
        value: num,
      });
    } else {
      out(`      dimension: ${api.format(obs.dim)}   (validated on the composed AST)`);
      out(`      value @ mass = M_sun:  ${num.toExponential(4)}`);
    }
    if (!isJson) out('');
  }

  if (isJson) {
    emitJson({ command: 'symbolic', result: jsonResult }, ctx.write);
    return 0;
  }

  out('  Both compose by AST substitution at the junction and match the numeric composeEdges');
  out(
    '  pipeline to float precision.'
      + (doSimplify
        ? ' --simplify folds the composed AST via MathTS (k_B cancels), guarded by re-validation.'
        : ' Pass --simplify to fold the composed AST via MathTS.')
  );
  return 0;
}

export const command: Command = {
  name: 'symbolic',
  aliases: ['compose-symbolic'],
  flags: FLAGS,
  help: HELP,
  run,
};

registerCommand(command);
