/**
 * Bridge-index integration scaffold.
 *
 * The 40 bridges in `src/bridges/index.ts` carry `formula_latex` strings
 * but only a handful (BE-11, BE-14 today) have a machine-evaluable AST.
 * The encoding is Tier 5 work, one bridge at a time.
 *
 * `inferDimensionForBridge(id, expr)` runs `validate()` on the AST. If
 * the supplied `id` is registered in `EXPECTED_DIMENSION_BY_BRIDGE`, the
 * inferred dim is also cross-checked against the expected one — a
 * mismatch returns `null` (a real "bridge expected ENTROPY but got
 * AREA" error). If the id is not registered, the inferred dim is
 * returned unchanged (current MVP behaviour for entries with no
 * dimensional_signature yet).
 *
 * @module dimensional/bridge-check
 */

import {
  Dimension,
  DIMENSIONLESS,
  ENTROPY,
  FREQUENCY,
  TIME,
  MASS,
  LENGTH,
  FORCE,
} from './types.js';
import { ExprNode, validate } from './validator.js';
import { equals, multiply, power } from './algebra.js';

/** [T^-2] — bracketed-product literal for BE-19's H² Friedmann RHS. */
const T_INV2: Dimension = { L: 0, M: 0, T: -2, I: 0, Theta: 0, N: 0, J: 0 };

/** [L^-3 T^-1] — bracketed-product literal for BE-47's BBN-dark dY/dt RHS. */
const INV_VOLUME_PER_TIME: Dimension = multiply(
  power(LENGTH, -3),
  { L: 0, M: 0, T: -1, I: 0, Theta: 0, N: 0, J: 0 },
);

/**
 * Per-bridge expected SI dimension lookup. Seeded with every entry that
 * has an AST encoding registered in `src/bridges/equations/`. Add a new
 * row whenever a new Tier-5 AST encoding lands; the
 * `dimensional-signature-catalog` round-trip test plus the
 * `Wave-G expected-dimension entries` size guard in
 * `tests/dimensional/bridge-check.test.ts` enforce that this map stays
 * in sync with the encoded modules.
 *
 * Entries with bracketed-product signatures (e.g. BE-19 `[T^-2]`,
 * BE-47 `[L^-3 T^-1]`) require a constructed `Dimension` literal — see
 * `T_INV2` and `INV_VOLUME_PER_TIME` above for the pattern.
 */
export const EXPECTED_DIMENSION_BY_BRIDGE: ReadonlyMap<number, Dimension> = new Map<number, Dimension>([
  [11, FREQUENCY],
  [12, LENGTH], // BE-12 thermal de Broglie wavelength λ_T = √(2π ℏ²/(m k_B T)) — Wave T 2026-05-06.
  [14, ENTROPY],
  [19, T_INV2],
  [22, DIMENSIONLESS],
  // BE-25 was removed 2026-05-06 (Wave Q B2, per CS iter-6 C2): the
  // legacy AST module `be-25-orch-or.ts` is archived (encodes the
  // dropped Penrose-Hameroff form which infers [time]). Under the
  // Wave P-D R-D2 IIT Φ_max reformulation, BE-25's
  // dimensional_signature is null (Φ is dimensionless / bits when
  // log₂ is used); cross-check registration here is therefore retired.
  [26, FREQUENCY],
  [34, DIMENSIONLESS],
  [38, FORCE], // BE-38 Milgrom MOND F = F_N · ν(z) — Wave U 2026-05-06.
  [41, MASS],
  [47, INV_VOLUME_PER_TIME],
]);

/**
 * Infer the SI dimensional signature of a bridge equation expression.
 *
 * @param bridgeId  The id from `BRIDGE_EQUATIONS` (11..50). If present
 *                  in `EXPECTED_DIMENSION_BY_BRIDGE` the inferred dim
 *                  is cross-checked against the expected; mismatch =>
 *                  null. If absent, the inferred dim is returned as-is.
 * @param expr      Hand-encoded ExprNode AST for the equation's RHS
 *                  (or LHS).
 * @returns The inferred SI dimension, or `null` if the expression is
 *          dimensionally inconsistent or fails the per-bridge expected
 *          dimension check.
 */
export function inferDimensionForBridge(
  bridgeId: number,
  expr: ExprNode,
): Dimension | null {
  const r = validate(expr);
  if (!r.ok || r.inferredDimension === null) return null;
  const expected = EXPECTED_DIMENSION_BY_BRIDGE.get(bridgeId);
  if (expected !== undefined && !equals(r.inferredDimension, expected)) {
    return null;
  }
  return r.inferredDimension;
}
