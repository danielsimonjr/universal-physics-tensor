/**
 * In-repo corpus comparison: canonical scalarAst + normalForm.
 * Novelty wording is always corpus-relative.
 *
 * @module composition/probe/corpus
 */

import type { ExprNode } from '../../dimensional/ast-types.js';
import { CANONICAL_EQUATIONS } from '../../canonical/registry.js';
import { normalForm } from '../../canonical/normal-form.js';
import { BRIDGE_RHS_BY_ID } from '../../bridges/rhs-registry.js';
import { monomialToExpr } from './generator.js';

export interface CorpusMatch {
  readonly id: string;
  readonly layer: 'canonical' | 'bridge';
}

export interface CorpusComparisonResult {
  readonly corpusId: string;
  readonly corpusVersion: string;
  readonly exactMatches: readonly CorpusMatch[];
  readonly algebraicMatches: readonly CorpusMatch[];
  readonly searchedAt: string;
}

const CORPUS_ID = 'upt-l-layer+b-layer';

/** Compare an expression to the in-repo L- and B-layers. @internal */
export function compareToCorpus(expr: ExprNode, corpusVersion: string): CorpusComparisonResult {
  const form = normalForm(expr);
  const algebraic: CorpusMatch[] = [];
  for (const ce of CANONICAL_EQUATIONS) {
    if (ce.scalarAst && normalForm(ce.scalarAst) === form) {
      algebraic.push({ id: ce.id, layer: 'canonical' });
    } else if (ce.dimensional?.monomial) {
      const mono = monomialToExpr(ce.dimensional.monomial, [
        ce.dimensional.target,
        ...ce.dimensional.governing,
      ]);
      if (normalForm(mono) === form) {
        algebraic.push({ id: ce.id, layer: 'canonical' });
      }
    }
  }
  for (const [id, rhs] of BRIDGE_RHS_BY_ID.entries()) {
    if (rhs && normalForm(rhs) === form) {
      algebraic.push({ id: `be-${id}`, layer: 'bridge' });
    }
  }
  return {
    corpusId: CORPUS_ID,
    corpusVersion,
    exactMatches: [],
    algebraicMatches: algebraic,
    searchedAt: new Date().toISOString(),
  };
}

/** Allowed automated novelty sentence. @internal */
export function corpusRelativeWording(result: CorpusComparisonResult): string {
  if (result.algebraicMatches.length > 0) {
    const ids = result.algebraicMatches.map((m) => m.id).join(', ');
    return `Algebraic equivalent found in corpus ${result.corpusId}@${result.corpusVersion}: ${ids}`;
  }
  return `No equivalent was found in corpus ${result.corpusId} version ${result.corpusVersion} under equivalence procedures E=normalForm. SCIENTIFIC NOVELTY NOT ESTABLISHED.`;
}
