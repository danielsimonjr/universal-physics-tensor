"""
v0.3.0 RLM code-review audit.

LOAD all v0.3.0 src + test + spec files → EXAMINE structure → PROCESS each file
through Sonnet with a structured code-review prompt → AGGREGATE findings into a
single synthesized report.

Run from: C:/Users/danie/Dropbox/Github/universal-physics-tensor
Output:   docs/planning/v0.3.0-audit/findings.json + findings.md

Cache: $TEMP/.rlm_cache (SHA256-keyed; re-runs free).
"""

from __future__ import annotations

import json
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Any

# Locate the RLM scripts directory and import llm_query.
sys.path.insert(0, str(Path.home() / ".claude" / "skills" / "rlm" / "scripts"))
from rlm_query import llm_query  # noqa: E402

REPO_ROOT = Path("C:/Users/danie/Dropbox/Github/universal-physics-tensor")

# Files added or substantially modified in v0.3.0 (diff vs v0.2.1).
V030_FILES = [
    # --- Source (substantive logic) ---
    "src/dimensional/metric.ts",                   # raise/lower alpha-conversion + constructors
    "src/dimensional/metric-validators.ts",         # 3 new validators
    "src/dimensional/validator.ts",                 # extended ExprNode union + resolveChildForPartialDerivative
    "src/dimensional/errors.ts",                    # 5 new classes + refreshed VarianceMismatchError
    "src/bridges/equations/be-37-shapiro-delay.ts", # eikonal structural form

    # --- Spec ---
    "docs/specification/Part-VIII-Metric-Layer.md",

    # --- Tests (v0.3.0 new files) ---
    "tests/dimensional/metric-tensor.test.ts",
    "tests/dimensional/kronecker-delta.test.ts",
    "tests/dimensional/tensor-partial-derivative.test.ts",
    "tests/dimensional/metric-helpers.test.ts",
    "tests/dimensional/raise-lower.test.ts",
    "tests/dimensional/metric-validation-errors.test.ts",
    "tests/dimensional/error-message-discoverability.test.ts",
    "tests/dimensional/part-viii-spec-vs-impl.test.ts",
    "tests/dimensional/metric-ast-serialization.test.ts",
    "tests/dimensional/covariant-derivative-preview.test.ts",
    "tests/dimensional/inverse-metric-consistency.test.ts",
    "tests/bridges/be-37-shapiro-eikonal-structural.test.ts",
]

AUDIT_SYSTEM = """\
You are a senior TypeScript engineer reviewing a v0.3.0 metric-layer release of \
the Universal Physics Tensor library — a dimensional analyzer + 40-bridge-equation \
catalog with a tensor algebra layer (variance-typed indices, Einstein contraction). \
v0.3.0 adds metric-tensor, kronecker-delta, and tensor-partial-derivative AST nodes, \
plus raise/lower helpers with internal alpha-conversion. The library is a \
forward-compat prerequisite for v0.3.5 (mathjs numerical backend) and v0.4.0 \
(Christoffel symbols, covariant derivative).

Output STRICT JSON only (no prose outside the JSON). Schema:
{
  "file": "<file path>",
  "summary": "<1-2 sentence high-level take>",
  "findings": [
    {
      "category": "bug" | "simplification" | "performance" | "api-ergonomics" | "forward-compat" | "test-coverage" | "doc-clarity",
      "severity": "critical" | "high" | "medium" | "low",
      "title": "<short title>",
      "location": "<file:line or section if known>",
      "description": "<concrete, actionable>",
      "suggested_fix": "<concrete code change or N/A>",
      "confidence": <0.0-1.0>
    }
  ],
  "strengths": ["<bullet>", ...]
}

Rules:
- Be CONCRETE: name specific functions, line numbers, identifiers
- Mark confidence honestly: 1.0 only when you can point at a literal bug
- Distinguish "actual bug" from "style preference" — the latter belongs in "simplification"
- DO NOT invent issues to pad the count. Zero findings is a valid output if the file is genuinely clean.
- DO NOT comment on the v0.2.x baseline — only on v0.3.0 deltas
- For tests: check whether the test actually exercises what its name claims, not just code coverage
- For the spec doc: check whether the TENSOR-RULE invariants are implementable and complete
"""


def audit_file(rel_path: str) -> dict[str, Any]:
    """Audit one file through Sonnet. Returns the parsed JSON verdict."""
    full = REPO_ROOT / rel_path
    if not full.exists():
        return {"file": rel_path, "error": "file not found"}

    code = full.read_text(encoding="utf-8", errors="replace")
    prompt = (
        f"Audit this v0.3.0 file: `{rel_path}`\n\n"
        f"```{'typescript' if rel_path.endswith('.ts') else 'markdown'}\n"
        f"{code}\n```"
    )

    try:
        raw = llm_query(prompt, system=AUDIT_SYSTEM, max_tokens=4096, temperature=0.0)
    except Exception as e:
        return {"file": rel_path, "error": f"llm_query failed: {e}"}

    # Strip code-fence wrapper if Sonnet returned ```json ... ```
    stripped = raw.strip()
    if stripped.startswith("```"):
        stripped = stripped.split("\n", 1)[1] if "\n" in stripped else stripped
        if stripped.endswith("```"):
            stripped = stripped[: -3]
        if stripped.startswith("json"):
            stripped = stripped[4:].strip()

    try:
        parsed = json.loads(stripped)
        parsed.setdefault("file", rel_path)
        return parsed
    except json.JSONDecodeError as e:
        return {"file": rel_path, "error": f"JSON parse failed: {e}", "raw": raw[:1000]}


def main() -> None:
    out_dir = REPO_ROOT / "docs" / "planning" / "v0.3.0-audit"
    out_dir.mkdir(parents=True, exist_ok=True)

    print(f"Auditing {len(V030_FILES)} files in parallel (workers=6)...")
    results: list[dict[str, Any]] = []
    with ThreadPoolExecutor(max_workers=6) as pool:
        futures = {pool.submit(audit_file, f): f for f in V030_FILES}
        for fut in as_completed(futures):
            rel = futures[fut]
            try:
                r = fut.result()
            except Exception as e:
                r = {"file": rel, "error": f"executor exception: {e}"}
            n = len(r.get("findings", [])) if "findings" in r else "ERR"
            print(f"  [{n}] {rel}")
            results.append(r)

    # Persist raw findings
    findings_path = out_dir / "findings.json"
    findings_path.write_text(json.dumps(results, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\nRaw findings -> {findings_path}")

    # Aggregate: prepare a compact summary for the synthesizer
    summary_input = []
    for r in results:
        if "error" in r:
            summary_input.append(f"### {r['file']} (ERROR: {r['error']})")
            continue
        block = [f"### {r.get('file')}", f"Summary: {r.get('summary', '')}"]
        for f in r.get("findings", []):
            block.append(
                f"- [{f.get('severity')}] {f.get('category')}: "
                f"{f.get('title')} ({f.get('location', '?')}, "
                f"conf={f.get('confidence', '?')})"
            )
            block.append(f"  desc: {f.get('description', '')}")
            block.append(f"  fix: {f.get('suggested_fix', '')}")
        if r.get("strengths"):
            block.append(f"Strengths: {'; '.join(r['strengths'])}")
        summary_input.append("\n".join(block))

    SYNTH_PROMPT = (
        "You are synthesizing per-file code-review findings from a Sonnet RLM audit "
        "of UPT v0.3.0 (metric layer). Produce a single Markdown report with these "
        "sections:\n\n"
        "## Executive summary (2-3 sentences)\n"
        "## Critical & High findings (sorted by severity, deduplicated across files)\n"
        "## Medium findings (grouped by category)\n"
        "## Low findings (grouped by category)\n"
        "## Cross-file patterns (issues that appear in multiple files)\n"
        "## Strengths\n"
        "## Action checklist (concrete next-steps, ordered by ROI: high impact / low effort first)\n\n"
        "Be terse. Cite file:line when available. Skip categories with zero entries.\n\n"
        "Per-file findings:\n\n"
        + "\n\n".join(summary_input)
    )

    print("\nSynthesizing aggregated report...")
    synthesis = llm_query(SYNTH_PROMPT, max_tokens=6000, temperature=0.0)

    report_path = out_dir / "findings.md"
    report_path.write_text(synthesis, encoding="utf-8")
    print(f"Synthesized report -> {report_path}")

    # Print summary stats
    total_findings = sum(len(r.get("findings", [])) for r in results if "findings" in r)
    by_sev: dict[str, int] = {}
    for r in results:
        for f in r.get("findings", []):
            sev = f.get("severity", "?")
            by_sev[sev] = by_sev.get(sev, 0) + 1
    print(f"\n=== Summary ===")
    print(f"Total findings: {total_findings}")
    for sev in ["critical", "high", "medium", "low"]:
        if sev in by_sev:
            print(f"  {sev}: {by_sev[sev]}")
    errors = [r["file"] for r in results if "error" in r]
    if errors:
        print(f"Errors (files not audited): {errors}")


if __name__ == "__main__":
    main()
