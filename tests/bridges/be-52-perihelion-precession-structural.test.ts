/**
 * Structural sibling test for BE-52 — Mercury Perihelion Precession
 * (Einstein 1915 closed-form).
 *
 * **Why this exists** (v0.5.0 Task 14, Phase 3b):
 * The v0.4.0 audit (`docs/architecture/bridge-coverage-audit.md` line 69)
 * flagged BE-52 as NUMERICAL-only — `tests/bridges/perihelion-precession.test.ts`
 * exercises `evaluatePerihelionPrecession` and the GL4 geodesic
 * cross-validation (the latter activated by Task 10), but no test pins the
 * registry-side **structural** contract (formula_latex, dimensional_signature,
 * status, references, category) the way every other established bridge
 * (e.g. BE-21 KSS, BE-37 Shapiro, BE-42 Hawking, BE-48 GRW) has via a
 * `BRIDGE_EQUATIONS.find(...)` test.
 *
 * **Pattern**: mirrors BE-37's structural-sibling discipline
 * (`tests/bridges/be-37-shapiro-eikonal-structural.test.ts`) adapted for the
 * v0.4.0-era closed-form bridges that **do not have an AST encoding**
 * (BE-51 and BE-52 live in `src/bridges/gravitational-lensing.ts` and
 * `src/bridges/perihelion-precession.ts` as numerical-only evaluators —
 * they are NOT in `src/bridges/equations/`, so the BE-37 metric-layer AST
 * assertions (`metric-tensor`, `tensor-partial-derivative`) do not apply).
 *
 * In place of AST-kind assertions, this test pins the registry shape
 * (formula_latex regex against the 6πGM/(a(1−e²)c²) canonical form,
 * `dimensional_signature === '[1]'` since Δφ is in radians,
 * `status === 'established'`, plus references and category invariants).
 * This is the load-bearing structural contract for BE-52.
 *
 * **Plan deviation surfaced honestly**: v0.5.0-Implementation-Plan.md Task
 * 14 inherits the Task 13 assertion shape; "tensor-product / metric-layer
 * AST kinds present in the encoded form" is dropped (no AST exists) and
 * replaced with a `formula_latex` regex pin against the closed-form
 * algebraic structure (6π·G·M as numerator, a·(1−e²)·c² as denominator).
 * The other three assertions (regex, dim round-trip, status) apply directly.
 *
 * @see src/bridges/perihelion-precession.ts
 * @see src/bridges/index.ts (BRIDGE_EQUATIONS entry id=52)
 * @see tests/bridges/perihelion-precession.test.ts (numerical sibling)
 * @see tests/bridges/be-37-shapiro-eikonal-structural.test.ts (template)
 * @see tests/bridges/be-51-gravitational-lensing-structural.test.ts (Task 13 sibling)
 */

import { describe, it, expect } from 'vitest';
import { expectBridgeInIndex } from './_helpers.js';

describe('BE-52 Mercury Perihelion Precession — structural sibling (Task 14)', () => {
  it('exists in BRIDGE_EQUATIONS', () => {
    expectBridgeInIndex(52);
  });

  it("status pinned 'established' (Einstein 1915 / Le Verrier 1859 — canonical GR result)", () => {
    expectBridgeInIndex(52, 'established');
  });

  it("dimensional_signature is '[1]' (Δφ is an angle in radians — dimensionless)", () => {
    const be52 = expectBridgeInIndex(52);
    expect(be52.dimensional_signature).toBe('[1]');
  });

  it('formula_latex matches the canonical Einstein form Δφ = 6πGM/(a(1−e²)c²)', () => {
    const be52 = expectBridgeInIndex(52);
    // Pin the algebraic skeleton: a leading 6π·G·M in the numerator and
    // a·(1−e²)·c² in the denominator. Current form:
    //   \Delta\varphi = \frac{6\pi G M}{a(1-e^2)c^2}
    expect(be52.formula_latex).toMatch(/\\Delta\\varphi/);
    expect(be52.formula_latex).toMatch(/6\\pi\s*G\s*M/);
    expect(be52.formula_latex).toMatch(/a\(1-e\^2\)\s*c\^2/);
    expect(be52.formula_latex).toMatch(
      /\\frac\{6\\pi\s*G\s*M\}\{a\(1-e\^2\)\s*c\^2\}/,
    );
  });

  it('category is Emergent Spacetime (Category I)', () => {
    const be52 = expectBridgeInIndex(52);
    expect(be52.category).toBe('I');
    expect(be52.category_name).toBe('Emergent Spacetime');
  });

  it('bridges Newtonian gravity ↔ general relativity', () => {
    const be52 = expectBridgeInIndex(52);
    expect(be52.bridges).toEqual(['Newtonian gravity', 'general relativity']);
  });

  it("tractability_class is 'closed-form' (algebraic, no integration)", () => {
    const be52 = expectBridgeInIndex(52);
    expect(be52.tractability_class).toBe('closed-form');
  });

  it('known_issues is empty (established bridge — no framing gap)', () => {
    const be52 = expectBridgeInIndex(52);
    expect(be52.known_issues).toEqual([]);
  });

  it('references include Einstein 1915 and Le Verrier 1859', () => {
    const be52 = expectBridgeInIndex(52);
    const refs = be52.references.join(' | ');
    expect(refs).toMatch(/Einstein 1915/);
    expect(refs).toMatch(/Le Verrier 1859/);
  });

  it('notes record v0.4.0 Task 16 provenance', () => {
    const be52 = expectBridgeInIndex(52);
    expect(be52.notes).toMatch(/v0\.4\.0/);
    expect(be52.notes).toMatch(/Task 16/);
    expect(be52.notes).toMatch(/perihelion precession|Einstein 1915/i);
  });
});
