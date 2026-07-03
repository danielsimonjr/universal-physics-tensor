# Discovery-Hardening Phase 3 (v0.33.0) — Evidence Channels: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Widen UPT's real-data confrontation channel from 3 bridges to 5 behind one `upt confront` CLI verb, with a typed observation registry and a dimensionless deciding-measurement (elasticity) ranking.

**Architecture:** A typed observation/outcome layer (`src/bridges/observations/`) defines a `ConfrontationOutcome` discriminated union by kind; a confrontation registry (`src/bridges/confrontations.ts`) maps bridge id → a normalized `run()`, wrapping the three existing confrontations and adding two new ones (be-37 Cassini, be-48 LISA-Pathfinder); `DATA_CONFRONTED_IDS` becomes a sorted projection of the registry keyset; a new thin CLI command surfaces it. All values are primary-source-verified (see `docs/research/phase3-dataset-verification.md`).

**Tech Stack:** TypeScript 6 strict ESM (`.js` import suffixes), vitest 4, zero hard deps. No new dependencies.

## Global Constraints

- **Zero fabricated physics data.** Every number traces to `docs/research/phase3-dataset-verification.md` (which traces to a primary source). This plan contains ONLY the be-37 and be-48 datasets, both fully verified there. be-16, the be-23 per-material upgrade, and be-38 are OUT OF SCOPE here (paywalled/contingent numbers) and queued in todo.md — do not invent their values.
- **Epistemic firewall.** Confrontation results annotate output; they never mutate catalog `status:` fields.
- **Funnel benchmark is byte-identical.** Confrontations are orthogonal to the discovery funnel — `confront` must never call `rankDiscoveries`. `tests/composition/discovery-calibration.test.ts` must pass unchanged.
- **Scorecard goldens move intentionally.** Adding a confrontation grows `DATA_CONFRONTED_IDS`, which `composition/bridge-analysis.ts:288` reads for the scorecard's `hasDataConfrontation` flag. Any `upt priority` / `upt coverage` golden that shows the data column is re-pinned in the SAME task that adds the confrontation. This is the intended signal, distinct from the funnel benchmark.
- **`.js` import suffixes** on every relative import (strict ESM).
- **`npm run build` before any golden/smoke run** (goldens run against `dist/`).
- **Commit footer:**
  ```
  Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01UFjZjaRC56TAw5wsgJ6ygb
  ```

## File structure

| File | Responsibility |
|---|---|
| `src/bridges/observations/types.ts` (create) | `ObservationProvenance`, `ObservationKind`, `ConfrontationOutcome` discriminated union, `SigmaComponent`; pure helpers `residualInSigma`, `combineInQuadrature`. |
| `src/bridges/confrontations.ts` (create) | `ConfrontationEntry`, `CONFRONTATIONS` map, `runConfrontation`/`listConfrontations`; wraps be-23/36/52, hosts be-37/be-48 registrations. |
| `src/bridges/confrontation-coverage.ts` (modify) | `DATA_CONFRONTED_IDS` becomes a sorted projection of `CONFRONTATIONS.keys()`. |
| `src/bridges/be37-cassini-confrontation.ts` (create) | be-37 Shapiro/PPN-γ confrontation + `CASSINI` observation record. |
| `src/bridges/be48-collapse-confrontation.ts` (create) | be-48 GRW-rate vs LISA-Pathfinder CSL bound + `LISA_PATHFINDER_CSL` record. |
| `src/bridges/sensitivity.ts` (create) | `decidingMeasurement(bridgeId)` — elasticity ranking over confrontation inputs. |
| `src/cli/commands/confront.ts` (create) | `upt confront [--bridge] [--sensitivity] [--json]`. |
| `src/cli/commands/index.ts` (modify) | `import './confront.js';` |
| `src/cli-api.ts` (modify) | Re-export the confront registry + new confrontations for `ctx.api`. |
| `src/index.ts` (modify) | Public exports for the new symbols. |
| `tests/bridges/*.test.ts`, `tests/cli/*` (create/modify) | Per-task tests + goldens. |

---

### Task 1: Observation types + outcome helpers

**Files:**
- Create: `src/bridges/observations/types.ts`
- Test: `tests/bridges/observation-types.test.ts`

**Interfaces:**
- Produces: `ObservationProvenance`, `SigmaComponent`, `ObservationKind`, `ConfrontationOutcome` (union), `residualInSigma(predicted, observed, sigma): number`, `combineInQuadrature(components): number`.

- [ ] **Step 1: Write the failing test**

```ts
// tests/bridges/observation-types.test.ts
import { describe, it, expect } from 'vitest';
import { residualInSigma, combineInQuadrature } from '../../src/bridges/observations/types.js';

describe('residualInSigma', () => {
  it('computes |predicted - observed| / sigma', () => {
    // be-37 Cassini: predicted gamma = 1, observed = 1 + 2.1e-5, sigma = 2.3e-5
    expect(residualInSigma(1, 1 + 2.1e-5, 2.3e-5)).toBeCloseTo(2.1e-5 / 2.3e-5, 10);
  });
  it('throws on non-finite or non-positive sigma', () => {
    expect(() => residualInSigma(1, 1, 0)).toThrow(RangeError);
    expect(() => residualInSigma(1, 1, -1)).toThrow(RangeError);
    expect(() => residualInSigma(1, 1, Number.NaN)).toThrow(RangeError);
  });
});

describe('combineInQuadrature', () => {
  it('combines components as sqrt(sum of squares)', () => {
    // SPARC-style: stat 0.02, sys 0.24 -> sqrt(0.02^2 + 0.24^2)
    expect(combineInQuadrature([
      { label: 'stat', value: 0.02 },
      { label: 'sys', value: 0.24 },
    ])).toBeCloseTo(Math.hypot(0.02, 0.24), 12);
  });
  it('throws on an empty component list', () => {
    expect(() => combineInQuadrature([])).toThrow(RangeError);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/bridges/observation-types.test.ts`
Expected: FAIL — module `src/bridges/observations/types.js` does not exist.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/bridges/observations/types.ts
/**
 * Typed observation + confrontation-outcome layer for `upt confront`.
 * The outcome is a discriminated union on `kind` so each confrontation
 * carries only the fields it can honestly populate (no NaN placeholders).
 *
 * @module bridges/observations/types
 */

/** Provenance every observation record must carry. @public */
export interface ObservationProvenance {
  /** Paper + locus, e.g. "Bertotti-Iess-Tortora 2003, Nature 425:374". */
  readonly citation: string;
  readonly year: number;
  /** ISO date the value was transcribed into the repo. */
  readonly retrieved: string;
  /** Caveats: what was digitized, unit conversions, model conventions. */
  readonly note?: string;
}

/** One named uncertainty component (e.g. statistical vs systematic). @public */
export interface SigmaComponent {
  readonly label: string;
  readonly value: number;
}

/** How the observation constrains the prediction. @public */
export type ObservationKind = 'value' | 'upper-bound' | 'consistency' | 'table';

/**
 * Normalized confrontation result — discriminated on `kind`. Each arm
 * carries only the fields it can honestly populate.
 *
 * @public
 */
export type ConfrontationOutcome =
  | {
      readonly kind: 'value';
      readonly predicted: number;
      readonly observed: number;
      readonly sigma: number;
      readonly residualInSigma: number;
      readonly withinObserved: boolean;
      readonly units: string;
      readonly provenance: ObservationProvenance;
    }
  | {
      readonly kind: 'upper-bound';
      readonly predicted: number;
      readonly bound: number;
      readonly satisfied: boolean;
      readonly units: string;
      readonly provenance: ObservationProvenance;
    }
  | {
      readonly kind: 'consistency';
      readonly predicted: number;
      readonly approaches: number;
      readonly fractionalGap: number;
      readonly units: string;
      readonly provenance: ObservationProvenance;
    }
  | {
      readonly kind: 'table';
      readonly rows: ReadonlyArray<{
        readonly label: string;
        readonly predicted: number;
        readonly observed: number;
        readonly sigma: number;
        readonly residualInSigma: number;
      }>;
      readonly units: string;
      readonly provenance: ObservationProvenance;
    };

/** |predicted − observed| in units of the observed 1σ. @public */
export function residualInSigma(predicted: number, observed: number, sigma: number): number {
  if (!(Number.isFinite(sigma) && sigma > 0)) {
    throw new RangeError('residualInSigma: sigma must be finite and > 0');
  }
  return Math.abs(predicted - observed) / sigma;
}

/** Combined 1σ from named components (root-sum-square). @public */
export function combineInQuadrature(components: readonly SigmaComponent[]): number {
  if (components.length === 0) {
    throw new RangeError('combineInQuadrature: need at least one component');
  }
  return Math.sqrt(components.reduce((acc, c) => acc + c.value * c.value, 0));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/bridges/observation-types.test.ts`
Expected: PASS (4 tests). Then `npx tsc --noEmit && npx tsc -p tsconfig.tests.json --noEmit` — clean.

- [ ] **Step 5: Commit**

```bash
git add src/bridges/observations/types.ts tests/bridges/observation-types.test.ts
git commit -m "feat(confront): observation + discriminated confrontation-outcome types"
```

---

### Task 2: Confrontation registry + DATA_CONFRONTED_IDS projection

**Files:**
- Create: `src/bridges/confrontations.ts`
- Modify: `src/bridges/confrontation-coverage.ts` (the `DATA_CONFRONTED_IDS` definition only)
- Test: `tests/bridges/confrontation-registry.test.ts`

**Interfaces:**
- Consumes: `ConfrontationOutcome` (Task 1); existing `confrontBE23`/`confrontBE36`/`confrontBE52` and their result types.
- Produces: `ConfrontationEntry { bridgeId: number; title: string; kind: ObservationKind; run(): ConfrontationOutcome }`, `CONFRONTATIONS: ReadonlyMap<number, ConfrontationEntry>`, `listConfrontations(): ConfrontationEntry[]`, `runConfrontation(bridgeId): ConfrontationOutcome | undefined`.

**Note on wrapping:** the three existing confrontations return module-specific shapes. This task adds ADAPTERS that call them and normalize to `ConfrontationOutcome`. Read each existing result type before writing its adapter:
- `confrontBE52` → `{predicted_arcsec_per_century, observed_arcsec_per_century, residual_in_sigma, withinObserved, observation: {observed_sigma_arcsec_per_century, citation}}` → `value`-kind.
- `confrontBE36` → bound-style (read `be36-gw170817-confrontation.ts` for exact fields) → `upper-bound`-kind.
- `confrontBE23` → `{alphaAggregate, alphaAggregateErr, planckianBand, withinPlanckianBand, observation.citation}` → `value`-kind confronting α against 1.0 (band membership drives `withinObserved`), units `dimensionless`.

- [ ] **Step 1: Write the failing test**

```ts
// tests/bridges/confrontation-registry.test.ts
import { describe, it, expect } from 'vitest';
import { CONFRONTATIONS, listConfrontations, runConfrontation } from '../../src/bridges/confrontations.js';
import { DATA_CONFRONTED_IDS } from '../../src/bridges/confrontation-coverage.js';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';

describe('confrontation registry', () => {
  it('registers the three existing confrontations (be-23/36/52)', () => {
    expect(CONFRONTATIONS.has(23)).toBe(true);
    expect(CONFRONTATIONS.has(36)).toBe(true);
    expect(CONFRONTATIONS.has(52)).toBe(true);
  });

  it('every entry bridgeId exists in the catalog', () => {
    const catalogIds = new Set(BRIDGE_EQUATIONS.map((e) => e.id));
    for (const entry of listConfrontations()) {
      expect(catalogIds.has(entry.bridgeId), `be-${entry.bridgeId}`).toBe(true);
    }
  });

  it('DATA_CONFRONTED_IDS is exactly the registry keyset, sorted', () => {
    expect([...DATA_CONFRONTED_IDS]).toEqual([...CONFRONTATIONS.keys()].sort((a, b) => a - b));
  });

  it('runConfrontation(52) returns a value-kind outcome within 1 sigma', () => {
    const outcome = runConfrontation(52);
    expect(outcome?.kind).toBe('value');
    if (outcome?.kind === 'value') {
      expect(outcome.withinObserved).toBe(true);
      expect(outcome.units).toBe('arcsec/century');
    }
  });

  it('runConfrontation on an unregistered id returns undefined', () => {
    expect(runConfrontation(99)).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/bridges/confrontation-registry.test.ts`
Expected: FAIL — `src/bridges/confrontations.js` does not exist.

- [ ] **Step 3: Write minimal implementation**

First read `src/bridges/be36-gw170817-confrontation.ts` to get `confrontBE36`'s exact result fields, then:

```ts
// src/bridges/confrontations.ts
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
import { confrontBE36 } from './be36-gw170817-confrontation.js';
import { confrontBE23 } from './be23-planckian-confrontation.js';

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
    // Confront the aggregate α against the Planckian value 1.0; the band
    // membership the module computes IS the verdict.
    return {
      kind: 'value',
      predicted: 1.0,
      observed: r.alphaAggregate,
      sigma: r.alphaAggregateErr,
      residualInSigma: residualInSigma(1.0, r.alphaAggregate, r.alphaAggregateErr),
      withinObserved: r.withinPlanckianBand,
      units: 'dimensionless (α)',
      provenance: { citation: r.observation.citation, year: 2019, retrieved: '2026-07-02' },
    };
  },
};

// be-36 upper-bound confrontation. VERIFIED field names (BE36ConfrontationResult,
// be36-gw170817-confrontation.ts:76-93): upperBound, lowerBound, encodedBound,
// passesEncodedBound, observation. It is two-sided; map BE-36's encoded bound
// as `predicted` and the observational positive-side bound as `bound`, with
// `passesEncodedBound` as `satisfied`. The observation record's citation field
// name must be read from GWSpeedObservation (verify at implementation).
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
        citation: r.observation.citation, // confirm GWSpeedObservation field name
        year: 2017,
        retrieved: '2026-07-02',
        note: `two-sided bound: upper ${r.upperBound}, lower ${r.lowerBound}; encoded |ratio| ≤ ${r.encodedBound}`,
      },
    };
  },
};

const REGISTRY = new Map<number, ConfrontationEntry>([
  [23, be23Entry],
  [36, be36Entry],
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
```

Then change `DATA_CONFRONTED_IDS` in `src/bridges/confrontation-coverage.ts`. Find the current line:
```ts
export const DATA_CONFRONTED_IDS: ReadonlySet<number> = new Set([23, 36, 52]);
```
Replace with:
```ts
import { CONFRONTATIONS } from './confrontations.js';
// ... (add the import at the top with the other imports)

/**
 * Catalog ids with a committed real-data confrontation — a SORTED
 * projection of the confrontation registry's keyset (single source of
 * truth; adding a `ConfrontationEntry` grows this set automatically).
 * Consumed by `composition/bridge-analysis.ts` for the scorecard's
 * data-confrontation flag.
 *
 * @internal
 */
export const DATA_CONFRONTED_IDS: ReadonlySet<number> = new Set(
  [...CONFRONTATIONS.keys()].sort((a, b) => a - b),
);
```
Check for an import cycle: `confrontations.ts` imports the three confrontation modules but NOT `confrontation-coverage.ts`, and `confrontation-coverage.ts` now imports `confrontations.ts` — one direction only, no cycle. Verify with `npm run docs:deps` showing circular deps still 0 (revert the regenerated reports after checking).

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/bridges/confrontation-registry.test.ts`
Expected: PASS (5 tests). Then run the coverage + scorecard tests that read `DATA_CONFRONTED_IDS`:
`npx vitest run tests/bridges tests/composition/bridge-priority.test.ts`
Expected: PASS (the set is unchanged at {23,36,52} this task, so no golden moves yet). Then `npx tsc --noEmit && npx tsc -p tsconfig.tests.json --noEmit`.

- [ ] **Step 5: Commit**

```bash
git add src/bridges/confrontations.ts src/bridges/confrontation-coverage.ts tests/bridges/confrontation-registry.test.ts
git commit -m "feat(confront): confrontation registry; DATA_CONFRONTED_IDS becomes its projection"
```

---

### Task 3: be-37 Shapiro / Cassini confrontation

**Files:**
- Create: `src/bridges/be37-cassini-confrontation.ts`
- Modify: `src/bridges/confrontations.ts` (register entry 37)
- Test: `tests/bridges/be37-cassini.test.ts`

**Interfaces:**
- Consumes: `ConfrontationOutcome`, `residualInSigma` (Task 1); `ConfrontationEntry` (Task 2).
- Produces: `CassiniObservation`, `CASSINI`, `confrontBE37(): BE37ConfrontationResult`.

**Dataset (verified — `docs/research/phase3-dataset-verification.md`):** Bertotti, Iess & Tortora, *Nature* 425:374–376 (2003). PPN γ = 1 + (2.1 ± 2.3)×10⁻⁵. be-37 encodes the γ=1 Shapiro form, so the bridge predicts γ = 1 exactly; residual = |1 − 1.000021| / 2.3e-5 ≈ 0.913σ → within 1σ.

- [ ] **Step 1: Write the failing test**

```ts
// tests/bridges/be37-cassini.test.ts
import { describe, it, expect } from 'vitest';
import { confrontBE37, CASSINI } from '../../src/bridges/be37-cassini-confrontation.js';
import { runConfrontation } from '../../src/bridges/confrontations.js';
import { DATA_CONFRONTED_IDS } from '../../src/bridges/confrontation-coverage.js';

describe('confrontBE37 (Cassini Shapiro / PPN gamma)', () => {
  it('predicts gamma = 1 exactly (GR Shapiro form)', () => {
    expect(confrontBE37().predicted_gamma).toBe(1);
  });
  it('observed gamma and sigma match Bertotti 2003', () => {
    expect(CASSINI.observed_gamma).toBeCloseTo(1 + 2.1e-5, 12);
    expect(CASSINI.observed_gamma_sigma).toBeCloseTo(2.3e-5, 12);
  });
  it('residual is ~0.91 sigma, within 1 sigma', () => {
    const r = confrontBE37();
    expect(r.residual_in_sigma).toBeCloseTo(2.1e-5 / 2.3e-5, 6);
    expect(r.withinObserved).toBe(true);
  });
  it('is registered as a value-kind confrontation and lights up DATA_CONFRONTED_IDS', () => {
    const outcome = runConfrontation(37);
    expect(outcome?.kind).toBe('value');
    expect(DATA_CONFRONTED_IDS.has(37)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/bridges/be37-cassini.test.ts`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/bridges/be37-cassini-confrontation.ts
/**
 * BE-37 × Cassini — confront the Shapiro-delay bridge with the Cassini
 * radio-link measurement of the PPN parameter γ (Bertotti, Iess & Tortora
 * 2003). BE-37 encodes the γ=1 general-relativistic Shapiro delay, so the
 * bridge PREDICTS γ = 1 exactly; the confrontation observable is the
 * measured γ. This is the framework's first Shapiro/PPN data confrontation
 * (be-37 has a numerical validation anchor but no data confrontation before
 * this). Value-kind.
 *
 * @module bridges/be37-cassini-confrontation
 */
import type { ObservationProvenance } from './observations/types.js';
import { residualInSigma } from './observations/types.js';

/** A PPN-γ observation record. @public */
export interface CassiniObservation {
  /** Measured PPN parameter γ (dimensionless). */
  readonly observed_gamma: number;
  /** 1σ on the measured γ. */
  readonly observed_gamma_sigma: number;
  readonly provenance: ObservationProvenance;
}

/**
 * Cassini 2002 solar-conjunction Shapiro-delay determination of γ:
 * γ = 1 + (2.1 ± 2.3)×10⁻⁵ (Bertotti-Iess-Tortora 2003, Nature 425:374).
 *
 * @public
 */
export const CASSINI: CassiniObservation = {
  observed_gamma: 1 + 2.1e-5,
  observed_gamma_sigma: 2.3e-5,
  provenance: {
    citation: 'Bertotti, Iess & Tortora 2003, Nature 425:374-376 (Cassini radio-link Shapiro delay, June 2002 solar conjunction)',
    year: 2003,
    retrieved: '2026-07-02',
    note: 'BE-37 encodes the gamma=1 GR Shapiro form, so the predicted PPN gamma is exactly 1; the observable confronted is Cassini gamma.',
  },
};

/** Result of confronting BE-37 with a PPN-γ measurement. @public */
export interface BE37ConfrontationResult {
  /** BE-37 predicts γ = 1 (GR Shapiro form). */
  readonly predicted_gamma: number;
  readonly observed_gamma: number;
  readonly residual_in_sigma: number;
  readonly withinObserved: boolean;
  readonly observation: CassiniObservation;
}

/**
 * Confront BE-37's γ=1 Shapiro prediction with the Cassini γ measurement.
 *
 * @public
 */
export function confrontBE37(obs: CassiniObservation = CASSINI): BE37ConfrontationResult {
  const predicted_gamma = 1;
  const residual_in_sigma = residualInSigma(predicted_gamma, obs.observed_gamma, obs.observed_gamma_sigma);
  return {
    predicted_gamma,
    observed_gamma: obs.observed_gamma,
    residual_in_sigma,
    withinObserved: residual_in_sigma <= 1,
    observation: obs,
  };
}
```

Then register in `src/bridges/confrontations.ts` — add the import and entry, and insert `[37, be37Entry]` into the `REGISTRY` Map (keeping numeric order in the literal is fine; `listConfrontations`/`DATA_CONFRONTED_IDS` sort anyway):

```ts
import { confrontBE37 } from './be37-cassini-confrontation.js';

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
// add [37, be37Entry] to the REGISTRY Map literal
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/bridges/be37-cassini.test.ts tests/bridges/confrontation-registry.test.ts`
Expected: PASS. `DATA_CONFRONTED_IDS` now = {23,36,37,52}. Re-pin any scorecard/coverage test that asserts the confronted count — run `npx vitest run tests/composition/bridge-priority.test.ts` and update the expected count/flags in the SAME commit (the be-37 `hasDataConfrontation` flag flips to true). Then `npx tsc --noEmit && npx tsc -p tsconfig.tests.json --noEmit`.

- [ ] **Step 5: Commit**

```bash
git add src/bridges/be37-cassini-confrontation.ts src/bridges/confrontations.ts tests/bridges/be37-cassini.test.ts tests/composition/bridge-priority.test.ts
git commit -m "feat(confront): be-37 Shapiro/Cassini PPN-gamma confrontation (within 1 sigma)"
```

---

### Task 4: be-48 GRW / LISA-Pathfinder confrontation

**Files:**
- Create: `src/bridges/be48-collapse-confrontation.ts`
- Modify: `src/bridges/confrontations.ts` (register entry 48)
- Test: `tests/bridges/be48-collapse.test.ts`

**Interfaces:**
- Consumes: `evaluateGRWLocalization` from `./equations/be-48-grw-localization.js`; `ConfrontationEntry` (Task 2).
- Produces: `CollapseBoundObservation`, `LISA_PATHFINDER_CSL`, `confrontBE48(): BE48ConfrontationResult`.

**Dataset (verified):** Carlesso et al., arXiv 1606.03637 / *Phys. Rev. D* 95:084054 (2017). CSL collapse-rate upper bound λ ≤ (2.96 ± 0.12)×10⁻⁸ s⁻¹ at correlation length r_C = 100 nm; underlying data Armano et al., *PRL* 116:231101 (2016). be-48 encodes the GRW single-nucleon rate λ₀ = 10⁻¹⁶ s⁻¹. **Model caveat (must appear in the record's `note`):** GRW vs CSL are related-but-distinct; the GRW rate sits ~8 orders below the CSL exclusion, so it is NOT excluded (upper-bound satisfied) — but this is a fail-to-exclude, not a confirmation; the same bound overlaps Adler's proposed floor 10⁻⁸±² s⁻¹.

- [ ] **Step 1: Write the failing test**

```ts
// tests/bridges/be48-collapse.test.ts
import { describe, it, expect } from 'vitest';
import { confrontBE48, LISA_PATHFINDER_CSL } from '../../src/bridges/be48-collapse-confrontation.js';
import { runConfrontation } from '../../src/bridges/confrontations.js';
import { DATA_CONFRONTED_IDS } from '../../src/bridges/confrontation-coverage.js';

describe('confrontBE48 (GRW rate vs LISA-Pathfinder CSL bound)', () => {
  it('predicted single-nucleon GRW rate is 1e-16 /s', () => {
    expect(confrontBE48().predicted_rate_per_s).toBeCloseTo(1e-16, 26);
  });
  it('bound is the Carlesso 2016 CSL value 2.96e-8 /s', () => {
    expect(LISA_PATHFINDER_CSL.bound_rate_per_s).toBeCloseTo(2.96e-8, 12);
  });
  it('the GRW rate is far below the bound: not excluded (satisfied)', () => {
    const r = confrontBE48();
    expect(r.satisfied).toBe(true);
    expect(r.predicted_rate_per_s).toBeLessThan(LISA_PATHFINDER_CSL.bound_rate_per_s);
  });
  it('is registered as upper-bound kind and lights up DATA_CONFRONTED_IDS', () => {
    expect(runConfrontation(48)?.kind).toBe('upper-bound');
    expect(DATA_CONFRONTED_IDS.has(48)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/bridges/be48-collapse.test.ts`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/bridges/be48-collapse-confrontation.ts
/**
 * BE-48 × LISA-Pathfinder — confront the GRW mass-amplified localization
 * rate with the experimental upper bound on spontaneous-collapse rates
 * (Carlesso et al. 2016). BE-48 encodes the GRW single-nucleon rate
 * λ₀ = 10⁻¹⁶ s⁻¹; LISA-Pathfinder bounds the CSL rate at
 * λ ≤ 2.96×10⁻⁸ s⁻¹ (r_C = 100 nm). The GRW rate sits ~8 orders below the
 * exclusion → NOT excluded. Upper-bound-kind.
 *
 * MODEL CAVEAT: GRW and CSL are related-but-distinct collapse models; this
 * is a fail-to-exclude, not a confirmation (GRW's original rate predicts no
 * observable collapse). The same bound overlaps Adler's proposed floor
 * 10⁻⁸±² s⁻¹.
 *
 * @module bridges/be48-collapse-confrontation
 */
import type { ObservationProvenance } from './observations/types.js';
import { evaluateGRWLocalization } from './equations/be-48-grw-localization.js';

/** A collapse-rate upper-bound observation. @public */
export interface CollapseBoundObservation {
  /** Experimental upper bound on the collapse rate (s⁻¹). */
  readonly bound_rate_per_s: number;
  /** 1σ on the bound (s⁻¹). */
  readonly bound_sigma_per_s: number;
  /** Correlation length the bound is quoted at (m). */
  readonly r_C_m: number;
  readonly provenance: ObservationProvenance;
}

/**
 * LISA-Pathfinder CSL upper bound: λ ≤ (2.96 ± 0.12)×10⁻⁸ s⁻¹ at
 * r_C = 100 nm (Carlesso et al. 2016, arXiv 1606.03637 / PRD 95:084054;
 * data Armano et al. 2016, PRL 116:231101).
 *
 * @public
 */
export const LISA_PATHFINDER_CSL: CollapseBoundObservation = {
  bound_rate_per_s: 2.96e-8,
  bound_sigma_per_s: 0.12e-8,
  r_C_m: 1e-7,
  provenance: {
    citation: 'Carlesso, Bassi, Falferi & Vinante 2016, arXiv:1606.03637 / Phys. Rev. D 95:084054 (2017); LISA-Pathfinder data Armano et al. 2016, PRL 116:231101',
    year: 2016,
    retrieved: '2026-07-02',
    note: 'CSL bound; BE-48 encodes the GRW single-nucleon rate. GRW rate ~8 orders below the exclusion: fail-to-exclude, NOT a confirmation. The bound overlaps Adler 10^-8±2 /s.',
  },
};

/** Result of confronting BE-48 with a collapse-rate bound. @public */
export interface BE48ConfrontationResult {
  /** GRW single-nucleon rate λ₀ (s⁻¹) = evaluateGRWLocalization at m = m_0. */
  readonly predicted_rate_per_s: number;
  readonly bound_rate_per_s: number;
  /** predicted ≤ bound (not excluded). */
  readonly satisfied: boolean;
  readonly observation: CollapseBoundObservation;
}

/**
 * Confront BE-48's GRW single-nucleon rate with an experimental collapse
 * bound. The single-nucleon rate is `evaluateGRWLocalization` at m = m_0
 * (mass ratio 1), i.e. exactly λ₀.
 *
 * @public
 */
export function confrontBE48(obs: CollapseBoundObservation = LISA_PATHFINDER_CSL): BE48ConfrontationResult {
  const m_0 = 1.67e-27; // nucleon mass, the GRW reference
  const predicted_rate_per_s = evaluateGRWLocalization({ m_kg: m_0, m_0_kg: m_0 });
  return {
    predicted_rate_per_s,
    bound_rate_per_s: obs.bound_rate_per_s,
    satisfied: predicted_rate_per_s <= obs.bound_rate_per_s,
    observation: obs,
  };
}
```

Then register `[48, be48Entry]` in `src/bridges/confrontations.ts`:

```ts
import { confrontBE48 } from './be48-collapse-confrontation.js';

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
// add [48, be48Entry] to the REGISTRY Map literal
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/bridges/be48-collapse.test.ts tests/bridges/confrontation-registry.test.ts`
Expected: PASS. `DATA_CONFRONTED_IDS` now = {23,36,37,48,52} (5 bridges). Re-pin the scorecard/coverage tests in this commit (be-48 flag flips). `npx tsc --noEmit && npx tsc -p tsconfig.tests.json --noEmit`.

- [ ] **Step 5: Commit**

```bash
git add src/bridges/be48-collapse-confrontation.ts src/bridges/confrontations.ts tests/bridges/be48-collapse.test.ts tests/composition/bridge-priority.test.ts
git commit -m "feat(confront): be-48 GRW rate vs LISA-Pathfinder CSL bound (not excluded)"
```

---

### Task 5: `upt confront` CLI command

**Files:**
- Create: `src/cli/commands/confront.ts`
- Modify: `src/cli/commands/index.ts` (add `import './confront.js';`), `src/cli-api.ts` (re-export registry + outcomes)
- Test: `tests/cli/confront.test.ts`; goldens under `tests/cli/golden/`
- Modify (register golden): `tests/cli/golden-cases.mjs` and the in-process golden list

**Interfaces:**
- Consumes: `listConfrontations`, `runConfrontation` (Task 2) via `ctx.api`.
- Produces: the `confront` command; `--bridge=be-XX`, `--sensitivity` (Task 6 wires the body), `--json`.

**cli-api.ts additions** (follow the `auditCoverage` re-export at line 57):
```ts
export { CONFRONTATIONS, listConfrontations, runConfrontation } from './bridges/confrontations.js';
export type { ConfrontationEntry } from './bridges/confrontations.js';
export type { ConfrontationOutcome } from './bridges/observations/types.js';
```

- [ ] **Step 1: Write the failing test**

```ts
// tests/cli/confront.test.ts
import { describe, it, expect } from 'vitest';
import { runCli } from '../../src/cli/main.js';

// runCli(argv: string[], io: Io) where Io = { out, err, write } (main.ts:174).
// `out`/`err` take a line (console.log semantics), `write` is raw stdout.
// Text commands use `out`; --json uses `write`. Provide all three.
function capture() {
  const lines: string[] = [];
  const sink = (s?: string) => lines.push(s ?? '');
  return { lines, io: { out: sink, err: sink, write: (s: string) => lines.push(s) } };
}

describe('upt confront', () => {
  it('lists all confrontations by default (exit 0)', async () => {
    const cap = capture();
    const code = await runCli(['confront'], cap.io);
    expect(code).toBe(0);
    const text = cap.lines.join('');
    expect(text).toMatch(/be-37/);
    expect(text).toMatch(/be-48/);
    expect(text).toMatch(/be-52/);
  });

  it('--bridge=be-37 runs one, exit 0', async () => {
    const cap = capture();
    const code = await runCli(['confront', '--bridge=be-37'], cap.io);
    expect(code).toBe(0);
    expect(cap.lines.join('')).toMatch(/PPN|γ|gamma/i);
  });

  it('--bridge with an unregistered id is a bad value → exit 1', async () => {
    const cap = capture();
    const code = await runCli(['confront', '--bridge=be-99'], cap.io);
    expect(code).toBe(1);
  });

  it('--json emits an envelope with a result array', async () => {
    const cap = capture();
    const code = await runCli(['confront', '--json'], cap.io);
    expect(code).toBe(0);
    const parsed = JSON.parse(cap.lines.join(''));
    expect(parsed.command).toBe('confront');
    expect(Array.isArray(parsed.result)).toBe(true);
    expect(parsed.result.some((o: { kind: string }) => o.kind === 'value')).toBe(true);
  });
});
```

Match `runCli`'s actual signature first — read `src/cli/main.ts` for how it takes argv and the IO sink (the existing CLI tests, e.g. `tests/cli/main-dispatch.test.ts`, show the exact call convention; mirror it rather than the sketch above).

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/cli/confront.test.ts`
Expected: FAIL — no `confront` command registered.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/cli/commands/confront.ts
/**
 * `upt confront` — run the catalog's committed real-data confrontations and
 * report predicted-vs-observed with the epistemics that confrontation ≠
 * confirmation. Not graph-parameterized (no --source).
 */
import type { FlagSpec } from '../args.js';
import { registerCommand, type Command, type CommandCtx } from '../command.js';
import { CliError } from '../errors.js';
import { emitJson } from '../output.js';

const FLAGS: FlagSpec[] = [
  { name: '--bridge', valueStyle: 'required' },
  { name: '--sensitivity', valueStyle: 'none' },
  { name: '--json', valueStyle: 'none' },
];

const HELP = `upt confront [--bridge=be-XX] [--sensitivity] [--json]
        Run the catalog's committed real-data confrontations (predicted vs
        observed). --bridge runs one; --sensitivity adds a dimensionless
        elasticity ranking of the prediction's inputs (value-kind only).`;

const EPISTEMICS = 'confrontation is consistency, not confirmation; a passing confrontation does not prove the bridge.';

function parseBridgeId(raw: string): number {
  // Accept "be-37", "BE-37", or "37".
  const m = /^(?:be-?)?(\d+)$/i.exec(raw.trim());
  if (!m) throw new CliError(`upt confront: invalid --bridge='${raw}' (expected be-XX)`);
  return Number(m[1]);
}

async function run(ctx: CommandCtx): Promise<number> {
  const { args, api, out } = ctx;
  const bridgeFlag = args.flags.get('bridge');
  const wantJson = args.flags.has('json');

  const entries = bridgeFlag && bridgeFlag.length
    ? (() => {
        const id = parseBridgeId(bridgeFlag[bridgeFlag.length - 1]);
        const one = api.listConfrontations().find((e) => e.bridgeId === id);
        if (!one) throw new CliError(`upt confront: no confrontation registered for be-${id}`);
        return [one];
      })()
    : api.listConfrontations();

  const results = entries.map((e) => ({ bridgeId: e.bridgeId, title: e.title, outcome: e.run() }));

  if (wantJson) {
    emitJson({ command: 'confront', epistemics: EPISTEMICS, result: results.map((r) => r.outcome) }, ctx.write);
    return 0;
  }

  out('\nReal-data confrontations — predicted vs observed');
  out('(' + EPISTEMICS + ')\n');
  for (const { bridgeId, title, outcome } of results) {
    out(`  be-${bridgeId}: ${title}`);
    switch (outcome.kind) {
      case 'value':
        out(`    predicted ${outcome.predicted} · observed ${outcome.observed} ± ${outcome.sigma} ${outcome.units} · residual ${outcome.residualInSigma.toFixed(2)}σ · ${outcome.withinObserved ? 'within 1σ ✓' : 'outside 1σ'}`);
        break;
      case 'upper-bound':
        out(`    predicted ${outcome.predicted} ${outcome.units} · bound ${outcome.bound} · ${outcome.satisfied ? 'not excluded ✓' : 'EXCLUDED'}`);
        break;
      case 'consistency':
        out(`    predicted ${outcome.predicted} approaches ${outcome.approaches} ${outcome.units} · gap ${(outcome.fractionalGap * 100).toFixed(1)}%`);
        break;
      case 'table':
        out(`    ${outcome.rows.length} rows (${outcome.units}):`);
        for (const row of outcome.rows) {
          out(`      ${row.label}: predicted ${row.predicted} · observed ${row.observed} ± ${row.sigma} · ${row.residualInSigma.toFixed(2)}σ`);
        }
        break;
    }
    out(`    source: ${outcome.provenance.citation}`);
  }
  return 0;
}

export const command: Command = { name: 'confront', aliases: [], flags: FLAGS, help: HELP, run };
registerCommand(command);
```

Add `import './confront.js';` to `src/cli/commands/index.ts` and the three re-exports to `src/cli-api.ts`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run build && npx vitest run tests/cli/confront.test.ts`
Expected: PASS. Capture a text golden: `node bin/upt.mjs confront > tests/cli/golden/confront.txt` (CRLF-normalize per the repo's golden convention), register `confront` in `tests/cli/golden-cases.mjs` and the in-process golden list (mirror how `coverage` is registered), then `npx vitest run tests/cli/upt-golden.test.ts tests/cli/inprocess-golden.test.ts`. `npx tsc --noEmit && npx tsc -p tsconfig.tests.json --noEmit`.

- [ ] **Step 5: Commit**

```bash
git add src/cli/commands/confront.ts src/cli/commands/index.ts src/cli-api.ts tests/cli/confront.test.ts tests/cli/golden/confront.txt tests/cli/golden-cases.mjs
git commit -m "feat(cli): upt confront — run committed real-data confrontations"
```

---

### Task 6: Deciding-measurement elasticity (`--sensitivity`)

**Files:**
- Create: `src/bridges/sensitivity.ts`
- Modify: `src/cli/commands/confront.ts` (wire `--sensitivity`), `src/cli-api.ts` (re-export `decidingMeasurement`)
- Test: `tests/bridges/sensitivity.test.ts`, extend `tests/cli/confront.test.ts`

**Interfaces:**
- Produces: `decidingMeasurement(bridgeId): { input: string; elasticity: number }[]` — the dimensionless log-sensitivity `E_i = |∂P/∂xᵢ|·xᵢ/P` per input at the confrontation's input point, descending; `[]` for non-value-kind confrontations. Gradient via central finite differences over the confrontation's own predict function (evaluator-style bridges have no AST; FD is the primary path).

**Design note:** the elasticity answers "which input the prediction depends on most strongly," NOT "which dominates the uncertainty budget" (that needs input σ — Phase 5). The CLI help/JSON doc must say this. For be-37 the prediction is γ=1 (a constant — every elasticity is 0; report that honestly). For be-48 (upper-bound) it returns `[]`. To have a value-kind bridge with real input dependence, wire the ranking over the be-52 Mercury confrontation's inputs (M, a, e, T) as the exercised example.

- [ ] **Step 1: Write the failing test**

```ts
// tests/bridges/sensitivity.test.ts
import { describe, it, expect } from 'vitest';
import { decidingMeasurement } from '../../src/bridges/sensitivity.js';

describe('decidingMeasurement (elasticity)', () => {
  it('ranks be-52 Mercury inputs by |dP/dx|·x/P, descending', () => {
    const ranked = decidingMeasurement(52);
    expect(ranked.length).toBeGreaterThan(0);
    // sorted descending by elasticity
    for (let i = 1; i < ranked.length; i++) {
      expect(ranked[i - 1].elasticity).toBeGreaterThanOrEqual(ranked[i].elasticity);
    }
    // perihelion advance ∝ M / (a (1-e²)): elasticity wrt M is ~1
    const m = ranked.find((r) => r.input === 'central_mass_kg');
    expect(m?.elasticity).toBeCloseTo(1, 1);
  });

  it('returns [] for a non-value-kind confrontation (be-48 upper-bound)', () => {
    expect(decidingMeasurement(48)).toEqual([]);
  });

  it('returns [] for an unregistered id', () => {
    expect(decidingMeasurement(99)).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/bridges/sensitivity.test.ts`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/bridges/sensitivity.ts
/**
 * Deciding-measurement elasticity for value-kind confrontations. For each
 * numeric input x_i of the confrontation's prediction, report the
 * dimensionless log-sensitivity E_i = |∂P/∂x_i|·x_i/P at the confrontation's
 * own input point (central finite differences — evaluator-style bridges have
 * no AST). This answers which input the prediction depends on most STRONGLY,
 * NOT which dominates the uncertainty budget (that needs input σ — Phase 5).
 *
 * @module bridges/sensitivity
 */
import { evaluatePerihelionPrecession } from './perihelion-precession.js';
import { MERCURY } from './be52-mercury-confrontation.js';
import { CONFRONTATIONS } from './confrontations.js';

/** One input's elasticity. @public */
export interface Elasticity {
  readonly input: string;
  readonly elasticity: number;
}

/** Central-difference elasticity of P(x) wrt one component. */
function elasticityOf(
  predict: (point: Record<string, number>) => number,
  point: Record<string, number>,
  key: string,
): number {
  const x = point[key];
  const h = Math.abs(x) * 1e-6 || 1e-12;
  const up = { ...point, [key]: x + h };
  const dn = { ...point, [key]: x - h };
  const P = predict(point);
  const dP = (predict(up) - predict(dn)) / (2 * h);
  if (!(Number.isFinite(P) && P !== 0)) return 0;
  return Math.abs(dP) * Math.abs(x) / Math.abs(P);
}

/**
 * Elasticity ranking for a value-kind confrontation's inputs, descending.
 * `[]` for non-value-kind or unregistered ids.
 *
 * @public
 */
export function decidingMeasurement(bridgeId: number): Elasticity[] {
  const entry = CONFRONTATIONS.get(bridgeId);
  if (!entry || entry.kind !== 'value') return [];

  // The one value-kind confrontation with non-trivial input dependence.
  if (bridgeId === 52) {
    const point: Record<string, number> = {
      central_mass_kg: MERCURY.central_mass_kg,
      semi_major_axis_m: MERCURY.semi_major_axis_m,
      eccentricity: MERCURY.eccentricity,
      period_yr: MERCURY.period_yr,
    };
    const predict = (p: Record<string, number>): number =>
      evaluatePerihelionPrecession({
        M_kg: p.central_mass_kg,
        a_m: p.semi_major_axis_m,
        e: p.eccentricity,
        T_yr: p.period_yr,
      }).dphi_arcsec_per_century;
    return Object.keys(point)
      .map((key) => ({ input: key, elasticity: elasticityOf(predict, point, key) }))
      .sort((a, b) => b.elasticity - a.elasticity);
  }

  // be-37 predicts the constant γ=1: every elasticity is 0. be-23 confronts
  // a bundled free coefficient (no structural input dependence to rank).
  return [];
}
```

Wire `--sensitivity` in `confront.ts`: after printing a value-kind outcome, if `args.flags.has('sensitivity')`, print `api.decidingMeasurement(bridgeId)` as an "elasticity (strongest dependence, not uncertainty budget)" block; for non-value kinds print `sensitivity: n/a for <kind>-kind`; in `--json`, add a `sensitivity` field per value-kind entry. Add `export { decidingMeasurement } from './bridges/sensitivity.js';` to `cli-api.ts`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/bridges/sensitivity.test.ts && npm run build && npx vitest run tests/cli/confront.test.ts`
Expected: PASS. Re-pin the `confront` golden if `--sensitivity` output is added to any golden case. `npx tsc --noEmit && npx tsc -p tsconfig.tests.json --noEmit`.

- [ ] **Step 5: Commit**

```bash
git add src/bridges/sensitivity.ts src/cli/commands/confront.ts src/cli-api.ts tests/bridges/sensitivity.test.ts tests/cli/confront.test.ts
git commit -m "feat(confront): elasticity-based deciding-measurement (--sensitivity)"
```

---

### Task 7: Public exports, docs, and wrap

**Files:**
- Modify: `src/index.ts` (public exports), `CHANGELOG.md`, `README.md`, `cli/README.md`, `todo.md`

- [ ] **Step 1: Add public exports to `src/index.ts`**

Following the existing confront exports (lines 474/484/623), add: `confrontBE37`, `CASSINI`, `CassiniObservation`; `confrontBE48`, `LISA_PATHFINDER_CSL`, `CollapseBoundObservation`; `CONFRONTATIONS`, `listConfrontations`, `runConfrontation`, `ConfrontationEntry`, `ConfrontationOutcome`, `ObservationProvenance`, `ObservationKind`, `decidingMeasurement`. Update the public-surface snapshot test if one exists (`tests/**/public-surface*.test.ts`).

- [ ] **Step 2: Verify the public surface**

Run: `npx vitest run` scoped to any public-surface/`index` test, then `npx tsc --noEmit`.
Expected: PASS.

- [ ] **Step 3: Update docs**

- `CHANGELOG.md` under `## [Unreleased]`: an `### Added` entry for `upt confront`, the observation/confrontation registry, be-37 + be-48 confrontations (data-confronted bridges 3→5), and the elasticity `--sensitivity`; note be-16/be-23-table/be-38 are queued pending data.
- `README.md`: confronted-bridge count 3→5; add `upt confront` to the CLI command list; refresh the test-suite count after the release-gate full run.
- `cli/README.md`: full `confront` entry (flags, kinds, epistemics, exit codes).
- `todo.md`: check off the be-37/be-48/machinery items; keep be-16, be-23 per-material upgrade, and be-38 as the remaining Phase-3 queue with their data-dependency noted.

- [ ] **Step 4: Regenerate the dependency graph**

Run: `npm run docs:deps` and commit the regenerated `docs/architecture/` reports (this is a wrap task — reports are committed here, not reverted). Confirm circular deps still 0+0.

- [ ] **Step 5: Release-gate verification**

Run: `npm test` (full suite; expect all green including the unchanged funnel calibration benchmark), then `npm run build && npm run smoke`.
Expected: full suite PASS, smoke success. Record the passing count for the README refresh.

- [ ] **Step 6: Commit**

```bash
git add src/index.ts CHANGELOG.md README.md cli/README.md todo.md docs/architecture/
git commit -m "docs(confront): public exports, CLI/README, CHANGELOG; dep-graph restamp"
```

---

## Out of scope (queued in todo.md, data-pending)

- **be-16 Landauer/Bérut** (consistency-kind): needs the Fig-4 asymptote value from Bérut 2012 (paywalled). The machinery (`consistency` arm) is built; only the dataset is missing.
- **be-23 per-material α upgrade**: fill `PLANCKIAN_CUPRATES.perMaterialAlphas` + a `table`-kind entry from Legros 2019's per-material table (paywalled). The aggregate be-23 confrontation already ships.
- **be-38 MOND/SPARC deep-limit**: contingent on whether the deep-MOND-limit confrontation is a genuine test vs a₀-reproduction (Task-0 gate #1 special case).

## Self-review

- **Spec coverage:** U1 types → Task 1; U2 registry → Task 2; U2 CLI → Task 5; U3 confrontations → Tasks 3–4 (be-37, be-48; be-16/be-23-table/be-38 explicitly deferred with rationale); U3b sensitivity → Task 6; docs/firewall/goldens → Task 7 + per-task golden re-pins. Registry-projection, discriminated union, in-place imports, sorted `DATA_CONFRONTED_IDS`, `sigmaComponents`/`combineInQuadrature` all present.
- **Placeholder scan:** every code step carries real code; every dataset number traces to `docs/research/phase3-dataset-verification.md`; no TBD/TODO.
- **Type consistency:** `ConfrontationOutcome` union shape is identical across Tasks 1/2/3/4/5/6; `ConfrontationEntry` fields (`bridgeId/title/kind/run`) consistent; `decidingMeasurement` return type matches its CLI consumer.
- **Verification-before-TDD gate (per-task):** before Tasks 2/3/4 read the exact result-field names of the existing confrontation modules and `runCli`'s signature — the plan's wrapper field names (esp. be-36's) are marked "verify at implementation."
