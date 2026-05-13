"""Two-tier synthesis: (1) group → bucket summaries, (2) merge buckets → final report."""
import json, sys
from pathlib import Path
sys.path.insert(0, str(Path.home() / ".claude" / "skills" / "rlm" / "scripts"))
from rlm_query import llm_query
from audit_v030 import REPO_ROOT

results = json.loads((REPO_ROOT / "docs/planning/v0.3.0-audit/findings.json").read_text(encoding="utf-8"))

BUCKETS = {
    "source": lambda f: f.startswith("src/"),
    "tests": lambda f: f.startswith("tests/"),
    "spec": lambda f: f.startswith("docs/"),
}

def render(r: dict) -> str:
    if "error" in r:
        return f"### {r['file']} (ERROR)"
    lines = [f"### {r['file']}", f"Summary: {r.get('summary', '')}"]
    for f in r.get("findings", []):
        lines.append(
            f"- [{f.get('severity')}] {f.get('category')}: "
            f"{f.get('title')} ({f.get('location', '?')}, conf={f.get('confidence', '?')})"
        )
        lines.append(f"  desc: {f.get('description', '')}")
        lines.append(f"  fix: {f.get('suggested_fix', '')}")
    if r.get("strengths"):
        lines.append(f"Strengths: {'; '.join(r['strengths'])}")
    return "\n".join(lines)

bucket_summaries = {}
for name, pred in BUCKETS.items():
    bucket = [r for r in results if pred(r["file"])]
    rendered = "\n\n".join(render(r) for r in bucket)
    prompt = (
        f"Summarize these per-file code-review findings for UPT v0.3.0 ({name} bucket). "
        f"Produce a Markdown section with subsections:\n"
        f"- Critical & high findings (file:location, description, fix)\n"
        f"- Medium findings (grouped, consolidated)\n"
        f"- Low findings (one-liners)\n"
        f"- Bucket-internal patterns (issues repeated across multiple files)\n\n"
        f"Be terse. Cite file paths.\n\n"
        + rendered
    )
    print(f"Summarizing {name} bucket ({len(bucket)} files)...")
    bucket_summaries[name] = llm_query(prompt, max_tokens=4096, temperature=0.0)
    (REPO_ROOT / f"docs/planning/v0.3.0-audit/bucket_{name}.md").write_text(
        bucket_summaries[name], encoding="utf-8"
    )

print("\nMerging bucket summaries into final report...")
final_prompt = (
    "Merge these three per-bucket code-review summaries (source, tests, spec) into a "
    "single comprehensive Markdown report for UPT v0.3.0. Sections:\n\n"
    "## Executive summary (2-3 sentences naming the top 3-5 highest-impact items)\n"
    "## Critical findings (each with file:location + recommended fix)\n"
    "## High-priority findings (grouped by category: bug, simplification, performance, api-ergonomics, forward-compat, test-coverage, doc-clarity)\n"
    "## Medium findings (consolidated; deduplicate cross-file repeats)\n"
    "## Low findings (brief enumeration)\n"
    "## Cross-cutting patterns (issues that appear in multiple files OR across buckets — e.g., 'all error subclasses share X gap')\n"
    "## Strengths\n"
    "## Action checklist (ordered by ROI: high-impact / low-effort first; each item names file and line if known; mark each as TRIVIAL / SMALL / MEDIUM / LARGE effort)\n\n"
    "Be terse and concrete.\n\n"
    f"## Source bucket\n\n{bucket_summaries['source']}\n\n"
    f"## Tests bucket\n\n{bucket_summaries['tests']}\n\n"
    f"## Spec bucket\n\n{bucket_summaries['spec']}\n"
)

report = llm_query(final_prompt, max_tokens=8192, temperature=0.0)
out = REPO_ROOT / "docs/planning/v0.3.0-audit/findings.md"
out.write_text(report, encoding="utf-8")
print(f"Wrote {out} ({len(report):,} chars)")
