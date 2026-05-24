/**
 * Bridge Equation 23 — Strange-Metal / Black-Hole duality (SYK
 * Planckian dissipation, post Wave P-C R-C1 reformulation + Wave Q
 * A1 m* dimensional fix).
 *
 *   ρ(T) = ρ_0 + (m* · k_B T) / (n_e · e² · ℏ) · α_SYK
 *
 * Resistivity SI dim:
 *   - Ω = V/A = J/(C·A) = (kg·m²/s²)/(s·A·A) = kg·m²/(s³·A²)
 *   - Ω·m = kg·m³/(s³·A²)  ≡  [L³ M T⁻³ I⁻²]
 *
 * The thermal term is the canonical Planckian-dissipation linear-in-T
 * resistivity: τ ~ ℏ/(k_B T) sets the relaxation rate, m* is the
 * carrier effective mass, n_e the carrier density, e the elementary
 * charge, and α_SYK is a dimensionless O(1) Sachdev-Ye-Kitaev
 * coefficient. The Wave Q A1 fix added the missing m* prefactor that
 * the prior Wave P-C R-C1 form was missing — without it, the SI
 * dimension was m³/(s·C²) instead of Ω·m = kg·m³/(s·C²).
 *
 * References:
 *   - Sachdev-Ye 1993 *Phys. Rev. Lett.* 70:3339 (original SY model);
 *   - Kitaev 2015 KITP (canonical SYK formulation);
 *   - Maldacena-Stanford 2016 *Phys. Rev. D* 94:106002
 *     (arXiv:1604.07818; emergent SL(2,R) symmetry, MSS chaos bound);
 *   - Hartnoll 2015 *Nature Phys.* 11:54 (review of strange-metal
 *     Planckian dissipation);
 *   - Bruin et al. 2013 *Science* 339:804; Legros et al. 2019 *Nature
 *     Phys.* 15:142 (empirical confirmation).
 *
 * Status: speculative.
 *
 * Honest-claude scope notes:
 *   - The Planckian linear-in-T resistivity is canonical phenomenology;
 *     the *bridge framing* (treating the SYK Planckian rate as a UPT
 *     condensed-matter ↔ holography duality, with α_SYK bundled rather
 *     than derived) is the speculative content.
 *   - α_SYK depends on the SYK-q variant (q=4 most studied); UPT does
 *     not commit to a specific q-value.
 *   - The lemma ExprNode `BE23_SYK_THERMAL_TERM` exposes the
 *     `(m* k_B T)/(n_e e² ℏ)` factor directly so the Wave Q A1 m*
 *     prefactor fix is testable in isolation.
 *
 * @see docs/specification/Part-II.md ("Bridge Equation 23: Strange-Metal / Black-Hole Duality")
 * @see src/bridges/index.ts BRIDGE_EQUATIONS.find(e => e.id === 23)
 * @module bridges/equations/be-23-syk-planckian
 */

import type { ExprNode, DimensionValidationReport } from '../../dimensional/validator.js';
import { validate, validateEquation } from '../../dimensional/validator.js';
import {
  Dimension,
  DIMENSIONLESS,
  LENGTH,
  MASS,
  TEMPERATURE,
} from '../../dimensional/types.js';
import { multiply, power } from '../../dimensional/algebra.js';
import {
  hbar as DIM_hbar,
  k_B as DIM_kB,
  e as DIM_e,
} from '../../dimensional/constants.js';
import { PhysicalConstants } from '../../core/types.js';

const sym = (name: string, dim: Dimension): ExprNode => ({ kind: 'symbol', name, dim });

/** [L^-3] — number-density dimension for n_e. */
const NUMBER_DENSITY: Dimension = power(LENGTH, -3);

/** [L³ M T⁻³ I⁻²] — resistivity (Ω·m). */
const RESISTIVITY: Dimension = {
  L: 3, M: 1, T: -3, I: -2, Theta: 0, N: 0, J: 0,
};

/**
 * Lemma AST: the Planckian thermal term `(m* · k_B T) / (n_e · e² · ℏ)`.
 *
 * Should infer to RESISTIVITY = [L³ M T⁻³ I⁻²]. Exposed for the
 * lemma test that verifies the m* prefactor restores correct
 * resistivity dimensions (Wave Q A1 fix).
 */
export const BE23_SYK_THERMAL_TERM: ExprNode = {
  kind: 'op', op: '/',
  args: [
    {
      // numerator: m* · k_B · T
      kind: 'op', op: '*',
      args: [
        sym('m_star', MASS),
        sym('k_B', DIM_kB),
        sym('T', TEMPERATURE),
      ],
    },
    {
      // denominator: n_e · e² · ℏ
      kind: 'op', op: '*',
      args: [
        sym('n_e', NUMBER_DENSITY),
        {
          kind: 'op', op: '^',
          args: [sym('e', DIM_e), sym('2', DIMENSIONLESS)],
        },
        sym('hbar', DIM_hbar),
      ],
    },
  ],
};

/**
 * RHS of `ρ(T) = ρ_0 + (m* k_B T)/(n_e e² ℏ) · α_SYK`.
 *
 * Both ρ_0 and the thermal term must have dim [L³ M T⁻³ I⁻²].
 */
export const BE23_SYK_RESISTIVITY_RHS: ExprNode = {
  kind: 'op', op: '+',
  args: [
    sym('rho_0', RESISTIVITY),
    {
      kind: 'op', op: '*',
      args: [
        BE23_SYK_THERMAL_TERM,
        sym('alpha_SYK', DIMENSIONLESS),
      ],
    },
  ],
};

/** LHS: ρ(T) has dimension [L³ M T⁻³ I⁻²] (Ω·m). */
/** @internal */
export const BE23_SYK_RESISTIVITY_LHS: ExprNode = sym('rho', RESISTIVITY);

// --- Numerical evaluator ---

/**
 * @internal — typed-arg shape for the file-local `evaluateSYKResistivity` function; not in the v0.7 public surface. See `docs/architecture/v0.7-be-module-exports-audit.md` §4.
 */
interface SYKResistivityInputs {
  /** Residual resistivity ρ_0 (Ω·m). Must be ≥ 0 and finite. */
  rho_0: number;
  /** Carrier effective mass m* (kg). Must be > 0 and finite. */
  m_star_kg: number;
  /** Carrier number density n_e (m⁻³). Must be > 0 and finite. */
  n_e_per_m3: number;
  /** Temperature T (K). Must be ≥ 0 and finite. */
  T_K: number;
  /** Dimensionless SYK coefficient α_SYK (typically O(1)). Must be finite. */
  alpha_SYK: number;
}

/**
 * Evaluate the Planckian-dissipation resistivity
 *
 *   ρ(T) = ρ_0 + (m* · k_B T) / (n_e · e² · ℏ) · α_SYK
 *
 * @returns Resistivity in Ω·m (SI).
 */
export function evaluateSYKResistivity(input: SYKResistivityInputs): number {
  const { rho_0, m_star_kg, n_e_per_m3, T_K, alpha_SYK } = input;
  if (!Number.isFinite(rho_0) || rho_0 < 0) {
    throw new RangeError(
      `evaluateSYKResistivity: rho_0 must be a finite non-negative number, got ${rho_0}`,
    );
  }
  if (!Number.isFinite(m_star_kg) || m_star_kg <= 0) {
    throw new RangeError(
      `evaluateSYKResistivity: m_star_kg must be a finite positive number, got ${m_star_kg}`,
    );
  }
  if (!Number.isFinite(n_e_per_m3) || n_e_per_m3 <= 0) {
    throw new RangeError(
      `evaluateSYKResistivity: n_e_per_m3 must be a finite positive number, got ${n_e_per_m3}`,
    );
  }
  if (!Number.isFinite(T_K) || T_K < 0) {
    throw new RangeError(
      `evaluateSYKResistivity: T_K must be a finite non-negative number, got ${T_K}`,
    );
  }
  if (!Number.isFinite(alpha_SYK)) {
    throw new RangeError(
      `evaluateSYKResistivity: alpha_SYK must be finite, got ${alpha_SYK}`,
    );
  }
  const { hbar, kB, e } = PhysicalConstants;
  const thermal = (m_star_kg * kB * T_K) / (n_e_per_m3 * e * e * hbar);
  return rho_0 + thermal * alpha_SYK;
}

// --- Self-validation ---

/**
 * Run the AST through the dimensional analyzer; both sides should be
 * resistivity ([L³ M T⁻³ I⁻²]).
 */
/** @internal */
export function validateBE23Dimensions(): DimensionValidationReport {
  const eq = validateEquation(BE23_SYK_RESISTIVITY_LHS, BE23_SYK_RESISTIVITY_RHS);
  const lhs = validate(BE23_SYK_RESISTIVITY_LHS);
  const rhs = validate(BE23_SYK_RESISTIVITY_RHS);
  return {
    ok: eq.ok,
    lhsDim: lhs.inferredDimension,
    rhsDim: rhs.inferredDimension,
  };
}
