/**
 * Tests for Bridge Equation 47: BBN Dark-Sector-Coupling Boltzmann ODE.
 *
 *   dY/dt + 3 H Y = ⟨σv⟩_SM n_p n_n − ⟨σv⟩_dark n_χ² ε_transfer
 *
 * References (canonical SM Boltzmann form):
 *   - Wagoner-Fowler-Hoyle 1967 ApJ 148:3
 *   - Kolb-Turner *The Early Universe* 1990 §5.2 Eq. 5.13–5.14
 *   - Pitrou-Coc-Uzan-Vangioni 2018 Phys. Rep. 754:1 Eq. 2.5
 *   - Steigman 2007 ARNPS 57:463 Eq. 27
 *
 * Status: 'speculative' (the dark-sector coupling term is the
 * unverified physics extension on the canonical Kolb-Turner base).
 *
 * Honest-claude scope notes:
 *   - All four ODE terms have dimension [L^-3 T^-1] (number density per
 *     unit time): the LHS time-derivative of Y, the Hubble-drag term
 *     3HY, the SM source ⟨σv⟩_SM·n_p·n_n, and the dark-sector sink
 *     ⟨σv⟩_dark·n_χ²·ε_transfer. We encode each term and verify the
 *     dimensional balance.
 *   - We encode the *full* ODE-balance form (LHS = RHS_SM − RHS_dark),
 *     not just one term. The catalog test accepts the inferred dim of
 *     RHS as the canonical signature; we validate that LHS and RHS
 *     match independently.
 */
import { describe, it, expect } from 'vitest';
import {
  BBN_DARK_RHS,
  BBN_DARK_LHS,
  BBN_DARK_DYDT_TERM,
  BBN_DARK_HUBBLE_TERM,
  BBN_DARK_SM_TERM,
  BBN_DARK_DARK_TERM,
  evaluateBBNDark,
  validateBBNDarkDimensions,
} from '../../src/bridges/equations/be-47-bbn-dark-sector.js';
import { validate } from '../../src/dimensional/validator.js';
import { format } from '../../src/dimensional/algebra.js';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';

const be47 = BRIDGE_EQUATIONS.find((e) => e.id === 47);

describe('BE-47 BBN Dark-Sector Coupling Boltzmann ODE', () => {
  describe('index entry invariants', () => {
    it('exists in the index', () => {
      expect(be47).toBeDefined();
    });

    it("status pinned 'speculative' (encoding does not promote)", () => {
      expect(be47!.status).toBe('speculative');
    });

    it('dimensional_signature is set to [L^-3 T^-1]', () => {
      expect(be47!.dimensional_signature).toBe('[L^-3 T^-1]');
    });
  });

  describe('dimensional validation', () => {
    it('Each term has dimension [L^-3 T^-1] (rate equation balance)', () => {
      for (const [label, ast] of [
        ['dY/dt', BBN_DARK_DYDT_TERM],
        ['3HY (Hubble drag)', BBN_DARK_HUBBLE_TERM],
        ['<σv>_SM n_p n_n', BBN_DARK_SM_TERM],
        ['<σv>_dark n_χ² ε', BBN_DARK_DARK_TERM],
      ] as const) {
        const r = validate(ast);
        expect(r.ok, `${label}: AST should validate cleanly`).toBe(true);
        expect(format(r.inferredDimension!)).toBe('[L^-3 T^-1]');
      }
    });

    it('LHS (dY/dt + 3HY) infers [L^-3 T^-1]', () => {
      const r = validate(BBN_DARK_LHS);
      expect(r.ok).toBe(true);
      expect(format(r.inferredDimension!)).toBe('[L^-3 T^-1]');
    });

    it('RHS (<σv>_SM source − <σv>_dark sink) infers [L^-3 T^-1]', () => {
      const r = validate(BBN_DARK_RHS);
      expect(r.ok).toBe(true);
      expect(format(r.inferredDimension!)).toBe('[L^-3 T^-1]');
    });

    it('validateBBNDarkDimensions reports both sides match', () => {
      const v = validateBBNDarkDimensions();
      expect(v.ok).toBe(true);
      expect(format(v.lhsDim!)).toBe('[L^-3 T^-1]');
      expect(format(v.rhsDim!)).toBe('[L^-3 T^-1]');
    });

    it('bridge index dimensional_signature matches the AST inference', () => {
      const inferred = validate(BBN_DARK_RHS).inferredDimension;
      expect(inferred).not.toBeNull();
      expect(be47!.dimensional_signature).toBe(format(inferred!));
    });
  });

  describe('numerical evaluation', () => {
    it('No SM, no dark: dY/dt = -3 H Y (pure Hubble dilution)', () => {
      const dYdt = evaluateBBNDark({
        H: 1.0e-1, Y: 1.0e-3,
        sigmav_SM: 0, n_p: 0, n_n: 0,
        sigmav_dark: 0, n_chi: 0, eps_transfer: 0,
      });
      expect(dYdt).toBeCloseTo(-3 * 1.0e-1 * 1.0e-3, 12);
    });

    it('SM source only (no Hubble, no dark): dY/dt = <σv>_SM n_p n_n', () => {
      const dYdt = evaluateBBNDark({
        H: 0, Y: 0,
        sigmav_SM: 1.0e-25, n_p: 1.0e10, n_n: 1.0e10,
        sigmav_dark: 0, n_chi: 0, eps_transfer: 0,
      });
      expect(dYdt).toBeCloseTo(1.0e-25 * 1.0e10 * 1.0e10, 12);
    });

    it('Dark sink only (no Hubble, no SM): dY/dt = -<σv>_dark n_χ² ε', () => {
      const dYdt = evaluateBBNDark({
        H: 0, Y: 0,
        sigmav_SM: 0, n_p: 0, n_n: 0,
        sigmav_dark: 1.0e-25, n_chi: 1.0e10, eps_transfer: 0.5,
      });
      expect(dYdt).toBeCloseTo(-1.0e-25 * 1.0e20 * 0.5, 12);
    });

    it('Balance: SM source equals dark sink + Hubble drag → dY/dt = 0', () => {
      // Pick numbers so RHS_SM = Hubble_drag + RHS_dark exactly.
      // Hubble_drag = 3 H Y = 3 · 0.1 · 1e-5 = 3e-6
      // RHS_dark   = 1e-25 · 1e10 · 1e10 · 0.5 = 5e-6
      // RHS_SM     should equal 3e-6 + 5e-6 = 8e-6
      // → ⟨σv⟩_SM · n_p · n_n = 8e-6
      // pick ⟨σv⟩_SM = 8e-26, n_p = n_n = 1e10 → 8e-26 · 1e20 = 8e-6 ✓
      const dYdt = evaluateBBNDark({
        H: 0.1, Y: 1e-5,
        sigmav_SM: 8e-26, n_p: 1e10, n_n: 1e10,
        sigmav_dark: 1e-25, n_chi: 1e10, eps_transfer: 0.5,
      });
      expect(Math.abs(dYdt)).toBeLessThan(1e-18);
    });
  });

  describe('input validation', () => {
    it('rejects non-finite inputs', () => {
      expect(() =>
        evaluateBBNDark({
          H: NaN, Y: 0, sigmav_SM: 0, n_p: 0, n_n: 0,
          sigmav_dark: 0, n_chi: 0, eps_transfer: 0,
        }),
      ).toThrow(RangeError);
    });
  });
});
