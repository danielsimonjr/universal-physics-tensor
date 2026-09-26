/**
 * A dimensionless governing input no longer blocks the probe, and the stop reason is true
 * (persona finding C2, 2026-09-25).
 *
 * With θ0 (dimensionless) among the inputs, the target's monomial is not unique: any f(θ0) can
 * multiply it. The native enumerator then produced nothing, and the run said "enumerator produced no
 * dimensionally valid candidates", which is false: √(ℓ/g) is dimensionally valid. Now the monomial
 * is taken from the DIMENSIONED inputs, and the note says that an unknown function of the
 * dimensionless inputs is not searched. When not even the dimensioned inputs fix a unique monomial,
 * the stop reason says exactly that.
 */
import { describe, it, expect } from 'vitest';
import { searchProblemFromFile } from '../../../src/composition/probe/problem.js';
import { runProbeSearch } from '../../../src/composition/probe/pipeline.js';

const rows = (n: number, offset: number) =>
  Array.from({ length: n }, (_, i) => {
    const length = 0.3 + ((i * 7 + offset) % 11) * 0.25 + offset * 0.013;
    const gravity = 2 + ((i * 5 + offset) % 13) * 1.7;
    const theta0 = 0.01 + ((i * 3 + offset) % 5) * 0.005; // small: T ≈ 2π√(ℓ/g) to 2e-4
    return { length, gravity, theta0, period: 2 * Math.PI * Math.sqrt(length / gravity) };
  });

function problem(governing: { name: string; dim: string }[]) {
  return searchProblemFromFile({
    gap: { id: 'fg-dimensionless', kind: 'unexplained-observation' },
    target: { name: 'period', dim: 'time' },
    governing,
    exploratory: { observable: 'period', rows: rows(30, 0) },
    holdout: { observable: 'period', rows: rows(10, 3) },
  });
}

describe('probe with a dimensionless governing input', () => {
  it('finds √(ℓ/g) from the dimensioned inputs, fits 2π, and says f(θ0) was not searched', async () => {
    const r = await runProbeSearch(
      problem([
        { name: 'length', dim: 'length' },
        { name: 'gravity', dim: 'acceleration' },
        { name: 'theta0', dim: 'dimensionless' },
      ]),
      { repositoryCommit: 'test', now: '2026-09-25T00:00:00.000Z' },
    );
    expect(r.candidates.length).toBeGreaterThan(0);
    const fit = Object.values(r.fits)[0]!;
    expect(fit.prefactor).toBeCloseTo(2 * Math.PI, 6);
    expect(r.wording.join('\n')).toMatch(/unknown function of the dimensionless input\(s\) \{theta0\} is not searched/);
    expect(r.wording.join('\n')).not.toMatch(/no dimensionally valid candidates/);
  });

  it('when even the dimensioned inputs fix no unique monomial, the stop reason says so', async () => {
    const r = await runProbeSearch(
      problem([
        { name: 'length', dim: 'length' },
        { name: 'width', dim: 'length' }, // two lengths: ℓ^a w^(1−a) is not unique
        { name: 'gravity', dim: 'acceleration' },
      ]),
      { repositoryCommit: 'test', now: '2026-09-25T00:00:00.000Z' },
    );
    expect(r.candidates).toHaveLength(0);
    expect(r.wording.join('\n')).toMatch(/not a unique monomial of the inputs/);
    expect(r.wording.join('\n')).not.toMatch(/no dimensionally valid candidates/);
  });
});
