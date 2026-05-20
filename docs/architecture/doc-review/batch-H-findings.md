# Batch H — historical architecture/audit docs — Doc Integrity Findings

**Reviewer**: sonnet subagent. **Date**: 2026-05-20.
**Files**:
- `docs/architecture/v0.4.5-refactor-targets.md`
- `docs/architecture/v0.4.6-minimize-targets.md`
- `docs/architecture/v0.5.1-audit.md`
- `docs/architecture/bridge-audit/deeper-check/deeper-check-results.md`

(No other `.md` files found under `docs/architecture/bridge-audit/`; `prompts/` and `responses/` subdirs contain `.txt` only.)

---

## Summary

4 findings: 0 CRITICAL, 3 HIGH, 1 MEDIUM. All are internal arithmetic/labelling inconsistencies within frozen audit records. No mislabeled-as-current issues. Docs are otherwise clean.

---

## Findings

### H-1 — HIGH — `v0.4.5-refactor-targets.md`:Category B intro vs verdict table

- **Claim**: `"46 exports flagged. Investigation result: 4 genuinely dead, 1 ambiguous, 41 false positives."` (body paragraph, Category B). Summary table row also shows `| Unused exports | 4 | 41 | 1 |`.
- **Verification**: The verdict table immediately below that sentence marks **five** exports as `GENUINELY DEAD`: `RepeatedDummyLabelError`, `epsilon_0`, `t_P`, `m_P`, `E_P`. The "GENUINE DEAD CODE — v0.4.5 removal list" section lists the same five items (numbered 1–5).
- **Reality**: The body enumeration and removal list agree on 5 genuinely dead exports. The `"4 genuinely dead"` claim in the paragraph and in the summary table column is off by one; 5 + 1 + 41 = 47, not 46.
- **Verdict**: INTERNAL-CONTRADICTION
- **Suggested fix**: Change the Category B intro sentence to `"5 genuinely dead, 1 ambiguous, 41 false positives (47 total)"`. Update the summary table to `| Unused exports | 5 | 41 | 1 |`. The "Total v0.4.5 actionable items: 6 REAL targets" line may also need adjustment depending on whether DRY-consolidation count changes.

---

### H-2 — HIGH — `v0.4.6-minimize-targets.md`:UC-1 header severity vs body severity

- **Claim**: Section header reads `### UC-1 — … (HIGH)`.
- **Verification**: The body `**Severity**` line in that same section states `**Severity**: MEDIUM — the cast works at runtime … but it misrepresents what the code can actually do.` (`v0.4.6-minimize-targets.md` line 41).
- **Reality**: The section was apparently drafted as HIGH and then the body downgraded to MEDIUM without updating the header. The summary table row `| Unreachable code | 2 | 3 | 1 | 6 |` counts UC-1 as the second HIGH (UC-2 being the other); if UC-1 is MEDIUM, the UC row should be `1H/3M/1L = 5` (UC-4 is "not flagged", UC-5 is moved to LC-1).
- **Verdict**: INTERNAL-CONTRADICTION
- **Suggested fix**: Change the UC-1 section header to `(MEDIUM)` to match the body severity. Update UC summary row to `| Unreachable code | 1 | 4 | 1 | 6 |` (keeping count=6 if UC-4 and UC-5 are still listed) or reconcile the row count consistently.

---

### H-3 — HIGH — `v0.4.6-minimize-targets.md`:LC and TS summary row counts vs body sections

- **Claim**: Summary table row `| Lies in comments | 2 | 5 | 2 | 9 |` and `| Type-safety holes | 3 | 4 | 2 | 9 |`.
- **Verification**:
  - LC: 9 sections (LC-1 through LC-9) exist in the body, but LC-4 explicitly concludes `"VERDICT: NOT a lie. Removing this candidate."` — it is a retracted finding that was counted in the summary. Removing it yields 8 real LC findings (2H/4M/2L), not 9. The LC MEDIUM count (5) is also off by one (should be 4).
  - TS: only 8 sections (TS-1 through TS-8) exist; body severities are 3H/3M/2L = 8. The summary claims 3H/4M/2L = 9 — one extra MEDIUM that has no corresponding section.
- **Reality**: Overall the summary total of 32 is also affected: LC retraction and the TS phantom finding together subtract 2 from the total (real total ≈ 30 actionable items, or 31 listed sections).
- **Verdict**: INTERNAL-CONTRADICTION
- **Suggested fix**: Either remove LC-4 from the document body (since it was retracted), or add a stub TS-9 for a missing finding. Correct the LC and TS summary rows and the grand total accordingly.

---

### H-4 — MEDIUM — `v0.5.1-audit.md`:Reconciliation table PD delta cell is arithmetically wrong

- **Claim**: Reconciliation table row for Pre-existing deferred items (PD) shows delta column `−1H, +1M, −1 net` (`v0.5.1-audit.md` line 960).
- **Verification**: Pre-vet PD summary (line 16) = 4H/4M/1L. Post-vet PD summary (line 30) = 2H/5M/1L. The reconciliation text (line 933–935) documents two changes: (a) drop PD-1 entirely (PD-1 was HIGH), and (b) PD-4 downgraded HIGH→MEDIUM. That is a net −2H, +1M, −1 total.
- **Reality**: The delta cell says `−1H` but the pre/post H columns confirm a −2H change (4H → 2H). All other numbers (pre-vet, post-vet, and the overall `"Net delta: −1 HIGH"` summary line) are mutually consistent; only the PD delta cell is wrong. The overall net −1H is correct because PC-3 gained +1H and Adam's NEW-1 added another +1H, balancing the −2H(PD) and −1H(LC) losses.
- **Verdict**: INTERNAL-CONTRADICTION
- **Suggested fix**: Change the PD delta cell from `−1H, +1M, −1 net` to `−2H, +1M, −1 net`.
