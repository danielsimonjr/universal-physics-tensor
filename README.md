# Universal Physics Tensor Framework

**Computational framework for exploring unified physics through tensor formalism**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/danielsimonjr/universal-physics-tensor/actions/workflows/ci.yml/badge.svg)](https://github.com/danielsimonjr/universal-physics-tensor/actions/workflows/ci.yml)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0+-blue)](https://www.typescriptlang.org/)

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

# Bridge-inference CLI (no TypeScript needed) — `upt` subcommands:
npm run upt -- explain hawking-temperature mass=1.989e30   # explain a built-in quantity
npm run upt -- priority                                    # triage speculative bridges
npm run upt -- audit                                       # derive the bridges by dimensions
# ...and YOUR OWN equations:
npm run upt -- eval "hbar*c^3/(8*pi*G*M*k_B)" hbar=1.054571817e-34 c=299792458 G=6.6743e-11 M=1.989e30 k_B=1.380649e-23
npm run upt -- derive period:time length:length gravity:acceleration --formula "2*pi*sqrt(length/gravity)"
#   → period ∝ length^0.5·gravity^-0.5 ; formula MATCHES, recovered prefactor ≈ 6.2832 (2π)
npm run upt -- help
# Once published, the same commands run via `npx universal-physics-tensor <cmd>`.
# (`npm run explain` and `npm run bridge-priority` remain as aliases.)
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

> **Note on notation:** the "+" here denotes disjoint union of catalog entries (each tensor slot holds content of exactly one category), not algebraic addition. The type system enforces this disjointness via the `Cell` discriminated union in [`src/core/cell.ts`](src/core/cell.ts); `UniversalTensor.populatedCells()` is the canonical way to enumerate the populated catalog as typed `Cell` values. See also [Part I §1.2](docs/specification/Part-I.md) for the spec-level treatment. Different slots may hold quantities of different physical dimensions (e.g., a Lagrangian density and a decoherence rate) and cannot be summed numerically.

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

See [Part I](docs/specification/Part-I.md) and [Part II](docs/specification/Part-II.md) of the formal specification for the complete bridge equation catalog (Bridge Equations 11–54). Part III covers algorithmic implementation. The catalog is also published as a reviewable JSON artifact at [`data/bridge-catalog.json`](data/bridge-catalog.json).

### Composing Bridges (v0.8.0)

Bridges are edges in a typed quantity graph, and compatible edges
**compose** — with an exact dimensional check at the junction, validity
domains carried through, and confidence demoted to the weakest link:

```typescript
import { composeEdges, be42Edge, be16Edge, M_SUN_KG } from 'universal-physics-tensor';

// Hawking temperature (M → T_H) ∘ Landauer bound (T → E_min)
const erasureCost = composeEdges(be42Edge, be16Edge);
erasureCost.evaluate({ mass: M_SUN_KG }); // ≈ 5.9e-31 J — E_min(M) = ℏc³ln2/(8πGM)
erasureCost.confidence;                   // 'highly-speculative' (min of the operands)
```

That derived relation — the minimum erasure cost at a black-hole
horizon — is the framework's first **derived** (rather than encoded)
literature-anchored result, pre-registered before implementation and
pinned to relErr ≤ 10⁻¹² (see [Part IX](docs/specification/Part-IX-Composition.md)
and `docs/planning/v0.8.0-Design.md`). A computable **membership
criterion** (a bridge's endpoint quantities must differ in regime) now
adjudicates the catalog — 36 bridges · 5 not-a-bridge · 3 contested —
with rejections recorded in a reviewable negative catalog
(`src/bridges/rejected.ts`).

## Documentation

### Formal Specification
Complete theoretical foundation of the Universal Physics Tensor Framework —
see the **[specification index](docs/specification/README.md)** for the full
reader's map and the **[spec revision history](docs/specification/CHANGELOG.md)**
for how the documents evolved.

- **[Part I: Foundation & Mathematical Framework](docs/specification/Part-I.md)** - Tensor structure, Π = L + B + E decomposition, Bridge Equations 11-20
- **[Part II: Extended Bridge Equation Catalog](docs/specification/Part-II.md)** - Bridge Equations 21-54 across condensed matter, quantum biology, emergent spacetime
- **[Part III: Computational Implementation](docs/specification/Part-III.md)** - Algorithms, information-theoretic bounds, ML integration
- **[Part IV: Validation & Implications](docs/specification/Part-IV.md)** - Experimental pathways, philosophical implications, applications
- **[Part V: Advanced Mathematics & Protocols](docs/specification/Part-V.md)** - Category theory extensions, validation protocols, algorithmic analysis
- **[Part VI: Deployment & Governance](docs/specification/Part-VI.md)** - Implementation strategies, applications, governance frameworks
- **Supplements** - [Part VII: Tensor Algebra](docs/specification/Part-VII-Tensor-Algebra.md) · [Part VIII: Metric Layer](docs/specification/Part-VIII-Metric-Layer.md) · [Part IX: Composition](docs/specification/Part-IX-Composition.md) · [Part X: Curvature & Field Equations](docs/specification/Part-X-Curvature-and-Field-Equations.md)

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

**Current version:** v0.7.3 on npm
([`universal-physics-tensor`](https://www.npmjs.com/package/universal-physics-tensor));
the **v0.8.0 candidate** (composition graph + GW170817 confrontation +
catalog adjudication) is implemented and awaiting tag — see the
[CHANGELOG](CHANGELOG.md) `[Unreleased]` block.

| Metric | Value |
|---|---|
| Bridge catalog | **44** (IDs 11-54) — 8 established · 33 speculative · 3 highly-speculative · 0 invalid; membership-adjudicated **36 bridges · 5 not-a-bridge · 3 contested**; **41-edge composition graph** (full migration, 131 centralized quantity nodes) with a bridge-inference suite — **identifiability classifier**, **retrodiction harness**, **Buckingham-π enumerator**, unified by an **`explainQuantity`** entry point |
| Test suite | **2336** passing (5 skipped, 1 todo; incl. property-based algebra tests) — gated by CI |
| `tsc --noEmit` | clean |
| GR validation anchors | BE-52 Mercury perihelion relErr 1.8×10⁻⁷ · BE-37 Shapiro delay relErr ~2×10⁻⁸ |
| First derived relation | E_min(M) = ℏc³ln2/(8πGM) from BE-42 ∘ BE-16, relErr ≤ 10⁻¹² (pre-registered CT-1) |
| First data confrontation | GW170817 → BE-36: recomputed bounds +6.5×10⁻¹⁶ / −3.1×10⁻¹⁵ vs published +7×10⁻¹⁶ / −3×10⁻¹⁵ |
| Core capability | Dimensional AST validator (21 node kinds) · curvature + Einstein-field-equation layers · GL4 symplectic geodesic integrator · composition graph (`composeEdges`) |

Release history lives in the **[CHANGELOG](CHANGELOG.md)** — from the v0.1.0
catalog-closure milestone (40/40 AST encodings via the Wave A→Z encoding arc,
with cross-LLM validation of the highest-stakes reformulations) through the
GR-foundations releases (v0.4.x–v0.6.0) to the v0.7.x series. The formal
spec's own revision ledger is at
[docs/specification/CHANGELOG.md](docs/specification/CHANGELOG.md).

### Roadmap

- **Grammar extensions for genuinely-deferred primitives** — Dirac-δ
  correlators (would enable a fuller BE-15 Hohenberg-Halperin Model A
  Langevin encoding) and a variational-δ operator (would enable a faithful
  BE-28 MEPP encoding that captures the maximization claim). Both are scope
  expansions beyond the scalar-AST design; neither is currently scheduled.
- ~~Catalog → quantity-graph migration~~ — **DONE (v0.11, 2026-06-11)**:
  the full 41-edge graph is live, gated by the name-collision
  namespacing rule (`CompositionAliasError` + reviewable
  `SOURCE_ALIAS_DISPOSITIONS`); the ~90 new quantity-naming judgments
  are the standing physicist-review surface.
- **More data confrontations** — GW170817 → BE-36 and the BE-23
  Planckian-dissipation check (Legros et al. 2019, honest
  aggregate-level encoding) have shipped; upgrading BE-23 to the
  per-material α table is the next bounded step.
- **Three.js / game-engine class visualization** in a separate repo
  (out of UPT scope per project decision; see
  `docs/planning/Future-Production-Hardening.md`).
- **Collaboration with physics researchers** — six bounded review tasks
  are waiting in [CONTRIBUTING.md](CONTRIBUTING.md), including the three
  contested membership adjudications (BE-44/46/50).

## Contributing

See **[CONTRIBUTING.md](CONTRIBUTING.md)** — it lists bounded,
no-code-required physics-review tasks (catalog adjudications, encoding
checks against the literature, quantity-identification reviews) plus
the dev quick-start, and explains the JSON catalog review surface.

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
