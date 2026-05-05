import { describe, it, expect } from 'vitest';
import {
  BRIDGE_EQUATIONS,
  type BridgeEquationEntry,
  type BridgeEquationStatus,
  type BridgeIssueSeverity,
} from '../src/bridges/index.js';

const VALID_STATUSES: ReadonlySet<BridgeEquationStatus> = new Set([
  'established',
  'standard-extension',
  'speculative',
  'highly-speculative',
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

  it('all statuses are valid enum values', () => {
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

  it('all dependencies reference existing equation IDs', () => {
    const ids = new Set(BRIDGE_EQUATIONS.map((e) => e.id));
    for (const e of BRIDGE_EQUATIONS) {
      for (const dep of e.dependencies) {
        expect(ids.has(dep), `Eq ${e.id} depends on missing Eq ${dep}`).toBe(true);
        expect(dep).not.toBe(e.id); // no self-deps
      }
    }
  });

  it('all known_issues have valid severity and fixable enum values', () => {
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
});

// Type-level smoke test: the exported type must be assignable.
const _typeCheck: BridgeEquationEntry | undefined = BRIDGE_EQUATIONS[0];
void _typeCheck;
