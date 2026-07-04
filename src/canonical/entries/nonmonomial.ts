/**
 * L1-sum tier — the FIRST canonical entries whose RHS is a genuine
 * NON-monomial: a sum (Bernoulli) and a transcendental (radioactive decay).
 * Dimensional analysis alone cannot pin either as a power-monomial (there are
 * several pressure-dimensioned terms in Bernoulli; a dimensionless factor in
 * decay), so the engine reports `monomial: null` with `freeDimensionlessGroups
 * >= 1` — the CLASSIC "dimensionally underdetermined" state that carries no
 * monomial. What makes these entries new is that the exact form IS known and is
 * carried in the `scalarAst` (so `epistemicStatus` reflects the known closed
 * form, not the dimensional under-determination). Built via `l1()` so the L0
 * fields are engine-derived and self-consistent (F1: monomial:null ⟺ freeGroups
 * >= 1) exactly like the existing underdetermined monomials (Newton F,
 * Bekenstein-Hawking).
 *
 * Value: these enrich the canonical *reference* with famous non-monomial laws
 * and are structurally scanned by `scanLinkages` / `upt recover` (normalForm is
 * sum- and transcendental-aware). A 2026-07-04 measurement found they produce
 * ZERO structural bridge matches today — the value is reference-completeness,
 * not bridge-validation (design + measurement:
 * docs/superpowers/specs/2026-07-04-l1-sum-tier-design.md).
 *
 * @module canonical/entries/nonmonomial
 */
import type { CanonicalEquation } from '../canonical-equation.js';
import { sym } from '../../bridges/equations/_be-helpers.js';
import { DIMENSIONLESS, TIME } from '../../dimensional/types.js';
import { dim, op, pow, l1 } from './_l1-build.js';

const PRESSURE = dim(-1, 1, -2, 0, 0);
const DENSITY = dim(-3, 1, 0, 0, 0);
const VELOCITY = dim(1, 0, -1, 0, 0);
const ACCELERATION = dim(1, 0, -2, 0, 0);
const HEIGHT = dim(1, 0, 0, 0, 0);
const DECAY_CONSTANT = dim(0, 0, -1, 0, 0);
const ENERGY = dim(2, 1, -2, 0, 0);
const PLANCK = dim(2, 1, -1, 0, 0);
const FREQUENCY = dim(0, 0, -1, 0, 0);
const TEMPERATURE = dim(0, 0, 0, 0, 1);
const BOLTZMANN = dim(2, 1, -2, 0, -1);

export const NONMONOMIAL: readonly CanonicalEquation[] = [
  l1(
    { name: 'bernoulli-total-pressure', dim: PRESSURE },
    [
      { name: 'density', dim: DENSITY },
      { name: 'flow-velocity', dim: VELOCITY },
      { name: 'gravitational-acceleration', dim: ACCELERATION },
      { name: 'height', dim: HEIGHT },
      { name: 'static-pressure', dim: PRESSURE },
    ],
    {
      id: 'CE-bernoulli',
      name: 'Bernoulli equation',
      domain: 'mechanics',
      formula_latex: '\\tfrac12 \\rho v^2 + \\rho g h + P = \\text{const}',
      epistemicStatus: 'scalar-up-to-constant', // exact form known; the ½ on the dynamic term is dropped
      scalarAst: op('+', [
        op('*', [sym('density', DENSITY), pow(sym('flow-velocity', VELOCITY), '2')]),
        op('*', [
          sym('density', DENSITY),
          op('*', [
            sym('gravitational-acceleration', ACCELERATION),
            sym('height', HEIGHT),
          ]),
        ]),
        sym('static-pressure', PRESSURE),
      ]),
      regime: { scale: 'classical' },
      assumptions: ['incompressible', 'inviscid', 'steady flow along a streamline'],
      references: ['Bernoulli 1738 Hydrodynamica'],
      partnerBridges: [],
    },
  ),
  l1(
    { name: 'remaining-nuclei', dim: DIMENSIONLESS },
    [
      { name: 'initial-nuclei', dim: DIMENSIONLESS },
      { name: 'decay-constant', dim: DECAY_CONSTANT },
      { name: 'elapsed-time', dim: TIME },
    ],
    {
      id: 'CE-radioactive-decay',
      name: 'Radioactive decay law',
      domain: 'quantum', // matches CE-half-life's domain
      formula_latex: 'N = N_0 e^{-\\lambda t}',
      epistemicStatus: 'fully-quantitative', // exact closed form (carried in scalarAst)
      // N0 · exp(−(λ·t)); the exp arg λt is dimensionless ([T⁻¹]·[T]); the unary
      // minus is the sym('-1', DIMENSIONLESS) multiplicative stub (be-34 idiom).
      scalarAst: op('*', [
        sym('initial-nuclei', DIMENSIONLESS),
        {
          kind: 'transcendental',
          fn: 'exp',
          arg: op('*', [
            sym('-1', DIMENSIONLESS),
            op('*', [sym('decay-constant', DECAY_CONSTANT), sym('elapsed-time', TIME)]),
          ]),
        },
      ]),
      regime: { scale: 'quantum' },
      assumptions: ['first-order decay', 'large-N statistical limit'],
      references: ['Rutherford & Soddy 1902'],
      partnerBridges: [],
    },
  ),
  l1(
    { name: 'photoelectron-max-energy', dim: ENERGY },
    [
      { name: 'planck-constant', dim: PLANCK },
      { name: 'photon-frequency', dim: FREQUENCY },
      { name: 'work-function', dim: ENERGY },
    ],
    {
      id: 'CE-photoelectric',
      name: 'Photoelectric equation',
      domain: 'quantum',
      formula_latex: 'K_{\\max} = h f - W',
      epistemicStatus: 'fully-quantitative', // exact: hf − W (both energy)
      scalarAst: op('-', [
        op('*', [sym('planck-constant', PLANCK), sym('photon-frequency', FREQUENCY)]),
        sym('work-function', ENERGY),
      ]),
      regime: { scale: 'quantum' },
      assumptions: ['single-photon absorption', 'above threshold (hf > W)'],
      references: ['Einstein 1905 Ann. Phys. 17:132'],
      partnerBridges: [],
    },
  ),
  l1(
    { name: 'carnot-efficiency', dim: DIMENSIONLESS },
    [
      { name: 'cold-reservoir-temperature', dim: TEMPERATURE },
      { name: 'hot-reservoir-temperature', dim: TEMPERATURE },
    ],
    {
      id: 'CE-carnot-efficiency',
      name: 'Carnot efficiency',
      domain: 'thermodynamics',
      formula_latex: '\\eta = 1 - \\tfrac{T_c}{T_h}',
      epistemicStatus: 'fully-quantitative', // exact: 1 − Tc/Th
      // 1 − Tc/Th; the leading 1 is a dimensionless literal stub.
      scalarAst: op('-', [
        sym('1', DIMENSIONLESS),
        op('/', [
          sym('cold-reservoir-temperature', TEMPERATURE),
          sym('hot-reservoir-temperature', TEMPERATURE),
        ]),
      ]),
      regime: { scale: 'classical' },
      assumptions: ['reversible cycle', 'two heat reservoirs'],
      references: ['Carnot 1824 Réflexions sur la puissance motrice du feu'],
      partnerBridges: [],
    },
  ),
  l1(
    { name: 'boltzmann-factor', dim: DIMENSIONLESS },
    [
      { name: 'state-energy', dim: ENERGY },
      { name: 'boltzmann-constant', dim: BOLTZMANN },
      { name: 'temperature', dim: TEMPERATURE },
    ],
    {
      id: 'CE-boltzmann-factor',
      name: 'Boltzmann factor',
      domain: 'statistical',
      formula_latex: 'e^{-E/k_B T}',
      epistemicStatus: 'fully-quantitative', // exact closed form
      // exp(−E/(kB·T)); the arg −E/(kB T) is dimensionless (energy/energy).
      scalarAst: {
        kind: 'transcendental',
        fn: 'exp',
        arg: op('*', [
          sym('-1', DIMENSIONLESS),
          op('/', [
            sym('state-energy', ENERGY),
            op('*', [sym('boltzmann-constant', BOLTZMANN), sym('temperature', TEMPERATURE)]),
          ]),
        ]),
      },
      regime: { scale: 'classical' },
      assumptions: ['canonical ensemble', 'thermal equilibrium'],
      references: ['Boltzmann 1868 Wien. Ber. 58:517'],
      partnerBridges: [],
    },
  ),
];
