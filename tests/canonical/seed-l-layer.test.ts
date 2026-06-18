/**
 * L-layer seeding (Task 8). The canonical registry should populate the tensor's
 * previously-empty L (known-laws) layer via the existing addLaw path.
 *
 * @module tests/canonical/seed-l-layer
 */
import { describe, it, expect } from 'vitest';
import { UniversalTensor } from '../../src/core/tensor.js';
import {
  canonicalToLaw,
  seedCanonicalLaws,
  CANONICAL_TENSOR_CONFIG,
} from '../../src/canonical/seed-l-layer.js';
import { CANONICAL_EQUATIONS, canonicalById } from '../../src/canonical/registry.js';

describe('canonical → L-layer seeding', () => {
  it('canonicalToLaw maps an entry onto the PhysicalLaw shape', () => {
    const law = canonicalToLaw(canonicalById('CE-pendulum-period')!);
    expect(law.id).toBe('CE-pendulum-period');
    expect(law.name).toBe('Pendulum period');
    expect(law.equation).toBe('T = 2\\pi\\sqrt{L/g}');
    expect(law.scales).toEqual(['classical']);
    expect(law.forces).toEqual(['gravitational']);
    expect(law.confidence).toBe(1);
    expect(law.references.length).toBeGreaterThanOrEqual(1);
  });

  it('seedCanonicalLaws fills the L-layer and the cells are queryable', () => {
    const t = new UniversalTensor(CANONICAL_TENSOR_CONFIG);
    const added = seedCanonicalLaws(t);
    expect(added).toBe(CANONICAL_EQUATIONS.length);
    expect(t.getStats().knownLaws).toBe(CANONICAL_EQUATIONS.length);
    // pendulum lives in the (classical, gravitational) diagonal cell
    expect(
      t.getCellContents({ scale: 'classical', force: 'gravitational' }),
    ).toContain('CE-pendulum-period');
  });
});
