# CLI overhaul — design (approved 2026-07-01)

**Scope decision (user):** all four workstreams — fix + harden, TypeScript
structural refactor, `--json` output mode, `--source` everywhere — landed as
**one big-bang port** (Approach A), made safe by a pre-port golden-output
corpus. Target release: **v0.30.0** (minor bump).

## Motivation (verified at HEAD, 2026-07-01)

1. **Live crash.** `upt derive … --formula "…"` throws
   `ReferenceError: api is not defined` at `bin/upt.mjs:363` (`api.format(r.dim)`
   — a refactor artifact from the cli-api migration; the import is destructured
   `format`). Reproduced on the exact worked example `cli/README.md` documents.
   `derive` has zero CLI-level test coverage, which is why it was invisible.
2. **Systemic footgun.** Unknown/typo'd flags are silently ignored everywhere
   (`upt discover --sourc=canonical` silently runs on the default catalog
   graph). The repo has hardened this class one flag at a time (`parseKnown`,
   `parseDiscoveryOpts`); there is no generic rejection.
3. **Missing staples.** No `--version`; no machine-readable output.
4. **Inconsistent capability.** `--source` works on `map`/`candidates`/
   `discover` only; `explain`/`connectors`/`predict`/`audit`/`priority`
   hardcode the catalog graph.
5. **Structure.** `bin/upt.mjs` is an 869-line untyped monolith; only 4 of 15
   commands have CLI-level tests. The `api.format` bug class is invisible to
   `tsc` because the CLI is outside `src/`.

## Section 1 — Architecture & module layout

New `src/cli/` module (TypeScript, compiled to `dist/cli/`):

```
src/cli/
  main.ts          runCli(argv): Promise<number> — dispatch, top-level error handling
  args.ts          declarative flag parser (per-command flag specs, unknown-flag rejection)
  output.ts        text/JSON emitters + --json envelope builder + JSON sanitizer
  version.ts       reads package.json version at runtime
  commands/        one module per command: explain, priority, audit, map,
                   candidates, predict, discover, connectors, coverage,
                   canonical, recover, symbolic, eval, derive
```

Contracts:

- Each command module exports
  `{ name, aliases, flags: FlagSpec[], help, run(ctx): Promise<number> }`.
  Dispatch table, per-command help, and flag validation all derive from these —
  no hand-maintained parallel lists.
- **`runCli` returns an exit code; it never calls `process.exit`.** Errors are
  modeled (`UsageError` → 2, `CliError` → 1); only the `bin/upt.mjs` shim calls
  `process.exit`. This makes every command testable in-process.
- `bin/upt.mjs` shrinks to a ~20-line shim: `pathToFileURL` resolution, dynamic
  import of `dist/cli/main.js`, the existing "run `npm run build` first" guard,
  `process.exit(await runCli(process.argv.slice(2)))`. The package.json `"bin"`
  field, `npx` invocation, and all npm script aliases are untouched.
- Command modules import **only from `../cli-api.js`** — the barrel survives as
  the type-checked, auditable manifest of what the CLI touches (this is what
  turns the `api.format` bug class into a compile error).
- The `api.format` crash fix + its regression test land as **commit 1**, before
  the port, so the bug fix is bisectable independently of the rewrite.

## Section 2 — Flag parsing & hardening semantics

- **Unknown `--flag` → exit 2** with
  `unknown flag '--sourc' for 'discover' (see upt help discover)`. This is the
  one deliberate behavior change (previously silently ignored). Everything else
  keeps the documented exit-code contract: bad `--source`/`--format` *value*,
  empty `--out=`, missing SVG peer, load failure → 1; usage/parse errors → 2.
- **`upt --version` / `-v` / `version`** → package version, exit 0.
- **`upt help <command>`** → per-command usage derived from the command
  module's `help` + flag spec; bare `upt help` keeps the full text.
- **Text-output byte-compatibility is a hard goal**: golden files captured from
  the *current* CLI for all 15 commands (plus flag variants) before the port;
  the ported CLI must reproduce them byte-for-byte (CRLF-normalized), except
  the fixed crash line in `derive --formula` (golden captured post-fix).

## Section 3 — `--json` output mode

Every data-bearing command accepts `--json`, emitting one JSON document to
stdout:

```json
{ "command": "discover", "source": "canonical", "options": { … }, "result": … }
```

- **`result` is the library's return value** (`ExplainResult`,
  `VettedCandidate[]`, `LinkageMap`, the audit partition, …) passed through a
  small sanitizer — not a hand-designed schema. The library types are the
  schema; text and JSON render the same object, so they cannot drift.
- **Sanitizer rules** (the only invention): non-finite numbers → the strings
  `"Infinity"` / `"-Infinity"` / `"NaN"` (`JSON.stringify` silently nulls them,
  and physics results genuinely contain `∞`, e.g. `anchoring` in the priority
  board); functions (evaluator closures) dropped; `Map` → plain object.
- **Epistemics banners survive machine consumption**: commands that print
  "review surface, not discoveries" put that text in an `"epistemics"` envelope
  field.
- Interactions: `--json` + `map --format=mermaid|dot|svg` → exit 2 (pick one
  output form). `eval --json` → `{ "value": … }`. `derive --json` → the
  structured determination result. `help`/demo don't take `--json`.

## Section 4 — `--source` everywhere (honest degenerates)

- `--source=catalog|canonical|both` extends to all eight graph-parameterized
  commands: `explain`, `priority`, `audit`, `map`, `candidates`, `predict`,
  `discover`, `connectors`.
- **Honest degenerates, printed not hidden**: `priority --source=canonical`
  prints its header plus an explicit "0 non-established bridges in this graph —
  triage is vacuous here" line; `predict` reports its real placement count
  (canonical edges carry no regime tags) rather than fabricating placements.
  Both exit 0 — an honestly-empty analysis is a result, not an error.
- `coverage`, `canonical`, `recover`, `symbolic`, `eval`, `derive` are not
  graph-parameterized; `--source` on them is an unknown flag (exit 2).

## Section 5 — Testing strategy

1. **Golden corpus first (pre-port commit):** capture current stdout for all
   15 commands + flag variants (~25–30 cases) into `tests/cli/golden/*.txt`
   with a spawn-based runner asserting byte equality (CRLF-normalized).
   Discovery/map outputs are deterministic (pure functions over the static
   catalog), so goldens are stable.
2. **Crash regression:** `derive … --formula` test lands with the commit-1 fix.
3. **Unit tests (in-process):** `args.ts` (unknown flag → `UsageError`, value
   validation, aliases, `--flag=x` vs `--flag x`), `output.ts` sanitizer
   (Infinity/NaN/function/Map), `version.ts`.
4. **In-process command tests:** `runCli([...])` return codes for the
   usage-error matrix; spawn tests remain only for the `bin/upt.mjs` shim
   contract (the 4 existing CLI test files keep passing unchanged).
5. **JSON contract tests:** per `--json` command, parse stdout, assert envelope
   keys + load-bearing result fields; one test pins non-finite encoding.
6. Full suite + `npm run smoke` at the release gate only, per repo convention.

## Section 6 — Docs & release

- `cli/README.md`: full refresh — flags table (`--json`, `--version`, extended
  `--source`), unknown-flag rejection under a "hardening" note, JSON envelope +
  sanitizer docs, exit-code table.
- `CHANGELOG.md [Unreleased]` → **v0.30.0** (minor). Unknown-flag rejection is
  called out as the one behavior change.
- `CLAUDE.md` CLI source-map row + `todo.md` updated at the wrap (standing
  stale-docs gate).
- Design + plan both get an Adam+Eve adversarial vet before execution
  (todo.md §Conventions); the golden corpus doubles as Eve's empirical
  verification surface.

## Out of scope

- New analysis commands or library-side changes (beyond `cli-api.ts` barrel
  additions if a command needs an export that exists but isn't in the barrel).
- Changing any library computation or text-report *content* (byte-compat goal).
- Interactive/REPL mode, shell completions, color output.
