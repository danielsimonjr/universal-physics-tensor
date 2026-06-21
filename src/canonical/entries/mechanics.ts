/**
 * L1 (scalar-AST) canonical entries — foundational mechanics. The dimensional
 * textbook laws the registry was missing: Newton's second law, mass–energy
 * equivalence, and the (non-relativistic) momentum definition. Each is a unique
 * dimensional monomial (0 free groups); L0 fields are engine-derived
 * (see `_l1-build`).
 *
 * Scope note: these are generic, purely dimensional laws — added per the
 * "only laws that genuinely fit the dimensional L-layer" audit. (Dimensionless
 * physics — Yang–Mills β, KSS η/s — and domain-specific relations like
 * Kibble–Zurek are deliberately NOT added; they sit outside a dimension-centric
 * registry. See docs/research/bridges-vs-canonical-map.md.)
 *
 * @module canonical/entries/mechanics
 */
import type { CanonicalEquation } from '../canonical-equation.js';
import { sym } from '../../bridges/equations/_be-helpers.js';
import { MASS, VELOCITY, ENERGY, FORCE, ACCELERATION } from '../../dimensional/types.js';
import { dim, op, pow, l1 } from './_l1-build.js';

const MOMENTUM = dim(1, 1, -1); // [L M T⁻¹]

// ── Newton's second law  F = m a ────────────────────────────────────────────
const NEWTON2_TARGET = { name: 'force', dim: FORCE };
const NEWTON2_GOV = [
  { name: 'mass', dim: MASS },
  { name: 'acceleration', dim: ACCELERATION },
];

// ── Mass–energy equivalence  E = m c² ───────────────────────────────────────
const MASS_ENERGY_TARGET = { name: 'rest-energy', dim: ENERGY };
const MASS_ENERGY_GOV = [
  { name: 'mass', dim: MASS },
  { name: 'c', dim: VELOCITY },
];

// ── Momentum (non-relativistic)  p = m v ────────────────────────────────────
const MOMENTUM_TARGET = { name: 'p', dim: MOMENTUM };
const MOMENTUM_GOV = [
  { name: 'mass', dim: MASS },
  { name: 'velocity', dim: VELOCITY },
];

export const MECHANICS: readonly CanonicalEquation[] = [
  l1(NEWTON2_TARGET, NEWTON2_GOV, {
    id: 'CE-newton-second-law',
    name: "Newton's second law",
    domain: 'mechanics',
    formula_latex: 'F = m a',
    epistemicStatus: 'fully-quantitative',
    scalarAst: op('*', [sym('mass', MASS), sym('acceleration', ACCELERATION)]),
    regime: { scale: 'classical' },
    assumptions: ['inertial frame', 'constant mass'],
    references: ['Newton, Principia 1687'],
    partnerBridges: [],
  }),
  l1(MASS_ENERGY_TARGET, MASS_ENERGY_GOV, {
    id: 'CE-mass-energy',
    name: 'Mass–energy equivalence',
    domain: 'mechanics',
    formula_latex: 'E = m c^2',
    epistemicStatus: 'fully-quantitative',
    scalarAst: op('*', [sym('mass', MASS), pow(sym('c', VELOCITY), '2')]),
    regime: { scale: 'classical' },
    assumptions: ['rest energy of a massive body'],
    references: ['Einstein 1905, Ann. Phys. 18:639'],
    partnerBridges: [],
  }),
  l1(MOMENTUM_TARGET, MOMENTUM_GOV, {
    id: 'CE-momentum',
    name: 'Momentum (non-relativistic)',
    domain: 'mechanics',
    formula_latex: 'p = m v',
    epistemicStatus: 'fully-quantitative',
    scalarAst: op('*', [sym('mass', MASS), sym('velocity', VELOCITY)]),
    regime: { scale: 'classical' },
    assumptions: ['non-relativistic (v ≪ c)'],
    references: ['Newton, Principia 1687'],
    partnerBridges: [],
  }),
];
