/**
 * Negative catalog (v0.8.0 P-4) — NOT-A-BRIDGE adjudications as
 * first-class data.
 *
 * Each entry records the outcome of applying the v0.8.0 graph-native
 * membership criterion (*a bridge is an edge whose endpoint quantities
 * differ in at least one regime attribute*) to a catalog row, with the
 * physics reason and a citation. Rejected entries REMAIN in
 * `BRIDGE_EQUATIONS` (their formulas and encodings are still valid
 * physics); this registry is the adjudication overlay consumed by
 * `membership.ts` — an id listed here reports `'not-a-bridge'`
 * regardless of its `bridges` tuple (design r2-4 precedence).
 *
 * Recording rejections as data rather than audit-doc prose prevents
 * re-litigation and documents the criterion by counterexample.
 *
 * @module bridges/rejected
 */

/** A NOT-A-BRIDGE adjudication record. @public */
export interface RejectedBridgeAdjudication {
  readonly beId: number;
  readonly name: string;
  readonly verdict: 'not-a-bridge';
  /** Why the endpoints do NOT differ in regime attributes. */
  readonly reason: string;
  readonly citation: string;
}

/**
 * The negative catalog. Adjudicated 2026-06-11 (v0.8.0 Phase 4),
 * upholding five of the BRIDGE-PHYSICS-AUDIT §3 classifications under
 * the graph-native criterion. BE-42 was REVERSED to a bridge (see the
 * catalog entry and `docs/architecture/v0.8.0-catalog-adjudication.md`);
 * BE-44/46/50 remain contested/unadjudicated (same doc, with reasons).
 *
 * @public
 */
export const REJECTED_BRIDGE_ADJUDICATIONS: ReadonlyArray<RejectedBridgeAdjudication> =
  [
    {
      beId: 28,
      name: 'Maximum Entropy Production Principle',
      verdict: 'not-a-bridge',
      reason:
        'The encoded σ = Σᵢ Jᵢ Xᵢ is the definiendum of entropy ' +
        'production within nonequilibrium thermodynamics — fluxes, ' +
        'forces, and σ all live in the same classical statistical ' +
        'regime. The variational MEPP claim (which might bridge) is ' +
        'not what is encoded (see the catalog entry’s ⚠ warning).',
      citation: 'Martyushev & Seleznev 2006 Phys. Rep. 426:1',
    },
    {
      beId: 29,
      name: 'Jarzynski free-energy equality (canonical 1997 form)',
      verdict: 'not-a-bridge',
      reason:
        '⟨e^(−βW)⟩ = e^(−βΔF) relates a nonequilibrium work ' +
        'distribution to an equilibrium free energy, both within ' +
        'classical statistical mechanics. Equilibrium-vs-nonequilibrium ' +
        'status is not one of the regime axes — the endpoints share ' +
        'scale and force attributes.',
      citation: 'Jarzynski 1997 PRL 78:2690',
    },
    {
      beId: 32,
      name: 'Quantum Reference Frame Transformation',
      verdict: 'not-a-bridge',
      reason:
        'A transformation between quantum descriptions relative to ' +
        'different reference frames — both endpoints are quantum-scale ' +
        'quantities; the relation is internal to quantum theory.',
      citation: 'Giacomini, Castro-Ruiz & Brukner 2019 Nat. Commun. 10:494',
    },
    {
      beId: 35,
      name: 'Conformal Bootstrap - Physical Operator Equation',
      verdict: 'not-a-bridge',
      reason:
        'The crossing-symmetry constraint is internal to a CFT’s ' +
        'operator algebra — a consistency condition within one QFT ' +
        'regime, not a relation between regimes.',
      citation: 'Rattazzi, Rychkov, Tonni & Vichi 2008 JHEP 0812:031',
    },
    {
      beId: 40,
      name: 'Composite Higgs Potential',
      verdict: 'not-a-bridge',
      reason:
        'The SILH effective potential V(h) is a single-regime ' +
        'electroweak-QFT object; its endpoints (field value, potential ' +
        'energy density) share scale and force attributes.',
      citation: 'Giudice, Grojean, Pomarol & Rattazzi 2007 JHEP 0706:045',
    },
  ];

/** The rejected ids as a Set, for overlay lookups. @public */
export const REJECTED_BRIDGE_IDS: ReadonlySet<number> = new Set(
  REJECTED_BRIDGE_ADJUDICATIONS.map((r) => r.beId),
);
