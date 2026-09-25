/**
 * Probe: a candidate that is algebraically equivalent to a corpus relation has its FITTED
 * prefactor compared with the corpus prefactor (persona finding L7, 2026-09-25).
 *
 * The persona fitted finite-amplitude pendulum data (θ0 up to 2.5 rad). The probe found
 * √(ℓ/g) with ĉ = 7.387 and marked it "equivalent to CE-pendulum-period (not novel)". The
 * small-angle law has 2π = 6.283, so the data lay outside its regime, and nothing said so.
 *
 * `normalForm` matches up to a constant, so the comparison needs the corpus prefactor itself.
 * Only a fully quantitative entry records one. CE-pendulum-period is dimensional only, so for
 * the persona's own case the honest answer is "records no prefactor, not compared". The
 * positive cases use CE-friedmann, H² = (8π/3) G ρ, which records 8π/3 = 8.37758.
 */
import { describe, it, expect } from 'vitest';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { loadSearchProblemFromJson, searchProblemFromFile } from '../../../src/composition/probe/problem.js';
import { runProbeSearch } from '../../../src/composition/probe/pipeline.js';

const here = dirname(fileURLToPath(import.meta.url));
const fixtures = join(here, '../../fixtures/discovery');

const G = 6.6743e-11;
const EIGHT_PI_OVER_3 = (8 * Math.PI) / 3;

/** Friedmann data H² = scale · (8π/3) G ρ over a spread of densities (G is a fixed constant). */
function friedmannProblem(scale: number) {
  const rows = (rhos: number[]) =>
    rhos.map((rho) => ({ G, rho, 'hubble-rate-squared': scale * EIGHT_PI_OVER_3 * G * rho }));
  return searchProblemFromFile({
    gap: { id: `fg-friedmann-${scale}`, kind: 'unexplained-observation', summary: 'Friedmann H² against ρ' },
    target: { name: 'hubble-rate-squared', dim: 'T^-2' },
    governing: [
      { name: 'G', dim: 'L^3.M^-1.T^-2' },
      { name: 'rho', dim: 'M^1.L^-3' },
    ],
    exploratory: {
      id: 'expl', role: 'exploratory-fit', observable: 'hubble-rate-squared', schemaVersion: '1',
      rows: rows([1e-27, 3e-27, 7e-27, 2e-26, 5e-26, 9e-26]),
    },
    holdout: {
      id: 'hold', role: 'validation-holdout', observable: 'hubble-rate-squared', schemaVersion: '1',
      rows: rows([2e-27, 4e-26]),
    },
  });
}

async function notesFor(problem: ReturnType<typeof friedmannProblem>): Promise<string[]> {
  const result = await runProbeSearch(problem, { repositoryCommit: 'test', now: '2026-09-25T00:00:00.000Z' });
  return Object.values(result.prefactorNotes).flat();
}

describe('probe — the fitted prefactor against the corpus prefactor', () => {
  it('Friedmann data with the true 8π/3 AGREE with CE-friedmann', async () => {
    const notes = await notesFor(friedmannProblem(1));
    expect(notes.some((n) => /fitted ĉ=8\.378 agrees with CE-friedmann's prefactor 8\.378/.test(n))).toBe(true);
  });

  it('Friedmann data 20% high CONTRADICT CE-friedmann, by +20%', async () => {
    const notes = await notesFor(friedmannProblem(1.2));
    expect(
      notes.some((n) =>
        /fitted ĉ=10\.05 contradicts CE-friedmann's prefactor 8\.378 \(\+20%\): the data may lie outside that relation's regime/.test(n),
      ),
    ).toBe(true);
  });

  it('the persona case: CE-pendulum-period records no prefactor, so ĉ is not compared', async () => {
    const problem = loadSearchProblemFromJson(join(fixtures, 'pendulum-scaling/public/problem.json'));
    const result = await runProbeSearch(problem, { repositoryCommit: 'test', now: '2026-09-25T00:00:00.000Z' });
    const notes = Object.values(result.prefactorNotes).flat();
    expect(notes.some((n) => /CE-pendulum-period records no prefactor, so the fitted ĉ=6\.28\d is not compared with it/.test(n))).toBe(true);
  });
});
