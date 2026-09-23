# Architecture Archive — Point-in-Time Records

Dated audit reports, baselines, vet reports, release drafts, and design
notes from **v0.4.x through v0.7.x**. Each document describes the
repository as it was on the date in its own header. A reader must not
read the counts, test totals, deferred-item lists, and "current state"
claims in these files as live. Those claims are HISTORICAL.

The archive holds documents moved here on 2026-06-11 (S3 of the
post-v0.10.0 audit). On that day, the same-day 3-agent task audit read
these files as current claims and produced two false positives.
Archiving stops the next audit from repeating that mistake.

Live documents remain in `docs/architecture/`. They are ARCHITECTURE,
OVERVIEW, COMPONENTS, API, DATAFLOW, and DEPENDENCY_GRAPH (with the
generated json and yaml files). They also include TEST_COVERAGE,
benchmarks.md, the tutorials, and BRIDGE-PHYSICS-AUDIT-v2 (it carries
the standing contested-trio dispositions). The older release records
also stay live beside them: v0.8.0-catalog-adjudication,
v0.9.0-baseline, v0.9.0-phase-1-vet, and v0.9.0-tsc-tests-baseline.txt.
