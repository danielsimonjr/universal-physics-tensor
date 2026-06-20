/**
 * User-equation injection — turn a free-form `TARGET = EXPR` string into a graph
 * junction (a target quantity + its source quantities), resolve the user's
 * symbols onto the catalog vocabulary, suggest near-misses, and report where the
 * injected junction lands in a built {@link VizModel}.
 *
 * Free-form means no dimensions: source quantities are the RHS's free variables
 * — extracted by the active formula parser via {@link getFormulaParser} (the
 * MathTS expression parser when the optional peer is installed, else the built-in
 * one; both already drop constants like `pi`/`tau`, numbers, and functions) —
 * minus the physics {@link CONSTANTS}. Multi-word quantities are typed with
 * underscores; resolution tries the literal form first, then the `_`↔`-` swap, so
 * both the catalog's hyphenated (`photon-energy`) and underscored
 * (`impact_parameter`) names connect.
 *
 * Pure: no file I/O. The injected junction is rendered as an `extraJunction`
 * (status `'user'`) and is never written into the catalog.
 *
 * @module composition/user-equation
 */

import { getFormulaParser } from '../numerical/formula-registry.js';
import { CONSTANTS } from './symbolic-constants.js';
import type { VizModel } from './graph-viz.js';

/** Thrown when a user equation cannot be parsed into a target + sources. @public */
export class UserEquationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UserEquationError';
  }
}

/**
 * A parsed user equation: the target quantity and its source quantities, as
 * written (underscores preserved; constants/numbers/functions removed).
 *
 * @public
 */
export interface UserEquation {
  readonly target: string;
  readonly sources: readonly string[];
  /** The original `TARGET = EXPR` text, for the junction label. */
  readonly text: string;
}

/**
 * Parse `TARGET = EXPR` into `{ target, sources }`. The target is the text left
 * of the first `=`; the sources are the RHS's free variables minus the physics
 * constants.
 *
 * Uses the active formula parser (MathTS when installed, built-in otherwise) to
 * extract the RHS's free variables.
 *
 * @throws {UserEquationError} on a missing `=`, an empty target, an unparseable
 *   RHS, or an RHS with no source quantities.
 * @public
 */
export async function parseUserEquation(equation: string): Promise<UserEquation> {
  const eqIdx = equation.indexOf('=');
  if (eqIdx < 0) {
    throw new UserEquationError(
      `equation must be "TARGET = EXPR" (no "=" found in '${equation}')`,
    );
  }
  const target = equation.slice(0, eqIdx).trim();
  if (!target) throw new UserEquationError('equation has an empty target (left of "=")');
  const rhs = equation.slice(eqIdx + 1).trim();
  if (!rhs) throw new UserEquationError('equation has an empty right-hand side');

  let variables: readonly string[];
  try {
    const parser = await getFormulaParser();
    ({ variables } = parser.parse(rhs));
  } catch (e) {
    throw new UserEquationError(
      `could not parse the right-hand side '${rhs}': ${(e as Error).message}`,
    );
  }
  const sources = variables.filter(
    (v) => !Object.prototype.hasOwnProperty.call(CONSTANTS, v),
  );
  if (sources.length === 0) {
    throw new UserEquationError(
      `no source quantities in '${rhs}' (only constants/numbers?)`,
    );
  }
  return { target, sources, text: equation.trim() };
}

/**
 * Resolve a user symbol to a catalog quantity name: the literal name first, then
 * the `_`→`-` and `-`→`_` swaps, against `catalogNames`. Returns `null` if none
 * match.
 *
 * @public
 */
export function resolveToCatalogName(
  name: string,
  catalogNames: ReadonlySet<string>,
): string | null {
  if (catalogNames.has(name)) return name;
  const underToHyphen = name.replace(/_/g, '-');
  if (underToHyphen !== name && catalogNames.has(underToHyphen)) return underToHyphen;
  const hyphenToUnder = name.replace(/-/g, '_');
  if (hyphenToUnder !== name && catalogNames.has(hyphenToUnder)) return hyphenToUnder;
  return null;
}

/** Levenshtein edit distance (small DP). */
function editDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  let curr = new Array<number>(n + 1);
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

/** Normalize for comparison: lowercase, `_`/`-` unified. */
const normalizeForCompare = (s: string): string => s.toLowerCase().replace(/[_-]/g, '-');

/**
 * Up to `k` catalog names most similar to `name` — the "did you mean?" set for an
 * unmatched user symbol. Names where one string contains the other rank first,
 * then by edit distance, then by length.
 *
 * @public
 */
export function suggestQuantities(
  name: string,
  catalogNames: Iterable<string>,
  k = 5,
): string[] {
  const needle = normalizeForCompare(name);
  // Relevance gate: keep a candidate only if one name contains the other or the
  // edit distance is small relative to the query length — otherwise short catalog
  // names (`a`, `nu`) are spurious "matches" for any typo.
  const maxDist = Math.max(1, Math.ceil(needle.length / 2));
  return [...catalogNames]
    .map((cand) => {
      const hay = normalizeForCompare(cand);
      const contains = hay.includes(needle) || needle.includes(hay) ? 0 : 1;
      return { cand, contains, dist: editDistance(needle, hay) };
    })
    .filter((s) => s.contains === 0 || s.dist <= maxDist)
    .sort(
      (x, y) =>
        x.contains - y.contains ||
        x.dist - y.dist ||
        x.cand.length - y.cand.length ||
        x.cand.localeCompare(y.cand),
    )
    .slice(0, k)
    .map((s) => s.cand);
}

/**
 * Where the injected user junction landed, computed from a built `VizModel`.
 *
 * @public
 */
export interface EquationLanding {
  readonly isolated: boolean;
  /** Junctions in the user equation's connected component (including itself). */
  readonly clusterSize: number;
  /** The component holds a law/established junction (anchored to known physics). */
  readonly anchored: boolean;
  /** User-equation quantities that also appear in a neighbouring junction. */
  readonly sharedQuantities: readonly string[];
  /** Other junction ids in the user equation's component. */
  readonly connectedJunctionIds: readonly string[];
}

/**
 * Describe where `userJunctionId` sits in `model`: its component, the junctions it
 * connects to, and the quantities that link it to them.
 *
 * @public
 */
export function equationLanding(model: VizModel, userJunctionId: string): EquationLanding {
  const cluster = model.clusters.find((c) => c.junctionIds.includes(userJunctionId));
  const self = model.junctions.find((j) => j.id === userJunctionId);
  if (!cluster || !self) {
    return { isolated: true, clusterSize: 1, anchored: false, sharedQuantities: [], connectedJunctionIds: [] };
  }
  const connectedJunctionIds = cluster.junctionIds.filter((id) => id !== userJunctionId);
  const selfQuantities = new Set([...self.sources, self.target]);
  const neighbourQuantities = new Set<string>();
  for (const j of model.junctions) {
    if (j.id === userJunctionId || !cluster.junctionIds.includes(j.id)) continue;
    for (const qn of [...j.sources, j.target]) neighbourQuantities.add(qn);
  }
  const sharedQuantities = [...selfQuantities].filter((qn) => neighbourQuantities.has(qn)).sort();
  return {
    isolated: cluster.size === 1,
    clusterSize: cluster.size,
    anchored: cluster.anchored,
    sharedQuantities,
    connectedJunctionIds,
  };
}
