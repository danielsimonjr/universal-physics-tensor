## Criterion 3 — recall at depth 10 (INTERIM, pre-registration Amendment 8)

**INTERIM: there is no criterion verdict yet.** The criterion compares typed structural search with
the EMBEDDING condition, and the embedding condition has not run: it waits for LLMBench, and it
will be scored from frozen vectors. The three in-process conditions below ran after Amendment 8
was committed (`d99dcc9`) and its CI run was green (run 36028162207, success, 2026-09-24T16:36:15Z).

MODEL labels (two blind `claude-opus-5-5` labelers), not human labels. Recall at depth 10 with Wilson
95% intervals. The criterion is evaluated on PRIMARY, all families. Fluid statics is the held-out family.
Reproduce: `bun tools/criterion3-study/run.ts --write`. The runner checks the file hashes and the code
blobs that Amendment 8 pins, so a rerun scores the same inputs with the same ranking code.

### PRIMARY (n = 50: the exact-agreement non-empty queries)

| Group | n | text retrieval | symbol matching | typed structural search |
|---|---|---|---|---|
| all families | 50 | 34/50 = 68.0% [54.2%, 79.2%] | 12/50 = 24.0% [14.3%, 37.4%] | 12/50 = 24.0% [14.3%, 37.4%] |
| in-distribution families | 30 | 20/30 = 66.7% [48.8%, 80.8%] | 0/30 = 0.0% [0.0%, 11.4%] | 0/30 = 0.0% [0.0%, 11.4%] |
| diffusion | 6 | 2/6 = 33.3% [9.7%, 70.0%] | 0/6 = 0.0% [0.0%, 39.0%] | 0/6 = 0.0% [0.0%, 39.0%] |
| oscillators | 12 | 7/12 = 58.3% [32.0%, 80.7%] | 0/12 = 0.0% [0.0%, 24.2%] | 0/12 = 0.0% [0.0%, 24.2%] |
| waves | 12 | 11/12 = 91.7% [64.6%, 98.5%] | 0/12 = 0.0% [0.0%, 24.2%] | 0/12 = 0.0% [0.0%, 24.2%] |
| fluid-statics (held out) | 20 | 14/20 = 70.0% [48.1%, 85.5%] | 12/20 = 60.0% [38.7%, 78.1%] | 12/20 = 60.0% [38.7%, 78.1%] |

### SECONDARY (n = 64: PRIMARY plus the 14 partial overlaps, truth = the intersection)

| Group | n | text retrieval | symbol matching | typed structural search |
|---|---|---|---|---|
| all families | 64 | 46/64 = 71.9% [59.9%, 81.4%] | 15/64 = 23.4% [14.7%, 35.1%] | 15/64 = 23.4% [14.7%, 35.1%] |
| in-distribution families | 34 | 24/34 = 70.6% [53.8%, 83.2%] | 0/34 = 0.0% [0.0%, 10.2%] | 0/34 = 0.0% [0.0%, 10.2%] |
| diffusion | 7 | 3/7 = 42.9% [15.8%, 75.0%] | 0/7 = 0.0% [0.0%, 35.4%] | 0/7 = 0.0% [0.0%, 35.4%] |
| oscillators | 13 | 8/13 = 61.5% [35.5%, 82.3%] | 0/13 = 0.0% [0.0%, 22.8%] | 0/13 = 0.0% [0.0%, 22.8%] |
| waves | 14 | 13/14 = 92.9% [68.5%, 98.7%] | 0/14 = 0.0% [0.0%, 21.5%] | 0/14 = 0.0% [0.0%, 21.5%] |
| fluid-statics (held out) | 30 | 22/30 = 73.3% [55.6%, 85.8%] | 15/30 = 50.0% [33.2%, 66.8%] | 15/30 = 50.0% [33.2%, 66.8%] |

### Instrument facts (computed by the runner from the same inputs; PRIMARY)

- **The typed structural tier never fires.** The structural keys of a query and a record are equal in 0 of the 11125 query × record pairs. Typed structural search therefore reduces to its symbol-overlap tie-break, which is why its column equals symbol matching.
- **The two sides encode different things.** 123 of 125 queries store the claim as a residual `lhs − rhs` (a top-level difference). A canonical `scalarAst` stores the right-hand side of one target. The normal forms of a residual and of a right-hand side are never equal.
- **Symbol names follow different conventions.** A query writes physics notation (`k_B`, `rho_0`); a canonical entry writes descriptive names (`boltzmann-constant`, `density`). 11 of 50 truth queries share at least one symbol name with a correct reference.
- **Some references have no expression.** 33 of 50 truth queries have a correct reference with an expression. The others cannot be found by either expression condition.
- **What the symbol matching hits rest on.** Its 12 hits share the symbol name(s) `g` with a correct reference. 1 hit(s) (q-043) share no name and reach the top 10 only through the id tie-break.
- **What the typed structural search hits rest on.** Its 12 hits share the symbol name(s) `g` with a correct reference. 1 hit(s) (q-043) share no name and reach the top 10 only through the id tie-break.
- These are facts about the pre-registered conditions as pinned. The conditions are not changed after the
  results; a corrected structural condition would need its own amendment and would be exploratory.

## Criterion 3 — EXPLORATORY, post hoc: typed structural search on residual forms (pre-registration Amendment 9)

**EXPLORATORY and POST HOC. This is NOT the criterion, and it never replaces it.** Amendment 9 registered
this condition after the in-process results above were seen. The criterion verdict stays on the
conditions as pinned in Amendment 8. The corrected condition compares each claim, as stored
(`lhs − rhs`), with each canonical entry in residual form (`target − scalarAst`). The structural key
and the scoring are unchanged. It ran after Amendment 9 was committed (`dbd4e95`)
and its CI run was green (run 36035392889, success, 2026-09-24T17:38:41Z). Same truth sets, same pool, same metric.

### PRIMARY (n = 50)

| Group | n | typed structural search (as pinned) | typed structural search, residual form (EXPLORATORY) |
|---|---|---|---|
| all families | 50 | 12/50 = 24.0% [14.3%, 37.4%] | 12/50 = 24.0% [14.3%, 37.4%] |
| in-distribution families | 30 | 0/30 = 0.0% [0.0%, 11.4%] | 0/30 = 0.0% [0.0%, 11.4%] |
| diffusion | 6 | 0/6 = 0.0% [0.0%, 39.0%] | 0/6 = 0.0% [0.0%, 39.0%] |
| oscillators | 12 | 0/12 = 0.0% [0.0%, 24.2%] | 0/12 = 0.0% [0.0%, 24.2%] |
| waves | 12 | 0/12 = 0.0% [0.0%, 24.2%] | 0/12 = 0.0% [0.0%, 24.2%] |
| fluid-statics (held out) | 20 | 12/20 = 60.0% [38.7%, 78.1%] | 12/20 = 60.0% [38.7%, 78.1%] |

### SECONDARY (n = 64)

| Group | n | typed structural search (as pinned) | typed structural search, residual form (EXPLORATORY) |
|---|---|---|---|
| all families | 64 | 15/64 = 23.4% [14.7%, 35.1%] | 14/64 = 21.9% [13.5%, 33.4%] |
| in-distribution families | 34 | 0/34 = 0.0% [0.0%, 10.2%] | 0/34 = 0.0% [0.0%, 10.2%] |
| diffusion | 7 | 0/7 = 0.0% [0.0%, 35.4%] | 0/7 = 0.0% [0.0%, 35.4%] |
| oscillators | 13 | 0/13 = 0.0% [0.0%, 22.8%] | 0/13 = 0.0% [0.0%, 22.8%] |
| waves | 14 | 0/14 = 0.0% [0.0%, 21.5%] | 0/14 = 0.0% [0.0%, 21.5%] |
| fluid-statics (held out) | 30 | 15/30 = 50.0% [33.2%, 66.8%] | 14/30 = 46.7% [30.2%, 63.9%] |

### Instrument facts for the EXPLORATORY condition (computed by the runner; PRIMARY)

- **Structural keys now match in 4 of the 11125 query × record pairs** (0 as pinned).
- **Of its 12 hits, 4 were placed by a structural key match** (q-072, q-082, q-105, q-107); the rest came from the symbol-overlap tie-break.
- 1 hit(s) (q-043) share no symbol name with a correct reference and match no key: they reach the top 10 only through the id tie-break.
- **Stated limitation:** no symbol-alias map was added. Query notation (`k_B`, `rho_0`) and canonical names
  (`boltzmann-constant`, `density`) still differ in the symbol-overlap tier. An alias map would be a knob
  fitted to these results.

