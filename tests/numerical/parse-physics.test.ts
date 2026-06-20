/**
 * `parsePhysics` — parse physics text to a dimensional `ExprNode` + its
 * dimension, with the scalar grammar gap closed (faithful `transcendental` /
 * `abs` nodes). The built-in (Path B) checker's `parse` is tested synchronously
 * for deterministic coverage of both the node shapes and homogeneity errors;
 * `parsePhysics` (registry — MathTS when installed, else built-in) is tested for
 * the same grammar over whichever front-end is active.
 *
 * @module tests/numerical/parse-physics
 */
import { describe, it, expect } from 'vitest';
import {
  builtinFormulaDimensionChecker,
  FormulaDimensionError,
} from '../../src/numerical/formula-dimension.js';
import { parsePhysics } from '../../src/numerical/formula-registry.js';
import { LENGTH, TIME, DIMENSIONLESS } from '../../src/dimensional/types.js';
import { equals } from '../../src/dimensional/algebra.js';

const ENERGY = { L: 2, M: 1, T: -2, I: 0, Theta: 0, N: 0, J: 0 };
const b = builtinFormulaDimensionChecker();

describe('builtin checker .parse — ExprNode + dimension', () => {
  it('returns the op node and its dimension for a product', () => {
    const { expr, dimension } = b.parse('a*b', { a: LENGTH, b: TIME });
    expect(expr.kind).toBe('op');
    expect(equals(dimension, { L: 1, M: 0, T: 1, I: 0, Theta: 0, N: 0, J: 0 })).toBe(true);
  });

  it('throws FormulaDimensionError on a non-homogeneous sum', () => {
    expect(() => b.parse('a + b', { a: LENGTH, b: TIME })).toThrow(FormulaDimensionError);
  });
});

describe('grammar gap — faithful transcendental / abs nodes (Path B)', () => {
  it('emits a transcendental node for exp() of a dimensionless arg', () => {
    const { expr } = b.parse('exp(x)', { x: DIMENSIONLESS });
    expect(expr.kind).toBe('transcendental');
    expect((expr as { fn: string }).fn).toBe('exp');
  });

  it('maps log() to the ln transcendental', () => {
    const { expr } = b.parse('log(x)', { x: DIMENSIONLESS });
    expect(expr.kind).toBe('transcendental');
    expect((expr as { fn: string }).fn).toBe('ln');
  });

  it('rejects a transcendental of a dimensional argument', () => {
    expect(() => b.parse('exp(x)', { x: ENERGY })).toThrow(FormulaDimensionError);
  });

  it('emits a dimension-preserving abs node', () => {
    const { expr, dimension } = b.parse('abs(x)', { x: LENGTH });
    expect(expr.kind).toBe('abs');
    expect(equals(dimension, LENGTH)).toBe(true);
  });
});

describe('parsePhysics — registry front-end (MathTS or built-in)', () => {
  it('parses to expr + dimension', async () => {
    const { expr, dimension } = await parsePhysics('a*b', { a: LENGTH, b: TIME });
    expect(expr).toBeDefined();
    expect(equals(dimension, { L: 1, M: 0, T: 1, I: 0, Theta: 0, N: 0, J: 0 })).toBe(true);
  });

  it('emits a transcendental node and rejects a dimensional arg', async () => {
    const { expr } = await parsePhysics('exp(x)', { x: DIMENSIONLESS });
    expect(expr.kind).toBe('transcendental');
    await expect(parsePhysics('exp(x)', { x: ENERGY })).rejects.toThrow(FormulaDimensionError);
  });
});
