/**
 * Golden corpus — pins the CLI's current text output surface (spec §5.1)
 * before the TypeScript CLI port. These goldens are the drift detector: a
 * mismatch here means the port changed observable output, not that the
 * harness is broken (fix the harness only when capture/runner normalization
 * disagrees — never hand-edit a golden to make a case pass).
 *
 * Regenerate with `node tests/cli/golden-capture.mjs` after a deliberate,
 * reviewed output change.
 */
import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { readFileSync } from 'node:fs';
import { GOLDEN_CASES } from './golden-cases.mjs';
import { peerPresent } from '../helpers/peers.js';

const here = dirname(fileURLToPath(import.meta.url));
const cli = resolve(here, '../../bin/upt.mjs');
const goldenDir = resolve(here, 'golden');

function normalize(text: string): string {
  return text.replace(/\r\n/g, '\n');
}

function run(args: string[]): { status: number; stdout: string; stderr: string } {
  // spawnSync (unlike execFileSync) exposes stderr on the result object even
  // when the process exits 0.
  const result = spawnSync('node', [cli, ...args], {
    encoding: 'utf8',
    maxBuffer: 50 * 1024 * 1024,
  });
  return {
    status: result.status ?? 1,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  };
}

// Golden files are committed LF-only, but this repo has core.autocrlf=true
// and no .gitattributes override — a fresh Windows checkout would convert
// them back to CRLF on disk. Normalize on read too, so the comparison is
// robust to the checkout's line-ending state, not just the capture's.
function readGolden(name: string): string {
  return normalize(readFileSync(join(goldenDir, `${name}.txt`), 'utf8'));
}

function readStderrGolden(name: string): string {
  return normalize(readFileSync(join(goldenDir, `${name}.stderr.txt`), 'utf8'));
}

const ungated = GOLDEN_CASES.filter((c) => !c.peerGated);
const gated = GOLDEN_CASES.filter((c) => c.peerGated);

describe('upt CLI — golden corpus (pre-port pin)', () => {
  it.each(ungated)('$name', ({ name, args, pinStderr }) => {
    const result = run(args);
    expect(result.status).toBe(0);
    expect(normalize(result.stdout)).toBe(readGolden(name));
    if (pinStderr) {
      expect(normalize(result.stderr)).toBe(readStderrGolden(name));
    }
  });
});

describe.skipIf(!peerPresent)('upt CLI — golden corpus (peer-gated)', () => {
  it.each(gated)('$name', ({ name, args, pinStderr }) => {
    const result = run(args);
    expect(result.status).toBe(0);
    expect(normalize(result.stdout)).toBe(readGolden(name));
    if (pinStderr) {
      expect(normalize(result.stderr)).toBe(readStderrGolden(name));
    }
  });
});
