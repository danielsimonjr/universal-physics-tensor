/**
 * `upt regime` — where in parameter space a family's models are claimed to
 * apply, and where nothing is claimed at all.
 *
 * The whole point of this command is the TRI-STATE of `regimeHolds`. A model
 * whose regime could not be checked at the given point is reported as
 * UNKNOWN, never as valid and never as violated: `'unknown'` is a failure to
 * confirm validity, and folding it either way is the silent pass
 * `atlas/regime.ts` exists to prevent. The text and JSON forms therefore both
 * carry three buckets, not two.
 *
 * `--at` states the point. Values are π-group values keyed by
 * `PiGroup.formula` (or a dimensionless input's own name), so `--at
 * theta0=0.2` is a coordinate, not a parameter of the physics.
 *
 * The uncovered-region report is taken over the box the CALLER stated and no
 * other: `uncoveredRegions` refuses to synthesize an extent, so with no `--at`
 * there is no box and the command says so rather than inventing one.
 */
import type { FlagSpec } from '../args.js';
import { registerCommand, type Command, type CommandCtx } from '../command.js';
import { CliError } from '../errors.js';
import { emitJson } from '../output.js';

const FLAGS: FlagSpec[] = [
  { name: '--at', valueStyle: 'either', repeatable: true },
  { name: '--json', valueStyle: 'none' },
];

const HELP = `upt regime <family> [--at group=value ...] [--json]
        Where in parameter space a family's models are claimed to apply.
        --at states a point in REGIME COORDINATES (π-group formulas, or a
        dimensionless input's own name, e.g. --at theta0=0.2). Every model AND
        bridge is reported as valid, violated (naming the failed inequality),
        or UNKNOWN — a coordinate the point never supplied is NOT a pass, and a
        regime that states no inequality is marked VACUOUS rather than passed.
        Also prints the pairwise overlap of the regimes and, over the box --at
        states, the points no CONSTRAINING regime covers.
        e.g.  upt regime oscillators --at theta0=0.2`;

/**
 * Collect `group=value` assignments from `--at` values and from bare
 * positionals, so `--at theta0=0.2 T0=1 t=10` works as written: the parser
 * gives `--at` one value and leaves the rest as positionals.
 *
 * @throws CliError on a malformed or non-finite assignment. A dropped
 *   coordinate would silently turn a CHECKED inequality into an unchecked one,
 *   which is exactly the reading this command exists to keep honest.
 * @internal
 */
export function parseAt(raw: readonly string[], command: string): Record<string, number> {
  const point: Record<string, number> = {};
  for (const token of raw) {
    const eq = token.indexOf('=');
    if (eq <= 0) {
      throw new CliError(`upt ${command}: '${token}' is not a group=value assignment`);
    }
    const name = token.slice(0, eq);
    const value = Number(token.slice(eq + 1));
    if (token.slice(eq + 1) === '' || !Number.isFinite(value)) {
      throw new CliError(`upt ${command}: '${token}' is not a finite number`);
    }
    point[name] = value;
  }
  return point;
}

/** Display form of one inequality — the alias when the record states one. */
function showInequality(ineq: { group: string; op: string; bound: number; alias?: string }): string {
  const literal = `${ineq.group} ${ineq.op} ${ineq.bound}`;
  return ineq.alias === undefined ? literal : `${literal} (${ineq.alias})`;
}

/** The group names an inequality list mentions. */
function groupsOf(inequalities: readonly { group: string }[]): Set<string> {
  return new Set(inequalities.map((i) => i.group));
}

async function run(ctx: CommandCtx): Promise<number> {
  const { args, api, out } = ctx;
  const wantJson = args.flags.has('json');
  const [familyArg, ...rest] = args.positionals.filter((p) => !p.includes('='));
  const assignments = [...(args.flags.get('at') ?? []), ...args.positionals.filter((p) => p.includes('='))];

  if (familyArg === undefined) {
    throw new CliError('upt regime: a family is required (e.g. `upt regime oscillators`)');
  }
  if (rest.length > 0) {
    throw new CliError(`upt regime: unexpected argument '${rest[0]}' (one family at a time)`);
  }
  // Every registered family, not one by name: this command used to hard-code
  // the oscillator family and so could not report the diffusion or wave
  // families at all once they existed.
  const family = api.ATLAS_FAMILIES.find((f) => f.family === familyArg);
  if (family === undefined) {
    throw new CliError(
      `upt regime: unknown family '${familyArg}' (known: ${api.ATLAS_FAMILIES.map((f) => f.family).join(', ')})`,
    );
  }

  const point = parseAt(assignments, 'regime');
  const stated = Object.keys(point);

  // Models AND bridges, because in this family every MODEL regime states zero
  // inequalities and only the BRIDGES carry real ones. A models-only report
  // would print nine confident 'valid's that were never checked against
  // anything — the tri-state's `true` is vacuous when there is nothing to
  // check, so that case is labelled rather than left to read as a pass.
  const records: { id: string; kind: 'model' | 'bridge'; regime: typeof family.models[number]['regime'] }[] = [
    ...family.models.map((m) => ({ id: m.id, kind: 'model' as const, regime: m.regime })),
    ...family.bridges.map((b) => ({ id: b.id, kind: 'bridge' as const, regime: b.regime })),
  ];

  const verdicts = records.map((r) => {
    const check = api.regimeHolds(r.regime, point);
    return {
      id: r.id,
      kind: r.kind,
      ok: check.ok,
      vacuous: r.regime.inequalities.length === 0,
      violated: check.violated.map(showInequality),
      unchecked: check.unchecked.map(showInequality),
    };
  });

  // Pairwise overlap, restricted to pairs that actually SHARE a coordinate.
  // `regimeOverlap` classifies on shared names only, so a pair with none is
  // vacuously 'nested' — a true answer that says nothing, and printing it
  // would bury the pairs that do constrain each other.
  const overlaps: { a: string; b: string; overlap: string; sharedGroups: string[] }[] = [];
  for (let i = 0; i < records.length; i++) {
    for (let j = i + 1; j < records.length; j++) {
      const a = records[i]!;
      const b = records[j]!;
      const gb = groupsOf(b.regime.inequalities);
      const shared = [...groupsOf(a.regime.inequalities)].filter((g) => gb.has(g));
      if (shared.length === 0) continue;
      overlaps.push({
        a: a.id,
        b: b.id,
        overlap: api.regimeOverlap(a.regime, b.regime),
        sharedGroups: shared,
      });
    }
  }

  // The box is what --at states, and nothing else.
  const samples: Record<string, number[]> = {};
  for (const [group, value] of Object.entries(point)) samples[group] = [value];
  // Coverage is asked of the records that actually CONSTRAIN something. An
  // unconstrained model regime holds at every point, so including the models
  // would make coverage vacuously total and the report would answer nothing.
  const constraining = records.filter((r) => r.regime.inequalities.length > 0);
  const uncovered =
    stated.length === 0 ? null : api.uncoveredRegions(family.family, constraining, samples);

  if (wantJson) {
    emitJson(
      {
        command: 'regime',
        epistemics:
          "an 'unknown' verdict is a failure to confirm validity, NEVER validity: a coordinate the " +
          'point did not supply was not checked, and an unchecked inequality is not a satisfied one. ' +
          'Uncovered regions are reported only over the box --at states; none is synthesized.',
        options: { family: family.family, at: point },
        result: {
          records: verdicts,
          overlaps,
          uncovered:
            uncovered === null
              ? null
              : { boxStated: true, points: uncovered.map((r) => ({ point: r.point })) },
        },
      },
      ctx.write,
    );
    return 0;
  }

  out(`\nRegimes of family '${family.family}'`);
  out(
    stated.length === 0
      ? '(no --at point supplied: every inequality is UNCHECKED, which is not a pass)'
      : `at ${stated.map((g) => `${g}=${point[g]}`).join(' · ')}`,
  );
  out('');
  for (const m of verdicts) {
    const verdict = m.ok === true ? 'valid' : m.ok === false ? 'VIOLATED' : 'unknown';
    // A vacuous 'valid' is marked on the same line, not left to read as a pass:
    // nothing was checked, so the verdict is not evidence the record applies here.
    const note = m.vacuous ? ' (VACUOUS — states no inequality; nothing was checked)' : '';
    out(`  [${m.kind}] ${m.id}: ${verdict}${note}`);
    for (const v of m.violated) out(`    violated: ${v}`);
    for (const u of m.unchecked) out(`    unchecked (no value supplied): ${u}`);
    if (!m.vacuous && m.violated.length === 0 && m.unchecked.length === 0) {
      out('    every inequality checked and satisfied');
    }
  }

  out('');
  out('Pairwise overlap (on shared coordinates only):');
  if (overlaps.length === 0) {
    out('  no two regimes share a coordinate, so none constrains another');
  } else {
    for (const o of overlaps) {
      out(`  ${o.a} vs ${o.b}: ${o.overlap} — shared: ${o.sharedGroups.join(', ')}`);
    }
  }

  out('');
  if (uncovered === null) {
    out('Uncovered regions: no box stated. Pass --at to say where you want to know about;');
    out('  a synthesized box would measure this tool’s guess, not the atlas.');
  } else if (uncovered.length === 0) {
    out('Uncovered regions: none — some constraining regime holds at every point of the stated box.');
  } else {
    out(
      `Uncovered regions: ${uncovered.length} point(s) of the stated box that no CONSTRAINING ` +
        `regime covers (${constraining.length} of ${records.length} records state an inequality):`,
    );
    for (const r of uncovered) {
      out(`  ${Object.entries(r.point).map(([g, v]) => `${g}=${v}`).join(' · ')}`);
    }
    out("  (an 'unknown' is not coverage — see the tri-state rule above)");
  }
  return 0;
}

export const command: Command = { name: 'regime', aliases: [], flags: FLAGS, help: HELP, run };
registerCommand(command);
