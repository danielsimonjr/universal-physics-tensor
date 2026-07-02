/**
 * `upt derive` — derive the caller's own equation's dimensional form, and
 * (with `--formula`) verify it and recover the dimensionless prefactor.
 * Transposed verbatim from bin/upt.mjs's `derive()` (lines 313-385, the
 * post-crash-fix body — `format(r.dim)`/`format(target.dim)` on the
 * dimension-check line), plus `--json`. `fmtMono`/`BASES`/`dimsEqualTol`
 * move here with it.
 */
import type { FlagSpec } from '../args.js';
import { registerCommand, type Command, type CommandCtx } from '../command.js';
import { emitJson } from '../output.js';
import { UsageError } from '../errors.js';
import type { Dimension } from '../../dimensional/types.js';

const FLAGS: FlagSpec[] = [
  { name: '--formula', valueStyle: 'next' },
  { name: '--debug', valueStyle: 'none' },
  { name: '--json', valueStyle: 'none' },
];

const HELP = `upt derive <target:dim> <var:dim> ... [--formula "<expr>"]
        Derive YOUR OWN equation's dimensional form. <dim> is a named
        dimension (length, time, mass, velocity, ...), a constant (hbar, c,
        G, k_B, e), or explicit (L^3.M^-1.T^-2). With --formula, also verify
        it and recover the dimensionless prefactor.
        e.g.  upt derive period:time length:length gravity:acceleration \\
                       --formula "2*pi*sqrt(length/gravity)"`;

const fmtMono = (m: Readonly<Record<string, number>>): string =>
  Object.entries(m)
    .filter(([, e]) => Math.abs(e) > 1e-9)
    .map(([n, e]) => (e === 1 ? n : `${n}^${e}`))
    .join('·') || '(dimensionless)';

const BASES = ['L', 'M', 'T', 'I', 'Theta', 'N', 'J'] as const;
const dimsEqualTol = (a: Dimension, b: Dimension): boolean =>
  BASES.every((k) => Math.abs((a[k] || 0) - (b[k] || 0)) < 1e-9);

async function run(ctx: CommandCtx): Promise<number> {
  const { args, api, out, err } = ctx;
  const isJson = args.flags.has('json');
  const debug = args.flags.has('debug');
  const formulaFlag = args.flags.get('formula');
  const formula = formulaFlag ? formulaFlag[formulaFlag.length - 1] : undefined;

  const rest = args.positionals;
  if (rest.length < 1) {
    throw new UsageError(
      'upt derive needs a target spec, e.g.  upt derive period:time length:length gravity:acceleration'
    );
  }

  let specs: { name: string; dim: Dimension }[];
  try {
    specs = rest.map((a) => {
      const c = a.indexOf(':');
      if (c < 1) throw new Error(`'${a}' must be name:dimension (e.g. period:time)`);
      return { name: a.slice(0, c), dim: api.parseDimensionSpec(a.slice(c + 1)) };
    });
  } catch (e) {
    throw new UsageError('  ' + (e as Error).message);
  }

  const target = specs[0];
  const governing = specs.slice(1);
  const det = api.dimensionallyDetermines(target, governing);

  let full: ReturnType<typeof api.buckinghamPi> | undefined;
  if (!det.determined) {
    full = api.buckinghamPi([target, ...governing]);
  }

  let formulaCheck: ReturnType<Awaited<ReturnType<typeof api.getFormulaDimensionChecker>>['check']> | undefined;
  let mean: number | undefined;
  let cv: number | undefined;

  if (formula) {
    const parser = await api.getFormulaParser();
    if (debug) err(`  [parser: ${await api.getFormulaParserKind()}]`);

    const checker = await api.getFormulaDimensionChecker();
    const dims = Object.fromEntries(governing.map((g) => [g.name, g.dim]));
    const r = checker.check(formula, dims);
    formulaCheck = r;

    let cf;
    try {
      cf = parser.parse(formula);
    } catch (e) {
      throw new UsageError('  formula parse error: ' + (e as Error).message);
    }

    if (det.determined) {
      const ratios: number[] = [];
      for (let j = 0; j < 3; j++) {
        const scope: Record<string, number> = {};
        governing.forEach((g, i) => {
          scope[g.name] = Math.pow(1.7 + i, 1 + 0.3 * j);
        });
        let cand = 1;
        for (const g of governing) cand *= Math.pow(scope[g.name], det.monomial?.[g.name] || 0);
        try {
          ratios.push(cf.evaluate(scope) / cand);
        } catch (e) {
          throw new UsageError('  formula uses an undeclared variable: ' + (e as Error).message);
        }
      }
      mean = ratios.reduce((a, b) => a + b, 0) / ratios.length;
      cv = Math.sqrt(ratios.reduce((a, b) => a + (b - mean!) ** 2, 0) / ratios.length) / Math.abs(mean);
    }
  }

  if (isJson) {
    emitJson(
      {
        command: 'derive',
        result: {
          determination: det,
          ...(full !== undefined ? { buckingham: full } : {}),
          ...(formulaCheck !== undefined ? { formulaCheck } : {}),
          ...(mean !== undefined ? { prefactor: mean } : {}),
        },
      },
      ctx.write
    );
    return 0;
  }

  out(`\n● ${target.name}  from {${governing.map((g) => g.name).join(', ')}}`);
  if (det.determined) {
    out(`  dimensionally determined up to a constant:  ${target.name} ∝ ${fmtMono(det.monomial!)}`);
  } else {
    out(`  NOT a unique monomial — ${full!.piGroupCount} free dimensionless group(s) (${full!.verdict}):`);
    for (const g of full!.piGroups) out(`     ${g.formula}`);
    out(`  (${det.reason})`);
  }

  if (formula) {
    const r = formulaCheck!;
    if (!r.ok) {
      out(`  formula dimensional check: ✗ ${r.error}`);
    } else {
      const matches = dimsEqualTol(r.dim!, target.dim);
      out(
        `  formula dimension: ${api.format(r.dim!)}`
          + (matches ? `  ✓ homogeneous, matches target` : `  ⚠ homogeneous but ≠ target ${api.format(target.dim)}`)
      );
    }

    if (!det.determined) {
      out('  formula given, but with no unique monomial there is no single prefactor to recover.');
    } else {
      out(
        cv! < 1e-9
          ? `  formula MATCHES the dimensional form — recovered prefactor ≈ ${mean!.toExponential(4)}`
          : `  formula does NOT match the dimensional monomial (different input-dependence — a decoy or different physics).`
      );
    }
  }

  return 0;
}

export const command: Command = {
  name: 'derive',
  aliases: ['dim'],
  flags: FLAGS,
  help: HELP,
  run,
};

registerCommand(command);
