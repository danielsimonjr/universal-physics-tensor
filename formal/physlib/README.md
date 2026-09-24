# Physlib axiom probes

These files measure the axioms that the Lean proofs behind the atlas `formalRef` records depend
on. The gate in `tools/formalref-axiom-gate/` runs them and compares the result with each record.

| File | Purpose |
|---|---|
| `AxiomProbe.lean` | Prints the axioms of each probed Physlib theorem with `#print axioms`. |
| `HoleProbe.lean` | The positive control. It proves `(1 : Nat) = 2` with `sorry`, so its report must contain `sorryAx`. |
| `captured/AxiomProbe.out` | The output of `AxiomProbe.lean` at the pinned commit. The gate's tests use it. |
| `captured/HoleProbe.out` | The output of `HoleProbe.lean` at the pinned commit. |

## Why the positive control exists

A report with no `sorryAx` has two possible causes. The proofs have no holes, or the probe cannot
see a hole. `HoleProbe.lean` tests the second cause. The gate fails when the control does not
report `sorryAx`.

The control has a limit. Its `sorry` is in the probe file itself. The control therefore shows that
the gate detects a hole in the file that it runs. The control does not show that the gate detects a
hole inside an imported, prebuilt module, and every probed theorem is in such a module.

Lean exits with code 0 for a proof that uses `sorry`. Lean only prints a warning. The gate therefore
reads the printed axioms and ignores the exit code.

## The pinned commit

Physlib `5ad56e24de155462acd8478458292347393d5908`, toolchain `leanprover/lean4:v4.34.0`. Each
`formalRef.version` records the same pin.

## Run the gate

1. Install the Lean toolchain manager `elan`.
2. Fetch Physlib at the pinned commit into a new, empty directory:

   ```bash
   mkdir physlib && cd physlib
   git init -q && git remote add origin https://github.com/leanprover-community/physlib.git
   git fetch -q --depth 1 origin 5ad56e24de155462acd8478458292347393d5908 && git checkout -q FETCH_HEAD
   ```

3. Download the prebuilt Mathlib files. This step avoids most of the Mathlib build:

   ```bash
   lake exe cache get
   ```

4. Build the probed modules:

   ```bash
   lake build Physlib.ClassicalMechanics.Pendulum.SimplePendulum.SmallAngle Physlib.ClassicalMechanics.Pendulum.SimplePendulum.PeriodFormula Physlib.ClassicalMechanics.WaveEquation.Basic
   ```

5. From the repository root, run the gate. The gate first checks that the checkout is at the
   commit and toolchain of every `formalRef.version`. Then it copies both probes into the checkout
   and leaves them there:

   ```bash
   bun run atlas:formal-gate -- --physlib <checkout> [--lake <path to lake>]
   ```

The gate prints `formalRef axiom gate: PASS` and exits 0, or prints each problem and exits 1.

## When the pin or a formalRef changes

Add each new `formalRef` theorem to `AxiomProbe.lean`. When the pin changes, update the
`version` of every `lean4-physlib` formalRef; the gate fails for a checkout at another commit. Run
the gate with `--write-captured`. The option writes new files into `captured/`. Review the new
output before you commit it.
