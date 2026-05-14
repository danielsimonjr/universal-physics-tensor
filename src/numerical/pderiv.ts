/**
 * Numerical partial derivative — two-way dispatch (v0.3.5-Design.md §6).
 *   'grid'         — centered finite-difference over a GridField.
 *   'numerical-fn' — centered finite-difference over a caller-supplied fn.
 *   'symbolic'     — no CAS in v0.3.5; consumes an explicit pre-supplied
 *                    derivative from NumericalInputs.derivatives.
 *
 * @module numerical/pderiv
 */
import type { GridField } from './grid-field.js';
import type { NestedArray } from './types.js';
import { NumericalBackendError } from './errors.js';

/** Flatten a (possibly scalar) NestedArray to a number[] in row-major order. */
function flattenToNumbers(data: NestedArray): number[] {
  if (typeof data === 'number') return [data];
  const out: number[] = [];
  const walk = (n: NestedArray): void => {
    if (typeof n === 'number') out.push(n);
    else for (const c of n) walk(c);
  };
  walk(data);
  return out;
}

/**
 * Centered finite-difference of a GridField along `axis`. Returns a flat
 * number[] of the same total size as the grid. O(h²) interior stencil;
 * edges follow `grid.boundary`:
 *   - 'clamp'    — one-sided (forward/backward) difference at the edge.
 *   - 'periodic' — wraps to the opposite edge.
 *
 * @internal — consumed by the lowering pass; not part of the consumer surface.
 */
export function pderivGrid(grid: GridField, axis: number): number[] {
  if (axis < 0 || axis >= grid.shape.length) {
    throw new NumericalBackendError(`pderivGrid: axis ${axis} out of range for shape [${grid.shape}]`);
  }
  const h = grid.spacing[axis];
  if (!(h > 0)) {
    throw new NumericalBackendError(`pderivGrid: non-positive spacing ${h} on axis ${axis}`);
  }
  const flat = flattenToNumbers(grid.data);
  const shape = grid.shape;
  const strides: number[] = new Array(shape.length);
  let acc = 1;
  for (let k = shape.length - 1; k >= 0; k--) { strides[k] = acc; acc *= shape[k]; }
  const out = new Array<number>(flat.length).fill(0);
  const n = shape[axis];
  const step = strides[axis];

  // Walk every multi-index; compute the axis position from the flat index.
  for (let f = 0; f < flat.length; f++) {
    const pos = Math.floor(f / step) % n;
    if (pos > 0 && pos < n - 1) {
      out[f] = (flat[f + step] - flat[f - step]) / (2 * h);
    } else if (grid.boundary === 'periodic') {
      const next = pos === n - 1 ? f - (n - 1) * step : f + step;
      const prev = pos === 0 ? f + (n - 1) * step : f - step;
      out[f] = (flat[next] - flat[prev]) / (2 * h);
    } else { // 'clamp' — one-sided difference at the edge
      out[f] = pos === 0
        ? (flat[f + step] - flat[f]) / h
        : (flat[f] - flat[f - step]) / h;
    }
  }
  return out;
}

/**
 * Centered finite-difference of a caller-supplied scalar field with respect
 * to coordinate `axis`. Step h = 1e-6 · max(|x|, 1) (v0.3.5-Design.md §13 Q3).
 *
 * @internal — consumed by the lowering pass; not part of the consumer surface.
 */
export function pderivNumericalFn(
  fn: (coords: ReadonlyArray<number>) => NestedArray,
  coords: ReadonlyArray<number>,
  axis: number,
): NestedArray {
  if (axis < 0 || axis >= coords.length) {
    throw new NumericalBackendError(`pderivNumericalFn: axis ${axis} out of range`);
  }
  const x = coords[axis];
  const h = 1e-6 * Math.max(Math.abs(x), 1);
  const plus = [...coords]; plus[axis] = x + h;
  const minus = [...coords]; minus[axis] = x - h;
  const fp = flattenToNumbers(fn(plus));
  const fm = flattenToNumbers(fn(minus));
  if (fp.length !== fm.length) {
    throw new NumericalBackendError('pderivNumericalFn: field returned inconsistent shapes');
  }
  const d = fp.map((v, i) => (v - fm[i]) / (2 * h));
  return d.length === 1 ? d[0] : d;
}

/**
 * 'symbolic' numericalForm path: v0.3.5 has no CAS, so the caller supplies
 * the derivative explicitly, keyed `${symbolName}/${coordLabel}`.
 *
 * @internal — consumed by the lowering pass; not part of the consumer surface.
 */
export function pderivSymbolic(
  symbolName: string,
  coordLabel: string,
  derivatives: ReadonlyMap<string, NestedArray>,
): NestedArray {
  const key = `${symbolName}/${coordLabel}`;
  const d = derivatives.get(key);
  if (d === undefined) {
    throw new NumericalBackendError(
      `pderivSymbolic: no explicit derivative supplied for "${key}" — `
      + `a 'symbolic' tensor-symbol under a partial-derivative requires `
      + `inputs.derivatives to contain its pre-computed components (v0.3.5 has no CAS)`,
    );
  }
  return d;
}
