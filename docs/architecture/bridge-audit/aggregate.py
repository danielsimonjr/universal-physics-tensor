"""Aggregate the 84 Adam/Eve audit responses into a per-bridge verdict table."""
import json, re
from pathlib import Path

ROOT = Path(r"C:/Users/danie/.claude/playground/upt_bridge_audit")
RESP = ROOT / "responses"
CATALOG = {e["id"]: e for e in json.loads((ROOT / "bridge-catalog-current.json").read_text(encoding="utf-8"))}

VERDICTS = ["SOUND", "MINOR-ISSUES", "SERIOUS-ISSUES", "INVALID"]


def extract_verdict(text):
    """Last OVERALL VERDICT line wins. Returns one of VERDICTS or 'UNPARSED'."""
    matches = re.findall(r"OVERALL VERDICT:\s*\*?\*?\s*([A-Z-]+)", text)
    if matches:
        v = matches[-1].strip().upper()
        for valid in VERDICTS:
            if valid in v or v in valid:
                return valid
    # fallback: scan for a bare verdict token near the end
    tail = text[-300:].upper()
    for valid in VERDICTS:
        if valid in tail:
            return valid
    return "UNPARSED"


def extract_objection(text):
    """Pull the 'STRONGEST OBJECTION' section text, condensed."""
    m = re.search(r"STRONGEST OBJECTION[:\s]*\n?(.+?)(?=\n#{0,3}\s*6\.|\nOVERALL VERDICT|\Z)",
                  text, re.DOTALL | re.IGNORECASE)
    if not m:
        return ""
    obj = re.sub(r"\s+", " ", m.group(1)).strip()
    return obj[:400]


rows = []
missing = []
for bid in sorted(CATALOG):
    adam_f = RESP / f"be-{bid}-adam.txt"
    eve_f = RESP / f"be-{bid}-eve.txt"
    row = {"id": bid, "name": CATALOG[bid]["name"], "status": CATALOG[bid]["status"]}
    for who, f in (("adam", adam_f), ("eve", eve_f)):
        if not f.exists():
            missing.append(f.name)
            row[who] = "MISSING"
            row[f"{who}_obj"] = ""
            continue
        txt = f.read_text(encoding="utf-8", errors="replace")
        if txt.startswith("AUDIT-FAILED"):
            row[who] = "FAILED"
            row[f"{who}_obj"] = txt[:200]
            continue
        row[who] = extract_verdict(txt)
        row[f"{who}_obj"] = extract_objection(txt)
    rows.append(row)

# Severity ranking for "worst of the two"
rank = {"SOUND": 0, "MINOR-ISSUES": 1, "SERIOUS-ISSUES": 2, "INVALID": 3,
        "UNPARSED": -1, "MISSING": -1, "FAILED": -1}
for r in rows:
    a, e = rank.get(r["adam"], -1), rank.get(r["eve"], -1)
    r["worst"] = max(a, e)
    r["agree"] = r["adam"] == r["eve"]

(ROOT / "verdict-table.json").write_text(json.dumps(rows, indent=1), encoding="utf-8")

# Print summary
print(f"=== {len(rows)} bridges, {len(rows)*2 - len(missing)} responses ===")
if missing:
    print(f"MISSING: {missing}")
print()
from collections import Counter
adam_dist = Counter(r["adam"] for r in rows)
eve_dist = Counter(r["eve"] for r in rows)
print(f"Adam verdicts: {dict(adam_dist)}")
print(f"Eve  verdicts: {dict(eve_dist)}")
agree = sum(1 for r in rows if r["agree"])
print(f"Adam/Eve agree exactly: {agree}/{len(rows)}")
print()
print("=== Bridges where BOTH models flag SERIOUS-ISSUES or INVALID ===")
for r in rows:
    a, e = rank.get(r["adam"], -1), rank.get(r["eve"], -1)
    if a >= 2 and e >= 2:
        print(f"  BE-{r['id']:>2} [{r['status']:>17}] {r['name'][:50]}  (Adam={r['adam']}, Eve={r['eve']})")
print()
print("=== Bridges where models DISAGREE ===")
for r in rows:
    if not r["agree"]:
        print(f"  BE-{r['id']:>2} {r['name'][:48]}  Adam={r['adam']}  Eve={r['eve']}")
print()
print("=== Per-bridge table ===")
for r in rows:
    flag = "  <-- both serious+" if (rank.get(r['adam'],-1)>=2 and rank.get(r['eve'],-1)>=2) else ""
    print(f"  BE-{r['id']:>2} [{r['status'][:4]}]  A:{r['adam']:<15} E:{r['eve']:<15}{flag}")
