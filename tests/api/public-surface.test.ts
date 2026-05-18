/**
 * v0.4.0 Public API stability snapshot test.
 *
 * Two-pronged guard (matches v0.3.5 Task 16 pattern):
 *   1. Runtime export surface — Object.keys(root) covers every value-export
 *      (functions, classes, constants). TS erases nothing from these.
 *   2. Type-only export surface — source-text grep on dist/index.d.ts ensures
 *      type-only exports (erased at runtime) are not silently dropped.
 *
 * isChristoffelSymmetric is intentionally absent — removed per E9 adversarial
 * review (μ↔ν symmetry of Γ holds by construction of the symmetric metric).
 *
 * See docs/planning/v0.4.0-api-surface.md for per-symbol rationale.
 *
 * @module tests/api/public-surface
 */
import { describe, it, expect } from 'vitest';
import * as root from '../../src/index.js';

// ---------------------------------------------------------------------------
// Runtime value exports (functions, classes, constants)
// ---------------------------------------------------------------------------
const EXPECTED_RUNTIME_EXPORTS = [
  // Core
  'UniversalTensor',
  'PhysicalConstants',
  // Bridge catalog
  'BRIDGE_EQUATIONS',
  // v0.3.0 dimensional constants
  'DIMENSIONLESS', 'LENGTH', 'AREA', 'TIME', 'FREQUENCY', 'MASS',
  'VELOCITY', 'ACCELERATION', 'FORCE', 'ENERGY', 'POWER', 'ACTION',
  'TEMPERATURE', 'ENTROPY', 'CHARGE',
  // v0.3.0 dimensional algebra
  'multiply', 'divide', 'power', 'add', 'subtract', 'equals', 'format',
  'DimensionMismatchError',
  // v0.3.0 validator
  'validate', 'validateEquation', 'validateInverseMetricPair',
  'inferDimensionForBridge',
  // v0.3.5 numerical surface
  'evaluateNumerical', 'evaluateNumericalRaw', 'evaluateMetricInverse',
  'Float64ReferenceEngine', 'getActiveEngine', 'setActiveEngine',
  'NumericalBackendError',
  // v0.4.0 bridge implementations
  'evaluateGravitationalLensing',
  'evaluatePerihelionPrecession',
  // v0.4.0 connection layer
  'christoffel',
  // v0.4.0 geodesic integrator
  'integrateGeodesic',
  // v0.4.0 numerical additions
  'DuplicateCoordinateWarning',
  'EngineCapabilityError',
  'hasAutogradSupport',
  'evaluateBE37CovariantEikonalNumerical',
  // v0.5.0 GL4 symplectic integrator (Task 3)
  'integrateGeodesicGL4',
  // v0.5.0 perihelion finder (Task 4)
  'findPerihelion',
].sort();

describe('Public API stability — v0.4.0 surface', () => {
  it('runtime exports match the v0.4.0 snapshot', () => {
    const actual = Object.keys(root).sort();
    // Check every expected key is present
    for (const key of EXPECTED_RUNTIME_EXPORTS) {
      expect(actual, `Expected runtime export "${key}" to be present`).toContain(key);
    }
    // Snapshot the full set so accidental additions are also caught
    expect(actual).toMatchSnapshot();
  });

  it('isChristoffelSymmetric is NOT in the runtime surface', () => {
    expect('isChristoffelSymmetric' in root).toBe(false);
  });

  it('RepeatedDummyLabelError is NOT in the runtime surface (removed deprecated alias)', () => {
    expect('RepeatedDummyLabelError' in root).toBe(false);
  });

  it('Float64Tensor is NOT in the runtime surface (marked @internal, export removed)', () => {
    // Float64Tensor is not in src/index.ts and was never a documented
    // public export. Consumers use the TensorEngine interface and the
    // opaque EngineTensor handle. The concrete class is an impl detail.
    expect('Float64Tensor' in root).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Type-only exports — asserted via src/index.ts source text (pre-build guard)
// and via dist/index.d.ts text (post-build guard).
// Type exports are erased by tsc and never appear in Object.keys(root).
// ---------------------------------------------------------------------------

// v0.4.0 type-only symbols
const V040_TYPE_EXPORTS = [
  'CovariantDerivativeNode',
  'ForwardGradResult',
  'ReverseGradResult',
];

// v0.5.0 type-only symbols
const V050_TYPE_EXPORTS = [
  'GL4State',
  'GL4Snapshot',
  'GL4Options',
  // Task 4 perihelion-finder types
  'PerihelionResult',
  'FindPerihelionOptions',
];

// All type exports (v0.3.x + v0.4.0 + v0.5.0)
const ALL_TYPE_EXPORTS = [
  // Core types
  'TensorConfig', 'TensorIndices', 'PhysicalLaw', 'BridgeEquation',
  'EmergentPhenomenon', 'PhysicalScale', 'Force', 'Symmetry', 'InformationMeasure',
  // Bridge catalog types
  'BridgeEquationEntry', 'BridgeEquationStatus', 'BridgeIssueSeverity',
  'BridgeIssueFixable', 'KnownIssue',
  // Bridge input/result types
  'GravitationalLensingInputs', 'GravitationalLensingResult',
  'PerihelionPrecessionInputs', 'PerihelionPrecessionResult',
  // Geodesic types
  'GeodesicIntegratorInputs', 'GeodesicIntegratorResult',
  // Dimensional types
  'Dimension', 'ExprNode', 'ValidationResult', 'Violation',
  // v0.3.5 numerical types
  'NumericalResult', 'NumericalRawResult', 'EvaluateOptions', 'NumericalInputs',
  'TensorEngine', 'EngineTensor', 'EinsumSpec', 'NestedArray', 'GridField',
  // v0.4.0 type additions
  'CovariantDerivativeNode',
  'ForwardGradResult',
  'ReverseGradResult',
  // v0.5.0 type additions (Task 3)
  'GL4State',
  'GL4Snapshot',
  'GL4Options',
  // v0.5.0 type additions (Task 4)
  'PerihelionResult',
  'FindPerihelionOptions',
];

describe('Public API stability — v0.4.0 type-only surface (src/index.ts source text)', () => {
  it('src/index.ts source re-exports every v0.4.0 type-only symbol', async () => {
    const { readFileSync } = await import('node:fs');
    const { fileURLToPath } = await import('node:url');
    const indexSrc = readFileSync(
      fileURLToPath(new URL('../../src/index.ts', import.meta.url)), 'utf8',
    );
    for (const typeName of ALL_TYPE_EXPORTS) {
      expect(indexSrc, `src/index.ts must re-export type "${typeName}"`).toContain(typeName);
    }
  });

  it('isChristoffelSymmetric is NOT mentioned in src/index.ts', async () => {
    const { readFileSync } = await import('node:fs');
    const { fileURLToPath } = await import('node:url');
    const indexSrc = readFileSync(
      fileURLToPath(new URL('../../src/index.ts', import.meta.url)), 'utf8',
    );
    expect(indexSrc).not.toContain('isChristoffelSymmetric');
  });
});

describe('Public API stability — v0.4.0 type-only surface (dist/index.d.ts post-build)', () => {
  it('dist/index.d.ts contains every v0.4.0 type-only symbol', async () => {
    const { readFileSync, existsSync } = await import('node:fs');
    const { fileURLToPath } = await import('node:url');
    const dtsPath = fileURLToPath(new URL('../../dist/index.d.ts', import.meta.url));
    if (!existsSync(dtsPath)) {
      // dist not yet built — skip the post-build check (pre-build TDD phase)
      console.warn('dist/index.d.ts not found — skipping post-build type check. Run npm run build first.');
      return;
    }
    const dtsSrc = readFileSync(dtsPath, 'utf8');
    for (const typeName of V040_TYPE_EXPORTS) {
      expect(dtsSrc, `dist/index.d.ts must declare type "${typeName}"`).toContain(typeName);
    }
  });

  it('dist/index.d.ts does NOT declare isChristoffelSymmetric', async () => {
    const { readFileSync, existsSync } = await import('node:fs');
    const { fileURLToPath } = await import('node:url');
    const dtsPath = fileURLToPath(new URL('../../dist/index.d.ts', import.meta.url));
    if (!existsSync(dtsPath)) {
      console.warn('dist/index.d.ts not found — skipping post-build check.');
      return;
    }
    const dtsSrc = readFileSync(dtsPath, 'utf8');
    expect(dtsSrc).not.toContain('isChristoffelSymmetric');
  });
});
