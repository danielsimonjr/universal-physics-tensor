/**
 * Bridge Equation 47 — BBN Dark-Sector-Coupling Boltzmann ODE.
 *
 *   dY/dt + 3 H Y = ⟨σv⟩_SM n_p n_n − ⟨σv⟩_dark n_χ² ε_transfer
 *
 * Big Bang Nucleosynthesis number-density Boltzmann equation with a
 * dark-sector sink term. The base form (Hubble drag + SM source) is
 * canonical Kolb-Turner §5.2 Eq. 5.13–5.14 / Pitrou et al. 2018
 * Phys. Rep. 754:1 Eq. 2.5; the dark-sector coupling
 * `⟨σv⟩_dark n_χ² ε_transfer` is the unverified physics extension.
 *
 * Status: speculative (the SM base is canonical; the dark-sector term
 * is the conjectural part).
 *
 * Honest-claude scope notes:
 *   - Y is encoded as a number density [L^-3] so dY/dt has dim
 *     [L^-3 T^-1]. Each term in the equation reduces to [L^-3 T^-1]:
 *     ⟨σv⟩ has dim [L^3 T^-1] (cross-section × velocity); products of
 *     two number densities give [L^-6]; ⟨σv⟩ × density² = [L^-3 T^-1].
 *   - ε_transfer is dimensionless (transfer-efficiency).
 *   - We expose each term as a separate ExprNode (BBN_DARK_DYDT_TERM,
 *     BBN_DARK_HUBBLE_TERM, BBN_DARK_SM_TERM, BBN_DARK_DARK_TERM) so
 *     dimensional consistency can be tested per-term, not just on the
 *     reduced LHS/RHS.
 *
 * @module bridges/equations/be-47-bbn-dark-sector
 */

import type { ExprNode } from '../../dimensional/validator.js';
import { validate, validateEquation } from '../../dimensional/validator.js';
import {
  Dimension,
  DIMENSIONLESS,
  TIME,
  FREQUENCY,
} from '../../dimensional/types.js';

const sym = (name: string, dim: Dimension): ExprNode => ({ kind: 'symbol', name, dim });

/** Number density [L^-3]. */
const NUMBER_DENSITY: Dimension = {
  L: -3, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0,
};

/** Cross-section × velocity ⟨σv⟩ has dim [L^3 T^-1]. */
const SIGMAV: Dimension = {
  L: 3, M: 0, T: -1, I: 0, Theta: 0, N: 0, J: 0,
};

// --- Per-term ASTs ---

/** dY/dt — derivative of number density Y w.r.t. time. */
export const BBN_DARK_DYDT_TERM: ExprNode = {
  kind: 'derivative',
  of: sym('Y', NUMBER_DENSITY),
  wrt: sym('t', TIME),
};

/** 3 H Y — Hubble dilution drag (H is frequency [T^-1]). */
export const BBN_DARK_HUBBLE_TERM: ExprNode = {
  kind: 'op', op: '*',
  args: [
    sym('3', DIMENSIONLESS),
    sym('H', FREQUENCY),
    sym('Y', NUMBER_DENSITY),
  ],
};

/** ⟨σv⟩_SM · n_p · n_n — Standard Model two-body source. */
export const BBN_DARK_SM_TERM: ExprNode = {
  kind: 'op', op: '*',
  args: [
    sym('sigmav_SM', SIGMAV),
    sym('n_p', NUMBER_DENSITY),
    sym('n_n', NUMBER_DENSITY),
  ],
};

/** ⟨σv⟩_dark · n_χ² · ε_transfer — dark-sector sink. */
export const BBN_DARK_DARK_TERM: ExprNode = {
  kind: 'op', op: '*',
  args: [
    sym('sigmav_dark', SIGMAV),
    {
      kind: 'op', op: '^',
      args: [sym('n_chi', NUMBER_DENSITY), sym('2', DIMENSIONLESS)],
    },
    sym('eps_transfer', DIMENSIONLESS),
  ],
};

/** LHS: dY/dt + 3 H Y. */
export const BBN_DARK_LHS: ExprNode = {
  kind: 'op', op: '+',
  args: [BBN_DARK_DYDT_TERM, BBN_DARK_HUBBLE_TERM],
};

/** RHS: ⟨σv⟩_SM n_p n_n − ⟨σv⟩_dark n_χ² ε_transfer. */
export const BBN_DARK_RHS: ExprNode = {
  kind: 'op', op: '-',
  args: [BBN_DARK_SM_TERM, BBN_DARK_DARK_TERM],
};

// --- Numerical evaluator ---

export interface BBNDarkInputs {
  /** Hubble parameter H (s^-1). */
  H: number;
  /** Yield / number density Y (m^-3). */
  Y: number;
  /** ⟨σv⟩_SM (m^3/s). */
  sigmav_SM: number;
  /** Proton number density (m^-3). */
  n_p: number;
  /** Neutron number density (m^-3). */
  n_n: number;
  /** ⟨σv⟩_dark (m^3/s). */
  sigmav_dark: number;
  /** Dark species number density n_χ (m^-3). */
  n_chi: number;
  /** Dimensionless transfer efficiency ε. */
  eps_transfer: number;
}

/**
 * Evaluate dY/dt = ⟨σv⟩_SM n_p n_n − ⟨σv⟩_dark n_χ² ε − 3 H Y.
 *
 * @returns dY/dt in (m^-3 s^-1).
 */
export function evaluateBBNDark(input: BBNDarkInputs): number {
  const {
    H, Y,
    sigmav_SM, n_p, n_n,
    sigmav_dark, n_chi, eps_transfer,
  } = input;
  const inputs = [H, Y, sigmav_SM, n_p, n_n, sigmav_dark, n_chi, eps_transfer];
  for (const v of inputs) {
    if (!Number.isFinite(v)) {
      throw new RangeError(
        `evaluateBBNDark: all inputs must be finite, got ${JSON.stringify(input)}`,
      );
    }
  }
  const sm_source = sigmav_SM * n_p * n_n;
  const dark_sink = sigmav_dark * n_chi * n_chi * eps_transfer;
  const hubble_drag = 3 * H * Y;
  return sm_source - dark_sink - hubble_drag;
}

// --- Self-validation ---

export interface DimensionValidationReport {
  ok: boolean;
  lhsDim: Dimension | null;
  rhsDim: Dimension | null;
}

/**
 * Run the AST through the dimensional analyzer; both LHS and RHS
 * should be [L^-3 T^-1].
 */
export function validateBBNDarkDimensions(): DimensionValidationReport {
  const eq = validateEquation(BBN_DARK_LHS, BBN_DARK_RHS);
  const lhs = validate(BBN_DARK_LHS);
  const rhs = validate(BBN_DARK_RHS);
  return {
    ok: eq.ok,
    lhsDim: lhs.inferredDimension,
    rhsDim: rhs.inferredDimension,
  };
}
