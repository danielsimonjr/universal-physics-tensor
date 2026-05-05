import { describe, it, expect } from 'vitest';
import {
  BRIDGE_EQUATIONS,
  isActiveStatus,
  type BridgeEquationEntry,
  type BridgeEquationStatus,
  type BridgeIssueSeverity,
} from '../src/bridges/index.js';

const VALID_STATUSES: ReadonlySet<BridgeEquationStatus> = new Set([
  'established',
  'speculative',
  'highly-speculative',
  'invalid',
]);

const VALID_SEVERITIES: ReadonlySet<BridgeIssueSeverity> = new Set([
  'self-refuting',
  'dimensional',
  'index-structure',
  'sign',
  'undefined-quantity',
  'phenomenological-ansatz',
  'other',
]);

const VALID_FIXABLE = new Set([
  'spec-edit',
  'reformulation',
  'unfixable-must-mark-invalid',
  'unknown',
]);

const VALID_PARTS = new Set(['I', 'II', 'III', 'IV', 'V', 'VI']);

describe('Bridge Equation Index', () => {
  it('contains exactly 40 entries', () => {
    expect(BRIDGE_EQUATIONS.length).toBe(40);
  });

  it('has IDs 11 through 50 with no gaps and no duplicates', () => {
    const ids = BRIDGE_EQUATIONS.map((e) => e.id).sort((a, b) => a - b);
    expect(ids).toEqual(Array.from({ length: 40 }, (_, i) => i + 11));
    expect(new Set(ids).size).toBe(40);
  });

  it('runtime status values match the TS enum (catches `as` casts)', () => {
    // Type-system check by another name: TypeScript enforces this at
    // compile time, but a runtime cast (`x as BridgeEquationStatus`)
    // could silently insert a bogus value. Pin the runtime invariant
    // explicitly. Source: test-analyzer F10.
    for (const e of BRIDGE_EQUATIONS) {
      expect(VALID_STATUSES.has(e.status)).toBe(true);
    }
  });

  it('all source_part values are I-VI', () => {
    for (const e of BRIDGE_EQUATIONS) {
      expect(VALID_PARTS.has(e.source_part)).toBe(true);
    }
  });

  it('all categories are non-empty single uppercase letters', () => {
    for (const e of BRIDGE_EQUATIONS) {
      expect(e.category).toMatch(/^[A-Z]$/);
    }
  });

  it('category_name is consistent across same category letter', () => {
    const byLetter = new Map<string, Set<string>>();
    for (const e of BRIDGE_EQUATIONS) {
      if (!byLetter.has(e.category)) byLetter.set(e.category, new Set());
      byLetter.get(e.category)!.add(e.category_name);
    }
    for (const [letter, names] of byLetter) {
      expect(names.size, `category ${letter} has multiple names: ${[...names].join(' | ')}`).toBe(1);
    }
  });

  // Pin the canonical category-letter → name mapping to the spec
  // (docs/specification/Part-{I,II}.md `### Category X: <Name>` headers).
  // A future contributor renaming a category across all entries would pass
  // the unique-counts test above but will fail this one. Source:
  // test-analyzer F11.
  it('category letters map to the canonical names from the spec', () => {
    const expected: Record<string, string> = {
      A: 'Quantum-Classical Bridges',
      B: 'Information-Physical Bridges',
      C: 'Emergence and Complexity',
      D: 'Field Unification Bridges',
      E: 'Cosmological-Quantum Bridges',
      F: 'Condensed Matter - High Energy Bridges',
      G: 'Quantum Biology Bridges',
      H: 'Non-Equilibrium Statistical Mechanics',
      I: 'Emergent Spacetime',
      J: 'Phase Transitions and Criticality',
      K: 'Modified Theories and Extensions',
      L: 'Quantum Field Theory Extensions',
      M: 'Information Paradox Resolutions',
      N: 'Cosmological Puzzles',
      O: 'Quantum Foundations',
    };
    for (const e of BRIDGE_EQUATIONS) {
      expect(
        e.category_name,
        `BE-${e.id} category ${e.category} has wrong category_name`,
      ).toBe(expected[e.category]);
    }
  });

  it('all dependencies reference existing equation IDs', () => {
    const ids = new Set(BRIDGE_EQUATIONS.map((e) => e.id));
    for (const e of BRIDGE_EQUATIONS) {
      for (const dep of e.dependencies) {
        expect(ids.has(dep), `Eq ${e.id} depends on missing Eq ${dep}`).toBe(true);
        expect(dep).not.toBe(e.id); // no self-deps
      }
    }
  });

  it('runtime known_issues severity/fixable values match the TS enums (catches `as` casts)', () => {
    // Same reasoning as the status-enum test above. The
    // `description.length > 0` assertion is the only behavioural part.
    // Source: test-analyzer F10.
    for (const e of BRIDGE_EQUATIONS) {
      for (const iss of e.known_issues) {
        expect(VALID_SEVERITIES.has(iss.severity)).toBe(true);
        expect(VALID_FIXABLE.has(iss.fixable)).toBe(true);
        expect(iss.description.length).toBeGreaterThan(0);
      }
    }
  });

  it('bridges tuple has exactly two non-empty endpoint strings', () => {
    for (const e of BRIDGE_EQUATIONS) {
      expect(e.bridges).toHaveLength(2);
      expect(e.bridges[0].length).toBeGreaterThan(0);
      expect(e.bridges[1].length).toBeGreaterThan(0);
    }
  });

  it('expected categories A-O are all present (15 categories)', () => {
    const letters = new Set(BRIDGE_EQUATIONS.map((e) => e.category));
    const expected = 'ABCDEFGHIJKLMNO'.split('');
    for (const L of expected) {
      expect(letters.has(L), `category ${L} is missing`).toBe(true);
    }
    expect(letters.size).toBe(15);
  });

  it('every entry has a non-empty name', () => {
    for (const e of BRIDGE_EQUATIONS) {
      expect(e.name.length).toBeGreaterThan(0);
    }
  });

  it('Part-I contributes IDs 11-20; Part-II contributes IDs 21-50', () => {
    const partI = BRIDGE_EQUATIONS.filter((e) => e.source_part === 'I').map((e) => e.id).sort((a, b) => a - b);
    const partII = BRIDGE_EQUATIONS.filter((e) => e.source_part === 'II').map((e) => e.id).sort((a, b) => a - b);
    expect(partI).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
    expect(partII).toEqual(Array.from({ length: 30 }, (_, i) => i + 21));
  });

  // BE-16 (Complexity-Entropy Production Relation) was marked 'invalid' on
  // 2026-05-01 per the Tier 3 audit's R3 disposition decision: the equation
  // is algebraically self-refuting and circuit complexity C(rho) is not
  // independently defined. This test pins that disposition so a future
  // contributor cannot silently re-promote it; promotion requires deleting
  // this test along with the status change so the choice is explicit.
  it("BE-16 is marked 'invalid' per the 2026-05-01 disposition decision", () => {
    const be16 = BRIDGE_EQUATIONS.find((e) => e.id === 16);
    expect(be16, 'BE-16 must be present in the index').toBeDefined();
    expect(be16!.status).toBe('invalid');
  });

  // --- THEME D: 'invalid' arm visibility (type-design Critical-Hole) ---

  describe('isActiveStatus predicate', () => {
    it('returns true for active statuses', () => {
      expect(isActiveStatus('established')).toBe(true);
      expect(isActiveStatus('speculative')).toBe(true);
      expect(isActiveStatus('highly-speculative')).toBe(true);
    });

    it("returns false for 'invalid'", () => {
      expect(isActiveStatus('invalid')).toBe(false);
    });

    it('a catalog summary built via filter(isActiveStatus) excludes BE-16', () => {
      const active = BRIDGE_EQUATIONS.filter((e) => isActiveStatus(e.status));
      const ids = new Set(active.map((e) => e.id));
      expect(ids.has(16)).toBe(false);
      // Conversely BE-11 (established) is active.
      expect(ids.has(11)).toBe(true);
    });
  });

  // --- THEME D / D2 + F5 R2 catalog invariant (test-analyzer) ---

  it('any entry with a "What would unblock a real fix" note has only reformulation issues', () => {
    for (const e of BRIDGE_EQUATIONS) {
      if (!/What would unblock a real fix/.test(e.notes)) continue;
      for (const iss of e.known_issues) {
        expect(
          iss.fixable,
          `${e.id} has unblock note + ${iss.fixable} issue`,
        ).toBe('reformulation');
      }
      // R2 entries are deliberately not 'established' — they preserve a
      // gap rather than asserting a fix.
      expect(e.status).not.toBe('established');
    }
  });

  // --- Cross-field invariant: 'invalid' status ↔ at least one
  //     unfixable-must-mark-invalid known issue (type-design F-02). ---

  it("status 'invalid' implies ≥1 known_issue with fixable 'unfixable-must-mark-invalid'", () => {
    for (const e of BRIDGE_EQUATIONS) {
      if (e.status !== 'invalid') continue;
      const hasUnfixable = e.known_issues.some(
        (iss) => iss.fixable === 'unfixable-must-mark-invalid',
      );
      expect(
        hasUnfixable,
        `BE-${e.id} is 'invalid' but has no unfixable-must-mark-invalid issue`,
      ).toBe(true);
    }
  });

  it("a known_issue with fixable 'unfixable-must-mark-invalid' implies status 'invalid'", () => {
    for (const e of BRIDGE_EQUATIONS) {
      const hasUnfixable = e.known_issues.some(
        (iss) => iss.fixable === 'unfixable-must-mark-invalid',
      );
      if (!hasUnfixable) continue;
      expect(
        e.status,
        `BE-${e.id} has unfixable-must-mark-invalid issue but status is ${e.status}`,
      ).toBe('invalid');
    }
  });
});

// Type-level smoke test: the exported type must be assignable.
const _typeCheck: BridgeEquationEntry | undefined = BRIDGE_EQUATIONS[0];
void _typeCheck;
