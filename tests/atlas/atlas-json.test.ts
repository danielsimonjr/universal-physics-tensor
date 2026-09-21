/**
 * Atlas Phase 0 S0.6 — committed JSON artifact ↔ live family drift guard.
 *
 * `data/atlas/oscillators.json` is the reviewable surface. This test fails
 * whenever an atlas record changes without re-running `npm run atlas:json` —
 * the same discipline `tests/bridges/catalog-json.test.ts` applies to the
 * bridge catalog.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { toAtlasJson } from '../../src/atlas/serialize.js';
import { OSCILLATOR_FAMILY } from '../../src/atlas/oscillators/index.js';

const here = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(
  readFileSync(resolve(here, '../../package.json'), 'utf-8'),
) as { version: string };
const artifact = JSON.parse(
  readFileSync(resolve(here, '../../data/atlas/oscillators.json'), 'utf-8'),
) as {
  schemaVersion: string;
  packageVersion: string;
  family: string;
  models: Array<Record<string, unknown>>;
  bridges: Array<Record<string, unknown>>;
  rejections: Array<Record<string, unknown>>;
};

const live = JSON.parse(
  JSON.stringify(toAtlasJson(OSCILLATOR_FAMILY, pkg.version)),
) as typeof artifact;

describe('data/atlas/oscillators.json — committed artifact integrity', () => {
  it('carries schemaVersion "0", the package version and the family name', () => {
    expect(artifact.schemaVersion).toBe('0');
    expect(artifact.packageVersion).toBe(pkg.version);
    expect(artifact.family).toBe('oscillators');
  });

  it('model, bridge and rejection ids match the live family exactly, in order', () => {
    expect(artifact.models.map((m) => m['id'])).toEqual(live.models.map((m) => m['id']));
    expect(artifact.bridges.map((b) => b['id'])).toEqual(
      live.bridges.map((b) => b['id']),
    );
    expect(artifact.rejections.map((r) => r['id'])).toEqual(
      live.rejections.map((r) => r['id']),
    );
  });

  it('FRESHNESS: the committed artifact deep-equals the live projection (re-run npm run atlas:json)', () => {
    expect(artifact).toEqual(live);
  });
});
