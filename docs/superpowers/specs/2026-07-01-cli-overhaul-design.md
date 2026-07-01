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
  version.ts       reads package.json version at runtime via import.meta.url
                   traversal (../../package.json from dist/cli/ — correct in
                   both the dev checkout and the installed layout, since
                   dist/ ships inside the package)
  commands/        one module per command: explain, priority, audit, map,
                   candidates, predict, discover, connectors, coverage,
                   canonical, recover, symbolic, eval, derive
```

Contracts:

- Each command module exports
  `{ name, aliases, flags: FlagSpec[], help, run(ctx): Promise<number> }`.
  Dispatch table, per-command help, and flag validation all derive from these —
  no hand-maintained parallel lists.
- **Parsing is verb-first** (Eve E2 clarification): `main.ts` resolves the
  command from `argv[0]` (including aliases and the top-level verbs
  `help`/`--help`/`-h` and the new `version`/`--version`/`-v`, which are
  handled before per-command parsing and are NOT FlagSpec entries), then
  parses the remaining tokens against that command's own `FlagSpec[]`.
  Unknown-flag rejection is therefore per-command by construction.
- **`FlagSpec` (hand-written parser, ~100 lines, no new dependency — the
  zero-hard-deps invariant holds):**
  `{ name, valueStyle: 'attached' | 'next' | 'either' | 'none',
     repeatable?: boolean, validate?(raw): string | null }`.
  This covers the full current grammar: `--source=X`, `--format=X`,
  `--out=PATH`, `--max-orders=N`, `--anchor=k=v[,k2=v2]` (attached,
  repeatable), `--proposed`/`--simplify`/`--debug`/`--derive` (none),
  `--equation` (either: `--equation=X` and `--equation "X"`), `--formula`
  (next). **Positional arguments pass through untouched** to each command's
  existing positional parser (`parseKnown`'s bare-name/name=value modes,
  `derive`'s `name:dim` specs, `eval`'s formula-first convention) — the
  FlagSpec layer only owns `--`-prefixed tokens.
- **`runCli` returns an exit code; it never calls `process.exit`.** Errors are
  modeled (`UsageError` → 2, `CliError` → 1). The port must convert **all 22
  `process.exit` sites** in the current `bin/upt.mjs` (counted 2026-07-01) to
  thrown errors — the implementation plan carries the exhaustive inventory.
  This makes every command testable in-process.
- `bin/upt.mjs` shrinks to a ~20-line shim: `pathToFileURL` resolution, dynamic
  import of `dist/cli/main.js`, the existing try/catch "run `npm run build`
  first" guard, then **`process.exitCode = await runCli(process.argv.slice(2))`
  — assignment, not `process.exit()`,** so piped stdout is never truncated
  (Eve E7). The package.json `"bin"` field, `npx` invocation, and all npm
  script aliases are untouched.
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
- Interactions and edge contract (completed per Adam A4): `--json` +
  `map --format=mermaid|dot|svg` → exit 2 (pick one output form).
  `eval --json` → `{ "value": … }`. `derive --json` → the structured
  determination result. `help --json` and demo `--json` → exit 2 (unknown
  flag). Honest degenerates emit the **real (empty) library value** in
  `result` plus the vacuous-analysis note in `epistemics`. Failures never
  emit a JSON error envelope: plain text to stderr, nonzero exit, stdout
  empty — a consumer can always `JSON.parse` a zero-exit stdout.

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
   15 commands + flag variants **+ the no-args demo path (Eve E3)**
   (~25–30 cases) into `tests/cli/golden/*.txt` with a spawn-based runner
   asserting byte equality (CRLF-normalized). **Scope (Adam A1): goldens pin
   only the preserved success surface** — new error paths (unknown flag,
   `--json` conflicts) get ordinary new tests with their own expectations.
   **`--format=svg` is excluded from goldens (Adam A3)** — its bytes depend on
   the optional `@viz-js/viz` peer version; it is asserted structurally
   (`<svg` prefix, or the documented peer-missing error) instead.
   Discovery/map text outputs are deterministic (pure functions over the
   static catalog), so goldens are stable.
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

## Adversarial review record (r2, 2026-07-01)

**Adam (Gemini 2.5 Pro): YELLOW.** A1 byte-compat vs new error paths →
clarified (goldens = preserved success surface only). A2 parser capabilities
unspecified → `FlagSpec` fully defined in Section 1; hand-written, no new dep.
A3 SVG golden fragility → SVG excluded, structural assertion. A4 `--json`
edge contract → completed in Section 3. A5 full-suite-at-release-gate → CI
runs the full suite on push; accepted. A6 shim guard → the existing try/catch
import guard is retained (strictly stronger than an existsSync check).

**Eve (OpenAI o3), post-Adam: 9 findings.** E1 process.exit audit → valid;
**22 sites counted at HEAD**, exhaustive conversion inventory goes in the
plan. E2 flag-validation-before-verb inconsistency → misread; parsing is
verb-first (now explicit in Section 1). E3 no-args demo missing from goldens
→ folded. **E4 `help`-verb collision with a `history` command → FABRICATED
(grep-verified: no `history` anywhere; `help` is already one of today's 15
verbs) — rejected.** E5 `-v` not expressible in FlagSpec → clarified:
`version`/`-v`/`--version` are top-level verbs like today's `help`/`-h`, not
flags. E6 package.json path under npx → mechanism specified
(import.meta.url); Eve's $TMP layout claim is wrong for npm installs but the
fix is the same. E7 stream truncation → folded: shim assigns
`process.exitCode` instead of calling `process.exit()`. E8 local vitest
without build → pre-existing (spawn tests already require dist/; `pretest`
builds); no change. E9 barrel creep onto the public API → rejected with
evidence: package.json `exports` maps only `.` and
`./numerical/mathts-engine`, so `cli-api` additions cannot reach the
published surface.

## Out of scope

- New analysis commands or library-side changes (beyond `cli-api.ts` barrel
  additions if a command needs an export that exists but isn't in the barrel).
- Changing any library computation or text-report *content* (byte-compat goal).
- Interactive/REPL mode, shell completions, color output.
