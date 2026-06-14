/**
 * Formula dimensional check (MathTS Phase 2,
 * src/numerical/formula-dimension.ts). Transpiles a user formula's MathTS
 * AST into UPT's ExprNode and validates homogeneity + inferred dimension.
 * Guarded on the optional MathTS peer (it needs the AST).
 */
import { describe, it, expect } from 'vitest';
import type { Dimension } from '../../src/dimensional/types.js';

const D = (L = 0, M = 0, T = 0, Theta = 0): Dimension => ({
  L, M, T, I: 0, Theta, N: 0, J: 0,
});

let checker:
  | import('../../src/numerical/formula-dimension.js').FormulaDimensionChecker
  | null = null;
try {
  const { loadFormulaDimensionChecker } = await import(
    '../../src/numerical/formula-dimension.js'
  );
  checker = await loadFormulaDimensionChecker();
  checker.check('1', {}); // confirm it works
} catch {
  checker = null;
}

const d = checker ? describe : describe.skip;

d('formula-dimension (MathTS Phase 2)', () => {
  const c = checker!;

  it('infers the pendulum formula as a time', () => {
    const r = c.check('2*pi*sqrt(length/gravity)', { length: D(1), gravity: D(1, 0, -2) });
    expect(r.ok).toBe(true);
    expect(r.dim).toEqual(D(0, 0, 1)); // time
  });

  it('infers the Schwarzschild form as a length', () => {
    const r = c.check('2*G*mass/c^2', { G: D(3, -1, -2), mass: D(0, 1), c: D(1, 0, -1) });
    expect(r.ok).toBe(true);
    expect(r.dim).toEqual(D(1));
  });

  it('infers the Hawking formula as a temperature', () => {
    const r = c.check('hbar*c^3/(8*pi*G*M*k_B)', {
      hbar: D(2, 1, -1), c: D(1, 0, -1), G: D(3, -1, -2), M: D(0, 1), k_B: D(2, 1, -2, -1),
    });
    expect(r.ok).toBe(true);
    expect(r.dim).toEqual(D(0, 0, 0, 1)); // temperature
  });

  it('rejects a non-homogeneous sum', () => {
    const r = c.check('a + b', { a: D(1), b: D(0, 0, 1) });
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/mismatch|add/i);
  });

  it('rejects a transcendental of a dimensional argument', () => {
    expect(c.check('sin(a)', { a: D(1) }).ok).toBe(false);
    expect(c.check('sin(a)', { a: D(1) }).error).toMatch(/dimensionless/);
  });

  it('accepts a transcendental of a dimensionless ratio', () => {
    const r = c.check('exp(a/b)', { a: D(1), b: D(1) });
    expect(r.ok).toBe(true);
    expect(r.dim).toEqual(D()); // dimensionless
  });

  it('rejects an undeclared symbol', () => {
    const r = c.check('mass * foo', { mass: D(0, 1) });
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/undeclared symbol 'foo'/);
  });

  it('rejects a variable exponent', () => {
    const r = c.check('a^b', { a: D(1), b: D() });
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/exponent must be/);
  });

  it('treats pi/tau as dimensionless constants (no declaration needed)', () => {
    const r = c.check('2*pi*r', { r: D(1) });
    expect(r.ok).toBe(true);
    expect(r.dim).toEqual(D(1));
  });
});
