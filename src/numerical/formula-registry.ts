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

export type FormulaParserKind = 'mathts' | 'builtin';

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
