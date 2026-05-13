"""Re-synthesize findings.md from the complete findings.json."""
import json, sys
from pathlib import Path
sys.path.insert(0, str(Path.home() / ".claude" / "skills" / "rlm" / "scripts"))
from rlm_query import llm_query
from audit_v030 import REPO_ROOT

results = json.loads((REPO_ROOT / "docs/planning/v0.3.0-audit/findings.json").read_text(encoding="utf-8"))

summary_input = []
for r in results:
    if "error" in r:
        summary_input.append(f"### {r['file']} (ERROR)")
        continue
    block = [f"### {r['file']}", f"Summary: {r.get('summary', '')}"]
    for f in r.get("findings", []):
        block.append(
            f"- [{f.get('severity')}] {f.get('category')}: "
            f"{f.get('title')} ({f.get('location', '?')}, conf={f.get('confidence', '?')})"
        )
        block.append(f"  desc: {f.get('description', '')}")
        block.append(f"  fix: {f.get('suggested_fix', '')}")
    if r.get("strengths"):
        block.append(f"Strengths: {'; '.join(r['strengths'])}")
    summary_input.append("\n".join(block))

prompt = (
    "Synthesize these per-file code-review findings into a single Markdown report for "
    "UPT v0.3.0 (metric layer). Sections:\n\n"
    "## Executive summary (2-3 sentences)\n"
    "## Critical findings (each with file:location, description, recommended fix)\n"
    "## High-priority findings (grouped by category)\n"
    "## Medium-priority findings (consolidated; group cross-file duplicates)\n"
    "## Low-priority findings (briefly enumerated)\n"
    "## Cross-file patterns (issues appearing in multiple files)\n"
    "## Strengths\n"
    "## Action checklist (concrete fixes ordered by ROI: high-impact / low-effort first; "
    "each item names the file and line if known)\n\n"
    "Be terse but concrete. Skip empty sections.\n\n"
    + "\n\n".join(summary_input)
)

print("Synthesizing complete report...")
report = llm_query(prompt, max_tokens=8192, temperature=0.0)
out = REPO_ROOT / "docs/planning/v0.3.0-audit/findings.md"
out.write_text(report, encoding="utf-8")
print(f"Wrote {out} ({len(report):,} chars)")
