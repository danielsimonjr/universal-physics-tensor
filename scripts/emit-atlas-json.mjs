/**
 * Emit the oscillator atlas family as a versioned JSON artifact (Phase 0 S0.6).
 *
 * Same discipline as `emit-catalog-json.mjs`: the committed artifact is the
 * reviewable surface, and `tests/atlas/atlas-json.test.ts` pins it against the
 * live family, so an atlas edit fails CI until `npm run atlas:json` is re-run.
 *
 * Run via `npm run atlas:json` (builds dist/ first; this script imports the
 * COMPILED family by relative path — the package `exports` field constrains
 * bare-specifier imports only).
 */
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..');

// `import()` of an absolute path fails on Windows (ERR_UNSUPPORTED_ESM_URL_SCHEME);
// the path must be a `file://` URL.
const distImport = (...parts) =>
  import(pathToFileURL(resolve(repoRoot, 'dist', ...parts)).href);

const { OSCILLATOR_FAMILY } = await distImport('atlas', 'oscillators', 'index.js');
const { toAtlasJson } = await distImport('atlas', 'serialize.js');
const pkg = JSON.parse(readFileSync(resolve(repoRoot, 'package.json'), 'utf-8'));

const record = toAtlasJson(OSCILLATOR_FAMILY, pkg.version);

const outDir = resolve(repoRoot, 'data', 'atlas');
mkdirSync(outDir, { recursive: true });
const out = resolve(outDir, 'oscillators.json');
writeFileSync(out, JSON.stringify(record, null, 2) + '\n');
console.log(
  `Wrote ${out} (${record.models.length} models, ${record.bridges.length} bridges, ` +
    `${record.rejections.length} rejections, schema v${record.schemaVersion}, package v${pkg.version})`,
);
