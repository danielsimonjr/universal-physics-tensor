/**
 * Centralized Quantity nodes — ONE object per canonical name (v0.11
 * namespacing gate, acceptance criterion 6). Per the Adam vet
 * (A-2/A-6.3), per-edge-module node definitions had drifted into
 * duplicate-name distinct-object pairs: 'mass' across
 * calibration/catalog-tranche, and two 'temperature' nodes within
 * calibration itself. Name uniqueness is pinned by
 * tests/composition/quantities.test.ts.
 *
 * Centralization removes the false-positive collision class; it does
 * NOT decide composition-level aliasing questions — those are
 * dispositions (compose.ts `SOURCE_ALIAS_DISPOSITIONS`).
 *
 *
 * ⚠ UNIT-CONVENTION HETEROGENEITY (G-9 class, flagged 2026-06-11
 * post-migration review): four nodes are GeV-valued in an otherwise
 * SI(joule)-valued graph — `vacuum-expectation-value`,
 * `dark-fermion-mass`, `planck-mass-energy`, `inflation-hubble-energy`
 * (their evaluators speak GeV; the DIMENSION [energy] is honest but the
 * VALUE convention differs by 1.602×10⁻¹⁰). Junctions match by name,
 * and no registered identification crosses GeV↔J today — but any
 * future identification touching these nodes must convert, or it will
 * type-check and be numerically wrong. ALSO (Eve M-1): information
 * nodes split three ways — `intrinsic-information` is BITS,
 * `subsystem-entanglement-entropy` / `modular-hamiltonian-variation` /
 * `entanglement-entropy-variation` are NATS, and
 * `wormhole-entanglement-entropy` is J/K; bits↔nats share the
 * DIMENSIONLESS dim, so a future identification across them would be
 * wrong by ln 2 with no dimensional guard. The systematic fix is the
 * G-9 units layer (v0.12); until then this banner is the guard.
 *
 * @module composition/quantities
 */

// Domain-split modules (2026-06-22 god-file split). This barrel re-exports
// every centralized Quantity node, so all existing importers are unchanged.
export * from './quantities/quantum.js';
export * from './quantities/gravitation-cosmology.js';
export * from './quantities/fields.js';
export * from './quantities/condensed-matter.js';
export * from './quantities/common.js';
