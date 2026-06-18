/**
 * Order-of-magnitude representative values for the discovery falsifier.
 *
 * The discovery loop (`discovery.ts`) vets a hypothesised identification a≡b,
 * but its numeric check (`retrodict`) runs from a single anchor and cannot
 * evaluate the quantities a dimensional coincidence "unlocks" — so it never
 * contradicts them, and they surface as `promising` (e.g.
 * `landauer-erasure-energy ≟ planck-mass-energy`, ~30 orders apart). The graph
 * structurally CANNOT supply the magnitudes that would falsify these.
 *
 * This table injects that missing ground truth: a sourced, order-of-magnitude
 * value for quantities that have a WELL-DEFINED physical scale. Generic
 * quantities (`mass`, `energy`, `length`, …) are deliberately ABSENT — they
 * have no single representative scale, and a value for them would mis-fire.
 * When a value is absent the gate abstains; it never false-rejects on unknowns.
 *
 * Values are order-of-magnitude estimates (good to ~1 order), each carrying its
 * provenance. Nothing here is fabricated; coarse by design. When the canonical-
 * equation registry lands it can supply these centrally and this table folds in.
 *
 * INTERNAL — surfaced via `upt discover`.
 *
 * @module composition/representative-values
 */

/** A sourced order-of-magnitude value for one quantity. @internal */
export interface RepresentativeValue {
  /** Order-of-magnitude value in the quantity's SI unit (good to ~1 order). */
  readonly value: number;
  /** Provenance — how the estimate is obtained (a citation or a one-liner). */
  readonly source: string;
}

/**
 * Scale-specific quantities only. Keyed by the canonical quantity name used in
 * the composition graph. Generic quantities are intentionally omitted.
 *
 * @internal
 */
export const REPRESENTATIVE_VALUES: Readonly<
  Record<string, RepresentativeValue>
> = {
  // ── frequencies / rates [s^-1] ──────────────────────────────────────────
  'hubble-rate': { value: 2.2e-18, source: 'H0 ≈ 67 km/s/Mpc (Planck 2018)' },
  'grw-localization-rate': {
    value: 1e-16,
    source: 'GRW collapse rate λ ≈ 10^-16 s^-1 (Ghirardi–Rimini–Weber 1986)',
  },
  'attempt-frequency': {
    value: 1e13,
    source: 'Debye/phonon attempt frequency ~10^13 Hz',
  },

  // ── energies [J] ────────────────────────────────────────────────────────
  'landauer-erasure-energy': { value: 2.9e-21, source: 'kT·ln2 at T = 300 K' },
  'planck-mass-energy': { value: 1.96e9, source: 'm_P·c² (m_P = √(ℏc/G))' },
  'vacuum-expectation-value': {
    value: 3.94e-8,
    source: 'Higgs VEV v ≈ 246 GeV',
  },

  // ── masses [kg] ─────────────────────────────────────────────────────────
  'planck-mass': { value: 2.176e-8, source: 'm_P = √(ℏc/G)' },

  // ── lengths [m] ─────────────────────────────────────────────────────────
  'foerster-radius': {
    value: 5e-9,
    source: 'typical FRET Förster radius ~5 nm',
  },
  'planck-length': { value: 1.616e-35, source: 'ℓ_P = √(ℏG/c³)' },

  // ── times [s] ───────────────────────────────────────────────────────────
  'planck-time': { value: 5.39e-44, source: 't_P = √(ℏG/c⁵)' },
};

/**
 * The sourced order-of-magnitude value for `name`, or `undefined` when the
 * quantity has no well-defined representative scale (the gate then abstains).
 *
 * @internal
 */
export function representativeValue(
  name: string,
): RepresentativeValue | undefined {
  return REPRESENTATIVE_VALUES[name];
}
