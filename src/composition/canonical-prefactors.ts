/**
 * Exact prefactors for canonical equations that `src/canonical` records only
 * dimensionally or only up to a constant.
 *
 * CE-pendulum-period is a monomial and CE-kinetic-energy's AST is `m·v²`, so a
 * user formula wrong by 2π or ½ could not be caught (persona findings L2, L7).
 * `src/canonical` is a pinned Criterion 3 input tree, so the prefactors live
 * here, outside it (Mothership ruling 2026-09-25). Each prefactor multiplies the
 * entry's AST, or its monomial when it has no AST; a test holds that neither
 * carries a constant of its own.
 *
 * Every quote is verbatim wikitext from the pinned Wikipedia revision in its
 * locator, fetched and matched on 2026-09-25.
 *
 * @module composition/canonical-prefactors
 */

/** One sourced prefactor. @internal */
export interface CanonicalPrefactor {
  /** A `CanonicalEquation.id`. */
  readonly id: string;
  /** The exact dimensionless factor in front of the entry's AST or monomial. */
  readonly prefactor: number;
  /** Verbatim source text the factor is read from. */
  readonly quote: string;
  /** Where the quote is: page, revision id and wikitext line. */
  readonly locator: string;
}

/** The sourced prefactors, by canonical id. @internal */
export const CANONICAL_PREFACTORS: readonly CanonicalPrefactor[] = [
  {
    id: 'CE-pendulum-period',
    prefactor: 2 * Math.PI,
    quote: String.raw`T_0 = 2\pi\sqrt{\frac \ell g}`,
    locator: "Wikipedia, 'Pendulum (mechanics)', revision 1374595895, wikitext line 171",
  },
  {
    id: 'CE-kinetic-energy',
    prefactor: 0.5,
    quote: String.raw`E_\text{k} = \frac{1}{2} mv^2`,
    locator: "Wikipedia, 'Kinetic energy', revision 1370969006, wikitext line 56",
  },
  {
    id: 'CE-rotational-kinetic-energy',
    prefactor: 0.5,
    quote: String.raw`E_\text{rotational} = \tfrac{1}{2} I \omega^2`,
    locator: "Wikipedia, 'Rotational energy', revision 1258577842, wikitext line 3",
  },
  {
    id: 'CE-capacitor-energy',
    prefactor: 0.5,
    quote: String.raw`W = \frac{1}{2}CV^2`,
    locator: "Wikipedia, 'Capacitor', revision 1375788837, wikitext line 137",
  },
  {
    id: 'CE-schwarzschild-radius',
    prefactor: 2,
    quote: String.raw`Schwarzschild radius{{br}}<math display="inline">\frac{2GM}{c^2}</math>`,
    locator: "Wikipedia, 'Schwarzschild radius', revision 1373854769, wikitext line 25",
  },
  {
    // a³/T² = GM/(4π²) for M ≫ m gives T = 2π √(a³/(GM)); the canonical monomial is a^1.5 (GM)^-0.5.
    id: 'CE-kepler-third',
    prefactor: 2 * Math.PI,
    quote: String.raw`\frac{a^3}{T^2} = \frac{G(M + m)}{4\pi^2} \approx \frac{GM}{4\pi^2}`,
    locator: "Wikipedia, 'Kepler's laws of planetary motion', revision 1376360196, wikitext line 232",
  },
  {
    id: 'CE-lc-resonance',
    prefactor: 1,
    quote: String.raw`\omega_0 = \frac{1}{\sqrt{LC}},`,
    locator: "Wikipedia, 'LC circuit', revision 1350658867, wikitext line 66",
  },
  {
    // The Stokes friction coefficient ζ = 6πηr; the drag at speed v is F = ζ v.
    id: 'CE-stokes-drag',
    prefactor: 6 * Math.PI,
    quote: String.raw`\zeta = 6 \pi \, \eta \, r,`,
    locator: "Wikipedia, 'Einstein relation (kinetic theory)', revision 1353047788, wikitext line 77",
  },
  {
    id: 'CE-stokes-einstein',
    prefactor: 1 / (6 * Math.PI),
    quote: String.raw`D = \frac{k_\text{B} T}{6\pi\,\eta\,r}.`,
    locator: "Wikipedia, 'Einstein relation (kinetic theory)', revision 1353047788, wikitext line 79",
  },
];

/** The sourced prefactor of a canonical entry, or `undefined`. @internal */
export function canonicalPrefactor(id: string): number | undefined {
  return CANONICAL_PREFACTORS.find((p) => p.id === id)?.prefactor;
}
