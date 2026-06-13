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
const distIndex = join(here, '..', 'dist', 'index.js');
const distAnalysis = join(here, '..', 'dist', 'composition', 'bridge-analysis.js');

let api, analysis;
try {
  api = await import(distIndex);
  analysis = await import(distAnalysis);
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
const { bridgePriority, attemptDerivation, dimensionalFreedom } = analysis;

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
        Try to derive every bridge equation by dimensions: which re-derive
        as a recognized monomial (with the prefactor recovered), which are
        decoys, which are dimensionally open.

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

// ── dispatch ──────────────────────────────────────────────────────────────
const [cmd, ...rest] = process.argv.slice(2);
switch (cmd) {
  case 'explain': explain(rest[0], rest.slice(1)); break;
  case 'priority': case 'prioritize': case 'triage': priority(); break;
  case 'audit': case 'derive': audit(); break;
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
