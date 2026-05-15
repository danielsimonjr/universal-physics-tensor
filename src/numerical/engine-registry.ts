/**
 * Engine registry — selects the active TensorEngine. v0.4.0: when both
 * @danielsimonjr/mathts-tensor AND @danielsimonjr/mathts-autograd are
 * installed, getActiveEngine() returns MathTSEngine. Falls back to
 * Float64ReferenceEngine (the zero-dep default) with a one-time
 * console.warn (suppressible via UPT_QUIET_FALLBACK=1) when either dep
 * is absent.
 *
 * HONEST FRAMING: both engines run the same naive O(n) algorithms in
 * v0.4.0. This default flip is a dep-shape + code-path-signal change,
 * NOT a performance win. MathTSEngine becomes the default because that
 * is where the autograd capability (AD) lives.
 *
 * I4 fix (Promise-cache): the Promise itself is cached, not the resolved
 * instance. Two concurrent first-time callers therefore observe the same
 * in-flight Promise and never race to create separate engine instances.
 *
 * I5 fix (browser guard): `process` is undefined in browser bundlers.
 * All access is guarded by `typeof process !== 'undefined'`.
 *
 * @module numerical/engine-registry
 */
import type { TensorEngine } from './tensor-engine.js';
import { Float64ReferenceEngine } from './float64-engine.js';

// Module-level cache. Stores a Promise so that concurrent first-time calls
// to getActiveEngine() both await the same in-flight detection, never racing
// to construct two separate engine instances (I4 fix).
let _activeEngineP: Promise<TensorEngine> | undefined;

// Cache the detection result so we don't re-import on every getActiveEngine()
// call after the first. Reset by resetEngineForTesting() in tests.
let _resolvedDefault: 'mathts' | 'float64' | undefined;

/**
 * Attempt to import both optional peer deps. Returns 'mathts' when both are
 * present; 'float64' otherwise. Emits a one-time console.warn on fallback
 * (suppressible via UPT_QUIET_FALLBACK=1).
 */
async function detectDefault(): Promise<'mathts' | 'float64'> {
  if (_resolvedDefault !== undefined) return _resolvedDefault;
  try {
    await import('@danielsimonjr/mathts-tensor');
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore — @danielsimonjr/mathts-autograd is an optional peer dep with
    // no bundled type declarations; the try-catch handles the absent case.
    await import('@danielsimonjr/mathts-autograd');
    _resolvedDefault = 'mathts';
  } catch {
    // I5 fix: `process` is undefined in browser bundlers; guard before reading.
    const quiet =
      typeof process !== 'undefined' && process.env?.UPT_QUIET_FALLBACK === '1';
    if (!quiet) {
      console.warn(
        '[universal-physics-tensor v0.4.0] @danielsimonjr/mathts-tensor and/or '
        + '@danielsimonjr/mathts-autograd not installed. '
        + 'Falling back to Float64ReferenceEngine. '
        + 'Install both peers for MathTS-default + autograd (AD) support. '
        + '(Suppress this warning with UPT_QUIET_FALLBACK=1.)',
      );
    }
    _resolvedDefault = 'float64';
  }
  return _resolvedDefault;
}

// @public: getActiveEngine/setActiveEngine are part of the consumer-facing
// engine-switching contract (re-exported from the root barrel).

/**
 * The TensorEngine currently used by the `evaluateNumerical*` entry points
 * when no per-call `EvaluateOptions.engine` is supplied.
 *
 * v0.4.0: returns MathTSEngine when both @danielsimonjr/mathts-tensor AND
 * @danielsimonjr/mathts-autograd are installed; otherwise Float64ReferenceEngine.
 *
 * I4: returns a cached Promise — concurrent first-time callers share the
 * same in-flight resolution, so at most one MathTSEngine is ever constructed.
 *
 * @public
 */
export async function getActiveEngine(): Promise<TensorEngine> {
  _activeEngineP ??= (async () => {
    const choice = await detectDefault();
    if (choice === 'mathts') {
      const { MathTSEngine } = await import('./mathts-engine.js');
      return new MathTSEngine();
    }
    return new Float64ReferenceEngine();
  })();
  return _activeEngineP;
}

/**
 * Set the process-wide active TensorEngine (e.g. to `MathTSEngine`).
 * Wraps the engine in a resolved Promise to match the async getActiveEngine
 * contract and invalidate any prior in-flight detection.
 * @public
 */
export function setActiveEngine(engine: TensorEngine): void {
  _activeEngineP = Promise.resolve(engine);
}

/**
 * Reset the Promise-cache and detection state for testing purposes only.
 * Not part of the public API surface; NOT exported from the root barrel.
 * @internal
 */
export function resetEngineForTesting(): void {
  _activeEngineP = undefined;
  _resolvedDefault = undefined;
}
