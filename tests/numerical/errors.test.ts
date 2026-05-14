import { describe, it, expect } from 'vitest';
import { NumericalBackendError } from '../../src/numerical/errors.js';
import { UPTError } from '../../src/dimensional/errors.js';

describe('NumericalBackendError', () => {
  it('is instanceof NumericalBackendError, UPTError, and Error', () => {
    const e = new NumericalBackendError('test message');
    expect(e instanceof NumericalBackendError).toBe(true);
    expect(e instanceof UPTError).toBe(true);
    expect(e instanceof Error).toBe(true);
  });
  it('carries the message and the name', () => {
    const e = new NumericalBackendError('boom');
    expect(e.message).toBe('boom');
    expect(e.name).toBe('NumericalBackendError');
  });
});
