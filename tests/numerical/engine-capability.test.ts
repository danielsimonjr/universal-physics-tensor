import { describe, it, expect } from 'vitest';
import { Float64ReferenceEngine } from '../../src/numerical/float64-engine.js';
import { hasAutogradSupport, EngineCapabilityError } from '../../src/numerical/tensor-engine.js';

describe('TensorEngine AD capability detection', () => {
  it('hasAutogradSupport returns false on engines without forwardGrad/reverseGrad', () => {
    const engine = new Float64ReferenceEngine();
    expect(hasAutogradSupport(engine)).toBe(false);
  });

  it('EngineCapabilityError carries engine name + missing-method name', () => {
    const err = new EngineCapabilityError('Float64ReferenceEngine', 'forwardGrad');
    expect(err.message).toMatch(/Float64ReferenceEngine/);
    expect(err.message).toMatch(/forwardGrad/);
    expect(err.name).toBe('EngineCapabilityError');
    expect(err instanceof EngineCapabilityError).toBe(true);
  });
});
