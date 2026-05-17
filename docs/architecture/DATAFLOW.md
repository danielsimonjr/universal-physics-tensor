# Universal Physics Tensor — Data Flow Documentation

**Version**: 0.4.0
**Last Updated**: 2026-05-16

---

## Table of Contents

1. [Overview](#overview)
2. [Flow 1: Bridge Validation](#flow-1-bridge-validation)
3. [Flow 2: Numerical Evaluation](#flow-2-numerical-evaluation)
4. [Flow 3: Automatic Differentiation](#flow-3-automatic-differentiation)
5. [Flow 4: Bridge Catalog Query](#flow-4-bridge-catalog-query)
6. [Flow 5: Geodesic Integration](#flow-5-geodesic-integration)
7. [Error Handling](#error-handling)

---

## Overview

Data in UPT flows through a layered system. The dimensional AST (`ExprNode`) is the central artifact — it travels from the caller through the validator and into the numerical backend. The bridge catalog (`BRIDGE_EQUATIONS`) is a separate data store that is queried independently of the AST pipeline.

```
┌───────────────────────────────────────────────────────────────────┐
│  Caller                                                           │
│  ├── Constructs ExprNode tree (or imports one from a be-* module) │
│  ├── Optionally calls validate() for symbolic check               │
│  ├── Optionally calls evaluateNumerical() for numeric evaluation  │
│  └── Optionally queries BRIDGE_EQUATIONS for catalog metadata     │
└───────────────────────────────────────────────────────────────────┘
                              │
           ┌──────────────────┼──────────────────────┐
           ▼                  ▼                       ▼
    dimensional/         numerical/              bridges/
    validator.ts         index.ts                index.ts
    (validate)           (evaluateNumerical)     (BRIDGE_EQUATIONS)
           │                  │
           ▼                  ▼
    ValidationResult    TensorEngine
    (ok, dim,           (einsum, matMul,
     freeIndices,        forwardGrad, ...)
     violations)
```

---

## Flow 1: Bridge Validation

**Purpose**: Check that a bridge equation is dimensionally consistent without evaluating it numerically.

**Entry point**: `validate(node: ExprNode): ValidationResult`

```
Caller builds an ExprNode tree
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. CONSTRUCT AST                                             │
│    const lhs = { kind: 'symbol', name: 'ρ', dim: MASS };   │
│    const rhs = { kind: 'op', op: '*', args: [c, c] };      │
│    // (simplified) — real bridges use tensor nodes          │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. CALL validate() or validateEquation()                     │
│    const result = validate(lhs);                            │
│    // OR: const eq = validateEquation(lhs, rhs);            │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. RECURSIVE TREE WALK (validator.ts infer())               │
│    For each node:                                           │
│    ├── 'symbol'              → return node.dim              │
│    ├── 'op' *,/              → multiply / divide dims       │
│    ├── 'op' +,-              → add / subtract (throws       │
│    │                           DimensionMismatchError if    │
│    │                           dims disagree, or raises     │
│    │                           FreeIndexMismatchError if    │
│    │                           free-index maps differ)      │
│    ├── 'op' ^                → power(baseDim, n)            │
│    ├── 'integral'            → multiply(f.dim, dx.dim)      │
│    ├── 'derivative'          → divide(f.dim, wrt.dim)       │
│    ├── 'tensor-symbol'       → validateTensorSymbol()       │
│    │                           (builds freeIndices map)     │
│    ├── 'tensor-product'      → computeContraction()         │
│    │                           (Einstein summation algebra) │
│    ├── 'metric-tensor'       → validateMetricTensor()       │
│    ├── 'kronecker-delta'     → validateKroneckerDelta()     │
│    ├── 'tensor-partial-      → validatePartialDerivative()  │
│    │    derivative'                                         │
│    └── 'covariant-derivative'→ validateCovariantDerivative()│
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. ACCUMULATE VIOLATIONS                                     │
│    Each mismatch appends a Violation entry:                 │
│    { location, expected, actual, note, severity }           │
│    Warning violations do not set ok=false.                  │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. RETURN ValidationResult                                   │
│    {                                                        │
│      ok: boolean,          // no error-severity violations  │
│      inferredDimension,    // Dimension | null              │
│      freeIndices,          // Map<label, {upper,lower}>     │
│      violations,           // Violation[]                   │
│    }                                                        │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
   Caller inspects result
```

**Bridge module variant**: A per-bridge module's `validate*Dimensions()` helper wraps `validateEquation(LHS, RHS)` and returns a simpler `DimensionValidationReport { ok, lhsDim, rhsDim }`.

---

## Flow 2: Numerical Evaluation

**Purpose**: Evaluate a dimensionally valid AST to a concrete numerical result.

**Entry point**: `evaluateNumerical(node: ExprNode, inputs: NumericalInputs, options?: EvaluateOptions): Promise<NumericalResult>`

```
Caller provides ExprNode tree + NumericalInputs
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. VALIDATE (prepare() internal)                             │
│    vr = validate(node)                                      │
│    if (!vr.ok) throw NumericalBackendError                  │
│    // Numerical evaluation on an invalid AST is forbidden.  │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. RESOLVE ENGINE                                            │
│    engine = options?.engine ?? await getActiveEngine()      │
│    // Default: Float64ReferenceEngine                       │
│    // Override: pass engine in EvaluateOptions              │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. LOWERING PASS (lowering.ts lowerNode())                  │
│    Recursively translates ExprNode → EngineTensor:          │
│    ├── 'symbol'         → engine.fromNested(inputs[name])  │
│    ├── 'op' *,/,+,-,^  → engine arithmetic methods         │
│    ├── 'tensor-product' → engine.einsum(EinsumSpec, ...)   │
│    │   [contraction plan built by computeContraction()]     │
│    ├── 'integral'       → numerical quadrature (if present) │
│    └── other kinds      → corresponding engine ops          │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. OPTIONAL INVERSE-METRIC CHECK                             │
│    If the AST contains a lower/upper metric pair:           │
│    ├── scanForMetricPair(node) identifies the pair          │
│    └── evaluateMetricInverse(...) checks g^{ab}g_{bc}≈δ^a_c │
│        and emits a warning Violation if not.                │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. MATERIALIZE + RETURN NumericalResult                      │
│    {                                                        │
│      value: engine.toNested(tensor),   // NestedArray       │
│      dim: Dimension,                   // inferred SI dim   │
│      freeIndices: Map<...>,                                 │
│      warnings: Violation[],                                 │
│    }                                                        │
└─────────────────────────────────────────────────────────────┘
```

**Raw variant**: `evaluateNumericalRaw` skips step 5's `toNested()` call and returns the live `EngineTensor` for chaining. The caller is responsible for calling `.dispose()`.

---

## Flow 3: Automatic Differentiation

**Purpose**: Compute the Jacobian or gradient of a user-supplied tensor-valued function.

**Entry points**:
- `engine.forwardGrad(fn, x): Promise<ForwardGradResult>`
- `engine.reverseGrad(fn, x, cotangent?): Promise<ReverseGradResult>`

Both methods are optional on `TensorEngine`. Always check `hasAutogradSupport(engine)` first.

```
Caller wraps computation in a closure
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. CAPABILITY CHECK                                          │
│    if (!hasAutogradSupport(engine)) {                       │
│      throw new EngineCapabilityError(engine.name, 'forwardGrad') │
│    }                                                        │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│ 2a. FORWARD-MODE (forwardGrad)                               │
│    Float64ReferenceEngine path:                             │
│    ├── Lift x to EngineDualTensor (primal=x.data,           │
│    │   tangent=ones)                                        │
│    ├── Run fn(dualX) — all arithmetic propagates            │
│    │   both primal and tangent per dual-number rules        │
│    └── Extract { value: primal, jacobian: tangent }         │
│                                                             │
│    MathTSEngine path: delegate to mathts-autograd forward   │
│    mode; same result shape.                                 │
└─────────────────────────────────────────────────────────────┘
          │    OR
┌─────────────────────────────────────────────────────────────┐
│ 2b. REVERSE-MODE (reverseGrad)                               │
│    Float64ReferenceEngine path:                             │
│    ├── Record-mode forward pass: run fn(x) with a Tape      │
│    │   that logs every operation and its input references  │
│    ├── Backward pass: walk the Tape in reverse, accumulate │
│    │   gradients via the chain rule per logged op type     │
│    └── Return { value, gradient }                          │
│        cotangent defaults to ones-like(value)              │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. RETURN RESULT                                             │
│    ForwardGradResult: { value: EngineTensor,                │
│                          jacobian: EngineTensor }           │
│    ReverseGradResult: { value: EngineTensor,                │
│                          gradient: EngineTensor }           │
└─────────────────────────────────────────────────────────────┘
```

**Honest note**: AD operates on user-supplied closures, not on `ExprNode` trees. There is no symbolic-tree differentiation in v0.4.0. The `derivativeStrategy: 'computed'` field on `MetricTensorNode` still uses finite differences (pderiv) in the AST evaluation path — it does not route through `forwardGrad` / `reverseGrad`.

---

## Flow 4: Bridge Catalog Query

**Purpose**: Retrieve metadata about bridge equations without touching the dimensional or numerical layers.

**Entry point**: `BRIDGE_EQUATIONS: BridgeEquationEntry[]`

```
import { BRIDGE_EQUATIONS, isActiveStatus } from 'universal-physics-tensor';

          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│ FILTER by status / category / tractability                   │
│                                                             │
│ // All active (non-invalid) established bridges:            │
│ const established = BRIDGE_EQUATIONS                        │
│   .filter(e => e.status === 'established');                 │
│                                                             │
│ // Computationally tractable, active bridges:               │
│ const tractable = BRIDGE_EQUATIONS                          │
│   .filter(e => isActiveStatus(e.status) &&                  │
│     (e.tractability_class === 'closed-form' ||              │
│      e.tractability_class === 'numerical-tractable'));       │
│                                                             │
│ // Bridges with known dimensional issues:                   │
│ const dimensionalIssues = BRIDGE_EQUATIONS                  │
│   .filter(e => e.known_issues.some(                        │
│     i => i.severity === 'dimensional'));                     │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│ ACCESS METADATA FIELDS                                       │
│                                                             │
│ entry.id                  // 11–52                          │
│ entry.name                // verbatim spec heading          │
│ entry.status              // BridgeEquationStatus           │
│ entry.formula_latex       // primary equation as LaTeX      │
│ entry.dimensional_signature // '[energy]' | null           │
│ entry.tractability_class  // BridgeTractabilityClass        │
│ entry.known_issues        // KnownIssue[]                   │
│ entry.references          // arXiv IDs, etc.               │
│ entry.dependencies        // ids of referenced bridges      │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
   Caller uses metadata (no dimensional or numerical layer touched)
```

The catalog is a static array — no async, no computation. `dimensional_signature` is `null` for entries not yet encoded as ASTs; `string` (output of `format()`) for the 8+ entries with dimensional analysis in `src/bridges/equations/`.

---

## Flow 5: Geodesic Integration

**Purpose**: Integrate a test-particle geodesic in an arbitrary Lorentzian manifold.

**Entry point**: `integrateGeodesic(inputs: GeodesicIntegratorInputs): GeodesicIntegratorResult`

```
Caller prepares Christoffel-symbol closure + initial conditions
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. INPUT BUNDLE                                              │
│    {                                                        │
│      christoffelFn: (x) => Γ[μ][ν][ρ],   // closure        │
│      x0: [t, r, θ, φ],                   // initial pos    │
│      v0: [dt/dτ, dr/dτ, dθ/dτ, dφ/dτ], // initial vel    │
│      dτ: number,                          // step size      │
│      nSteps: number,                      // integration steps │
│    }                                                        │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. VALIDATE INPUTS                                           │
│    Check x0, v0 are 4-vectors; dτ > 0; nSteps ≥ 1.        │
│    Throw NumericalBackendError on invalid input.            │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. RK4 INTEGRATION LOOP                                      │
│    Cast geodesic ODE as first-order system on (x, v):       │
│      dx^μ/dτ = v^μ                                         │
│      dv^μ/dτ = −Γ^μ_{νρ}(x) v^ν v^ρ                       │
│                                                             │
│    For each step i = 0 … nSteps-1:                         │
│    ├── k1 = f(x_i, v_i)         // slope at start           │
│    ├── k2 = f(x_i+dτ/2·k1_x,   // slope at midpoint (k1)  │
│    │         v_i+dτ/2·k1_v)                                │
│    ├── k3 = f(x_i+dτ/2·k2_x,   // slope at midpoint (k2)  │
│    │         v_i+dτ/2·k2_v)                                │
│    ├── k4 = f(x_i+dτ·k3_x,     // slope at end             │
│    │         v_i+dτ·k3_v)                                  │
│    └── x_{i+1} = x_i + dτ/6·(k1+2k2+2k3+k4)_x            │
│        v_{i+1} = v_i + dτ/6·(k1+2k2+2k3+k4)_v            │
│                                                             │
│    christoffelFn(x) is called 4× per step.                 │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. COLLECT TRAJECTORY                                        │
│    trajectory: Array<{ x: [t,r,θ,φ], v: [dt/dτ,…] }>      │
│    Length = nSteps + 1 (includes initial state).            │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
   GeodesicIntegratorResult { trajectory }
```

The integrator has no `TensorEngine` dependency. It accepts a plain JS closure for the Christoffel symbol, which the caller can build using `christoffel()` and then evaluate numerically, or supply analytically (e.g., the closed-form Schwarzschild Christoffel coefficients).

---

## Error Handling

UPT uses three distinct error-signalling mechanisms:

| Mechanism | Used For | Example |
|-----------|----------|---------|
| `throw` | Programmer errors, invalid ASTs, invariant violations | `NumericalBackendError`, `DimensionMismatchError`, `EngineCapabilityError`, `NumericalBackendError` from bad inputs to `integrateGeodesic` |
| `Violation` entries in `ValidationResult` | Expected dimensional mismatches the caller should inspect | Non-homogeneous equation, mismatched free-index signatures |
| `warnings` in `NumericalResult` | Non-fatal numerical observations | `DuplicateCoordinateWarning`, inverse-metric inconsistency |

Error-severity violations make `ValidationResult.ok = false` and cause `evaluateNumerical()` to throw. Warning-severity violations appear in `NumericalResult.warnings` but do not block evaluation.

---

See `ARCHITECTURE.md` for the module design context. See `COMPONENTS.md` for per-component descriptions. See `API.md` for the public surface reference.

---

**Document Version**: 0.4.0
**Last Updated**: 2026-05-16
**Maintained by**: Daniel Simon Jr.
