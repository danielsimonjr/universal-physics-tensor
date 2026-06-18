/**
 * L1 (scalar-AST) canonical entries — quantum + electromagnetism. Coulomb's
 * law, Planck–Einstein, de Broglie, Bohr radius, Wien's displacement, and the
 * Lorentz-force magnitude. L0 fields derived from the engine (see `_l1-build`).
 *
 * @module canonical/entries/l1-quantum-em
 */
import type { CanonicalEquation } from '../canonical-equation.js';
import { sym } from '../../bridges/equations/_be-helpers.js';
import {
  LENGTH,
  MASS,
  VELOCITY,
  ACTION,
  ENERGY,
  FREQUENCY,
  FORCE,
  CHARGE,
  DIMENSIONLESS,
} from '../../dimensional/types.js';
import { dim, op, pow, l1 } from './_l1-build.js';

const PERMITTIVITY = dim(-3, -1, 4, 2); // ε₀ [I² T⁴ M⁻¹ L⁻³]
const MOMENTUM = dim(1, 1, -1); // [L M T⁻¹]
const MAGFIELD = dim(0, 1, -2, -1); // magnetic flux density (tesla) [M T⁻² I⁻¹]
const WIEN_B = dim(1, 0, 0, 0, 1); // Wien constant [L Θ]

// ── Coulomb's law  F = q₁ q₂ / (4π ε₀ r²)  (free charge-ratio group) ────────
const COULOMB_TARGET = { name: 'coulomb-force', dim: FORCE };
const COULOMB_GOV = [
  { name: 'q_1', dim: CHARGE },
  { name: 'q_2', dim: CHARGE },
  { name: 'epsilon_0', dim: PERMITTIVITY },
  { name: 'r', dim: LENGTH },
];

// ── Planck–Einstein  E = h ν ────────────────────────────────────────────────
const PE_TARGET = { name: 'photon-energy', dim: ENERGY };
const PE_GOV = [
  { name: 'h', dim: ACTION },
  { name: 'nu', dim: FREQUENCY },
];

// ── de Broglie  λ = h / p ───────────────────────────────────────────────────
const DB_TARGET = { name: 'de-broglie-wavelength', dim: LENGTH };
const DB_GOV = [
  { name: 'h', dim: ACTION },
  { name: 'p', dim: MOMENTUM },
];

// ── Bohr radius  a₀ = 4π ε₀ ℏ² / (m_e e²) ───────────────────────────────────
const BOHR_TARGET = { name: 'bohr-radius', dim: LENGTH };
const BOHR_GOV = [
  { name: 'epsilon_0', dim: PERMITTIVITY },
  { name: 'hbar', dim: ACTION },
  { name: 'm_e', dim: MASS },
  { name: 'e', dim: CHARGE },
];

// ── Wien's displacement  λ_max = b / T ──────────────────────────────────────
const WIEN_TARGET = { name: 'peak-wavelength', dim: LENGTH };
const WIEN_GOV = [
  { name: 'b', dim: WIEN_B },
  { name: 'T', dim: dim(0, 0, 0, 0, 1) },
];

// ── Lorentz force magnitude  F = q v B ──────────────────────────────────────
const LORENTZ_TARGET = { name: 'lorentz-force', dim: FORCE };
const LORENTZ_GOV = [
  { name: 'q', dim: CHARGE },
  { name: 'v', dim: VELOCITY },
  { name: 'B', dim: MAGFIELD },
];

export const L1_QUANTUM_EM: readonly CanonicalEquation[] = [
  l1(COULOMB_TARGET, COULOMB_GOV, {
    id: 'CE-coulomb',
    name: "Coulomb's law",
    domain: 'electromagnetism',
    formula_latex: 'F = q_1 q_2/(4\\pi\\varepsilon_0 r^2)',
    epistemicStatus: 'fully-quantitative',
    scalarAst: op('/', [
      op('*', [sym('q_1', CHARGE), sym('q_2', CHARGE)]),
      op('*', [
        sym('4pi', DIMENSIONLESS),
        sym('epsilon_0', PERMITTIVITY),
        pow(sym('r', LENGTH), '2'),
      ]),
    ]),
    regime: { scale: 'classical', force: 'electromagnetic' },
    assumptions: ['point charges', 'vacuum', 'electrostatic'],
    references: ['Coulomb 1785'],
    partnerBridges: [],
  }),
  l1(PE_TARGET, PE_GOV, {
    id: 'CE-planck-einstein',
    name: 'Planck–Einstein relation',
    domain: 'quantum',
    formula_latex: 'E = h\\nu',
    epistemicStatus: 'fully-quantitative',
    scalarAst: op('*', [sym('h', ACTION), sym('nu', FREQUENCY)]),
    regime: { scale: 'quantum', force: 'electromagnetic' },
    assumptions: [],
    references: ['Planck 1900; Einstein 1905'],
    partnerBridges: [],
  }),
  l1(DB_TARGET, DB_GOV, {
    id: 'CE-de-broglie',
    name: 'de Broglie wavelength',
    domain: 'quantum',
    formula_latex: '\\lambda = h/p',
    epistemicStatus: 'fully-quantitative',
    scalarAst: op('/', [sym('h', ACTION), sym('p', MOMENTUM)]),
    regime: { scale: 'quantum' },
    assumptions: [],
    references: ['de Broglie 1924'],
    partnerBridges: [],
  }),
  l1(BOHR_TARGET, BOHR_GOV, {
    id: 'CE-bohr-radius',
    name: 'Bohr radius',
    domain: 'quantum',
    formula_latex: 'a_0 = 4\\pi\\varepsilon_0\\hbar^2/(m_e e^2)',
    epistemicStatus: 'fully-quantitative',
    scalarAst: op('/', [
      op('*', [
        sym('4pi', DIMENSIONLESS),
        sym('epsilon_0', PERMITTIVITY),
        pow(sym('hbar', ACTION), '2'),
      ]),
      op('*', [sym('m_e', MASS), pow(sym('e', CHARGE), '2')]),
    ]),
    regime: { scale: 'quantum', force: 'electromagnetic' },
    assumptions: ['hydrogen-like', 'non-relativistic'],
    references: ['Bohr 1913'],
    partnerBridges: [],
  }),
  l1(WIEN_TARGET, WIEN_GOV, {
    id: 'CE-wien',
    name: "Wien's displacement law",
    domain: 'thermodynamics',
    formula_latex: '\\lambda_{max} = b/T',
    epistemicStatus: 'fully-quantitative',
    scalarAst: op('/', [sym('b', WIEN_B), sym('T', dim(0, 0, 0, 0, 1))]),
    regime: { scale: 'classical', force: 'electromagnetic' },
    assumptions: ['blackbody', 'thermal equilibrium'],
    references: ['Wien 1893'],
    partnerBridges: [],
  }),
  l1(LORENTZ_TARGET, LORENTZ_GOV, {
    id: 'CE-lorentz-force',
    name: 'Lorentz force (magnitude)',
    domain: 'electromagnetism',
    formula_latex: 'F = q v B',
    epistemicStatus: 'fully-quantitative',
    scalarAst: op('*', [
      sym('q', CHARGE),
      sym('v', VELOCITY),
      sym('B', MAGFIELD),
    ]),
    regime: { scale: 'classical', force: 'electromagnetic' },
    assumptions: ['v ⟂ B (magnitude only)'],
    references: ['Lorentz 1895'],
    partnerBridges: [],
  }),
];
