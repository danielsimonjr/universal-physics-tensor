/**
 * Tier-5 AST encoding test for BE-13 — trace of Einstein equations
 * (Jacobson 1995 thermodynamic interpretation, post Wave Y
 * reformulation).
 *
 * Formula: R = 4Λ - (8π G / c⁴) T (g^μν contraction of the full tensor
 * Einstein equation R_μν - (1/2)R g_μν + Λ g_μν = (8πG/c⁴) T_μν).
 *
 * @see src/bridges/equations/be-13-einstein-trace.ts
 */

import { describe, it, expect } from 'vitest';
import {
  BE13_EINSTEIN_TRACE_RHS,
  BE13_EINSTEIN_TRACE_LHS,
  RICCI_SCALAR_DIM,
  evaluateEinsteinTrace,
  validateBE13Dimensions,
  BE13_T_TRACE_NODE,
  BE13_STRESS_ENERGY_NODE,
} from '../../src/bridges/equations/be-13-einstein-trace.js';
import { validate, validateEquation } from '../../src/dimensional/validator.js';
import { format } from '../../src/dimensional/algebra.js';
import { PhysicalConstants } from '../../src/core/types.js';
import { expectBridgeInIndex, expectDimRoundTrip } from './_helpers.js';
import { validateTensorTrace } from '../../src/dimensional/tensor-trace.js';

describe('BE-13 Einstein-equation trace — Tier 5 AST encoding', () => {
  describe('Catalog round-trip', () => {
    it('exists', () => {
      expectBridgeInIndex(13);
    });

    it("dimensional_signature is '[L^-2]' (Ricci scalar)", () => {
      const entry = expectBridgeInIndex(13);
      expect(entry.dimensional_signature).toBe('[L^-2]');
    });

    it('round-trips: format(infer(RHS)) === dimensional_signature', () => {
      expectDimRoundTrip(BE13_EINSTEIN_TRACE_RHS, '[L^-2]');
    });

    it("status pinned 'speculative' (Jacobson framing speculative)", () => {
      expectBridgeInIndex(13, 'speculative');
    });

    it('formula_latex contains R = 4Λ - (8πG/c⁴)T scalar trace form', () => {
      const entry = expectBridgeInIndex(13);
      expect(entry.formula_latex).toMatch(/R\s*=/);
      expect(entry.formula_latex).toMatch(/4\\Lambda/);
      expect(entry.formula_latex).toMatch(/8\\pi G/);
      expect(entry.formula_latex).toMatch(/c\^4/);
    });

    it('notes mention Wave Y reformulation', () => {
      const entry = expectBridgeInIndex(13);
      expect(entry.notes).toMatch(/Wave Y/);
      expect(entry.notes).toMatch(/2026-05-07/);
    });
  });

  describe('Dimensional structure', () => {
    it('LHS is [L^-2] (Ricci scalar)', () => {
      const r = validate(BE13_EINSTEIN_TRACE_LHS);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(RICCI_SCALAR_DIM);
    });

    it('RHS is [L^-2]', () => {
      const r = validate(BE13_EINSTEIN_TRACE_RHS);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(RICCI_SCALAR_DIM);
    });

    it('full equation validates', () => {
      const eq = validateEquation(BE13_EINSTEIN_TRACE_LHS, BE13_EINSTEIN_TRACE_RHS);
      expect(eq.ok).toBe(true);
    });

    it('validateBE13Dimensions reports both sides as [L^-2]', () => {
      const r = validateBE13Dimensions();
      expect(r.ok).toBe(true);
      expect(r.lhsDim).toEqual(RICCI_SCALAR_DIM);
      expect(r.rhsDim).toEqual(RICCI_SCALAR_DIM);
    });
  });

  describe('Numerical evaluator — bracket checks', () => {
    const { c, G } = PhysicalConstants;
    const c4 = c * c * c * c;

    it('vacuum (Λ=0, T=0): R = 0', () => {
      const R = evaluateEinsteinTrace({ Lambda_per_m2: 0, T_trace_J_per_m3: 0 });
      expect(R).toBe(0);
    });

    it('pure cosmological constant (T=0): R = 4Λ', () => {
      const Lambda = 1.1e-52;
      const R = evaluateEinsteinTrace({
        Lambda_per_m2: Lambda,
        T_trace_J_per_m3: 0,
      });
      expect(R).toBeCloseTo(4 * Lambda, 70);
    });

    it('matter-dominance (Λ=0, T = ρc²): R = -8πGρ/c²', () => {
      // For matter (dust), the stress-energy trace T = -ρc² + 3p ≈ -ρc²
      // for non-relativistic matter; convention here uses T = trace of T_μν.
      // Pick a concrete energy density T (J/m³): here we test the algebraic
      // relation regardless of sign convention.
      const T_trace = 1e-10; // J/m³ (cosmological scale)
      const R = evaluateEinsteinTrace({
        Lambda_per_m2: 0,
        T_trace_J_per_m3: T_trace,
      });
      const expected = -(8 * Math.PI * G * T_trace) / c4;
      expect(R).toBeCloseTo(expected, 30);
    });

    it('linearity in Λ', () => {
      const r1 = evaluateEinsteinTrace({ Lambda_per_m2: 1e-52, T_trace_J_per_m3: 0 });
      const r2 = evaluateEinsteinTrace({ Lambda_per_m2: 2e-52, T_trace_J_per_m3: 0 });
      expect(r2 / r1).toBeCloseTo(2, 14);
    });

    it('linearity in T (for fixed Λ=0): R(2T) = 2 R(T)', () => {
      const r1 = evaluateEinsteinTrace({ Lambda_per_m2: 0, T_trace_J_per_m3: 1e-10 });
      const r2 = evaluateEinsteinTrace({ Lambda_per_m2: 0, T_trace_J_per_m3: 2e-10 });
      expect(r2 / r1).toBeCloseTo(2, 14);
    });

    it('superposition: R(Λ, T) = R(Λ, 0) + R(0, T)', () => {
      const Λ = 1.1e-52;
      const T = 1e-10;
      const r_full = evaluateEinsteinTrace({ Lambda_per_m2: Λ, T_trace_J_per_m3: T });
      const r_lambda = evaluateEinsteinTrace({ Lambda_per_m2: Λ, T_trace_J_per_m3: 0 });
      const r_T = evaluateEinsteinTrace({ Lambda_per_m2: 0, T_trace_J_per_m3: T });
      expect(r_full).toBeCloseTo(r_lambda + r_T, 60);
    });

    it('algebraic identity: R = 4Λ - (8πG/c⁴)T', () => {
      const Λ = 5e-53;
      const T = 3e-10;
      const R = evaluateEinsteinTrace({ Lambda_per_m2: Λ, T_trace_J_per_m3: T });
      const expected = 4 * Λ - (8 * Math.PI * G * T) / c4;
      expect(R).toBeCloseTo(expected, 30);
    });
  });

  describe('Input validation', () => {
    it('rejects non-finite Λ', () => {
      expect(() =>
        evaluateEinsteinTrace({
          Lambda_per_m2: Number.NaN,
          T_trace_J_per_m3: 0,
        }),
      ).toThrow(RangeError);
    });

    it('rejects non-finite T', () => {
      expect(() =>
        evaluateEinsteinTrace({
          Lambda_per_m2: 0,
          T_trace_J_per_m3: Number.POSITIVE_INFINITY,
        }),
      ).toThrow(RangeError);
    });
  });

  describe('v0.7 structural TensorTraceNode re-encoding', () => {
    // Per docs/architecture/v0.7-be-x-reencoding-design-note.md §"BE-13 —
    // TensorTraceNode for the Einstein trace". The stub T_trace in
    // BE13_EINSTEIN_TRACE_RHS is supplemented by BE13_T_TRACE_NODE, which
    // makes the g^μν T_μν contraction structurally explicit.

    it('BE13_T_TRACE_NODE has kind tensor-trace', () => {
      expect(BE13_T_TRACE_NODE.kind).toBe('tensor-trace');
    });

    it('BE13_T_TRACE_NODE validates: result dim = [M L^-1 T^-2] (energy density)', () => {
      const r = validateTensorTrace(BE13_T_TRACE_NODE);
      expect(r.dim).toEqual({ L: -1, M: 1, T: -2, I: 0, Theta: 0, N: 0, J: 0 });
      expect(r.freeIndices.size).toBe(0);
    });

    it('BE13_T_TRACE_NODE result dim matches T_trace stub dim in BE13_EINSTEIN_TRACE_RHS', () => {
      // The structural node and the stub are dimensionally consistent:
      // both carry energy density [M L^-1 T^-2].
      const r = validateTensorTrace(BE13_T_TRACE_NODE);
      expect(r.dim).toEqual(BE13_STRESS_ENERGY_NODE.componentDim);
    });

    it('BE13_T_TRACE_NODE tensor is lower-lower rank-2 (T_μν shape)', () => {
      expect(BE13_T_TRACE_NODE.tensor.indices.length).toBe(2);
      expect(BE13_T_TRACE_NODE.tensor.indices[0].variance).toBe('lower');
      expect(BE13_T_TRACE_NODE.tensor.indices[1].variance).toBe('lower');
    });

    it('BE13_T_TRACE_NODE metric is upper-upper dimensionless (g^μν shape)', () => {
      expect(BE13_T_TRACE_NODE.metric.indices.length).toBe(2);
      expect(BE13_T_TRACE_NODE.metric.indices[0].variance).toBe('upper');
      expect(BE13_T_TRACE_NODE.metric.indices[1].variance).toBe('upper');
      expect(BE13_T_TRACE_NODE.metric.dim).toEqual(
        { L: 0, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 },
      );
    });

    it('BE13_STRESS_ENERGY_NODE is symmetric (T_μν is symmetric by construction)', () => {
      expect(BE13_STRESS_ENERGY_NODE.symmetry).toBe('symmetric');
    });
  });
});
