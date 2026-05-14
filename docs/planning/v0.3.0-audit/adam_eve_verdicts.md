# Adam (Gemini 2.5 Pro) + Eve (OpenAI o3-mini) verification of Sonnet's v0.3.0 audit

**Date:** 2026-05-13
**Mechanism:** mcp__plugin_mcp-host_llm-gemini__gemini_reasoning_query + mcp__plugin_mcp-host_llm-openai__openai_reasoning_query, dispatched in parallel.
**Prompt context:** Condensed summary of 7 critical findings + my (Sonnet-triage controller) verdicts. The MCP tools do NOT give the reasoners filesystem access — they saw the summary, not the full 152 KB prompt with source code at `adversarial_prompt.txt`.

## Verified triage (7/7 criticals)

| # | Sonnet claim | My verdict | Adam | Eve |
|---|---|---|---|---|
| 1 | raise/lower duplicate free-index labels | **FALSE POSITIVE** | ✓ FALSE-POSITIVE (1.0) | ✓ FALSE-POSITIVE (1.0) |
| 2 | integral/derivative `{...ctx}` leak | **REAL non-blocking** | ✓ REAL non-blocking (0.9) | ✓ REAL **blocking** (0.9) |
| 3 | Kronecker δ^μ_μ accepted | **REAL** | ✓ REAL (1.0) | ✓ REAL **blocking** (0.95) |
| 4 | BE-37 pderiv dim wrong | **FALSE POSITIVE** | ✓ FALSE-POSITIVE (1.0) | ✓ FALSE-POSITIVE (1.0) |
| 5 | contract() binary | **FALSE POSITIVE** | ✓ FALSE-POSITIVE (1.0) | ✓ FALSE-POSITIVE (1.0) |
| 6 | Drift-guard self-fulfilling JSDoc | **PARTIAL** | ✓ PARTIAL (0.8) | ✓ PARTIAL (0.8) |
| 7 | metric-tensor test wrong error class | **STYLE PREFERENCE** | ✓ STYLE (1.0) | ✓ STYLE (1.0) |

**Triage is unanimous.** Eve flagged #2 (ctx-spread) and #3 (Kronecker) as **blocking** rather than non-blocking — worth weighting up.

## Severity divergence on #2 and #3

Eve calls #2 and #3 "blocking" — meaning they should be fixed before v0.3.5. My initial reading was "non-blocking" because:

- #2 (integral/derivative ctx-spread): no current bridge uses a tensor-valued integrand.
- #3 (Kronecker δ^μ_μ): no current bridge constructs a trace Kronecker.

Eve's blocking-classification likely weights forward-compat: v0.4.0 covariant-derivative work WILL hit ctx-spread, and δ^μ_μ trace IS used in standard GR identities. Reasonable framing. Recommend treating both as **must-fix before v0.4.0** but **not blocking v0.3.5** specifically.

## Adam's hallucinated verdicts (findings 7-58)

Adam returned verdicts for finding_index 0-58 and 5 "new findings," but neither reasoner had access to the actual source files (MCP `prompt` is text-only, no file access). The cited identifiers — `alphaConvert`, `boundIndices`, `signature: number[]`, `validateNode`, line numbers like `metric.ts:114` — are FABRICATED:

- UPT has no `alphaConvert` function. Alpha-conversion is implemented inline in `raise()`/`lower()` via the `freshLabel` helper (metric.ts:86-90 in the actual code).
- `MetricTensorNode.signature` is `string`, not `number[]`. Adam imagined a different schema.
- The validator's `infer()` switch DOES handle all 3 new AST kinds (`metric-tensor` at validator.ts:1602, `kronecker-delta` at 1610, `tensor-partial-derivative` at 1618). Adam's "blocking — Validator does not handle all node types" finding (his finding_index 57) is FALSE.
- Adam's "blocking — alphaConvert does not handle new AST nodes" (finding_index 8) is FALSE — function doesn't exist.

**All of Adam's verdicts beyond the first 7 are discarded as unverifiable hallucinations.**

This is the documented failure mode the honest-claude skill warns about: when an LLM is asked to verify claims about code it cannot see, it generates plausible-sounding fabrications rather than declining. The fix would have been to inline the actual source files into the MCP `prompt` string (the 152 KB prompt at `adversarial_prompt.txt`).

## Eve's three "new findings"

Eve was scope-honest and her new findings are abstract:

1. **Insufficient nested raise/lower test coverage** (medium, conf 0.85). Plausible but I already verified raise-lower.test.ts has 9 tests including the multi-index operand and fresh-label-collision cases. Marginal.
2. **Deep copy required for context propagation in validators** (high, conf 0.9). This IS the integral/derivative `{...ctx}` issue (CRIT-2) — restated. Not a new finding.
3. **Type mismatch in tensor-partial-derivative AST node** (medium, conf 0.9). Vague — Eve didn't see the actual types so couldn't cite a concrete mismatch. Likely false alarm given that the type interface compiles clean (`tsc` passed 0 errors in Tasks 4-16).

**No genuinely new catches** beyond what Sonnet found.

## What we should fix (verified-real, prioritized)

1. **Kronecker `δ^μ_μ` duplicate-label check** — Eve says blocking; matches v0.4.0 forward-compat. **Trivial fix** in `validateKroneckerDelta`.
2. **integral/derivative `{...ctx}` shallow spread** — Eve says blocking; would silently leak tensor free-indices if v0.4.0 introduces tensor integrands. **Small fix** using existing `inferArgLocal` helper.
3. **`v030-additive-semver-minor-bump` TENSOR-RULE has no real test** — either delete the marker (it's a meta-rule, not a code invariant) or add a real `expect(packageJson.version).toMatch(/^0\.3\./)` test. **Trivial.**

Everything else in Sonnet's audit is below the verified-real bar.

## Methodology note for next adversarial pass

To get high-quality verification of high-severity findings, the actual source files MUST be inlined into the MCP `prompt` parameter (not just referenced by path). The `gemini_reasoning_query` and `openai_reasoning_query` tools have no filesystem access. Build the prompt with the full file contents and dispatch. Today's pass at 38 K tokens fits both models' context windows; next pass should send the actual content rather than a path.

The audit file lives at `docs/planning/v0.3.0-audit/adversarial_prompt.txt` and is re-usable.
