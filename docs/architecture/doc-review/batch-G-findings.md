# Batch G — historical planning docs — Doc Integrity Findings

**Reviewer:** Claude Code (Sonnet 4.6)
**Date:** 2026-05-20
**Files reviewed:**
- `docs/planning/Development-Plan.md`
- `docs/planning/Future-Production-Hardening.md`
- `docs/planning/Implementation-Plan.md`
- `docs/planning/System-Requirements.md`
- `docs/planning/BE-37-VSL-Disposition-Brief.md`
- `docs/planning/Tier-5-Encoding-Triage.md`
- `docs/planning/Bridge-Remediation-Plan.md`
- `docs/planning/v0.1.0-Release-Procedure.md`
- `docs/planning/v0.2.0-Design.md`
- `docs/planning/v0.2.0-Implementation-Plan.md`
- `docs/planning/v0.3.0-Bridge-Selection.md`
- `docs/planning/v0.3.0-Design.md`
- `docs/planning/v0.3.0-Implementation-Plan.md`
- `docs/planning/v0.3.5-Design.md`
- `docs/planning/v0.3.5-Implementation-Plan.md`
- `docs/planning/v0.4.0-api-surface.md`
- `docs/planning/v0.4.0-Design.md`
- `docs/planning/v0.4.0-Implementation-Plan.md`
- `docs/planning/v0.4.0-Review-Findings.md`
- `docs/planning/v0.4.5-Implementation-Plan.md`
- `docs/planning/v0.4.6-Implementation-Plan.md`
- `docs/planning/v0.5.0-Design.md`
- `docs/planning/v0.5.0-Implementation-Plan.md`
- `docs/planning/v0.5.1-Design.md`
- `docs/planning/v0.5.1-Implementation-Plan.md`
- `docs/planning/v0.3.0-audit/findings.md`
- `docs/planning/v0.3.0-audit/adam_eve_brief.md`
- `docs/planning/v0.3.0-audit/adam_eve_verdicts.md`
- `docs/planning/v0.3.0-audit/bucket_source.md`

**Scope:** Internal consistency · internal factual errors (wrong at time of writing) · mislabeled-as-current · cross-doc contradictions. NOT flagging code drift vs. current source.

---

## Summary

Total findings: **4** — 0 CRITICAL · 2 HIGH · 2 MEDIUM · 0 LOW

Overall verdict: Mostly clean historical artifacts. One working brief that should carry a superseded banner (BE-37), two count/classification discrepancies in the bridge-triage layer, and one arithmetic error in a review-findings summary.

---

## G-1

**Severity:** MEDIUM
**File:** `docs/planning/Tier-5-Encoding-Triage.md`
**Location:** Triage breakdown table / "yes-ready" bucket label

**CLAIM:** The "yes-ready" bucket header reads `yes-ready (7, all encoded except BE-24 / BE-38 pending Tier-5 wave-2)`.

**VERIFICATION:** Read `docs/planning/Tier-5-Encoding-Triage.md`. The enumerated list under that bucket contains 8 entries: BE-19, BE-22, BE-24, BE-26, BE-34, BE-38, BE-41, BE-47. The arithmetic sum line in the document reads `Sum: 8 + 3 + 1 + 1 + 5 + 8 + 4 + 2 + 1 + 1 + 2 = 36` — the leading `8` is the yes-ready count, consistent with the 8-item list, inconsistent with the `(7)` in the label.

**REALITY:** The bucket contains 8 bridges, not 7. The count in the label is off by one. The arithmetic sum uses the correct value (8).

**VERDICT:** INTERNAL-ERROR

**SUGGESTED-FIX:** Change `yes-ready (7,` to `yes-ready (8,` in the bucket label.

---

## G-2

**Severity:** HIGH
**File:** `docs/planning/BE-37-VSL-Disposition-Brief.md`
**Location:** Entire document (header / recommendation section)

**CLAIM:** The document's standing recommendation is R3 (mark invalid, confidence 60) for BE-37 VSL (Variable Speed of Light).

**VERIFICATION:** Read `docs/planning/BE-37-VSL-Disposition-Brief.md`. The recommendation section states confidence 60, disposition R3 (mark invalid / retire). The document carries no "superseded," "historical," or "void" banner. Cross-referenced against `docs/planning/v0.3.0-Bridge-Selection.md` and `docs/planning/Bridge-Remediation-Plan.md`, which document that BE-37 was reformulated as Shapiro gravitational time delay during Wave Z-F (commit `05900f3`, 2026-05-11) and lifted from `invalid` to `status: 'speculative'`.

**REALITY:** The R3/mark-invalid recommendation was superseded by the Wave Z-F reformulation. The brief now reads as a live recommendation when it is a voided working document. A reader following this brief would make the wrong remediation decision for BE-37.

**VERDICT:** MISLABELED-CURRENT

**SUGGESTED-FIX:** Add the following banner at the very top of the file:

```
> **SUPERSEDED (2026-05-11):** This brief's R3 / mark-invalid recommendation
> was overridden by Wave Z-F (commit `05900f3`). BE-37 was reformulated as
> Shapiro gravitational time delay and lifted to `status: 'speculative'`.
> This document is retained as a historical record of the deliberation.
> See `Bridge-Remediation-Plan.md` §Tier R3 and `v0.3.0-Bridge-Selection.md`.
```

---

## G-3

**Severity:** MEDIUM
**Files:** `docs/planning/Bridge-Remediation-Plan.md` vs `docs/planning/Tier-5-Encoding-Triage.md`
**Location:** Bridge-Remediation-Plan.md R5 "Healthy / ready to implement" section

**CLAIM:** `Bridge-Remediation-Plan.md` lists `BE-40 Composite Higgs Potential (established)` in the R5 tier ("Healthy — implementation-ready").

**VERIFICATION:** Read `docs/planning/Bridge-Remediation-Plan.md` R5 section (confirmed BE-40 present). Read `docs/planning/Tier-5-Encoding-Triage.md` which explicitly states: "BE-40 was re-classified from `yes-ready` to `no-r2-gap` during Wave-1 scratch: the spec form mixes `[energy²]` and `[energy⁴]` terms requiring a gap-fill before AST encoding is possible."

**REALITY:** BE-40 was demoted to `no-r2-gap` (equivalent to needing R2 remediation) during Tier-5 Wave-1. `Bridge-Remediation-Plan.md` was not updated to reflect this reclassification, leaving BE-40 in R5 (implementation-ready) when it should be in R2 (gap-fill required).

**VERDICT:** INTERNAL-CONTRADICTION (cross-doc)

**SUGGESTED-FIX:** Move BE-40 from the R5 section to the R2 section in `Bridge-Remediation-Plan.md`. Update the R5 count from 12 to 11 (and R2 count accordingly) if those totals appear in the document.

---

## G-4

**Severity:** HIGH
**File:** `docs/planning/v0.4.0-Review-Findings.md`
**Location:** Summary section, "Showstoppers" line

**CLAIM:** `"Showstoppers: 5 distinct architectural defects, all caught by both reviewers."`

**VERIFICATION:** Read `docs/planning/v0.4.0-Review-Findings.md`. The shared-concerns table lists 6 rows labeled SHOWSTOPPER: S1, S2, S3, S4, S5, S6. Row S5 carries the explicit annotation `(Eve only)` — directly contradicting "all caught by both reviewers." Count in the summary (5) also contradicts the 6 rows in the table.

**REALITY:** There are 6 showstopper findings (S1–S6), not 5. S5 was flagged by Eve only, not both reviewers. The summary sentence is wrong on both the count and the unanimity claim.

**VERDICT:** INTERNAL-ERROR

**SUGGESTED-FIX:** Replace the summary line with:

```
Showstoppers: 6 distinct architectural defects (S1–S4 and S6 caught by both
reviewers; S5 flagged by Eve only).
```
