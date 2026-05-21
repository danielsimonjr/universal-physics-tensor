# Universal Physics Tensor — Project Overview

**Version**: 0.6.0
**Last Updated**: 2026-05-20

---

## What Is This?

Universal Physics Tensor (UPT) is a **TypeScript dimensional-analyzer and bridge-equation library** for exploring unified physics through tensor formalism. It provides machine-readable encoding of 42 bridge equations that connect distinct physics regimes (quantum to classical, gravity to gauge, thermodynamics to information theory), paired with a layered computational backend that can validate, symbolically analyze, and numerically evaluate those equations.

The library serves two audiences: researchers who want to query the bridge-equation catalog and catch dimensional errors in novel formulations, and implementors who want to evaluate tensor contractions numerically, compute Christoffel symbols, or integrate geodesics in an arbitrary Lorentzian manifold.

---

## North Stars

Three goals govern every design choice in UPT:

1. **Bridges drive the work.** The 42 bridge equations in `src/bridges/` are the scientific core. Tooling, tests, and new capabilities exist to serve the catalog, not the other way around. A new feature earns its place by enabling or improving a bridge encoding.

2. **MathTS first-class.** `@danielsimonjr/mathts-tensor` is the preferred numerical backend. The `TensorEngine` interface keeps UPT backend-agnostic, but the selection of MathTSEngine as the intended default (when the optional dep is present) is a deliberate signal about the dependency shape of the ecosystem, not a performance claim.

3. **Integrated scientific environment.** UPT aims to be a self-contained environment for computational physics — Christoffel symbols, geodesic integration, curvature (Riemann/Ricci/Einstein/Weyl/Kretschmann), Killing-vector and Einstein-field-equation machinery, and eventually symbolic manipulation — all sharing a common AST and type system. The curvature and GR layers shipped across v0.5.0 and v0.6.0.

---

## Five-Layer Architecture

UPT is organized into five conceptual layers that build on each other:

```
┌──────────────────────────────────────────────────────────────┐
│  Layer 5: Curvature / GR (v0.5.0 + v0.6.0)                   │
│  Riemann / Ricci / Einstein / Bianchi / Weyl / Kretschmann   │
│  composite nodes + CurvatureCompositeNode<K,S> factory +     │
│  GL4 symplectic integrator + perihelion finder + Killing     │
│  machinery + EinsteinFieldEquationNode + Einstein residual   │
├──────────────────────────────────────────────────────────────┤
│  Layer 4: Numerical Backend                                  │
│  TensorEngine interface + Float64ReferenceEngine +           │
│  MathTSEngine adapter (optional) + AD (forwardGrad /         │
│  reverseGrad) + RK4 geodesic integrator                      │
├──────────────────────────────────────────────────────────────┤
│  Layer 3: Metric / Connection                                │
│  MetricTensorNode / KroneckerDeltaNode / christoffel()       │
│  builder / CovariantDerivativeNode / inverse-metric check    │
├──────────────────────────────────────────────────────────────┤
│  Layer 2: Dimensional AST + Algebra                          │
│  ExprNode union / validate() / validateEquation() /          │
│  SI Dimension algebra (multiply / divide / power / format)   │
├──────────────────────────────────────────────────────────────┤
│  Layer 1: Bridge Catalog                                     │
│  BRIDGE_EQUATIONS (42 entries) + per-bridge evaluator        │
│  modules (be-*.ts) + BridgeEquationEntry metadata type       │
└──────────────────────────────────────────────────────────────┘
```

A bridge equation module at Layer 1 builds AST nodes at Layer 2, validates them with the dimensional algebra, optionally raises/lowers indices using Layer 3 metric primitives, and can be numerically evaluated through Layer 4. Layer 5 (the curvature / general-relativity layer, added across v0.5.0 and v0.6.0) is built on top of Layers 2–4: its curvature node kinds are `ExprNode` members with their own validators and lowering arms, and its integrators reuse the same Christoffel-closure convention as the Layer-4 RK4 solver. Callers who only want catalog metadata (status, known issues, references) never touch layers 2–5.

---

## Version History (v0.1.0 → v0.6.0)

UPT began as a typed bridge-equation catalog — a machine-readable encoding of the UPT specification's bridge equations, each carrying status, known-issue annotations, dimensional signatures, and literature references. Versions 0.1–0.2 established this catalog along with the `UniversalTensor` core class and the `PhysicalConstants` lookup table.

Version 0.3.0 added the dimensional AST: `ExprNode`, the `validate()` function, and the full SI dimension algebra. This made it possible to check whether a proposed bridge equation is dimensionally homogeneous — catching sign errors, missing factors, and undefined quantities that the spec had not yet resolved. Version 0.3.5 added the numerical-contraction backend: the `TensorEngine` interface, the zero-dependency `Float64ReferenceEngine`, and the `MathTSEngine` adapter backed by `@danielsimonjr/mathts-tensor`. Both engines satisfy a parameterized conformance suite that lives alongside the library.

Version 0.4.0 shipped the **connection layer**: the `christoffel()` formula builder, the `CovariantDerivativeNode` AST kind, and the `derivativeStrategy` field on `MetricTensorNode` for specifying how metric derivatives are computed. It also added automatic differentiation (`forwardGrad` / `reverseGrad` on `TensorEngine`), the `integrateGeodesic` RK4 solver, and two new bridge implementations (BE-51 gravitational lensing, BE-52 perihelion precession). Versions 0.4.5 and 0.4.6 were consolidation releases — the Wave-Z evaluator buildout (an `evaluate*` function for every catalogued bridge) and refactor/minimize passes.

Version 0.5.0 shipped the **GR-foundations / curvature layer**: the GL4 (Gauss–Legendre 4th-order) symplectic integrator as an energy-conserving alternative to RK4, the bisection-based perihelion finder, the `RiemannTensorNode` AST kind, and the `ricci` / `einstein` / `bianchiResidual` composite-node helpers (Ricci tensor, Einstein tensor, second-Bianchi-identity residual). It also activated BE-52 (Mercury perihelion advance from numerical integration) and BE-37 (Shapiro delay).

Version 0.5.1 (PC-1) added the **flat constants layer**: the canonical CODATA 2018 / SI-defined `*_SI` constants (`C_SI`, `G_SI`, `HBAR_SI`, …) as the single source of truth for physical constants across the numerical, dimensional, and bridge layers.

Version 0.6.0 shipped the **Killing / Einstein-equation / curvature-invariant layer**: Killing-vector machinery (`verifyKillingEquation`, `evaluateConservedCharge`), the `StressEnergyTensorNode` / `CosmologicalConstantNode` / `EinsteinFieldEquationNode` AST kinds plus the `evaluateEinsteinEquationResidual` numerical residual evaluator, the Weyl tensor and Kretschmann scalar (`computeKretschmann`, `validateKretschmannScalar`), the extracted `CurvatureCompositeNode<K,S>` factory consolidating all six curvature node kinds, and `christoffelFnFlat` (the flat-layout Christoffel accessor from the BR-2 migration).

---

## Roadmap

The v0.5.0/v0.6.0 GR work landed the curvature, symplectic-integrator, Mercury-geodesic, and Shapiro-delay items that were the original v0.5.0+ roadmap. The forward roadmap is tracked in `todo.md` and the per-release planning docs under `docs/planning/`; see the v0.6.0 brainstorm for the candidate v0.7.0 work.

See `ARCHITECTURE.md` for detailed module design. See `COMPONENTS.md` for per-file component breakdown. See `DATAFLOW.md` for concrete data-flow traces through the system. See `API.md` for the public API reference.

---

**Maintained by**: Daniel Simon Jr.
