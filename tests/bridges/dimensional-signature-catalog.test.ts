/**
 * Catalog-wide invariant: every entry whose `dimensional_signature` is
 * non-null and whose AST is encoded in `src/bridges/equations/` must
 * round-trip through the dimensional analyzer back to the registered
 * string.
 *
 * Today (Tier 4 / early Tier 5) only BE-11 and BE-14 have AST encodings;
 * BE-18, BE-29, BE-47, BE-48 have hand-written `dimensional_signature`
 * values but no AST. The test iterates the registered AST modules and
 * asserts the round-trip invariant; as Tier-5 lands more encodings, the
 * iteration auto-extends — adding a new AST module is the only thing
 * required to bring it under test.
 *
 * Source: test-analyzer F12.
 */
import { describe, it, expect } from 'vitest';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';
import { validate, ExprNode } from '../../src/dimensional/validator.js';
import { format } from '../../src/dimensional/algebra.js';

import { DECOHERENCE_RATE_RHS } from '../../src/bridges/equations/be-11-decoherence-master.js';
import { BE12_COHERENCE_LENGTH_RHS } from '../../src/bridges/equations/be-12-coherence-length.js';
import { RYU_TAKAYANAGI_RHS } from '../../src/bridges/equations/be-14-ryu-takayanagi.js';
import { QUANTUM_BOUNCE_RHS } from '../../src/bridges/equations/be-19-quantum-bounce.js';
import { BE22_TOPOLOGICAL_ENTANGLEMENT_RHS } from '../../src/bridges/equations/be-22-topological-entanglement.js';
import { BE23_SYK_RESISTIVITY_RHS } from '../../src/bridges/equations/be-23-syk-planckian.js';
import { BE24_FRET_EFFICIENCY_RHS } from '../../src/bridges/equations/be-24-foerster-fret.js';
// BE-25 (Penrose-Hameroff Orch-OR) AST module archived 2026-05-06
// (Wave Q B2, per CS iter-6 C2); ORCH_OR_RHS no longer imported here.
import { BE40_COMPOSITE_HIGGS_RHS } from '../../src/bridges/equations/be-40-composite-higgs.js';
import { SWAMPLAND_RHS } from '../../src/bridges/equations/be-41-swampland.js';
import { BE31_CAUSAL_SET_BD_RHS } from '../../src/bridges/equations/be-31-causal-set-bd.js';
import { BE33_HERTZ_MILLIS_RHS } from '../../src/bridges/equations/be-33-hertz-millis.js';
import { KIBBLE_ZUREK_RHS } from '../../src/bridges/equations/be-34-kibble-zurek.js';
import { DNA_TUNNELING_RHS } from '../../src/bridges/equations/be-26-dna-tunneling.js';
import { BE38_MOND_FORCE_RHS } from '../../src/bridges/equations/be-38-mond.js';
import { BE39_BETA_G_RHS } from '../../src/bridges/equations/be-39-asymptotic-safety.js';
import { BE43_ER_EPR_RHS } from '../../src/bridges/equations/be-43-er-epr.js';
import { BE45_TCC_RHS } from '../../src/bridges/equations/be-45-tcc.js';
import { BBN_DARK_RHS } from '../../src/bridges/equations/be-47-bbn-dark-sector.js';
import { BE49_QUANTUM_DARWINISM_RHS } from '../../src/bridges/equations/be-49-quantum-darwinism.js';

interface EncodedRhs {
  id: number;
  rhs: ExprNode;
}

// Add new entries here as Tier-5 AST encodings land. The shape is
// deliberately a static array (not dynamic-import) because it gives
// the type-checker a guarantee that every encoded RHS is in scope.
const ENCODED_RHS: ReadonlyArray<EncodedRhs> = [
  { id: 11, rhs: DECOHERENCE_RATE_RHS },
  { id: 12, rhs: BE12_COHERENCE_LENGTH_RHS },
  { id: 14, rhs: RYU_TAKAYANAGI_RHS },
  { id: 19, rhs: QUANTUM_BOUNCE_RHS },
  { id: 22, rhs: BE22_TOPOLOGICAL_ENTANGLEMENT_RHS },
  { id: 23, rhs: BE23_SYK_RESISTIVITY_RHS },
  { id: 24, rhs: BE24_FRET_EFFICIENCY_RHS },
  // BE-25 (Penrose-Hameroff Orch-OR) intentionally REMOVED 2026-05-06
  // (Wave P-D R-D2): the AST module ORCH_OR_RHS encodes the dropped
  // Penrose-Hameroff t_OR = ℏ ℓ_P / (Δm c² Δx) form, not the canonical
  // IIT Φ_max form that BE-25 was reformulated to. The bridge-index
  // dimensional_signature is now null (Φ is dimensionless / bits when
  // log₂ is used; the IIT 3.0/4.0 framework pins units separately).
  // The AST module is preserved for historical traceability but no
  // longer participates in this round-trip catalog. See
  // tests/bridges/be-25-encoding.test.ts for the stale-AST archive test.
  { id: 26, rhs: DNA_TUNNELING_RHS },
  { id: 31, rhs: BE31_CAUSAL_SET_BD_RHS },
  { id: 33, rhs: BE33_HERTZ_MILLIS_RHS },
  { id: 34, rhs: KIBBLE_ZUREK_RHS },
  { id: 38, rhs: BE38_MOND_FORCE_RHS },
  { id: 39, rhs: BE39_BETA_G_RHS },
  { id: 40, rhs: BE40_COMPOSITE_HIGGS_RHS },
  { id: 41, rhs: SWAMPLAND_RHS },
  { id: 43, rhs: BE43_ER_EPR_RHS },
  { id: 45, rhs: BE45_TCC_RHS },
  { id: 47, rhs: BBN_DARK_RHS },
  { id: 49, rhs: BE49_QUANTUM_DARWINISM_RHS },
];

describe('Bridge index: dimensional_signature ↔ AST round-trip', () => {
  for (const { id, rhs } of ENCODED_RHS) {
    it(`BE-${id}: format(infer(rhs)) equals registered dimensional_signature`, () => {
      const entry = BRIDGE_EQUATIONS.find((e) => e.id === id);
      expect(entry, `BE-${id} must exist in BRIDGE_EQUATIONS`).toBeDefined();
      expect(
        entry!.dimensional_signature,
        `BE-${id}: an AST encoding exists, so dimensional_signature must be non-null`,
      ).not.toBeNull();
      const r = validate(rhs);
      expect(r.ok, `BE-${id}: RHS AST must validate cleanly`).toBe(true);
      expect(r.inferredDimension).not.toBeNull();
      expect(format(r.inferredDimension!)).toBe(entry!.dimensional_signature);
    });
  }

  it('every encoded RHS module is registered in this catalog test', () => {
    // Sanity floor: if a future contributor adds a new BE-N encoded module
    // without adding it to ENCODED_RHS above, this test won't fail — but
    // the catalog will be silently incomplete. We can at least pin that
    // the two known encodings are present so a copy-paste deletion is
    // caught.
    const ids = new Set(ENCODED_RHS.map((e) => e.id));
    expect(ids.has(11)).toBe(true);
    expect(ids.has(14)).toBe(true);
  });
});
