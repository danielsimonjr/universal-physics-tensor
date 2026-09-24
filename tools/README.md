# `tools/` — vendored utility tools

Standalone developer utilities adapted from the `memoryjs` sister repo and
retrofitted for `universal-physics-tensor`. Each tool is self-contained in
its own subdirectory.

| Tool | Purpose |
|---|---|
| `create-dependency-graph/` | Scans `src/` and writes dependency-graph docs to `docs/architecture/`. Run via `npm run docs:deps`. One dep (`js-yaml`). |
| `plan-doc-audit/` | Audits `docs/planning/` checkboxes against shipped `src/` symbols (stub-aware). Run via `npm run audit:plans` (dry-run) or `-- --apply`. Zero deps. |
| `formalref-axiom-gate/` | Re-measures the axioms of every `lean4-physlib` formalRef with the probes in `formal/physlib/`, including a positive control. Run via `bun run atlas:formal-gate -- --physlib <checkout>`. Needs Lean; zero npm deps. |
| `citation-quote-check/` | Matches every quoted span and locator of the `// source:` comments in `src/bridges/index.ts` against downloaded source texts, with a negative control per check. Run via `bun run atlas:quote-check -- --sources <dir> [--write]`. Needs pdftotext, pdftoppm and tesseract; zero npm deps. |
| `criterion3-export/` | Exports the blind-labeler inputs for pre-registration criterion 3 (`docs/research/criterion3/`): the canonical corpus and the frozen items with opaque ids, a leakage report with a control, and the SHA-256 freeze. Run via `bun run atlas:c3-export [-- --copy <dir>]`. Zero npm deps. |
| `chunking-for-files/` | Splits large markdown/JSON/TypeScript files into editable chunks and merges them back. Zero deps. |
| `compress-for-context/` | Compresses files (JSON/YAML/MD/CSV/code/etc.) to fit LLM context windows; reversible. Zero deps. |

## node_modules is not committed

Tool dependencies are installed per-tool and are gitignored
(`tools/**/node_modules` in the root `.gitignore`). Only
`create-dependency-graph` currently has a runtime dependency — install it
before first use:

```bash
cd tools/create-dependency-graph && npm install
```

The other three tools use only Node built-ins and run directly with
`npx tsx <tool>.ts` — no `npm install` needed.
