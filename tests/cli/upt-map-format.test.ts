/**
 * `upt map --format=…` — the physics-map visualization CLI surface.
 *
 * Executes the built CLI, so it is guarded on `dist/` existing (CI typechecks
 * with `tsc --noEmit` and may not have emitted dist — same skip pattern as the
 * public-surface post-build check). The rendering logic itself is covered by
 * `tests/composition/graph-viz.test.ts`; these tests pin the CLI wiring.
 *
 * @module tests/cli/upt-map-format
 */
import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { tmpdir } from 'node:os';

const here = dirname(fileURLToPath(import.meta.url));
const cli = resolve(here, '../../bin/upt.mjs');
const distIndex = resolve(here, '../../dist/index.js');
const run = (args: string[]): string =>
  execFileSync('node', [cli, ...args], { encoding: 'utf8', stdio: 'pipe' });

let peerAvailable = true;
try {
  await import('@viz-js/viz');
} catch {
  peerAvailable = false;
}

describe.skipIf(!existsSync(distIndex))('upt map --format', () => {
  it('default (no --format) still prints the text linkage map', () => {
    const out = run(['map']);
    expect(out).toContain('Linkage map');
  });

  it('--format=mermaid emits a flowchart with classDefs', () => {
    const out = run(['map', '--format=mermaid']);
    expect(out).toMatch(/^flowchart /m);
    expect(out).toMatch(/classDef/);
  });

  it('--format=dot emits a digraph with subgraph clusters', () => {
    const out = run(['map', '--format=dot']);
    expect(out).toMatch(/^digraph /m);
    expect(out).toContain('subgraph cluster_');
  });

  it('honors --source=canonical', () => {
    const out = run(['map', '--source=canonical', '--format=mermaid']);
    expect(out).toMatch(/^flowchart /m);
  });

  it('--proposed overlays unadjudicated junctions (dashed) at --source=both', () => {
    const plain = run(['map', '--source=both', '--format=dot']);
    const withProposed = run(['map', '--source=both', '--proposed', '--format=dot']);
    expect(withProposed).toMatch(/^digraph /m);
    // proposed junctions are rendered dashed and carry IC- ids
    expect(withProposed).toContain('dashed');
    expect(withProposed.length).toBeGreaterThan(plain.length);
  });

  it('unknown --format exits non-zero', () => {
    expect(() => run(['map', '--format=bogus'])).toThrow();
  });

  it('empty --out= exits non-zero', () => {
    expect(() => run(['map', '--format=mermaid', '--out='])).toThrow();
  });

  describe.skipIf(!peerAvailable)('--format=svg (optional @viz-js/viz peer)', () => {
    it('streams an SVG document to stdout', () => {
      const out = run(['map', '--format=svg']);
      expect(out).toContain('<svg');
      expect(out).toContain('</svg>');
    });

    it('--out writes an SVG file', () => {
      const path = join(tmpdir(), `upt-map-test-${process.pid}.svg`);
      try {
        run(['map', '--source=canonical', '--format=svg', `--out=${path}`]);
        const svg = readFileSync(path, 'utf8');
        expect(svg).toContain('<svg');
        expect(svg).toContain('</svg>');
      } finally {
        rmSync(path, { force: true });
      }
    });
  });
});
