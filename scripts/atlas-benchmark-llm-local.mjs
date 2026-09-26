/**
 * Run the LOCAL LLM baselines for benchmark criterion 2 (pre-registration Amendment 4).
 *
 * Everything the run may vary is frozen in
 * `tests/fixtures/atlas/benchmark/conditions/llm-local.config.json`, committed before
 * the first call. This script reads that file and changes nothing in it.
 *
 * - Input is the PUBLIC half only (premises, conclusion, claimedRelation), one item
 *   per call. The public file carries no answer, so no model can read the key.
 * - Before any call, each model's digest is checked against the config. A mismatch
 *   stops the run: a different model is a different condition.
 * - A malformed reply is an ERROR, recorded and scored as unanswered. It is never
 *   defaulted. A transport error or timeout is retried once, and the retry is recorded.
 * - The run is resumable and flushes after every item, so a kill loses at most one.
 *
 * Output: `tests/fixtures/atlas/benchmark/conditions/llm-local/<model>.json`, a map
 * from item id to { outcome, failureKind, error, reply, ms, attempts }.
 *
 * Run via `bun run build && node scripts/atlas-benchmark-llm-local.mjs [model ...]`.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..');
const BENCH = resolve(repoRoot, 'tests', 'fixtures', 'atlas', 'benchmark');
const OUT = resolve(BENCH, 'conditions', 'llm-local');
const distImport = (...parts) => import(pathToFileURL(resolve(repoRoot, 'dist', ...parts)).href);

const { loadFrozenItems } = await distImport('atlas', 'benchmark', 'loader.js');
const { parseBackendResponse } = await distImport('atlas', 'benchmark', 'backend-shapes.js');
const { FAILURE_KINDS } = await distImport('atlas', 'benchmark', 'types.js');

const config = JSON.parse(readFileSync(resolve(BENCH, 'conditions', 'llm-local.config.json'), 'utf-8'));
const KNOWN = new Set(FAILURE_KINDS);
const safe = (name) => name.replace(/[^A-Za-z0-9._-]/g, '_');

/** The model's digest as Ollama reports it, or null when the model is not installed. */
async function installedDigest(name) {
  const tags = await (await fetch(new URL('/api/tags', config.endpoint))).json();
  const m = tags.models.find((x) => x.name === name);
  return m === undefined ? null : m.digest;
}

async function callOnce(model, request) {
  const body = {
    model,
    stream: false,
    format: config.format,
    options: config.options,
    messages: [
      { role: 'system', content: config.systemPrompt },
      {
        role: 'user',
        content:
          config.userPrompt +
          JSON.stringify({
            itemId: request.itemId,
            premises: request.premises,
            conclusion: request.conclusion,
            claimedRelation: request.claimedRelation,
          }),
      },
    ],
  };
  const res = await fetch(config.endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(config.timeoutMs),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.message?.content ?? '';
}

/** Judge one item. Transport failures retry once; a malformed reply never does. */
async function judge(model, item) {
  const request = {
    itemId: item.id,
    task: 'classify',
    premises: item.premises,
    conclusion: item.conclusion,
    claimedRelation: item.claimedRelation,
    budgetMs: config.timeoutMs,
  };
  const attempts = [];
  const started = Date.now();
  for (let attempt = 1; attempt <= 2; attempt++) {
    let reply;
    try {
      reply = await callOnce(model, request);
    } catch (e) {
      attempts.push(`transport: ${String(e.message ?? e)}`);
      continue;
    }
    let value;
    try {
      value = JSON.parse(reply);
    } catch {
      return { outcome: null, failureKind: null, error: 'reply is not JSON', reply, ms: Date.now() - started, attempts };
    }
    const parsed = parseBackendResponse(request, value);
    if ('error' in parsed) {
      return { outcome: null, failureKind: null, error: parsed.error, reply, ms: Date.now() - started, attempts };
    }
    const fk = value.failureKind ?? null;
    if (fk !== null && !KNOWN.has(fk)) {
      return { outcome: null, failureKind: null, error: `unknown failureKind '${fk}'`, reply, ms: Date.now() - started, attempts };
    }
    return { outcome: parsed.outcome, failureKind: fk, error: null, reply, ms: Date.now() - started, attempts };
  }
  return { outcome: null, failureKind: null, error: 'transport failed twice', reply: null, ms: Date.now() - started, attempts };
}

const wanted = process.argv.slice(2);
const models = config.models.filter((m) => wanted.length === 0 || wanted.includes(m.name));
const items = loadFrozenItems(BENCH);
mkdirSync(OUT, { recursive: true });

for (const m of models) {
  let digest;
  try {
    digest = await installedDigest(m.name);
  } catch (e) {
    console.error(`${m.name}: cannot reach Ollama to check the digest (${String(e.message ?? e)}); not run`);
    process.exitCode = 1;
    continue;
  }
  if (digest === null || !digest.startsWith(m.digest)) {
    console.error(`${m.name}: installed digest ${digest} does not match the frozen ${m.digest}; not run`);
    process.exitCode = 1;
    continue;
  }
  const file = resolve(OUT, `${safe(m.name)}.json`);
  const results = existsSync(file) ? JSON.parse(readFileSync(file, 'utf-8')) : {};
  const t0 = Date.now();
  // Resume skips a finished item. A TRANSPORT failure is not a finished item: the model
  // never answered, so it is asked again. A malformed reply IS finished (temperature 0
  // would reproduce it), and it stays recorded as an error.
  const finished = (r) => r !== undefined && r.error !== 'transport failed twice';
  let done = items.filter((it) => finished(results[it.id])).length;
  for (const item of items) {
    if (finished(results[item.id])) continue;
    results[item.id] = await judge(m.name, item);
    writeFileSync(file, `${JSON.stringify(results, null, 1)}\n`);
    done++;
    const r = results[item.id];
    console.log(`${m.name} ${done}/${items.length} ${item.id} ${r.outcome ?? 'ERROR'} ${r.ms}ms${r.error ? ` (${r.error})` : ''}`);
  }
  const errors = items.filter((it) => results[it.id]?.error).length;
  console.log(`${m.name}: finished, ${Math.round((Date.now() - t0) / 1000)} s this session, ${errors} error(s)`);
  if (errors > 0) process.exitCode = 1;
}
