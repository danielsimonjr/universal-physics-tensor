# `upt` — Universal Physics Tensor CLI

A small command-line interface over the UPT bridge-inference and
canonical-physics suite, for exploring the catalog and the composition graph
**without reading any TypeScript**.

> **Where the tool lives.** The executable is `bin/upt.mjs` (wired to the `upt`
> binary via the `"bin"` field in the root `package.json`). This `cli/` folder
> holds its documentation; it does not relocate the script, so the published
> `upt` command and all `npm run` aliases keep working unchanged.

The CLI is a thin presentation layer. Every command calls the same public API
and internal analysis modules the test-suite exercises — it fabricates nothing,
and it never mutates the catalog.

---

## Requirements

- **Node.js ≥ 18** (the package is ESM, `"type": "module"`).
- A **built checkout**. The CLI loads from `dist/`, so you must compile first:

  ```bash
  npm install
  npm run build      # tsc → dist/
  ```

  If you skip the build you'll see:

  > `Could not load the built package. Run \`npm run build\` first.`

---

## Running the CLI

There are three equivalent ways to invoke it. Pick whichever fits your setup.

| Context | Command |
|---|---|
| Built checkout (direct) | `node bin/upt.mjs <command> [args]` |
| Built checkout (npm script) | `npm run upt -- <command> [args]` |
| Installed package | `npx universal-physics-tensor <command> [args]` &nbsp;→ exposes `upt` |

When using the **`npm run upt --`** form, the `--` is required so npm forwards
the rest of the arguments to the script rather than consuming them itself.

Two convenience script aliases also exist in `package.json`:

```bash
npm run explain          # → node bin/upt.mjs explain
npm run bridge-priority  # → node bin/upt.mjs priority
```

### Quick start

```bash
# No arguments → a short demo (explains Hawking temperature, then prints the
# bridge-priority board):
node bin/upt.mjs

# Full usage text:
node bin/upt.mjs help        # also: --help, -h
```

---

## Command reference

15 commands, grouped by what they do. Several accept aliases (shown in
parentheses).

### Graph analysis & discovery

These commands operate over a **composition graph**. By default that is the
44-bridge catalog graph; with `--source` you can point them at the
standard-physics canonical graph instead (see [The `--source` flag](#the---source-flag)).

| Command (aliases) | What it does |
|---|---|
| `explain <quantity> [inputs…]` | How the graph determines a quantity: identifiability verdict, recovered value, derivation chains, dimensional sufficiency. |
| `priority` (`prioritize`, `triage`) | Triage the speculative bridges by structural **decidability** against established physics (Tiers 1–3). *Not* a credibility ranking. |
| `audit` | Try to derive every bridge by dimensions: which re-derive as a recognized monomial (prefactor recovered), which are decoys, which are dimensionally open. |
| `map` (`linkage`) | Connected components (clusters) of the graph by shared quantities — the anchored core, the link hubs, the isolated tail. With `--format=mermaid\|dot\|svg` it emits the **visual** map (quantities = nodes, equations = junctions colored by status, one subgraph per component); `svg` renders the dot layout via the optional `@viz-js/viz` peer (`npm i @viz-js/viz`). `--proposed` overlays the unadjudicated identity-consequence relations (gray dashed); `--out=PATH` writes to a file. |
| `candidates` (`propose`) | Propose cross-cluster links (same-dimension quantities in different clusters) for **physicist review**. A coincidence-heavy surface, not discovered bridges. |
| `predict` (`predictions`) | Project the catalog onto the (scale × force) regime plane and rank empty cells as undiscovered-connection hypotheses (triadic closure). |
| `discover` (`discovery`) | **Vet** the link candidates through the inference suite: hypothesise each identification `a≡b` and test whether it merges disconnected physics, unlocks quantities, and stays numerically consistent. Ranks promising / inert / magnitude-clash / contradictory. |
| `connectors` (`orphans`) | Of the isolated bridges, which could connect to the anchored core via a same-dimension identification? The structural frontier. |
| `coverage` (`grounding`) | Audit the catalog's empirical grounding — data-confronted vs graph-computable vs encoded-only vs thin. |

### Standard-physics (canonical) layer

| Command (aliases) | What it does |
|---|---|
| `canonical` (`laws`) | List the canonical-equation registry — the textbook "answer key" L-layer, each entry's fidelity (L0/L1/L2), domain, bridge partners, and the coverage gap. |
| `recover` (`recovery`, `validate`) | Validate bridges against standard physics: classify each bridge↔canonical link as `restates-canonical` (F4 circularity — *not* a discovery), `recovers` (undeclared structural match), or `dimensional-only`. |

### Symbolic composition

| Command (aliases) | What it does |
|---|---|
| `symbolic [--simplify]` (`compose-symbolic`) | Compose bridges' **symbolic** (AST) forms, not just their numeric evaluators. Shows the CT-1 / CT-1b chains, dimensionally validated and evaluable. With `--simplify`, folds the composed AST via MathTS (e.g. `k_B` cancels), re-validated. |

### Your own equations

| Command (aliases) | What it does |
|---|---|
| `eval "<formula>" name=value …` (`calc`) | Evaluate **your own** scalar formula (safe — arithmetic only). Knows `pi`/`tau` and `sqrt`/`exp`/`ln`/`sin`/…; any other name must be supplied. |
| `derive <target:dim> <var:dim> … [--formula "<expr>"]` (`dim`) | Derive **your own** equation's dimensional form, and (with `--formula`) verify it and recover the dimensionless prefactor. |

### Help

| Command | What it does |
|---|---|
| `help` (`--help`, `-h`) | Print the built-in usage text. |
| *(no arguments)* | Run a short demo. |

---

## The `--source` flag

`discover`, `candidates`, and `map` accept `--source=<which>` to choose which
graph the analysis runs over:

| Value | Graph |
|---|---|
| `catalog` *(default)* | The 44-bridge catalog graph (8 established + 36 speculative bridges). |
| `canonical` | The standard-physics **L-layer alone** — every canonical equation as an `established` law edge, **with the speculative bridges excluded**. |
| `both` | The bridges **plus** the canonical established-physics backbone. |

Running on `canonical` does two things:

1. **Finds candidates from established physics only** — e.g.
   `compton-wavelength ≟ de-broglie-wavelength` — without the speculation that
   pollutes the catalog run.
2. **Acts as a self-consistency check.** Standard physics, fed to the inference
   suite, must introduce no contradiction — so `discover --source=canonical`
   should report **0 contradictory** verdicts.

```bash
# Run the discovery funnel on textbook physics alone:
node bin/upt.mjs discover --source=canonical

# Map the canonical graph's clusters:
node bin/upt.mjs map --source=canonical

# Bridges + canonical backbone together:
node bin/upt.mjs candidates --source=both
```

An unrecognised value exits with an error and status `1`.

---

## Worked examples

```bash
# Explain how Hawking temperature is determined from a solar mass:
node bin/upt.mjs explain hawking-temperature mass=1.989e30

# Triage which speculative bridges are closest to being decidable:
node bin/upt.mjs priority

# List the canonical registry and the bridge↔canonical recovery scan:
node bin/upt.mjs canonical
node bin/upt.mjs recover

# Render the physics map. Mermaid (renders inline in GitHub/Markdown):
node bin/upt.mjs map --source=both --format=mermaid --out=docs/architecture/maps/both.mmd
# SVG in one step (needs the optional @viz-js/viz peer — npm i @viz-js/viz):
node bin/upt.mjs map --source=both --format=svg --out=both.svg
# ...or DOT → SVG via a system Graphviz instead of the peer:
node bin/upt.mjs map --source=both --format=dot | dot -Tsvg > both.svg
# Overlay the unadjudicated proposed relations (gray dashed):
node bin/upt.mjs map --source=both --proposed --format=mermaid

# Compose symbolic bridge forms, then simplify the composed AST:
node bin/upt.mjs symbolic --simplify

# Evaluate your own formula (Hawking temperature, SI units):
node bin/upt.mjs eval "hbar*c^3/(8*pi*G*M*k_B)" \
    hbar=1.054571817e-34 c=299792458 G=6.6743e-11 \
    M=1.989e30 k_B=1.380649e-23

# Derive your own equation's dimensional form and recover its prefactor:
node bin/upt.mjs derive period:time length:length gravity:acceleration \
    --formula "2*pi*sqrt(length/gravity)"
```

### Input syntax notes

- **`explain` inputs** are either a set of `name=value` pairs (numeric anchor,
  used to recover values) **or** a set of bare `name`s (treated as "known but
  unmeasured"). If any argument carries a numeric value, the whole set is read
  as values; otherwise as names.
- **`eval`/`derive`** read `name=value` pairs for the supplied variables.
- A **`<dim>`** in `derive` is a named dimension (`length`, `time`, `mass`,
  `velocity`, …), a constant (`hbar`, `c`, `G`, `k_B`, `e`), or an explicit
  exponent form like `L^3.M^-1.T^-2`.

---

## Reading the output

The discovery-style commands print **review surfaces, not discoveries**. A
`promising` verdict means "worth a physicist's minute", not "true"; a shared
dimension is a weak prior. The commands say so in their own headers — take them
at their word. The triage/`priority` ranking is about **decidability**, which is
orthogonal to whether a bridge is correct.

---

## Flags summary

| Flag | Commands | Effect |
|---|---|---|
| `--source=catalog\|canonical\|both` | `discover`, `candidates`, `map` | Choose the graph (default `catalog`). |
| `--format=text\|mermaid\|dot\|svg` | `map` | Output format. `text` (default) is the linkage printout; `mermaid`/`dot` emit the visual map source; `svg` renders it (needs the optional `@viz-js/viz` peer). |
| `--proposed` | `map` (with `--format`) | Overlay the unadjudicated identity-consequence relations as gray-dashed junctions. |
| `--out=PATH` | `map` (with `--format`) | Write the diagram source to a file instead of stdout. |
| `--simplify` | `symbolic` | Fold the composed AST via MathTS. |
| `--formula "<expr>"` | `derive` | Verify the derived form and recover its dimensionless prefactor. |
| `--debug` | `eval`, `derive` | Print the active formula-parser kind to stderr. |

## Exit codes

| Code | Meaning |
|---|---|
| `0` | Success. |
| `1` | Bad `--source`/`--format` value, empty `--out=`, the optional SVG renderer is missing, or the built package could not be loaded. |
| `2` | Usage error (missing required argument, parse error, unknown command). |

---

## Troubleshooting

- **"Could not load the built package."** Run `npm run build` first — the CLI
  imports from `dist/`, not from `src/`.
- **Windows cold-start.** The test suite (run by `prepublishOnly`) has a 3–5 min
  cold-start tax on Windows; the CLI itself does not, but publishing uses
  `npm publish --ignore-scripts` to skip it. The CLI resolves `dist/` paths via
  `pathToFileURL`, so absolute Windows paths work under Node's ESM loader.
- **`npm run upt` swallows my flags.** Use the `--` separator:
  `npm run upt -- discover --source=canonical`.
