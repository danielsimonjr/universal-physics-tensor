# Atlas governance

How the atlas under `src/atlas/` is maintained, how disputed entries are handled, how
contributions arrive, and what licence covers the code and the data. ROADMAP Phase 6, S6.6.

## 1. Maintainers

| Scope | Maintainer |
|---|---|
| All atlas families (`oscillators`, `diffusion`, `waves`) and the atlas infrastructure | Daniel Simon Jr. (@danielsimonjr) |
| The invalid-bridge benchmark's frozen item set | Independent authors, TO BE NAMED in the pre-registration note |

A maintainer decides whether a record is admitted, but a record's evidence is never the
maintainer's to set. `formally-proved` and `symbolically-checked` are DERIVED from artifacts, and
a file allow-list test forbids spelling either tag anywhere a record could set it. A maintainer
decision can change `reviewStatus` from `proposed` to `reviewed`. It cannot change a tag.

**The held-out family, fluid statics, has no maintainer on purpose.** It must not be added to
`src/atlas/` while the benchmark is live (`docs/planning/Atlas-Phase-5-Design.md` §4).

## 2. Contested entries

An entry is CONTESTED when a reviewer disputes its relation type, a side condition, a bound, a
witness or a citation.

1. The dispute is filed as an issue that names the record id and the specific field.
2. The record stays in the atlas and keeps `reviewStatus: 'proposed'`. A disputed record is
   never silently removed. A removal is a new record: an `AtlasRejection` carrying the refuting
   argument and a witness, as `ax-cubic-spring-lc` does.
3. When the dispute resolves against the record, it is either CORRECTED in place, with the
   correction and its reason in `CHANGELOG.md`, or REJECTED as above. It is never quietly
   weakened.
4. A benchmark item that the two raters dispute goes to `contested/`. It is not frozen and not
   scored.

The atlas's own history holds the precedents. A pendulum bound was violated at its own domain
edge, and it was corrected by computing the exact supremum. Two internal reviewers returned one
wrong verdict each, and both verdicts were recorded, not erased.

## 3. Contributions

**Small pull requests, one claim each.** One bridge per pull request. A bridge PR carries its
record, the numeric or symbolic witnesses that support it (measured at two or more resolutions
before any tolerance is written), a negative control, and a test file that names each witness
id. The same PR runs every gate:

- `bun run test`, and `tsc` on both the source and the tests;
- `bun run atlas:json` and `bun run atlas:witness-results` regenerated and committed, since the
  freshness tests fail otherwise;
- `bun run docs:deps` with 0 circular dependencies;
- a `CHANGELOG.md` entry.

A formal reference is accepted only with its axioms measured by `#print axioms` on a real build,
and with a fidelity other than `unreviewed` established by the route its field names. A benchmark
item is accepted into the frozen set only from an independent author (Phase 5 design note §0).
No agent authors a frozen item.

`CONTRIBUTING.md` lists the bounded physics-review tasks open to physicists who do not read
TypeScript.

## 4. Licensing

- **Code:** MIT (`LICENSE`).
- **Data** (`data/atlas/*.json`, `*.jsonld`, `qudt-resolution.json`, `witness-results.json`): in
  the repository, and covered by its `LICENSE` unless a separate data licence is chosen. **A
  separate data licence, such as a Creative Commons licence for the exported atlas, is an owner
  decision.** This note does not choose one.
- **Benchmark items:** contributed into this repository under its licence unless the
  pre-registration note records otherwise by amendment.
- **Formal references** point at external proof libraries under their own licences. UPT records
  the reference and does not vendor the proof.
