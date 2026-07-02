/**
 * `upt canonical` — list the canonical-equation (standard-physics L-layer)
 * registry. Transposed verbatim from bin/upt.mjs's `canonicalCmd()`
 * (lines 801-815), plus `--json`. No `--source`.
 */
import type { FlagSpec } from '../args.js';
import { registerCommand, type Command, type CommandCtx } from '../command.js';
import { emitJson } from '../output.js';

const FLAGS: FlagSpec[] = [{ name: '--json', valueStyle: 'none' }];

const HELP = `upt canonical
        List the canonical-equation registry — the standard-physics L-layer
        (textbook "answer key") with each entry's fidelity (L0/L1/L2),
        domain, and bridge partners, plus the coverage gap.`;

async function run(ctx: CommandCtx): Promise<number> {
  const { args, api, out } = ctx;
  const entries = api.CANONICAL_EQUATIONS;
  const gap = api.bridgesWithoutCanonicalPartner();

  if (args.flags.has('json')) {
    emitJson({ command: 'canonical', result: { entries, gap } }, ctx.write);
    return 0;
  }

  const fidelity = (e: (typeof entries)[number]) => (e.fieldEquation ? 'L2' : e.scalarAst ? 'L1' : 'L0');
  out('\nCanonical-equation registry — the standard-physics L-layer (Π = L + B + E)');
  out('the textbook "answer key" bridge equations are validated against.\n');
  out(`  ${entries.length} entries:\n`);
  out('   fid  domain               id                       partners');
  out('   ─────────────────────────────────────────────────────────────────');
  for (const e of entries) {
    const partners = [...e.partnerBridges, ...(e.restatesBridge ? [`=${e.restatesBridge}`] : [])].join(',') || '—';
    out(`   ${fidelity(e).padEnd(3)}  ${e.domain.padEnd(19)} ${e.id.padEnd(24)} ${partners}`);
  }
  out(`\n  coverage: ${gap.length} catalog bridges have no canonical partner yet`);
  out('  (fidelity: L0 dimensional · L1 scalar-AST · L2 field-equation; "=NN" = restatesBridge)');
  return 0;
}

export const command: Command = {
  name: 'canonical',
  aliases: ['laws'],
  flags: FLAGS,
  help: HELP,
  run,
};

registerCommand(command);
