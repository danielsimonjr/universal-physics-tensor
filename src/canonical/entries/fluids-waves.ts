/**
 * L1 (scalar-AST) canonical entries — fluids & waves (classical mechanics).
 * Hydrostatic pressure, the pressure and density definitions, buoyancy, Stokes
 * drag, the wave relation v = fλ, and the fluid sound speed. L0 fields are
 * engine-derived (see `_l1-build`).
 *
 * Scope: generic dimensional MONOMIAL laws (Adam+Eve adversarial audit,
 * 2026-06-20). `domain: 'mechanics'` — the `CanonicalDomain` enum has no
 * `fluids`/`waves` arm, and these are classical-mechanics laws. The sound-speed
 * √-law is `dimensional` (the dimensionless adiabatic index γ is a leading
 * constant, not a governing quantity). Navier–Stokes (a PDE) is out of scope.
 * See docs/research/bridges-vs-canonical-map.md.
 *
 * @module canonical/entries/fluids-waves
 */
import type { CanonicalEquation } from '../canonical-equation.js';
import { sym } from '../../bridges/equations/_be-helpers.js';
import {
  MASS,
  VELOCITY,
  ACCELERATION,
  FORCE,
  LENGTH,
  AREA,
  FREQUENCY,
} from '../../dimensional/types.js';
import { dim, op, l1 } from './_l1-build.js';

const PRESSURE = dim(-1, 1, -2); // pascal [M L⁻¹ T⁻²]
const DENSITY = dim(-3, 1, 0); // [M L⁻³]
const VOLUME = dim(3, 0, 0); // [L³]
const VISCOSITY = dim(-1, 1, -1); // dynamic viscosity, Pa·s [M L⁻¹ T⁻¹]

export const FLUIDS_WAVES: readonly CanonicalEquation[] = [
  l1({ name: 'pressure', dim: PRESSURE }, [
    { name: 'density', dim: DENSITY },
    { name: 'g', dim: ACCELERATION },
    { name: 'height', dim: LENGTH },
  ], {
    id: 'CE-hydrostatic-pressure',
    name: 'Hydrostatic pressure',
    domain: 'mechanics',
    formula_latex: 'P = \\rho g h',
    epistemicStatus: 'fully-quantitative',
    scalarAst: op('*', [
      sym('density', DENSITY),
      sym('g', ACCELERATION),
      sym('height', LENGTH),
    ]),
    regime: { scale: 'classical', force: 'gravitational' },
    assumptions: ['incompressible fluid', 'uniform gravity'],
    references: ['Pascal 1647'],
    partnerBridges: [],
  }),
  l1({ name: 'pressure', dim: PRESSURE }, [
    { name: 'force', dim: FORCE },
    { name: 'area', dim: AREA },
  ], {
    id: 'CE-pressure-definition',
    name: 'Pressure (force per area)',
    domain: 'mechanics',
    formula_latex: 'P = F / A',
    epistemicStatus: 'fully-quantitative',
    scalarAst: op('/', [sym('force', FORCE), sym('area', AREA)]),
    regime: { scale: 'classical' },
    assumptions: ['force normal to surface'],
    references: ['Standard mechanics'],
    partnerBridges: [],
  }),
  l1({ name: 'density', dim: DENSITY }, [
    { name: 'mass', dim: MASS },
    { name: 'volume', dim: VOLUME },
  ], {
    id: 'CE-density-definition',
    name: 'Mass density',
    domain: 'mechanics',
    formula_latex: '\\rho = m / V',
    epistemicStatus: 'fully-quantitative',
    scalarAst: op('/', [sym('mass', MASS), sym('volume', VOLUME)]),
    regime: { scale: 'classical' },
    assumptions: ['uniform body'],
    references: ['Standard mechanics'],
    partnerBridges: [],
  }),
  l1({ name: 'force', dim: FORCE }, [
    { name: 'density', dim: DENSITY },
    { name: 'volume', dim: VOLUME },
    { name: 'g', dim: ACCELERATION },
  ], {
    id: 'CE-buoyant-force',
    name: "Buoyant force (Archimedes')",
    domain: 'mechanics',
    formula_latex: 'F_b = \\rho V g',
    epistemicStatus: 'fully-quantitative',
    scalarAst: op('*', [
      sym('density', DENSITY),
      sym('volume', VOLUME),
      sym('g', ACCELERATION),
    ]),
    regime: { scale: 'classical', force: 'gravitational' },
    assumptions: ['fully submerged', 'static fluid'],
    references: ['Archimedes, On Floating Bodies'],
    partnerBridges: [],
  }),
  l1({ name: 'force', dim: FORCE }, [
    { name: 'viscosity', dim: VISCOSITY },
    { name: 'radius', dim: LENGTH },
    { name: 'speed', dim: VELOCITY },
  ], {
    id: 'CE-stokes-drag',
    name: "Stokes' drag",
    domain: 'mechanics',
    formula_latex: 'F_d = 6\\pi \\eta r v',
    epistemicStatus: 'scalar-up-to-constant',
    scalarAst: op('*', [
      sym('viscosity', VISCOSITY),
      sym('radius', LENGTH),
      sym('speed', VELOCITY),
    ]),
    regime: { scale: 'classical', force: 'emergent' },
    assumptions: ['low Reynolds number', 'rigid sphere'],
    references: ['Stokes 1851'],
    partnerBridges: [],
  }),
  l1({ name: 'speed', dim: VELOCITY }, [
    { name: 'frequency', dim: FREQUENCY },
    { name: 'wavelength', dim: LENGTH },
  ], {
    id: 'CE-wave-speed',
    name: 'Wave relation (v = fλ)',
    domain: 'mechanics',
    formula_latex: 'v = f \\lambda',
    epistemicStatus: 'fully-quantitative',
    scalarAst: op('*', [sym('frequency', FREQUENCY), sym('wavelength', LENGTH)]),
    regime: { scale: 'classical' },
    assumptions: ['single propagating mode'],
    references: ['Standard wave mechanics'],
    partnerBridges: [],
  }),
  // ── sound speed (√-law: dimensional-only; γ is a dimensionless leading const)
  l1({ name: 'speed', dim: VELOCITY }, [
    { name: 'pressure', dim: PRESSURE },
    { name: 'density', dim: DENSITY },
  ], {
    id: 'CE-sound-speed',
    name: 'Speed of sound in a fluid',
    domain: 'mechanics',
    formula_latex: 'c = \\sqrt{\\gamma P / \\rho}',
    epistemicStatus: 'dimensional',
    regime: { scale: 'classical' },
    assumptions: ['adiabatic', 'ideal fluid (γ dimensionless)'],
    references: ['Newton–Laplace'],
    partnerBridges: [],
  }),
];
