"""Retry the 4 failed files at max_tokens=8192, merge into findings.json."""
import json, sys
from pathlib import Path
sys.path.insert(0, str(Path.home() / ".claude" / "skills" / "rlm" / "scripts"))
from rlm_query import llm_query
from audit_v030 import REPO_ROOT, AUDIT_SYSTEM

FAILED = [
    "src/dimensional/metric-validators.ts",
    "src/dimensional/validator.ts",
    "src/bridges/equations/be-37-shapiro-delay.ts",
    "docs/specification/Part-VIII-Metric-Layer.md",
]

def audit(rel: str) -> dict:
    code = (REPO_ROOT / rel).read_text(encoding="utf-8", errors="replace")
    prompt = (f"Audit this v0.3.0 file: `{rel}`\n\n"
              f"```{'typescript' if rel.endswith('.ts') else 'markdown'}\n{code}\n```")
    # Cache-bust by adding a sentinel; original was at 4096 tokens and truncated.
    raw = llm_query(prompt + "\n\n[retry-v2]", system=AUDIT_SYSTEM, max_tokens=8192, temperature=0.0)
    stripped = raw.strip()
    if stripped.startswith("```"):
        stripped = stripped.split("\n", 1)[1] if "\n" in stripped else stripped
        if stripped.endswith("```"):
            stripped = stripped[:-3]
        if stripped.startswith("json"):
            stripped = stripped[4:].strip()
    try:
        parsed = json.loads(stripped)
        parsed.setdefault("file", rel)
        return parsed
    except json.JSONDecodeError as e:
        return {"file": rel, "error": f"still failed: {e}", "raw": raw[:2000]}

out_path = REPO_ROOT / "docs/planning/v0.3.0-audit/findings.json"
existing = json.loads(out_path.read_text(encoding="utf-8"))
by_file = {r["file"]: r for r in existing}

for rel in FAILED:
    print(f"Retrying {rel}...")
    r = audit(rel)
    n = len(r.get("findings", [])) if "findings" in r else "ERR"
    err = r.get("error", "")
    print(f"  [{n}] {rel} {err[:100]}")
    by_file[rel] = r

merged = list(by_file.values())
out_path.write_text(json.dumps(merged, indent=2, ensure_ascii=False), encoding="utf-8")
print(f"\nMerged findings -> {out_path}")

# Recompute summary
total = sum(len(r.get("findings", [])) for r in merged if "findings" in r)
by_sev: dict = {}
for r in merged:
    for f in r.get("findings", []):
        s = f.get("severity", "?")
        by_sev[s] = by_sev.get(s, 0) + 1
print(f"Total findings: {total}")
for s in ["critical", "high", "medium", "low"]:
    if s in by_sev:
        print(f"  {s}: {by_sev[s]}")
errs = [r["file"] for r in merged if "error" in r]
print(f"Still erroring: {errs}" if errs else "All files audited successfully.")
