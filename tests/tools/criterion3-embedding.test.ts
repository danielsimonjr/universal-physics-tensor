/**
 * Criterion 3, the embedding condition (pre-registration Amendment 11): the cosine ranker, the
 * vector encoding and the verdict rule of §6 item 3.
 */

import { describe, expect, it } from 'vitest';
import {
  cosine,
  criterionVerdict,
  decodeVector,
  embeddingRanker,
  encodeVector,
  queryInput,
} from '../../tools/criterion3-study/embedding.js';
import type { CorpusRecord, RetrievalQuery } from '../../src/atlas/benchmark/baselines.js';
import type { GroupResult } from '../../tools/criterion3-study/run.js';

const group = (hits: number, n: number, lower: number, upper: number): GroupResult => ({
  group: 'all families',
  n,
  hits,
  recall: hits / n,
  lower,
  upper,
});

describe('criterion 3 embedding condition', () => {
  it('encodes a vector as float32 base64 and decodes it exactly', () => {
    const v = [0.5, -0.25, 0.125, 1];
    expect(Array.from(decodeVector(encodeVector(v)))).toEqual(v);
  });

  it('cosine is 1 for parallel vectors and 0 for orthogonal ones', () => {
    expect(cosine(Float32Array.from([1, 2]), Float32Array.from([2, 4]))).toBeCloseTo(1, 12);
    expect(cosine(Float32Array.from([1, 0]), Float32Array.from([0, 3]))).toBe(0);
  });

  it('ranks by cosine, best first, and breaks ties by id', () => {
    const corpus: CorpusRecord[] = [
      { id: 'c-b', text: 'b' },
      { id: 'c-a', text: 'a' },
      { id: 'c-x', text: 'x' },
    ];
    const q: RetrievalQuery = { text: 'q' };
    const rank = embeddingRanker(
      new Map([[q, Float32Array.from([1, 0])]]),
      new Map([
        ['c-b', Float32Array.from([1, 1])],
        ['c-a', Float32Array.from([2, 2])],
        ['c-x', Float32Array.from([1, 0])],
      ]),
    );
    // c-x is parallel; c-a and c-b tie at cos 45°, so the id orders them.
    expect(rank(q, corpus)).toEqual(['c-x', 'c-a', 'c-b']);
  });

  it('refuses a query or a record that has no vector', () => {
    const q: RetrievalQuery = { text: 'q' };
    const rank = embeddingRanker(new Map(), new Map([['c', Float32Array.from([1])]]));
    expect(() => rank(q, [{ id: 'c', text: 'c' }])).toThrow(/no vector/);
  });

  it('marks queries with the registered instruction and leaves records raw', () => {
    expect(queryInput('claim text')).toMatch(/^Instruct: .+\nQuery: claim text$/);
  });

  it('MET only when the typed interval lies above the embedding point estimate', () => {
    // Typed 12/50 = 24.0% [14.3%, 37.4%].
    const typed = group(12, 50, 0.1430, 0.3740);
    expect(criterionVerdict(typed, group(7, 50, 0.07, 0.26)).met).toBe(true); // 14.0% < 14.3%
    // Negative control: an embedding recall at the lower bound or above must NOT pass.
    expect(criterionVerdict(typed, group(8, 50, 0.08, 0.29)).met).toBe(false); // 16.0%
    expect(criterionVerdict(typed, group(34, 50, 0.54, 0.79)).met).toBe(false);
  });
});
