# Scientific Bridge Discovery v1 — Plan Audit Record

This audit accompanies the corrected `Scientific-Bridge-Discovery-v1.md` roadmap.

## Scope

The roadmap was reviewed against the merged UPT codebase rather than as a standalone design document. The review checked architectural fit, existing type and module reuse, scientific claim semantics, statistical methodology, search complexity, persistence, external-process safety, testing, benchmarks, reproducibility, and implementation dependency order.

## Principal corrections

- Removed the proposed parallel `constraints/`, `discovery/`, and `evidence/` subsystem architecture in favor of extending `core`, `canonical`, `dimensional`, `composition`, `bridges`, and `diff`.
- Replaced the universal `ScientificLaw` concept with an additive `ScientificRelationRecord` metadata envelope over existing authoritative relation types.
- Generalized pairwise `BridgeGap` into typed `FrontierGap` objects that can represent theory/observation, multi-model, regime, parameter, assumption, operator, and causal-mechanism gaps.
- Generalized residual discovery beyond additive subtraction to covariance-standardized, likelihood, vector/tensor, operator, distributional, and custom discrepancy semantics.
- Made unknown/not-applicable/not-yet-audited metadata explicit so catalog migration cannot fabricate assumptions or evidence.
- Restricted automated novelty claims to corpus-relative equivalence results.
- Restricted formal certificates to their declared mathematical fragment and assumptions.
- Restricted causal language to explicit causal/interventional semantics.
- Added exploratory-vs-confirmatory dataset roles, holdout leakage prevention, and multiple-hypothesis controls.
- Added canonicalized negative-result memory with regime/assumption context.
- Added hard search budgets, explicit stop reasons, and a valid no-credible-candidate/abstention outcome.
- Added external-backend isolation, a versioned worker protocol, output validation, and resource/security limits.
- Added versioned persistence schemas, migrations, and canonical serialization requirements.
- Added blind rediscovery benchmarks plus null-science/confounding/underdetermination benchmarks.
- Added feasibility, cost, systematic uncertainty, nuisance parameters, and forbidden-region constraints to experiment design.
- Corrected reproducibility language to distinguish bitwise, numerical, statistical, and replayable runs.
- Reordered implementation to begin with an integration ADR and benchmark/falsification specification before new production data models or ML backends.

## Review outcome

The corrected roadmap is suitable to drive implementation subject to phase-specific architecture and scientific review gates. Strategic phases remain separate from the release-blocking `ACTIVE.md` backlog until a tranche is explicitly authorized for implementation.
