# TOOLS.md — the instruments, and how each one lies

The law is `AGENTS.md`. This file answers *what do I run it with* — and, more usefully, **how
each instrument misleads**, because most wrong answers in this repo came from a working tool
pointed at the wrong thing.

## Instruments

| Tool | Use it for |
|---|---|
| `bun run test` | the real gate (vitest); see `CLAUDE.md` Commands |
| `gh run list` / `gh run view <id> --log` | CI truth. The pre-push gate is **not** CI |
| `git show --numstat <sha>` | proving a change is additive (0 deletions) rather than asserting it |
| `git merge-base --is-ancestor <sha> master` | proving a commit is actually on the branch |
| `#print axioms` (Lean) | what a proof actually rests on. Run a deliberate `sorry` first as a positive control |

## How they lie

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
