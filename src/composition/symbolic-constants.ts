/**
 * Symbolic-composition constant registry (v0.12 symbolic composition).
 *
 * The physical constants and named numeric factors that a bridge's
 * `symbolic` ExprNode may reference as leaf symbols, with the SI value AND
 * the SI dimension. SI VALUES import from `core/constants.js` — the single
 * source the bridge evaluators also resolve to — so a symbolic form and its
 * numeric evaluator agree bit-for-bit (the drift guard binds this end-to-end;
 * Adam A-7 / Eve EVE-3).
 *
 * Numeric-literal leaves (`'2'`, `'3'`) are NOT registered here — `evalExpr`
 * resolves them via `Number(name)` and they are implicitly dimensionless.
 * Non-base-10 tokens (`'8pi'`, `'4pi'`, `'ln2'`) MUST be here (Adam A-1 —
 * `Number('8pi')` is `NaN`).
 *
 * INTERNAL — not on the public surface.
 *
 * @module composition/symbolic-constants
 */

import type { Dimension } from '../dimensional/types.js';
import {
  DIMENSIONLESS,
  VELOCITY,
  ACTION,
} from '../dimensional/types.js';
import { C_SI, G_SI, HBAR_SI, H_SI, K_B_SI, B_WIEN_SI } from '../core/constants.js';

const dim = (L = 0, M = 0, T = 0, Theta = 0): Dimension => ({
  L,
  M,
  T,
  I: 0,
  Theta,
  N: 0,
  J: 0,
});

/** Newton's constant G — [L³ M⁻¹ T⁻²]. */
const GRAV: Dimension = dim(3, -1, -2);
/** Boltzmann constant k_B — [L² M T⁻² Θ⁻¹] (energy / temperature). */
const BOLTZMANN: Dimension = dim(2, 1, -2, -1);
/** Vacuum permittivity ε₀ — [I² T⁴ M⁻¹ L⁻³] (F/m). Carries a current
 *  dimension, so it cannot use the (L,M,T,Θ) `dim` helper. */
const PERMITTIVITY: Dimension = { L: -3, M: -1, T: 4, I: 2, Theta: 0, N: 0, J: 0 };
/** Stefan–Boltzmann σ — [M T⁻³ Θ⁻⁴] (W m⁻² K⁻⁴). Derived:
 *  σ = 2π⁵k_B⁴ / (15 c² h³). */
const STEFAN_BOLTZMANN: Dimension = dim(0, 1, -3, -4);
/** Wien displacement constant b — [L·Θ] (m·K). */
const WIEN: Dimension = dim(1, 0, 0, 1);

/** A registered constant leaf: SI value + SI dimension. */
export interface NamedConstantValue {
  readonly value: number;
  readonly dim: Dimension;
}

/**
 * Constant leaves a `symbolic` ExprNode may reference. Keys are the leaf
 * symbol `name`s; values carry the SI magnitude and dimension. `ln2`/`8pi`/
 * `4pi` reproduce the evaluators' `Math.LN2` / `8*Math.PI` / `4*Math.PI`
 * exactly (same IEEE-754 primitives).
 */
export const CONSTANTS: Readonly<Record<string, NamedConstantValue>> = {
  hbar: { value: HBAR_SI, dim: ACTION },
  h: { value: H_SI, dim: ACTION },
  c: { value: C_SI, dim: VELOCITY },
  G: { value: G_SI, dim: GRAV },
  k_B: { value: K_B_SI, dim: BOLTZMANN },
  ln2: { value: Math.LN2, dim: DIMENSIONLESS },
  '8pi': { value: 8 * Math.PI, dim: DIMENSIONLESS },
  '4pi': { value: 4 * Math.PI, dim: DIMENSIONLESS },
  '2pi': { value: 2 * Math.PI, dim: DIMENSIONLESS },
  // Extension constants for the canonical-equation L1 entries (Coulomb, Bohr,
  // Stefan–Boltzmann). CODATA 2018 values.
  epsilon_0: { value: 8.8541878128e-12, dim: PERMITTIVITY },
  sigma_sb: { value: 5.670374419e-8, dim: STEFAN_BOLTZMANN },
  b: { value: B_WIEN_SI, dim: WIEN },
};
