import { describe, it, expect, afterEach } from 'vitest';
import { validate } from '../../src/dimensional/validator.js';
import type { ExprNode } from '../../src/dimensional/validator.js';
import { tsym } from '../../src/dimensional/tensor.js';
import { metric } from '../../src/dimensional/metric.js';
import { LENGTH, DIMENSIONLESS } from '../../src/dimensional/types.js';

const gLower = metric('g',
  [{ label: 'a', variance: 'lower' }, { label: 'b', variance: 'lower' }],
  DIMENSIONLESS, '+,-,-,-');
const gInverse = metric('gInv',
  [{ label: 'a', variance: 'upper' }, { label: 'b', variance: 'upper' }],
  DIMENSIONLESS, '+,-,-,-');
const xCoord = tsym('x', [{ label: 'α', variance: 'upper' }], LENGTH, 'coordinate');

describe('covariant-derivative node', () => {
  it('∇_μ V^ν validates as rank-2 with freeIndices {μ:lower, ν:upper}', () => {
    const V = tsym('V', [{ label: 'ν', variance: 'upper' }], LENGTH);
    const node: ExprNode = {
      kind: 'covariant-derivative',
      of: V, wrt: xCoord,
      wrtIndex: { label: 'μ', variance: 'lower' },
      gLower, gInverse,
    };
    const r = validate(node);
    expect(r.ok).toBe(true);
    expect(r.freeIndices.size).toBe(2);
    expect(r.freeIndices.get('μ')).toEqual({ upper: 0, lower: 1 });
    expect(r.freeIndices.get('ν')).toEqual({ upper: 1, lower: 0 });
    // Critically: gLower/gInverse's free indices (a, b) MUST NOT appear in the output.
    expect(r.freeIndices.has('a')).toBe(false);
    expect(r.freeIndices.has('b')).toBe(false);
  });

  it('∇_μ S (scalar S) validates as rank-1 with freeIndices {μ:lower}', () => {
    const S = tsym('S', [], LENGTH);
    const node: ExprNode = {
      kind: 'covariant-derivative',
      of: S, wrt: xCoord,
      wrtIndex: { label: 'μ', variance: 'lower' },
      gLower, gInverse,
    };
    const r = validate(node);
    expect(r.ok).toBe(true);
    expect(r.freeIndices.size).toBe(1);
    expect(r.freeIndices.get('μ')).toEqual({ upper: 0, lower: 1 });
  });

  it('throws when wrtIndex.variance is "upper"', () => {
    const V = tsym('V', [{ label: 'ν', variance: 'upper' }], LENGTH);
    const node: ExprNode = {
      kind: 'covariant-derivative',
      of: V, wrt: xCoord,
      wrtIndex: { label: 'μ', variance: 'upper' } as never,
      gLower, gInverse,
    };
    expect(() => validate(node)).toThrow(/wrtIndex.*lower/i);
  });

  it('throws when gLower variance is not both-lower', () => {
    const V = tsym('V', [{ label: 'ν', variance: 'upper' }], LENGTH);
    const node: ExprNode = {
      kind: 'covariant-derivative',
      of: V, wrt: xCoord,
      wrtIndex: { label: 'μ', variance: 'lower' },
      gLower: gInverse, gInverse,  // both upper → wrong for gLower slot
    };
    expect(() => validate(node)).toThrow(/gLower.*both-lower|covariant metric/i);
  });

  it('throws when gInverse variance is not both-upper', () => {
    const V = tsym('V', [{ label: 'ν', variance: 'upper' }], LENGTH);
    const node: ExprNode = {
      kind: 'covariant-derivative',
      of: V, wrt: xCoord,
      wrtIndex: { label: 'μ', variance: 'lower' },
      gLower, gInverse: gLower,  // both lower → wrong for gInverse slot
    };
    expect(() => validate(node)).toThrow(/gInverse.*both-upper|inverse metric/i);
  });

  describe('wrtIndex collision with of.freeIndices', () => {
    // V has free index 'μ'; wrtIndex is also 'μ' → collision.
    const Vmu = tsym('V', [{ label: 'μ', variance: 'upper' }], LENGTH);
    const collisionNode = (): ExprNode => ({
      kind: 'covariant-derivative',
      of: Vmu, wrt: xCoord,
      wrtIndex: { label: 'μ', variance: 'lower' },
      gLower, gInverse,
    });

    afterEach(() => {
      // Restore env in case a test mutated it.
      delete process.env['UPT_ALLOW_COORD_SHADOW'];
    });

    it('collision: throws by default (browser-safe guard absent → must not crash)', () => {
      // This test also exercises Finding #1: with the guard in place the
      // check runs in Node (process exists) and throws as expected.
      delete process.env['UPT_ALLOW_COORD_SHADOW'];
      expect(() => validate(collisionNode())).toThrow(/shadows.*free index|UPT_ALLOW_COORD_SHADOW/i);
    });

    it('collision: emits DuplicateCoordinateWarning and does NOT throw when UPT_ALLOW_COORD_SHADOW=1', () => {
      process.env['UPT_ALLOW_COORD_SHADOW'] = '1';
      const warnings: Error[] = [];
      // Intercept process.emitWarning synchronously (the event fires async,
      // but emitWarning itself is sync — spy on it before calling validate).
      const orig = process.emitWarning.bind(process);
      process.emitWarning = (w: string | Error, ...args: unknown[]) => {
        if (w instanceof Error) warnings.push(w);
        return (orig as (...a: unknown[]) => void)(w, ...args);
      };
      try {
        expect(() => validate(collisionNode())).not.toThrow();
        expect(warnings.length).toBeGreaterThanOrEqual(1);
        expect(warnings[0]!.name).toBe('DuplicateCoordinateWarning');
      } finally {
        process.emitWarning = orig;
        delete process.env['UPT_ALLOW_COORD_SHADOW'];
      }
    });

  });
});
