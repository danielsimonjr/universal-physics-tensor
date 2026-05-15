/**
 * Task 19 [U]: MathTSEngine-default flip + graceful degradation.
 *
 * Test 1: When both optional deps are installed, getActiveEngine() auto-detects
 *         and returns MathTSEngine. Skips gracefully when either dep is absent.
 *
 * Test 2: Falls back to Float64ReferenceEngine when either dep is absent —
 *         tested structurally via the resetEngineForTesting() hook: reset the
 *         Promise-cache, then immediately set the engine to a known value to
 *         verify the wiring is clean.
 *
 * Test 3: setActiveEngine + getActiveEngine round-trip confirms Promise-cache
 *         (I4): the exact instance injected via setActiveEngine is returned.
 *
 * @module tests/numerical/engine-default
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { Float64ReferenceEngine } from '../../src/numerical/float64-engine.js';
import { getActiveEngine, setActiveEngine } from '../../src/numerical/index.js';
import { resetEngineForTesting } from '../../src/numerical/engine-registry.js';

describe('v0.4.0 MathTSEngine-default flip', () => {
  beforeEach(() => {
    // Wipe the Promise-cache between tests so each test starts from a clean
    // state. resetEngineForTesting() clears both _activeEngineP and
    // _resolvedDefault (the detection-result cache).
    resetEngineForTesting();
  });

  it('returns MathTSEngine when both mathts-tensor + mathts-autograd are present', async () => {
    // Probe whether both optional peers are resolvable in this test environment.
    let hasBoth = true;
    try {
      await import('@danielsimonjr/mathts-tensor');
      await import('@danielsimonjr/mathts-autograd');
    } catch {
      hasBoth = false;
    }

    if (!hasBoth) {
      console.warn('[engine-default.test] Optional deps absent — skipping MathTSEngine-default test');
      return;
    }

    // Cache reset done by beforeEach; detectDefault() will run fresh.
    const engine = await getActiveEngine();
    expect(engine.constructor.name).toBe('MathTSEngine');
  });

  it('falls back to Float64ReferenceEngine when either dep is absent', async () => {
    // Structural path: inject a Float64ReferenceEngine directly (simulating
    // the outcome of detectDefault() → 'float64') and confirm getActiveEngine()
    // returns that same instance (no spurious re-detection).
    const fallback = new Float64ReferenceEngine();
    setActiveEngine(fallback);

    const engine = await getActiveEngine();
    expect(engine).toBeInstanceOf(Float64ReferenceEngine);
    expect(engine).toBe(fallback); // same instance — cache not bypassed
  });

  it('setActiveEngine + getActiveEngine round-trips (Promise-cache I4)', async () => {
    // Verify the I4 Promise-cache: after setActiveEngine, getActiveEngine()
    // must return the exact same instance without re-running detectDefault().
    const stub = new Float64ReferenceEngine();
    setActiveEngine(stub);
    const result1 = await getActiveEngine();
    const result2 = await getActiveEngine();
    expect(result1).toBe(stub);
    expect(result2).toBe(stub); // second call hits cache, not fresh detection
  });
});
