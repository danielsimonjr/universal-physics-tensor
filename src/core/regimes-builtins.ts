/**
 * Built-in regime registrations — Phase 2 of v0.8 Proposal 5.
 *
 * Pre-registers the v0.6-shipped closed-union values from
 * `src/core/types.ts` under the corresponding `AxisName`. This
 * gives downstream consumers a stable starting point: every
 * value already in the catalog has an entry in the regime
 * registry without per-bridge migration.
 *
 * Per P5 Decision #1, this does NOT close the new physics-regime
 * taxonomy (e.g., no "classical-mechanics", "QFT" regimes
 * shipped — those are v0.9 per-bridge physics review).
 *
 * Module-load side effect: registers every value below at import
 * time. Idempotent — re-importing or double-importing is a
 * no-op (see `defineRegime` idempotency in
 * `regime-registry.ts`).
 *
 * @module core/regimes-builtins
 */

import { defineRegime } from './regime-registry.js';
import type {
  PhysicalScale,
  Force,
  Symmetry,
  InformationMeasure,
} from './types.js';

const BUILTIN_SOURCE = 'universal-physics-tensor';

// ---------------------------------------------------------------------------
// Scale axis — 4 entries
// ---------------------------------------------------------------------------

const scaleTags: Array<{ tag: PhysicalScale; displayName: string }> = [
  { tag: 'quantum', displayName: 'Quantum (< 10^-9 m)' },
  { tag: 'mesoscopic', displayName: 'Mesoscopic (10^-9 to 10^-6 m)' },
  { tag: 'classical', displayName: 'Classical (10^-6 to 10^26 m)' },
  { tag: 'cosmological', displayName: 'Cosmological (> 10^26 m)' },
];

for (const { tag, displayName } of scaleTags) {
  defineRegime({
    axis: 'scale',
    tag,
    displayName,
    provenance: { registeredBy: BUILTIN_SOURCE },
  });
}

// ---------------------------------------------------------------------------
// Force axis — 5 entries
// ---------------------------------------------------------------------------

const forceTags: Array<{ tag: Force; displayName: string }> = [
  { tag: 'gravitational', displayName: 'Gravitational' },
  { tag: 'electromagnetic', displayName: 'Electromagnetic' },
  { tag: 'weak', displayName: 'Weak nuclear' },
  { tag: 'strong', displayName: 'Strong nuclear' },
  { tag: 'emergent', displayName: 'Emergent (friction, tension, etc.)' },
];

for (const { tag, displayName } of forceTags) {
  defineRegime({
    axis: 'force',
    tag,
    displayName,
    provenance: { registeredBy: BUILTIN_SOURCE },
  });
}

// ---------------------------------------------------------------------------
// Symmetry axis — 5 entries (Eve-M1: NOT 4 + placeholder)
// ---------------------------------------------------------------------------

const symmetryTags: Array<{ tag: Symmetry; displayName: string }> = [
  { tag: 'poincare', displayName: 'Poincaré (spacetime)' },
  { tag: 'gauge', displayName: 'Gauge (U(1), SU(2), SU(3))' },
  { tag: 'conformal', displayName: 'Conformal (scale invariance)' },
  { tag: 'susy', displayName: 'Supersymmetry' },
  { tag: 'emergent', displayName: 'Emergent (effective symmetries)' },
];

for (const { tag, displayName } of symmetryTags) {
  defineRegime({
    axis: 'symmetry',
    tag,
    displayName,
    provenance: { registeredBy: BUILTIN_SOURCE },
  });
}

// ---------------------------------------------------------------------------
// Information axis — 4 entries
// ---------------------------------------------------------------------------

const informationTags: Array<{ tag: InformationMeasure; displayName: string }> = [
  { tag: 'vonNeumann', displayName: 'von Neumann entropy' },
  { tag: 'shannon', displayName: 'Shannon entropy' },
  { tag: 'kolmogorov', displayName: 'Kolmogorov complexity' },
  { tag: 'quantumDiscord', displayName: 'Quantum discord' },
];

for (const { tag, displayName } of informationTags) {
  defineRegime({
    axis: 'information',
    tag,
    displayName,
    provenance: { registeredBy: BUILTIN_SOURCE },
  });
}

// dimension and topology axes are integer-valued; no built-in
// registrations ship (per P1 Phase 0 census + P5 Decision #4 —
// integer axes are wildcards).
