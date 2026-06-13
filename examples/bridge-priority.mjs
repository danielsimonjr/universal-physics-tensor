/**
 * bridge-priority.mjs — triage the speculative bridges by how DECIDABLE
 * they are against established physics (most anchored + most checkable).
 *
 * ⚠ This is a REVIEW/CONFRONTATION priority, NOT a credibility score. The
 * dimensional signals are orthogonal to whether a bridge is true (a
 * highly-speculative bridge can rank Tier 1; established physics like
 * Mercury's perihelion is "unclosable"). Do not read tier as belief.
 *
 * Build first (`npm run build`), then: `npm run bridge-priority`
 */
import { bridgePriority } from '../dist/composition/bridge-analysis.js';
import {
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
} from '../dist/index.js';

const GRAPH = [
  be11ZurekEdge, be12Edge, be16Edge, be37Edge, be42Edge, be42ViaRsEdge,
  be51Edge, be52Edge, lawSchwarzschildRadius, be14Edge, be19Edge, be21Edge,
  be48Edge, be53Edge, be54Edge, ...CATALOG_FULL_EDGES,
];

const board = bridgePriority(GRAPH);
const a = (d) => (d === Infinity ? '∞' : String(d));

console.log('Bridge triage — structural decidability against established physics');
console.log('(review/confrontation priority — NOT a credibility ranking)\n');
console.log('  tier  anchor  grounding   cplx  data   bridge                status');
console.log('  ' + '─'.repeat(74));

let lastTier = 0;
for (const e of board) {
  if (e.tier !== lastTier) {
    const label =
      e.tier === 1 ? 'anchored + grounded/tractable — confront first'
      : e.tier === 2 ? 'anchored OR grounded — second pass'
      : 'isolated + multi-parameter — needs literature review, not structure';
    console.log(`\n  ── Tier ${e.tier}: ${label}`);
    lastTier = e.tier;
  }
  console.log(
    '   T' + e.tier,
    a(e.anchoring).padStart(5),
    '  ' + e.grounding.padEnd(10),
    String(e.complexity).padStart(3),
    e.hasDataConfrontation ? ' DATA' : '     ',
    ' ' + e.id.padEnd(20),
    e.status,
  );
}

const tiers = board.reduce((m, e) => ((m[e.tier] = (m[e.tier] || 0) + 1), m), {});
console.log(`\n  Tiers: ${JSON.stringify(tiers)}  (of ${board.length} non-established bridges)`);
console.log('  Reminder: tier ranks decidability/anchoring, not truth.');
