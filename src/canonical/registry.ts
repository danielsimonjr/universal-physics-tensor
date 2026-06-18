/**
 * The canonical-equation registry — the queryable index of the L-layer.
 * Seeded incrementally by `entries/*` modules (Tasks 2,4,5,9); this file owns
 * the assembled array, the id map, and the accessors.
 *
 * @module canonical/registry
 */
import type { CanonicalEquation, CanonicalDomain } from './canonical-equation.js';
import { TIME, LENGTH, ACCELERATION } from '../dimensional/types.js';

/**
 * Seed entry (promoted from the dimensional-derivation benchmark). Further
 * entries are appended by the `entries/*` modules in later tasks.
 */
const CE_PENDULUM_PERIOD: CanonicalEquation = {
  id: 'CE-pendulum-period',
  name: 'Pendulum period',
  domain: 'mechanics',
  formula_latex: 'T = 2\\pi\\sqrt{L/g}',
  epistemicStatus: 'dimensional',
  freeDimensionlessGroups: 0,
  dimensional: {
    target: { name: 'period', dim: TIME },
    governing: [
      { name: 'length', dim: LENGTH },
      { name: 'gravity', dim: ACCELERATION },
    ],
    monomial: { length: 0.5, gravity: -0.5 },
  },
  regime: { scale: 'classical', force: 'gravitational' },
  assumptions: ['small-angle', 'point mass', 'rigid massless rod'],
  references: ['Any classical-mechanics text (e.g. Taylor, Classical Mechanics §1)'],
  partnerBridges: [],
};

/** Every canonical equation in the registry. */
export const CANONICAL_EQUATIONS: readonly CanonicalEquation[] = [
  CE_PENDULUM_PERIOD,
];

/** Id → entry. */
export const CANONICAL_BY_ID: Readonly<Record<string, CanonicalEquation>> =
  Object.fromEntries(CANONICAL_EQUATIONS.map((e) => [e.id, e]));

/** The entry with id `id`, or `undefined`. */
export function canonicalById(id: string): CanonicalEquation | undefined {
  return CANONICAL_BY_ID[id];
}

/** Every entry in `domain`. */
export function canonicalByDomain(
  domain: CanonicalDomain,
): readonly CanonicalEquation[] {
  return CANONICAL_EQUATIONS.filter((e) => e.domain === domain);
}
