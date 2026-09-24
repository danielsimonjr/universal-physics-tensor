/**
 * The formalRef axiom gate (`tools/formalref-axiom-gate/`). A `formalRef` records the axioms a Lean
 * proof rests on. The gate re-measures them with `#print axioms` and fails when a probed proof
 * depends on `sorryAx`, when a recorded axiom list drifts from the measurement, or when the
 * positive control (`HoleProbe.lean`, a deliberate `sorry`) does NOT report `sorryAx`. Without that
 * control a clean result cannot be told apart from a probe that never detects a hole.
 *
 * These tests run the gate's judgement on the output captured from Lean at the pinned Physlib
 * commit (`formal/physlib/captured/`), so CI checks the logic without a Lean toolchain.
 */

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  checkPin,
  judgeAxiomGate,
  lean4PhyslibReferences,
  parseAxiomReport,
  probedTheorems,
} from '../../tools/formalref-axiom-gate/gate.js';
import { ATLAS_FAMILIES } from '../../src/atlas/families.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const read = (p: string) => readFileSync(resolve(root, p), 'utf-8');

const probeSource = read('formal/physlib/AxiomProbe.lean');
const probeOutput = read('formal/physlib/captured/AxiomProbe.out');
const holeOutput = read('formal/physlib/captured/HoleProbe.out');
const references = lean4PhyslibReferences(ATLAS_FAMILIES);

describe('formalRef axiom gate — parsing', () => {
  it('reads every probed theorem, including axiom lists Lean wraps across lines', () => {
    const report = parseAxiomReport(probeOutput);
    expect([...report.keys()].sort()).toEqual([...probedTheorems(probeSource)].sort());
    expect(report.get('ClassicalMechanics.SimplePendulum.linearizedEquationOfMotion_iff')).toEqual([
      'propext',
      'Classical.choice',
      'Quot.sound',
    ]);
  });

  it('reads the positive control as depending on sorryAx', () => {
    expect(parseAxiomReport(holeOutput).get('holeProbe')).toEqual(['sorryAx']);
  });

  it("reads names that contain an apostrophe whole", () => {
    const report = parseAxiomReport(
      "'Foo.bar'' depends on axioms: [propext]\n'Foo.b'_x' does not depend on any axioms\n",
    );
    expect(report.get("Foo.bar'")).toEqual(['propext']);
    expect(report.get("Foo.b'_x")).toEqual([]);
  });

  it('reads CRLF output the same as LF output', () => {
    const crlf = parseAxiomReport(probeOutput.replace(/\n/g, '\r\n'));
    expect(crlf).toEqual(parseAxiomReport(probeOutput));
  });

  it('reads a #print axioms line with indentation or a trailing comment', () => {
    expect(probedTheorems('  #print axioms Foo.bar -- a note\n')).toEqual(['Foo.bar']);
  });

  it('finds the six theorems the probe prints', () => {
    expect(probedTheorems(probeSource)).toHaveLength(6);
  });

  it('collects every lean4-physlib formalRef in the atlas', () => {
    expect(references.map((r) => r.statement)).toContain(
      'ClassicalMechanics.SimplePendulum.linearizedEquationOfMotion_iff',
    );
  });
});

describe('formalRef axiom gate — judgement', () => {
  it('passes on the output captured at the pinned commit', () => {
    expect(judgeAxiomGate({ probeSource, probeOutput, holeOutput, references })).toEqual({
      ok: true,
      problems: [],
    });
  });

  it('fails when a probed theorem depends on sorryAx', () => {
    const holed = probeOutput.replace(
      "'ClassicalMechanics.SimplePendulum.toHarmonicOscillator_ω' depends on axioms: [propext,",
      "'ClassicalMechanics.SimplePendulum.toHarmonicOscillator_ω' depends on axioms: [sorryAx, propext,",
    );
    expect(holed).not.toBe(probeOutput);
    const verdict = judgeAxiomGate({ probeSource, probeOutput: holed, holeOutput, references });
    expect(verdict.ok).toBe(false);
    expect(verdict.problems.join('\n')).toMatch(/toHarmonicOscillator_ω.*sorryAx/);
  });

  it('fails when the positive control does not report sorryAx', () => {
    const blind = "'holeProbe' depends on axioms: [propext]\n";
    const verdict = judgeAxiomGate({ probeSource, probeOutput, holeOutput: blind, references });
    expect(verdict.ok).toBe(false);
    expect(verdict.problems.join('\n')).toMatch(/positive control/);
  });

  it('fails when a probed theorem is missing from the output', () => {
    const truncated = probeOutput.split("'ClassicalMechanics.planeWave_waveEquation'")[0]!;
    const verdict = judgeAxiomGate({ probeSource, probeOutput: truncated, holeOutput, references });
    expect(verdict.ok).toBe(false);
    expect(verdict.problems.join('\n')).toMatch(/planeWave_waveEquation.*not reported/);
  });

  it('fails when a recorded axiom list drifts from the measurement', () => {
    const drifted = references.map((r) => ({ ...r, axioms: ['propext'] }));
    const verdict = judgeAxiomGate({ probeSource, probeOutput, holeOutput, references: drifted });
    expect(verdict.ok).toBe(false);
    expect(verdict.problems.join('\n')).toMatch(/records axioms/);
  });

  it('fails when a formalRef names a theorem the probe does not print', () => {
    const unprobed = [{ statement: 'ClassicalMechanics.NotProbed', axioms: [] as string[], version: '' }];
    const verdict = judgeAxiomGate({ probeSource, probeOutput, holeOutput, references: unprobed });
    expect(verdict.ok).toBe(false);
    expect(verdict.problems.join('\n')).toMatch(/NotProbed.*not probed/);
  });

  it('fails when a formalRef statement does not start with a Lean name', () => {
    const wordy = [{ statement: 'theorem Foo.bar', axioms: [] as string[], version: '' }];
    const verdict = judgeAxiomGate({ probeSource, probeOutput, holeOutput, references: wordy });
    expect(verdict.ok).toBe(false);
    expect(verdict.problems.join('\n')).toMatch(/must start with a Lean theorem name/);
  });

  it('cannot pass by checking nothing: no probed theorem, no reference', () => {
    const empty = judgeAxiomGate({ probeSource: '', probeOutput: '', holeOutput, references: [] });
    expect(empty.ok).toBe(false);
    expect(empty.problems.join('\n')).toMatch(/prints no theorem/);
    expect(empty.problems.join('\n')).toMatch(/no lean4-physlib formalRef/);
  });

  it('fails when a #print axioms line does not parse as a theorem', () => {
    const odd = `${probeSource}\n#print axioms\n`;
    const verdict = judgeAxiomGate({ probeSource: odd, probeOutput, holeOutput, references });
    expect(verdict.ok).toBe(false);
    expect(verdict.problems.join('\n')).toMatch(/'#print axioms' lines but/);
  });
});

describe('formalRef axiom gate — the pin', () => {
  const pin = { headSha: '5ad56e24de155462acd8478458292347393d5908\n', toolchain: 'leanprover/lean4:v4.34.0\n' };

  it('passes when the checkout is at the recorded commit and toolchain', () => {
    expect(checkPin({ references, ...pin })).toEqual([]);
  });

  it('fails when the checkout is at another commit', () => {
    const moved = checkPin({ references, ...pin, headSha: '0000000000000000000000000000000000000000' });
    expect(moved.join('\n')).toMatch(/checkout is at 0000/);
  });

  it('fails when the checkout uses another toolchain', () => {
    const newer = checkPin({ references, ...pin, toolchain: 'leanprover/lean4:v4.35.0' });
    expect(newer.join('\n')).toMatch(/toolchain is 'leanprover\/lean4:v4.35.0'/);
  });
});
