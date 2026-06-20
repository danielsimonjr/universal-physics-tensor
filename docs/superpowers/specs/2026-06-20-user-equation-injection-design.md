# User-Equation Injection into the Map — Design

**Goal:** Let `upt map --equation "TARGET = EXPR"` drop a user-supplied equation
into the physics graph as a connected hypergraph node — showing where it lands
(which cluster / shared quantities) in both the visual map and a text summary —
without ever writing it into the adjudicated catalog.

**Status:** approved 2026-06-20 (brainstorming). Builds on the
[physics-map visualization](./2026-06-19-physics-map-visualization-design.md)
and [SVG output](./2026-06-19-physics-map-svg-output-design.md). Implements via
dev-workflow.

## Decisions (from brainstorming)

1. **Free-form equation string** input (not typed `name:dim` specs).
2. **Link by name + a "did you mean?" hint** for unmatched names (name-similarity,
   since free-form carries no dimensions).
3. **Visual + text** output: the violet user node renders in mermaid/dot/svg, and
   a text landing summary is printed (and to stderr alongside visual output).

### Consequences of the free-form choice (accepted)

- Hyphens are minus signs in math, so multi-word quantities are typed with
  underscores. To handle the catalog's **mixed** vocabulary (hyphenated
  `photon-energy` AND underscored `impact_parameter`), each symbol is resolved by
  trying the **literal** form first, then the `_`↔`-` swap, against the actual
  catalog quantity names. So `photon_energy` resolves to `photon-energy`, while
  `impact_parameter` resolves literally.
- The hint is **name-similarity**, not dimension-based (no dims available).

## CLI surface

```
upt map --equation "TARGET = EXPR" [--source=catalog|canonical|both]
        [--format=text|mermaid|dot|svg] [--proposed] [--out=PATH]
```

- LHS of the first `=` → the target quantity name (trimmed). RHS → an expression;
  its free variables — extracted by the active formula parser via
  `getFormulaParser()` (the **MathTS** expression parser when the optional peer is
  installed, else the built-in one; both already exclude `pi`/`tau`/numbers/
  functions) — minus the physics `CONSTANTS` (`hbar`, `c`, `G`, `k_B`, `ln2`,
  `epsilon_0`, `sigma_sb`, `b`, `h`, `8pi`, …) → the source quantities.
- Errors (exit 2): no `=`, empty target, RHS parse failure, or zero sources.

## Architecture

### Library: `src/composition/user-equation.ts` (public, pure)

```ts
export class UserEquationError extends Error {}

/** Parsed user equation: the target quantity and its source quantities, as
 *  written (underscores preserved; constants/numbers/functions removed). */
export interface UserEquation {
  readonly target: string;
  readonly sources: readonly string[];
  /** The original "TARGET = EXPR" text, for the junction label. */
  readonly text: string;
}

/** Parse "TARGET = EXPR" → {target, sources} using the active formula parser
 *  (MathTS when installed). Rejects with UserEquationError. */
export function parseUserEquation(equation: string): Promise<UserEquation>;

/** Resolve a user symbol to a catalog quantity name: literal match first, then
 *  the `_`↔`-` swap, against `catalogNames`; null if neither matches. */
export function resolveToCatalogName(
  name: string,
  catalogNames: ReadonlySet<string>,
): string | null;

/** Up to `k` catalog names most similar to `name` (token/substring + edit
 *  distance) — the "did you mean?" suggestions for an unmatched symbol. */
export function suggestQuantities(
  name: string,
  catalogNames: Iterable<string>,
  k?: number,
): string[];

/** Where the user junction landed, computed from a built VizModel. */
export interface EquationLanding {
  readonly isolated: boolean;
  readonly clusterSize: number;       // junctions in its component
  readonly anchored: boolean;         // shares a component with a law/established
  readonly sharedQuantities: readonly string[]; // names linking it to neighbours
  readonly connectedJunctionIds: readonly string[]; // other junctions in its cluster
}

export function equationLanding(model: VizModel, userJunctionId: string): EquationLanding;
```

No file I/O; pure functions over strings + an already-built `VizModel`.

### CLI: `bin/upt.mjs`

`mapCmd` gains `--equation`:
- Parse via `parseUserEquation`. Build the catalog name set from the chosen
  `graph` (every edge's source/target names). Resolve each source/target with
  `resolveToCatalogName` (use the resolved catalog name for connection; keep the
  literal for unmatched).
- Construct one `VizJunction`: `id: 'user-equation'`, `label: <the equation text>`,
  `status: 'user'`, `sources`/`target` = resolved names. Pass via `extraJunctions`
  (composes with `--proposed`).
- **Visual formats:** render as today; print the landing summary + any "did you
  mean?" hints to **stderr** (so stdout/`--out` stays pure SVG/DOT/Mermaid).
- **text format:** print the linkage map as today, then the user-equation landing
  summary + hints to stdout.
- `--equation` with no `--format` defaults to `text` (the landing summary is the
  whole point), so it is NOT an error (revises the svg-only stance — text is
  supported).

### Visualization: `src/composition/graph-viz.ts`

Add `'user'` to `VizStatus` and `STATUS_STYLE` (violet fill `#e9d8fd`, bold
stroke `#6b46c1`) + `STATUSES_IN_ORDER`. The user junction is quarantined exactly
like `proposed`: only ever an `extraJunction`, never written to `CATALOG_GRAPH` /
`CANONICAL_GRAPH` / `BRIDGE_EQUATIONS`.

## Testing

- **`tests/composition/user-equation.test.ts`**: `parseUserEquation` (target
  extraction; strips numbers/`pi`/functions/physics constants; underscores
  preserved; errors on no `=` / empty target / no sources); `resolveToCatalogName`
  (literal, `_`→`-`, `-`→`_`, miss); `suggestQuantities` (close names first);
  `equationLanding` (joins the right cluster via shared names vs isolated).
- **`tests/composition/graph-viz.test.ts`** (extend): a `user`-status junction
  renders with its classDef/color and never appears without an overlay.
- **`tests/cli/upt-map-format.test.ts`** (extend, dist-guarded): `--equation`
  text landing summary names the joined cluster; `--equation --format=dot`
  contains the user junction; an unknown name triggers a "did you mean?" line.
- Firewall: a test that injecting a user equation leaves `CATALOG_GRAPH` /
  `BRIDGE_EQUATIONS` lengths unchanged.

## Out of scope (YAGNI)

- Dimension-based hints / typed `name:dim` input (a later upgrade that would make
  the hint same-dimension and remove the hyphen workaround).
- Recovering a prefactor or numerically evaluating the user formula (that's what
  `upt derive`/`eval` already do; this feature is about graph placement).
- Persisting the user equation anywhere.
