# Physics-Map Visualization — Design

**Goal:** Generate a visual map of the UPT physics graph — quantities as nodes,
equations (laws / bridges / proposed) as junctions — as Mermaid and Graphviz DOT
**source text**, emitted by the existing `upt` CLI from live graph data.

**Status:** approved 2026-06-19 (brainstorming). Implements via dev-workflow.

---

## Problem & framing

UPT's physics "map" already exists as data: a directed **hypergraph** where nodes
are quantities (`mass`, `temperature`, `photon-energy`, …) and edges are equations
that take *n* source quantities → 1 target (`BridgeEdge`, `kind: 'bridge' | 'law'`).
Three layers are available: `CANONICAL_GRAPH` (textbook L-layer), `CATALOG_GRAPH`
(the 44→41-edge bridge catalog), and `PROPOSED_BRIDGES` (machine-derived,
unadjudicated). `linkageMap()` already computes the connected components, and the
map is **genuinely disjointed** (catalog ≈ 23 components: one anchored cluster of
~16, two small, ~20 isolated). There is no visual export today — `upt map` only
prints text.

This feature renders that graph visually, **honestly preserving the disjointedness**
rather than implying a unified theory.

## Decisions (from brainstorming)

1. **Generator over live data**, not a static figure — never drifts.
2. **Both Mermaid and DOT** — one model, two thin serializers.
3. **Bipartite representation** — quantities = nodes, equations = junction nodes;
   makes "equations as junctions" literal and handles n-ary edges faithfully.
4. **Clustered subgraphs** — each connected component in its own box; the isolated
   tail grouped into one box; the whole map in one artifact.
5. **Part of the `upt` CLI** (flags), not a separate `tools/` script. The physics
   map is a first-class view over catalog data, unlike `docs:deps` (meta-tooling
   over the source tree).
6. **Source-only, zero-dependency** — emit Mermaid/DOT text; SVG is a documented
   `dot -Tsvg` step. No new deps, no `child_process` in the shipped CLI.

## CLI surface

```
upt map  --source=catalog|canonical|both    (existing flag, reused)
         [--proposed]                         overlay PROPOSED_BRIDGES junctions
         [--format=text|mermaid|dot]          default text = current behavior, unchanged
         [--out=PATH]                          write to file; default stdout
```

- `--format=text` (default) leaves the current linkage-map printout **byte-for-byte
  unchanged** (backward compatible).
- `--format=mermaid` / `--format=dot` print the diagram source to stdout, or to
  `--out=PATH` when given.
- `--proposed` is opt-in; proposed junctions render visually quarantined
  (gray, dashed) and never appear without the flag (preserves the v0.24.0
  epistemic firewall).
- Unknown `--format=` value → friendly error + exit 1 (mirrors `--source`).

## Architecture

### Library: `src/composition/graph-viz.ts` (pure, public)

No file I/O — pure string production, like the rest of the composition layer.

```ts
/** Status drives node color/shape. Established/law = green; speculative = amber;
 *  highly-speculative = red; proposed = gray dashed. */
export type VizStatus = 'law' | 'established' | 'speculative' | 'highly-speculative' | 'proposed';

/** A normalized equation junction: n sources → 1 target. The render model's
 *  unit of "equation". Decouples rendering from BridgeEdge AND from the internal
 *  ProposedBridge type (the CLI converts each into this shape). */
export interface VizJunction {
  readonly id: string;          // graph id, e.g. 'be-42'
  readonly label: string;       // short human label
  readonly status: VizStatus;
  readonly sources: readonly string[];  // source quantity names (canonicalized)
  readonly target: string;              // target quantity name (canonicalized)
}

export interface VizOptions {
  readonly title?: string;
  /** Already-normalized extra junctions to overlay (e.g. proposed). */
  readonly extraJunctions?: readonly VizJunction[];
}

export interface VizModel {
  readonly junctions: readonly VizJunction[];
  /** Connected components (clusters), each a set of junction ids + quantity names. */
  readonly clusters: readonly VizCluster[];
  toMermaid(): string;
  toDot(): string;
}

/** Map a BridgeEdge → VizJunction (status from kind + confidence). */
export function edgeToJunction(edge: BridgeEdge): VizJunction;

/** Build the bipartite, clustered render model from a graph (+ optional overlay). */
export function buildVizModel(edges: readonly BridgeEdge[], opts?: VizOptions): VizModel;
```

- **Component grouping** reuses `linkageMap()` (internal sibling import) so the
  viz clusters match the authoritative connectivity; quantity names are
  canonicalized via `QUANTITY_IDENTIFICATIONS` (same as `linkageMap`). A test pins
  `model.clusters.length === linkageMap(edges).componentCount` to catch drift.
- **`edgeToJunction`** maps `kind: 'law'` → `'law'`; `kind: 'bridge'` → status from
  the catalog confidence (`established` / `speculative` / `highly-speculative`).
- **Isolated tail**: single-junction components are collected into one labelled
  cluster box so the figure stays compact.

### Serializers

- `toMermaid()` → a `flowchart LR` with one `subgraph` per cluster; quantities as
  `(rounded)` nodes, junctions as `[boxes]`; `classDef` per status for color;
  a legend subgraph. Deterministic ordering (largest cluster first; ids sorted)
  so snapshots are stable.
- `toDot()` → a `digraph` with `subgraph cluster_N { ... }` per component;
  `node[shape=ellipse]` quantities, `node[shape=box,style=filled]` junctions
  colored per status; a legend cluster.
- IDs are sanitized to valid Mermaid/DOT identifiers; labels are escaped.

### CLI: `bin/upt.mjs`

- `mapCmd` parses `--format` (default `text`) and `--out`.
  - `text` → unchanged path.
  - `mermaid` / `dot` → `buildVizModel(graph, { extraJunctions })`, call
    `toMermaid()`/`toDot()`, write to stdout or `--out` (the CLI is the only
    file-touching layer).
- `--proposed`: the CLI derives proposals through the existing
  `deriveProposedBridges` path and maps each `ProposedBridge` → `VizJunction`
  (`sources = governing names`, `target = target.name`, `status: 'proposed'`),
  passed as `extraJunctions`. The library never imports `proposed-bridges`
  (firewall + internal-module boundary intact).
- `--help` text updated; `cli/README.md` updated.

## Docs artifact

`docs/architecture/PHYSICS_MAP.md`: the embedded Mermaid of the `both` graph +
a link to a rendered SVG, under the honest caption — the map is *deliberately*
disjointed; connectivity is aspirational and most cross-cluster links are
dimensional coincidences (per CLAUDE.md). Generated by running the CLI; not a
bespoke tool.

## Testing

- **Library snapshot tests** (`tests/composition/graph-viz.test.ts`): emit
  Mermaid + DOT for a small fixed fixture graph and snapshot them.
- **Structural assertions** over the live graphs:
  - every junction maps to exactly one box; every source/target appears as a node;
  - `model.clusters.length === linkageMap(edges).componentCount`;
  - proposed junctions absent unless supplied via `extraJunctions`;
  - emitted ids are valid Mermaid/DOT identifiers (regex).
- **Mermaid syntax validation** of the emitted `both` graph via the Mermaid render
  tool (sanity that it parses).
- **CLI test** (`tests/cli/upt-map-format.test.ts`): `--format=text` output
  unchanged; `--format=mermaid`/`dot` produce parseable source; unknown format
  exits non-zero.

## Out of scope (YAGNI)

- SVG/PNG rendering inside `upt` (documented `dot -Tsvg` instead).
- Interactive web view.
- Per-edge LaTeX in the diagram (labels are short ids/names; LaTeX lives in the
  catalog).
- A `npm run docs:map` script / `tools/` entry (everything is `upt` flags).
