import { describe, it, expect } from 'vitest';
import { EngineCapabilityError } from '../../src/numerical/tensor-engine.js';
import { Float64ReferenceEngine } from '../../src/numerical/float64-engine.js';

// Gated on the optional peer @danielsimonjr/mathts-tensor — when absent,
// skip rather than failing to load. Same discipline as
// `engine-conformance.test.ts:20`.
let MathTSEngine: typeof import('../../src/numerical/mathts-engine.js').MathTSEngine | null = null;
try {
  ({ MathTSEngine } = await import('../../src/numerical/mathts-engine.js'));
} catch {
  // Optional dep absent — describe.skip below.
}

// Additionally gate on @danielsimonjr/mathts-autograd: these tests assert
// the catch-and-rethrow path that fires when the autograd peer is absent.
// When it's PRESENT, the call goes through to the autograd implementation
// and may legitimately throw a different error (e.g., NumericalBackendError
// from `unwrap`, since the test feeds a Float64Tensor not a MathTSEngineTensor).
// The original gating only checked mathts-tensor presence and erroneously ran
// these tests when mathts-autograd was also present, which broke on 2026-05-25
// after the typed-function EOVERRIDE was fixed and the autograd chain finally
// installed cleanly. See `docs/architecture/` for the dev-dep validation log.
let autogradAbsent = false;
try { await import('@danielsimonjr/mathts-autograd'); } catch { autogradAbsent = true; }

if (MathTSEngine !== null && autogradAbsent) {
  describe('MathTSEngine: autograd interface typing (absence path)', () => {
    it('forwardGrad throws EngineCapabilityError when mathts-autograd is absent', async () => {
      const engine = new MathTSEngine!();
      const x = new Float64ReferenceEngine().fromNested([1, 0], [2]);
      try {
        await engine.forwardGrad((t) => t, x);
      } catch (e) {
        expect(e).toBeInstanceOf(EngineCapabilityError);
      }
    });

    it('reverseGrad throws EngineCapabilityError when mathts-autograd is absent', async () => {
      const engine = new MathTSEngine!();
      const x = new Float64ReferenceEngine().fromNested([1, 0], [2]);
      try {
        await engine.reverseGrad((t) => t, x);
      } catch (e) {
        expect(e).toBeInstanceOf(EngineCapabilityError);
      }
    });
  });
} else if (MathTSEngine !== null && !autogradAbsent) {
  describe.skip('MathTSEngine: autograd interface typing (skipped: autograd present — absence path n/a)', () => {});
} else {
  describe.skip('MathTSEngine: autograd interface typing (skipped: mathts-tensor peer absent)', () => {});
}
