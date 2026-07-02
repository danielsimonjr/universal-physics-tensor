import { describe, it, expect } from 'vitest';
import { candidateId } from '../../src/composition/adjudication.js';

describe('candidateId', () => {
  it('is symmetric under argument order', () => {
    expect(candidateId('coarsening-length', 'quantum-correlation-length')).toBe(
      candidateId('quantum-correlation-length', 'coarsening-length'),
    );
  });
  it('normalizes to lo~hi over kebab-case slugs', () => {
    expect(candidateId('mutation-rate', 'decoherence-rate')).toBe(
      'decoherence-rate~mutation-rate',
    );
  });
  it('distinct pairs get distinct ids', () => {
    expect(candidateId('a', 'b')).not.toBe(candidateId('a', 'c'));
  });
  it('rejects names outside the kebab-case slug set (collision guard)', () => {
    expect(() => candidateId('bad~name', 'mass')).toThrow(/kebab-case/u);
    expect(() => candidateId('mass', 'Bad-Case')).toThrow(/kebab-case/u);
  });
});
