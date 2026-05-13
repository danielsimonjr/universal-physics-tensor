import { describe, it, expect } from 'vitest';
import {
  VarianceMismatchError,
  IndexLabelCollisionError,
} from '../../src/dimensional/errors.js';

describe('v0.3.0 error-message discoverability', () => {
  it('VarianceMismatchError message suggests raise() / lower()', () => {
    const err = new VarianceMismatchError('μ', 'upper');
    expect(err.message).toContain('raise(');
    expect(err.message).toContain('lower(');
    expect(err.message).toContain('metric');
  });

  it('VarianceMismatchError still includes the original label + variance', () => {
    const err = new VarianceMismatchError('μ', 'upper');
    expect(err.message).toContain('μ');
    expect(err.message).toContain('upper');
  });

  it('IndexLabelCollisionError includes baseline guidance', () => {
    const err = new IndexLabelCollisionError('ν', 3);
    expect(err.message).toContain('ν');
    expect(err.message).toContain('3');
    expect(err.message).toContain('Rename');
  });
});
