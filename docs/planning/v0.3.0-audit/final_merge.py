"""Final merge of 3 bucket summaries via direct API call with extended timeout."""
import json, sys, urllib.request
from pathlib import Path

REPO = Path("C:/Users/danie/Dropbox/Github/universal-physics-tensor")
API_KEY = (Path.home() / ".claude" / "api_key.txt").read_text(encoding="utf-8").strip()

buckets = {
    name: (REPO / f"docs/planning/v0.3.0-audit/bucket_{name}.md").read_text(encoding="utf-8")
    for name in ["source", "tests", "spec"]
}

prompt = (
    "Merge these three per-bucket code-review summaries (source, tests, spec) into a "
    "single comprehensive Markdown report for UPT v0.3.0. Sections:\n\n"
    "## Executive summary (2-3 sentences naming the top 3-5 highest-impact items)\n"
    "## Critical findings (each with file:location + recommended fix)\n"
    "## High-priority findings (grouped by category)\n"
    "## Medium findings (consolidated; dedupe cross-file repeats)\n"
    "## Low findings (brief)\n"
    "## Cross-cutting patterns (multi-file or multi-bucket issues)\n"
    "## Strengths\n"
    "## Action checklist (ordered by ROI: high-impact / low-effort first; each item names "
    "file and line if known; mark effort: TRIVIAL/SMALL/MEDIUM/LARGE)\n\n"
    "Be terse and concrete.\n\n"
    f"## Source bucket\n\n{buckets['source']}\n\n"
    f"## Tests bucket\n\n{buckets['tests']}\n\n"
    f"## Spec bucket\n\n{buckets['spec']}\n"
)

body = json.dumps({
    "model": "claude-sonnet-4-5-20250929",
    "max_tokens": 8192,
    "temperature": 0.0,
    "messages": [{"role": "user", "content": prompt}],
}).encode("utf-8")

req = urllib.request.Request(
    "https://api.anthropic.com/v1/messages",
    data=body,
    headers={
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
    },
    method="POST",
)

print(f"Calling API ({len(prompt):,} char prompt, 300s timeout)...")
with urllib.request.urlopen(req, timeout=300) as resp:
    data = json.loads(resp.read())

text = data["content"][0]["text"]
out = REPO / "docs/planning/v0.3.0-audit/findings.md"
out.write_text(text, encoding="utf-8")
print(f"Wrote {out} ({len(text):,} chars)")
print(f"Input tokens: {data['usage']['input_tokens']}, output: {data['usage']['output_tokens']}")
