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
import { corpusPrefactorNotes, type CorpusComparisonResult } from '../../../src/composition/probe/corpus.js';
import { sym, dim } from '../../../src/dimensional/ast-builders.js';
import type { ExprNode } from '../../../src/dimensional/ast-types.js';

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

  it('the pendulum fixture fits 2π and AGREES with CE-pendulum-period, whose 2π the sourced table supplies', async () => {
    const problem = loadSearchProblemFromJson(join(fixtures, 'pendulum-scaling/public/problem.json'));
    const result = await runProbeSearch(problem, { repositoryCommit: 'test', now: '2026-09-25T00:00:00.000Z' });
    const notes = Object.values(result.prefactorNotes).flat();
    expect(notes.some((n) => /fitted ĉ=6\.283 agrees with CE-pendulum-period's prefactor 6\.283/.test(n))).toBe(true);
  });

  it('the persona case: finite-amplitude pendulum data CONTRADICT CE-pendulum-period', async () => {
    // T = 4√(ℓ/g) K(sin(θ0/2)) for θ0 across [1.2, 1.75] rad (so the holdout still passes);
    // K by the arithmetic-geometric mean. There T/T0 is 1.10–1.23, so ĉ lands 10–23% above 2π.
    const K = (k: number) => {
      let a = 1;
      let b = Math.sqrt(1 - k * k);
      for (let i = 0; i < 40; i++) [a, b] = [(a + b) / 2, Math.sqrt(a * b)];
      return Math.PI / (2 * a);
    };
    const rows = (n: number, offset: number) =>
      Array.from({ length: n }, (_, i) => {
        const length = 0.3 + ((i * 7 + offset) % 11) * 0.25 + offset * 0.013; // offset keeps holdout rows distinct
        const gravity = 2 + ((i * 5 + offset) % 13) * 1.7;
        const theta0 = 1.2 + ((i * 3 + offset) % 12) * 0.05;
        return { length, gravity, period: 4 * Math.sqrt(length / gravity) * K(Math.sin(theta0 / 2)) };
      });
    const problem = searchProblemFromFile({
      gap: { id: 'fg-large-amplitude', kind: 'unexplained-observation', summary: 'finite-amplitude pendulum' },
      target: { name: 'period', dim: 'time' },
      governing: [
        { name: 'length', dim: 'length' },
        { name: 'gravity', dim: 'acceleration' },
      ],
      exploratory: { id: 'e', role: 'exploratory-fit', observable: 'period', schemaVersion: '1', rows: rows(40, 0) },
      holdout: { id: 'h', role: 'validation-holdout', observable: 'period', schemaVersion: '1', rows: rows(15, 3) },
    });
    const result = await runProbeSearch(problem, { repositoryCommit: 'test', now: '2026-09-25T00:00:00.000Z' });
    const notes = Object.values(result.prefactorNotes).flat();
    expect(notes.some((n) => /contradicts CE-pendulum-period's prefactor 6\.283 \(\+\d+%\)/.test(n))).toBe(true);
  });
});

describe('corpusPrefactorNotes — alignment and failure paths', () => {
  const G_DIM = dim(3, -1, -2);
  const RHO_DIM = dim(-3, 1, 0);
  const result = (id: string, layer: 'canonical' | 'bridge'): CorpusComparisonResult => ({
    corpusId: 'c', corpusVersion: '0', exactMatches: [], algebraicMatches: [{ id, layer }], searchedAt: '',
  });
  const times = (a: ExprNode, b: ExprNode): ExprNode => ({ kind: 'op', op: '*', args: [a, b] }) as ExprNode;

  it('aligns candidate symbols to the corpus AST by DIMENSION when the names differ', () => {
    // CE-friedmann's AST uses G and rho; this candidate calls them Gee and density.
    const candidate = times(sym('Gee', G_DIM), sym('density', RHO_DIM));
    const [note] = corpusPrefactorNotes(result('CE-friedmann', 'canonical'), candidate, (8 * Math.PI) / 3, 0.15);
    expect(note).toMatch(/agrees with CE-friedmann's prefactor 8\.378/);
  });

  it('a bridge-layer match records no prefactor', () => {
    const [note] = corpusPrefactorNotes(result('be-42', 'bridge'), sym('x', G_DIM), 1, 0.15);
    expect(note).toBe('be-42 records no prefactor, so the fitted ĉ=1.000 is not compared with it');
  });

  it('a candidate that cannot be evaluated gives no comparison rather than a number', () => {
    // rho / (G − G) divides by zero at every point: the evaluator throws, and no prefactor is read.
    const zero: ExprNode = { kind: 'op', op: '-', args: [sym('G', G_DIM), sym('G', G_DIM)] } as ExprNode;
    const candidate: ExprNode = { kind: 'op', op: '/', args: [sym('rho', RHO_DIM), zero] } as ExprNode;
    const [note] = corpusPrefactorNotes(result('CE-friedmann', 'canonical'), candidate, 1, 0.15);
    expect(note).toMatch(/CE-friedmann records no prefactor/);
  });
});
