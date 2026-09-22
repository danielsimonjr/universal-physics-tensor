/**
 * `upt path` — the route between two models of a family, and what that route
 * actually WARRANTS.
 *
 * Two answers, kept apart on purpose, because `atlas/path-bound.ts` keeps them
 * apart: `findPath` says a chain of bridges exists, and that says nothing about
 * whether the chain supports a claim. `boundPath` says what it supports, and
 * its answer is a DISCRIMINATED UNION whose `'no-claim'` member carries no
 * number at all. This command never prints a bound for a no-claim, and never
 * synthesizes one — a precise-looking composed number over an undefined
 * composite is the most dangerous thing this tool could emit.
 *
 * A no-claim is an ANSWER, not an error: `upt path` exits 0 when the
 * composition table declines to compose. The refusal is the result.
 *
 * Horizons are evaluated only when `--at` supplies a `t`. An unevaluated
 * horizon is reported as unevaluated, on the same rule that makes
 * `regimeHolds` tri-state.
 */
import type { FlagSpec } from '../args.js';
import { registerCommand, type Command, type CommandCtx } from '../command.js';
import { CliError } from '../errors.js';
import { emitJson } from '../output.js';
import { parseAt } from './regime.js';

const FLAGS: FlagSpec[] = [
  { name: '--at', valueStyle: 'either', repeatable: true },
  { name: '--json', valueStyle: 'none' },
];

const HELP = `upt path <from> <to> [--at group=value ...] [--json]
        The chain of bridges from one model to another, the relation the chain
        composes to, the composed (K, delta) with the norm it holds in, and
        whether every horizon on the path still holds at --at (pass t=<time>
        plus the horizon's parameters, e.g. --at theta0=0.2 T0=1 t=10).
        When the composition table declines to compose the relations, the path
        carries NO bound: the command prints 'no composite claim' and exits 0.
        That refusal is the answer, and no number is invented in its place.
        e.g.  upt path model-pendulum model-spring --at theta0=0.2 T0=1 t=10`;

const EPISTEMICS =
  'a path EXISTING is not a warrant: the bound is the warrant. A no-claim carries no number, ' +
  'and none is synthesized for it.';

/** The literal phrase the no-composite-claim case must print. */
const NO_COMPOSITE_PHRASE = 'no composite claim';

interface HorizonReport {
  bridgeId: string;
  horizon: string;
  holds: boolean | null;
}

async function run(ctx: CommandCtx): Promise<number> {
  const { args, api, out } = ctx;
  const wantJson = args.flags.has('json');
  const endpoints = args.positionals.filter((p) => !p.includes('='));
  const assignments = [...(args.flags.get('at') ?? []), ...args.positionals.filter((p) => p.includes('='))];

  if (endpoints.length !== 2) {
    throw new CliError(
      `upt path: exactly two model ids are required (got ${endpoints.length}); e.g. ` +
        '`upt path model-pendulum model-spring`',
    );
  }
  const [from, to] = endpoints as [string, string];
  const point = parseAt(assignments, 'path');
  const t = point['t'];

  // The family is read off the endpoints — this used to be the oscillator
  // family, hard-coded, so no path in the diffusion or wave families could be
  // asked for. A route stays inside ONE family (findPath's scope); two
  // endpoints in different families are reported as exactly that.
  const familyOf = (id: string): string | undefined =>
    api.ATLAS_FAMILIES.find((f) => f.models.some((m) => m.id === id))?.family;
  const fromFamily = familyOf(from);
  const toFamily = familyOf(to);
  if (fromFamily !== undefined && toFamily !== undefined && fromFamily !== toFamily) {
    throw new CliError(
      `upt path: '${from}' is in family '${fromFamily}' and '${to}' in '${toFamily}'; ` +
        'routes are searched within one family, and cross-family routes are not supported',
    );
  }
  const family = fromFamily ?? toFamily ?? api.ATLAS_FAMILIES[0]!.family;

  let bridges: readonly import('../../cli-api.js').AtlasBridge[] | null;
  try {
    bridges = api.findPath(family, from, to);
  } catch (e) {
    // RangeError: an unknown endpoint. Reported as a CliError (exit 1) rather
    // than surfaced as a crash — and NOT as `null`, which would be
    // indistinguishable from a genuinely disconnected pair.
    throw new CliError(`upt path: ${e instanceof Error ? e.message : String(e)}`);
  }

  if (bridges === null) {
    if (wantJson) {
      emitJson(
        { command: 'path', epistemics: EPISTEMICS, options: { from, to, at: point }, result: { path: null } },
        ctx.write,
      );
      return 0;
    }
    out(`\nupt path ${from} → ${to}`);
    out('  no chain of bridges connects these models; there is nothing to compose.');
    return 0;
  }

  if (bridges.length === 0) {
    if (wantJson) {
      emitJson(
        { command: 'path', epistemics: EPISTEMICS, options: { from, to, at: point }, result: { path: [] } },
        ctx.write,
      );
      return 0;
    }
    out(`\nupt path ${from} → ${to}`);
    out('  the endpoints are the same model: the path is empty and composes nothing.');
    return 0;
  }

  const result = api.boundPath(bridges);

  const horizons: HorizonReport[] = bridges
    .filter((b) => b.bound !== undefined)
    .map((b) => ({
      bridgeId: b.id,
      horizon: b.bound!.horizon,
      holds: t === undefined ? null : b.bound!.horizonHolds(t, point),
    }));
  const allHold = horizons.every((h) => h.holds === true);

  if (wantJson) {
    emitJson(
      {
        command: 'path',
        epistemics: EPISTEMICS,
        options: { from, to, at: point },
        result: {
          path: bridges.map((b) => ({ id: b.id, relation: b.relation, from: b.premises[0], to: b.conclusion })),
          // A no-claim has no `bound` key at all — the type refuses it, and so
          // does this envelope.
          ...(result.kind === 'bound'
            ? {
                kind: 'bound',
                relation: result.relation,
                bound: result.bound,
                norm: result.norm,
                terminal: result.terminal,
              }
            : { kind: 'no-claim', reason: result.reason, detail: result.detail, phrase: NO_COMPOSITE_PHRASE }),
          horizons,
          horizonsEvaluated: t !== undefined,
          allHorizonsHold: t === undefined ? null : allHold,
        },
      },
      ctx.write,
    );
    return 0;
  }

  out(`\nupt path ${from} → ${to}`);
  out(`  ${bridges.length} bridge(s):`);
  for (const b of bridges) out(`    ${b.premises[0]} --[${b.relation}]--> ${b.conclusion}  (${b.id})`);
  out('');
  if (result.kind === 'bound') {
    out(`  composite relation: ${result.relation}`);
    out(`  composed bound: K = ${result.bound.K} · delta = ${result.bound.delta}`);
    out(`  norm: ${result.norm ?? '(none stated — the claim is the vacuous identity)'}`);
    if (result.terminal) out('  terminal: the last step states no Lipschitz constant; the claim ends there');
  } else {
    out(`  composite relation: ${NO_COMPOSITE_PHRASE}`);
    out(`  bound: ${NO_COMPOSITE_PHRASE} — reason '${result.reason}'`);
    out(`    ${result.detail}`);
  }
  out('');
  if (horizons.length === 0) {
    out('  horizons: none on this path (no step carries a bound)');
  } else if (t === undefined) {
    out('  horizons: NOT EVALUATED (no t= supplied via --at); an unevaluated horizon is not a passing one');
    for (const h of horizons) out(`    ${h.bridgeId}: ${h.horizon}`);
  } else {
    out(`  horizons at t=${t}: ${allHold ? 'all hold' : 'NOT all hold'}`);
    for (const h of horizons) {
      out(`    ${h.bridgeId}: ${h.holds ? 'holds' : 'VIOLATED'} — ${h.horizon}`);
    }
  }
  out(`  (${EPISTEMICS})`);
  return 0;
}

export const command: Command = { name: 'path', aliases: [], flags: FLAGS, help: HELP, run };
registerCommand(command);
