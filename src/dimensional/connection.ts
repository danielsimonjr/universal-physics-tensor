/**
 * v0.4.0 connection-layer helpers (composite-formula builders that produce
 * trees of v0.3.0 AST nodes). The substantive new operator (∇_μ) is a
 * dedicated ExprNode kind defined in connection-validators.ts; this module
 * holds the Christoffel formula builder (a composite, like raise/lower).
 *
 * Per docs/specification/Part-IX-Connection-Layer.md (Task 18) and
 * v0.4.0-Design.md §5.
 *
 * @module dimensional/connection
 */

import { DIMENSIONLESS } from './types.js';
import { contract, tsym } from './tensor.js';
import type { TensorSymbolNode } from './tensor.js';
import { metric, pderiv } from './metric.js';
import type { MetricTensorNode } from './metric-validators.js';
import type { ExprNode } from './validator.js';

/** Same deterministic fresh-label scheme as raise/lower (Part-VIII §VIII.5). */
function freshLabel(base: string, taken: Set<string>): string {
  if (!taken.has(base)) return base;
  let counter = 1;
  while (taken.has(`${base}_${counter}`)) counter++;
  return `${base}_${counter}`;
}

/**
 * Christoffel symbol Γ^λ_μν = (1/2) g^λρ (∂_μ g_ρν + ∂_ν g_ρμ − ∂_ρ g_μν).
 *
 * Builds a composite tree of v0.3.0 nodes. The negation is encoded as binary
 * subtraction at the outer level: (∂_μ g_ρν + ∂_ν g_ρμ) − ∂_ρ g_μν.
 * Unary minus is NOT supported in v0.4.0 (validator special-cases '-' as
 * binary-only).
 *
 * The fresh dummy label ρ is generated via the deterministic freshLabel scheme
 * (Part-VIII §VIII.5 TENSOR-RULE raise-lower-fresh-label-deterministic):
 * tries 'ρ' first; falls back to 'ρ_1', 'ρ_2', … until non-colliding.
 *
 * Per v0.4.0-Design.md §5; Levi-Civita connection only.
 *
 * @param gLower   Covariant metric g_ab (both indices lower).
 * @param gInverse Contravariant inverse metric g^ab (both indices upper).
 * @param upper    Free upper index label λ.
 * @param lowerA   First free lower index label μ.
 * @param lowerB   Second free lower index label ν.
 * @param xCoord   Coordinate tensor x^α — used as the wrt argument for pderiv.
 */
export function christoffel(
  gLower: MetricTensorNode,
  gInverse: MetricTensorNode,
  upper: string,         // λ
  lowerA: string,        // μ
  lowerB: string,        // ν
  xCoord: TensorSymbolNode,
): ExprNode {
  // Collect labels in use to generate a fresh dummy.
  const taken = new Set<string>([upper, lowerA, lowerB]);
  for (const idx of gLower.indices) taken.add(idx.label);
  for (const idx of gInverse.indices) taken.add(idx.label);
  const rho = freshLabel('ρ', taken);

  // Renamed inverse metric so its indices match: g^{λ rho}.
  const gInverseRenamed: MetricTensorNode = metric(
    gInverse.name,
    [
      { label: upper, variance: 'upper' },
      { label: rho,   variance: 'upper' },
    ],
    gInverse.dim,
    gInverse.signature,
    gInverse.derivativeStrategy,
  );

  // The three lowered metrics: g_{ρ ν}, g_{ρ μ}, g_{μ ν}.
  const gRho_nu: MetricTensorNode = metric(gLower.name,
    [{ label: rho,    variance: 'lower' }, { label: lowerB, variance: 'lower' }],
    gLower.dim, gLower.signature, gLower.derivativeStrategy);
  const gRho_mu: MetricTensorNode = metric(gLower.name,
    [{ label: rho,    variance: 'lower' }, { label: lowerA, variance: 'lower' }],
    gLower.dim, gLower.signature, gLower.derivativeStrategy);
  const gMu_nu: MetricTensorNode  = metric(gLower.name,
    [{ label: lowerA, variance: 'lower' }, { label: lowerB, variance: 'lower' }],
    gLower.dim, gLower.signature, gLower.derivativeStrategy);

  // The three pderiv terms: ∂_μ g_{ρν}, ∂_ν g_{ρμ}, ∂_ρ g_{μν}.
  const dmu_gRhoNu  = pderiv(gRho_nu, xCoord, { label: lowerA, variance: 'lower' });
  const dnu_gRhoMu  = pderiv(gRho_mu, xCoord, { label: lowerB, variance: 'lower' });
  const drho_gMuNu  = pderiv(gMu_nu,  xCoord, { label: rho,    variance: 'lower' });

  // Sum: (∂_μ g_{ρν} + ∂_ν g_{ρμ}) − ∂_ρ g_{μν}.
  // Binary subtraction — unary minus is NOT supported in v0.4.0.
  const innerSum: ExprNode = {
    kind: 'op', op: '+',
    args: [dmu_gRhoNu, dnu_gRhoMu],
  };
  const sumExpr: ExprNode = {
    kind: 'op', op: '-',
    args: [innerSum, drho_gMuNu],  // binary subtraction
  };

  // Half-factor: dimensionless scalar.
  const half: ExprNode = { kind: 'symbol', name: '(1/2)', dim: DIMENSIONLESS };

  // Final: (1/2) · g^{λρ} · sumExpr
  // Γ has units 1/LENGTH (geometrized DIMENSIONLESS metric).
  return contract(half, gInverseRenamed, sumExpr);
}
