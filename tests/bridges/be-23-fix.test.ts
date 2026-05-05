/**
 * Regression test for BE-23 (Strange Metal — Black Hole Duality) audit fix.
 *
 * Branch: fix/be-23-strange-metal-transcription (2026-05-01)
 *
 * Background: BE-23 was flagged R0 in the Tier-3 audit
 * (docs/planning/Bridge-Remediation-Plan.md) because the third term of its
 * resistivity formula, `B √(ℏ / (k_B T τ_P))`, collapses to `B · 1` under the
 * standard substitution `τ_P = ℏ/(k_B T)`. The audit recommended replacing
 * the radical with `√(k_B T · τ_P / ℏ)`; on inspection that form is *equally*
 * vacuous (the identity `τ_P · k_B T = ℏ` makes any monomial in those two
 * factors collapse). Honest-claude path taken: status downgraded to
 * `speculative`, issue reclassified `self-refuting` / `reformulation`,
 * original (vacuous) formula preserved for traceability with a
 * `Known issue (preserved)` block in the spec.
 *
 * This test asserts the audit-fix invariants in the index entry.
 */
import { describe, it, expect } from 'vitest';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';

const be23 = BRIDGE_EQUATIONS.find((e) => e.id === 23);

describe('BE-23 Strange Metal — Black Hole Duality (audit fix)', () => {
  it('exists in the index', () => {
    expect(be23).toBeDefined();
  });

  it('status downgraded to speculative (no longer established)', () => {
    // Pre-fix: 'established'. Post-fix: 'speculative' until a domain expert
    // selects a non-vacuous third-term form.
    expect(be23!.status).toBe('speculative');
    expect(be23!.status).not.toBe('established');
  });

  it('preserves the original (vacuous) formula verbatim for traceability', () => {
    // We intentionally do NOT silently replace the formula with the audit's
    // recommended `√(k_B T · τ_P / ℏ)`, because that candidate is equally
    // vacuous under τ_P · k_B T = ℏ. Preserving the original + a Known Issue
    // block is the honest path until reformulation by a domain expert.
    expect(be23!.formula_latex).toBe(
      '\\rho(T) = \\rho_0 + AT + B\\sqrt{\\frac{\\hbar}{k_B T \\tau_P}}',
    );
  });

  it('records exactly one known issue, with self-refuting severity', () => {
    expect(be23!.known_issues).toHaveLength(1);
    expect(be23!.known_issues[0].severity).toBe('self-refuting');
  });

  it('marks the issue as needing reformulation (not a transcription fix)', () => {
    // The audit originally classified this `spec-edit`; on closer inspection
    // the audit's own suggested replacement was vacuous, so the real fix is
    // research-level reformulation, not a typo correction.
    expect(be23!.known_issues[0].fixable).toBe('reformulation');
    expect(be23!.known_issues[0].fixable).not.toBe('spec-edit');
  });

  it('issue description acknowledges the audit-suggested replacement is also vacuous', () => {
    const desc = be23!.known_issues[0].description;
    // The new description must call out the audit's suggested fix and explain
    // why it doesn't work — preventing a future contributor from "applying
    // the audit's fix" without realizing it is no fix at all.
    expect(desc).toMatch(/audit/i);
    expect(desc).toMatch(/k_B T · τ_P|τ_P · k_B T/);
    expect(desc).toMatch(/τ_P · k_B T = ℏ|τ_P\s*·\s*k_B T = ℏ/);
    // No longer claims a simple transcription / spec-edit fix exists.
    expect(desc).not.toMatch(/transcription error/i);
  });

  it('notes field reflects the downgrade and Tier-R2 classification', () => {
    expect(be23!.notes).toMatch(/[Ss]peculative/);
    expect(be23!.notes).toMatch(/(downgraded|2026-05-01|R2|reformulation|domain expert)/);
  });
});
