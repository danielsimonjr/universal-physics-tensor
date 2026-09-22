/**
 * The atlas barrel exposes the Phase 1–3 core.
 *
 * The S6.7 API review found that `deriveEvidence`, `NO_PASSING_WITNESSES`,
 * `ALL_EVIDENCE_TAGS`, `composeRelation`, `COMPOSITION_TABLE`,
 * `NO_COMPOSITE_CLAIM`, `findPath` and `boundPath` were not exported by
 * `src/atlas/index.ts` at all: subpath users could not reach them, and the only
 * route was the CLI's internal barrel. The tiering was therefore decided over an
 * incomplete picture. This pins the gap closed.
 */

import { describe, expect, it } from 'vitest';
import * as atlas from '../../src/atlas/index.js';

const REQUIRED = [
  'deriveEvidence',
  'NO_PASSING_WITNESSES',
  'ALL_EVIDENCE_TAGS',
  'composeRelation',
  'COMPOSITION_TABLE',
  'NO_COMPOSITE_CLAIM',
  'findPath',
  'boundPath',
] as const;

describe('atlas barrel completeness', () => {
  it('CONTROL: the check reports a name the barrel does not have', () => {
    expect(Object.keys(atlas)).not.toContain('zzzNotExported');
  });

  it.each(REQUIRED)('exports %s', (name) => {
    expect(Object.keys(atlas)).toContain(name);
  });
});
