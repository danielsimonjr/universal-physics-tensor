# Universal Physics Tensor — Data Flow Documentation

**Version**: 0.6.0
**Last Updated**: 2026-05-20

---

## Table of Contents

1. [Overview](#overview)
2. [Flow 1: Bridge Validation](#flow-1-bridge-validation)
3. [Flow 2: Numerical Evaluation](#flow-2-numerical-evaluation)
4. [Flow 3: Automatic Differentiation](#flow-3-automatic-differentiation)
5. [Flow 4: Bridge Catalog Query](#flow-4-bridge-catalog-query)
6. [Flow 5: Geodesic Integration (RK4 + GL4)](#flow-5-geodesic-integration-rk4--gl4)
7. [Flow 6: Curvature-Node Lowering](#flow-6-curvature-node-lowering)
8. [Flow 7: Einstein-Equation Residual](#flow-7-einstein-equation-residual)
9. [Error Handling](#error-handling)

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
│    ├── 'covariant-derivative'→ validateCovariantDerivative()│
│    ├── 'riemann-tensor'      → validateRiemannTensor()      │
│    ├── 'ricci-/einstein-/    → curvature.ts validators      │
│    │    bianchi-...'           (v0.5.0)                      │
│    ├── 'weyl-tensor'         → validateWeylTensor() (v0.6.0)│
│    ├── 'kretschmann-scalar'  → validateKretschmannScalar()  │
│    └── 'einstein-field-      → validateEinsteinFieldEquation│
│         equation'              () (v0.6.0)                   │
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
import { BRIDGE_EQUATIONS } from 'universal-physics-tensor';

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
│ // (isActiveStatus is NOT on the main public surface —      │
│ //  compare status directly.)                                │
│ const tractable = BRIDGE_EQUATIONS                          │
│   .filter(e => e.status !== 'invalid' &&                    │
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

## Flow 5: Geodesic Integration (RK4 + GL4)

**Purpose**: Integrate a test-particle geodesic in an arbitrary Lorentzian manifold.

**Entry points**:
- `integrateGeodesic(inputs: GeodesicIntegratorInputs): GeodesicIntegratorResult` — fixed-step RK4 (v0.4.0).
- `integrateGeodesicGL4(...)` — GL4 Gauss–Legendre 4th-order symplectic integrator (v0.5.0).

The RK4 path is traced below. The GL4 path takes the same `(christoffelFn, x0, v0, …)` shape but, instead of the explicit 4-stage Butcher tableau, solves the implicit 2-stage Gauss–Legendre system per step (fixed-point iteration on the stage values), yielding a symplectic, energy-conserving update. GL4 emits `GL4Snapshot` entries and a `GL4State` trajectory; it is the preferred path for long-time integration where energy drift matters. The `findPerihelion` finder (v0.5.0) consumes a GL4 or RK4 trajectory and bisects on the radial coordinate to locate the perihelion radius.

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

## Flow 6: Curvature-Node Lowering

**Purpose**: Numerically evaluate a curvature composite AST node (`RiemannTensorNode`, `RicciTensorNode`, `EinsteinTensorNode`, `BianchiResidualNode`, `WeylTensorNode`, `KretschmannScalarNode`).

**Entry point**: `evaluateNumerical(node, inputs)` — the same entry point as Flow 2; curvature nodes are ordinary `ExprNode` members.

```
Caller builds a curvature node (ricci(R), einstein(R,g,gI), …)
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. VALIDATE                                                  │
│    validate(node) dispatches on node.kind to the curvature  │
│    validators (curvature.ts / weyl-validators.ts /          │
│    curvature-invariants.ts). Dimensional check only — no    │
│    numeric work.                                            │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. LOWERING — lowerCurvature() dispatcher (lowering.ts)      │
│    A single dispatcher handles all six curvature kinds:     │
│    ├── Look up node.kind in CURVATURE_KIND_REGISTRY         │
│    │   (src/dimensional/curvature-composite.ts)             │
│    ├── Recursively lower the inner RiemannTensorNode        │
│    │   (lowerCurvature calls itself for nested kinds)       │
│    ├── Materialize the inner Riemann via engine.toNested    │
│    ├── Contract on the JS side (Ricci trace, Einstein       │
│    │   combination, Bianchi cyclic sum, Weyl trace removal, │
│    │   Kretschmann full contraction)                         │
│    └── Lift the result back via engine.fromNested           │
│    "Walk-directly philosophy" (v0.5.0 Task 6): no AST       │
│    rewrite into a tensor-product einsum.                    │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. RETURN NumericalResult                                    │
│    value (NestedArray), dim, freeIndices, warnings — as in  │
│    Flow 2.                                                  │
└─────────────────────────────────────────────────────────────┘
```

`computeKretschmann` is the standalone numerical path for the Kretschmann scalar (O(4⁸) = 65536 multiplications per call) — used for direct sample-point diagnostics without building a full AST node.

---

## Flow 7: Einstein-Equation Residual

**Purpose**: Measure how well a metric + stress-energy configuration satisfies the Einstein field equation at a coordinate point.

**Entry point**: `evaluateEinsteinEquationResidual(input: EinsteinEquationResidualInput): number`

```
Caller supplies metric closures + stress-energy closure + point
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. INPUT BUNDLE (EinsteinEquationResidualInput)              │
│    ├── metric closure(s) — MetricClosure: x ↦ g_μν(x)       │
│    ├── stress-energy closure — x ↦ T_μν(x)                  │
│    ├── cosmological constant Λ (default 0)                  │
│    └── evaluation point — Vec4                              │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. ASSEMBLE G_μν                                             │
│    Finite-difference the metric closure to get ∂g, ∂²g →    │
│    Christoffels → Riemann → Ricci → Einstein tensor G_μν.   │
│    4th-order stencil; the FD truncation error sets the      │
│    residual floor (~1e-10 relative).                         │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. RESIDUAL                                                  │
│    r_μν = G_μν + Λ g_μν − κ T_μν,   κ = 8πG/c⁴             │
│    residual = max|r_μν| / max|g_μν|   (scale-normalized,    │
│    dimensionless relative residual)                          │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
   Returns a single dimensionless number.
   For Schwarzschild vacuum (T=0, Λ=0) it is the FD floor.
```

The `verifyKillingEquation` flow is analogous: it finite-differences the metric to assemble exact Christoffels, then evaluates ∇_μ ξ_ν + ∇_ν ξ_μ at a point and reports the residual against a tolerance.

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

**Document Version**: 0.6.0
**Last Updated**: 2026-05-20
**Maintained by**: Daniel Simon Jr.
