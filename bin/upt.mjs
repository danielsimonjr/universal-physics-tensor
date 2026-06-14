#!/usr/bin/env node
/**
 * upt — a small CLI over the Universal Physics Tensor bridge-inference
 * suite, for people who don't read TypeScript.
 *
 *   upt explain <quantity> [name=value | name] ...
 *   upt priority
 *   upt audit
 *   upt help
 *
 * Run from a built checkout (`npm run build`) via `npm run upt -- <cmd>`,
 * or as an installed command (`npx universal-physics-tensor <cmd>`).
 */
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const dist = (...p) => join(here, '..', 'dist', ...p);

let api, analysis, formulaReg, dimSpecMod;
try {
  api = await import(dist('index.js'));
  analysis = await import(dist('composition', 'bridge-analysis.js'));
  formulaReg = await import(dist('numerical', 'formula-registry.js'));
  dimSpecMod = await import(dist('dimensional', 'dimension-spec.js'));
} catch (err) {
  console.error('Could not load the built package. Run `npm run build` first.');
  console.error(String(err.message || err));
  process.exit(1);
}

const {
  explainQuantity,
  be11ZurekEdge, be12Edge, be16Edge, be37Edge, be42Edge, be42ViaRsEdge,
  be51Edge, be52Edge, lawSchwarzschildRadius, be14Edge, be19Edge, be21Edge,
  be48Edge, be53Edge, be54Edge, CATALOG_FULL_EDGES, M_SUN_KG,
} = api;
const { bridgePriority, attemptDerivation, dimensionalFreedom, dimensionallyDetermines, buckinghamPi, linkageMap, proposeLinkCandidates } = { ...analysis, ...api };
const { getFormulaParser, getFormulaParserKind, getFormulaDimensionChecker } = formulaReg;
const { parseDimensionSpec } = dimSpecMod;

const GRAPH = [
  be11ZurekEdge, be12Edge, be16Edge, be37Edge, be42Edge, be42ViaRsEdge,
  be51Edge, be52Edge, lawSchwarzschildRadius, be14Edge, be19Edge, be21Edge,
  be48Edge, be53Edge, be54Edge, ...CATALOG_FULL_EDGES,
];

// ── help ────────────────────────────────────────────────────────────────
function help() {
  console.log(`upt — Universal Physics Tensor bridge-inference CLI

Usage:
  upt explain <quantity> [name=value | name] ...
        Explain how the graph determines a quantity: the identifiability
        verdict, recovered value, derivation chains, and whether the inputs
        are dimensionally sufficient.
        e.g.  upt explain hawking-temperature mass=1.989e30

  upt priority
        Triage the speculative bridges by structural DECIDABILITY against
        established physics (Tiers 1-3). NOT a credibility ranking.

  upt audit
        Try to derive every built-in bridge equation by dimensions: which
        re-derive as a recognized monomial (with the prefactor recovered),
        which are decoys, which are dimensionally open.

  upt map
        Map how the equations LINK: connected components (clusters) of the
        catalog graph by shared quantities, the anchored core, the link
        hubs, and the isolated tail.

  upt candidates
        Propose candidate cross-cluster links (quantities of the same
        dimension in different clusters) for PHYSICIST REVIEW — a
        coincidence-heavy surface, not discovered bridges.

  upt eval "<formula>" name=value ...
        Evaluate YOUR OWN scalar formula (safe — arithmetic only). Knows
        pi/tau and sqrt/exp/ln/sin/...; any other name must be supplied.
        e.g.  upt eval "hbar*c^3/(8*pi*G*M*k_B)" hbar=1.054571817e-34 \\
                       c=299792458 G=6.6743e-11 M=1.989e30 k_B=1.380649e-23

  upt derive <target:dim> <var:dim> ... [--formula "<expr>"]
        Derive YOUR OWN equation's dimensional form. <dim> is a named
        dimension (length, time, mass, velocity, ...), a constant (hbar, c,
        G, k_B, e), or explicit (L^3.M^-1.T^-2). With --formula, also verify
        it and recover the dimensionless prefactor.
        e.g.  upt derive period:time length:length gravity:acceleration \\
                       --formula "2*pi*sqrt(length/gravity)"

  upt help        Show this message.

Run with no arguments for a short demo.`);
}

// ── explain ─────────────────────────────────────────────────────────────
function parseKnown(args) {
  const values = {};
  const names = [];
  let hasValue = false;
  for (const a of args) {
    const eq = a.indexOf('=');
    if (eq === -1) { names.push(a); continue; }
    const num = Number(a.slice(eq + 1));
    if (Number.isNaN(num)) { names.push(a.slice(0, eq)); }
    else { values[a.slice(0, eq)] = num; hasValue = true; }
  }
  return hasValue ? values : names;
}

function explain(target, rest) {
  if (!target) { console.error('upt explain needs a quantity name. See `upt help`.'); process.exit(2); }
  const x = explainQuantity(GRAPH, target, parseKnown(rest));
  console.log(`\n● ${target}`);
  console.log(`  ${x.summary}`);
  if (x.derivations.length) {
    console.log('  derivations:');
    for (const d of x.derivations) {
      const val = d.value !== undefined ? ` = ${d.value.toExponential(4)}` : '';
      const chain = d.leafInputs.join(',') !== d.sources.join(',')
        ? `  [from leaves: ${d.leafInputs.join(', ')}]` : '';
      console.log(`    - ${d.edge} (${d.label})${val}${chain}`);
      if (d.dimensionalForm) console.log(`        ${d.dimensionalForm.formula}`);
    }
  }
  if (x.blockingFrontier.length) {
    console.log(`  to determine it, also supply: ${x.blockingFrontier.join(', ')}`);
  }
}

// ── priority ────────────────────────────────────────────────────────────
function priority() {
  const board = bridgePriority(GRAPH);
  const a = (d) => (d === Infinity ? '∞' : String(d));
  console.log('\nBridge triage — structural decidability against established physics');
  console.log('(review/confrontation priority — NOT a credibility ranking)\n');
  console.log('   tier  anchor  grounding   cplx  data   bridge                status');
  console.log('   ' + '─'.repeat(73));
  let last = 0;
  for (const e of board) {
    if (e.tier !== last) {
      const label = e.tier === 1 ? 'anchored + grounded/tractable — confront first'
        : e.tier === 2 ? 'anchored OR grounded — second pass'
        : 'isolated + multi-parameter — needs literature review, not structure';
      console.log(`\n   ── Tier ${e.tier}: ${label}`);
      last = e.tier;
    }
    console.log('   T' + e.tier, a(e.anchoring).padStart(5), '  ' + e.grounding.padEnd(10),
      String(e.complexity).padStart(3), e.hasDataConfrontation ? ' DATA' : '     ',
      ' ' + e.id.padEnd(20), e.status);
  }
  const tiers = board.reduce((m, e) => ((m[e.tier] = (m[e.tier] || 0) + 1), m), {});
  console.log(`\n   Tiers: ${JSON.stringify(tiers)}  (of ${board.length} non-established bridges)`);
  console.log('   Reminder: tier ranks decidability/anchoring, not truth.');
}

// ── audit ───────────────────────────────────────────────────────────────
function audit() {
  const derived = [], decoy = [], open = [];
  for (const e of GRAPH) {
    const d = attemptDerivation(e);
    const c = dimensionalFreedom(e);
    if (d.status === 'derived') derived.push({ e, d, c });
    else if (d.status === 'decoy') decoy.push({ e, c });
    else open.push({ e, c });
  }
  console.log('\nDeriving the bridge equations by dimensions');
  console.log('(form by dimensions; the constant is recovered by matching the evaluator)\n');
  console.log(`  DERIVED (${derived.length}) — recognized monomial, prefactor recovered:`);
  for (const { e, d } of derived) {
    const tag = d.cleanPrefactor ? '' : '  (empirical/tuned constant)';
    console.log(`    ${e.id.padEnd(22)} +[${(d.subset || []).join(',')}]  ×${d.prefactor.toExponential(3)}${tag}`);
  }
  console.log(`\n  DECOY (${decoy.length}) — dimensionally valid but wrong form:`);
  console.log('    ' + decoy.map((x) => x.e.id).join(', '));
  console.log(`\n  OPEN (${open.length}) — irreducible free dimensionless group(s); by complexity:`);
  for (const { e, c } of open.sort((a, b) => a.c - b.c)) {
    console.log(`    cplx=${c}  ${e.id}`);
  }
  console.log('\n  (derivability is ORTHOGONAL to credibility — see the priority command)');
}

// ── eval (your own formula) ───────────────────────────────────────────────
async function evalCmd(rawArgs) {
  const debug = rawArgs.includes('--debug');
  const args = rawArgs.filter((a) => a !== '--debug');
  const expr = args[0];
  if (!expr) { console.error('upt eval needs a formula, e.g.  upt eval "a*b^2" a=2 b=3'); process.exit(2); }
  const parser = await getFormulaParser();
  if (debug) console.error(`[parser: ${await getFormulaParserKind()}]`);
  let cf;
  try { cf = parser.parse(expr); } catch (e) { console.error('parse error: ' + e.message); process.exit(2); }
  const scope = {};
  for (const a of args.slice(1)) {
    const i = a.indexOf('=');
    if (i > 0) scope[a.slice(0, i)] = Number(a.slice(i + 1));
  }
  const missing = cf.variables.filter((v) => !(v in scope));
  if (missing.length) {
    console.error(`missing values for: ${missing.join(', ')}   (free variables: ${cf.variables.join(', ') || 'none'})`);
    process.exit(2);
  }
  try { console.log(cf.evaluate(scope)); } catch (e) { console.error(e.message); process.exit(2); }
}

// ── derive (your own equation) ─────────────────────────────────────────────
const fmtMono = (m) => Object.entries(m).filter(([, e]) => Math.abs(e) > 1e-9)
  .map(([n, e]) => (e === 1 ? n : `${n}^${e}`)).join('·') || '(dimensionless)';

const BASES = ['L', 'M', 'T', 'I', 'Theta', 'N', 'J'];
const dimsEqualTol = (a, b) => BASES.every((k) => Math.abs((a[k] || 0) - (b[k] || 0)) < 1e-9);

async function derive(args) {
  let formula = null;
  let debug = false;
  const rest = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--formula') formula = args[++i];
    else if (args[i] === '--debug') debug = true;
    else rest.push(args[i]);
  }
  if (rest.length < 1) { console.error('upt derive needs a target spec, e.g.  upt derive period:time length:length gravity:acceleration'); process.exit(2); }
  let specs;
  try {
    specs = rest.map((a) => {
      const c = a.indexOf(':');
      if (c < 1) throw new Error(`'${a}' must be name:dimension (e.g. period:time)`);
      return { name: a.slice(0, c), dim: parseDimensionSpec(a.slice(c + 1)) };
    });
  } catch (e) { console.error('  ' + e.message); process.exit(2); }
  const target = specs[0];
  const governing = specs.slice(1);
  const det = dimensionallyDetermines(target, governing);
  console.log(`\n● ${target.name}  from {${governing.map((g) => g.name).join(', ')}}`);
  if (det.determined) {
    console.log(`  dimensionally determined up to a constant:  ${target.name} ∝ ${fmtMono(det.monomial)}`);
  } else {
    const full = buckinghamPi([target, ...governing]);
    console.log(`  NOT a unique monomial — ${full.piGroupCount} free dimensionless group(s) (${full.verdict}):`);
    for (const g of full.piGroups) console.log(`     ${g.formula}`);
    console.log(`  (${det.reason})`);
  }
  if (formula) {
    const parser = await getFormulaParser();
    if (debug) console.error(`  [parser: ${await getFormulaParserKind()}]`);

    // Dimensional check (Phase 2) — homogeneity + dimension of the user's
    // formula, independent of whether a unique monomial exists. Always
    // available (MathTS AST when present, else the built-in parser's AST).
    const checker = await getFormulaDimensionChecker();
    const dims = Object.fromEntries(governing.map((g) => [g.name, g.dim]));
    const r = checker.check(formula, dims);
    if (!r.ok) {
      console.log(`  formula dimensional check: ✗ ${r.error}`);
    } else {
      const matches = dimsEqualTol(r.dim, target.dim);
      console.log(`  formula dimension: ${api.format(r.dim)}` +
        (matches ? `  ✓ homogeneous, matches target` : `  ⚠ homogeneous but ≠ target ${api.format(target.dim)}`));
    }

    let cf;
    try { cf = parser.parse(formula); } catch (e) { console.error('  formula parse error: ' + e.message); process.exit(2); }
    if (!det.determined) { console.log('  formula given, but with no unique monomial there is no single prefactor to recover.'); return; }
    const ratios = [];
    for (let j = 0; j < 3; j++) {
      const scope = {};
      governing.forEach((g, i) => { scope[g.name] = Math.pow(1.7 + i, 1 + 0.3 * j); });
      let cand = 1;
      for (const g of governing) cand *= Math.pow(scope[g.name], det.monomial[g.name] || 0);
      try { ratios.push(cf.evaluate(scope) / cand); }
      catch (e) { console.error('  formula uses an undeclared variable: ' + e.message); process.exit(2); }
    }
    const mean = ratios.reduce((a, b) => a + b, 0) / ratios.length;
    const cv = Math.sqrt(ratios.reduce((a, b) => a + (b - mean) ** 2, 0) / ratios.length) / Math.abs(mean);
    console.log(cv < 1e-9
      ? `  formula MATCHES the dimensional form — recovered prefactor ≈ ${mean.toExponential(4)}`
      : `  formula does NOT match the dimensional monomial (different input-dependence — a decoy or different physics).`);
  }
}

// ── map (how the equations link) ──────────────────────────────────────────
function mapCmd() {
  const m = linkageMap(GRAPH);
  const mix = (s) => Object.entries(s).map(([k, v]) => `${v} ${k}`).join(', ');
  console.log('\nCatalog linkage map — how the equations connect via shared quantities');
  console.log(`(${m.componentCount} components over ${GRAPH.length} edges; ${m.compositions} compose into chains)\n`);
  for (const c of m.clusters.filter((x) => x.size > 1)) {
    console.log(`  ● cluster of ${c.size}${c.anchored ? '  [ANCHORED to known physics]' : ''}`);
    console.log(`     edges:  ${c.edges.join(', ')}`);
    console.log(`     status: ${mix(c.statusMix)}`);
    console.log(`     link hubs: ${c.hubs.join(', ')}\n`);
  }
  console.log(`  ○ isolated (${m.isolated.length}) — share no quantity with any other edge:`);
  console.log(`     ${m.isolated.join(', ')}`);
  console.log('\n  (a structural map — shared-quantity connectivity, NOT a credibility signal)');
}

// ── candidates (map-proposed links for review) ────────────────────────────
function candidatesCmd() {
  const cands = proposeLinkCandidates(GRAPH);
  const core = cands.filter((c) => c.touchesCore);
  const ck = cands.filter((c) => c.touchesCore && c.sameKind);
  console.log('\nLink candidates — cross-cluster quantities sharing a dimension');
  console.log('⚠ a coincidence-heavy REVIEW SURFACE, NOT discovered bridges. Same dimension is a');
  console.log('  weak signal; each needs a physicist to accept or (far more often) reject.\n');
  console.log(`  funnel:  ${cands.length} total  →  ${core.length} touch the anchored core  →  ${ck.length} also same-kind\n`);
  console.log('  same-kind + core-touching (the least-implausible set):');
  for (const c of ck) console.log(`    ${(c.a + ' ≟ ' + c.b).padEnd(56)} [${c.sharedToken}]`);
  console.log('\n  Most are still coincidences (decoherence-rate ≟ hubble-rate) or pairs the catalog');
  console.log('  deliberately keeps distinct (effective-mass ≠ mass). The genuinely motivated few —');
  console.log('  e.g. coarsening-length ≟ quantum-correlation-length (links the isolated Model-A');
  console.log('  coarsening bridge to the Kibble-Zurek criticality cluster) — are written up in');
  console.log('  docs/research/Linkage-Candidate-Proposals.md.');
}

// ── dispatch ──────────────────────────────────────────────────────────────
const [cmd, ...rest] = process.argv.slice(2);
switch (cmd) {
  case 'explain': explain(rest[0], rest.slice(1)); break;
  case 'priority': case 'prioritize': case 'triage': priority(); break;
  case 'audit': audit(); break;
  case 'map': case 'linkage': mapCmd(); break;
  case 'candidates': case 'propose': candidatesCmd(); break;
  case 'eval': case 'calc': await evalCmd(rest); break;
  case 'derive': case 'dim': await derive(rest); break;
  case 'help': case '--help': case '-h': help(); break;
  case undefined:
    console.log('upt — bridge-inference CLI. Demo (run `upt help` for usage):');
    explain('hawking-temperature', ['mass=1.989e30']);
    priority();
    break;
  default:
    console.error(`Unknown command '${cmd}'. See \`upt help\`.`);
    process.exit(2);
}
