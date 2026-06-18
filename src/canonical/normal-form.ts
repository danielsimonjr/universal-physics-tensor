/**
 * Normalized structural form of a scalar `ExprNode`, **up to dimensionless
 * multiplicative factors** — the hash the F4 circularity guard uses to decide
 * whether a bridge's RHS and a canonical equation encode the same relation.
 *
 * Two expressions hash equal when they differ only by:
 *   - dimensionless multiplicative constants (numeric literals, ln2, 4π, …),
 *   - product nesting (`(a·b)·c` vs `a·b·c`),
 *   - commutative reordering of `*` / `+` operands.
 *
 * They hash DIFFERENT when an exponent differs (T⁴ ≠ T) or the non-dimensionless
 * factor set differs. Sums keep every term; `^` keeps its exponent; `/` keeps the
 * numerator/denominator split.
 *
 * @module canonical/normal-form
 */
import type { ExprNode } from '../dimensional/validator.js';
import type { Dimension } from '../dimensional/types.js';

const isDimensionless = (d: Dimension): boolean =>
  d.L === 0 &&
  d.M === 0 &&
  d.T === 0 &&
  d.I === 0 &&
  d.Theta === 0 &&
  d.N === 0 &&
  d.J === 0;

/** Token for a node that carries no structural content (a dimensionless factor). */
const UNIT = '1';

/** Collect the factors of a (possibly nested) `*` product. */
function flattenProduct(node: ExprNode, out: ExprNode[]): void {
  if (node.kind === 'op' && node.op === '*') {
    for (const a of node.args) flattenProduct(a, out);
  } else {
    out.push(node);
  }
}

/**
 * The normalized structural form of `node`. Equal strings ⇒ same relation up to
 * dimensionless multiplicative factors.
 */
export function normalForm(node: ExprNode): string {
  switch (node.kind) {
    case 'symbol':
      // A dimensionless symbol is a factor with no structural content.
      return isDimensionless(node.dim) ? UNIT : `sym:${node.name}`;

    case 'op': {
      switch (node.op) {
        case '*': {
          const factors: ExprNode[] = [];
          flattenProduct(node, factors);
          const kept = factors
            .map(normalForm)
            .filter((f) => f !== UNIT) // drop dimensionless factors
            .sort();
          if (kept.length === 0) return UNIT;
          if (kept.length === 1) return kept[0];
          return `*(${kept.join(',')})`;
        }
        case '/': {
          const num = normalForm(node.args[0]);
          const den = normalForm(node.args[1]);
          if (den === UNIT) return num; // ÷ dimensionless ⇒ the numerator
          return `/(${num},${den})`;
        }
        case '^': {
          // The exponent is structural (T⁴ ≠ T) — represent it literally.
          const base = normalForm(node.args[0]);
          const exp = node.args[1];
          const expRepr =
            exp.kind === 'symbol' ? `lit:${exp.name}` : normalForm(exp);
          return `^(${base},${expRepr})`;
        }
        case '+':
        case '-': {
          const parts = node.args.map(normalForm);
          if (node.op === '+') parts.sort();
          return `${node.op}(${parts.join(',')})`;
        }
        default:
          return `op:${JSON.stringify(node)}`;
      }
    }

    case 'transcendental':
      return `${node.fn}(${normalForm(node.arg)})`;

    case 'abs':
      return `abs(${normalForm(node.arg)})`;

    default:
      // integral / derivative / tensor arms: compare structurally by kind+shape.
      return `${node.kind}:${JSON.stringify(node)}`;
  }
}

/** Whether two scalar ASTs are the same relation up to dimensionless factors. */
export function structurallyEqual(a: ExprNode, b: ExprNode): boolean {
  return normalForm(a) === normalForm(b);
}
