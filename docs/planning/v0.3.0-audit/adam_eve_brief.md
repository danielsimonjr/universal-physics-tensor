# Adversarial verification brief — Adam (Gemini 2.5 Pro) + Eve (OpenAI o3-mini)

## Job

Independently verify a Sonnet-generated code-review audit of UPT v0.3.0
(metric-layer release). The audit (in `findings.json`) flagged 156 issues
across 18 files but a manual spot-check of the 7 "critical" findings found
**3 false positives, 1 style preference, 1 partial, and 2 real-but-low-impact
bugs**. Your job: independently re-audit the same files and classify each
"high" and "critical" finding as REAL / FALSE-POSITIVE / STYLE-PREFERENCE.

## Inputs

- Repo: `https://github.com/danielsimonjr/universal-physics-tensor` at tag `v0.3.0`
- Audit findings: `docs/planning/v0.3.0-audit/findings.json` (the raw per-file JSON)
- Synthesized report: `docs/planning/v0.3.0-audit/findings.md`
- Source files (v0.3.0 deltas):
  - `src/dimensional/metric.ts` — raise/lower with alpha-conversion
  - `src/dimensional/metric-validators.ts` — 3 new validators
  - `src/dimensional/validator.ts` — extended ExprNode union
  - `src/dimensional/errors.ts` — 5 new error classes
  - `src/bridges/equations/be-37-shapiro-delay.ts` — eikonal structural form
  - `docs/specification/Part-VIII-Metric-Layer.md` — spec (25 TENSOR-RULE markers)
- Design context: `docs/planning/v0.3.0-Design.md`, `docs/planning/v0.3.0-Implementation-Plan.md`, `docs/planning/v0.3.0-Bridge-Selection.md`

## What I want from each of you

For each "critical" and "high" finding in `findings.json`:

1. **Verdict**: REAL / FALSE-POSITIVE / STYLE-PREFERENCE / NEEDS-MORE-CONTEXT
2. **Confidence**: 0.0–1.0
3. **Reasoning**: 1-2 sentences citing the actual code (line numbers welcome)
4. **Fix priority** (if REAL): blocking (must fix before v0.3.5) / non-blocking (queue for v0.3.1) / cosmetic

Plus, NEW catches Sonnet missed: anything you spot that wasn't in `findings.json`
— bug, simplification, API ergonomics, forward-compat concern, missing test.
Cap NEW findings at 5; prioritize substance over volume.

## Specific spots Sonnet was confused about (my triage)

Sonnet got these wrong (per my verification):

- **CRIT-1 (raise/lower duplicate-label)**: claimed `taken` set lacks metric's own labels.
  But `freshLabel(base, taken)` produces `<base>_<counter>` never the bare base.
  The OLD gInverse labels aren't in output AST. → FALSE POSITIVE per my read.
- **CRIT-4 (BE-37 pderiv dim wrong)**: confused AST-node-level dim (none) with
  validator-computed dim (DIMENSIONLESS via `divide(LENGTH, LENGTH)`). → FALSE POSITIVE.
- **CRIT-5 (contract() binary)**: claimed contract has 2-arg API. Actually variadic
  `contract(...args: ExprNode[])` at `src/dimensional/tensor.ts:231`. → FALSE POSITIVE.

Sonnet got these right (per my verification):

- **CRIT-3 (Kronecker δ^μ_μ accepted)**: `validateKroneckerDelta` doesn't check
  `a.label === b.label`. `validateMetricTensor` has the check; Kronecker doesn't.
  → REAL, one-line fix.
- **CRIT-2 (integral/derivative ctx spread)**: `{...ctx}` shallow spread shares
  `freeIndices` Map by reference. `validator.ts` lines 432-433, 450-451.
  → REAL but low-impact (no current bridge has tensor integrand).

I want your fresh-eyes call on the rest plus any NEW catches.

## Output format

```yaml
verdicts:
  - finding_id: "<file-path>:<finding-index>"
    category: "<from JSON>"
    sonnet_severity: "<critical|high>"
    your_verdict: "REAL|FALSE-POSITIVE|STYLE-PREFERENCE|NEEDS-MORE-CONTEXT"
    confidence: 0.0-1.0
    reasoning: "<1-2 sentences with line citations>"
    fix_priority: "blocking|non-blocking|cosmetic|N/A"
new_findings:
  - title: "<short>"
    file: "<path>"
    location: "<file:line>"
    category: "<from same enum as JSON>"
    severity: "critical|high|medium|low"
    description: "<concrete>"
    suggested_fix: "<concrete>"
    confidence: 0.0-1.0
overall_take: "<2-3 sentences: how much of Sonnet's audit holds up, plus 1 highest-impact thing you saw>"
```
