# UPT v0.7+ Proposals

## Architectural Reframe Based on MathTS Codebase Investigation

**Source inspiration:** Fishman, White & Stoudenmire, *The ITensor Software Library for Tensor Network Calculations*, SciPost Phys. Codebases (2022), arXiv:2007.14822.

**Source grounding:** `danielsimonjr/MathTS` CHANGELOG.md (841 lines, through 2026-05-22 commits) and `danielsimonjr/universal-physics-tensor` README.md and CHANGELOG (through v0.6.0, 2026-05-20).

**Target:** Universal Physics Tensor Framework, v0.6.0 → v1.0.

**Status of this revision:** Replaces the prior `UPT-v0.7-Proposals.md` (May 22, 2026, earlier in this session). The earlier draft was written without direct knowledge of MathTS internals and underestimated what was already shipped — particularly around AD, expression compilation, and the workbook runtime. This revision is grounded in the MathTS CHANGELOG and reflects what is actually available to UPT today.

**Honest scope note:** I read the MathTS CHANGELOG end to end but was unable to fetch individual source files directly (GitHub `/tree/` URLs are robots-blocked; raw URLs require prior appearance in fetch results). Where this revision quotes function signatures, they are from the CHANGELOG’s “Added” entries, which name signatures precisely (e.g. `reverseGrad(fn, x, cotangent?) → { value, gradient }`). Where this revision sketches TypeScript code consuming MathTS APIs, the code is illustrative and would need light adjustment against the real `src/index.ts` exports of each package.

-----

## 0. Executive Summary

The single most important update from CHANGELOG investigation: **MathTS is not a backend layer beneath UPT. It is a peer-level TypeScript scientific computing platform of which UPT is one application.** This is structurally stronger than ITensor’s NDTensors:ITensor split, because MathTS is independently npm-published, independently versioned (17 tags across 12 packages), and able to grow other consumers without UPT becoming a coupling concern.

Practical consequence: nearly all v0.7 work happens inside the UPT repo, consuming what MathTS already ships. The earlier draft proposed eight changes split across the two repos with several “upstream MathTS first, then consume from UPT” sequences. None of those sequences are necessary. MathTS already has every primitive UPT needs.

|#|Proposal                                             |Layer                         |Effort        |Risk           |
|-|-----------------------------------------------------|------------------------------|--------------|---------------|
|1|Intelligent Index layer wrapping einsum-style tensors|UPT only                      |2-3 weeks     |Low            |
|2|Sparse semantic catalog (`Map<IndexTuple, Cell>`)    |UPT only                      |1-2 weeks     |Low            |
|3|Typed L/B/E discriminated union                      |UPT only                      |1 week        |Low            |
|4|Bridge DSL building on `compileExpr`                 |UPT only                      |2-3 weeks     |Medium         |
|5|`RegimeType` extensions, factory-tier idiom          |UPT only                      |2-3 weeks     |Medium         |
|6|Bridge composition research track                    |UPT only                      |research-track|High (research)|
|7|Bridge-as-workbook authoring via `.mtsw`             |UPT consumes `mathts-workbook`|2 weeks       |Low            |
|8|Bridge parameter AD via `DualTensor`/`TapedTensor`   |UPT consumes `mathts-autograd`|1-2 weeks     |Low            |

Total non-research engineering work: 11-16 weeks, all in the UPT repo.

-----

## 1. Background & Framing

### 1.1 What the MathTS CHANGELOG actually reveals

The MathTS CHANGELOG documents a much more substantial platform than the README abstracts:

- **`@danielsimonjr/mathts-tensor` v0.1.0 (2026-05-14):** rank-N Float64Array-backed dense `Tensor`. Exposed operations: `storage, construction, elementwise, identity, normInf, einsum, matMul, transpose, reshape`. Cross-package bridge: `Tensor.fromDenseMatrix()` and `Tensor.toDenseMatrix()`. Built as the second `TensorEngine` implementation for the UPT v0.3.5 numerical-contraction backend.
- **`@danielsimonjr/mathts-autograd` v0.1.0 (2026-05-15):** both forward and reverse mode AD. Concrete APIs: `forwardGrad` + `DualTensor` (dual-number forward, full Jacobian assembly with shape `[...y.shape, ...x.shape]`, row-major) and `reverseGrad` + `Tape` + `TapedTensor` (signature `reverseGrad(fn, x, cotangent?) → { value, gradient }` with `gradient.shape = x.shape`). Built as the AD adapter for the UPT v0.4.0 connection-layer + AD backend.
- **`@danielsimonjr/mathts-expression` v0.2.0** (security release, 2026-05-01): full 16-node AST (`ConstantNode`, `SymbolNode`, `OperatorNode`, `FunctionNode`, `AssignmentNode`, `FunctionAssignmentNode`, `ArrayNode`, `ObjectNode`, `IndexNode`, `AccessorNode`, `RangeNode`, `BlockNode`, `ConditionalNode`, `ParenthesisNode`, `RelationalNode`, plus the `Node` base). Tree-walking compiler routes through `getSafeProperty` / `setSafeProperty` / `getSafeMethod`. Pre-compile AST validator rejects `AssignmentNode`, `FunctionAssignmentNode`, and `FunctionNode` calls to forbidden builtins (`import`, `createUnit`, `evaluate`, `parse`, `compile`, `simplify`, `derivative`, `help`, `chain`) by default. Each node class has its own dedicated test file (42 new test files in the unreleased typed-layer expansion).
- **`@danielsimonjr/mathts-workbook` v0.1.2:** reactive `.mtsw` notebook runtime with dependency graph and cell types (`code`, `markdown`, `data`, `test`). Code cells now route through `evaluate()` from `@danielsimonjr/mathts-functions` for sandboxed execution. Data cells parse content as YAML/JSON via `executeData()`. CLI shipped: `mtsw run`, `mtsw validate`, `mtsw graph`, `mtsw new`.
- **`@danielsimonjr/mathts-functions`:** 500+ functions across 17 categories, 242/273 mathjs factories activated across 18 tiers, symbol-based typed dispatch surviving minification/esbuild, 52 CODATA physical constants (tier 19), `evaluate('sin(pi/2)')` working end-to-end.
- **`@danielsimonjr/mathts-parallel`:** ComputePool with worker pool dispatch, SharedArrayBuffer support, per-op benchmarked thresholds (`matmul` and `spectrogram` are the only operations that consistently beat sequential below ~65,536-element scales).
- **Dual WASM strategy:** AssemblyScript (SIMD) and Rust (FFT, eigendecomposition, SVD). Rust WASM measured 2.5×–34× faster than JS across matmul/dot/vecadd/det benches. SHA-384 manifest verification gates load.
- **Quality posture:** 12/12 packages building green, 0 ESLint errors across all 10 linted packages, 1766+ tests, 0 import cycles after the recent cleanup. Source-file coverage 27.0% and rising; security-hardened expression sandbox; opt-in worker pool timeouts.

### 1.2 The architectural insight to land

The earlier draft framed MathTS as analogous to NDTensors — a numerical layer beneath an “intelligent” layer that UPT provides. That mapping was wrong in two ways:

**First**, MathTS isn’t just numerical primitives. It includes expression parsing, AST compilation, a sandboxed evaluator, AD over tensors, parallel dispatch, multiple WASM toolchains, and a reactive notebook runtime. It’s closer to `NDTensors + JAX + SymPy parser + Observable runtime`, all in TypeScript.

**Second** — and more importantly — MathTS is operationally independent of UPT in a way NDTensors isn’t independent of ITensor. NDTensors lives in the ITensors.jl repo, on the ITensors.jl release cycle, maintained by the ITensor team. The ITensor paper (Section 9) describes the team’s intention to eventually ship NDTensors as a separate library; that is still future work. MathTS is already separate: distinct repo, distinct npm scope (`@danielsimonjr/mathts-*`), distinct release cadence, and able to grow other consumers (any TypeScript scientific computing project) without UPT becoming a coupling concern.

This means the layering question for UPT is not “what should MathTS take on?” It’s “what should UPT add that’s specifically about the physics, given a peer-level math platform exists?” The answer is: axis identity, semantic typing of catalog entries, dimensional flux rules, regime extensions, bridge composition, and a workbook-as-artifact authoring story. All of these are physics-shaped, all of them belong in UPT, and none of them require MathTS changes.

### 1.3 What this revision does *not* propose

- **Not** upstreaming an “Intelligent Index” type to MathTS. MathTS’s einsum-labeled positional tensors are the right scope for a general math platform; physics-axis-identity is a UPT-specific opinion.
- **Not** upstreaming a `BlockSparseTensor` to MathTS. UPT’s sparsity need is for a *catalog* of physics entries indexed by 6 axes, not for sparse numerical contractions. That’s a TypeScript `Map`, not a sparse tensor.
- **Not** turning UPT into a numerical tensor network library. UPT remains a typed physics catalog with composition operations. MathTS provides the numerical substrate when bridges have numerical content.
- **Not** rebranding UPT. The “Universal Physics Tensor” name is a useful organizing metaphor; the architecture proposed here makes the metaphor precise (multi-indexed semantic structure, identity-bearing axes, typed cells, flux-constrained sparsity) without overclaiming numerical tensor-network semantics.

-----

## 2. Proposal 1 — Intelligent Index Layer Wrapping Einsum-Style Tensors

**Target version:** v0.7
**ITensor reference:** Section 3 (Index Objects), Section 8.2 (QN Index)
**Layer:** UPT only

### 2.1 What MathTS provides today

From the tensor 0.1.0 release notes: `Tensor` is rank-N, Float64Array-backed, with `einsum` for contraction. Einsum semantics mean indices are *positional* in storage and *labeled by short strings* at contraction time. There’s no persistent identity on a `Tensor`‘s indices — calling `t.einsum('ij,jk->ik', other)` doesn’t carry any tag beyond the four character labels in the einsum string.

This is the right scope for a general math platform. It mirrors NumPy/PyTorch/JAX. It’s not the right primitive for UPT’s catalog, where axes have *physical meaning* — Scale is not Force is not Symmetry — and putting `'sf'` as an einsum label loses that meaning at the first contraction.

### 2.2 What UPT layers on top

A `UniversalIndex` type that wraps a MathTS tensor axis with persistent identity, axis tagging, and physical-content metadata:

```typescript
// src/core/index.ts
import { Tensor } from '@danielsimonjr/mathts-tensor';

export type UniversalIndexId = string & { readonly __brand: 'UniversalIndexId' };

export type AxisName =
  | 'scale' | 'force' | 'symmetry'
  | 'information' | 'dimension' | 'topology';

export interface UniversalIndex<Axis extends AxisName> {
  readonly id: UniversalIndexId;      // generated via crypto.randomUUID()
  readonly axis: Axis;
  readonly name: string;               // 'quantum', 'electromagnetic'
  readonly tags: ReadonlySet<string>;
  readonly limits?: string;            // 'ℏ → 0', 'T → 0'
  readonly notes?: string;
}

export const Axes = {
  scale: {
    quantum:      makeIndex('scale', 'quantum',      { limits: 'ℏ finite' }),
    mesoscopic:   makeIndex('scale', 'mesoscopic',   { tags: ['decoherent'] }),
    classical:    makeIndex('scale', 'classical',    { limits: 'ℏ → 0' }),
    cosmological: makeIndex('scale', 'cosmological', { tags: ['gr-regime'] }),
  },
  force: { /* ... */ },
  // ...
} as const;
```

For bridge entries that have *numerical content*, the bridge wraps a MathTS `Tensor` with a mapping from einsum labels to UniversalIndices:

```typescript
// src/core/labeled-tensor.ts
import { Tensor } from '@danielsimonjr/mathts-tensor';

export class LabeledTensor<Labels extends Record<string, UniversalIndex<AxisName>>> {
  constructor(
    readonly tensor: Tensor,             // owned by MathTS
    readonly labels: Labels,              // 'i' -> Axes.scale.quantum, 'j' -> Axes.force.electromagnetic, ...
  ) {}

  // Contract by axis-identity, not by einsum string
  contract(other: LabeledTensor<any>): LabeledTensor<any> {
    const sharedAxes = findSharedAxes(this.labels, other.labels);
    const einsumStr = buildEinsumString(this.labels, other.labels, sharedAxes);
    const result = Tensor.einsum(einsumStr, this.tensor, other.tensor);
    return new LabeledTensor(result, buildResultLabels(this.labels, other.labels, sharedAxes));
  }
}
```

The point: UPT contributes *identity* and *physical meaning* on top of MathTS’s positional einsum semantics. MathTS doesn’t need to change.

### 2.3 What this catches

- **Typos at construction time:** `Axes.scale.quantam` is a TypeScript error.
- **Cross-axis errors:** passing `Axes.force.weak` where the type signature demands `UniversalIndex<'scale'>` is a type error.
- **Identity-aware merging:** two catalogs that both reference `Axes.scale.quantum` get the same Index object, not two strings that happen to be equal.
- **Wrong-axis contractions:** trying to contract a Scale-labeled axis against a Force-labeled axis in a `LabeledTensor` operation is caught before the einsum string is built.

### 2.4 Acceptance criteria

- [ ] `UniversalIndex<Axis>` type with branded ID.
- [ ] `Axes` registry populated with current v0.6 scales (4), forces (5), symmetries (4 + placeholder for `galilean`/`susy` cleanup), information measures (4), dimensional categories, topological classes.
- [ ] `LabeledTensor` class with `contract()`, `transpose(axisMap)`, `reshape()` operations that compose down to MathTS `Tensor.einsum` / `Tensor.transpose` / `Tensor.reshape`.
- [ ] All 42 v0.6 bridges re-register through Index objects.
- [ ] Codemod in `tools/migrate-strings-to-indices.ts` for downstream consumers.

-----

## 3. Proposal 2 — Sparse Semantic Catalog Storage

**Target version:** v0.7
**ITensor reference:** Section 6 (Tensor Storage Layer), Section 8.3 (QN ITensor) — *for design inspiration; the implementation is unrelated*
**Layer:** UPT only

### 3.1 What the earlier draft got wrong

The earlier `UPT-v0.7-Proposals.md` framed this as “block-sparse storage for Π,” reasoning by analogy to ITensor’s QN-conserving block-sparse tensors. That analogy was misleading. UPT’s Π is *not* a numerical tensor doing block-sparse contractions. It is a sparse *catalog* of typed semantic entries indexed by 6 axes. The right primitive is `Map<IndexTuple, Cell>`, not a sparse tensor.

The flux-constraint idea still applies, but it constrains which cells can be *populated* in the catalog, not which numerical blocks are non-zero.

### 3.2 What MathTS provides today

Not directly relevant. `mathts-matrix` has SparseMatrix (CSC), but that’s for numerical sparse linear algebra. `mathts-tensor` is dense-only. UPT’s sparse catalog is a TypeScript `Map`, not anything MathTS ships.

### 3.3 Design

```typescript
// src/core/tensor.ts
type IndexTuple = readonly [
  UniversalIndex<'scale'>,
  UniversalIndex<'force'>,
  UniversalIndex<'symmetry'>,
  UniversalIndex<'information'>,
  UniversalIndex<'dimension'>,
  UniversalIndex<'topology'>,
];

type TupleKey = string;  // canonicalized stringification of IndexTuple IDs

export class UniversalTensor {
  private cells = new Map<TupleKey, Cell>();
  private fluxRules: FluxRule[] = [];

  add(cell: Cell): void {
    const tuple = cellCoordinate(cell);
    for (const rule of this.fluxRules) {
      const result = rule.check(tuple, cell);
      if (!result.ok) throw new FluxViolation(rule.name, result.reason, cell);
    }
    this.cells.set(canonicalize(tuple), cell);
  }

  populatedCells(): Cell[] { return Array.from(this.cells.values()); }
  populatedCount(): number { return this.cells.size; }
  unpopulatedNeighborhoods(): IndexTuple[] { /* compute "near-miss" cells with one axis varied */ }
}

interface FluxRule {
  name: string;
  check: (tuple: IndexTuple, cell: Cell) => { ok: true } | { ok: false; reason: string };
}
```

Three v0.7 flux rules:

1. **Dimensional consistency.** A cell at coordinates including `Axes.dimension.<d>` must have its `dimensional_signature` consistent with `d`. v0.6 already records signatures on all 42 bridges — this promotes them from documentation to enforced constraint.
1. **L/B/E type-coordinate matching.** A `LawEntry` is diagonal in regime (from-scale equals to-scale, if applicable). A `BridgeEntry` is off-diagonal. An `EmergenceEntry` spans multiple scale slots.
1. **Causality (warning only in v0.7).** A bridge `from: quantum, to: classical` is allowed without comment. A bridge `from: cosmological, to: quantum` without an explicit time-reversal annotation emits a warning; promoting to error happens in v0.8 after the catalog is audited.

### 3.4 What sparse semantic storage buys

- **Honesty about coverage.** `Π.populatedCells()` returns the actual catalog (42 entries today), not 9,600+ mostly-empty slots in a dense address space.
- **Linear iteration cost.** Queries scale with populated count, not address-space volume.
- **`unpopulatedNeighborhoods()` becomes a research roadmap.** Cells that are one-axis-removed from a populated cell are candidate areas for new bridges — high-prior cells for “what might fit here?”

### 3.5 Acceptance criteria

- [ ] `UniversalTensor` with `Map`-backed sparse catalog.
- [ ] All 42 v0.6 bridges fit through the three v0.7 flux rules.
- [ ] `populatedCells()`, `populatedCount()`, `unpopulatedNeighborhoods()`, `fluxDiagnostics()` exposed.
- [ ] Query benchmarks: single-coordinate lookup O(1) average; full iteration O(populated).

-----

## 4. Proposal 3 — Typed L+B+E Discriminated Union

**Target version:** v0.7
**ITensor reference:** Section 6 (Tensor Storage Layer)
**Layer:** UPT only

### 4.1 Problem statement

Unchanged from the earlier draft: UPT’s README contains the honest footnote that “+” in `Π = L + B + E` is disjoint union, not algebraic. That’s currently a *prose* commitment. It should be a *type* commitment, so the compiler refuses to ask numerical questions of incommensurable entries.

### 4.2 Design

```typescript
interface CellBase {
  readonly id: string;
  readonly confidence: 'established' | 'speculative' | 'highly-speculative';
  readonly dimensional_signature: DimensionalSignature | null;
  readonly references: Reference[];
  readonly provenance: Provenance;
}

interface LawEntry extends CellBase {
  readonly kind: 'law';
  readonly equation: AstNode;
  readonly regime: UniversalIndex<'scale'>;
}

interface BridgeEntry extends CellBase {
  readonly kind: 'bridge';
  readonly equation: AstNode;
  readonly from: AxisCoordinate;
  readonly to: AxisCoordinate;
  readonly limit?: LimitProcedure;
}

interface EmergenceEntry extends CellBase {
  readonly kind: 'emergence';
  readonly equation: AstNode;
  readonly correlationOrder: number;
  readonly substrate: UniversalIndex<'scale'>[];
  readonly emergent: UniversalIndex<'scale'>;
}

type Cell = LawEntry | BridgeEntry | EmergenceEntry;
```

The `equation: AstNode` slot here is UPT’s existing v0.6 AST (`KillingVectorNode`, `EinsteinFieldEquationNode`, `StressEnergyTensorNode`, `CurvatureCompositeNode<K,S>`, etc.). These are UPT-internal node types and do not inherit from `mathts-expression`‘s `Node` base. That’s fine — they’re physics-shaped AST nodes designed around physics primitives, and they coexist alongside MathTS expression nodes rather than extending them. Proposal 4 covers the bridge between the two AST worlds.

Operations dispatch on `kind`:

```typescript
function evaluate(cell: Cell, ctx: Context): EvaluationResult {
  switch (cell.kind) {
    case 'law':       return evaluateLaw(cell, ctx);
    case 'bridge':    return evaluateBridge(cell, ctx);
    case 'emergence': return evaluateEmergence(cell, ctx);
  }
}
```

Critically, there is *no* `add(cell1: Cell, cell2: Cell): Cell`. The “+” in `Π = L + B + E` becomes:

```typescript
function compose(L: LawEntry[], B: BridgeEntry[], E: EmergenceEntry[]): UniversalTensor {
  const Π = new UniversalTensor();
  for (const cell of [...L, ...B, ...E]) Π.add(cell);
  return Π;
}
```

### 4.3 Acceptance criteria

- [ ] `Cell` discriminated union defined; switch-exhaustive at every consumption site (lint-enforced via `@typescript-eslint/switch-exhaustiveness-check`).
- [ ] No public API exposes `cell1 + cell2`.
- [ ] README footnote about “+” reframed: “the type system encodes this — see `src/core/cell.ts`.”

-----

## 5. Proposal 4 — Bridge DSL Building on `compileExpr`

**Target version:** v0.7 (was v0.8 in earlier draft; pulled forward because the heavy lifting is in MathTS)
**ITensor reference:** Section 7.1 (OpSum and AutoMPO)
**Layer:** UPT only, thin layer on `@danielsimonjr/mathts-expression`

### 5.1 What MathTS provides today

From the 0.1.2 release notes and the 2026-05-01 security release: `@danielsimonjr/mathts-expression` v0.2.0 ships with a full 16-node AST, `parse()` and `compileExpr()` exposed, sandboxed `evaluate()`, and a pre-compile AST validator. The 42 new test files in the unreleased typed-layer expansion cover every node class individually. The grammar handles operators, function calls, accessors, ranges, conditionals, and blocks.

### 5.2 What UPT layers on top

A `BridgeSum` builder that uses `mathts-expression`’s `parse()` for equation syntax, then attaches UPT-specific compilation passes (dimensional check, axis-coordinate validation, confidence assignment):

```typescript
// src/dsl/bridge-sum.ts
import { parse } from '@danielsimonjr/mathts-expression';
import { Axes } from '../core/registry';

export class BridgeSum {
  private drafts: BridgeDraft[] = [];

  add(draft: BridgeDraft): void { this.drafts.push(draft); }

  compile(options: CompileOptions): BridgeEntry[] {
    return this.drafts.map(d => {
      const ast = parse(d.equation);  // mathts-expression
      const dimCheck = checkDimensionalSignature(ast, d.parameters);
      if (!dimCheck.ok && options.dimensionalCheck === 'strict') {
        throw new DimensionalError(d.name, dimCheck.reason);
      }
      const validateAxes = checkAxisCoordinates(d.from, d.to);
      if (!validateAxes.ok) throw new AxisError(d.name, validateAxes.reason);
      return {
        kind: 'bridge',
        id: d.name,
        from: d.from, to: d.to,
        equation: liftToUptAst(ast),   // bridges mathts AST → UPT physics AST
        dimensional_signature: dimCheck.signature,
        confidence: d.confidence,
        // ...
      };
    });
  }
}

// Usage:
const bridges = new BridgeSum();
bridges.add({
  name: 'decoherence-master',
  from: Axes.scale.quantum,
  to:   Axes.scale.classical,
  equation: 'dρ/dt = -i/ℏ * commutator(H, ρ) - γ * sum(L_k * ρ * dagger(L_k) - 0.5 * anticommutator(dagger(L_k) * L_k, ρ))',
  parameters: { γ: { dim: '1/time' } },
  confidence: 'established',
  references: [...],
});

const compiled = bridges.compile({ dimensionalCheck: 'strict', duplicateNames: 'error' });
```

The two key pieces of work that live in UPT:

1. **`liftToUptAst(astFromMathts)`** — translates a mathts-expression AST into UPT’s v0.6 physics AST. For most bridges this is a structural rewrite (Operator → OperatorNode, FunctionNode for `commutator`/`anticommutator`/`dagger` → UPT’s algebra-of-operators nodes). For curvature-heavy bridges (BE-52 Mercury, BE-37 Shapiro) this is a richer lift into `CurvatureCompositeNode`, `RiemannTensorNode`, etc.
1. **`checkDimensionalSignature(ast, parameters)`** — walks the AST against UPT’s dimensional algebra. v0.6 already has dimensional signatures; this is the compile-time enforcement of them.

### 5.3 Why this is much smaller than the earlier draft suggested

The earlier draft proposed building an `eq` template literal parser as new UPT work. That was wasteful — MathTS already ships a parser tested at 16-node granularity with each node class having its own dedicated test file. UPT contributes the bridge-specific compilation passes; the parser stays in MathTS.

### 5.4 Acceptance criteria

- [ ] `BridgeSum.add()` + `compile()` operational.
- [ ] `liftToUptAst()` round-trips every operator class used in the v0.6 42-bridge catalog.
- [ ] Dimensional check at compile time, with errors pointing to the source location.
- [ ] Round-trip test: every v0.6 bridge can be re-expressed as a `BridgeDraft`, compiled, and shown equivalent under `evaluate` to its current hand-built AST form.

-----

## 6. Proposal 5 — `RegimeType` Extension System

**Target version:** v0.8
**ITensor reference:** Section 10.2 (Defining Custom Local Hilbert Spaces, Listing 1)
**Layer:** UPT only, following MathTS factory-tier idiom

### 6.1 What MathTS provides today

From the 0.1.2 release notes: “Factory activation infrastructure: shared scope (`functions/src/factories/scope.ts`), barrel export (`functions/src/factories/index.ts`).” 242/273 mathjs factories activated across 18 tiers, with expression node constructors injected into the factory scope. The system is *load-time*: tiers establish the dependency order, and once activation completes the scope is fixed.

This is a *design idiom* UPT should adopt, not a *runtime extension mechanism* UPT can directly use. The factory tier system was designed for build-time activation of statically-known mathjs functions, not for runtime registration of third-party regime definitions.

### 6.2 What UPT contributes

A regime extension API that follows the factory-pattern *aesthetic* (declarative registration, dependency-ordered initialization, namespaced scope) but supports runtime extension:

```typescript
// in a downstream package: @user/qbio-uptf-regimes
import { defineRegime } from 'universal-physics-tensor';

defineRegime({
  axis: 'scale',
  name: 'quantum-biological',
  tags: ['mesoscopic', 'wet', 'finite-temperature'],
  limits: 'T ≈ 300K, ℏ finite',
  notes: 'Mesoscopic quantum effects in biological systems',
  participatesIn: ['quantum-classical-bridge', 'thermal-decoherence-bridge'],
  fluxRules: [{
    name: 'biological-temperature',
    check: (cell) => {
      const T = extractTemperature(cell);
      return (T >= 273 && T <= 320)
        ? { ok: true }
        : { ok: false, reason: `T = ${T}K outside biological range [273, 320]K` };
    },
  }],
});

// After this call, Axes.scale.quantum_biological is registered and can be
// used in BridgeSum and UniversalTensor.add() across the rest of the application.
```

Same pattern for symmetries, information measures, dimensional categories, topological classes:

```typescript
defineSymmetry({
  name: 'galilean',
  generators: [...],
  irreps: [...],
});
// Replaces the v0.6 'poincare' placeholder for non-relativistic Schrödinger.
```

Internally, `defineRegime` adds to the `Axes.scale` namespace at module load time. Provenance is recorded — every regime carries `registered_by`, `package`, `version`, so when two regimes collide or when a catalog is shared across teams, the lineage is auditable.

### 6.3 Acceptance criteria

- [ ] `defineRegime`, `defineSymmetry`, `defineInformationMeasure`, `defineDimensionalCategory`, `defineTopologicalClass` operational.
- [ ] Example downstream package in `examples/extending-uptf/`.
- [ ] All v0.6 placeholder cases (`galilean`, `susy`) re-expressed as built-in extensions via the same API the third-party extensions use.
- [ ] Provenance recorded and surfaced on the cells that consume the extension.

-----

## 7. Proposal 6 — Bridge Composition: The Research Track

**Target version:** v0.9 (preamble in v0.8)
**ITensor reference:** Section 7.3 (MPS and MPO Operations, MPO × MPO contraction)
**Layer:** UPT only

### 7.1 Unchanged from the earlier draft

The composition research track is unchanged because it is a pure physics question that doesn’t depend on what MathTS provides. The full Phase A/B/C/D framing from the earlier draft applies.

A brief recap:

- **Phase A (v0.8 prep):** define what composition means — dimensional consistency, limit-procedure ordering, confidence propagation.
- **Phase B (v0.9 alpha):** calibrate against known cases (BBGKY hierarchy → Vlasov → Boltzmann; semiclassical WKB; fluctuation-dissipation).
- **Phase C (v0.9 beta):** stress-test against known-subtle cases (order-of-limits, non-commuting truncations).
- **Phase D (v1.0+):** use the engine to *propose* candidate bridges as hypotheses for physicist review.

### 7.2 What changes given MathTS

One small refinement: if bridges with numerical content can be *evaluated* (via the Tensor + autograd path), composition can be calibrated quantitatively, not just structurally. A composite bridge that should reproduce a known cross-scale derivation can be checked against the analytic result through numerical AD-enabled evaluation. This makes Phase B’s calibration tighter than originally envisioned.

### 7.3 References worth reading alongside

- Coecke & Kissinger, *Picturing Quantum Processes* (2017).
- Spivak, *Category Theory for the Sciences* (2014).
- Baez & Stay, *Physics, Topology, Logic and Computation: A Rosetta Stone* (2010).
- Fong & Spivak, *An Invitation to Applied Category Theory* (2019).

### 7.4 Acceptance criteria

Research acceptance criteria, not engineering:

- [ ] Composition rule defined and published as a UPT internal spec document.
- [ ] Calibration on ≥3 known cross-scale derivations.
- [ ] Stress-test on ≥2 known-subtle cases.
- [ ] Public RFC milestone post inviting physicist commentary before promoting any composite bridge to the catalog.

-----

## 8. Proposal 7 — Bridges as Workbooks (Reframed)

**Target version:** v0.9
**ITensor reference:** Section 10.1 (HDF5 Format) — *for design inspiration; the implementation is unrelated*
**Layer:** UPT consumes `@danielsimonjr/mathts-workbook`

### 8.1 What the earlier draft proposed

The earlier draft proposed a `.uptf.json` schema with SymPy/Mathematica exporters as the canonical bridge artifact format. That framing was wrong in the same way the “tensor backend” framing was wrong — it assumed UPT had to build its own infrastructure when MathTS already shipped something better.

### 8.2 What MathTS provides today

`@danielsimonjr/mathts-workbook` is a YAML-based reactive notebook runtime with:

- Cell types: `code`, `markdown`, `data` (YAML/JSON parsed via `executeData()`), `test`.
- Dependency graph with reactive execution.
- Code cells execute via sandboxed `evaluate()` from `mathts-functions` (changed in the unreleased section: “cells are evaluated via `evaluate()` from `@danielsimonjr/mathts-functions` instead of a raw `new Function()`”).
- CLI: `mtsw run <file>`, `mtsw validate <file>`, `mtsw graph <file>`, `mtsw new <name>`.

### 8.3 The reframe: bridges as workbooks

A bridge becomes a `.mtsw` workbook. The workbook contains:

1. A `markdown` cell with prose physics context and references.
1. A `data` cell with metadata (from/to coordinates, confidence, parameters, dimensional signature).
1. A `code` cell that constructs the bridge AST using UPT’s DSL (Proposal 4).
1. `test` cells that exercise the bridge’s evaluator against known limits, calibration cases, or analytic results.

```yaml
# bridges/decoherence-master.mtsw
version: '1.0'
metadata:
  title: 'Decoherence Master Equation'
  id: 'decoherence-master'
  confidence: 'established'

cells:
  - markdown: |
      # Decoherence Master Equation

      Bridges the **quantum** regime to the **classical** regime via Lindblad-form
      decoherence of off-diagonal density matrix elements...
    id: prose

  - data: |
      from: { axis: scale, name: quantum }
      to:   { axis: scale, name: classical }
      parameters:
        - { name: γ, dim: '1/time', physical: 'decoherence rate' }
      references:
        - doi: 10.1103/RevModPhys.75.715
    id: meta

  - code: |
      import { BridgeSum } from 'universal-physics-tensor';
      import { Axes } from 'universal-physics-tensor/registry';
      const bridges = new BridgeSum();
      bridges.add({
        name: 'decoherence-master',
        from: Axes.scale.quantum,
        to:   Axes.scale.classical,
        equation: 'dρ/dt = -i/ℏ * commutator(H, ρ) - γ * sum(L_k * ρ * dagger(L_k) - 0.5 * anticommutator(dagger(L_k) * L_k, ρ))',
        parameters: { γ: { dim: '1/time' } },
        confidence: 'established',
      });
      export const bridge = bridges.compile({ dimensionalCheck: 'strict' })[0];
    id: build

  - test: |
      import { bridge } from '#build';
      import { evaluate } from 'universal-physics-tensor';
      // Limit check: γ → 0 should recover unitary evolution
      const unitaryLimit = evaluate(bridge, { γ: 0, H: testHamiltonian, ρ: testState });
      assert(matchesUnitaryEvolution(unitaryLimit));
    id: verify-unitary-limit
    depends_on: [build]
```

### 8.4 Why this is better than the original JSON-schema proposal

- **Physicists author bridges in the same notebook idiom they use for other computational physics work.**
- **Reactive dimensional checking.** A physicist editing the equation sees the dimensional check update in real time, before commit.
- **Tests live alongside the bridge.** Calibration limits, analytic comparisons, and known-residual diagnostics are part of the bridge artifact.
- **CLI ergonomics already shipped.** `npx mtsw run bridges/decoherence-master.mtsw` runs the whole thing — build, verify, report — without UPT inventing its own CLI.
- **Versionability.** Bridges are text files in a Git repo. Diffs are readable.

### 8.5 JSON schema reduced to an export format

A `.uptf.json` representation is still useful — for ingestion into third-party physics tools that don’t speak `.mtsw`. But it becomes a *serialization* of the workbook output, not the canonical authoring format. The schema is generated from the compiled bridge, not the other way around.

### 8.6 SymPy/Mathematica interop

These remain useful but become a `tools/export-sympy/` script that walks compiled bridges and emits per-bridge Python modules. The compilation passes through the workbook runtime; the export is downstream.

### 8.7 Acceptance criteria

- [ ] All 42 v0.6 bridges re-expressed as `.mtsw` workbooks.
- [ ] CI runs `mtsw run` on every bridge workbook; build + verify pass.
- [ ] SymPy exporter ships in `tools/export-sympy/`.
- [ ] Documentation: “Authoring a bridge: a workbook walkthrough” tutorial.

-----

## 9. Proposal 8 — Bridge Parameter Differentiation via `mathts-autograd`

**Target version:** v0.9
**ITensor reference:** Section 13 (Future Directions, ChainRules.jl integration) — *MathTS is ahead of this*
**Layer:** UPT consumes `@danielsimonjr/mathts-autograd`

### 9.1 What the earlier draft proposed

The earlier draft framed AD as a long-horizon v1.0+ research direction: implement forward-mode dual numbers, build reverse-mode tape recording, plan a WebAssembly bridge for heavy cases. All of that is unnecessary — `mathts-autograd` v0.1.0 already shipped.

### 9.2 What MathTS provides today

From the 2026-05-15 release notes, exact APIs:

- **Forward mode:** `forwardGrad(fn, x)` plus `DualTensor`. Returns full Jacobian assembly with shape `[...y.shape, ...x.shape]`, row-major. Built on dual numbers.
- **Reverse mode:** `reverseGrad(fn, x, cotangent?) → { value, gradient }` with `gradient.shape = x.shape`. Built on tape (`Tape` + `TapedTensor`).

Built as the AD adapter for UPT v0.4.0’s connection-layer + AD backend, so the integration plumbing already exists at some level.

### 9.3 What UPT layers on top

A `differentiable()` decorator/wrapper for bridge entries that exposes parameters as differentiable inputs:

```typescript
// src/diff/differentiable.ts
import { forwardGrad, reverseGrad, DualTensor, TapedTensor } from '@danielsimonjr/mathts-autograd';

export function differentiableEvaluator(
  bridge: BridgeEntry
): (params: ParameterValues, inputs: TensorInputs) => DifferentiableResult {
  return (params, inputs) => {
    const fn = (paramTensor: Tensor) => {
      const reified = reifyParameters(paramTensor, bridge.parameters);
      return evaluateBridge(bridge, { ...reified, ...inputs });
    };
    return {
      value: fn(packParameters(params)),
      gradient: (mode: 'forward' | 'reverse') =>
        mode === 'forward'
          ? forwardGrad(fn, packParameters(params))
          : reverseGrad(fn, packParameters(params)).gradient,
    };
  };
}

// Usage:
const diff = differentiableEvaluator(decoherenceBridge);
const { value, gradient } = diff({ γ: 0.05 }, { H: testHamiltonian, ρ: testState });
const sensitivity = gradient('reverse');  // ∂(dρ/dt) / ∂γ
```

This is roughly 1-2 weeks of work: the wrapping, the parameter packing/unpacking, and tests that the gradients match analytic derivatives on bridges where the analytic form is known (BE-52 Mercury, BE-37 Shapiro, the curvature composites).

### 9.4 What this unlocks

- **Parameter inference.** Given an observed perihelion precession, what’s the best-fit value of a bridge’s free parameter? Gradient descent through the bridge.
- **Sensitivity analysis.** Which bridge parameters most affect a downstream prediction? Reverse-mode AD answers immediately.
- **Confidence calibration.** When a bridge is registered with placeholder confidence, AD can compute “how much would a single high-precision measurement shift this confidence?”

### 9.5 Acceptance criteria

- [ ] `differentiableEvaluator()` operational on the v0.6 catalog.
- [ ] Forward-mode gradients verified against analytic derivatives on ≥3 bridges with known closed forms.
- [ ] Reverse-mode gradients verified on the same set.
- [ ] Tutorial: “Bridge parameter inference with mathts-autograd.”

-----

## 10. Honest Limitations

### 10.1 What this revision didn’t verify directly

I read the MathTS CHANGELOG end to end but couldn’t fetch individual source files (GitHub `/tree/` URLs are robots-blocked; raw file URLs require prior appearance in fetch results). All function signatures and API shapes in this revision are extracted from CHANGELOG “Added” entries, which name signatures precisely but not exhaustively. Before any of these proposals lands a PR, the relevant `src/index.ts` of each consumed MathTS package should be read directly to catch:

- Subtle differences between CHANGELOG-quoted signatures and actual exports.
- Helper exports that didn’t make the CHANGELOG (utility functions, type guards, factory variants).
- Internal vs. public API distinctions that affect what UPT can rely on long-term.

The proposals are structurally sound; the code sketches will need light adjustment against real exports.

### 10.2 What’s still genuinely uncertain

Three questions remain that even a careful CHANGELOG read can’t answer:

1. **Does `mathts-expression`’s AST tolerate downstream node extensions?** The 16-node set is unit-tested individually, but I haven’t seen whether the `Node` base class is designed for inheritance or sealed. UPT’s existing v0.6 physics AST nodes don’t extend it, which is fine, but a tighter integration (e.g. `BridgeEquationNode extends mathts.Node`) would require this answer.
1. **What’s the dimensional analysis story at the `Tensor` level?** `mathts-functions` ships 52 CODATA constants, but the README doesn’t mention a units/dimensional-analysis system on `Tensor`. UPT’s dimensional flux rules (Proposal 2) might benefit from upstream support, or might be cleanest as a UPT-only layer.
1. **How does `mathts-autograd` interact with WASM-accelerated kernels?** Reverse-mode AD on a tape requires reverse passes through every op. If a bridge evaluates through Rust WASM (FFT, eig, SVD), do those operations have AD rules? The CHANGELOG describes AD on Tensor operations generically but doesn’t enumerate which ops are covered.

These are exactly the questions a 30-minute code read of the relevant `src/` directories would answer. They don’t block v0.7 work — Proposals 1, 2, 3, 4, 5 are clearly viable from what’s known. They would refine Proposals 7 and 8.

### 10.3 What this still won’t make UPT

- **Not** a physics theory. The bridges in UPT inherit their physical content from peer-reviewed sources; the framework organizes and composes that content.
- **Not** a numerical tensor network library in the ITensor sense. UPT’s Π remains a typed catalog with composition operations, not a state being factorized.
- **Not** a substitute for physicist peer review. Cross-LLM validation (v0.1.0 notes cite o3 and Gemini Pro) is a useful sanity check, not peer review. The workbook authoring story (Proposal 7) is partly designed to lower the friction so actual peer review becomes feasible.

### 10.4 The hardest problem isn’t technical

Per the v0.6 README’s own framing: “Collaboration with physics researchers — the open question is recruiting them.” Nothing in this revision solves that. Proposals 4 (DSL), 5 (regime extensions), and 7 (workbooks) lower the *technical* contribution barrier. The *social* barrier — getting a working physicist’s attention in a field already saturated with quirky frameworks — remains separate. Worth thinking about in parallel: a partnership with a single sympathetic research group as an anchor case, or aiming the first paper at the Physics Education Research / Mathematical Physics methods community rather than the foundational-unification community.

-----

## 11. Sequencing

### v0.7 — “Foundation Consolidation”

All proposals at this version are UPT-internal, with no MathTS upstream dependencies:

- Proposal 1: Intelligent Index layer wrapping einsum-style tensors.
- Proposal 2: Sparse semantic catalog (`Map<IndexTuple, Cell>`) with three flux rules.
- Proposal 3: Typed `Cell` discriminated union.
- Proposal 4: Bridge DSL building on `mathts-expression.compileExpr`.

**Theme:** every existing capability still works, but the architecture is now what it should be. No new physics, structural rigor and contribution-readiness.

### v0.8 — “Extension Surface Expansion”

- Proposal 5: `RegimeType` extension system.
- Proposal 6 Phase A: define what bridge composition means.
- Promote v0.7 flux rules from warning to error after a catalog audit pass.

**Theme:** third-party regimes become possible; composition research begins.

### v0.9 — “Authoring and Calibration”

- Proposal 7: Bridges-as-workbooks. All v0.6 bridges re-expressed in `.mtsw`.
- Proposal 8: Bridge parameter differentiation via `mathts-autograd`.
- Proposal 6 Phases B-C: calibration on known derivations, stress-test on known-subtle cases.

**Theme:** physicists can author bridges in workbooks; bridges can be parameter-differentiated; composition is calibrated.

### v1.0 — “Methodological Publication”

- Proposal 6 Phase D: hypothesis generation enabled.
- White paper: “UPT as a Compositional Framework for Cross-Regime Physics Claims.”
- First targeted outreach to a sympathetic physics group.

**Theme:** UPT moves from “interesting engineering project” to “candidate methodological contribution.”

-----

## 12. The MathTS:UPT Layering Insight (Standalone Section)

This insight emerged late in the analysis and deserves its own section because it changes how UPT should be marketed and how its development priorities are sequenced.

### 12.1 The pattern

|Layer                                     |ITensor world                    |UPT world                                                       |
|------------------------------------------|---------------------------------|----------------------------------------------------------------|
|Numerical primitives, contraction, storage|`NDTensors` (in ITensors.jl repo)|`@danielsimonjr/mathts-tensor` (separate repo)                  |
|AD over those primitives                  |(future via ChainRules.jl)       |`@danielsimonjr/mathts-autograd` (already shipped)              |
|Expression parsing, compilation           |(n/a — Julia syntax)             |`@danielsimonjr/mathts-expression`                              |
|Domain-language compilation               |`OpSum`/`AutoMPO` (in ITensor)   |UPT’s `BridgeSum` (Proposal 4)                                  |
|Domain semantic types                     |`Index` with tags, QN system     |UPT’s `UniversalIndex`, L/B/E typing                            |
|High-level algorithms                     |DMRG, MPS, PEPS                  |UPT’s composition (Proposal 6), parameter inference (Proposal 8)|
|Authoring artifact                        |Julia scripts                    |`.mtsw` workbooks (Proposal 7)                                  |

### 12.2 Why this is structurally stronger than ITensor’s split

ITensor’s NDTensors lives in the ITensors.jl repo, on the ITensors.jl release cycle, maintained by the same team. The team has stated (Section 9 of the paper) that they want to eventually ship NDTensors as a separate library for other consumers, but it isn’t there yet.

MathTS is already there. Distinct repo, distinct npm scope, distinct release cadence, 17 release tags as of May 2026, no UPT dependency in the package metadata of any `@danielsimonjr/mathts-*` package. A second consumer of MathTS — a quantitative finance team, a computational biology group, a graphics application doing geometry — could adopt the platform without ever touching UPT.

This means UPT inherits stability from a peer-versioned dependency. Breaking changes in MathTS go through their own SemVer process. UPT pins a MathTS version, upgrades on its own timeline, and doesn’t drag MathTS’s release schedule.

### 12.3 What this implies for UPT’s external framing

The current v0.6 README positions UPT as a “computational framework for exploring unified physics through tensor formalism.” That’s accurate but understates the stack. A revised framing might be:

> UPT is a TypeScript catalog and composition engine for cross-regime physics claims, built on the MathTS scientific computing platform. It contributes axis-identity, semantic typing of bridge equations, dimensional flux rules, and a workbook authoring story for community-contributed physics regimes.

The “built on MathTS” framing matters because it gives a sympathetic physicist a concrete platform-level reference point (“oh, like Observable + JAX, in TypeScript”) rather than an abstract methodological claim.

-----

## 13. References

### ITensor — architectural source

- Fishman, M., White, S. R., & Stoudenmire, E. M. (2022). *The ITensor Software Library for Tensor Network Calculations.* SciPost Phys. Codebases. arXiv:2007.14822.
- ITensor C++ repository: <https://github.com/ITensor/ITensor>
- ITensors.jl Julia repository: <https://github.com/ITensor/ITensors.jl> (active development)

### Tindall et al. — the paper that opened this conversation

- Tindall, J., Mello, A. F., Fishman, M., Stoudenmire, E. M., & Sels, D. (2026). *Dynamics of disordered quantum systems with two- and three-dimensional tensor networks.* Science 392, 868–872. arXiv:2503.05693.

### MathTS — the platform UPT is built on

- Simon, D. Jr. (2026). MathTS: TypeScript scientific computing platform. <https://github.com/danielsimonjr/MathTS>.
- MathTS CHANGELOG: <https://github.com/danielsimonjr/MathTS/blob/main/CHANGELOG.md>.
- npm packages: `@danielsimonjr/mathts-core`, `mathts-tensor`, `mathts-autograd`, `mathts-expression`, `mathts-functions`, `mathts-matrix`, `mathts-parallel`, `mathts-workbook`, `mathts-wasm`, `mathts-compat`, `mathts-typed-function`, `mathts-workerpool`.

### UPT — the framework being revised

- Simon, D. Jr. (2026). Universal Physics Tensor Framework. <https://github.com/danielsimonjr/universal-physics-tensor>.
- UPT Specification, Parts I-VI: see `docs/specification/`.

### Applied category theory — for Proposal 6

- Coecke, B., & Kissinger, A. (2017). *Picturing Quantum Processes.* Cambridge University Press.
- Spivak, D. I. (2014). *Category Theory for the Sciences.* MIT Press.
- Baez, J. C., & Stay, M. (2010). Physics, topology, logic and computation: A Rosetta Stone. In *New Structures for Physics* (pp. 95–172). Springer.
- Fong, B., & Spivak, D. I. (2019). *An Invitation to Applied Category Theory.* Cambridge University Press.

-----

## 14. Closing Note

The two most important updates from this revision:

1. **MathTS already provides every primitive UPT needs.** v0.7 work happens entirely in the UPT repo. No upstream MathTS PRs are required, no coordination overhead, no upstream-first sequencing.
1. **UPT inherits stability from a peer-level platform.** Framing UPT as “built on MathTS” rather than “with MathTS as an internal backend” is more accurate and gives external collaborators a concrete reference point for the stack underneath the physics layer.

If only one proposal lands, make it Proposal 1 (Intelligent Indices). Every other proposal builds on or benefits from typed identity-bearing axes.

If only one bold proposal lands, make it Proposal 6 (Composition). That’s where UPT could contribute something genuinely new methodologically, and where the engineer’s discipline of systematic catalog-and-compose-and-validate maps best onto a research program physicists themselves don’t yet have a clean version of.

The path from v0.6 to v1.0 is much shorter than the earlier draft suggested, because MathTS is much further ahead than the earlier draft assumed.