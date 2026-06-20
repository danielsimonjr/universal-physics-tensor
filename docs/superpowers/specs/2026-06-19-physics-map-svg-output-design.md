# Physics-Map SVG Output — Design

**Goal:** Add `upt map --format=svg` — render the physics graph to an actual SVG
graphic in one step, via a lazy-loaded pure-WASM Graphviz, without breaking the
package's zero-hard-dependency / no-`child_process` posture.

**Status:** approved 2026-06-19 (brainstorming). Builds on the
[physics-map visualization](./2026-06-19-physics-map-visualization-design.md).
Implements via dev-workflow.

## Decision

`--format=mermaid|dot` already emit diagram **source text**. SVG needs a real
layout engine. We render with **`@viz-js/viz`** (v3, MIT) — the real Graphviz
compiled to WebAssembly: same `dot` output, in-process, cross-platform, no native
binary, no subprocess. It is declared in **`optionalDependencies`** and
**lazy-loaded** with graceful fallback — exactly UPT's existing optional-peer
pattern (the 9 MathTS packages; `formula-registry.ts`).

Rejected: shelling out to a system `dot` binary (would add `child_process` to the
shipped CLI and require a user-installed Graphviz).

## Architecture

### Renderer module — `src/composition/graph-viz-svg.ts` (public)

Kept **separate** from `graph-viz.ts` so that module stays pure, synchronous, and
dependency-free (text only). The optional-renderer concern is quarantined here.

```ts
/** Render Graphviz DOT source to an SVG string using the optional @viz-js/viz
 *  peer. Throws an actionable error if the peer is not installed. @public */
export async function renderDotToSvg(dot: string): Promise<string>;

/** Thrown when @viz-js/viz is not installed. @public */
export class SvgRendererUnavailableError extends Error {}
```

- Implementation: `const { instance } = await import('@viz-js/viz'); const viz =
  await instance(); return viz.renderString(dot, { format: 'svg' });`
- On a failed dynamic import, throw `SvgRendererUnavailableError` with the message:
  `"SVG rendering needs the optional renderer: npm i @viz-js/viz (or use --format=dot | dot -Tsvg)"`.
- No file I/O (the CLI writes the file).

### CLI — `bin/upt.mjs`

`mapCmd` adds `svg` to the `--format` set:
- build the model → `model.toDot()` → `await renderDotToSvg(dot)` → write to
  `--out=PATH` (or stdout; SVG is text). `--source` / `--proposed` compose
  unchanged.
- Catch `SvgRendererUnavailableError` → print its message to stderr, exit 1.
- `--format` value set becomes `text | mermaid | dot | svg`; unknown still errors.

### Packaging

Add `"@viz-js/viz": "^3.28.0"` to `optionalDependencies`. The package keeps **zero
hard dependencies**; without the peer everything works except `--format=svg`,
which fails with the actionable message.

## Testing

- **`tests/composition/graph-viz-svg.test.ts`**: `renderDotToSvg(<small dot>)`
  returns a string starting with `<svg` / containing `</svg>` — guarded to skip
  if `@viz-js/viz` is not resolvable (CI installs the optionalDep, so it runs in
  CI). A unit check that the error message is actionable.
- **`tests/cli/upt-map-format.test.ts`** (extend): `--format=svg --out=<tmp>`
  writes a file beginning with `<svg`; `--format=svg` to stdout emits `<svg`
  (dist + peer guarded, same skip pattern as existing CLI tests).
- Public-surface test + snapshot updated for the two new exports.

## Docs

- `docs/architecture/PHYSICS_MAP.md`: `upt map --source=both --format=svg
  --out=both.svg` becomes the one-step path; the `dot -Tsvg` manual route stays
  documented as the no-install alternative.
- `cli/README.md` (format table, flags, worked example, exit codes), root README
  Quick Start line, `CHANGELOG.md [Unreleased]`.

## Out of scope (YAGNI)

- PNG/PDF output (SVG is the vector deliverable; convert downstream if needed).
- Bundling the WASM (kept an optional peer, not vendored).
- A `VizModel.toSvg()` method — rendering stays a standalone async function so the
  pure synchronous model is unchanged.
