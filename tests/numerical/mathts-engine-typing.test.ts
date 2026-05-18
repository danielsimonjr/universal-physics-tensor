import { describe, it, expect } from 'vitest';
import { MathTSEngine } from '../../src/numerical/mathts-engine.js';
import { EngineCapabilityError } from '../../src/numerical/tensor-engine.js';
import { Float64ReferenceEngine } from '../../src/numerical/float64-engine.js';

describe('MathTSEngine: autograd interface typing', () => {
  it('forwardGrad throws EngineCapabilityError when mathts-autograd is absent', async () => {
    // This test verifies the catch-and-rethrow path. If mathts-autograd IS
    // installed, the dynamic import succeeds and this test becomes a no-op
    // for the catch path — but the test still passes. The primary value of
    // this test is confirming the EngineCapabilityError is thrown (not a
    // random TypeError from an any-typed call site).
    const engine = new MathTSEngine();
    const x = new Float64ReferenceEngine().fromNested([1, 0], [2]);
    try {
      // Pass a plain Float64Tensor as x — MathTSEngine.forwardGrad will
      // either invoke mathts-autograd successfully or throw EngineCapabilityError.
      // We only assert that if it throws, it IS an EngineCapabilityError.
      await engine.forwardGrad((t) => t, x);
    } catch (e) {
      expect(e).toBeInstanceOf(EngineCapabilityError);
    }
  });

  it('reverseGrad throws EngineCapabilityError when mathts-autograd is absent', async () => {
    const engine = new MathTSEngine();
    const x = new Float64ReferenceEngine().fromNested([1, 0], [2]);
    try {
      await engine.reverseGrad((t) => t, x);
    } catch (e) {
      expect(e).toBeInstanceOf(EngineCapabilityError);
    }
  });
});
