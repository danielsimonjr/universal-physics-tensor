import { describe, it, expect } from 'vitest';
import { metric, kronecker, pderiv } from '../../src/dimensional/metric.js';
import { tsym } from '../../src/dimensional/tensor.js';
import { DIMENSIONLESS } from '../../src/dimensional/types.js';
import { validate } from '../../src/dimensional/validator.js';

const LENGTH = { L: 1, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 };

describe('metric-layer AST JSON round-trip', () => {
  it('metric-tensor round-trips losslessly', () => {
    const g = metric(
      'g',
      [
        { label: 'μ', variance: 'lower' },
        { label: 'ν', variance: 'lower' },
      ],
      DIMENSIONLESS,
      '+,-,-,-',
    );
    const json = JSON.stringify(g);
    const parsed = JSON.parse(json);
    expect(parsed).toEqual(g);
    // Validate that the parsed node still validates the same way.
    const original = validate(g);
    const roundtripped = validate(parsed);
    expect(roundtripped.ok).toBe(original.ok);
    expect(roundtripped.inferredDimension).toEqual(original.inferredDimension);
  });

  it('kronecker-delta round-trips losslessly', () => {
    const delta = kronecker('μ', 'ν');
    const json = JSON.stringify(delta);
    const parsed = JSON.parse(json);
    expect(parsed).toEqual(delta);
  });

  it('tensor-partial-derivative round-trips losslessly (incl. wrtIndex nested object)', () => {
    const phi = tsym('phi', [], DIMENSIONLESS);
    const x = tsym('x', [{ label: 'α', variance: 'upper' }], LENGTH, 'coordinate');
    const dPhi = pderiv(phi, x, { label: 'μ', variance: 'lower' });
    const json = JSON.stringify(dPhi);
    const parsed = JSON.parse(json);
    expect(parsed).toEqual(dPhi);
    expect(parsed.wrtIndex).toEqual({ label: 'μ', variance: 'lower' });
    expect(parsed.of).toEqual(phi);
    expect(parsed.wrt).toEqual(x);
  });

  it('round-tripped nodes serialize identically on second pass', () => {
    const g = metric(
      'g',
      [
        { label: 'α', variance: 'lower' },
        { label: 'β', variance: 'lower' },
      ],
      DIMENSIONLESS,
      '+,-,-,-',
    );
    const r1 = JSON.stringify(g);
    const r2 = JSON.stringify(JSON.parse(r1));
    expect(r2).toBe(r1);
  });
});
