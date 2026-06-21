/**
 * L1 (scalar-AST) canonical entries — assorted thermodynamic, nuclear, and
 * cosmological monomial laws the registry lacked: sensible heat capacity,
 * radioactive half-life, and the Hubble distance. L0 fields are engine-derived
 * (see `_l1-build`).
 *
 * Scope: generic dimensional MONOMIAL laws (Adam+Eve adversarial audit,
 * 2026-06-20). `domain` is the nearest `CanonicalDomain` arm (the enum has no
 * `nuclear`; radioactive decay → `quantum`). Skipped as degenerate:
 * radioactive-activity `A=λN` (N dimensionless ⇒ activity ≡ decay-constant) and
 * the Chandrasekhar mass (the (ℏc/G)/m_p² group is dimensionless ⇒
 * underdetermined). See docs/research/bridges-vs-canonical-map.md.
 *
 * @module canonical/entries/thermo-nuclear-cosmo
 */
import type { CanonicalEquation } from '../canonical-equation.js';
import { sym } from '../../bridges/equations/_be-helpers.js';
import {
  MASS,
  VELOCITY,
  ENERGY,
  LENGTH,
  TIME,
  FREQUENCY,
  TEMPERATURE,
} from '../../dimensional/types.js';
import { dim, op, pow, l1 } from './_l1-build.js';

const SPECIFIC_HEAT = dim(2, 0, -2, 0, -1); // [L² T⁻² Θ⁻¹] (J·kg⁻¹·K⁻¹)

export const THERMO_NUCLEAR_COSMO: readonly CanonicalEquation[] = [
  l1({ name: 'heat-energy', dim: ENERGY }, [
    { name: 'mass', dim: MASS },
    { name: 'specific-heat', dim: SPECIFIC_HEAT },
    { name: 'temperature-change', dim: TEMPERATURE },
  ], {
    id: 'CE-heat-capacity',
    name: 'Sensible heat (heat capacity)',
    domain: 'thermodynamics',
    formula_latex: 'Q = m c \\Delta T',
    epistemicStatus: 'fully-quantitative',
    scalarAst: op('*', [
      sym('mass', MASS),
      sym('specific-heat', SPECIFIC_HEAT),
      sym('temperature-change', TEMPERATURE),
    ]),
    regime: { scale: 'classical' },
    assumptions: ['no phase change', 'constant specific heat'],
    references: ['Standard thermodynamics'],
    partnerBridges: [],
  }),
  l1({ name: 'half-life', dim: TIME }, [
    { name: 'decay-constant', dim: FREQUENCY },
  ], {
    id: 'CE-half-life',
    name: 'Radioactive half-life',
    domain: 'quantum',
    formula_latex: 't_{1/2} = \\ln 2 / \\lambda',
    epistemicStatus: 'scalar-up-to-constant',
    scalarAst: pow(sym('decay-constant', FREQUENCY), '-1'),
    regime: { scale: 'quantum' },
    assumptions: ['first-order (exponential) decay'],
    references: ['Rutherford–Soddy 1902'],
    partnerBridges: [],
  }),
  l1({ name: 'hubble-distance', dim: LENGTH }, [
    { name: 'c', dim: VELOCITY },
    { name: 'hubble-rate', dim: FREQUENCY },
  ], {
    id: 'CE-hubble-distance',
    name: 'Hubble distance',
    domain: 'cosmology',
    formula_latex: 'D_H = c / H_0',
    epistemicStatus: 'fully-quantitative',
    scalarAst: op('/', [sym('c', VELOCITY), sym('hubble-rate', FREQUENCY)]),
    regime: { scale: 'cosmological' },
    assumptions: ['present-epoch Hubble parameter'],
    references: ['Hubble 1929'],
    partnerBridges: [],
  }),
];
