/**
 * Task 13 [U]: DuplicateCoordinateWarning — hybrid throw/warn for shadowed
 * wrt labels in covariant-derivative.
 *
 * Tests both paths of the I1 HYBRID DECISION:
 *   - Default: throws MetricSignatureError.
 *   - UPT_ALLOW_COORD_SHADOW=1: emits DuplicateCoordinateWarning via
 *     process.emitWarning, does NOT throw.
 *
 * This file exercises the canonical DuplicateCoordinateWarning class
 * (exported from src/numerical/index.ts per the public API surface).
 * The class itself lives in src/dimensional/errors.ts to avoid a
 * dimensional→numerical import cycle.
 */
import { describe, it, expect, afterEach, vi } from 'vitest';
import { DuplicateCoordinateWarning } from '../../src/numerical/index.js';
import { MetricSignatureError } from '../../src/dimensional/errors.js';
import { validate } from '../../src/dimensional/validator.js';
import type { ExprNode } from '../../src/dimensional/validator.js';
import { tsym } from '../../src/dimensional/tensor.js';
import { metric } from '../../src/dimensional/metric.js';
import { LENGTH, DIMENSIONLESS } from '../../src/dimensional/types.js';

// Minimal metric pair for covariant-derivative nodes.
const gLower = metric(
  'g',
  [{ label: 'a', variance: 'lower' }, { label: 'b', variance: 'lower' }],
  DIMENSIONLESS,
  '+,-,-,-',
);
const gInverse = metric(
  'gInv',
  [{ label: 'a', variance: 'upper' }, { label: 'b', variance: 'upper' }],
  DIMENSIONLESS,
  '+,-,-,-',
);
const xCoord = tsym('x', [{ label: 'α', variance: 'upper' }], LENGTH, 'coordinate');

// ∇_μ V^μ — wrt label 'μ' collides with V's own free index 'μ'.
const ambiguousNode = (): ExprNode => {
  const Vmu = tsym('V', [{ label: 'μ', variance: 'upper' }], LENGTH);
  return {
    kind: 'covariant-derivative',
    of: Vmu,
    wrt: xCoord,
    wrtIndex: { label: 'μ', variance: 'lower' },
    gLower,
    gInverse,
  };
};

afterEach(() => {
  delete process.env['UPT_ALLOW_COORD_SHADOW'];
});

describe('DuplicateCoordinateWarning — hybrid throw/warn (Task 13)', () => {
  it('DuplicateCoordinateWarning is a real class exportable from src/numerical/index.ts', () => {
    // The class must exist and be constructable.
    const w = new DuplicateCoordinateWarning('μ', 'μ');
    expect(w).toBeInstanceOf(DuplicateCoordinateWarning);
    expect(w).toBeInstanceOf(Error);
    expect(w.name).toBe('DuplicateCoordinateWarning');
    expect(w.message).toMatch(/shadow|collid/i);
    // Object.setPrototypeOf must be present so instanceof works after
    // ES5 transpilation and across realm boundaries.
    expect(w instanceof DuplicateCoordinateWarning).toBe(true);
  });

  it('Default path: collision throws MetricSignatureError (UPT_ALLOW_COORD_SHADOW unset)', () => {
    delete process.env['UPT_ALLOW_COORD_SHADOW'];
    expect(() => validate(ambiguousNode())).toThrow(MetricSignatureError);
  });

  it('UPT_ALLOW_COORD_SHADOW=1: collision emits DuplicateCoordinateWarning and does NOT throw', () => {
    process.env['UPT_ALLOW_COORD_SHADOW'] = '1';
    // v0.5.1 PD-8: capture via vi.spyOn with mockImplementation so the
    // intentional DuplicateCoordinateWarning does NOT surface to stderr
    // during the test run. We assert on the spy's calls rather than
    // forwarding to the original emitter.
    const emitSpy = vi.spyOn(process, 'emitWarning').mockImplementation(() => {});
    try {
      expect(() => validate(ambiguousNode())).not.toThrow();
      const warnings = emitSpy.mock.calls
        .map((args) => args[0])
        .filter((w): w is Error => w instanceof Error);
      expect(warnings.length).toBeGreaterThanOrEqual(1);
      expect(warnings[0]).toBeInstanceOf(DuplicateCoordinateWarning);
      expect(warnings[0]!.name).toBe('DuplicateCoordinateWarning');
      expect(warnings[0]!.message).toMatch(/shadow|collid/i);
    } finally {
      emitSpy.mockRestore();
      delete process.env['UPT_ALLOW_COORD_SHADOW'];
    }
  });
});
