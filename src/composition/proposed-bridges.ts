/**
 * Identity-consequence surfacer — turns a `promising` discovery identification
 * into the ONE algebraic relation it implies, as an UNADJUDICATED proposal.
 *
 * When the discovery funnel flags `a ≟ b` (two canonical quantities of equal
 * dimension), and `a`, `b` are the TARGETS of two canonical equations `Eₐ`, `E_b`,
 * the hypothesised identity `a ≡ b` makes their right-hand sides equal:
 *
 *     Eₐ.scalarAst  =  E_b.scalarAst
 *
 * Eliminating (isolating) one free variable yields a relation among the union of
 * the two governing sets — e.g. Landauer `k_B T ln2` ≟ Planck–Einstein `h ν`
 * gives `ν = (k_B ln2 / h) · T`, the "Landauer photon".
 *
 * CRITICAL — this is NOT new physics and NOT a bridge. It is the algebraic
 * consequence of an UNADJUDICATED identification, surfaced for a physicist to
 * judge (Part-VI §XXVII-B: the enumerator proposes, humans dispose). Every
 * emitted record carries `status: 'unadjudicated'` — a literal that is NOT a
 * member of `BridgeEquationStatus`, so a proposal can never be assigned where a
 * catalog entry is expected. The generator NEVER writes `BRIDGE_EQUATIONS` and a
 * proposal is NEVER added to `CANONICAL_GRAPH` (no coincidence-amplifying loop).
 *
 * Scope (v0.24.0 pilot): canonical-only `promising` candidates whose BOTH source
 * equations (a) have a non-null `dimensional.monomial` (determinate) and (b) are
 * `epistemicStatus: 'fully-quantitative'` (so the eliminated prefactor is a
 * closed numeric constant, not an operator-valued stub — this gates out
 * `CE-jarzynski`). See `docs/planning/v0.24.0-{Design,Review-Findings}.md`.
 *
 * INTERNAL tooling — deliberately NOT re-exported from `src/index.ts`.
 *
 * @module composition/proposed-bridges
 */

import type { ExprNode } from '../dimensional/validator.js';
import { validate } from '../dimensional/validator.js';
import type { Dimension } from '../dimensional/types.js';
import { DIMENSIONLESS } from '../dimensional/types.js';
import { equals, format } from '../dimensional/algebra.js';
import type { DimensionalVariable } from '../dimensional/buckingham.js';
import type { BridgeEquationStatus } from '../bridges/index.js';
import { canonicalByTarget } from '../canonical/registry.js';
import { CONSTANTS } from './symbolic-constants.js';
import { evalExpr } from './expr-eval.js';
import { rankDiscoveries } from './discovery.js';
import type { VettedCandidate } from './discovery.js';
import { CANONICAL_GRAPH } from './canonical-graph.js';

// ── monomial algebra over flat ExprNode forms ───────────────────────────────

/** A flat monomial: leaf name → its dimension and (signed, possibly rational)
 *  exponent. `k_B·T·ln2 / h` ⇒ {k_B:+1, T:+1, ln2:+1, h:-1}. */
type Mono = Map<string, { dim: Dimension; exp: number }>;

/** Thrown when an AST is not a product / quotient / integer-power of symbols. */
export class NotAMonomialError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotAMonomialError';
  }
}

function mergeInto(into: Mono, from: Mono, scale: number): void {
  for (const [name, { dim, exp }] of from) {
    const cur = into.get(name);
    if (cur === undefined) {
      into.set(name, { dim, exp: exp * scale });
    } else {
      if (!equals(cur.dim, dim)) {
        throw new NotAMonomialError(
          `leaf '${name}' appears with inconsistent dimensions`,
        );
      }
      cur.exp += exp * scale;
    }
  }
}

/**
 * Decompose a flat-monomial `ExprNode` into a leaf→exponent map. Throws
 * `NotAMonomialError` on sums, differences, or non-symbol bases — this is the
 * AST-level monomial gate.
 */
export function toMonomial(ast: ExprNode): Mono {
  const out: Mono = new Map();
  switch (ast.kind) {
    case 'symbol':
      out.set(ast.name, { dim: ast.dim, exp: 1 });
      return out;
    case 'op':
      switch (ast.op) {
        case '*':
          for (const a of ast.args) mergeInto(out, toMonomial(a), 1);
          return out;
        case '/': {
          const [num, ...dens] = ast.args;
          mergeInto(out, toMonomial(num), 1);
          for (const d of dens) mergeInto(out, toMonomial(d), -1);
          return out;
        }
        case '^': {
          const [base, expNode] = ast.args;
          if (expNode.kind !== 'symbol') {
            throw new NotAMonomialError('non-literal exponent');
          }
          const n = Number(expNode.name);
          if (!Number.isFinite(n)) {
            throw new NotAMonomialError(`non-numeric exponent '${expNode.name}'`);
          }
          mergeInto(out, toMonomial(base), n);
          return out;
        }
        default:
          throw new NotAMonomialError(`operator '${ast.op}' is not monomial`);
      }
    default:
      throw new NotAMonomialError(`node kind '${ast.kind}' is not monomial`);
  }
}

function sym(name: string, dim: Dimension): ExprNode {
  return { kind: 'symbol', name, dim };
}

/** Rebuild a flat-monomial `ExprNode` from a leaf→exponent map (numerator =
 *  positive exponents, denominator = negative). Zero exponents drop out. */
export function fromMonomial(m: Mono): ExprNode {
  const factor = (name: string, dim: Dimension, e: number): ExprNode =>
    e === 1
      ? sym(name, dim)
      : { kind: 'op', op: '^', args: [sym(name, dim), sym(String(e), DIMENSIONLESS)] };

  const num: ExprNode[] = [];
  const den: ExprNode[] = [];
  for (const [name, { dim, exp }] of [...m].sort((a, b) => a[0].localeCompare(b[0]))) {
    if (exp === 0) continue;
    if (exp > 0) num.push(factor(name, dim, exp));
    else den.push(factor(name, dim, -exp));
  }
  const product = (xs: ExprNode[]): ExprNode =>
    xs.length === 1 ? xs[0] : { kind: 'op', op: '*', args: xs };

  const numerator = num.length === 0 ? sym('1', DIMENSIONLESS) : product(num);
  if (den.length === 0) return numerator;
  return { kind: 'op', op: '/', args: [numerator, product(den)] };
}

// ── the proposal record ─────────────────────────────────────────────────────

/**
 * A machine-DERIVED candidate bridge — the MATH ONLY. The algebraic consequence
 * of an UNADJUDICATED identification; never a status claim. Structurally distinct
 * from `BridgeEquationEntry` (omits every physics-judgment field) and carries the
 * literal `status: 'unadjudicated'`, which is NOT a `BridgeEquationStatus`.
 *
 * @internal
 */
export interface ProposedBridge {
  /** `IC-<sorted-a>--<sorted-b>--<solvedFor>`. */
  readonly id: string;
  readonly derivedFrom: {
    readonly identification: { readonly a: string; readonly b: string; readonly dim: string };
    readonly sourceEquationIds: readonly [string, string];
    readonly solvedFor: string;
  };
  readonly target: DimensionalVariable;
  /** Free (non-constant) inputs of the derived relation. */
  readonly governing: readonly DimensionalVariable[];
  readonly formulaLatex: string;
  /** Dimensionally-VALIDATED derived RHS (round-trips to `dimensionalSignature`). */
  readonly scalarAst: ExprNode;
  /** `format()` of the inferred dimension — same convention as the catalog. */
  readonly dimensionalSignature: string;
  /** Mechanical derivation description — NO physics claim. */
  readonly provenance: string;
  /** ALWAYS the literal 'unadjudicated'. NOT a BridgeEquationStatus. */
  readonly status: 'unadjudicated';
  /** Numerically evaluate the derived RHS; constants auto-resolve, supply the
   *  free `governing` leaves (e.g. `{ T: 300 }`). */
  evaluate(values: Readonly<Record<string, number>>): number;
}

const isConstant = (name: string): boolean =>
  Object.prototype.hasOwnProperty.call(CONSTANTS, name);

/** The single non-constant leaf of a monomial, or null if 0 or >1. */
function uniqueNonConstantLeaf(m: Mono): { name: string; dim: Dimension; exp: number } | null {
  const free = [...m].filter(([name]) => !isConstant(name));
  if (free.length !== 1) return null;
  const [name, { dim, exp }] = free[0];
  return { name, dim, exp };
}

function latexFromMono(m: Mono): string {
  const num: string[] = [];
  const den: string[] = [];
  for (const [name, { exp }] of [...m].sort((a, b) => a[0].localeCompare(b[0]))) {
    if (exp === 0) continue;
    const tok = Math.abs(exp) === 1 ? name : `${name}^{${Math.abs(exp)}}`;
    (exp > 0 ? num : den).push(tok);
  }
  const n = num.join(' \\cdot ') || '1';
  return den.length ? `\\frac{${n}}{${den.join(' \\cdot ')}}` : n;
}

// ── the generator ───────────────────────────────────────────────────────────

const uniqueTarget = (name: string) => {
  const hits = canonicalByTarget(name);
  return hits.length === 1 ? hits[0] : null;
};

/**
 * Derive the implied relation for each `promising` canonical identification.
 * Returns ONE proposal per admissible candidate (Adam M2). Pure; reads the
 * canonical graph, writes nothing.
 *
 * @internal
 */
export function deriveProposedBridges(
  candidates: readonly VettedCandidate[] = rankDiscoveries(CANONICAL_GRAPH),
): readonly ProposedBridge[] {
  const out: ProposedBridge[] = [];

  for (const cand of candidates) {
    if (cand.verdict !== 'promising') continue;

    const [t0, t1] = [cand.a, cand.b].sort();
    const E1 = uniqueTarget(t0);
    const E2 = uniqueTarget(t1);
    if (!E1 || !E2) continue; // missing or ambiguous target → skip (Eve E1)

    // Gate 1 — determinacy: both forms must be dimensionally pinned.
    if (E1.dimensional.monomial === null || E2.dimensional.monomial === null) continue;
    // Gate 2 — constant prefactor: excludes operator-stub forms (Jarzynski).
    if (E1.epistemicStatus !== 'fully-quantitative') continue;
    if (E2.epistemicStatus !== 'fully-quantitative') continue;
    if (!E1.scalarAst || !E2.scalarAst) continue;

    let m1: Mono;
    let m2: Mono;
    try {
      m1 = toMonomial(E1.scalarAst);
      m2 = toMonomial(E2.scalarAst);
    } catch (e) {
      if (e instanceof NotAMonomialError) continue;
      throw e;
    }

    const solveFor = uniqueNonConstantLeaf(m2);
    if (!solveFor) continue; // no single observable to isolate
    if (m1.has(solveFor.name)) continue; // degenerate overlap (Design §5.2)

    // Isolate solveFor from `m1 = m2`:  solveFor^e = m1 / (m2 without solveFor).
    const result: Mono = new Map();
    mergeInto(result, m1, 1);
    const m2NoSolve: Mono = new Map(m2);
    m2NoSolve.delete(solveFor.name);
    mergeInto(result, m2NoSolve, -1);
    if (solveFor.exp !== 1) {
      for (const v of result.values()) v.exp /= solveFor.exp;
    }

    const scalarAst = fromMonomial(result);
    const dim = validate(scalarAst).inferredDimension;
    if (!dim || !equals(dim, solveFor.dim)) continue; // round-trip guard

    const governing: DimensionalVariable[] = [...result]
      .filter(([name]) => !isConstant(name))
      .map(([name, { dim: d }]) => ({ name, dim: d }));

    const id = `IC-${t0}--${t1}--${solveFor.name}`;
    const provenance =
      `Monomial elimination of the UNADJUDICATED identification ${cand.a} ≡ ${cand.b} ` +
      `(${E1.id}.rhs = ${E2.id}.rhs), solved for '${solveFor.name}'. ` +
      `Algebraic consequence of a hypothesised identity — NOT a new physical ` +
      `relation and NOT a bridge. Invertible (any free leaf may be isolated).`;

    out.push({
      id,
      derivedFrom: {
        identification: { a: cand.a, b: cand.b, dim: cand.dim },
        sourceEquationIds: [E1.id, E2.id],
        solvedFor: solveFor.name,
      },
      target: { name: solveFor.name, dim: solveFor.dim },
      governing,
      formulaLatex: `${solveFor.name} = ${latexFromMono(result)}`,
      scalarAst,
      dimensionalSignature: format(dim),
      provenance,
      status: 'unadjudicated',
      evaluate: (values) => evalExpr(scalarAst, values),
    });
  }

  return out;
}

// ── promotion gate (guardrail #5) ───────────────────────────────────────────

/** The human inputs a proposal CANNOT supply — fabricating them is forbidden. */
export interface PromotionEvidence {
  /** Literature anchor establishing the relation (appears / contradicts / neither). */
  readonly citation: string;
  /** Human-chosen catalog status — never defaulted. */
  readonly status: BridgeEquationStatus;
  /** Path to the recorded adversarial + literature review. */
  readonly reviewRef: string;
}

/** A review-ready promotion request — the artifact a human turns into a catalog
 *  entry. Holding one does NOT mutate `BRIDGE_EQUATIONS`. */
export interface PromotionRequest {
  readonly proposal: ProposedBridge;
  readonly evidence: PromotionEvidence;
}

export class MissingEvidenceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MissingEvidenceError';
  }
}

/**
 * Gate a proposal toward the catalog. THROWS `MissingEvidenceError` unless every
 * human input is present and non-blank (operationalises "null, not guessed").
 * Returns a `PromotionRequest`; it deliberately does NOT synthesise a
 * `BridgeEquationEntry` — the physics-judgment fields are human work.
 *
 * @internal
 */
export function promoteProposal(
  proposal: ProposedBridge,
  evidence: PromotionEvidence,
): PromotionRequest {
  const blank = (s: unknown): boolean => typeof s !== 'string' || s.trim() === '';
  if (blank(evidence.citation)) throw new MissingEvidenceError('citation required');
  if (blank(evidence.reviewRef)) throw new MissingEvidenceError('reviewRef required');
  if (!evidence.status) throw new MissingEvidenceError('status required (not defaulted)');
  return { proposal, evidence };
}
