/**
 * InverseMetricInconsistencyWarning — numerical path. Builds g⁻¹ and g as
 * EngineTensors, computes ‖matMul(g⁻¹, g) − I‖_∞, and emits a
 * 'warning'-severity Violation when it exceeds tolerance. v0.3.5-Design.md
 * §7. Resolves the v0.3.0 §13 Q2 deferral. `scanForMetricPair` finds an
 * identifiable lower/upper metric pair in an AST so evaluateNumerical can
 * run the check automatically.
 *
 * @module numerical/metric-inverse
 */
import type { ExprNode, Violation } from '../dimensional/validator.js';
import type { MetricTensorNode } from '../dimensional/metric-validators.js';
import { DIMENSIONLESS } from '../dimensional/types.js';
import type { TensorEngine } from './tensor-engine.js';
import type { NumericalInputs } from './types.js';
import { getActiveEngine } from './engine-registry.js';
import { NumericalBackendError } from './errors.js';

const DEFAULT_TOLERANCE = 1e-10;

/** Compute ‖g⁻¹g − I‖_∞ and, if it exceeds tolerance, return a warning. */
export async function evaluateMetricInverse(
  gInverse: MetricTensorNode,
  g: MetricTensorNode,
  inputs: NumericalInputs,
  tolerance: number = DEFAULT_TOLERANCE,
  options?: { engine?: TensorEngine },
): Promise<{ residualNorm: number; warning?: Violation }> {
  const engine = options?.engine ?? getActiveEngine();
  const N = inputs.dimension ?? 4;

  const gInvData = inputs.tensors.get(gInverse.name);
  const gData = inputs.tensors.get(g.name);
  if (gInvData === undefined || gData === undefined) {
    throw new NumericalBackendError(
      `evaluateMetricInverse: missing components for "${gInverse.name}" or "${g.name}"`,
    );
  }
  const gInvT = engine.fromNested(gInvData, [N, N]);
  const gT = engine.fromNested(gData, [N, N]);
  const residual = engine.sub(engine.matMul(gInvT, gT), engine.identity(N));
  const residualNorm = engine.normInf(residual);

  if (residualNorm > tolerance) {
    const warning: Violation = {
      location: `${gInverse.name}·${g.name}`,
      expected: DIMENSIONLESS,
      actual: DIMENSIONLESS,
      note: `InverseMetricInconsistencyWarning: ‖${gInverse.name}·${g.name} − I‖_∞ = `
        + `${residualNorm.toExponential(3)} exceeds tolerance ${tolerance.toExponential(1)} — `
        + `the supplied metrics are not numerical inverses`,
      severity: 'warning',
    };
    return { residualNorm, warning };
  }
  return { residualNorm };
}

/** Walk an ExprNode tree; return the first all-lower / all-upper
 *  metric-tensor pair found, or null. Cheap — evaluateNumerical already
 *  walks the tree to lower it. */
export function scanForMetricPair(
  node: ExprNode,
): { gLower: MetricTensorNode; gUpper: MetricTensorNode } | null {
  const metrics: MetricTensorNode[] = [];
  const walk = (n: ExprNode): void => {
    if (n.kind === 'metric-tensor') metrics.push(n);
    else if (n.kind === 'op') n.args.forEach(walk);
    else if (n.kind === 'tensor-product') n.args.forEach(walk);
    else if (n.kind === 'integral') { walk(n.over); walk(n.integrand); }
    else if (n.kind === 'derivative') { walk(n.of); walk(n.wrt); }
    else if (n.kind === 'tensor-partial-derivative') {
      walk(n.of as ExprNode); walk(n.wrt as ExprNode);
    }
    // tensor-symbol / kronecker-delta / symbol: leaves, no metric inside
  };
  walk(node);
  const lower = metrics.find((m) => m.indices.every((i) => i.variance === 'lower'));
  const upper = metrics.find((m) => m.indices.every((i) => i.variance === 'upper'));
  return lower && upper ? { gLower: lower, gUpper: upper } : null;
}
