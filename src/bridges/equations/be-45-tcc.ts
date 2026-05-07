/**
 * Bridge Equation 45 — Trans-Planckian Censorship Conjecture (TCC) bound
 * on inflationary e-folds (Bedroya-Vafa 2019 + γ-extension).
 *
 *   N_e_max = log(M_P / H_inf) - γ · log(r / 0.01)
 *
 * N_e_max is the maximum number of inflationary e-folds before
 * trans-Planckian modes become observable. The canonical Bedroya-Vafa
 * bound (arXiv:1909.11063) is just `N_e < ln(M_P/H_inf)`; the
 * `-γ log(r/0.01)` term is an extension original to this framework
 * (no published derivation).
 *
 * **Natural-units convention (honest-claude resolution).** The log
 * argument `M_P/H_inf` requires that ratio to be dimensionless. In
 * natural units (ℏ = c = 1) both M_P and H_inf are energies, so the
 * ratio is dimensionless ✓. In SI, M_P has [mass] and H_inf has [1/T];
 * the ratio is `[kg·s]` which is NOT dimensionless. The TCC literature
 * works in natural units throughout (Bedroya-Vafa 2019; also the
 * convention BE-39 asymptotic-safety and BE-40 composite-Higgs use).
 * This module pins natural units explicitly: M_P and H_inf are both
 * encoded as ENERGY symbols, and the numerical evaluator takes them
 * in GeV with the user responsible for converting H_inf to its
 * energy-equivalent (E_inf = ℏ H_inf in SI, or H_inf-in-GeV directly
 * in natural units).
 *
 * **Dimensionless-stub pattern for log.** The AST has no `log`
 * primitive. Following the same pattern as BE-26's exp(-WKB) and
 * BE-41's exp(...), we encode `log(M_P/H_inf)` and `log(r/0.01)` as
 * dimensionless symbol stubs, and expose the TWO log arguments as
 * separate ExprNodes (`BE45_LOG_RATIO_ARG_MP_HINF` and
 * `BE45_LOG_RATIO_ARG_R`) so the lemma tests can verify each argument
 * is dimensionless.
 *
 * Bracket-checks (numerical evaluator computes the TCC bound directly):
 *   - M_P = 1.22e19 GeV, H_inf = 1e14 GeV (GUT-scale), r = 0.01:
 *     N_e_max = log(1.22e5) ≈ 11.71 (12 e-folds) — TCC's typical
 *     observation window;
 *   - N_e_max increases as M_P/H_inf increases (lower-energy
 *     inflation allows more e-folds);
 *   - N_e_max decreases as γ·log(r/0.01) increases.
 *
 * References:
 *   - Bedroya & Vafa 2019 (arXiv:1909.11063; canonical TCC statement);
 *   - Bedroya, Brandenberger, Loverde, Vafa 2020 *Phys. Rev. D* 101:103502
 *     (arXiv:1909.11063 follow-up; observational implications).
 *
 * Status: speculative.
 *
 * Honest-claude scope notes:
 *   - The base Bedroya-Vafa bound `N_e < ln(M_P/H_inf)` is the
 *     canonical content; the `-γ log(r/0.01)` extension is original
 *     to this framework, with no published derivation. γ is
 *     dimensionless O(1) (treated as a free parameter here).
 *   - Natural units are pinned by convention; the SI equivalent
 *     would require re-deriving the relation with explicit ℏ, c
 *     factors. This is documented but not implemented.
 *
 * @see docs/specification/Part-II.md ("Bridge Equation 45: Trans-Planckian Censorship Constraint")
 * @see src/bridges/index.ts BRIDGE_EQUATIONS.find(e => e.id === 45)
 * @module bridges/equations/be-45-tcc
 */

import type { ExprNode, DimensionValidationReport } from '../../dimensional/validator.js';
import { validate, validateEquation } from '../../dimensional/validator.js';
import {
  Dimension,
  DIMENSIONLESS,
  ENERGY,
} from '../../dimensional/types.js';

const sym = (name: string, dim: Dimension): ExprNode => ({ kind: 'symbol', name, dim });

/**
 * Lemma AST: the M_P/H_inf log argument (natural-units convention,
 * both quantities as ENERGY).
 *
 * Exposed for the lemma test that verifies the argument is
 * dimensionless (per the dimensionless-stub convention; see
 * `src/dimensional/README.md` "Encoding transcendental functions").
 */
export const BE45_LOG_RATIO_ARG_MP_HINF: ExprNode = {
  kind: 'op', op: '/',
  args: [
    sym('M_P', ENERGY),
    sym('H_inf', ENERGY), // natural units: ℏ H_inf has dim [energy]
  ],
};

/**
 * Lemma AST: the r/0.01 log argument (both quantities dimensionless).
 *
 * r is the tensor-to-scalar ratio (dimensionless); 0.01 is the
 * dimensionless reference value used in the γ-correction term.
 */
export const BE45_LOG_RATIO_ARG_R: ExprNode = {
  kind: 'op', op: '/',
  args: [
    sym('r', DIMENSIONLESS),
    sym('0.01', DIMENSIONLESS),
  ],
};

/**
 * RHS of the TCC bound:
 *   log(M_P/H_inf) - γ · log(r/0.01)
 *
 * Both `log_MP_Hinf` and `log_r_ratio` are encoded as dimensionless
 * symbol stubs (the AST has no `log` primitive). The arguments are
 * verified dimensionless via `BE45_LOG_RATIO_ARG_MP_HINF` and
 * `BE45_LOG_RATIO_ARG_R`. γ is dimensionless O(1).
 */
export const BE45_TCC_RHS: ExprNode = {
  kind: 'op', op: '-',
  args: [
    sym('log(M_P/H_inf)', DIMENSIONLESS),
    {
      kind: 'op', op: '*',
      args: [
        sym('gamma', DIMENSIONLESS),
        sym('log(r/0.01)', DIMENSIONLESS),
      ],
    },
  ],
};

/** LHS: N_e_max is dimensionless (number of e-folds = log of expansion factor). */
export const BE45_TCC_LHS: ExprNode = sym('N_e_max', DIMENSIONLESS);

// --- Numerical evaluator ---

export interface TCCInputs {
  /** Planck mass M_P in GeV (canonical: 1.22e19). Must be > 0 and finite. */
  M_P_GeV: number;
  /** Inflationary Hubble scale H_inf in GeV-equivalent energy units (natural units, ℏH_inf or H_inf-in-GeV directly). Must be > 0 and finite. */
  H_inf_GeV: number;
  /** Tensor-to-scalar ratio r (dimensionless). Must be > 0 and finite. */
  r: number;
  /** Dimensionless O(1) coefficient γ for the framework-original correction. Must be finite. */
  gamma: number;
}

/**
 * Evaluate the TCC bound on inflationary e-folds (natural log):
 *
 *   N_e_max = ln(M_P/H_inf) - γ · ln(r/0.01)
 *
 * Natural log convention follows Bedroya-Vafa 2019.
 *
 * @returns Dimensionless maximum number of e-folds.
 */
export function evaluateTCC(input: TCCInputs): number {
  const { M_P_GeV, H_inf_GeV, r, gamma } = input;
  if (!Number.isFinite(M_P_GeV) || M_P_GeV <= 0) {
    throw new RangeError(
      `evaluateTCC: M_P_GeV must be a finite positive number, got ${M_P_GeV}`,
    );
  }
  if (!Number.isFinite(H_inf_GeV) || H_inf_GeV <= 0) {
    throw new RangeError(
      `evaluateTCC: H_inf_GeV must be a finite positive number, got ${H_inf_GeV}`,
    );
  }
  if (!Number.isFinite(r) || r <= 0) {
    throw new RangeError(
      `evaluateTCC: r must be a finite positive number, got ${r}`,
    );
  }
  if (!Number.isFinite(gamma)) {
    throw new RangeError(
      `evaluateTCC: gamma must be finite, got ${gamma}`,
    );
  }
  return Math.log(M_P_GeV / H_inf_GeV) - gamma * Math.log(r / 0.01);
}

// --- Self-validation ---

/**
 * Run the AST through the dimensional analyzer; both sides should be
 * dimensionless.
 */
export function validateBE45Dimensions(): DimensionValidationReport {
  const eq = validateEquation(BE45_TCC_LHS, BE45_TCC_RHS);
  const lhs = validate(BE45_TCC_LHS);
  const rhs = validate(BE45_TCC_RHS);
  return {
    ok: eq.ok,
    lhsDim: lhs.inferredDimension,
    rhsDim: rhs.inferredDimension,
  };
}
