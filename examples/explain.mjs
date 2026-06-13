/**
 * explain.mjs — a tiny CLI over the unified `explainQuantity` entry point.
 *
 * Surfaces the bridge-inference suite (identifiability classifier +
 * retrodiction harness + Buckingham-π dimensional analysis) as a one-line
 * summary for people who don't read TypeScript.
 *
 * Build first (`npm run build`), then:
 *
 *   node examples/explain.mjs <target> [name=value | name] ...
 *
 * Examples:
 *   node examples/explain.mjs hawking-temperature mass=1.989e30
 *   node examples/explain.mjs landauer-erasure-energy mass=1.989e30
 *   node examples/explain.mjs schwarzschild-radius mass=1.989e30
 *
 * With no arguments it runs a few demo explanations.
 */
import {
  explainQuantity,
  be11ZurekEdge,
  be12Edge,
  be16Edge,
  be37Edge,
  be42Edge,
  be42ViaRsEdge,
  be51Edge,
  be52Edge,
  lawSchwarzschildRadius,
  be14Edge,
  be19Edge,
  be21Edge,
  be48Edge,
  be53Edge,
  be54Edge,
  CATALOG_FULL_EDGES,
  M_SUN_KG,
} from '../dist/index.js';

const GRAPH = [
  be11ZurekEdge,
  be12Edge,
  be16Edge,
  be37Edge,
  be42Edge,
  be42ViaRsEdge,
  be51Edge,
  be52Edge,
  lawSchwarzschildRadius,
  be14Edge,
  be19Edge,
  be21Edge,
  be48Edge,
  be53Edge,
  be54Edge,
  ...CATALOG_FULL_EDGES,
];

/** Parse `name=value` (value → number) or bare `name` (known, no value). */
function parseKnown(args) {
  const values = {};
  const names = [];
  let hasValue = false;
  for (const a of args) {
    const eq = a.indexOf('=');
    if (eq === -1) {
      names.push(a);
    } else {
      const name = a.slice(0, eq);
      const num = Number(a.slice(eq + 1));
      if (Number.isNaN(num)) {
        console.error(`  (ignoring '${a}': value is not a number)`);
        names.push(name);
      } else {
        values[name] = num;
        hasValue = true;
      }
    }
  }
  // If any value was given, pass the value map; else pass the name list.
  return hasValue ? values : names;
}

function printExplanation(target, known) {
  const x = explainQuantity(GRAPH, target, known);
  console.log(`\n● ${target}`);
  console.log(`  ${x.summary}`);
  if (x.derivations.length) {
    console.log('  derivations:');
    for (const d of x.derivations) {
      const val = d.value !== undefined ? ` = ${d.value.toExponential(4)}` : '';
      const chain =
        d.leafInputs.join(',') !== d.sources.join(',')
          ? `  [from leaves: ${d.leafInputs.join(', ')}]`
          : '';
      console.log(`    - ${d.edge} (${d.label})${val}${chain}`);
      if (d.dimensionalForm) console.log(`        ${d.dimensionalForm.formula}`);
    }
  }
  if (x.blockingFrontier.length) {
    console.log(`  to determine it, also supply: ${x.blockingFrontier.join(', ')}`);
  }
}

const [, , target, ...rest] = process.argv;

if (!target) {
  console.log('Usage: node examples/explain.mjs <target> [name=value | name] ...');
  console.log('\nNo target given — running demo explanations:\n');
  console.log('═'.repeat(70));
  printExplanation('hawking-temperature', { mass: M_SUN_KG });
  printExplanation('landauer-erasure-energy', { mass: M_SUN_KG });
  printExplanation('schwarzschild-radius', { mass: M_SUN_KG });
  printExplanation('fret-efficiency', { mass: M_SUN_KG });
  console.log('\n' + '═'.repeat(70));
} else {
  printExplanation(target, parseKnown(rest));
}
