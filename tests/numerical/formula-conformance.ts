/**
 * Parameterized FormulaParser conformance suite. Both the self-contained
 * Path B parser (`defaultFormulaParser`) and the MathTS-backed Path A
 * parser must pass this identical suite — it is the contract that makes
 * the two interchangeable behind the `FormulaParser` interface (the
 * registry swaps them transparently).
 *
 * Not a *.test.ts file: it exports a function each parser's own *.test.ts
 * wraps (same discipline as engine-conformance.ts).
 *
 * KNOWN, ACCEPTED divergence (deliberately NOT in the shared cases): the
 * MathTS parser recognizes `e` as Euler's number (a built-in constant),
 * while Path B treats `e` as a free variable. Avoid `e` as a variable
 * name; both agree on `pi` and `tau`.
 *
 * @module tests/numerical/formula-conformance
 */
import { describe, it, expect } from 'vitest';
import type { FormulaParser } from '../../src/numerical/formula.js';

/** (expr, scope) → expected scalar value — both parsers must agree. */
const VALUE_CASES: ReadonlyArray<
  readonly [string, Record<string, number>, number]
> = [
  ['2 + 3 * 4', {}, 14],
  ['(2 + 3) * 4', {}, 20],
  ['10 / 2 / 5', {}, 1], // left-assoc
  ['-2 ^ 2', {}, -4], // ^ tighter than unary minus
  ['2 ^ -2', {}, 0.25],
  ['2 ^ 3 ^ 2', {}, 512], // right-assoc power
  ['1.6e-19', {}, 1.6e-19],
  ['sqrt(16)', {}, 4],
  ['log(exp(3))', {}, 3], // log = natural
  ['pow(2, 10)', {}, 1024],
  ['abs(-7)', {}, 7],
  ['2 * pi * r', { r: 1 }, 2 * Math.PI],
  ['a * b^2 / c', { a: 2, b: 3, c: 4 }, 4.5],
  ['mass ^ -0.5', { mass: 4 }, 0.5],
  [
    'hbar*c^3/(8*pi*G*M*k_B)',
    {
      hbar: 1.054571817e-34,
      c: 299792458,
      G: 6.6743e-11,
      M: 1.989e30,
      k_B: 1.380649e-23,
    },
    6.168429712630829e-8,
  ],
];

/** expr → sorted free variables — both parsers must agree. */
const VARIABLE_CASES: ReadonlyArray<readonly [string, string[]]> = [
  ['2 * pi * r', ['r']], // pi excluded
  ['a * b + sin(c)', ['a', 'b', 'c']], // function callee `sin` excluded
  ['tau * x', ['x']], // tau is a constant in both
  ['hbar*c^3/(8*pi*G*M*k_B)', ['G', 'M', 'c', 'hbar', 'k_B']],
];

const rel = (got: number, want: number): number =>
  Math.abs(got - want) / Math.max(1, Math.abs(want));

/** Run the shared conformance suite against one parser. */
export function runFormulaConformance(
  parser: FormulaParser,
  label: string,
): void {
  describe(`[${label}] formula conformance — values`, () => {
    for (const [expr, scope, expected] of VALUE_CASES) {
      it(`evaluates ${expr}`, () => {
        expect(rel(parser.parse(expr).evaluate(scope), expected)).toBeLessThan(
          1e-12,
        );
      });
    }
  });

  describe(`[${label}] formula conformance — free variables`, () => {
    for (const [expr, vars] of VARIABLE_CASES) {
      it(`extracts variables of ${expr}`, () => {
        expect([...parser.parse(expr).variables]).toEqual(vars);
      });
    }
  });

  describe(`[${label}] formula conformance — errors`, () => {
    it('an unsupplied variable throws at evaluate', () => {
      expect(() => parser.parse('x + 1').evaluate({})).toThrow();
    });
    it('an empty formula throws at parse', () => {
      expect(() => parser.parse('   ')).toThrow();
    });
  });
}
