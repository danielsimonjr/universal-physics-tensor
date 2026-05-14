"""Build the adversarial verification prompt for Adam and Eve."""
from pathlib import Path

REPO = Path("C:/Users/danie/Dropbox/Github/universal-physics-tensor")

source_files = [
    "src/dimensional/metric.ts",
    "src/dimensional/metric-validators.ts",
    "src/dimensional/validator.ts",
    "src/dimensional/errors.ts",
    "src/bridges/equations/be-37-shapiro-delay.ts",
]
crit_high = (REPO / "docs/planning/v0.3.0-audit/crit_high.json").read_text(encoding="utf-8")

triage_notes = """\
## My (Sonnet-triage controller) spot-check of the 7 "critical" findings

Sonnet produced 7 critical findings. I manually verified each against the actual code:

| # | Sonnet claim | My verdict |
|---|---|---|
| 1 | raise()/lower() produce duplicate free-index labels | FALSE POSITIVE — freshLabel(base, taken) returns <base>_<counter>, never the bare base. The OLD gInverse labels aren't in output AST. |
| 2 | integral/derivative validators leak tensor free-indices via {...ctx} shallow spread | REAL but low impact — no tensor-valued integrand in current catalog; v0.4.0 covariant-derivative work could hit this. |
| 3 | validateKroneckerDelta silently accepts delta^mu_mu | REAL — validateMetricTensor has duplicate-label check; validateKroneckerDelta does not. |
| 4 | BE-37 pderiv dim wrong | FALSE POSITIVE — confused AST-node-level dim (none) with validator-computed dim (DIMENSIONLESS via divide(L,L)). |
| 5 | contract() is binary; BE-37 calls with 3 args | FALSE POSITIVE — contract is variadic (...args: ExprNode[]) at tensor.ts:231. |
| 6 | Drift-guard self-fulfillment via JSDoc | PARTIAL — pderiv-of-metric-composes has a real test; v030-additive-semver-minor-bump only has the JSDoc anchor, no real test. |
| 7 | metric-tensor.test.ts duplicate-label asserts wrong error class | STYLE PREFERENCE — test asserts MetricSignatureError which is what validateMetricTensor throws; the suggested DuplicateIndexError is taste. |
"""

header = """\
# UPT v0.3.0 metric-layer adversarial code-review verification

You are reviewing a Sonnet-generated code-review audit of a TypeScript library v0.3.0 release. The library is the Universal Physics Tensor (UPT) — a dimensional analyzer + 40-bridge-equation catalog. v0.3.0 adds `metric-tensor`, `kronecker-delta`, and `tensor-partial-derivative` AST nodes plus `raise()`/`lower()` helpers with internal alpha-conversion.

Sonnet flagged 156 issues (7 critical, 52 high, 64 medium, 33 low). A manual spot-check of its 7 "critical" findings revealed 3 false positives, 1 style preference, 1 partial, and 2 real-but-low-impact bugs. **High false-positive rate in the critical pile** — adversarial cross-check is needed.

Your job: independently re-audit the 59 critical+high findings against the actual source code, then add NEW catches Sonnet missed. Cap NEW findings at 5; prioritize substance over volume.

## Output format (YAML, strict — no prose outside the YAML):

```yaml
verdicts:
  - finding_index: <0-based index into the findings list below>
    file: "<file from JSON>"
    sonnet_title: "<Sonnet title>"
    verdict: "REAL" | "FALSE-POSITIVE" | "STYLE-PREFERENCE" | "NEEDS-CONTEXT"
    confidence: <0.0-1.0>
    reasoning: "<1-2 sentences with line citations from the actual code>"
    fix_priority: "blocking" | "non-blocking" | "cosmetic" | "N/A"
new_findings:
  - title: "<short>"
    file: "<path>"
    location: "<file:line>"
    severity: "critical" | "high" | "medium"
    description: "<concrete>"
    suggested_fix: "<concrete code change>"
    confidence: <0.0-1.0>
overall_take: "<2-3 sentences: how much of Sonnet's audit holds up, plus your single highest-priority concern>"
```
"""

parts = [header, triage_notes, "## Findings to verify (59 critical+high; index = position in list):", "```json", crit_high, "```", "## Source files (full contents, line numbers preserved):"]
for f in source_files:
    content = (REPO / f).read_text(encoding="utf-8")
    parts.append(f"### {f}")
    parts.append("```typescript")
    parts.append(content)
    parts.append("```")

full_prompt = "\n\n".join(parts)
out = REPO / "docs/planning/v0.3.0-audit/adversarial_prompt.txt"
out.write_text(full_prompt, encoding="utf-8")
print(f"Prompt: {len(full_prompt):,} chars (~{len(full_prompt)//4:,} tokens)")
print(f"Wrote {out}")
