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
node scripts/run-ts-tool.mjs tools/create-dependency-graph/create-dependency-graph.ts

# Scan a different project root
node scripts/run-ts-tool.mjs tools/create-dependency-graph/create-dependency-graph.ts --root=/path/to/project

# Include test-coverage analysis
node scripts/run-ts-tool.mjs tools/create-dependency-graph/create-dependency-graph.ts --include-tests
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

## Dependencies

This tool has one runtime dependency (`js-yaml`). It is installed locally
into `tools/create-dependency-graph/node_modules/`, which is gitignored
(see the root `.gitignore` entry `tools/**/node_modules`). Run `npm
install` in this directory before first use.
