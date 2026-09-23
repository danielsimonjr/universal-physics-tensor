# WORKFLOWS.md — procedure (run these, do not re-derive them)

The law is `AGENTS.md`. This file is **what to run, in what order**. If it does not answer that,
it belongs in another file.

## Every commit-shaped change

**File the `todo.md` row BEFORE the work** → do it → tick it **without retitling** →
`CHANGELOG.md` entry saying what changed *and why* → commit → push → **read CI on GitHub**.

The row is late the moment you are about to change a file something else will later run.

## The test gate

- **Never pipe the gate** (`TOOLS.md`, "How they lie").
- Judge on the **counts** in the summary line, never on the exit code alone.
- The pre-push gate runs the full suite. **That is not CI.** Read the GitHub run:
  `gh run list --repo <repo>` then `gh run view <id> --log`.
- Confirm a new test file actually **executed** — a file missed by the glob passes vacuously.

## Adding an invariant, a control, or a test

1. Make it **FAIL first**, on the real tree, and keep the failure output.
2. Then implement.
3. Then confirm green.
4. Where practical, **mutate the implementation** and confirm the new test catches what the old
   ones did not. That proves the old tests were blind rather than asserting the new ones are
   better.
5. Keep any script that produced a WRONG intermediate result beside the corrected one — a number
   whose wrong path was deleted cannot be audited.

## Promoting anything to the public surface

1. Read what is **already** exported before creating anything.
2. Check the surface is **closed under type references** — a public declaration must not
   reference a non-public type.
3. Teach the invariant test the new export form and **prove it fails** on a deliberately
   untagged symbol *before* changing the form. Otherwise the test passes vacuously and reports
   green while checking nothing.
4. Prefer **additive**: adding an export changes nothing that exists. Verify with
   `git show --numstat` that deletions are zero.

## Before reporting any number

Re-derive it **from the set**, not from an earlier report. A count and a list that can disagree
are two sources of truth. **Re-count after every write** — a count taken before a write is a
count of the old file.

