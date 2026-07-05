# Universal Physics Tensor — Data Flow Documentation

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
9. [Flow 8: Bridge-Edge Composition (v0.8.0 → v0.11)](#flow-8-bridge-edge-composition-v080--v011)
10. [Flow 9: Phase-D Enumeration + Uncertainty Propagation (v0.10.0)](#flow-9-phase-d-enumeration--uncertainty-propagation-v0100)
11. [Flow 10: Confrontation (`upt confront`)](#flow-10-confrontation-upt-confront)
12. [Flow 11: Discovery Funnel + Epistemic Grounding (`upt discover`)](#flow-11-discovery-funnel--epistemic-grounding-upt-discover)
13. [Error Handling](#error-handling)

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
│ entry.id                  // 11–54                          │
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

The catalog is a static array — no async, no computation. `dimensional_signature` is `null` for entries not yet encoded as ASTs; `string` (output of `format()`) for the entries with dimensional analysis in `src/bridges/equations/`.

Since v0.8.0 two derived views sit beside the array: `adjudicateCatalog()` applies the bridge-membership criterion (with the `rejected.ts` negative catalog as overlay) and returns a per-entry `BridgeVerdict` report, and `data/bridge-catalog.json` is the generated JSON artifact (`npm run catalog:json`).

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

`computeKretschmann` is the standalone numerical path for the Kretschmann scalar (v0.11 factored index-raising algorithm, replacing the earlier O(4⁸) naive contraction) — used for direct sample-point diagnostics without building a full AST node.

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

## Flow 8: Bridge-Edge Composition (v0.8.0 → v0.11)

**Purpose**: Chain two bridge edges through a shared quantity into a derived relation. The pool of composable edges is the 41-edge graph (9 calibration + 6 catalog-tranche + 26 catalog-full).

**Entry point**: `composeEdges(first: BridgeEdge, second: BridgeEdge, opts?: ComposeOptions): BridgeEdge`

```
Caller picks two edges (e.g., be42Edge: M → T_H, be16Edge: T → E_min)
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. JUNCTION SEARCH                                           │
│    Match first.target against second.sources by name, then  │
│    via QUANTITY_IDENTIFICATIONS (+ opts.identifications).    │
│    No match → throw CompositionJunctionError.                │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. DIMENSION CHECK at the junction                           │
│    equals(first.target.dim, junction.dim) or throw          │
│    CompositionDimensionError.                                │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. ALIAS GATE (v0.11 namespacing gate, Option D)             │
│    For every source-quantity name appearing in BOTH          │
│    operands (outside the junction):                          │
│    ├── look up SOURCE_ALIAS_DISPOSITIONS[composedId],        │
│    │   then opts.aliases                                     │
│    ├── 'shared'        → one input feeds both slots          │
│    ├── {renameSecond}  → second operand's slot renamed +     │
│    │                     inputs remapped                     │
│    └── no disposition  → throw CompositionAliasError         │
│    (Forcing example: be-42>>be-12 would silently feed one    │
│    'mass' to both the black-hole and particle slots.)        │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. DERIVED EDGE                                              │
│    evaluate = pipe(first.evaluate → second.evaluate);        │
│    confidence = minConfidence(first, second);                │
│    kind = 'law' only if both operands are laws; beId = null. │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
   Derived BridgeEdge — e.g., CT-1: E_min(M) = ℏc³ln2/(8πGM)
   from BE-42∘BE-16, checkable via consistencyRatio().
```

---

## Flow 9: Phase-D Enumeration + Uncertainty Propagation (v0.10.0)

**Purpose**: Mechanically enumerate all valid two-edge compositions over the graph (the Part-IX Phase-D loop), and attach observational uncertainty to any edge's prediction.

**Entry points**:
- `enumerateCompositions(edges: readonly BridgeEdge[]): EnumerationReport`
- `propagateUncertainty(edge, inputs, uncertainties): UncertaintyResult`

```
Caller supplies an edge pool (e.g., CATALOG_FULL_EDGES + named edges)
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. PAIRWISE SWEEP (enumerate.ts)                             │
│    For every ordered pair (A, B), A ≠ B:                    │
│    attempt composeEdges(A, B) and classify the outcome:     │
│    ├── success → CompositionCandidate                       │
│    │   ├── id in REGISTERED_COMPOSITION_IDS → registered    │
│    │   │   (completeness check)                              │
│    │   └── else → NOVEL candidate (review surface)          │
│    ├── CompositionJunctionError / CompositionDimensionError │
│    │   → failure bucket with attribution                    │
│    └── CompositionAliasError → requiresDisposition[]        │
│        (v0.11: held at the gate, not silently composed)     │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
   EnumerationReport — v0.10.0 (15-edge graph): 6 valid, 4
   registered, 2 novel; v0.11 (41-edge graph): 11 compositions,
   7 novel, 1 collision held at the gate. Novel candidates are
   review surfaces: docs/research/v0.1{0,1}.0-novel-candidates.md.

Uncertainty path (uncertainty.ts):
┌─────────────────────────────────────────────────────────────┐
│ propagateUncertainty(edge, inputs, σ_inputs)                 │
│    ├── central-difference Jacobian of edge.evaluate at the  │
│    │   input point (first-order)                             │
│    └── σ_out² = Σᵢ (∂f/∂xᵢ · σᵢ)²                          │
│    Works on composed edges for free (they are BridgeEdges). │
│    Consumers: confrontBE36WithUncertainty (Δt = 1.74±0.05 s │
│    → σ ≈ 1.9e-17 on the BE-36 bound), confrontBE23With-     │
│    Uncertainty.                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Flow 10: Confrontation (`upt confront`)

**Purpose**: Compare a bridge's prediction — or, for a bound-type bridge, its encoded bound — against an INDEPENDENT, cited real-world observation. Confrontation is orthogonal to the discovery funnel (Flow 11): it operates only on established, catalog bridges, never on discovery candidates.

**Entry point**: CLI `upt confront [--bridge=be-XX] [--sensitivity] [--json]` (`src/cli/commands/confront.ts`) → `listConfrontations()` / `runConfrontation(bridgeId)` (`src/bridges/confrontations.ts`).

```
Caller runs `upt confront` (all bridges) or `upt confront --bridge=be-37`
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. REGISTRY LOOKUP                                           │
│    CONFRONTATIONS: Map<bridgeId, ConfrontationEntry>          │
│    9 registered confrontations (v0.40): BE-11, 21, 23, 35,   │
│    36, 37, 48, 51, 52.                                       │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. RUN — entry.run()                                         │
│    Calls the per-bridge confront*() function                │
│    (be*-confrontation.ts), which either:                    │
│    ├── recomputes a prediction from the bridge's closed      │
│    │   form (e.g. confrontBE37() → Shapiro-delay PPN γ), or │
│    └── reads an encoded bound (e.g. confrontBE36() → the    │
│        GW170817 speed-of-gravity bound)                     │
│    and pairs it with an independently-sourced observation    │
│    record carrying an ObservationProvenance (citation, year, │
│    retrieved date, optional note).                           │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. NORMALIZE — wrap into a ConfrontationOutcome               │
│    (observations/types.ts) — a discriminated union on `kind`,│
│    each arm carrying only the fields it can honestly         │
│    populate:                                                 │
│    ├── 'value'        → predicted, observed, sigma,          │
│    │                    residualInSigma() (|Δ|/σ),           │
│    │                    withinObserved (≤1σ)                 │
│    ├── 'upper-bound'  → predicted (encoded bound), bound      │
│    │                    (observational bound), satisfied,     │
│    │                    optional `caveat` — e.g. BE-36's      │
│    │                    v0.40 one-sided caveat (the encoded   │
│    │                    ± bound only tests the + side of an   │
│    │                    asymmetric GW170817 interval)         │
│    ├── 'consistency'  → predicted, approaches, fractionalGap  │
│    │                    (e.g. BE-21 KSS bound vs QGP, BE-11   │
│    │                    collisional decoherence)              │
│    └── 'table'        → rows[] of {predicted, observed,      │
│                          sigma, residualInSigma}              │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. OPTIONAL SENSITIVITY (--sensitivity, value-kind only)      │
│    decidingMeasurement(bridgeId) ranks the prediction's       │
│    inputs by elasticity — which input the prediction depends │
│    on most STRONGLY, NOT which dominates the uncertainty      │
│    budget (that needs input sigma, not elasticity).           │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
   Text summary (predicted/observed/σ/residual, within/outside 1σ,
   source citation) or --json envelope. Always carries the honest
   epistemics line: "confrontation is consistency, not confirmation;
   a passing confrontation does not prove the bridge."
```

---

## Flow 11: Discovery Funnel + Epistemic Grounding (`upt discover`)

**Purpose**: Hypothesize a cross-cluster quantity identification `a ≡ b` and vet it through an ordered falsifier stack, then annotate every survivor with an honest ledger of what was actually tested — so a physicist reading `promising` knows exactly how much weight the verdict bears.

**Entry point**: CLI `upt discover [--source=catalog|canonical|both] [--derive] [--max-orders] [--anchor] [--show-adjudicated] [--json]` (`src/cli/commands/discover.ts`).

```
Caller runs `upt discover`
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. PROPOSE — dimensional filter                              │
│    proposeLinkCandidates() (bridge-analysis.ts) surfaces      │
│    cross-cluster quantity pairs sharing an SI dimension       │
│    (the raw, weak-prior coincidence pool).                   │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. VET — rankDiscoveries() (composition/discovery.ts)         │
│    For each candidate a≡b, in gate order:                    │
│    ├── magnitude gate — orders of magnitude apart (from       │
│    │   REPRESENTATIVE_VALUES or anchor-derived); > N orders   │
│    │   (default maxOrdersOfMagnitude=3) → 'magnitude-clash'   │
│    ├── axis gate — scale/force RegimeAttributes agreement;    │
│    │   a clash → 'axis-clash' (an identity falsifier)         │
│    ├── structural signals — mergesComponents (union-find       │
│    │   over the quantity graph), unlocksFromAnchor            │
│    │   (forwardClosure), numericallyConsistent (retrodict     │
│    │   over the anchor-reachable subgraph); a contradiction   │
│    │   → 'contradictory'                                      │
│    └── verdict: 'promising' (consistent AND merges components │
│        AND unlocks ≥1 quantity) | 'inert' | 'contradictory' | │
│        'magnitude-clash' | 'axis-clash'                       │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. ADJUDICATION LEDGER OVERLAY (v0.31, Phase 1)               │
│    annotateAdjudications() (composition/adjudication.ts)      │
│    attaches any physicist-recorded verdict — 'genuine' |      │
│    'decoy' | 'entailed' | 'deferred' — sourced from            │
│    docs/research/*-adjudication.md. 'decoy'/'entailed'        │
│    candidates fold out of the printed PROMISING list by       │
│    default (--show-adjudicated relists them).                 │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. CONSEQUENCE ANNOTATION (v0.33, Phase 4-Unit-A)             │
│    annotateConsequences() (composition/consequence.ts)        │
│    derives each promising candidate's monomial algebraic       │
│    consequence (deriveProposedBridges) and classifies it via   │
│    classifyProposal() against the canonical registry's        │
│    normalForm:                                                │
│    ├── 'entailed'           → re-derives a known canonical law│
│    ├── 'novel-consequence'  → valid, unadjudicated, no match  │
│    └── 'inconclusive'       → no monomial consequence derived │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. EPISTEMIC-GROUNDING LEDGER (v0.37, PI-instrument Phase 1)  │
│    describeGrounding() (composition/grounding.ts) — a pure,   │
│    annotation-only view over the candidate's already-computed│
│    falsifier results (never changes the verdict/score):      │
│    ├── passed — gates that ran a real comparison AND the      │
│    │   candidate survived (numerical-consistency, magnitude,  │
│    │   axis-compatible, consequence: entailed)                │
│    ├── gaps — gates that could NOT test it, or produced an    │
│    │   unadjudicated result (no representative value, no      │
│    │   resolved axis, consequence: novel/inconclusive)         │
│    └── the PERMANENT honest ceiling: mechanismTested: false    │
│        and dataTested: false — no mechanism-proxy gate and no │
│        propose→confront loop are buildable on dimensional      │
│        candidates alone (both assessed 2026-07-04 and          │
│        correctly NOT built; real mechanism/data confrontation  │
│        live in the ESTABLISHED-bridge world, Flow 10, reached  │
│        only after a candidate graduates via human review).     │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
   Text funnel summary (N candidates → promising/inert/magnitude-
   clash/contradictory/axis-clash counts), with each promising
   candidate's unlocks, consequence signal, grounding line, and any
   recorded adjudication; or --json envelope with the per-candidate
   result array + an adjudicationSummary tally. Always carries the
   review-surface epistemics line: "`promising` means 'worth a
   physicist's minute', not 'true'."
```

---

## Error Handling

UPT uses three distinct error-signalling mechanisms:

| Mechanism | Used For | Example |
|-----------|----------|---------|
| `throw` | Programmer errors, invalid ASTs, invariant violations | `NumericalBackendError`, `DimensionMismatchError`, `EngineCapabilityError`, the composition errors (`CompositionJunctionError`, `CompositionDimensionError`, `CompositionAliasError`, `DomainViolationError`), `NumericalBackendError` from bad inputs to `integrateGeodesic` |
| `Violation` entries in `ValidationResult` | Expected dimensional mismatches the caller should inspect | Non-homogeneous equation, mismatched free-index signatures |
| `warnings` in `NumericalResult` | Non-fatal numerical observations | `DuplicateCoordinateWarning`, inverse-metric inconsistency |

Error-severity violations make `ValidationResult.ok = false` and cause `evaluateNumerical()` to throw. Warning-severity violations appear in `NumericalResult.warnings` but do not block evaluation.

---

See `ARCHITECTURE.md` for the module design context. See `COMPONENTS.md` for per-component descriptions. See `API.md` for the public surface reference.

---

**Maintained by**: Daniel Simon Jr.
