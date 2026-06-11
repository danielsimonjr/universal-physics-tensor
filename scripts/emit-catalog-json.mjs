/**
 * Emit the bridge catalog as a versioned JSON artifact (v0.8.0 P-2).
 *
 * The JSON file is the physicist-facing review surface: domain experts
 * can read and PR `data/bridge-catalog.json` without touching
 * TypeScript. `tests/bridges/catalog-json.test.ts` pins the committed
 * artifact against the live catalog, so catalog edits fail CI until
 * `npm run catalog:json` is re-run — the same drift discipline the
 * spec↔index guard uses.
 *
 * Run via `npm run catalog:json` (builds dist/ first; this script
 * imports the COMPILED catalog by relative path — the package
 * `exports` field constrains bare-specifier imports only).
 */
import { writeFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..');

const { BRIDGE_EQUATIONS } = await import(
  resolve(repoRoot, 'dist', 'bridges', 'index.js')
);
const pkg = JSON.parse(
  readFileSync(resolve(repoRoot, 'package.json'), 'utf-8'),
);

const artifact = {
  $schema: './bridge-catalog.schema.json',
  schemaVersion: 1,
  packageVersion: pkg.version,
  count: BRIDGE_EQUATIONS.length,
  entries: BRIDGE_EQUATIONS,
};

const out = resolve(repoRoot, 'data', 'bridge-catalog.json');
writeFileSync(out, JSON.stringify(artifact, null, 2) + '\n');
console.log(
  `Wrote ${out} (${BRIDGE_EQUATIONS.length} entries, package v${pkg.version})`,
);
