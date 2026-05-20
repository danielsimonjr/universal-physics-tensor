# Bridge Audit — Fix Spec (post-code-inspection)

**Date:** 2026-05-20
**Status of this spec:** honest work-order after reading the actual `src/bridges/equations/be-NN-*.ts` modules.

This spec was requested as "the verified fix list." On inspecting the encoding modules, **5 of the 6 candidate fixes were withdrawn** (see `BRIDGE-PHYSICS-AUDIT.md` §1). What follows is the corrected, true picture.

---

## Retracted — no fix needed

The audit's §1 claimed BE-14, BE-15, BE-17, BE-34, BE-35 had wrong `dimensional_signature` values. **Withdrawn.** The signature describes the *encoded AST* (a deliberate scalar reduction), not the displayed `formula_latex`. Each was re-checked against its module:

- **BE-14** — encodes Ryu-Takayanagi entropy → `[entropy]` correct.
- **BE-15** — encodes `L²=Γt` → `[area]` correct.
- **BE-17** — encodes `S²_spin` → `[L⁻²M²T⁻²]` correct.
- **BE-34** — encodes a dimensionless KZM ratio → `[1]` correct; the `[L⁻ᵈ]` gap is already a logged `known_issue`.
- **BE-35** — encodes the crossing residual → `[1]` correct.

All five are pinned green by `tests/bridges/dimensional-signature-catalog.test.ts`. Editing any signature string would break that test. **Do nothing.**

---

## FIX 1 — `encoded_form` transparency field (real, low-risk, recommended)

**Problem:** a catalog entry displays `formula_latex` (the full physics formula) but `dimensional_signature` is the analyzer's verdict on a *reduced* encoded AST. Nothing in the entry flags the gap, so any reader/auditor/AI comparing the two fields concludes they are inconsistent. This is what produced the entire (false) §1.

**Fix:** add an optional `encoded_form: string | null` field (or `encoding_note`) to `BridgeEquationEntry`. Populate it for every entry whose `src/bridges/equations/be-NN-*.ts` encodes a reduction — state the actual encoded relation in one line (e.g. BE-17: `"S²_spin = (c⁴/8πG)²·T_λμν T^λμν — squared torsion-spin invariant; formula_latex shows the full EC system"`).

- **Files:** `src/bridges/index.ts` (interface + entries), the encoding modules already contain the text in their docstrings.
- **Tests:** no existing test breaks (additive field). Add a test that every entry with a reduction-style module has a non-null `encoded_form`.
- **Risk:** low — purely additive metadata.

---

## FIX 2 — BE-33 Hertz-Millis exponent (candidate; needs literature check FIRST)

**Problem:** `src/bridges/equations/be-33-hertz-millis.ts` encodes the exponent `−ν/z` (pinned `−0.71`). The deeper check (both Adam and Eve, high confidence, same scaling derivation) argues the finite-T correlation length at the quantum-critical coupling should scale as `T^(−1/z)` — ν drops out.

**Before any edit — verify:** the module cites Millis 1993 (*Phys. Rev. B* 48:7183) as the source for `−ν/z`. Hertz-Millis is above its upper critical dimension where finite-T scaling is subtle. Check Millis 1993 + Sachdev *Quantum Phase Transitions* Ch. 11 directly. Do **not** change this on the audit's authority alone — it is a physics-content correction, not a typo.

**If confirmed, the change touches:**
- `src/bridges/equations/be-33-hertz-millis.ts` — the `sym('-0.71', DIMENSIONLESS)` AST pin → the `−1/z` value (= `−1` for z=1); the `evaluateHertzMillis` `Math.pow(..., -nu/z)` → `Math.pow(..., -1/z)`; the module docstring (which currently asserts `ξ ~ T^{-ν/z}` is canonical).
- `src/bridges/index.ts` — BE-33 `formula_latex` `(T/T₀)^{-ν/z}` → `(T/T₀)^{-1/z}`, plus `context`/`notes` mentioning ν≈0.71.
- `tests/bridges/be-33-encoding.test.ts` (if it pins the exponent) + `dimensional-signature-catalog.test.ts` (dimensionally exponent-agnostic, so likely unaffected).
- **Risk:** medium — overrides a documented "3D Heisenberg pin" decision; do it via full TDD.

---

## FIX 3 — BE-34 Kibble-Zurek Boltzmann factor (decision needed)

`be-34-kibble-zurek.ts` multiplies the KZM power law by `exp(−mc²/k_BT_reh)`. Adam argues it is a defensible massive-defect/reheating extension; Eve argues it double-counts (KZM is kinematic; Boltzmann is equilibrium — "additive, not multiplicative"). The module docstring calls it the "Established extension from the spec" and `status: established`.

**Decision for the author:** either (a) keep it, document the energetic-constraint justification, and address the additive-vs-multiplicative objection in the docstring + downgrade `status` from `established`; or (b) remove the factor — canonical KZM is the power law alone. Not a mechanical fix.

---

## FIX 4 — Metadata + status (the audit's *sound* findings)

These assess catalog fields the audit saw directly — reliable:

- **`unknown <-> unknown` bridge fields** (~9 entries incl. BE-27, 39, 41, 42): name the two regimes each entry bridges, or acknowledge the entry is a single-regime equation, not a bridge. `bridges` field in `src/bridges/index.ts`.
- **Status recalibration:** promote BE-16 (Landauer) and BE-29 (Jarzynski) toward `established` — both are experimentally-verified canonical results; demote the over-rated `established` entries (BE-14 HQECC, BE-34 KZM-hybrid, BE-40 Composite Higgs). Status-pin tests in `tests/bridges/be-NN-encoding.test.ts` will need matching updates.

---

## Bottom line

There is **no verified-safe quick code fix**. The honest action list: FIX 1 (additive doc field — safe, recommended), FIX 2 + FIX 3 (investigate, then a real TDD change), FIX 4 (metadata + status, mechanical but touches status-pin tests). The audit's value is the *framing* map (`BRIDGE-PHYSICS-AUDIT.md` §3, §5), not a formula-bug list.
