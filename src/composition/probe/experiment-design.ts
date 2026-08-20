/**
 * Cheap experiment-design suggestions for two competing hypotheses.
 *
 * Grid-search max |H1−H2|/σ under declared bounds. Never recommend a
 * forbidden region.
 *
 * @internal
 */

import type { ExprNode } from '../../dimensional/ast-types.js';
import { evalExpr } from '../expr-eval.js';

export interface DesignBounds {
  readonly variables: Readonly<Record<string, { min: number; max: number; steps?: number }>>;
  readonly forbidden?: readonly Readonly<Record<string, { min: number; max: number }>>[];
  readonly sigma?: number;
}

export interface DesignSuggestion {
  readonly point: Readonly<Record<string, number>>;
  readonly discrimination: number;
  readonly h1: number;
  readonly h2: number;
  readonly abstained?: boolean;
  readonly reason?: string;
}

function inForbidden(
  point: Record<string, number>,
  forbidden: readonly Readonly<Record<string, { min: number; max: number }>>[] | undefined,
): boolean {
  if (!forbidden) return false;
  return forbidden.some((region) =>
    Object.entries(region).every(([k, r]) => {
      const v = point[k];
      return v !== undefined && v >= r.min && v <= r.max;
    }),
  );
}

/** Suggest the grid point that maximises |H1−H2|/σ, skipping forbidden regions. @internal */
export function suggestDiscriminatingPoint(
  h1: ExprNode,
  h2: ExprNode,
  bounds: DesignBounds,
): DesignSuggestion {
  const names = Object.keys(bounds.variables);
  if (names.length === 0) {
    return {
      point: {},
      discrimination: 0,
      h1: NaN,
      h2: NaN,
      abstained: true,
      reason: 'no free variables in bounds',
    };
  }

  const sigma = bounds.sigma ?? 1;
  let best: DesignSuggestion | null = null;

  const grids = names.map((n) => {
    const b = bounds.variables[n]!;
    const steps = Math.max(2, b.steps ?? 8);
    const out: number[] = [];
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      out.push(b.min + t * (b.max - b.min));
    }
    return out;
  });

  const idx = new Array(names.length).fill(0);
  const rec = (d: number): void => {
    if (d === names.length) {
      const point: Record<string, number> = {};
      for (let i = 0; i < names.length; i++) point[names[i]!] = grids[i]![idx[i]!]!;
      if (inForbidden(point, bounds.forbidden)) return;
      let y1: number;
      let y2: number;
      try {
        y1 = evalExpr(h1, point);
        y2 = evalExpr(h2, point);
      } catch {
        return;
      }
      if (!Number.isFinite(y1) || !Number.isFinite(y2)) return;
      const disc = Math.abs(y1 - y2) / sigma;
      if (!best || disc > best.discrimination) {
        best = { point, discrimination: disc, h1: y1, h2: y2 };
      }
      return;
    }
    for (let i = 0; i < grids[d]!.length; i++) {
      idx[d] = i;
      rec(d + 1);
    }
  };
  rec(0);

  if (!best) {
    return {
      point: {},
      discrimination: 0,
      h1: NaN,
      h2: NaN,
      abstained: true,
      reason: 'every grid point was forbidden or non-finite',
    };
  }
  return best;
}
