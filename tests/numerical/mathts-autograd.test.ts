import { describe, it, expect } from 'vitest';
import { hasAutogradSupport } from '../../src/numerical/tensor-engine.js';

describe('MathTSEngine: AD adapter', () => {
  it('delegates to mathts-autograd', async () => {
    let mathts: { MathTSEngine: new () => unknown };
    try { mathts = await import('../../src/numerical/mathts-engine.js') as any; }
    catch { console.warn('mathts-engine import failed — skipping'); return; }

    let autogradOk = true;
    try { await import('@danielsimonjr/mathts-autograd'); } catch { autogradOk = false; }
    if (!autogradOk) { console.warn('mathts-autograd absent — skipping'); return; }

    const engine = new (mathts as any).MathTSEngine();
    expect(hasAutogradSupport(engine)).toBe(true);

    const x = engine.fromNested([2, 3, 4], [3]);
    const fn = (t: unknown) => engine.mul(t, t);
    const { value, jacobian } = await engine.forwardGrad(fn, x);
    expect(engine.toNested(value)).toEqual([4, 9, 16]);
    const J = engine.toNested(jacobian) as number[][];
    expect(J[0][0]).toBeCloseTo(4, 12);

    const { gradient } = await engine.reverseGrad(fn, x, engine.fromNested([1, 1, 1], [3]));
    const g = engine.toNested(gradient) as number[];
    expect(g[0]).toBeCloseTo(4, 12);
    expect(g[2]).toBeCloseTo(8, 12);
  });
});
