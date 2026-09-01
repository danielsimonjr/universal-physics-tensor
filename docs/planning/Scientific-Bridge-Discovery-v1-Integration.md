# Scientific Bridge Discovery v1 — Integration note (Phase 0A)

This note records how Product B (expression / residual search) sits next to the
shipped Product A identification funnel. It is the Phase 0A integration artifact
required by `Scientific-Bridge-Discovery-v1.md`.

## Two products, one CLI family

| Product | Code | CLI | Candidate type | Frozen? |
|---|---|---|---|---|
| **A — quantity identification** | `src/composition/discovery.ts` | `upt discover` | `VettedCandidate` (`a ≡ b`) | **Yes.** Do not morph into an AST generator. Pinned funnel 132 / 7 promising / 35 inert / 20 magnitude-clash / 0 contradictory / 70 axis-clash. Human adjudications 0/8 genuine. Permanent ceiling: `mechanismTested: false`, `dataTested: false`. |
| **B — expression / residual search** | `src/composition/probe/` | `upt probe <subverb>` | `ProbeCandidateRecord` (`h-*`) | **Experimental.** Orthogonal types, stores, and stop reasons. |

`upt candidates`, `upt ground`, `upt connectors`, and `upt predict` remain Product A
review surfaces. Relation-link and regime-transition gaps wrapped by
`scanFrontier()` set `searchability.searchable = false`; `upt probe run` abstains
with `stopReason: 'non-identifiable'` and tells the caller to use `upt discover`.

## Identifiability is two questions

- **Graph-structural** — `classifyIdentifiability()` on the composition graph (Product A).
- **Parametric** — Jacobian / design-matrix rank vs locked observations (Product B).

Do not translate one into the other. A relation-link gap can be graph-interesting
and still non-searchable as an expression problem.

## Run artifacts

- Schema: `data/schemas/discovery-run.v0.json` (`schemaVersion: "0"`).
- Run ids: `dr-*`. Gap ids: `fg-*`. Hypothesis ids: `h-*`.
- Manifests capture problem hash, dataset hashes, budget, environment, stop reason.
- `no-credible-candidate` is a **success** (honest abstention), not a crash.

## Holdout / MHC

Generation and prefactor fit see **exploratory** rows only
(`DatasetRole: 'exploratory-fit'`). Holdout must be `validation-holdout` or
`external-replication`. Overlapping rows throw. Theoretical-only (no data) stops
at `insufficient-evidence` or `equivalent-known` (corpus match) — never
`heldout-supported`.

## Corpus wording

Novelty sentences are always corpus-relative (`normalForm` vs the L-layer and
bridge RHS map). Algebraic match after holdout support is `equivalent-known`,
not a discovery claim. The automated sentence includes
`SCIENTIFIC NOVELTY NOT ESTABLISHED` when no match is found.

## Family B fixtures

Hand-authored cases live under `tests/fixtures/discovery/<case>/{public,scorer}/`.
Nothing under `src/` may import `scorer/` (enforced by
`tests/composition/probe/import-graph.test.ts`).

## Public surface

Probe is **not** re-exported from `src/index.ts`. Import the experimental subpath
`universal-physics-tensor/probe` or use `upt probe`. Symbols stay `@internal`.

## What was not built

- No `src/research/`, no in-tree Python/SINDy/PySR, no in-package workbench.
- No npm `1.0.0` — "v1" is the program name.
- Structure probes never flip `axes.ts` `gated`.
- Metadata overlay lives in `probe/metadata.ts`, not `src/canonical/` (cycle).
