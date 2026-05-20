/**
 * Refactor-only invariant tests for CurvatureCompositeNode<K, S> factory.
 * (v0.6.0 Phase 3, Task 3.9)
 *
 * These tests assert two structural properties that must hold regardless of
 * how the individual node types are migrated in Task 3.10:
 *   1. The registry contains all 6 v0.6.0 curvature kinds.
 *   2. Riemann and Weyl share the rank-4 (1-upper 3-lower) free-index shape.
 */

import { describe, it, expect } from 'vitest';
import {
  CURVATURE_KIND_REGISTRY,
} from '../../src/dimensional/curvature-composite.js';

describe('CurvatureCompositeNode<K, S> factory', () => {
  it('registry contains all 6 v0.6.0 kinds', () => {
    expect(Object.keys(CURVATURE_KIND_REGISTRY).sort()).toEqual([
      'bianchi-residual',
      'einstein-tensor',
      'kretschmann-scalar',
      'ricci-tensor',
      'riemann-tensor',
      'weyl-tensor',
    ]);
  });

  it('Riemann + Weyl share rank-4 free-indices shape', () => {
    expect(CURVATURE_KIND_REGISTRY['riemann-tensor'].freeIndicesShape).toBe('rank-4-1upper-3lower');
    expect(CURVATURE_KIND_REGISTRY['weyl-tensor'].freeIndicesShape).toBe('rank-4-1upper-3lower');
  });
});
