/**
 * Deciding-measurement elasticity for value-kind confrontations. For each
 * numeric input x_i of the confrontation's prediction, report the
 * dimensionless log-sensitivity E_i = |∂P/∂x_i|·x_i/P at the confrontation's
 * own input point (central finite differences — evaluator-style bridges have
 * no AST). This answers which input the prediction depends on most STRONGLY,
 * NOT which dominates the uncertainty budget (that needs input σ — Phase 5).
 *
 * @module bridges/sensitivity
 */
import { evaluatePerihelionPrecession } from './perihelion-precession.js';
import { MERCURY } from './be52-mercury-confrontation.js';
import { CONFRONTATIONS } from './confrontations.js';

/** One input's elasticity. @public */
export interface Elasticity {
  readonly input: string;
  readonly elasticity: number;
}

/** Central-difference elasticity of P(x) wrt one component. */
function elasticityOf(
  predict: (point: Record<string, number>) => number,
  point: Record<string, number>,
  key: string,
): number {
  const x = point[key];
  const h = Math.abs(x) * 1e-6 || 1e-12;
  const up = { ...point, [key]: x + h };
  const dn = { ...point, [key]: x - h };
  const P = predict(point);
  const dP = (predict(up) - predict(dn)) / (2 * h);
  if (!(Number.isFinite(P) && P !== 0)) return 0;
  return Math.abs(dP) * Math.abs(x) / Math.abs(P);
}

/**
 * Elasticity ranking for a value-kind confrontation's inputs, descending.
 * `[]` for non-value-kind or unregistered ids.
 *
 * @public
 */
export function decidingMeasurement(bridgeId: number): Elasticity[] {
  const entry = CONFRONTATIONS.get(bridgeId);
  if (!entry || entry.kind !== 'value') return [];

  // The one value-kind confrontation with non-trivial input dependence.
  if (bridgeId === 52) {
    const point: Record<string, number> = {
      central_mass_kg: MERCURY.central_mass_kg,
      semi_major_axis_m: MERCURY.semi_major_axis_m,
      eccentricity: MERCURY.eccentricity,
      period_yr: MERCURY.period_yr,
    };
    const predict = (p: Record<string, number>): number =>
      evaluatePerihelionPrecession({
        M_kg: p.central_mass_kg,
        a_m: p.semi_major_axis_m,
        e: p.eccentricity,
        T_yr: p.period_yr,
      }).dphi_arcsec_per_century;
    return Object.keys(point)
      .map((key) => ({ input: key, elasticity: elasticityOf(predict, point, key) }))
      .sort((a, b) => b.elasticity - a.elasticity);
  }

  // be-37 predicts the constant γ=1: every elasticity is 0. be-23 confronts
  // a bundled free coefficient (no structural input dependence to rank).
  return [];
}
