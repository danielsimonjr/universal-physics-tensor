/**
 * Relativity canonical entries: the Einstein field equation (L2 — a structural
 * `EinsteinFieldEquationNode` validated by the existing field-equation
 * predicate) and the Friedmann equation (L1 — the flat, matter-dominated scalar
 * form H² = 8πG ρ / 3).
 *
 * @module canonical/entries/relativity
 */
import type { CanonicalEquation } from '../canonical-equation.js';
import type { EinsteinFieldEquationNode } from '../../dimensional/einstein-equation.js';
import type { EinsteinTensorNode } from '../../dimensional/curvature.js';
import type {
  StressEnergyTensorNode,
  CosmologicalConstantNode,
} from '../../dimensional/stress-energy-validators.js';
import type { MetricTensorNode } from '../../dimensional/metric-validators.js';
import type { RiemannTensorNode } from '../../dimensional/connection-validators.js';
import { metric } from '../../dimensional/metric.js';
import { tsym } from '../../dimensional/tensor.js';
import { sym } from '../../bridges/equations/_be-helpers.js';
import { LENGTH, DIMENSIONLESS } from '../../dimensional/types.js';
import { dim, op, l1 } from './_l1-build.js';

// ── EFE node builders (the canonical G_μν + Λg_μν = (8πG/c⁴)T_μν structure) ──
const L_INV2 = dim(-2); // [L⁻²] — per-component dim of every EFE term
const ENERGY_DENSITY = dim(-1, 1, -2); // T_μν componentDim [M L⁻¹ T⁻²]

function buildRiemann(mu = 'mu', nu = 'nu'): RiemannTensorNode {
  const gLower = metric(
    'g',
    [
      { label: 'a', variance: 'lower' },
      { label: 'b', variance: 'lower' },
    ],
    DIMENSIONLESS,
    '+,-,-,-',
  );
  const gInverse = metric(
    'g_inv',
    [
      { label: 'a', variance: 'upper' },
      { label: 'b', variance: 'upper' },
    ],
    DIMENSIONLESS,
    '+,-,-,-',
  );
  const xCoord = tsym(
    'x',
    [{ label: 'c', variance: 'upper' }],
    LENGTH,
    'coordinate',
  );
  return {
    kind: 'riemann-tensor',
    upperIndex: { label: 'rho', variance: 'upper' },
    lowerIndices: [
      { label: mu, variance: 'lower' },
      { label: 'lambda', variance: 'lower' },
      { label: nu, variance: 'lower' },
    ],
    gLower,
    gInverse,
    xCoord,
  };
}

function buildEinstein(mu = 'mu', nu = 'nu'): EinsteinTensorNode {
  const riemann = buildRiemann(mu, nu);
  return {
    kind: 'einstein-tensor',
    riemann,
    gLower: riemann.gLower,
    gInverse: riemann.gInverse,
  };
}

const buildT = (mu = 'mu', nu = 'nu'): StressEnergyTensorNode => ({
  kind: 'stress-energy',
  symbol: 'T',
  indices: [
    { label: mu, variance: 'lower' },
    { label: nu, variance: 'lower' },
  ],
  symmetry: 'symmetric',
  componentDim: ENERGY_DENSITY,
});

const buildLambda = (): CosmologicalConstantNode => ({
  kind: 'cosmological-constant',
  symbol: 'Λ',
  dim: L_INV2,
});

const buildMetric = (): MetricTensorNode =>
  metric(
    'g_metric',
    [
      { label: 'mu', variance: 'lower' },
      { label: 'nu', variance: 'lower' },
    ],
    DIMENSIONLESS,
    '+,-,-,-',
  );

/** The canonical Einstein field equation node, G_μν + Λg_μν = (8πG/c⁴)T_μν. */
export const EFE_NODE: EinsteinFieldEquationNode = {
  kind: 'einstein-equation',
  lhs: buildEinstein('mu', 'nu'),
  cosmological: buildLambda(),
  metric: buildMetric(),
  rhs: buildT('mu', 'nu'),
  coupling: 'einstein',
};

// ── dimensional layer for the EFE (per-component [L⁻²] from 8πG·T/c⁴) ────────
const GRAV = dim(3, -1, -2);
const EFE_TARGET = { name: 'efe-curvature', dim: L_INV2 };
const EFE_GOV = [
  { name: 'G', dim: GRAV },
  { name: 'c', dim: dim(1, 0, -1) },
  { name: 'stress-energy-density', dim: ENERGY_DENSITY },
];

// ── Friedmann (flat, matter-dominated): H² = 8πG ρ / 3 ───────────────────────
const HSQUARED = dim(0, 0, -2); // [T⁻²]
const DENSITY = dim(-3, 1); // [M L⁻³]
const FRIEDMANN_TARGET = { name: 'hubble-rate-squared', dim: HSQUARED };
const FRIEDMANN_GOV = [
  { name: 'G', dim: GRAV },
  { name: 'rho', dim: DENSITY },
];

export const RELATIVITY: readonly CanonicalEquation[] = [
  l1(EFE_TARGET, EFE_GOV, {
    id: 'CE-einstein-field-eq',
    name: 'Einstein field equation',
    domain: 'general-relativity',
    formula_latex: 'G_{\\mu\\nu} + \\Lambda g_{\\mu\\nu} = (8\\pi G/c^4) T_{\\mu\\nu}',
    epistemicStatus: 'fully-quantitative',
    fieldEquation: EFE_NODE,
    regime: { force: 'gravitational', symmetry: 'poincare' },
    assumptions: ['classical GR', 'pseudo-Riemannian spacetime'],
    references: ['Einstein 1915'],
    partnerBridges: ['13'], // 13 = Information-Geometry (Jacobson thermodynamic EFE)
  }),
  l1(FRIEDMANN_TARGET, FRIEDMANN_GOV, {
    id: 'CE-friedmann',
    name: 'Friedmann equation (flat, matter-dominated)',
    domain: 'cosmology',
    formula_latex: 'H^2 = 8\\pi G \\rho/3',
    epistemicStatus: 'fully-quantitative',
    scalarAst: op('/', [
      op('*', [sym('8pi', DIMENSIONLESS), sym('G', GRAV), sym('rho', DENSITY)]),
      sym('3', DIMENSIONLESS),
    ]),
    regime: { scale: 'cosmological', force: 'gravitational' },
    assumptions: ['flat (k=0)', 'matter-dominated', 'Λ=0', 'FLRW'],
    references: ['Friedmann 1922'],
    partnerBridges: [],
  }),
];
