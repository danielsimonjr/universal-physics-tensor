/**
 * L1 (scalar-AST) canonical entries — atomic-scale derived constants. The
 * Rydberg energy, the classical electron radius, and the Bohr magneton: monomial
 * combinations of fundamental constants (e, ℏ, ε₀, m_e, c), the same character
 * as the existing Bohr radius and Planck units. L0 fields are engine-derived
 * (see `_l1-build`).
 *
 * Scope: generic dimensional MONOMIAL laws (Adam+Eve adversarial audit,
 * 2026-06-20). Leading numeric/geometric prefactors (½, 4π, 8) are recorded via
 * `scalar-up-to-constant`. The fine-structure constant α (dimensionless-only) is
 * out of scope. See docs/research/bridges-vs-canonical-map.md.
 *
 * @module canonical/entries/atomic
 */
import type { CanonicalEquation } from '../canonical-equation.js';
import { sym } from '../../bridges/equations/_be-helpers.js';
import { MASS, VELOCITY, ENERGY, LENGTH, ACTION, CHARGE } from '../../dimensional/types.js';
import { dim, op, pow, l1 } from './_l1-build.js';

const PERMITTIVITY = dim(-3, -1, 4, 2); // ε₀ [L⁻³ M⁻¹ T⁴ I²]
const MAGNETIC_MOMENT = dim(2, 0, 0, 1); // [L² I] (A·m²)

export const ATOMIC: readonly CanonicalEquation[] = [
  l1({ name: 'rydberg-energy', dim: ENERGY }, [
    { name: 'm_e', dim: MASS },
    { name: 'e', dim: CHARGE },
    { name: 'epsilon_0', dim: PERMITTIVITY },
    { name: 'hbar', dim: ACTION },
  ], {
    id: 'CE-rydberg-energy',
    name: 'Rydberg energy',
    domain: 'quantum',
    formula_latex: 'E_R = m_e e^4 / (8 \\varepsilon_0^2 \\hbar^2)',
    epistemicStatus: 'scalar-up-to-constant',
    scalarAst: op('/', [
      op('*', [sym('m_e', MASS), pow(sym('e', CHARGE), '4')]),
      op('*', [pow(sym('epsilon_0', PERMITTIVITY), '2'), pow(sym('hbar', ACTION), '2')]),
    ]),
    regime: { scale: 'quantum', force: 'electromagnetic' },
    assumptions: ['hydrogen-like', 'non-relativistic'],
    references: ['Rydberg 1888; Bohr 1913'],
    partnerBridges: [],
  }),
  l1({ name: 'classical-electron-radius', dim: LENGTH }, [
    { name: 'e', dim: CHARGE },
    { name: 'epsilon_0', dim: PERMITTIVITY },
    { name: 'm_e', dim: MASS },
    { name: 'c', dim: VELOCITY },
  ], {
    id: 'CE-classical-electron-radius',
    name: 'Classical electron radius',
    domain: 'quantum',
    formula_latex: 'r_e = e^2 / (4\\pi \\varepsilon_0 m_e c^2)',
    epistemicStatus: 'scalar-up-to-constant',
    scalarAst: op('/', [
      pow(sym('e', CHARGE), '2'),
      op('*', [
        sym('epsilon_0', PERMITTIVITY),
        sym('m_e', MASS),
        pow(sym('c', VELOCITY), '2'),
      ]),
    ]),
    regime: { scale: 'quantum', force: 'electromagnetic' },
    assumptions: ['classical point-charge self-energy scale'],
    references: ['Lorentz; Thomson scattering'],
    partnerBridges: [],
  }),
  l1({ name: 'bohr-magneton', dim: MAGNETIC_MOMENT }, [
    { name: 'e', dim: CHARGE },
    { name: 'hbar', dim: ACTION },
    { name: 'm_e', dim: MASS },
  ], {
    id: 'CE-bohr-magneton',
    name: 'Bohr magneton',
    domain: 'quantum',
    formula_latex: '\\mu_B = e \\hbar / (2 m_e)',
    epistemicStatus: 'scalar-up-to-constant',
    scalarAst: op('/', [
      op('*', [sym('e', CHARGE), sym('hbar', ACTION)]),
      sym('m_e', MASS),
    ]),
    regime: { scale: 'quantum', force: 'electromagnetic' },
    assumptions: ['electron magnetic-moment scale'],
    references: ['Bohr 1913; Pauli 1920'],
    partnerBridges: [],
  }),
];
