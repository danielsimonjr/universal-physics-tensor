import { describe, it, expect } from 'vitest';
import { UPTError, DimensionMismatchError } from '../../src/dimensional/errors.js';

describe('UPTError base class', () => {
  it('is a subclass of Error', () => {
    const err = new UPTError('test');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(UPTError);
    expect(err.name).toBe('UPTError');
  });

  it('DimensionMismatchError subclasses UPTError', () => {
    const err = new DimensionMismatchError(
      'mismatched',
      { L: 1, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 },
      { L: 2, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 },
    );
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(UPTError);
    expect(err).toBeInstanceOf(DimensionMismatchError);
    expect(err.name).toBe('DimensionMismatchError');
  });

  it('preserves expected and actual properties on DimensionMismatchError', () => {
    const expected = { L: 1, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 };
    const actual = { L: 2, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 };
    const err = new DimensionMismatchError('msg', expected, actual);
    expect(err.expected).toEqual(expected);
    expect(err.actual).toEqual(actual);
  });
});
