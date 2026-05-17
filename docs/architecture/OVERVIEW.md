# Universal Physics Tensor — Project Overview

**Version**: 0.4.0
**Last Updated**: 2026-05-16

---

## What Is This?

Universal Physics Tensor (UPT) is a **TypeScript dimensional-analyzer and bridge-equation library** for exploring unified physics through tensor formalism. It provides machine-readable encoding of 42 bridge equations that connect distinct physics regimes (quantum to classical, gravity to gauge, thermodynamics to information theory), paired with a layered computational backend that can validate, symbolically analyze, and numerically evaluate those equations.

The library serves two audiences: researchers who want to query the bridge-equation catalog and catch dimensional errors in novel formulations, and implementors who want to evaluate tensor contractions numerically, compute Christoffel symbols, or integrate geodesics in an arbitrary Lorentzian manifold.

---

## North Stars

Three goals govern every design choice in UPT:

1. **Bridges drive the work.** The 42 bridge equations in `src/bridges/` are the scientific core. Tooling, tests, and new capabilities exist to serve the catalog, not the other way around. A new feature earns its place by enabling or improving a bridge encoding.

2. **MathTS first-class.** `@danielsimonjr/mathts-tensor` is the preferred numerical backend. The `TensorEngine` interface keeps UPT backend-agnostic, but the selection of MathTSEngine as the intended default (when the optional dep is present) is a deliberate signal about the dependency shape of the ecosystem, not a performance claim.

3. **Integrated scientific environment.** The roadmap points toward a self-contained environment for computational physics — Christoffel symbols, geodesic integration, curvature, and eventually symbolic manipulation — all sharing a common AST and type system.

---

## Four-Layer Architecture

UPT is organized into four conceptual layers that build on each other:

```
┌──────────────────────────────────────────────────────────────┐
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

A bridge equation module at Layer 1 builds AST nodes at Layer 2, validates them with the dimensional algebra, optionally raises/lowers indices using Layer 3 metric primitives, and can be numerically evaluated through Layer 4. Callers who only want metadata (status, known issues, references) never touch layers 2–4.

---

## Version History (v0.1.0 → v0.4.0)

UPT began as a typed bridge-equation catalog — a machine-readable encoding of the UPT specification's 40+ bridge equations, each carrying status, known-issue annotations, dimensional signatures, and literature references. Versions 0.1–0.2 established this catalog along with the `UniversalTensor` core class and the `PhysicalConstants` lookup table.

Version 0.3.0 added the dimensional AST: `ExprNode`, the `validate()` function, and the full SI dimension algebra. This made it possible to check whether a proposed bridge equation is dimensionally homogeneous — catching sign errors, missing factors, and undefined quantities that the spec had not yet resolved. Version 0.3.5 added the numerical-contraction backend: the `TensorEngine` interface, the zero-dependency `Float64ReferenceEngine`, and the `MathTSEngine` adapter backed by `@danielsimonjr/mathts-tensor`. Both engines satisfy a parameterized conformance suite that lives alongside the library.

Version 0.4.0 shipped the **connection layer**: the `christoffel()` formula builder, the `CovariantDerivativeNode` AST kind, and the `derivativeStrategy` field on `MetricTensorNode` for specifying how metric derivatives are computed. It also added automatic differentiation (`forwardGrad` / `reverseGrad` on `TensorEngine`), the `integrateGeodesic` RK4 solver, and two new bridge implementations (BE-51 gravitational lensing, BE-52 perihelion precession). The AD implementation in `Float64ReferenceEngine` uses the dual-number (forward-mode) and tape-recording (reverse-mode) patterns inline; `MathTSEngine` delegates to `@danielsimonjr/mathts-autograd`.

---

## Roadmap to v0.5.0+

The immediate roadmap continues the curvature / geodesics theme:

- **Symplectic integrator** — a Verlet or Forest-Ruth integrator as an alternative to RK4 for long-time geodesic integration where energy conservation matters.
- **Curvature layer** — Riemann tensor `R^ρ_{σμν}`, Ricci tensor `R_{μν}`, and Ricci scalar `R` as composites built from `christoffel()` trees. The curvature layer is the prerequisite for encoding the Einstein field equations as a UPT bridge.
- **Mercury geodesic** — a demonstration geodesic trace of Mercury's orbit in Schwarzschild spacetime, showing the perihelion advance predicted by BE-52 emerging from numerical integration rather than the analytic approximation.
- **BE-37 Shapiro delay (full)** — a complete numerical implementation of the Shapiro time-delay formula via the covariant eikonal approach. The current `evaluateBE37CovariantEikonalNumerical` in v0.4.0 handles the covariant phase; the full Shapiro integral requires the geodesic integrator to be wired in.

See `ARCHITECTURE.md` for detailed module design. See `COMPONENTS.md` for per-file component breakdown. See `DATAFLOW.md` for concrete data-flow traces through the system. See `API.md` for the public API reference.

---

**Maintained by**: Daniel Simon Jr.
