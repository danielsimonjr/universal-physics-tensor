"""Sequential retry with longer SSL timeout. Saves after each file."""
import json, sys, time
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

def attempt(rel: str, retry_no: int) -> dict:
    code = (REPO_ROOT / rel).read_text(encoding="utf-8", errors="replace")
    prompt = (f"Audit this v0.3.0 file: `{rel}`\n\n"
              f"```{'typescript' if rel.endswith('.ts') else 'markdown'}\n{code}\n```"
              f"\n\n[sequential-retry-{retry_no}]")
    raw = llm_query(prompt, system=AUDIT_SYSTEM, max_tokens=8192, temperature=0.0)
    stripped = raw.strip()
    if stripped.startswith("```"):
        stripped = stripped.split("\n", 1)[1] if "\n" in stripped else stripped
        if stripped.endswith("```"):
            stripped = stripped[:-3]
        if stripped.startswith("json"):
            stripped = stripped[4:].strip()
    parsed = json.loads(stripped)
    parsed.setdefault("file", rel)
    return parsed

out_path = REPO_ROOT / "docs/planning/v0.3.0-audit/findings.json"
existing = json.loads(out_path.read_text(encoding="utf-8"))
by_file = {r["file"]: r for r in existing}

for rel in FAILED:
    print(f"\n--- Auditing {rel} ---")
    for attempt_n in range(3):
        try:
            r = attempt(rel, attempt_n + 1)
            n = len(r.get("findings", []))
            print(f"  attempt {attempt_n+1}: OK, {n} findings")
            by_file[rel] = r
            # Save after each success
            out_path.write_text(
                json.dumps(list(by_file.values()), indent=2, ensure_ascii=False),
                encoding="utf-8",
            )
            break
        except Exception as e:
            msg = str(e)[:200]
            print(f"  attempt {attempt_n+1}: FAILED — {msg}")
            if attempt_n < 2:
                time.sleep(5 * (attempt_n + 1))
            else:
                by_file[rel] = {"file": rel, "error": f"3 attempts failed: {msg}"}
                out_path.write_text(
                    json.dumps(list(by_file.values()), indent=2, ensure_ascii=False),
                    encoding="utf-8",
                )

# Summary
total = sum(len(r.get("findings", [])) for r in by_file.values() if "findings" in r)
by_sev: dict = {}
for r in by_file.values():
    for f in r.get("findings", []):
        s = f.get("severity", "?")
        by_sev[s] = by_sev.get(s, 0) + 1
print(f"\n=== Total findings: {total} ===")
for s in ["critical", "high", "medium", "low"]:
    if s in by_sev:
        print(f"  {s}: {by_sev[s]}")
errs = [r["file"] for r in by_file.values() if "error" in r]
print(f"Still erroring: {errs}" if errs else "All 18 files audited successfully.")
