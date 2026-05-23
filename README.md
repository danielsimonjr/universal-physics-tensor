# Universal Physics Tensor Framework

**Computational framework for exploring unified physics through tensor formalism**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)

## Vision

Modern physics is fragmented across scales and domains: quantum mechanics governs the microscopic, general relativity explains the cosmic, and statistical mechanics bridges between them. Each regime has its own mathematics, assumptions, and approximations. **What if we could represent all of physics in a single mathematical object?**

The Universal Physics Tensor Framework (UPTF) proposes a rank-6 tensor **Π** living in a product space of:
- **Scale** (quantum → mesoscopic → classical → cosmological)
- **Force** (gravitational, electromagnetic, weak, strong, emergent)
- **Symmetry** (Poincaré, gauge, conformal, supersymmetry (`'susy'` in code))
- **Information** (von Neumann, Shannon, Kolmogorov, quantum discord)
- **Dimension** (dimensional analysis constraints)
- **Topology** (topological invariants)

This framework provides a computational laboratory for exploring:
- **Bridge equations** connecting different physical regimes
- **Emergence** of macroscopic laws from microscopic interactions
- **Information-geometry** connections between computation and spacetime
- **Unification** patterns across seemingly disparate phenomena

## Important Context

**I am not a physicist by trade.** I'm a systems engineer specializing in Test Program Set development for defense avionics. This project applies **engineering systems thinking** to theoretical physics questions.

Think of this as:
- **A computational framework** for exploring ideas
- **An engineering approach** to organizing physical knowledge
- **A collaboration platform** inviting physicists to validate/improve
- **NOT claiming to have "solved" or "unified" physics**
- **NOT peer-reviewed theoretical physics** (yet)

**Physicists:** Your expertise is welcomed and needed! Please contribute validation, corrections, and improvements.

## Quick Start

```bash
# Clone the repository
git clone https://github.com/danielsimonjr/universal-physics-tensor.git
cd universal-physics-tensor

# Install dependencies
npm install

# Build the project
npm run build

# Run the smoke test
node test-example.js
```

## Installation

```bash
npm install universal-physics-tensor
```

Or install directly from GitHub:

```bash
# Clone and build locally
git clone https://github.com/danielsimonjr/universal-physics-tensor.git
cd universal-physics-tensor
npm install
npm run build
```

```typescript
import { UniversalTensor } from 'universal-physics-tensor';
import type { PhysicalLaw, BridgeEquation } from 'universal-physics-tensor';

// Create a tensor instance
const tensor = new UniversalTensor({
  rank: 3, // Start simple
  scales: ['quantum', 'classical'],
  forces: ['electromagnetic', 'gravitational'],
});

// Register a known law (e.g., Schrödinger equation)
const schrodinger: PhysicalLaw = {
  id: 'schrodinger',
  name: 'Schrödinger Equation',
  equation: 'iℏ ∂ψ/∂t = Ĥψ',
  scales: ['quantum'],
  forces: ['electromagnetic'],
  symmetries: ['poincare'], // strictly Galilean for non-relativistic Schrödinger; 'poincare' used as placeholder (no 'galilean' in current Symmetry type)
  confidence: 1.0,
};
tensor.addLaw(schrodinger);

// Query laws applicable to the quantum regime
const quantumLaws = tensor.queryLaws({ scale: 'quantum' });
console.log(quantumLaws.map(l => l.name));
```

> **Note:** This example uses only the APIs currently implemented. Computable bridge equation solvers (e.g., a `BridgeEquations` class with `decoherence(...)` methods) are specified in Parts I–III but not yet implemented — see [Development Status](#development-status).

## Core Concepts

### The Universal Tensor

The tensor **Π** is decomposed (classified) into three components:

**Π = L + B + E**

Where:
- **L** (Laws): Known physics on the diagonal (QM, GR, SM, etc.)
- **B** (Bridges): Off-diagonal equations connecting regimes
- **E** (Emergence): Higher-order correlations producing emergent phenomena

> **Note on notation:** the "+" here denotes disjoint union of catalog entries (each tensor slot holds content of exactly one category), not algebraic addition. The type system enforces this disjointness via the `Cell` discriminated union in [`src/core/cell.ts`](src/core/cell.ts); see also [Part I §1.2](docs/specification/Part-I.md) for the spec-level treatment. Different slots may hold quantities of different physical dimensions (e.g., a Lagrangian density and a decoherence rate) and cannot be summed numerically.

### Bridge Equations

Bridge equations connect different physical regimes:

**Quantum ↔ Classical:**
- Decoherence Master Equation
- Mesoscopic Coherence Length

**Information ↔ Geometry:**
- Landauer-Wheeler Information-Geometry Equation
- Holographic Quantum Error Correction

**Microscopic ↔ Macroscopic:**
- Universal Emergence Equation
- Complexity-Entropy Production Relation

See [Part I](docs/specification/Part-I.md) and [Part II](docs/specification/Part-II.md) of the formal specification for the complete bridge equation catalog (Bridge Equations 11–52). Part III covers algorithmic implementation.

## Documentation

### Formal Specification (6-Part Series)
Complete theoretical foundation of the Universal Physics Tensor Framework:

- **[Part I: Foundation & Mathematical Framework](docs/specification/Part-I.md)** - Tensor structure, Π = L + B + E decomposition, Bridge Equations 11-20
- **[Part II: Extended Bridge Equation Catalog](docs/specification/Part-II.md)** - Bridge Equations 21-52 across condensed matter, quantum biology, emergent spacetime
- **[Part III: Computational Implementation](docs/specification/Part-III.md)** - Algorithms, information-theoretic bounds, ML integration
- **[Part IV: Validation & Implications](docs/specification/Part-IV.md)** - Experimental pathways, philosophical implications, applications
- **[Part V: Advanced Mathematics & Protocols](docs/specification/Part-V.md)** - Category theory extensions, validation protocols, algorithmic analysis
- **[Part VI: Deployment & Governance](docs/specification/Part-VI.md)** - Implementation strategies, applications, governance frameworks

### Planning & Development
- **[Development Plan](docs/planning/Development-Plan.md)** - Phased implementation roadmap
- **[Implementation Plan](docs/planning/Implementation-Plan.md)** - Technical architecture
- **[System Requirements](docs/planning/System-Requirements.md)** - Functional requirements

### Code Documentation
- **[Examples](examples/)** - Usage examples and code samples
- **[Documentation Index](docs/README.md)** - Complete documentation guide

## Benchmarks

UPT ships benchmark infrastructure via [Vitest bench](https://vitest.dev/guide/features.html#benchmarking):

```bash
npm run bench        # interactive run (median, p99, ops/sec)
npm run bench:ci     # verbose run for CI log capture
```

Baseline results are recorded in [`docs/architecture/benchmarks.md`](docs/architecture/benchmarks.md).
These are **correctness-first baselines, not optimization targets**. Comparative
analysis has since landed: v0.6.0's BR-2 `christoffelFn` flat-array refactor
delivered a measured **5-6× RK4 geodesic-integrator speedup** (see [CHANGELOG](CHANGELOG.md)).

## Development Status

**Current Version:** v0.6.0 (released 2026-05-20). Einstein field equation
closure + curvature classification + Shapiro investigation. See
[CHANGELOG](CHANGELOG.md) for full details.

### v0.6.0 — Einstein field equation closure + curvature classification (2026-05-20)

| Metric | Value |
|---|---|
| Bridge catalog | **42 / 42** (IDs 11-52, unchanged from v0.4.0) |
| Test suite | **1693** passing (179 files, 1 skip + 1 todo) |
| `tsc --noEmit` | clean |
| Breaking changes | `christoffelFn` / `schwarzschildChristoffelFn` now return `Float64Array(64)` (λ-major) instead of nested `number[4][4][4]`; `pderivNumericalFn` default `order` flipped `2 → 4` |

36 tasks across 4 phases:

- **Killing-vector machinery** — `KillingVectorNode` + `ConservedChargeNode`
  AST kinds; `verifyKillingEquation` and `evaluateConservedCharge` — the first
  structural encoding of a continuous symmetry and its Noether charge.
- **Einstein field equation closure** — `StressEnergyTensorNode`,
  `CosmologicalConstantNode`, `EinsteinFieldEquationNode`, plus
  `validateEinsteinFieldEquation` / `evaluateEinsteinEquationResidual`. Closes
  the gap BE-17's docstring had documented as impossible: matter-coupled
  `G_μν = κ T_μν` is now structurally encodable alongside the vacuum case.
- **Curvature classification** — `WeylTensorNode`, `KretschmannScalarNode`,
  `computeKretschmann`, and the `CurvatureCompositeNode<K,S>` factory extracted
  from the now-five-instance curvature pattern (`CURVATURE_KIND_REGISTRY`
  provides introspection across curvature node kinds).
- **Release-prep** — BR-2 `christoffelFn` flat-array refactor (BREAKING; **5-6×
  RK4 speedup**), `pderivNumericalFn` 4th-order default, and the PC-1.5 Shapiro
  residual-floor investigation (`docs/architecture/pc-1.5-shapiro-residual-floor.md`).

**Honest framing:** Per Decision #9, no bridge status pins were promoted from
`speculative` → `established` — structural encoding is necessary but not
sufficient; observational grounding must be established independently.

### Release history

Earlier milestones (full detail in [CHANGELOG](CHANGELOG.md)):

- **v0.5.1** (2026-05-19) — stability/hygiene patch; constants canonicalization,
  diagnostic-warning propagation through the curvature pipeline.
- **v0.5.0** (2026-05-18) — GR foundations: GL4 symplectic integrator, bisection
  perihelion finder, `RiemannTensorNode`, `ricci`/`einstein`/`bianchiResidual`
  helpers, BE-52 Mercury and BE-37 Shapiro activations.
- **v0.4.5/v0.4.6** (2026-05-17/18) — refactor + benchmark scaffold;
  `bench/` infrastructure with correctness-first baselines.
- **v0.4.0** (2026-05-15) — connection layer (Christoffel),
  automatic differentiation (`Float64ReferenceEngine` + `MathTSEngine`),
  bridges BE-51/BE-52 added (catalog 40 → 42).
- **v0.3.5** (2026-05-14) — numerical-contraction backend: `TensorEngine`
  interface, AST→engine lowering, BE-37 Shapiro-delay eikonal end-to-end.

### ✅ Milestone — catalog closed at 40/40 (v0.1.0, 2026-05-12)

> Historical snapshot of the v0.1.0 catalog-closure event. Counts below are
> v0.1.0-era figures, not current state — see the v0.6.0 table above for
> current numbers (42 bridges, 1693 tests).

First tagged release; the Tier-5 AST encoding rollout reached **full coverage**
with the Wave Z arc (commits `9cb299f` through `b358257`). Every bridge in
`src/bridges/index.ts` had a non-null `dimensional_signature`, an AST module in
`src/bridges/equations/`, a numerical evaluator with input-validation guards,
and per-bridge encoding tests. SemVer applies from this release onward.

| Metric (v0.1.0) | Value |
|---|---|
| AST encodings | **40 / 40** |
| `dimensional_signature === null` count | 0 |
| `status === 'invalid'` count | 0 |
| Test suite | **1161 / 1161** passing across 68 files |
| Status distribution | 6 established · 31 speculative · 3 highly-speculative · 0 invalid |

**Encoding patterns established during the rollout:** typed-stubs for
transcendentals and operator-valued interiors (log/exp/tensor
contractions absorbed into single dimensioned symbols);
squared-form to avoid fractional exponents (S², L²=Γt, Q_soft²);
ensemble-average stubs (Jarzynski ⟨exp(-βW)⟩); observational-bound
dimensionless ratios (GW170817 |c_GW-c|/c); integral primitive for
boundary integrals (BE-26 WKB, BE-44 soft-hair L²-norm); and **bridge
reformulation** — replacing broken or contested formulations with
canonical literature forms while preserving the bridge label
(precedent: BE-25 Penrose-Hameroff → IIT Φ_max; Wave Z applied this
to BE-16 → Landauer, BE-37 → Shapiro delay, BE-28 → Onsager σ).

**Cross-LLM validation:** the three highest-stakes Wave-Z reformulations
(BE-16 Landauer, BE-37 Shapiro, BE-28 Onsager — all promoted from
`status='invalid'`) were independently cross-validated by both OpenAI
o3 and Gemini Pro.

### Planned (post-closure)

- **v0.1.0 release** — trigger condition met; cut is a discretionary
  release decision documented in `v0.1.0-Release-Procedure.md`.
- **Grammar extensions for genuinely-deferred primitives:** Dirac-δ
  correlators (would enable a fuller BE-15 Hohenberg-Halperin Model A
  Langevin encoding), variational-δ operator (would enable a faithful
  MEPP encoding for BE-28 that captures the maximization claim).
  Neither is currently planned — both are scope expansions beyond the
  scalar-AST design.
- **Wider rank-6 tensor with numerical operations** — the
  catalog-encoding work has been the priority; tensor operators are the
  next conceptual layer.
- **Three.js / game-engine class visualization** in a separate repo
  (out of UPT scope per project decision; see
  `docs/planning/Future-Production-Hardening.md`).
- **Experimental data validation pipelines** — applicable now that
  catalog encoding is complete.
- **Collaboration with physics researchers** — the open question is
  recruiting them (see Contributing section).

## Contributing

Contributions are welcome, especially from:
- **Physicists** - Validate equations, suggest corrections, add physics insights
- **Mathematicians** - Verify formalism, improve rigor, suggest optimizations
- **Engineers** - Improve architecture, add features, optimize performance
- **Educators** - Create examples, improve documentation, develop tutorials

## Background & Philosophy

This project emerged from a simple question: **"If I had to design a test program set for all of physics, how would I structure it?"**

In Test Program Set (TPS) development for avionics, we create systems that:
- Interface across multiple domains (hardware, software, physics)
- Bridge different measurement scales (micro to macro)
- Maintain consistency across transformations
- Enable diagnostic troubleshooting

The same systems thinking applies to physics:
- Known laws = verified test procedures (diagonal elements)
- Bridge equations = interface adapters (off-diagonal elements)
- Emergence = higher-order system behaviors (correlations)
- Validation = experimental data matching (consistency checks)

This is an **engineer's approach to theoretical physics** — systematic, organized, and open to collaboration with domain experts.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Author

**Daniel Simon Jr.**
- Systems Engineer specializing in Test Program Set Development
- Electrical Engineering, University of Texas at Dallas
- Currently: Senior Test Engineer, Lockheed Martin
- Interests: Integrating Philosophy, Science, and Technology

**Connect:**
- GitHub: [@danielsimonjr](https://github.com/danielsimonjr)
- LinkedIn: [danielsimonjr](https://linkedin.com/in/danielsimonjr)
- Substack: [Simon Says!](https://danielsimonjr.substack.com)
- Website: [danielsimonjr.github.io/resume](https://danielsimonjr.github.io/resume/)

## Acknowledgments

This work builds on the shoulders of giants:
- Tensor formalism from differential geometry
- Bridge equations inspired by effective field theory
- Information-theoretic insights from quantum information theory
- Emergence concepts from condensed matter physics
- Systems thinking from engineering practice

---

**Disclaimer:** This is an exploratory computational framework, not peer-reviewed physics research. All results should be validated against experimental data and theoretical physics literature. Collaboration with professional physicists is actively sought to improve accuracy and rigor.
