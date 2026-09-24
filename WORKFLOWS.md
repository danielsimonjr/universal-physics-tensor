# WORKFLOWS.md — procedure (run these, do not re-derive them)

The law is `AGENTS.md`. This file is **what to run, in what order**. If it does not answer that,
it belongs in another file.

## Before non-trivial work

Read `todo.md` (cross-session task state and repo conventions) and `NOTES.md` (current state).

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

- **Do not re-run the full suite per task.** Use scoped vitest in TDD cycles and the full suite
  at the commit gate.

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
2. Check the surface stays **closed under type references** (the invariant is in `MEMORY.md`).
3. Teach the invariant test the new export form and **prove it fails** on a deliberately
   untagged symbol *before* changing the form. Otherwise the test passes vacuously and reports
   green while checking nothing.
4. Prefer **additive**: adding an export changes nothing that exists. Verify with
   `git show --numstat` that deletions are zero.

## Before reporting any number

Re-derive it **from the set**, not from an earlier report. A count and a list that can disagree
are two sources of truth. **Re-count after every write** — a count taken before a write is a
count of the old file.

## Working from a plan

- **Plan templates routinely carry wrong inline test snippets**: wrong tensor input formats, wrong
  AST node kinds (`op:'*'` vs `kind:'tensor-product'`), wrong nested-array shapes, invented method
  names (`f64.mul`), or false claims such as `evaluateNumericalRaw` "bypasses `validate()`" (it
  does not). **Cross-check inline test code against existing fixtures before TDD'ing it.** State
  an honest deviation in the commit message.
- **Never assume a plan inherits its design's fixes.** A plan once reintroduced a bug its design
  had already fixed. Adversarial review runs on both artifacts independently.
- **Pre-execution verification gates**: before each TDD cycle, read the source and run the
  prerequisites.
- **Review tier:** design, plan and physics-correctness checks go to the Adam+Eve adversarial pair.
  The model mapping and invocation conventions live in `todo.md` §Conventions.

## Adding or changing a Lean `formalRef`

1. Add the theorem to `formal/physlib/AxiomProbe.lean`.
2. Run `bun run atlas:formal-gate -- --physlib <checkout> --write-captured` (setup in
   `formal/physlib/README.md`).
3. The gate must PASS, and `captured/HoleProbe.out` must still report `sorryAx`. Record the
   measured axioms in the `formalRef`.
4. Commit the probe, the captured output and the record together.

## Release (Mothership's; recorded so the order is never re-derived)

1. Bump `package.json`.
2. `bun run atlas:json` — AFTER the bump: `data/atlas/oscillators.json` embeds `packageVersion`,
   and `tests/atlas/atlas-json.test.ts` fails on a stale artifact.
3. `bun run docs:deps` — AFTER the bump: `DEPENDENCY_GRAPH.md` embeds the version, and the
   `docs-fresh` job fails on a release commit that regenerated first.
4. Pre-flight: `bun audit` and `bun outdated`. Resolve HIGH/CRITICAL findings before tagging, and
   record the dependency-health snapshot under the release header in `CHANGELOG.md`.
5. Commit, push `master`, tag `v0.X.Y`, push the tag, verify CI green.
6. `npm publish --access public` (`TOOLS.md`, Publish).
7. Verify against the REGISTRY: `npm view <pkg> version --prefer-online`. Plain `npm view` serves
   a stale cache right after a publish.

`NPM_TOKEN` is a Windows user-level environment variable; `.npmrc` interpolates `${NPM_TOKEN}`.
Rotate at <https://www.npmjs.com/settings/danielsimonjr/tokens>.
