/**
 * Assemble the model-built benchmark: kappa between the two MODEL raters, the
 * freeze rule, and the three fixture files.
 *
 * Inputs (written by `scripts/atlas-benchmark-models.mjs`, never by hand):
 * `provenance/authored.json`, `encoded.json`, `rater-A.json`, `rater-B.json`.
 *
 * **Freeze rule.** An item is frozen when rater A, rater B and the author all
 * give the same valid/invalid verdict, and its encoding is well formed.
 * Every other item goes to `contested/` with its reason. Kappa is computed over
 * ALL authored items, BEFORE the freeze, as the pre-registration requires.
 *
 * Kappa here is agreement between two instances of ONE model
 * (`claude-fable-5-1`), each run with no shared context. It is not human
 * inter-rater reliability, and nothing written here says it is.
 *
 * Run via `bun run build && node scripts/atlas-benchmark-assemble.mjs`.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..');
const BENCH = resolve(repoRoot, 'tests', 'fixtures', 'atlas', 'benchmark');
const PROV = resolve(BENCH, 'provenance');
const distImport = (...parts) => import(pathToFileURL(resolve(repoRoot, 'dist', ...parts)).href);

const { cohensKappa } = await distImport('atlas', 'benchmark', 'stats.js');
const { validateItems } = await distImport('atlas', 'benchmark', 'loader.js');
const { findCrossSplitLeakage } = await distImport('atlas', 'benchmark', 'leakage.js');
const { hashCanonical } = await distImport('composition', 'probe', 'serialize.js');
const { FAILURE_KINDS, HELD_OUT_FAMILY } = await distImport('atlas', 'benchmark', 'types.js');

const read = (f) => JSON.parse(readFileSync(resolve(PROV, f), 'utf-8'));
const authored = read('authored.json');
const encoded = new Map(read('encoded.json').map((e) => [e.id, e]));
const raterA = new Map(read('rater-A.json').map((r) => [r.id, r]));
const raterB = new Map(read('rater-B.json').map((r) => [r.id, r]));
const MODEL = 'claude-fable-5-1';

const DIM_KEYS = ['L', 'M', 'T', 'I', 'Theta', 'N', 'J'];
const TRANSCENDENTAL = new Set(['exp', 'ln', 'log2', 'log10', 'sin', 'cos', 'tan', 'sinh', 'cosh', 'tanh']);

/** Why an encoded expression tree is malformed, or null when it is well formed. */
function exprProblem(node, path = 'expr') {
  if (node === null || typeof node !== 'object') return `${path}: not a node`;
  if (node.kind === 'symbol') {
    if (typeof node.name !== 'string' || node.name === '') return `${path}: symbol without a name`;
    if (node.dim === null || typeof node.dim !== 'object') return `${path}: symbol without a dim`;
    for (const k of DIM_KEYS) if (!Number.isFinite(node.dim[k])) return `${path}: dim.${k} missing`;
    return null;
  }
  if (node.kind === 'op') {
    if (!['*', '/', '+', '-', '^'].includes(node.op)) return `${path}: unknown op ${node.op}`;
    if (!Array.isArray(node.args) || node.args.length < 2) return `${path}: op needs two or more args`;
    if (node.op === '^' && node.args.length !== 2) return `${path}: ^ takes exactly two args`;
    for (let i = 0; i < node.args.length; i++) {
      const p = exprProblem(node.args[i], `${path}.args[${i}]`);
      if (p !== null) return p;
    }
    return null;
  }
  if (node.kind === 'transcendental') {
    if (!TRANSCENDENTAL.has(node.fn)) return `${path}: unknown fn ${node.fn}`;
    return exprProblem(node.arg, `${path}.arg`);
  }
  return `${path}: unsupported kind ${node.kind}`;
}

// ── Kappa, over ALL authored items, before any freeze ──────────────────────
const CATS9 = ['valid', ...FAILURE_KINDS];
const cat9 = (r) => (r.verdict === 'valid' ? 'valid' : r.failureKind);
const binary = [[0, 0], [0, 0]];
const nine = CATS9.map(() => CATS9.map(() => 0));
let offScaleKind = 0;
for (const it of authored) {
  const a = raterA.get(it.id);
  const b = raterB.get(it.id);
  if (a === undefined || b === undefined) throw new Error(`${it.id}: a rater did not answer`);
  binary[a.verdict === 'valid' ? 0 : 1][b.verdict === 'valid' ? 0 : 1]++;
  const ia = CATS9.indexOf(cat9(a));
  const ib = CATS9.indexOf(cat9(b));
  if (ia < 0 || ib < 0) offScaleKind++;
  else nine[ia][ib]++;
}
const agreeWithAuthor = (m) => authored.filter((it) => (m.get(it.id).verdict === 'valid') === (it.kind === 'valid')).length;

// ── Freeze ────────────────────────────────────────────────────────────────
const frozen = [];
const contested = [];
const labels = [];
for (const it of authored) {
  const enc = encoded.get(it.id);
  const a = raterA.get(it.id);
  const b = raterB.get(it.id);
  const reasons = [];
  if (a.verdict !== b.verdict) reasons.push('the two raters disagree');
  else if ((a.verdict === 'valid') !== (it.kind === 'valid')) reasons.push('both raters contradict the author');
  const problem = enc === undefined ? 'no encoding' : exprProblem(enc.expr);
  if (problem !== null) reasons.push(`encoding malformed: ${problem}`);

  const item = {
    id: it.id,
    kind: it.kind,
    ...(it.kind === 'invalid' ? { failureKind: it.failureKind } : {}),
    premises: it.premises,
    conclusion: it.conclusion,
    claimedRelation: it.claimedRelation,
    family: it.family,
    split: it.family === HELD_OUT_FAMILY ? 'held-out' : 'in-distribution',
    expr: enc?.expr ?? { kind: 'symbol', name: 'unencoded', dim: { L: 0, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 } },
    authorship: reasons.length === 0 ? 'independent' : 'contested-draft',
    source: `model-authored (${MODEL}, atlas-blind): ${it.source}`,
    ...(Array.isArray(enc?.sideConditions) ? { sideConditions: enc.sideConditions } : {}),
    ...(enc?.conventions !== undefined ? { conventions: enc.conventions } : {}),
    ...(Array.isArray(enc?.composedFrom) && enc.composedFrom.length === 2 ? { composedFrom: enc.composedFrom } : {}),
    ...(enc?.regime !== undefined ? { regime: enc.regime } : {}),
  };
  if (reasons.length === 0) {
    frozen.push(item);
    labels.push({ itemId: it.id, kind: it.kind, ...(it.kind === 'invalid' ? { failureKind: it.failureKind } : {}) });
  } else {
    contested.push({ ...item, contestedBecause: reasons });
  }
}

const frozenProblems = validateItems(frozen, true);
if (frozenProblems.length > 0) {
  throw new Error(`frozen set not admissible: ${frozenProblems.map((p) => `${p.id}: ${p.problem}`).join('; ')}`);
}
const leakage = findCrossSplitLeakage(frozen);

writeFileSync(resolve(BENCH, 'public', 'items.json'), `${JSON.stringify(frozen, null, 1)}\n`);
writeFileSync(resolve(BENCH, 'scorer', 'labels.json'), `${JSON.stringify(labels, null, 1)}\n`);
writeFileSync(
  resolve(BENCH, 'contested', 'items.json'),
  `${JSON.stringify(contested.map(({ contestedBecause: _c, ...rest }) => rest), null, 1)}\n`,
);

const count = (xs, f) => xs.filter(f).length;
const report = {
  model: MODEL,
  note: 'Authors, encoder and both raters are MODEL instances. Kappa is agreement between two isolated instances of one model, not human inter-rater reliability.',
  authored: authored.length,
  kappaBinary: cohensKappa(binary),
  binaryMatrix: binary,
  kappaNineCategory: cohensKappa(nine),
  nineCategoryOffScale: offScaleKind,
  raterAgreementWithAuthor: { A: agreeWithAuthor(raterA), B: agreeWithAuthor(raterB) },
  frozen: frozen.length,
  frozenValid: count(frozen, (x) => x.kind === 'valid'),
  frozenInvalid: count(frozen, (x) => x.kind === 'invalid'),
  frozenHeldOut: count(frozen, (x) => x.split === 'held-out'),
  frozenByFailureKind: Object.fromEntries(FAILURE_KINDS.map((k) => [k, count(frozen, (x) => x.failureKind === k)])),
  contested: contested.length,
  contestedReasons: contested.map((c) => ({ id: c.id, reasons: c.contestedBecause })),
  crossSplitLeakage: leakage,
  frozenSetSha256: hashCanonical(frozen),
};
writeFileSync(resolve(PROV, 'assembly.json'), `${JSON.stringify(report, null, 1)}\n`);
console.log(JSON.stringify({ ...report, contestedReasons: `${contested.length} entries, see provenance/assembly.json` }, null, 1));
