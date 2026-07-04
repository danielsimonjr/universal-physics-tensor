/**
 * Confrontation registry — maps a bridge id to a normalized
 * `ConfrontationOutcome`-producing `run()`. Wraps the three existing
 * confrontation modules (be-23/36/52) behind the unified outcome shape and
 * hosts the new confrontations. `DATA_CONFRONTED_IDS` is a projection of
 * this registry's keyset (single source of truth). Confrontations are
 * ORTHOGONAL to the discovery funnel — nothing here imports discovery.
 *
 * @module bridges/confrontations
 */
import type { ConfrontationOutcome, ObservationKind } from './observations/types.js';
import { residualInSigma } from './observations/types.js';
import { confrontBE52 } from './be52-mercury-confrontation.js';
import { confrontBE37 } from './be37-cassini-confrontation.js';
import { confrontBE36 } from './be36-gw170817-confrontation.js';
import { confrontBE23 } from './be23-planckian-confrontation.js';
import { confrontBE48 } from './be48-collapse-confrontation.js';
import { confrontBE51 } from './be51-lensing-confrontation.js';

/** One registered confrontation. @public */
export interface ConfrontationEntry {
  readonly bridgeId: number;
  readonly title: string;
  readonly kind: ObservationKind;
  run(): ConfrontationOutcome;
}

const be52Entry: ConfrontationEntry = {
  bridgeId: 52,
  title: 'GR perihelion precession vs Mercury (Clemence 1947)',
  kind: 'value',
  run() {
    const r = confrontBE52();
    return {
      kind: 'value',
      predicted: r.predicted_arcsec_per_century,
      observed: r.observed_arcsec_per_century,
      sigma: r.observation.observed_sigma_arcsec_per_century,
      residualInSigma: r.residual_in_sigma,
      withinObserved: r.withinObserved,
      units: 'arcsec/century',
      provenance: { citation: r.observation.citation, year: 1947, retrieved: '2026-07-02' },
    };
  },
};

const be23Entry: ConfrontationEntry = {
  bridgeId: 23,
  title: 'Planckian dissipation α vs overdoped cuprates (Legros 2019)',
  kind: 'value',
  run() {
    const r = confrontBE23();
    // withinObserved means "within 1σ" (see ConfrontationOutcome / the CLI's
    // "within 1σ ✓" label) — derive it from the residual, not from
    // r.withinPlanckianBand (a separate O(1)-band membership check that can
    // diverge from the residual verdict away from the committed α).
    return {
      kind: 'value',
      predicted: 1.0,
      observed: r.alphaAggregate,
      sigma: r.alphaAggregateErr,
      residualInSigma: residualInSigma(1.0, r.alphaAggregate, r.alphaAggregateErr),
      withinObserved: residualInSigma(1.0, r.alphaAggregate, r.alphaAggregateErr) <= 1,
      units: 'dimensionless (α)',
      provenance: { citation: r.observation.citation, year: 2019, retrieved: '2026-07-02' },
    };
  },
};

// be-36 upper-bound confrontation. VERIFIED field names (BE36ConfrontationResult,
// be36-gw170817-confrontation.ts:76-93): upperBound, lowerBound, encodedBound,
// passesEncodedBound, observation. It is two-sided; map BE-36's encoded bound
// as `predicted` and the observational positive-side bound as `bound`, with
// `passesEncodedBound` as `satisfied`. GWSpeedObservation's citation field is
// named `citation` (verified at be36-gw170817-confrontation.ts:51).
const be36Entry: ConfrontationEntry = {
  bridgeId: 36,
  title: 'GW speed vs GW170817 bound',
  kind: 'upper-bound',
  run() {
    const r = confrontBE36();
    return {
      kind: 'upper-bound',
      predicted: r.encodedBound,
      bound: r.upperBound,
      satisfied: r.passesEncodedBound,
      units: '|c_GW − c| / c (dimensionless)',
      provenance: {
        citation: r.observation.citation,
        year: 2017,
        retrieved: '2026-07-02',
        note: `two-sided bound: upper ${r.upperBound}, lower ${r.lowerBound}; encoded |ratio| ≤ ${r.encodedBound}`,
      },
    };
  },
};

const be37Entry: ConfrontationEntry = {
  bridgeId: 37,
  title: 'GR Shapiro delay (PPN γ) vs Cassini (Bertotti 2003)',
  kind: 'value',
  run() {
    const r = confrontBE37();
    return {
      kind: 'value',
      predicted: r.predicted_gamma,
      observed: r.observed_gamma,
      sigma: r.observation.observed_gamma_sigma,
      residualInSigma: r.residual_in_sigma,
      withinObserved: r.withinObserved,
      units: 'PPN γ (dimensionless)',
      provenance: r.observation.provenance,
    };
  },
};

const be48Entry: ConfrontationEntry = {
  bridgeId: 48,
  title: 'GRW collapse rate vs LISA-Pathfinder bound (Carlesso 2016)',
  kind: 'upper-bound',
  run() {
    const r = confrontBE48();
    return {
      kind: 'upper-bound',
      predicted: r.predicted_rate_per_s,
      bound: r.bound_rate_per_s,
      satisfied: r.satisfied,
      units: 's⁻¹ (collapse rate)',
      provenance: r.observation.provenance,
    };
  },
};

const be51Entry: ConfrontationEntry = {
  bridgeId: 51,
  title: 'GR light deflection (PPN γ) vs VLBI (Lambert 2009)',
  kind: 'value',
  run() {
    const r = confrontBE51();
    return {
      kind: 'value',
      predicted: r.predicted_arcsec,
      observed: r.observed_arcsec,
      sigma: r.observed_sigma_arcsec,
      residualInSigma: r.residual_in_sigma,
      withinObserved: r.withinObserved,
      units: 'arcsec (solar-limb deflection)',
      provenance: r.observation.provenance,
    };
  },
};

const REGISTRY = new Map<number, ConfrontationEntry>([
  [23, be23Entry],
  [36, be36Entry],
  [37, be37Entry],
  [48, be48Entry],
  [51, be51Entry],
  [52, be52Entry],
]);

/** The registry (frozen view). @public */
export const CONFRONTATIONS: ReadonlyMap<number, ConfrontationEntry> = REGISTRY;

/** All entries, in ascending bridge-id order. @public */
export function listConfrontations(): ConfrontationEntry[] {
  return [...REGISTRY.values()].sort((a, b) => a.bridgeId - b.bridgeId);
}

/** Run one confrontation; `undefined` if the id is not registered. @public */
export function runConfrontation(bridgeId: number): ConfrontationOutcome | undefined {
  return REGISTRY.get(bridgeId)?.run();
}
