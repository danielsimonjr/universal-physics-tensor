/**
 * The formalRef axiom gate.
 *
 * A `formalRef` records the axioms that its Lean proof depends on. This gate measures them again
 * with `#print axioms`, from the probes in `formal/physlib/`, run inside a Physlib checkout at the
 * pinned commit. It fails when:
 *
 * - the positive control (`HoleProbe.lean`, a deliberate `sorry`) does not report `sorryAx`, because
 *   then a clean result cannot be told apart from a probe that never detects a hole;
 * - a probed theorem is missing from the output, or depends on `sorryAx`;
 * - a `lean4-physlib` formalRef names a theorem that the probe does not print, or records axioms
 *   that differ from the measured ones;
 * - the checkout is not at the commit and toolchain that each `formalRef.version` records;
 * - there is nothing to check (no probed theorem, no reference, or a `#print axioms` line that the
 *   gate cannot parse), so that the gate cannot pass by checking nothing.
 *
 * Lean exits 0 for a proof that uses `sorry` (it only warns), so the gate reads the printed axioms
 * and never the exit code.
 *
 * Limit of the control: `HoleProbe.lean` puts its `sorry` in the probe file itself. It shows that the
 * gate detects a hole in the file that it runs; it does not show a hole inside an imported, prebuilt
 * module, which is where every probed theorem lives.
 *
 * Run (needs Lean and a built Physlib checkout; see `formal/physlib/README.md`):
 *   bun tools/formalref-axiom-gate/gate.ts --physlib <dir> [--probes <dir>] [--lake <exe>] [--write-captured]
 */

import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/** A recorded formal reference, reduced to what the gate compares. */
export interface ProbedReference {
  /** The Lean theorem name. */
  readonly statement: string;
  readonly axioms: readonly string[];
  /** `formalRef.version`, for example `physlib@<sha> lean4:v4.34.0`. */
  readonly version: string;
}

/** The gate's verdict. `ok` is true only when `problems` is empty. */
export interface GateVerdict {
  readonly ok: boolean;
  readonly problems: readonly string[];
}

const HOLE_THEOREM = 'holeProbe';

/**
 * Parse `#print axioms` output into theorem name → axioms. Lean wraps a long list across lines,
 * and prints "does not depend on any axioms" for an axiom-free proof.
 */
export function parseAxiomReport(text: string): Map<string, string[]> {
  const report = new Map<string, string[]>();
  // Anchored at the line start, and lazy up to the fixed suffix, so a name that contains `'`
  // (common in Mathlib, for example `foo'`) is read whole.
  for (const m of text.matchAll(/^'(.+?)' depends on axioms: \[([^\]]*)\]/gm)) {
    report.set(
      m[1]!,
      m[2]!
        .split(',')
        .map((a) => a.trim())
        .filter((a) => a.length > 0),
    );
  }
  for (const m of text.matchAll(/^'(.+?)' does not depend on any axioms/gm)) report.set(m[1]!, []);
  return report;
}

/** The theorem names that a probe source prints with `#print axioms`, in order. */
export function probedTheorems(leanSource: string): string[] {
  return [...leanSource.matchAll(/^\s*#print axioms\s+(\S+)\s*(?:--.*)?$/gm)].map((m) => m[1]!);
}

/**
 * Check that the Physlib checkout is at the commit and toolchain that every reference records.
 * `toolchain` is the content of the checkout's `lean-toolchain` file.
 */
export function checkPin(input: {
  readonly references: readonly ProbedReference[];
  readonly headSha: string;
  readonly toolchain: string;
}): string[] {
  const tag = input.toolchain.trim().split('/').pop() ?? '';
  const problems: string[] = [];
  for (const ref of input.references) {
    if (!ref.version.includes(`physlib@${input.headSha.trim()}`)) {
      problems.push(`checkout is at ${input.headSha.trim()}, but formalRef '${ref.statement}' records '${ref.version}'`);
    }
    if (!tag || !ref.version.includes(tag)) {
      problems.push(`checkout toolchain is '${input.toolchain.trim()}', but formalRef '${ref.statement}' records '${ref.version}'`);
    }
  }
  return problems;
}

/**
 * Every `lean4-physlib` formalRef in the given families. The statement text starts with the
 * theorem name, followed by a colon and a description.
 */
export function lean4PhyslibReferences(
  families: readonly {
    readonly bridges: readonly {
      readonly formalRef?: { system: string; statement: string; axioms: readonly string[]; version: string };
    }[];
  }[],
): ProbedReference[] {
  const refs: ProbedReference[] = [];
  for (const family of families) {
    for (const bridge of family.bridges) {
      const ref = bridge.formalRef;
      if (ref?.system !== 'lean4-physlib') continue;
      refs.push({ statement: ref.statement.split(':')[0]!.trim(), axioms: ref.axioms, version: ref.version });
    }
  }
  return refs;
}

/** Judge the probe outputs against the probe source and the recorded references. */
export function judgeAxiomGate(input: {
  readonly probeSource: string;
  readonly probeOutput: string;
  readonly holeOutput: string;
  readonly references: readonly ProbedReference[];
}): GateVerdict {
  const problems: string[] = [];

  const hole = parseAxiomReport(input.holeOutput).get(HOLE_THEOREM);
  if (!hole?.includes('sorryAx')) {
    problems.push(
      `positive control failed: '${HOLE_THEOREM}' did not report sorryAx, so this probe cannot detect a hole`,
    );
  }

  const theorems = probedTheorems(input.probeSource);
  const printLines = input.probeSource.split(/\r?\n/).filter((l) => l.includes('#print axioms')).length;
  if (theorems.length === 0) problems.push('the probe source prints no theorem, so there is nothing to check');
  if (printLines !== theorems.length) {
    problems.push(`the probe source has ${printLines} '#print axioms' lines but ${theorems.length} parse as theorems`);
  }
  if (input.references.length === 0) problems.push('no lean4-physlib formalRef to check');
  const report = parseAxiomReport(input.probeOutput);
  for (const name of theorems) {
    const axioms = report.get(name);
    if (!axioms) problems.push(`'${name}' is probed but not reported in the output`);
    else if (axioms.includes('sorryAx')) problems.push(`'${name}' depends on sorryAx`);
  }

  for (const ref of input.references) {
    if (!/^[^\s:()]+$/.test(ref.statement)) {
      problems.push(`formalRef statement must start with a Lean theorem name, then ':'; got '${ref.statement}'`);
      continue;
    }
    if (!theorems.includes(ref.statement)) {
      problems.push(`formalRef '${ref.statement}' is not probed by the probe source`);
      continue;
    }
    const measured = report.get(ref.statement);
    if (!measured) continue;
    const same =
      measured.length === ref.axioms.length && [...measured].sort().join() === [...ref.axioms].sort().join();
    if (!same) {
      problems.push(
        `formalRef '${ref.statement}' records axioms [${ref.axioms.join(', ')}] but measures [${measured.join(', ')}]`,
      );
    }
  }
  return { ok: problems.length === 0, problems };
}

function argValue(args: readonly string[], flag: string): string | undefined {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : undefined;
}

/** Copy one probe into the checkout and run it with `lake env lean`. */
function runProbe(lake: string, physlibDir: string, probePath: string): string {
  const name = probePath.split(/[\\/]/).pop()!;
  copyFileSync(probePath, join(physlibDir, name));
  const run = spawnSync(lake, ['env', 'lean', name], {
    cwd: physlibDir,
    encoding: 'utf-8',
    maxBuffer: 64 * 1024 * 1024,
  });
  if (run.error) throw run.error;
  return `${run.stdout ?? ''}${run.stderr ?? ''}`;
}

async function main(args: readonly string[]): Promise<number> {
  const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
  const physlibDir = argValue(args, '--physlib');
  if (!physlibDir) {
    console.error('usage: gate.ts --physlib <dir> [--probes <dir>] [--lake <exe>] [--write-captured]');
    return 2;
  }
  const probesDir = resolve(argValue(args, '--probes') ?? join(repoRoot, 'formal', 'physlib'));
  const lake = argValue(args, '--lake') ?? 'lake';

  const { ATLAS_FAMILIES } = await import('../../src/atlas/families.js');
  const references = lean4PhyslibReferences(ATLAS_FAMILIES);
  // The pin is checked first: a Lean run takes minutes, and its result means nothing for a commit
  // that no record names.
  const head = spawnSync('git', ['-C', physlibDir, 'rev-parse', 'HEAD'], { encoding: 'utf-8' });
  const pinProblems = checkPin({
    references,
    headSha: head.status === 0 ? head.stdout : '(not a git checkout)',
    toolchain: readFileSync(join(physlibDir, 'lean-toolchain'), 'utf-8'),
  });
  if (pinProblems.length > 0) {
    for (const p of pinProblems) console.error(`FAIL: ${p}`);
    console.log(`formalRef axiom gate: FAIL (${pinProblems.length})`);
    return 1;
  }

  const probePath = join(probesDir, 'AxiomProbe.lean');
  const probeOutput = runProbe(lake, physlibDir, probePath);
  const holeOutput = runProbe(lake, physlibDir, join(probesDir, 'HoleProbe.lean'));

  if (args.includes('--write-captured')) {
    mkdirSync(join(probesDir, 'captured'), { recursive: true });
    writeFileSync(join(probesDir, 'captured', 'AxiomProbe.out'), probeOutput);
    writeFileSync(join(probesDir, 'captured', 'HoleProbe.out'), holeOutput);
  }

  const verdict = judgeAxiomGate({
    probeSource: readFileSync(probePath, 'utf-8'),
    probeOutput,
    holeOutput,
    references,
  });
  for (const p of verdict.problems) console.error(`FAIL: ${p}`);
  console.log(verdict.ok ? 'formalRef axiom gate: PASS' : `formalRef axiom gate: FAIL (${verdict.problems.length})`);
  return verdict.ok ? 0 : 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = await main(process.argv.slice(2));
}
