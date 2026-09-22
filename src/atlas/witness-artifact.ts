/**
 * Atlas Phase 4, S4.3 — the witness-results ARTIFACT: its shape, the run that
 * produces it, and the one reader that turns it into passing witness ids.
 *
 * Design note: `docs/planning/Atlas-Phase-4-Design.md` §3.
 *
 * **The load-bearing invariant: no test writes the artifact.** The Lead runs
 * `scripts/emit-witness-results.mjs`, which calls {@link runWitnessRegistry}
 * and writes `data/atlas/witness-results.json`. `tests/atlas/witness-results.test.ts`
 * deep-equals the committed file against a fresh in-process run — the
 * `atlas-json` pattern. A test that wrote the artifact would certify whatever
 * the last run happened to produce, which is the opposite of a check.
 *
 * **The artifact is deterministic by construction.** `elapsedMs` is dropped:
 * wall-clock time differs on every run, and a pin that deep-equals it could
 * never pass twice. Everything kept is a function of the specs and the peer.
 *
 * @module atlas/witness-artifact
 * @internal
 */

import type { Convergence } from './witness-numeric.js';
import { runNumericWitness } from './witness-numeric.js';
import type { UnresolvedReason, WitnessRunResult, WitnessStatus } from './witness-result.js';
import type { SymbolicSimplifier } from './witness-symbolic.js';
import { runSymbolicWitness } from './witness-symbolic.js';
import type { RegisteredWitness } from './witness-specs.js';
import { WITNESS_REGISTRY } from './witness-specs.js';

/** One row of the artifact. @internal */
export interface WitnessResultRecord {
  readonly recordId: string;
  readonly witnessId: string;
  readonly kind: 'symbolic' | 'numeric';
  readonly status: WitnessStatus;
  /** Present iff `status === 'unresolved'`. */
  readonly reason?: UnresolvedReason;
  readonly detail: string;
  /** Numeric witnesses only, and only when a number was produced. */
  readonly convergence?: Convergence;
}

/** The committed artifact, `data/atlas/witness-results.json`. @internal */
export interface WitnessResultsArtifact {
  readonly schemaVersion: '0';
  readonly results: readonly WitnessResultRecord[];
}

/**
 * Run every registered witness and assemble the artifact.
 *
 * @param registry - the witnesses to run; defaults to {@link WITNESS_REGISTRY}.
 * @param simplifier - forwarded to `runSymbolicWitness`. Omit it for the real
 * peer (resolved through `isSimplifierAvailable()`); pass `null` to run every
 * symbolic witness as peer-absent.
 * @returns the artifact; never throws, because neither runner does.
 * @internal
 */
export async function runWitnessRegistry(
  registry: readonly RegisteredWitness[] = WITNESS_REGISTRY,
  simplifier?: SymbolicSimplifier | null,
): Promise<WitnessResultsArtifact> {
  const results: WitnessResultRecord[] = [];
  for (const entry of registry) {
    // Sequential on purpose: the order of the artifact is the order of the
    // registry, and a symbolic run's timeout budget should not compete with
    // its neighbours for the event loop.
    let run: WitnessRunResult;
    let convergence: Convergence | undefined;
    if (entry.kind === 'symbolic') {
      run = await runSymbolicWitness(entry.spec, simplifier);
    } else {
      const numeric = runNumericWitness(entry.spec);
      run = numeric;
      convergence = numeric.convergence;
    }
    results.push({
      recordId: entry.recordId,
      witnessId: run.witnessId,
      kind: run.kind,
      status: run.status,
      ...(run.reason === undefined ? {} : { reason: run.reason }),
      detail: run.detail,
      ...(convergence === undefined ? {} : { convergence }),
    });
  }
  return { schemaVersion: '0', results };
}

/**
 * The ids of witnesses of `recordId` that the artifact records as `'checked'`
 * — the value to pass as `deriveEvidence`'s `passingWitnessIds` for the
 * artifact-governed kinds.
 *
 * Only `'checked'` counts. An `'unresolved'` row (peer absent, timeout, an
 * irreducible difference) is not a pass, and admitting it would hand
 * `symbolically-checked` to a claim nobody examined.
 *
 * @internal
 */
export function artifactPassingWitnessIds(
  artifact: WitnessResultsArtifact,
  recordId: string,
): ReadonlySet<string> {
  return new Set(
    artifact.results
      .filter((r) => r.recordId === recordId && r.status === 'checked')
      .map((r) => r.witnessId),
  );
}
