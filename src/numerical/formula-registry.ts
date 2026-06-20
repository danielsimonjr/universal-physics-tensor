/**
 * Formula-parser registry (Path A selector — mirrors `engine-registry.ts`).
 *
 * `getFormulaParser()` returns the MathTS-backed parser when the optional
 * peer is installed AND actually assembles and evaluates (smoke-tested),
 * otherwise the self-contained Path B parser. The choice is detected once
 * and cached. A broken or absent MathTS never breaks the caller — it falls
 * back silently to Path B.
 *
 * The CLI and any inference code depend only on the {@link FormulaParser}
 * interface, so swapping Path B ↔ Path A is transparent.
 *
 * @module numerical/formula-registry
 */

import type { FormulaParser } from './formula.js';
import { defaultFormulaParser } from './formula.js';
import { loadMathtsFormulaParser } from './formula-mathts.js';
import type { Dimension } from '../dimensional/types.js';
import type { FormulaDimensionChecker, ParsedPhysics } from './formula-dimension.js';
import { loadFormulaDimensionChecker, builtinFormulaDimensionChecker } from './formula-dimension.js';

type FormulaParserKind = 'mathts' | 'builtin';

interface Selected {
  readonly parser: FormulaParser;
  readonly kind: FormulaParserKind;
}

let cached: Promise<Selected> | undefined;

/** A formula MathTS must reproduce to be accepted (the §1-gate smoke test). */
const SMOKE_EXPR = 'a*b^2 + 1';
const SMOKE_SCOPE = { a: 3, b: 4 };
const SMOKE_EXPECTED = 49; // 3*16 + 1

/** Run `fn` with MathTS's import-time WASM-fallback chatter suppressed. */
async function quietly<T>(fn: () => Promise<T>): Promise<T> {
  const origWarn = console.warn;
  const origError = console.error;
  const origWrite = process.stderr.write.bind(process.stderr);
  console.warn = () => {};
  console.error = () => {};
  // mathts prints some notices via process.stderr.write directly.
  (process.stderr as { write: unknown }).write = () => true;
  try {
    return await fn();
  } finally {
    console.warn = origWarn;
    console.error = origError;
    (process.stderr as { write: unknown }).write = origWrite;
  }
}

async function detect(): Promise<Selected> {
  try {
    const parser = await quietly(loadMathtsFormulaParser);
    // Smoke test: it must actually assemble AND evaluate correctly.
    const v = parser.parse(SMOKE_EXPR).evaluate(SMOKE_SCOPE);
    if (Math.abs(v - SMOKE_EXPECTED) < 1e-9) {
      return { parser, kind: 'mathts' };
    }
  } catch {
    /* peer absent or failed to assemble — fall through */
  }
  return { parser: defaultFormulaParser, kind: 'builtin' };
}

/** Resolve the active formula parser (cached). @internal */
export async function getFormulaParser(): Promise<FormulaParser> {
  cached ??= detect();
  return (await cached).parser;
}

/** Which parser is active — `mathts` (Path A) or `builtin` (Path B). @internal */
export async function getFormulaParserKind(): Promise<FormulaParserKind> {
  cached ??= detect();
  return (await cached).kind;
}

let cachedChecker: Promise<FormulaDimensionChecker> | undefined;

const LENGTH_DIM = { L: 1, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 };

/**
 * The dimensional checker for user formulas (MathTS Phase 2). Always
 * available: it uses the MathTS AST when the peer is installed and
 * smoke-tests clean, else the self-contained Path B AST — both transpile to
 * the same `ExprNode`, so the dimensional verdict is identical. @internal
 */
export async function getFormulaDimensionChecker(): Promise<FormulaDimensionChecker> {
  cachedChecker ??= (async () => {
    try {
      const checker = await quietly(loadFormulaDimensionChecker);
      // smoke test: a dimensionless ratio is homogeneous and dimensionless.
      if (checker.check('a/a', { a: LENGTH_DIM }).ok) return checker;
    } catch {
      /* peer absent or failed — fall back to the built-in checker */
    }
    return builtinFormulaDimensionChecker();
  })();
  return cachedChecker;
}

/**
 * Parse physics text to a dimensional `ExprNode` + its inferred dimension, using
 * the active front-end (MathTS when the optional peer is installed, else the
 * built-in parser). The single public string→`ExprNode` entry point.
 *
 * @throws {FormulaDimensionError} on a parse error or non-homogeneity.
 * @public
 */
export async function parsePhysics(
  text: string,
  dims: Readonly<Record<string, Dimension>>,
): Promise<ParsedPhysics> {
  const checker = await getFormulaDimensionChecker();
  return checker.parse(text, dims);
}
