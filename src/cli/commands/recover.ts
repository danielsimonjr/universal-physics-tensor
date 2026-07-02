/**
 * `upt recover` — validate bridges against standard physics (bridge↔canonical
 * linkage, the F4 circularity guard). Transposed verbatim from bin/upt.mjs's
 * `recoverCmd()` (lines 818-841), plus `--json`. No `--source`.
 */
import type { FlagSpec } from '../args.js';
import { registerCommand, type Command, type CommandCtx } from '../command.js';
import { emitJson } from '../output.js';

const FLAGS: FlagSpec[] = [{ name: '--json', valueStyle: 'none' }];

const HELP = `upt recover
        Validate bridges against standard physics: classify each bridge↔
        canonical link as restates-canonical (F4 circularity — NOT a
        discovery), recovers (undeclared structural match), or
        dimensional-only.`;

const EPISTEMICS =
  '⚠ structural match is "same relation UP TO a dimensionless factor"; that factor\n' +
  '  may itself be physically substantive (e.g. ⟨e^-βW⟩). A review surface.';

async function run(ctx: CommandCtx): Promise<number> {
  const { args, api, out } = ctx;
  const all = api.scanLinkages();

  if (args.flags.has('json')) {
    emitJson({ command: 'recover', epistemics: EPISTEMICS, result: all }, ctx.write);
    return 0;
  }

  const by = (c: string) => all.filter((r) => r.classification === c);
  const restates = by('restates-canonical');
  const recovers = by('recovers');
  const dimOnly = by('dimensional-only');
  out('\nBridge↔canonical recovery — validating bridges against standard physics');
  out('⚠ structural match is "same relation UP TO a dimensionless factor"; that factor');
  out('  may itself be physically substantive (e.g. ⟨e^-βW⟩). A review surface.\n');
  out(
    `  ${all.length} non-unrelated links  →  ${restates.length} restates-canonical  ` +
      `·  ${recovers.length} recovers  ·  ${dimOnly.length} dimensional-only\n`
  );
  if (restates.length) {
    out('  RESTATES-CANONICAL (the bridge IS the canonical law — F4: NOT a discovery):');
    for (const r of restates) {
      const rec = r.recovery && r.recovery.tested ? ` (recovery exact, err ${r.recovery.maxRelErr.toExponential(0)})` : '';
      out(`    ${r.canonicalId.padEnd(26)} ≡ bridge ${r.bridgeId}${rec}`);
    }
  }
  if (recovers.length) {
    out("\n  RECOVERS (undeclared structural correspondence — worth a physicist's look):");
    for (const r of recovers) {
      out(`    ${r.canonicalId.padEnd(26)} ~ bridge ${r.bridgeId}  (same form up to a dimensionless factor)`);
    }
  }
  out(`\n  (${dimOnly.length} dimensional-only: same dimension, different form. Run \`upt canonical\` for the registry.)`);
  return 0;
}

export const command: Command = {
  name: 'recover',
  aliases: ['recovery', 'validate'],
  flags: FLAGS,
  help: HELP,
  run,
};

registerCommand(command);
