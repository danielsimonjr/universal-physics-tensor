/**
 * Exact bridge-gradients via reverse-mode AD over the symbolic RHS AST.
 *
 * The catalog's plain-JS evaluators cannot be differentiated by AD (they run
 * raw `Math.*` arithmetic; see `bridge-gradient.ts`), and `bridgeGradient`'s
 * engine path detaches them. But each bridge also carries a faithful symbolic
 * encoding of its RHS (`*_RHS: ExprNode`). This module lowers that scalar AST
 * through `@danielsimonjr/mathts-autograd`'s `TapedTensor` ops — binding the
 * chosen variable to a traced input and every other symbol to a constant tape
 * leaf — so `reverseGrad` returns the EXACT derivative (machine precision), with
 * the plain-JS evaluators left untouched (P8 Decision #1).
 *
 * Scope: the dimensional scalar grammar is `symbol` + `op(+ − * / ^)` (the
 * transcendentals of a bridge are absorbed into typed-stub *symbols*, so they
 * appear as opaque constants here). A bridge encoded with a typed stub therefore
 * differentiates with respect to the stub, not the physics inside it — faithful,
 * fully-expanded encodings (e.g. BE-42 `ℏc³/(8πGM·k_B)`) differentiate exactly.
 * `^` exponents must be constant (the differentiation variable may not appear in
 * an exponent).
 *
 * Requires the optional `@danielsimonjr/mathts-autograd` peer; throws
 * `EngineCapabilityError` when it is absent (same graceful-degradation contract
 * as `bridgeGradient`).
 *
 * @module diff/bridge-ast-gradient
 */

import type { ExprNode } from '../dimensional/validator.js';
import { PhysicalConstants } from '../core/types.js';
import { EngineCapabilityError } from '../numerical/errors.js';

/**
 * Result of {@link bridgeGradientAST}: the bridge's scalar `value` at the
 * supplied point and the exact `gradient` d(value)/d(varName).
 *
 * @public
 */
export interface ASTGradientResult {
  readonly value: number;
  readonly gradient: number;
}

// --- Structural views of the optional autograd/tensor peers (not full imports;
// the peers are absent during tsc, so we narrow the dynamic-import result). ---

type TapeHandle = unknown;

interface TapedScalar {
  readonly tape: TapeHandle;
  add(o: TapedScalar): TapedScalar;
  sub(o: TapedScalar): TapedScalar;
  mul(o: TapedScalar): TapedScalar;
  divide(o: TapedScalar): TapedScalar;
  pow(k: number): TapedScalar;
}

interface MathTSTensorLike {
  toNested(): unknown;
}

interface AutogradModuleLike {
  reverseGrad(
    fn: (x: TapedScalar) => TapedScalar,
    x: MathTSTensorLike,
    cotangent?: MathTSTensorLike,
  ): { value: MathTSTensorLike; gradient: MathTSTensorLike };
  TapedTensor: {
    fromTensorAsInput(t: MathTSTensorLike, tape: TapeHandle): TapedScalar;
  };
}

interface TensorModuleLike {
  Tensor: { fromNested(data: number, shape: number[]): MathTSTensorLike };
}

/**
 * Named physical constants the bridge encodings reference as bare symbols.
 * Sourced from `PhysicalConstants` so a traced AST evaluates to the SAME number
 * as the corresponding hand-written evaluator. Callers can override or extend
 * via the `bindings` argument.
 */
const NAMED_CONSTANTS: Readonly<Record<string, number>> = {
  hbar: PhysicalConstants.hbar,
  c: PhysicalConstants.c,
  G: PhysicalConstants.G,
  k_B: PhysicalConstants.kB,
  kB: PhysicalConstants.kB,
  pi: Math.PI,
  '2pi': 2 * Math.PI,
  '4pi': 4 * Math.PI,
  '8pi': 8 * Math.PI,
};

/** Resolve a symbol's numeric value: caller bindings → named constants → numeric literal. */
function resolveConstant(
  name: string,
  bindings: Record<string, number>,
): number {
  if (Object.prototype.hasOwnProperty.call(bindings, name))
    return bindings[name];
  if (Object.prototype.hasOwnProperty.call(NAMED_CONSTANTS, name))
    return NAMED_CONSTANTS[name];
  const asNumber = Number(name);
  if (name.trim() !== '' && Number.isFinite(asNumber)) return asNumber;
  throw new TypeError(
    `bridgeGradientAST: unknown symbol '${name}' — not a binding, a named constant ` +
      `(${Object.keys(NAMED_CONSTANTS).join(', ')}), or a numeric literal. Supply it in bindings.`,
  );
}

/** Resolve a `^` exponent to a constant number; reject the differentiation variable. */
function resolveExponent(
  node: ExprNode,
  varName: string,
  bindings: Record<string, number>,
): number {
  if (node.kind === 'symbol') {
    if (node.name === varName) {
      throw new TypeError(
        `bridgeGradientAST: differentiation variable '${varName}' appears as an exponent — ` +
          `variable exponents are not supported (only constant powers).`,
      );
    }
    return resolveConstant(node.name, bindings);
  }
  throw new TypeError(
    `bridgeGradientAST: '^' exponent must be a constant symbol, got node kind '${node.kind}'.`,
  );
}

/**
 * Differentiate a scalar bridge RHS AST with respect to one symbol via
 * reverse-mode AD. Every symbol other than `varName` is resolved to a constant
 * (caller `bindings`, then {@link NAMED_CONSTANTS}, then numeric literal); the
 * `bindings` must contain `varName` (its value sets the point of evaluation).
 *
 * @public
 */
export async function bridgeGradientAST(
  rhs: ExprNode,
  varName: string,
  bindings: Record<string, number>,
): Promise<ASTGradientResult> {
  if (!Object.prototype.hasOwnProperty.call(bindings, varName)) {
    throw new TypeError(
      `bridgeGradientAST: bindings must contain the differentiation variable '${varName}'.`,
    );
  }

  let autograd: AutogradModuleLike;
  let tensorMod: TensorModuleLike;
  try {
    autograd =
      (await import('@danielsimonjr/mathts-autograd')) as unknown as AutogradModuleLike;
    tensorMod =
      (await import('@danielsimonjr/mathts-tensor')) as unknown as TensorModuleLike;
  } catch {
    throw new EngineCapabilityError('mathts-autograd', 'reverseGrad');
  }
  const { reverseGrad, TapedTensor } = autograd;
  const { Tensor } = tensorMod;

  // Build the (traced var) → scalar function reverseGrad expects. `x` arrives as
  // a TapedTensor; constants become extra tape leaves (their gradients are
  // computed and ignored — only `x`'s gradient is returned).
  const fn = (x: TapedScalar): TapedScalar => {
    const constLeaf = (v: number): TapedScalar =>
      TapedTensor.fromTensorAsInput(Tensor.fromNested(v, []), x.tape);

    const walk = (node: ExprNode): TapedScalar => {
      if (node.kind === 'symbol') {
        return node.name === varName
          ? x
          : constLeaf(resolveConstant(node.name, bindings));
      }
      if (node.kind === 'op') {
        switch (node.op) {
          case '+':
            return node.args.map(walk).reduce((a, b) => a.add(b));
          case '-': {
            const terms = node.args.map(walk);
            // Unary minus (0 − t); n-ary subtract folds left.
            return terms.length === 1
              ? constLeaf(0).sub(terms[0])
              : terms.reduce((a, b) => a.sub(b));
          }
          case '*':
            return node.args.map(walk).reduce((a, b) => a.mul(b));
          case '/':
            return node.args.map(walk).reduce((a, b) => a.divide(b));
          case '^':
            return walk(node.args[0]).pow(
              resolveExponent(node.args[1], varName, bindings),
            );
          default:
            throw new TypeError(
              `bridgeGradientAST: unsupported operator '${node.op}'.`,
            );
        }
      }
      throw new TypeError(
        `bridgeGradientAST: unsupported node kind '${node.kind}' — the scalar grammar is ` +
          `symbol + op(+ − * / ^). Transcendental bridges encode stubs as symbols.`,
      );
    };

    return walk(rhs);
  };

  const xLeaf = Tensor.fromNested(bindings[varName], []);
  const { value, gradient } = reverseGrad(fn, xLeaf);
  return {
    value: value.toNested() as number,
    gradient: gradient.toNested() as number,
  };
}
