/**
 * Family B: hand-authored fixtures + pipeline rediscovery / abstention.
 * Scorers live under tests/fixtures/discovery/<case>/scorer/ and must not
 * be imported from src/.
 */
import { describe, it, expect } from 'vitest';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { loadSearchProblemFromJson } from '../../../src/composition/probe/problem.js';
import { runProbeSearch } from '../../../src/composition/probe/pipeline.js';
import { monomialToExpr } from '../../../src/composition/probe/generator.js';
import { validate } from '../../../src/dimensional/validator.js';
import { evalExpr } from '../../../src/composition/expr-eval.js';
import { fitPrefactor } from '../../../src/composition/probe/fit.js';
import { formatProbeReport } from '../../../src/composition/probe/report.js';
import { loadHiddenTruth, monomialMatches } from '../../fixtures/discovery/pendulum-scaling/scorer/score.js';
import { loadHiddenTruth as loadNewton } from '../../fixtures/discovery/newton-second/scorer/score.js';
import { loadHiddenTruth as loadNoise } from '../../fixtures/discovery/pure-noise/scorer/score.js';
import { loadHiddenTruth as loadNsl } from '../../fixtures/discovery/no-simple-law/scorer/score.js';
import { CATALOG_GRAPH } from '../../../src/composition/catalog-graph.js';
import { scanFrontier, problemFromResidualGap } from '../../../src/composition/probe/frontier.js';
import { TIME, LENGTH, ACCELERATION } from '../../../src/dimensional/types.js';
import { makeResidualGap } from '../../../src/composition/probe/problem.js';

const here = dirname(fileURLToPath(import.meta.url));
const fixtures = join(here, '../../fixtures/discovery');

describe('Family B pendulum-scaling', () => {
  it('hand-authored monomial validates and recovers 2π on public data', () => {
    const problem = loadSearchProblemFromJson(join(fixtures, 'pendulum-scaling/public/problem.json'));
    const truth = loadHiddenTruth();
    const expr = monomialToExpr(truth.monomial, [problem.target, ...problem.governing]);
    expect(validate(expr).ok).toBe(true);
    const pred = evalExpr(expr, problem.exploratory!.rows[2]!);
    expect(pred).toBeCloseTo(Math.sqrt(1 / 9.81));
    const fit = fitPrefactor(expr, problem.exploratory!, problem.holdout);
    expect(fit.prefactor).toBeCloseTo(truth.prefactor, 5);
    expect(fit.holdoutSupported).toBe(true);
  });

  it('pipeline rediscovers the pendulum monomial as a known corpus relation', async () => {
    const problem = loadSearchProblemFromJson(join(fixtures, 'pendulum-scaling/public/problem.json'));
    const result = await runProbeSearch(problem, { repositoryCommit: 'test', now: '2026-08-19T00:00:00.000Z' });
    expect(result.stopReason).not.toBe('non-identifiable');
    const truth = loadHiddenTruth();
    const recovered = result.candidates.some((c) => {
      if (c.body.kind !== 'scalar-expr') return false;
      return result.corpus[c.id]?.algebraicMatches.some((m) => m.id === truth.canonicalId);
    });
    expect(recovered).toBe(true);
    expect(result.candidates.some((c) => c.status === 'equivalent-known' || c.status === 'heldout-supported' || c.status === 'expert-review-required')).toBe(true);
    const text = formatProbeReport(result);
    expect(text).toMatch(/experimental/);
    expect(text).not.toMatch(/discovered law/);
  });
});

describe('Family B newton-second', () => {
  it('recovers F = m a', async () => {
    const problem = loadSearchProblemFromJson(join(fixtures, 'newton-second/public/problem.json'));
    const result = await runProbeSearch(problem, { repositoryCommit: 'test' });
    const truth = loadNewton();
    expect(truth.canonicalId).toBe('CE-newton-second-law');
    expect(result.candidates.some((c) => result.corpus[c.id]?.algebraicMatches.some((m) => m.id === truth.canonicalId))).toBe(true);
    const fitId = Object.keys(result.fits)[0];
    if (fitId) expect(result.fits[fitId]!.prefactor).toBeCloseTo(1, 5);
  });
});

describe('Family B pure-noise / no-simple-law', () => {
  it('abstains on pure noise (no holdout-supported candidate)', async () => {
    const problem = loadSearchProblemFromJson(join(fixtures, 'pure-noise/public/problem.json'));
    const result = await runProbeSearch(problem, { repositoryCommit: 'test' });
    expect(loadNoise().expectAbstention).toBe(true);
    expect(result.candidates.every((c) => c.status !== 'heldout-supported' && c.status !== 'expert-review-required' && c.status !== 'falsification-survivor')).toBe(true);
    expect(result.stopReason).toBe('no-credible-candidate');
  });

  it('abstains when the target is dimensionally underdetermined', async () => {
    const problem = loadSearchProblemFromJson(join(fixtures, 'no-simple-law/public/problem.json'));
    const result = await runProbeSearch(problem, { repositoryCommit: 'test' });
    expect(loadNsl().expectAbstention).toBe(true);
    expect(result.candidates.length).toBe(0);
    expect(result.stopReason).toBe('no-credible-candidate');
  });
});

describe('Family B additive-correction', () => {
  it('runs the pipeline on a residual problem without crashing', async () => {
    const problem = loadSearchProblemFromJson(join(fixtures, 'additive-correction/public/problem.json'));
    expect(problem.discrepancy?.kind).toBe('additive');
    const result = await runProbeSearch(problem, { repositoryCommit: 'test' });
    expect(result.stopReason).not.toBe('non-identifiable');
    expect(result.candidates.length).toBeGreaterThan(0);
  });
});

describe('relation-link gaps abstain', () => {
  it('upt probe run on a wrapped Product A gap is non-identifiable', async () => {
    const gap = scanFrontier(CATALOG_GRAPH).find((g) => g.kind === 'relation-link');
    expect(gap).toBeDefined();
    const result = await runProbeSearch(
      {
        gap: gap!,
        target: { name: 'period', dim: TIME },
        governing: [
          { name: 'length', dim: LENGTH },
          { name: 'gravity', dim: ACCELERATION },
        ],
      },
      { repositoryCommit: 'test' },
    );
    expect(result.stopReason).toBe('non-identifiable');
    expect(result.wording.join(' ')).toMatch(/upt discover/);
  });

  it('problemFromResidualGap marks no-data problems as insufficient-evidence, not heldout', async () => {
    const gap = makeResidualGap('fg-nodata', 'theory only');
    const problem = problemFromResidualGap(gap, { name: 'period', dim: TIME }, [
      { name: 'length', dim: LENGTH },
      { name: 'gravity', dim: ACCELERATION },
    ]);
    const result = await runProbeSearch(problem, { repositoryCommit: 'test' });
    expect(result.candidates.every((c) => c.status === 'equivalent-known' || c.status === 'insufficient-evidence')).toBe(true);
    expect(result.candidates.some((c) => c.status === 'heldout-supported')).toBe(false);
  });
});

void monomialMatches;
