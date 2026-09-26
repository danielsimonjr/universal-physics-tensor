# `tools/create-dependency-graph`

Utility script for generating dependency-graph documentation for the
`universal-physics-tensor` (UPT) codebase.

> Adapted from the `memoryjs` sister repo. The tool is generic — it
> discovers project structure from the filesystem and has no UPT-specific
> hardcoding — so the retrofit was limited to documentation plus a fix for
> the C-9 generator bug (comment text leaking into re-export symbol rows).

## create-dependency-graph.ts

Scans the codebase and generates comprehensive dependency documentation.

**Setup** (one-time — `node_modules/` is gitignored, not committed):

```bash
cd tools/create-dependency-graph
npm install
```

**Usage:**

```bash
# Run via npm script from the UPT repo root (recommended)
npm run docs:deps

# Or run directly with the repo's TypeScript runner wrapper
bun tools/create-dependency-graph/create-dependency-graph.ts

# Scan a different project root
bun tools/create-dependency-graph/create-dependency-graph.ts --root=/path/to/project

# Include test-coverage analysis
bun tools/create-dependency-graph/create-dependency-graph.ts --include-tests
```

The project root defaults to the current working directory. `npm run
docs:deps` passes `--root=.`, so it scans whichever repo it is invoked from.

**Output** (written to `docs/architecture/`):

- `DEPENDENCY_GRAPH.md` — human-readable Markdown documentation
- `dependency-graph.json` — machine-readable JSON data structure
- `dependency-graph.yaml` — compact YAML (~40% smaller than JSON)
- `dependency-summary.compact.json` — minified summary for LLM context
- `unused-analysis.md` — potentially unused files and exports
- `TEST_COVERAGE.md` + `test-coverage.json` — only with `--include-tests`

**Features:**

- Scans all TypeScript files in `src/`
- Parses imports and exports (including type-only imports and re-exports)
- Categorizes files into logical modules from the directory structure
- Detects circular dependencies, distinguishing runtime from type-only
- Generates statistics (file count, export count, LOC, etc.)
- Produces a Mermaid visual dependency graph

## API-surface report (`--api-surface`, opt-in)

`api-surface.ts` is a separate, repository-neutral module. It reads source text (no TypeScript
compiler API) and reports each exported declaration: kind, `async`, type parameters, parameter
list, declared return type, the stability tag and summary of the attached JSDoc block, and the
line. It follows `export … from`, `export *` (never `default`), `export * as ns`, and local export
lists of imported bindings from an entry file to the declaring files.

```bash
bun tools/create-dependency-graph/create-dependency-graph.ts --root=. \
  --api-surface=<file.json> [--api-entry=src/index.ts] [--stability-tags=public,internal,…]
```

| Flag | Meaning | Default |
|---|---|---|
| `--api-surface=<file>` | Write the report to `<file>` (resolved against the working directory). Without this flag nothing is extracted, and every standard output is byte-identical. | off |
| `--api-entry=<path>` | Entry file whose public surface is resolved, relative to the root. | `src/index.ts` |
| `--stability-tags=a,b` | Whole-word JSDoc tags that count as stability markers; the last one in the attached block wins. | `public,internal,experimental,beta,alpha` |

Output schema (`schemaVersion: 1`, no timestamps, so two runs on one tree are byte-identical):

```text
{
  schemaVersion: 1,
  entry: string,
  stabilityTags: string[],
  summary: { symbols, runtime, typeOnly, byKind: {kind: n}, byStability: {tag|"untagged": n}, undocumented },
  symbols: [{                      // the entry's surface, sorted by name (code-unit order)
    name, declaredName, declaredIn, via: string[], typeOnly: boolean,
    kind: "function"|"class"|"interface"|"type"|"enum"|"const"|"variable"|"namespace",
    line, async, typeParams: string|null, params: string|null, returnType: string|null,
    stability: string|null, documented: boolean, summary: string|null
  }],
  unresolved: [{ from, specifier, name? }],   // relative specifiers or names that did not resolve
  external:   [{ from, specifier }],          // bare (package) specifiers; not followed
  files: [{ path, exports: [ /* same fields, with localName, per scanned source file */ ] }]
}
```

Limits: only top-level declarations (brace depth 0); `export =` and `export default <expression>`
are not reported; a signature is the source text as written, whitespace-normalized, not a checked
type. Tests: `tests/tools/api-surface.test.ts`.

## Dependencies

This tool has one runtime dependency (`js-yaml`). It is installed locally
into `tools/create-dependency-graph/node_modules/`, which is gitignored
(see the root `.gitignore` entry `tools/**/node_modules`). Run `npm
install` in this directory before first use.
