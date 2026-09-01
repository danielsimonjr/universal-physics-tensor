/**
 * Candidate fingerprints — `normalForm` is the cheap algebraic hash.
 *
 * @module composition/probe/fingerprint
 */

import type { ExprNode } from '../../dimensional/ast-types.js';
import { validate } from '../../dimensional/validator.js';
import { format } from '../../dimensional/algebra.js';
import { normalForm } from '../../canonical/normal-form.js';
import { hashCanonical, sha256Hex } from './serialize.js';
import type { CandidateFingerprint, ComplexityMetrics, ProbeCandidateBody } from './types.js';

/** Expression of a probe body. @internal */
export function bodyExpression(body: ProbeCandidateBody): ExprNode {
  return body.kind === 'scalar-expr' ? body.expression : body.correction;
}

/** Recursively count AST nodes. @internal */
export function countAstNodes(node: ExprNode): number {
  switch (node.kind) {
    case 'symbol':
      return 1;
    case 'op':
      return 1 + node.args.reduce((n, a) => n + countAstNodes(a), 0);
    case 'transcendental':
    case 'abs':
    case 'dirac-delta':
      return 1 + countAstNodes(node.arg);
    case 'integral':
      return (
        1 +
        countAstNodes(node.integrand) +
        countAstNodes(node.over) +
        (node.lower ? countAstNodes(node.lower) : 0) +
        (node.upper ? countAstNodes(node.upper) : 0)
      );
    case 'derivative':
      return 1 + countAstNodes(node.of) + countAstNodes(node.wrt);
    case 'variational-derivative':
      return 1 + countAstNodes(node.functional) + countAstNodes(node.field) + countAstNodes(node.over);
    default:
      return 1;
  }
}

/** Operator / transcendental count. @internal */
export function countOperators(node: ExprNode): number {
  switch (node.kind) {
    case 'op':
      return 1 + node.args.reduce((n, a) => n + countOperators(a), 0);
    case 'transcendental':
      return 1 + countOperators(node.arg);
    case 'abs':
    case 'dirac-delta':
      return countOperators(node.arg);
    case 'integral':
      return (
        1 +
        countOperators(node.integrand) +
        countOperators(node.over) +
        (node.lower ? countOperators(node.lower) : 0) +
        (node.upper ? countOperators(node.upper) : 0)
      );
    case 'derivative':
      return 1 + countOperators(node.of) + countOperators(node.wrt);
    default:
      return 0;
  }
}

/** Max `^` numeric exponent used as a derivative-order proxy for monomials. @internal */
export function maxPowerOrder(node: ExprNode): number {
  if (node.kind === 'op' && node.op === '^' && node.args[1]?.kind === 'symbol') {
    const e = Math.abs(Number(node.args[1].name));
    return Number.isFinite(e) ? e : 0;
  }
  if (node.kind === 'op') return Math.max(0, ...node.args.map(maxPowerOrder));
  if (node.kind === 'transcendental' || node.kind === 'abs') return maxPowerOrder(node.arg);
  return 0;
}

/** Complexity metrics for an expression. @internal */
export function complexityOf(node: ExprNode, freeParameters = 1): ComplexityMetrics {
  const astNodes = countAstNodes(node);
  const operators = countOperators(node);
  return {
    astNodes,
    operators,
    freeParameters,
    derivativeOrder: Math.round(maxPowerOrder(node)),
    descriptionLength: astNodes + operators,
  };
}

/** Fingerprint an expression under optional regime/assumption signatures. @internal */
export function fingerprintExpr(
  node: ExprNode,
  regimeSignature = '',
  assumptionSignature = '',
): CandidateFingerprint {
  const syntaxHash = hashCanonical(node);
  const canonicalAstHash = sha256Hex(normalForm(node));
  const v = validate(node);
  const dimensionalSignature = v.inferredDimension ? format(v.inferredDimension) : 'invalid';
  return {
    syntaxHash,
    canonicalAstHash,
    dimensionalSignature,
    regimeSignature,
    assumptionSignature: sha256Hex(assumptionSignature),
  };
}
