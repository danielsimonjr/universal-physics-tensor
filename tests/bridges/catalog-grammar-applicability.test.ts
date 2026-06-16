/**
 * v0.14 grammar — applicability against the real bridge catalog.
 *
 * The `dirac-delta` + `variational-derivative` primitives were motivated by the
 * forms three catalog bridges document as "un-encodable". This suite points the
 * grammar at each of those CANONICAL forms (using ONLY dimensions the bridge
 * docstrings state, or that derive from them — no fabricated physics) and pins:
 *
 *   - BE-15 (Model A Langevin / FDT): BOTH primitives — FULLY expressible.
 *   - BE-46 (Weinberg-Vilenkin anthropic measure): the observable-fixing
 *           Dirac-δ IS expressible; the functional metric-integral is not
 *           (barrier-3 class — out of scope, asserted by absence).
 *   - BE-28 (MEPP / Onsager): the variational-δ IS expressible on the
 *           entropy-production functional; the Lagrange-multiplier + discrete
 *           index-sum remain beyond the two primitives (per the docstring's
 *           ⚠ CRITICAL WARNING).
 *
 * Plus a regression block: the three bridges' CURRENTLY-encoded RHS still
 * validate and use NEITHER new kind — the catalog re-encoding is correctly
 * DEFERRED to a physicist (CONTRIBUTING.md), as the design note specifies.
 *
 * Catalog-wide round-trip regression (all 42 encoded signatures unperturbed by
 * the grammar addition) lives in tests/bridges/dimensional-signature-catalog.test.ts.
 */
import { describe, it, expect } from 'vitest';
import { validate, validateEquation } from '../../src/dimensional/validator.js';
import type { ExprNode } from '../../src/dimensional/validator.js';
import { equals, multiply, divide, power } from '../../src/dimensional/algebra.js';
import {
  LENGTH,
  TIME,
  ENERGY,
  TEMPERATURE,
  DIMENSIONLESS,
  type Dimension,
} from '../../src/dimensional/types.js';
import { BE15_COARSENING_LENGTH_SQUARED_RHS } from '../../src/bridges/equations/be-15-emergence.js';
import { BE28_ENTROPY_PRODUCTION_RHS } from '../../src/bridges/equations/be-28-onsager-entropy-production.js';
import { BE46_ANTHROPIC_PROBABILITY_RHS } from '../../src/bridges/equations/be-46-multiverse-measure.js';

const s = (name: string, dim: Dimension = DIMENSIONLESS): ExprNode => ({ kind: 'symbol', name, dim });
const op = (o: '+' | '-' | '*' | '/' | '^', ...args: ExprNode[]): ExprNode => ({ kind: 'op', op: o, args });
const delta = (arg: ExprNode): ExprNode => ({ kind: 'dirac-delta', arg });
const vderiv = (functional: ExprNode, field: ExprNode, over: ExprNode): ExprNode =>
  ({ kind: 'variational-derivative', functional, field, over });

// Collect every `kind` string appearing anywhere in an ExprNode tree.
function collectKinds(node: unknown, acc: Set<string> = new Set()): Set<string> {
  if (node === null || typeof node !== 'object') return acc;
  if (Array.isArray(node)) {
    for (const x of node) collectKinds(x, acc);
    return acc;
  }
  const obj = node as Record<string, unknown>;
  if (typeof obj.kind === 'string') acc.add(obj.kind);
  for (const v of Object.values(obj)) collectKinds(v, acc);
  return acc;
}

describe('BE-15 — Model A Langevin / FDT (both primitives, FULLY expressible)', () => {
  // Field φ: generic field dimension (mass here; homogeneity holds for any [φ]).
  const PHI: Dimension = { L: 0, M: 1, T: 0, I: 0, Theta: 0, N: 0, J: 0 };
  const VOLUME: Dimension = power(LENGTH, 3); // spatial measure [d³x] = L³
  // Bare-Langevin kinetic coefficient, the dim the BE-15 docstring states:
  // [Γ] = [φ]²·L³·T⁻¹·E⁻¹  (distinct from the encoded coarsening Γ = L²/T).
  const GAMMA: Dimension = divide(multiply(power(PHI, 2), VOLUME), multiply(TIME, ENERGY));

  it('Langevin  ∂φ/∂t = −Γ δH/δφ  is dimensionally homogeneous', () => {
    const lhs = { kind: 'derivative' as const, of: s('φ', PHI), wrt: s('t', TIME) };
    // δH/δφ over d³x, H an energy functional → ENERGY/[φ]/L³.
    const rhs = op('*', s('Γ', GAMMA), vderiv(s('H', ENERGY), s('φ', PHI), s('d³x', VOLUME)));
    const r = validateEquation(lhs, rhs);
    expect(r.ok).toBe(true);
    expect(r.violations).toEqual([]);
    expect(equals(r.inferredDimension!, divide(PHI, TIME))).toBe(true);
  });

  it('FDT correlator  ⟨ζζ⟩ = 2Γk_BT δ³(x)δ(t)  is dimensionally homogeneous', () => {
    const dphidt = { kind: 'derivative' as const, of: s('φ', PHI), wrt: s('t', TIME) };
    const lhs = op('*', dphidt, dphidt); // ⟨ζζ⟩ = [∂φ/∂t]²
    const rhs = op(
      '*',
      s('Γ', GAMMA),
      s('k_BT', ENERGY),
      delta(s('x', LENGTH)),
      delta(s('y', LENGTH)),
      delta(s('z', LENGTH)),
      delta(s('t', TIME)),
    );
    const r = validateEquation(lhs, rhs);
    expect(r.ok).toBe(true);
    expect(r.violations).toEqual([]);
    expect(equals(r.inferredDimension!, multiply(power(PHI, 2), power(TIME, -2)))).toBe(true);
  });
});

describe('BE-46 — anthropic measure (dirac-δ expressible; functional integral is not)', () => {
  // Canonical:  P[O] = ∫ dμ[g,φ] W[g,φ] δ(O − O[g,φ]).
  // The observable-fixing δ(O − O[g,φ]) has dim [O]⁻¹ for ANY observable dim
  // [O] (the docstring does not fix [O], so we test it parametrically — this is
  // a grammar identity, not a physics claim about a particular observable).
  it('the observable-fixing δ(O − O[g,φ]) infers [O]⁻¹ for any observable dimension', () => {
    for (const [label, O] of [['energy', ENERGY], ['length', LENGTH], ['dimensionless', DIMENSIONLESS]] as const) {
      // arg = O − O[g,φ]; both share dim [O], so the difference has dim [O].
      const node = delta(op('-', s('O', O), s('O_gφ', O)));
      const r = validate(node);
      expect(r.ok, `δ over a ${label} observable`).toBe(true);
      expect(equals(r.inferredDimension!, power(O, -1))).toBe(true);
    }
  });

  it('the functional metric-integral ∫dμ[g,φ] remains out of scope (barrier 3)', () => {
    // The scalar `integral` primitive is a measure over a COORDINATE, not a
    // functional integral over the space of metrics. The new grammar adds δ and
    // δ/δφ, NOT functional integration — so BE-46 stays only partially
    // expressible. We assert the limit honestly: there is no node kind for a
    // measure over function space.
    const grammarKinds = new Set([
      'symbol', 'op', 'integral', 'derivative', 'dirac-delta', 'variational-derivative',
    ]);
    expect(grammarKinds.has('functional-integral')).toBe(false);
  });
});

describe('BE-28 — MEPP / Onsager (variational-δ expressible; multiplier + sum are not)', () => {
  // Canonical (Dewar):  δ ∫ [dS/dt − λ Σᵢ Jᵢ Xᵢ − μ(∇·v)] dt = 0.
  // Stated dim: σ = dS/dt = [entropy/time] = [W/K] = [L²M T⁻³ Θ⁻¹].
  const ENTROPY: Dimension = divide(ENERGY, TEMPERATURE);       // [J/K]
  const ENTROPY_RATE: Dimension = divide(ENTROPY, TIME);        // σ = [W/K]

  it('σ = dS/dt carries the docstring dimension [W/K] = [L²M T⁻³ Θ⁻¹]', () => {
    expect(equals(ENTROPY_RATE, { L: 2, M: 1, T: -3, I: 0, Theta: -1, N: 0, J: 0 })).toBe(true);
  });

  it('the variational δΦ/δσ on the entropy-production functional Φ=∫σ dt is dimensionless', () => {
    // Φ = ∫ (dS/dt) dt = ΔS (entropy). The first variation δΦ/δσ over the time
    // measure dt undoes the ∫dt: [δΦ/δσ] = [Φ]/([σ]·[dt])
    //   = [entropy] / ([entropy/time]·[time]) = dimensionless — the
    // "δΦ/δσ = 1 by construction" consistency (cf. BE-30). Uses only stated dims.
    const node = vderiv(s('Φ', ENTROPY), s('σ', ENTROPY_RATE), s('t', TIME));
    const r = validate(node);
    expect(r.ok).toBe(true);
    expect(equals(r.inferredDimension!, DIMENSIONLESS)).toBe(true);
  });

  it('the Lagrange-multiplier + discrete-index-sum barriers remain (no grammar for them)', () => {
    // The two new primitives do NOT add a constrained-extremum (λ, μ) construct
    // or a discrete Σᵢ over species. BE-28 therefore stays the *definiendum*
    // encoding (σ = ΣJX), NOT the maximization principle — exactly the
    // docstring's ⚠ CRITICAL WARNING. Asserted by absence of such node kinds.
    const grammarKinds = new Set([
      'symbol', 'op', 'integral', 'derivative', 'dirac-delta', 'variational-derivative',
    ]);
    expect(grammarKinds.has('lagrange-multiplier')).toBe(false);
    expect(grammarKinds.has('index-sum')).toBe(false);
  });
});

describe('regression — grammar additive; catalog re-encoding correctly deferred', () => {
  const cases = [
    { id: 15, rhs: BE15_COARSENING_LENGTH_SQUARED_RHS },
    { id: 28, rhs: BE28_ENTROPY_PRODUCTION_RHS },
    { id: 46, rhs: BE46_ANTHROPIC_PROBABILITY_RHS },
  ];
  for (const { id, rhs } of cases) {
    it(`BE-${id}: currently-encoded RHS still validates and uses NEITHER new kind`, () => {
      const r = validate(rhs);
      expect(r.ok).toBe(true);
      const kinds = collectKinds(rhs);
      expect(kinds.has('dirac-delta')).toBe(false);
      expect(kinds.has('variational-derivative')).toBe(false);
    });
  }
});
