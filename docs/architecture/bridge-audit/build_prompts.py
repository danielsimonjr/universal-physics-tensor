"""Build self-contained physics-audit prompts, one per bridge, from the current catalog.

Each prompt is fully self-contained — the reasoning model (Adam/Eve) needs no repo
access. Anti-hallucination rules are inline because these MCPs fabricate references
when asked about things not in the prompt (memory: mcp-llm-text-only-no-fs-access).
"""
import json
from pathlib import Path

ROOT = Path(r"C:/Users/danie/.claude/playground/upt_bridge_audit")
CATALOG = json.loads((ROOT / "bridge-catalog-current.json").read_text(encoding="utf-8"))
PROMPTS = ROOT / "prompts"
PROMPTS.mkdir(exist_ok=True)

TEMPLATE = """You are a physicist peer-reviewing ONE entry in a computational physics catalog called the Universal Physics Tensor (UPT). UPT is a TypeScript library that catalogs "bridge equations" — equations connecting two physical regimes (e.g. quantum <-> classical). It is explicitly a *framework / catalog*, NOT a claimed unified theory. Each entry carries a status the catalog authors assigned: 'established', 'speculative', or 'highly-speculative'.

Your job: rigorously assess the PHYSICS of this one bridge entry. Be a skeptical reviewer, not a cheerleader — the catalog authors WANT errors found.

=== BRIDGE ENTRY ===
ID: BE-{id}
Name: {name}
Category: {category_name}
Claims to bridge: {regimes}
Catalog status: {status}
Tractability class: {tractability}

Context (what the entry claims to do):
{context}

Formula (LaTeX):
{formula}

Claimed dimensional signature: {dim}

Literature references cited by the entry:
{references}

Known issues already flagged by the catalog authors:
{known_issues}
=== END ENTRY ===

Assess these SIX questions. Be specific, concrete, and quantitative where possible.

1. DIMENSIONAL CONSISTENCY: Derive the physical dimension of the formula's right-hand side (and left-hand side, if both are shown). Does it match the claimed dimensional signature "{dim}"? Show the dimensional arithmetic explicitly.

2. CANONICAL CORRECTNESS: Is this the correct, standard form of this equation as it appears in the physics literature? If it deviates from the canonical form, state exactly how. If it is a phenomenological ansatz rather than a derived/established result, say so plainly.

3. BRIDGE LEGITIMACY: Does this equation genuinely connect the two regimes named ({regimes})? Or is the "bridge" framing a stretch or a post-hoc label?

4. STATUS CALIBRATION: The catalog labels this "{status}". Based on the physics, is that label correct? Distinguish clearly between (a) the EQUATION being established physics and (b) the catalog's FRAMING/INTERPRETATION being speculative — these two can differ, and saying so is valuable.

5. STRONGEST OBJECTION: State the single most serious physics problem with this entry as written.

6. OVERALL VERDICT: choose exactly one — SOUND (physics correct, status calibrated) / MINOR-ISSUES (correct physics, small fixes) / SERIOUS-ISSUES (significant physics or calibration problems) / INVALID (the physics is wrong).

ANTI-HALLUCINATION RULES — critical, the catalog authors will fact-check your answer:
- Do NOT invent literature references, paper titles, journal volumes, equation numbers, or numerical constants. If unsure of a reference or value, write "I am not certain" rather than fabricating.
- If a question cannot be answered from the information provided, say so explicitly.
- Ground every claim; distinguish what you know from what you infer.

Format: the six numbered sections, then a final line EXACTLY:
OVERALL VERDICT: <SOUND|MINOR-ISSUES|SERIOUS-ISSUES|INVALID>
"""


def fmt_list(items, empty="(none)"):
    if not items:
        return empty
    return "\n".join(f"  - {x}" for x in items)


def fmt_known_issues(issues):
    if not issues:
        return "(none flagged)"
    out = []
    for i in issues:
        if isinstance(i, dict):
            sev = i.get("severity", "?")
            desc = i.get("description", "")
            out.append(f"  - [{sev}] {desc}")
        else:
            out.append(f"  - {i}")
    return "\n".join(out)


def build():
    for e in CATALOG:
        prompt = TEMPLATE.format(
            id=e["id"],
            name=e["name"],
            category_name=e.get("category_name", "?"),
            regimes=" <-> ".join(e.get("bridges", [])) or "(unspecified)",
            status=e["status"],
            tractability=e.get("tractability_class", "?"),
            context=e.get("context", "(none)"),
            formula=e.get("formula_latex", "(none)"),
            dim=e.get("dimensional_signature", "(none)"),
            references=fmt_list(e.get("references", [])),
            known_issues=fmt_known_issues(e.get("known_issues", [])),
        )
        (PROMPTS / f"be-{e['id']}.txt").write_text(prompt, encoding="utf-8")
    print(f"wrote {len(CATALOG)} prompt files to {PROMPTS}")


if __name__ == "__main__":
    build()
