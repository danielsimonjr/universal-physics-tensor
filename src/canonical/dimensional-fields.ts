/**
 * Compute the L0 dimensional fields of a canonical entry FROM the Buckingham-π
 * engine, so `monomial` and `freeDimensionlessGroups` are always mutually
 * consistent and never hand-asserted (HonestClaude).
 *
 * The two are consistent by construction: the target monomial is unique iff the
 * governing set has no free dimensionless group, so
 *   `monomial !== null  ⟺  freeDimensionlessGroups === 0`.
 * Equations whose form dimensions CANNOT pin (Newton `F=Gm₁m₂/r²` — a free
 * mass-ratio group; Bekenstein–Hawking — a free `c³A/Għ` group) get
 * `monomial: null, freeDimensionlessGroups ≥ 1`; their scalar-AST (L1) carries
 * the form dimensions can't.
 *
 * @module canonical/dimensional-fields
 */
import {
  dimensionallyDetermines,
  buckinghamPi,
} from '../dimensional/buckingham.js';
import type { DimensionalVariable } from '../dimensional/buckingham.js';

/** L0 dimensional fields derived from the engine. */
export function dimensionalFields(
  target: DimensionalVariable,
  governing: readonly DimensionalVariable[],
): {
  monomial: Record<string, number> | null;
  freeDimensionlessGroups: number;
} {
  const det = dimensionallyDetermines(target, governing);
  const gPi =
    governing.length > 0 ? buckinghamPi([...governing]).piGroupCount : 0;
  // Keep the invariant `monomial !== null ⟺ freeDimensionlessGroups === 0`
  // UNCONDITIONALLY true: when the target is not in the governing span,
  // `determined` is false yet `gPi` may be 0 — force ≥1 so null monomial always
  // reports a free group.
  const freeDimensionlessGroups = det.determined ? gPi : Math.max(1, gPi);
  return {
    monomial: det.determined ? { ...det.monomial! } : null,
    freeDimensionlessGroups,
  };
}
