/**
 * Emit the atlas witness-results artifact (Phase 4 S4.3).
 *
 * Lead-run, like `emit-atlas-json.mjs`. It runs every witness in
 * `src/atlas/witness-specs.ts` through the real runners and writes
 * `data/atlas/witness-results.json`. `tests/atlas/witness-results.test.ts`
 * deep-equals the committed file against a fresh run, so a registry or runner
 * change fails CI until this is re-run. **No test ever writes the artifact.**
 *
 * It REFUSES to write when the optional CAS peer is absent: an artifact
 * emitted without the peer would record every symbolic witness as
 * `unresolved/peer-absent` and silently strip `symbolically-checked` from
 * every record that earned it.
 *
 * Run via `npm run atlas:witness-results` (builds dist/ first).
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..');

// `import()` of an absolute path fails on Windows (ERR_UNSUPPORTED_ESM_URL_SCHEME);
// the path must be a `file://` URL.
const distImport = (...parts) =>
  import(pathToFileURL(resolve(repoRoot, 'dist', ...parts)).href);

const { runWitnessRegistry } = await distImport('atlas', 'witness-artifact.js');
const { isSimplifierAvailable } = await distImport('composition', 'expr-simplify.js');

if (!(await isSimplifierAvailable())) {
  console.error(
    'emit-witness-results: the optional CAS peer (@danielsimonjr/mathts-functions) is ' +
      'absent. Refusing to write an artifact that would record every symbolic witness ' +
      'as peer-absent. Install the peer and re-run.',
  );
  process.exit(1);
}

const artifact = await runWitnessRegistry();

const outDir = resolve(repoRoot, 'data', 'atlas');
mkdirSync(outDir, { recursive: true });
const out = resolve(outDir, 'witness-results.json');
writeFileSync(out, JSON.stringify(artifact, null, 2) + '\n');
const counts = {};
for (const r of artifact.results) counts[r.status] = (counts[r.status] ?? 0) + 1;
console.log(`Wrote ${out} (${artifact.results.length} results: ${JSON.stringify(counts)})`);
