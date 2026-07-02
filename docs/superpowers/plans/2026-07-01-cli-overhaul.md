# CLI Overhaul (v0.30.0) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the 869-line `bin/upt.mjs` monolith to a typed `src/cli/` module with unknown-flag rejection, `--version`, per-command help, `--json`, and `--source` on all eight graph commands — text output byte-compatible with today, pinned by a pre-port golden corpus.

**Architecture:** Verb-first dispatch (`main.ts`) over 14 command modules, each declaring its own `FlagSpec[]`; `runCli(argv)` returns an exit code (no `process.exit` anywhere in `src/cli/`); `bin/upt.mjs` becomes a shim that assigns `process.exitCode`. Commands import only from `../cli-api.js`.

**Tech Stack:** TypeScript 6 ESM (`.js` import extensions, Node16 resolution), vitest 4 spawn + in-process tests. No new dependencies (zero-hard-deps invariant).

**Spec:** `docs/superpowers/specs/2026-07-01-cli-overhaul-design.md` (r2, Adam+Eve-vetted). Read it before starting.

## Global Constraints

- Zero new dependencies. The flag parser is hand-written.
- Text output for existing success paths must match the golden corpus **byte-for-byte** (CRLF-normalized). The golden suite is the arbiter; when a port deviates, the port is wrong (except where a task explicitly says output changes).
- Every relative import inside `src/` ends in `.js`.
- No `process.exit` in `src/cli/` — throw `UsageError` (exit 2) or `CliError` (exit 1); the shim assigns `process.exitCode`.
- Scoped vitest per task; full suite + `npm run build` + `npm run smoke` only at Task 10's release gate (Windows cold-start tax).
- All `bin/upt.mjs` line references below are to the file as of commit `a6e492b` (they shift by 0 after Task 0, which edits only line 363).
- **Plan-honesty note:** Tasks 5–7 are transposition tasks — the authoritative source for each command body is `bin/upt.mjs` itself, not code inlined here (inlining 700 lines would create a second drift-prone copy, this repo's documented plan-template failure mode). Infra code (Tasks 2–4) and the two trickiest command shapes are given in full.

---

### Task 0: Fix the `derive --formula` crash (commit 1, pre-port)

**Files:**
- Modify: `bin/upt.mjs:363` (single token: `api.format` → `format`)
- Test: `tests/cli/upt-derive.test.ts` (create)

**Interfaces:**
- Produces: a working `upt derive … --formula "…"` path; Task 1 captures its golden.

- [ ] **Step 1: Write the failing test** (same spawn pattern as `tests/cli/upt-discover-opts.test.ts`)

```ts
/** Regression: `upt derive --formula` crashed with `ReferenceError: api is not
 *  defined` (bin/upt.mjs:363 used api.format; the import is destructured
 *  `format`). Pins the documented cli/README.md worked example. */
import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const cli = resolve(here, '../../bin/upt.mjs');

function run(args: string[]): { status: number; stdout: string; stderr: string } {
  try {
    const stdout = execFileSync('node', [cli, ...args], { stdio: 'pipe', encoding: 'utf8' });
    return { status: 0, stdout, stderr: '' };
  } catch (e) {
    const err = e as { status?: number; stdout?: Buffer | string; stderr?: Buffer | string };
    return { status: err.status ?? 1, stdout: String(err.stdout ?? ''), stderr: String(err.stderr ?? '') };
  }
}

describe('upt derive --formula (regression: api.format ReferenceError)', () => {
  it('runs the README worked example without crashing', () => {
    const r = run(['derive', 'period:time', 'length:length', 'gravity:acceleration',
      '--formula', '2*pi*sqrt(length/gravity)']);
    expect(r.status).toBe(0);
    expect(r.stdout).toContain('formula dimension:');
    expect(r.stdout).toContain('recovered prefactor');
  });

  it('still reports a dimensional mismatch formula without crashing', () => {
    const r = run(['derive', 'period:time', 'mass:mass', '--formula', 'mass']);
    expect(r.status).toBe(0);
    expect(r.stdout).toContain('⚠ homogeneous but ≠ target');
  });
});
```

- [ ] **Step 2: Run to verify RED** — `npx vitest run tests/cli/upt-derive.test.ts` → both tests FAIL (status 1, ReferenceError on stderr). Prereq: `dist/` built (`npm run build` if needed).
- [ ] **Step 3: Fix** — in `bin/upt.mjs:363` change `api.format(r.dim)` to `format(r.dim)` and on line 364 `api.format(target.dim)` to `format(target.dim)` (both occurrences on that console.log statement; grep `api\.` afterward → 0 hits).
- [ ] **Step 4: Verify GREEN** — same command → 2 passed.
- [ ] **Step 5: Commit** — `fix(cli): derive --formula crashed on api.format ReferenceError` (+ regression test; body notes both call sites and the zero-coverage cause).

---

### Task 1: Golden corpus (pre-port pin)

**Files:**
- Create: `tests/cli/golden-capture.mjs` (capture script, committed for regeneration)
- Create: `tests/cli/golden/*.txt` (one per case, captured output)
- Test: `tests/cli/upt-golden.test.ts`

**Interfaces:**
- Produces: `GOLDEN_CASES: { name: string; args: string[]; peerGated?: boolean }[]` exported from `tests/cli/golden-cases.mjs`, consumed by both the capture script and the runner test.

- [ ] **Step 1: Write the case list** (`tests/cli/golden-cases.mjs`):

```js
/** Golden corpus — the preserved success surface (spec §5.1). stdout only;
 *  stderr is NOT pinned (map --out + --equation deliberately write there).
 *  svg is excluded (peer-version-dependent bytes — spec Adam A3). */
export const GOLDEN_CASES = [
  { name: 'demo-no-args',        args: [] },
  { name: 'help',                args: ['help'] },
  { name: 'explain-mass-value',  args: ['explain', 'hawking-temperature', 'mass=1.989e30'] },
  { name: 'explain-bare-names',  args: ['explain', 'hawking-temperature', 'mass'] },
  { name: 'priority',            args: ['priority'] },
  { name: 'audit',               args: ['audit'] },
  { name: 'map-text',            args: ['map'] },
  { name: 'map-text-canonical',  args: ['map', '--source=canonical'] },
  { name: 'map-text-both',       args: ['map', '--source=both'] },
  { name: 'map-mermaid',         args: ['map', '--format=mermaid'] },
  { name: 'map-dot',             args: ['map', '--format=dot'] },
  { name: 'map-mermaid-proposed', args: ['map', '--format=mermaid', '--proposed'] },
  { name: 'map-equation-ok',     args: ['map', '--source=canonical', '--equation', 'period = 2*pi*sqrt(length/gravity)'] },
  { name: 'map-equation-mismatch', args: ['map', '--source=canonical', '--equation', 'period = mass'] },
  { name: 'candidates',          args: ['candidates'] },
  { name: 'candidates-both',     args: ['candidates', '--source=both'] },
  { name: 'predict',             args: ['predict'] },
  { name: 'discover',            args: ['discover'] },
  { name: 'discover-canonical',  args: ['discover', '--source=canonical'] },
  { name: 'discover-opts',       args: ['discover', '--max-orders=4', '--anchor=mass=1.989e30'] },
  { name: 'discover-derive',     args: ['discover', '--derive', '--source=both'] },
  { name: 'connectors',          args: ['connectors'] },
  { name: 'coverage',            args: ['coverage'] },
  { name: 'canonical',           args: ['canonical'] },
  { name: 'recover',             args: ['recover'] },
  { name: 'symbolic',            args: ['symbolic'] },
  { name: 'symbolic-simplify',   args: ['symbolic', '--simplify'], peerGated: true },
  { name: 'eval',                args: ['eval', 'hbar*c^3/(8*pi*G*M*k_B)', 'hbar=1.054571817e-34', 'c=299792458', 'G=6.6743e-11', 'M=1.989e30', 'k_B=1.380649e-23'] },
  { name: 'derive-plain',        args: ['derive', 'period:time', 'length:length', 'gravity:acceleration'] },
  { name: 'derive-formula',      args: ['derive', 'period:time', 'length:length', 'gravity:acceleration', '--formula', '2*pi*sqrt(length/gravity)'] },
];
```

- [ ] **Step 2: Write the capture script** (`tests/cli/golden-capture.mjs`) — for each case, `execFileSync('node', [cli, ...args])`, normalize `\r\n`→`\n`, write `tests/cli/golden/<name>.txt`. Run it once: `node tests/cli/golden-capture.mjs` → 30 files.
- [ ] **Step 3: Write the runner test** (`tests/cli/upt-golden.test.ts`) — `it.each(GOLDEN_CASES)`: spawn, expect status 0, expect CRLF-normalized stdout `toBe` the golden file content. `peerGated` cases wrap in `describe.skipIf(!peersPresent)` using the existing `tests/helpers/peers.ts` detection (spec §5.1 — `symbolic --simplify` output depends on the optional MathTS peer).
- [ ] **Step 4: Verify GREEN against the CURRENT CLI** — `npx vitest run tests/cli/upt-golden.test.ts` → 30 passed. (RED here means the capture/runner disagree on normalization — fix before proceeding.)
- [ ] **Step 5: Commit** — `test(cli): golden corpus pinning the pre-port output surface (30 cases)`.

---

### Task 2: `src/cli/` scaffolding — errors + flag parser

**Files:**
- Create: `src/cli/errors.ts`, `src/cli/args.ts`
- Test: `tests/cli/args.test.ts` (in-process; imports from `dist/cli/` after `npx tsc`)

**Interfaces (produced, used by every later task):**

```ts
// errors.ts
export class UsageError extends Error {}  // exit 2
export class CliError extends Error {}    // exit 1

// args.ts
export interface FlagSpec {
  name: string;                                   // '--source'
  valueStyle: 'attached' | 'next' | 'either' | 'none';
  repeatable?: boolean;                           // only --anchor today
}
export interface ParsedArgs {
  flags: Map<string, string[]>;                   // name (no dashes) → raw values ('' for none-style)
  positionals: string[];                          // everything not ---prefixed and not consumed as a 'next' value
}
export function parseArgs(command: string, argv: string[], specs: FlagSpec[]): ParsedArgs;
// throws UsageError on: unknown --flag; missing next-token value; repeated non-repeatable flag;
// 'attached'-style flag given bare; 'none'-style flag given =value.
```

- [ ] **Step 1: Write failing unit tests** covering: unknown flag → UsageError naming the command; `--source=canonical` attached; `--formula X` next-token (and UsageError when it's the last token); `--equation=X` and `--equation X` both accepted (either); `--proposed` none-style (and UsageError on `--proposed=x`); `--anchor=a=1 --anchor=b=2` repeatable accumulation; duplicate `--source` → UsageError; positionals (`name=value`, `name:dim`, bare) pass through untouched and in order; `--` prefix required (a positional containing `=` is NOT a flag).
- [ ] **Step 2: RED** — `npx tsc && npx vitest run tests/cli/args.test.ts` (module not found / assertions fail).
- [ ] **Step 3: Implement** `errors.ts` + `parseArgs` (single left-to-right scan; ~80 lines).
- [ ] **Step 4: GREEN** — same command.
- [ ] **Step 5: Commit** — `feat(cli): typed FlagSpec parser with unknown-flag rejection (src/cli scaffolding)`.

---

### Task 3: `output.ts` (JSON envelope + sanitizer) and `version.ts`

**Files:**
- Create: `src/cli/output.ts`, `src/cli/version.ts`
- Test: `tests/cli/output.test.ts`

**Interfaces (produced):**

```ts
// output.ts
export interface JsonEnvelope {
  command: string;
  source?: 'catalog' | 'canonical' | 'both';
  options?: Record<string, unknown>;
  epistemics?: string;
  result: unknown;
}
export function sanitize(v: unknown): unknown;
// deep-copies: NaN→"NaN", Infinity→"Infinity", -Infinity→"-Infinity",
// function→omitted (object keys) / null (array slots), Map→plain object,
// undefined object values→omitted; cycles impossible in library results (pure data).
export function emitJson(env: JsonEnvelope, write?: (s: string) => void): void; // JSON.stringify(sanitize(env), null, 2) + '\n'

// version.ts
export function packageVersion(): string; // readFileSync(new URL('../../package.json', import.meta.url)) → .version
```

- [ ] **Step 1: Failing tests**: sanitize({a: Infinity}) → {a:"Infinity"}; NaN; -Infinity; nested arrays; function property dropped; Map({x:1}) → {x:1}; emitJson output is `JSON.parse`-able and ends with `\n`; packageVersion() matches `require('../../package.json').version` read independently in the test via `readFileSync`.
- [ ] **Step 2: RED.** — `npx tsc && npx vitest run tests/cli/output.test.ts`
- [ ] **Step 3: Implement.**
- [ ] **Step 4: GREEN.**
- [ ] **Step 5: Commit** — `feat(cli): JSON envelope + non-finite-safe sanitizer; runtime version lookup`.

---

### Task 4: Command registry + `main.ts` dispatch

**Files:**
- Create: `src/cli/command.ts` (types), `src/cli/main.ts`, `src/cli/graphs.ts`
- Test: `tests/cli/main-dispatch.test.ts`

**Interfaces (produced):**

```ts
// command.ts
export interface CommandCtx {
  args: ParsedArgs;
  api: typeof import('../cli-api.js');    // injected so tests can stub; main passes the real barrel
  out: (line?: string) => void;           // stdout line writer
  err: (line?: string) => void;           // stderr line writer
}
export interface Command {
  name: string;
  aliases: string[];
  flags: FlagSpec[];
  help: string;                            // per-command usage block (verbatim from today's help text section)
  run(ctx: CommandCtx): Promise<number>;   // 0 on success; throws UsageError/CliError otherwise
}

// graphs.ts — shared --source resolution (replaces bin/upt.mjs resolveGraph, lines 53-67)
export type SourceName = 'catalog' | 'canonical' | 'both';
export function resolveGraph(api: CommandCtx['api'], flags: ParsedArgs['flags']):
  { graph: BridgeEdge[]; label: string; source: SourceName };
// unknown --source VALUE → CliError (exit 1 — preserves today's documented contract)

// main.ts
export async function runCli(argv: string[]): Promise<number>;
```

`runCli` behavior: `[]` → demo (explain + priority, byte-identical to today, lines 861-865); `help|--help|-h` → full help text (verbatim from lines 71-179, plus new `--version`/`--json` lines appended at the END of the text — the `help` golden gets those appended lines added in this task, the ONLY golden edit in the plan); `help <cmd>` → that command's `help` block; `version|--version|-v` → `packageVersion()`, exit 0; unknown verb → stderr `Unknown command '<cmd>'. See \`upt help\`.` + return 2; otherwise: look up command by name/alias, `parseArgs`, `cmd.run(ctx)`, catching `UsageError`→print to stderr, return 2 / `CliError`→return 1.

- [ ] **Step 1: Failing tests** (in-process against `dist/cli/main.js`): unknown verb → 2; `version` and `--version` and `-v` → 0 and stdout equals package.json version; `help discover` contains `--max-orders`; registered-command unknown flag → 2 with message naming both flag and command.
- [ ] **Step 2: RED.** `npx tsc && npx vitest run tests/cli/main-dispatch.test.ts`
- [ ] **Step 3: Implement** with an EMPTY command table (tests above need no ported commands; the unknown-flag test registers a stub command inline via the exported `registerForTest` hook or constructs main with a table — implementer's choice, keep it non-public).
- [ ] **Step 4: GREEN.**
- [ ] **Step 5: Commit** — `feat(cli): verb-first dispatch, top-level help/version, exit-code contract`.

---

### Task 5: Port group 1 — the eight "printer" commands

**Files:**
- Create: `src/cli/commands/{priority,audit,coverage,canonical,recover,connectors,predict,candidates}.ts`
- Modify: `src/cli/main.ts` (register)
- Test: golden suite (Task 1) + `tests/cli/source-extension.test.ts` (new cases below)

**Transposition source (authoritative):** `bin/upt.mjs` — priority 238-261, audit 264-287, coverage 716-731, canonical 801-815, recover 818-841, connectors 780-798, predict 567-589, candidates 548-564. Copy the body logic and output strings **verbatim**; changes limited to:
1. `console.log` → `ctx.out`, `console.error` → `ctx.err`.
2. Module-const `GRAPH` → `resolveGraph(...)` result (`priority`, `audit`, `connectors`, `predict` gain `--source`; `candidates` already resolves).
3. Every `process.exit(n)` → throw (`UsageError` for 2, `CliError` for 1).
4. Append `--json` branch: `emitJson({ command, source, result })` **instead of** the text body, where result is the library value the text body already computes: priority → `bridgePriority(graph)`; audit → `{derived, decoy, open}` (ids + prefactors, the same objects the text prints); coverage → `auditCoverage()`; canonical → `{entries: CANONICAL_EQUATIONS, gap: bridgesWithoutCanonicalPartner()}`; recover → `scanLinkages()`; connectors → `proposeOrphanConnectors(graph)`; predict → `predictMissingBridges(graph)`; candidates → `proposeLinkCandidates(graph)`. Epistemics field = the command's existing ⚠ banner line(s).
5. Honest degenerates (spec §4): in `priority`, after building the board, if `board.length === 0` print (text mode) `   0 non-established bridges in this graph — the canonical L-layer is all-established; triage is vacuous here.` and return 0. `predict` needs no special case — its existing `placedEdges/totalEdges` line and "nothing to predict" branch are already honest.
6. `coverage`, `canonical`, `recover` do NOT get `--source` (their FlagSpec is `--json` only).

- [ ] **Step 1: Failing goldens** — register the 8 commands, `npx tsc`, run `npx vitest run tests/cli/upt-golden.test.ts` **with the runner temporarily pointed at a `UPT_CLI_ENTRY=dist/cli/main-spawn.mjs` env override**… **No.** Simpler and safer: goldens keep spawning `bin/upt.mjs` (unchanged until Task 8). Group-1 verification is in-process: for each command, `runCli(['priority'])` capturing `out` lines and comparing to the same golden file content (write `tests/cli/inprocess-golden.test.ts` that reuses GOLDEN_CASES for the 8 group-1 names against `runCli` with captured writers). RED first (commands unregistered), then GREEN.
- [ ] **Step 2: New-behavior tests** (`tests/cli/source-extension.test.ts`, in-process): `priority --source=canonical` → exit 0 + output contains `triage is vacuous`; `audit --source=canonical` → exit 0; `connectors --source=both` → exit 0; `coverage --source=catalog` → UsageError path exit 2 (unknown flag); one `--json` test per command: parse stdout, assert `envelope.command` and a load-bearing `result` field (e.g. priority: `Array.isArray(result)`; recover: `result.some(r => r.classification === 'restates-canonical')`).
- [ ] **Step 3: GREEN both files.**
- [ ] **Step 4: Commit** — `feat(cli): port printer commands to src/cli with --source + --json`.

---

### Task 6: Port group 2 — `explain`, `symbolic`, `eval`, `derive`

**Files:**
- Create: `src/cli/commands/{explain,symbolic,eval,derive}.ts`
- Modify: `src/cli/main.ts` (register)
- Test: extend `tests/cli/inprocess-golden.test.ts` to these names + `tests/cli/json-contract.test.ts`

**Transposition source:** explain 183-235 (`parseKnown` moves into `explain.ts` unchanged — its two-mode positional contract and exit-2 messages are pinned by `tests/cli/upt-explain-inputs.test.ts`); symbolic 734-777 (incl. `exprToString`); eval 290-310; derive 313-385 (post-Task-0 body — note it uses `format` twice on the fixed line, and `dimsEqualTol`/`fmtMono`/`BASES` helpers move with it).

Same transformation rules as Task 5, plus:
- explain gains `--source` (flag) and `--json` (`result: explainQuantity(graph, target, known)`); its `process.exit(2)` sites (lines 193-198, 206-211, 218) become UsageError with identical messages.
- eval `--json` → `{ value }` (number, sanitizer handles non-finite); its exits 294/298/307/309 → UsageError.
- derive `--json` → `{ determination: dimensionallyDetermines(...), buckingham: full ?? undefined, formulaCheck: r ?? undefined, prefactor: mean ?? undefined }` (exact field names; all already computed by the text path); exits 328/336/368/377 → UsageError.
- symbolic keeps `--simplify`; `--json` result: array of `{label, name, leaves, expr: exprToString(...), dim: format(...), value}` for the two chains.

- [ ] **Step 1: RED** (in-process goldens for explain/symbolic/eval/derive cases + JSON contract tests).
- [ ] **Step 2: Implement; GREEN.**
- [ ] **Step 3: Also run** `npx vitest run tests/cli/upt-explain-inputs.test.ts tests/cli/upt-derive.test.ts` — still green (they spawn the old bin, unchanged; this is the pre-swap sanity that both worlds agree).
- [ ] **Step 4: Commit** — `feat(cli): port explain/symbolic/eval/derive with --json`.

---

### Task 7: Port group 3 — `map` and `discover` (the flag-heavy pair)

**Files:**
- Create: `src/cli/commands/{map,discover}.ts`
- Modify: `src/cli/main.ts` (register)
- Test: extend in-process goldens + `tests/cli/json-contract.test.ts`

**Transposition source:** map 387-545 (`proposedJunctions`, `parseEquationFlag` — replaced by the `either`-style `--equation` FlagSpec — `analyzeEquation`, `printEquationReport`, `mapCmd`); discover 592-713 (`parseDiscoveryOpts`, `discoverCmd`, `deriveCmd`).

Map specifics:
- FlagSpec: `--source` (attached), `--format` (attached), `--out` (attached), `--proposed` (none), `--equation` (either), `--json` (none).
- Exit conversions: 465/471/475 → UsageError; 496 (SVG renderer missing) and 505 (empty `--out=`) and 518 (unknown format value) → CliError (preserves the documented exit-1 contract).
- `--json` + `--format=mermaid|dot|svg` → UsageError (`pick one output form: --json or --format`). `map --json` (text-equivalent) → `result: linkageMap(graph)` + `landing`/`userEquation` fields when `--equation` given.
- `writeFileSync` wrapped: failure → CliError with the fs message.
- stdout/stderr split preserved exactly (diagram → out; landing report + `--out` summary → err).

Discover specifics:
- FlagSpec: `--source`, `--max-orders` (attached), `--anchor` (attached, repeatable), `--derive` (none), `--json` (none).
- `parseDiscoveryOpts` validation logic verbatim (its exits 611/626 → UsageError — messages pinned by `tests/cli/upt-discover-opts.test.ts`).
- `--json` → `result: rankDiscoveries(graph, opts)`; with `--derive`, `result: deriveProposedBridges(ranked)` (evaluate closures dropped by the sanitizer — by design).

- [ ] **Step 1: RED** (in-process goldens for the 8 map/discover golden cases + JSON contract cases incl. the `--json`+`--format` conflict → 2).
- [ ] **Step 2: Implement; GREEN.** Also `npx vitest run tests/cli/upt-map-format.test.ts tests/cli/upt-discover-opts.test.ts` (old bin, still green).
- [ ] **Step 3: Commit** — `feat(cli): port map + discover; --json/--format conflict guard`.

---

### Task 8: The swap — shim `bin/upt.mjs`, delete the monolith body

**Files:**
- Modify: `bin/upt.mjs` (869 lines → ~22)
- Test: full CLI test directory

- [ ] **Step 1: Write the shim** (complete file):

```js
#!/usr/bin/env node
/**
 * upt — thin launcher. All logic lives in src/cli/ (compiled to dist/cli/).
 * This shim only resolves dist/, guards the not-built case, and maps the
 * returned code onto process.exitCode (NOT process.exit — a hard exit can
 * truncate piped stdout).
 */
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const entry = pathToFileURL(join(here, '..', 'dist', 'cli', 'main.js')).href;

let main;
try {
  main = await import(entry);
} catch (err) {
  console.error('Could not load the built package. Run `npm run build` first.');
  console.error(String(err && err.message ? err.message : err));
  process.exit(1);
}
process.exitCode = await main.runCli(process.argv.slice(2));
```

- [ ] **Step 2: Rebuild + run the ENTIRE CLI suite** — `npx tsc && npx vitest run tests/cli/` → golden suite (spawning the shim now exercises `src/cli/`), the 4 pre-existing spawn files, derive regression, args/output/dispatch units, source-extension, JSON contract: **all green**. Any golden mismatch = port bug; fix the port, never the golden.
- [ ] **Step 3: Grep gates** — `grep -c "process.exit" bin/upt.mjs` → 1 (the loader guard only); `grep -rn "process.exit" src/cli/` → 0 hits.
- [ ] **Step 4: Commit** — `refactor(cli)!: bin/upt.mjs → shim over dist/cli (22 process.exit sites converted)`.

---

### Task 9: Hardening tests that only make sense post-swap

**Files:**
- Test: `tests/cli/hardening.test.ts` (spawn-based — pins the end-to-end contract)

- [ ] **Step 1: Write + RED-check-by-inspection** (these pass immediately if Tasks 2-8 are correct; RED discipline here = run them BEFORE writing any fix, to find port gaps): unknown flag on every command (`it.each` over the 14 names × `--bogus`) → 2, stderr names flag + command; `--sourc=canonical` (the motivating typo) on discover → 2; `upt -v` → 0 + semver-shaped stdout; `upt help map` → contains `--equation`; `upt derive --source=catalog` → 2 (non-graph command); demo `--json` → 2.
- [ ] **Step 2: GREEN; fix any port gap it finds at root cause.**
- [ ] **Step 3: Commit** — `test(cli): hardening matrix (unknown flags, version, per-command help)`.

---

### Task 10: Docs, CHANGELOG, gate

**Files:**
- Modify: `cli/README.md` (flags table: `--json`, `--version`, `--source` column per command; unknown-flag hardening note; JSON envelope + sanitizer contract incl. "no JSON error envelope; zero-exit stdout is always parseable"; exit-code table), `CHANGELOG.md` (`[Unreleased]`: Added --json/--version/--source-extension/per-command-help; Fixed derive crash; Changed unknown-flag rejection — THE behavior change), `CLAUDE.md` (CLI source-map row: bin shim + src/cli/), `todo.md` (flip the queue entry to done-pending-release).
- Gate: `npm run build && npm test && npm run smoke` (full suite — release-gate tier) + `npm run docs:deps` (new module: file counts change).

- [ ] **Step 1: Docs edits** (verify every count/claim against the code — honest-claude).
- [ ] **Step 2: Full gate green.** Record suite count in CHANGELOG.
- [ ] **Step 3: Commit** — `docs(cli): README/CHANGELOG/CLAUDE/todo for the v0.30.0 CLI overhaul` (+ regenerated dep-graph reports).
- [ ] **Step 4: (release — user-triggered)** version bump 0.29.0→0.30.0, `npm audit`/`npm outdated` pre-flight, tag `v0.30.0`, push, `npm publish --ignore-scripts --access public`. NOT executed without the owner's go-ahead (repo release discipline).

---

## Self-review (done at write time)

- **Spec coverage:** §1 architecture → Tasks 2-4, 8; §2 hardening → Tasks 2, 4, 9; §3 --json → Tasks 3, 5-7 (+ contract tests); §4 --source → Tasks 5-7 (+ degenerates Task 5); §5 testing → Tasks 0, 1, 5-9; §6 docs → Task 10. 22-exit-site inventory → distributed across Tasks 5-7 with per-command line refs; Task 8 Step 3 is the exhaustive grep gate.
- **Type consistency:** `ParsedArgs.flags: Map<string,string[]>` used by all command tasks; `resolveGraph` returns `{graph,label,source}` consumed in 5-7; envelope fields match spec §3.
- **Placeholder scan:** transposition tasks cite exact source line ranges + exact transformation rules instead of inlined bodies — deliberate, justified in Global Constraints (the golden suite, not plan-inlined code, is the correctness arbiter).
