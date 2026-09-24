# TOOLS.md — the instruments, and how each one lies

The law is `AGENTS.md`. This file answers *what do I run it with* — and, more usefully, **how
each instrument misleads**, because most wrong answers in this repo came from a working tool
pointed at the wrong thing.

## Commands

| Task | Command | Notes |
|---|---|---|
| Install | `bun install` | `--frozen-lockfile` in CI |
| Build | `bun run build` | tsc, emits to `dist/` |
| Test | `bun run test` | the full vitest suite; `pretest` runs `tsc` first. **Never bare `bun test`**: that is Bun's own runner, not vitest. The first run after a reboot pays a cold-start cost of minutes; do not quote that figure as the steady-state cost (it was once used to justify a scoped subset, and the directory the subset skipped is where a defect reached `master`) |
| Scoped test | `bunx vitest run tests/path/to/file.test.ts` | or `-t "name pattern"`; skips the `tsc` pretest; the default for TDD cycles |
| Long accuracy tests | `$env:GL4_LONG='1'; bunx vitest run …` (PowerShell) | GL4/Shapiro sweeps, `it.skip` otherwise; the nightly `long-tests` CI job runs them |
| Smoke | `bun run smoke` | runs `test-example.js` against the built `dist/` (via Node) |
| CLI | `node bin/upt.mjs <cmd>` (or `bun run upt --`) | needs `bun run build` first; reference in `cli/README.md` |
| Dependency graph and doc counts | `bun run docs:deps` | regenerates `docs/architecture/`; the `docs-fresh` CI job fails when it was not run |
| Bench | `bun run bench` / `bun run bench:ci` | vitest bench; baselines in `docs/architecture/benchmarks.md` |
| Audit | `bun audit` | replaces `npm audit` (needs `bun.lock`) |
| Plan-ledger audit | `bun run audit:plans` | audits `ACTIVE.md`; a release gate inside `validate` |
| formalRef axiom gate | `bun run atlas:formal-gate -- --physlib <checkout>` | re-measures `#print axioms` for every `lean4-physlib` formalRef; needs Lean and a built Physlib checkout (`formal/physlib/README.md`), so it is NOT in CI. **Lean exits 0 for a `sorry` proof**; the gate reads the printed axioms, and fails if the `HoleProbe` control does not report `sorryAx` |
| Publish | `npm publish --access public` | Mothership's, never this session's. **Do NOT pass `--ignore-scripts`**: `prepublishOnly` runs `npm run validate` (build, typecheck, test, audit:plans, package:check), and that is the packaging gate |

## Instruments

| Tool | Use it for |
|---|---|
| `gh run list` / `gh run view <id> --log` | CI truth. The pre-push gate is **not** CI |
| `git show --numstat <sha>` | proving a change is additive (0 deletions) rather than asserting it |
| `git merge-base --is-ancestor <sha> master` | proving a commit is actually on the branch |
| `#print axioms` (Lean) | what a proof actually rests on. Run a deliberate `sorry` first as a positive control |

## How they lie

- **`bun run docs:deps` reads tracked files only.** A new file is left out of the generated docs
  until it is staged (`git add` or `git add -N`). This is deliberate: an untracked scratch file once
  entered the committed coverage docs. The pre-push hook refuses while the tree differs from HEAD.
- **A pipeline returns the LAST command's exit code.** `cmd | tail` reports `tail`. A run with
  failures can report exit 0.
- **An exit code is not an outcome.** `npm view` prints `E404` to STDOUT *and exits 0*.
- **An empty result is not an absence.** Ask whether the query *could* have returned a positive,
  and run a positive control that proves it can.
- **A grep can match your own prose.** If you have been writing the search string while
  discussing the search, you will count your own sentences as data. Classify on **structure**
  (a field value), never on text.
- **A `.jsonl` transcript is NOT written in timestamp order.** Sort by timestamp; never walk by
  line number. Line order as time order has produced a clean, confident, completely wrong result.
- **An impossible value is the instrument reporting its own breakage** — a negative duration, a
  count above the population, a rate over 100%. Halt and check. Never read it as noisy data.
- **A record may not be flushed until after the turn that triggered it.** An event that woke you
  is unreadable in the turn it caused. Absence there is not absence.
- **A timestamp may be stamped at DELIVERY, not at the scheduled moment.** A queued item can
  arrive half an hour late carrying the delivery time, which makes "fired on schedule" and
  "delivered at a boundary" indistinguishable.
- **A status field is not liveness.** A marker file records what something was *told*, not what
  is true now.
- **A published table can contradict its own definition.** Read the source, not a summary. Where
  a row disagrees with the paper's own rule, hold that row to a stated looser tolerance and
  write down why.
- **A local model is right where it must QUOTE and wrong where it must CHOOSE.** Constrained
  fields (labels, enums) are its least reliable output. Require a verbatim quote beside every
  claim, and treat a fabricated quote as a failure of the triage, not as a finding.
