/**
 * Structural sibling test for BE-51 — Gravitational Lensing (Eddington 1919
 * weak-field deflection).
 *
 * **Why this exists** (v0.5.0 Task 13, Phase 3a):
 * The v0.4.0 audit (`docs/architecture/bridge-coverage-audit.md` line 68)
 * flagged BE-51 as NUMERICAL-only — `tests/bridges/gravitational-lensing.test.ts`
 * exercises `evaluateGravitationalLensing` and the geodesic RK4 cross-check, but
 * no test pins the registry-side **structural** contract (formula_latex,
 * dimensional_signature, status, references, category) the way every other
 * established bridge (e.g. BE-21 KSS, BE-37 Shapiro, BE-42 Hawking, BE-48 GRW)
 * has via a `BRIDGE_EQUATIONS.find(...)` test.
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
 * (formula_latex regex against the 4GM/(bc²) canonical form,
 * `dimensional_signature === '[1]'` since the deflection α is in radians,
 * `status === 'established'`, plus references and category invariants).
 * This is the load-bearing structural contract for BE-51.
 *
 * **Plan deviation surfaced honestly**: v0.5.0-Implementation-Plan.md line
 * 1816 lists "tensor-product / metric-layer AST kinds present in the encoded
 * form" as one of the four assertions. BE-51 has no AST encoding, so that
 * assertion is dropped and replaced with a `formula_latex` regex pin against
 * the closed-form algebraic structure (4·G·M and b·c² as numerator/denominator
 * tokens). The other three assertions (regex, dim round-trip, status) apply
 * directly.
 *
 * @see src/bridges/gravitational-lensing.ts
 * @see src/bridges/index.ts (BRIDGE_EQUATIONS entry id=51)
 * @see tests/bridges/gravitational-lensing.test.ts (numerical sibling)
 * @see tests/bridges/be-37-shapiro-eikonal-structural.test.ts (template)
 */

import { describe, it, expect } from 'vitest';
import { expectBridgeInIndex } from './_helpers.js';

describe('BE-51 Gravitational Lensing — structural sibling (Task 13)', () => {
  it('exists in BRIDGE_EQUATIONS', () => {
    expectBridgeInIndex(51);
  });

  it("status pinned 'established' (Eddington 1919 / Einstein 1915 — canonical GR result)", () => {
    expectBridgeInIndex(51, 'established');
  });

  it("dimensional_signature is '[1]' (α is a deflection angle in radians — dimensionless)", () => {
    const be51 = expectBridgeInIndex(51);
    expect(be51.dimensional_signature).toBe('[1]');
  });

  it('formula_latex matches the canonical Eddington form α = 4GM/(bc²)', () => {
    const be51 = expectBridgeInIndex(51);
    // Pin the algebraic skeleton: a leading 4·G·M in the numerator and
    // b·c² in the denominator. Use a permissive regex that admits the
    // \frac{...}{...} layout (current form: \alpha = \frac{4 G M}{b c^2}).
    expect(be51.formula_latex).toMatch(/\\alpha/);
    expect(be51.formula_latex).toMatch(/4\s*G\s*M/);
    expect(be51.formula_latex).toMatch(/b\s*c\^2/);
    expect(be51.formula_latex).toMatch(/\\frac\{4\s*G\s*M\}\{b\s*c\^2\}/);
  });

  it('category is Emergent Spacetime (Category I)', () => {
    const be51 = expectBridgeInIndex(51);
    expect(be51.category).toBe('I');
    expect(be51.category_name).toBe('Emergent Spacetime');
  });

  it('bridges Newtonian gravity ↔ general relativity', () => {
    const be51 = expectBridgeInIndex(51);
    expect(be51.bridges).toEqual(['Newtonian gravity', 'general relativity']);
  });

  it("tractability_class is 'closed-form' (algebraic, no integration)", () => {
    const be51 = expectBridgeInIndex(51);
    expect(be51.tractability_class).toBe('closed-form');
  });

  it('known_issues is empty (established bridge — no framing gap)', () => {
    const be51 = expectBridgeInIndex(51);
    expect(be51.known_issues).toEqual([]);
  });

  it('references include the canonical 1919 eclipse expedition and Einstein 1915', () => {
    const be51 = expectBridgeInIndex(51);
    const refs = be51.references.join(' | ');
    expect(refs).toMatch(/Dyson.*Eddington.*Davidson 1920/);
    expect(refs).toMatch(/Einstein 1915/);
  });

  it('notes record v0.4.0 Task 15 provenance', () => {
    const be51 = expectBridgeInIndex(51);
    expect(be51.notes).toMatch(/v0\.4\.0/);
    expect(be51.notes).toMatch(/Task 15/);
    expect(be51.notes).toMatch(/Eddington 1919|gravitational lensing/i);
  });
});
