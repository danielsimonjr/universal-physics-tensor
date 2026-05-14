import { describe, it, expect } from 'vitest';
import { tsym } from '../../src/dimensional/tensor.js';
import type { TensorSymbolNode } from '../../src/dimensional/tensor.js';
import { LENGTH } from '../../src/dimensional/types.js';

describe('TensorSymbolNode.numericalForm', () => {
  it('tsym omits numericalForm when not supplied', () => {
    const t = tsym('S', [{ label: 'mu', variance: 'lower' }], LENGTH);
    expect('numericalForm' in t).toBe(false);
  });

  it('tsym carries numericalForm when supplied', () => {
    const t = tsym('S', [{ label: 'mu', variance: 'lower' }], LENGTH, 'field', 'grid');
    expect(t.numericalForm).toBe('grid');
  });

  it('numericalForm survives JSON round-trip', () => {
    const t = tsym('S', [{ label: 'mu', variance: 'lower' }], LENGTH, undefined, 'numerical-fn');
    const round: TensorSymbolNode = JSON.parse(JSON.stringify(t));
    expect(round.numericalForm).toBe('numerical-fn');
  });
});
