/**
 * UC-2 (v0.5.1 Task 15): Unit coverage for `freshLabel`.
 *
 * Pins the Part-VIII §VIII.5 raise-lower-fresh-label-deterministic
 * TENSOR-RULE: always returns `<base>_<counter>` starting at counter=1
 * regardless of base availability; deterministic across runs.
 *
 * Spec: docs/planning/v0.5.1-Implementation-Plan.md Task 15 / Design Theme C.
 */
import { describe, it, expect } from 'vitest';
import { freshLabel } from '../../src/dimensional/fresh-label.js';

describe('freshLabel', () => {
  it('with empty taken-set returns `<base>_1` (always-suffixed, not the bare base)', () => {
    expect(freshLabel('ρ', new Set())).toBe('ρ_1');
  });

  it('with `<base>_1` taken returns `<base>_2`', () => {
    expect(freshLabel('ρ', new Set(['ρ_1']))).toBe('ρ_2');
  });

  it('with `<base>_{1,2,3}` taken returns `<base>_4` (next-counter)', () => {
    expect(freshLabel('ρ', new Set(['ρ_1', 'ρ_2', 'ρ_3']))).toBe('ρ_4');
  });

  it('is deterministic across multiple calls with identical input', () => {
    const taken = new Set(['ρ_1', 'ρ_2']);
    const a = freshLabel('ρ', taken);
    const b = freshLabel('ρ', taken);
    const c = freshLabel('ρ', taken);
    expect(a).toBe('ρ_3');
    expect(b).toBe('ρ_3');
    expect(c).toBe('ρ_3');
  });

  it('handles unicode base labels (`λ` → `λ_1`)', () => {
    expect(freshLabel('λ', new Set())).toBe('λ_1');
    expect(freshLabel('λ', new Set(['λ_1', 'λ_2']))).toBe('λ_3');
  });

  it('skips over gaps and returns the lowest counter not in the set (collision with high counter)', () => {
    // Per the canonical semantics in src/dimensional/fresh-label.ts: the loop
    // walks 1,2,3,... and returns the first counter whose composite label is
    // not in `taken`. With only `ρ_5` taken, that's `ρ_1`.
    expect(freshLabel('ρ', new Set(['ρ_5']))).toBe('ρ_1');
  });
});
