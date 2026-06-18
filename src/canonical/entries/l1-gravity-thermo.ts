/**
 * L1 (scalar-AST) canonical entries — gravitation + thermodynamics. Each
 * carries a dimensionally-validated `ExprNode` form; L0 fields are derived from
 * the engine via `dimensionalFields`. Forms with a free dimensionless group
 * (Newton, Bekenstein–Hawking) have `monomial: null` — the scalar-AST is what
 * pins them, which is exactly the point of the L1 layer.
 *
 * @module canonical/entries/l1-gravity-thermo
 */
import type { CanonicalEquation } from '../canonical-equation.js';
import type { ExprNode } from '../../dimensional/validator.js';
import type { DimensionalVariable } from '../../dimensional/buckingham.js';
import { sym } from '../../bridges/equations/_be-helpers.js';
import type { Dimension } from '../../dimensional/types.js';
import {
  LENGTH,
  MASS,
  AREA,
  VELOCITY,
  ACTION,
  ENERGY,
  ENTROPY,
  TEMPERATURE,
  FORCE,
  DIMENSIONLESS,
} from '../../dimensional/types.js';
import { dimensionalFields } from '../dimensional-fields.js';

const dim = (L = 0, M = 0, T = 0, I = 0, Theta = 0): Dimension => ({
  L,
  M,
  T,
  I,
  Theta,
  N: 0,
  J: 0,
});
const GRAV = dim(3, -1, -2); // Newton's constant [L³ M⁻¹ T⁻²]
const VOLUME = dim(3); // [L³]
const PRESSURE = dim(-1, 1, -2); // [M L⁻¹ T⁻²]
const SB_FLUX = dim(0, 1, -3); // radiative flux W/m² = [M T⁻³]
const SIGMA_SB = dim(0, 1, -3, 0, -4); // Stefan–Boltzmann σ [M T⁻³ Θ⁻⁴] (Θ is 5th arg)

const op = (o: '+' | '-' | '*' | '/' | '^', args: ExprNode[]): ExprNode => ({
  kind: 'op',
  op: o,
  args,
});
const pow = (base: ExprNode, n: string): ExprNode =>
  op('^', [base, sym(n, DIMENSIONLESS)]);

/** Build an L1 entry with L0 fields (`monomial` + `freeDimensionlessGroups`)
 *  derived from the engine, so they are always mutually consistent. */
type L1Rest = Omit<
  CanonicalEquation,
  'freeDimensionlessGroups' | 'dimensional'
>;
const l1 = (
  target: DimensionalVariable,
  governing: readonly DimensionalVariable[],
  rest: L1Rest,
): CanonicalEquation => {
  const { monomial, freeDimensionlessGroups } = dimensionalFields(
    target,
    governing,
  );
  return {
    ...rest,
    freeDimensionlessGroups,
    dimensional: { target, governing, monomial },
  };
};

// ── Bekenstein–Hawking entropy  S = k_B c³ A / (4 G ℏ)  (AREA form) ─────────
const BH_TARGET = { name: 'bh-entropy', dim: ENTROPY };
const BH_GOV = [
  { name: 'k_B', dim: ENTROPY },
  { name: 'c', dim: VELOCITY },
  { name: 'A', dim: AREA },
  { name: 'G', dim: GRAV },
  { name: 'hbar', dim: ACTION },
];

// ── Landauer minimum erasure energy  E = k_B T ln2  (natural log) ───────────
const LANDAUER_TARGET = { name: 'erasure-energy', dim: ENERGY };
const LANDAUER_GOV = [
  { name: 'k_B', dim: ENTROPY },
  { name: 'T', dim: TEMPERATURE },
];

// ── Newton's law of gravitation  F = G m₁ m₂ / r²  (free mass-ratio group) ──
const NEWTON_TARGET = { name: 'gravitational-force', dim: FORCE };
const NEWTON_GOV = [
  { name: 'G', dim: GRAV },
  { name: 'm_1', dim: MASS },
  { name: 'm_2', dim: MASS },
  { name: 'r', dim: LENGTH },
];

// ── Stefan–Boltzmann law  j = σ T⁴  (radiative FLUX) ────────────────────────
const SB_TARGET = { name: 'radiative-flux', dim: SB_FLUX };
const SB_GOV = [
  { name: 'sigma_sb', dim: SIGMA_SB },
  { name: 'T', dim: TEMPERATURE },
];

// ── Ideal gas law  P = N k_B T / V  (N is a dimensionless count) ────────────
const GAS_TARGET = { name: 'pressure', dim: PRESSURE };
const GAS_GOV = [
  { name: 'k_B', dim: ENTROPY },
  { name: 'T', dim: TEMPERATURE },
  { name: 'V', dim: VOLUME },
];

export const L1_GRAVITY_THERMO: readonly CanonicalEquation[] = [
  l1(BH_TARGET, BH_GOV, {
    id: 'CE-bekenstein-hawking',
    name: 'Bekenstein–Hawking entropy',
    domain: 'general-relativity',
    formula_latex: 'S = k_B c^3 A/(4 G \\hbar)',
    epistemicStatus: 'fully-quantitative',
    scalarAst: op('/', [
      op('*', [sym('k_B', ENTROPY), pow(sym('c', VELOCITY), '3'), sym('A', AREA)]),
      op('*', [sym('4', DIMENSIONLESS), sym('G', GRAV), sym('hbar', ACTION)]),
    ]),
    forms: { areaOrRadius: 'area' },
    regime: { force: 'gravitational', information: 'vonNeumann' },
    assumptions: ['stationary horizon', 'semiclassical'],
    references: ['Bekenstein 1973; Hawking 1975'],
    partnerBridges: ['BE-21', 'BE-42'],
    restatesBridge: 'BE-21',
  }),
  l1(LANDAUER_TARGET, LANDAUER_GOV, {
    id: 'CE-landauer',
    name: 'Landauer erasure bound',
    domain: 'information',
    formula_latex: 'E = k_B T \\ln 2',
    epistemicStatus: 'fully-quantitative',
    scalarAst: op('*', [
      sym('k_B', ENTROPY),
      sym('T', TEMPERATURE),
      sym('ln2', DIMENSIONLESS),
    ]),
    forms: { logBase: 'e' },
    regime: { scale: 'mesoscopic', information: 'shannon' },
    assumptions: ['isothermal', 'quasi-static erasure'],
    references: ['Landauer 1961'],
    partnerBridges: ['BE-16'],
    restatesBridge: 'BE-16',
  }),
  l1(NEWTON_TARGET, NEWTON_GOV, {
    id: 'CE-newton-gravitation',
    name: "Newton's law of gravitation",
    domain: 'gravitation',
    formula_latex: 'F = G m_1 m_2/r^2',
    epistemicStatus: 'fully-quantitative',
    scalarAst: op('/', [
      op('*', [sym('G', GRAV), sym('m_1', MASS), sym('m_2', MASS)]),
      pow(sym('r', LENGTH), '2'),
    ]),
    regime: { scale: 'classical', force: 'gravitational' },
    assumptions: ['point masses', 'non-relativistic'],
    references: ['Newton 1687'],
    partnerBridges: [],
  }),
  l1(SB_TARGET, SB_GOV, {
    id: 'CE-stefan-boltzmann',
    name: 'Stefan–Boltzmann law',
    domain: 'thermodynamics',
    formula_latex: 'j = \\sigma T^4',
    epistemicStatus: 'fully-quantitative',
    scalarAst: op('*', [sym('sigma_sb', SIGMA_SB), pow(sym('T', TEMPERATURE), '4')]),
    forms: { quantityKind: 'flux' },
    regime: { scale: 'classical', force: 'electromagnetic' },
    assumptions: ['blackbody', 'thermal equilibrium'],
    references: ['Stefan 1879; Boltzmann 1884'],
    partnerBridges: [],
  }),
  l1(GAS_TARGET, GAS_GOV, {
    id: 'CE-ideal-gas',
    name: 'Ideal gas law',
    domain: 'thermodynamics',
    formula_latex: 'P = N k_B T/V',
    epistemicStatus: 'fully-quantitative',
    scalarAst: op('/', [
      op('*', [sym('N', DIMENSIONLESS), sym('k_B', ENTROPY), sym('T', TEMPERATURE)]),
      sym('V', VOLUME),
    ]),
    regime: { scale: 'classical', force: 'electromagnetic' },
    assumptions: ['ideal gas', 'thermal equilibrium'],
    references: ['Clapeyron 1834'],
    partnerBridges: [],
  }),
];
