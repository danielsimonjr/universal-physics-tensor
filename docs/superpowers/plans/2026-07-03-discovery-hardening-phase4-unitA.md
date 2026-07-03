# Discovery-Hardening Phase 4 Unit A (v0.34.0) — Consequence Propagation: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Annotate each promising discovery candidate with a machine consequence signal — `entailed` (its derived consequence re-derives a canonical equation), `novel-consequence` (a valid consequence with no canonical match), or `inconclusive` (no monomial consequence derivable) — as a pre-classifier for the human adjudication ledger.

**Architecture:** A post-pass annotation layer (mirroring Phase-1's `annotateAdjudications`): `annotateConsequences(candidates)` runs the existing `deriveProposedBridges` on the promising candidates, compares each derived `ProposedBridge`'s `normalForm` against the canonical registry's equations (same target + same governing set), and attaches a `consequence` field. It does NOT touch `vetInContext`, `VettedCandidate`, or `rankDiscoveries` — so the calibration benchmark is untouched by construction. `discover` surfaces the signal; `--json` gains it additively.

**Tech Stack:** TypeScript 6 strict ESM (`.js` import suffixes), vitest 4, zero hard deps (all substrate — `deriveProposedBridges`, `normalForm`, `CANONICAL_EQUATIONS` — is peer-independent).

## Global Constraints

- **Design authority:** `docs/superpowers/specs/2026-07-03-discovery-hardening-phase4-design.md` (r5 FINAL). Unit A only; Unit B deferred; `consequence-invalid` CUT (Task-0: contradictory=0, fires on nothing).
- **Plan-time correction of the design:** the design said "computed in `vetInContext`"; that is CIRCULAR (`deriveProposedBridges` → `rankDiscoveries`). The correct integration is a **post-pass annotation** exactly like `annotateAdjudications` (`AnnotatedCandidate = VettedCandidate & {adjudication?}`, `src/composition/adjudication.ts:159/178`). Consequence signals are a SEPARATE annotation layer — `VettedCandidate` and `vetInContext` are NOT modified.
- **Annotation-only / firewall:** never mutates `BRIDGE_EQUATIONS`/`CANONICAL_GRAPH`; the underlying `ProposedBridge.status` stays `'unadjudicated'`; nothing is written to `ADJUDICATIONS` (human-authored); the annotation never re-orders or re-scores — it only attaches a field.
- **Calibration benchmark UNCHANGED:** `tests/composition/discovery-calibration.test.ts` asserts counts on `rankDiscoveries` output (`VettedCandidate`), which this plan does not modify → it must pass byte-identical. Any `discover --json` golden that serializes candidates gains the additive `consequence` field and is re-pinned (intended).
- **Zero fabricated data:** the classifier compares real derived normal-forms against real canonical normal-forms. Task-0 measured entailed=0/novel=4 on live data — the tests use a SYNTHETIC positive control (a canonical equation fed its own governing set → `entailed`) plus the live `novel` cases; do not invent an entailed catalog hit.
- **`.js` import suffixes**; both `npx tsc --noEmit` and `npx tsc -p tsconfig.tests.json --noEmit` clean; `npm run build` before golden/smoke.
- **Commit footer:**
  ```
  Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01UFjZjaRC56TAw5wsgJ6ygb
  ```

## Verified substrate (read before coding — these are real signatures)

- `ProposedBridge` (`src/composition/proposed-bridges.ts:158`): has `derivedFrom.identification.{a,b,dim}`, `target: DimensionalVariable`, `governing: readonly DimensionalVariable[]`, `scalarAst`, and a `normalForm`-derived dedup key. **Verify the exact field that holds the normal-form** by reading the module (the dedup uses `normalForm(scalarAst)` — the classifier recomputes `normalForm(proposal.scalarAst)` to be safe).
- `deriveProposedBridges(candidates)` (`proposed-bridges.ts:372`) → `readonly ProposedBridge[]`; monomial-only; processes only `promising` candidates; internally reads the canonical registry + bridge edges.
- `normalForm(node: ExprNode): string` (`src/canonical/normal-form.ts`).
- `CANONICAL_EQUATIONS: readonly CanonicalEquation[]` (`src/canonical/registry.ts:24`); each has `dimensional.target: DimensionalVariable`, `dimensional.governing: readonly DimensionalVariable[]`, and optional `scalarAst?: ExprNode` (canonical-equation.ts:79-86).
- `annotateAdjudications(candidates): readonly AnnotatedCandidate[]` (`adjudication.ts:178`) and `AnnotatedCandidate = VettedCandidate & {adjudication?}` — the pattern to mirror. `discover.ts:137` composes it; `discover.ts:185-188` reads `r.adjudication`.

## File structure

| File | Responsibility |
|---|---|
| `src/composition/consequence.ts` (create) | `ConsequenceSignal` type, `ConsequenceEvidence`, `ConsequenceAnnotatedCandidate`, `classifyProposal(proposal, canon)`, `annotateConsequences(candidates)`. |
| `src/cli/commands/discover.ts` (modify) | compose `annotateConsequences` into the pipeline; show the signal; `--json` field. |
| `src/cli-api.ts` (modify) | re-export `annotateConsequences` + types for `ctx.api`. |
| `src/index.ts` (modify) | public exports. |
| `tests/composition/consequence.test.ts` (create) | positive + negative control + live-yield pin. |
| `tests/cli/*` (modify) | discover golden re-pin. |

---

### Task 1: The consequence classifier + annotation layer

**Files:**
- Create: `src/composition/consequence.ts`
- Test: `tests/composition/consequence.test.ts`

**Interfaces:**
- Consumes: `VettedCandidate` (discovery.js), `ProposedBridge`/`deriveProposedBridges` (proposed-bridges.js), `normalForm` (normal-form.js), `CANONICAL_EQUATIONS` (registry.js).
- Produces: `type ConsequenceSignal = 'entailed' | 'novel-consequence' | 'inconclusive'`; `interface ConsequenceEvidence { readonly target: string; readonly governing: readonly string[]; readonly derivedNormalForm: string; readonly canonicalMatch: string | null; readonly sourceEquationIds: readonly [string, string] }`; `type ConsequenceAnnotatedCandidate = VettedCandidate & { readonly consequence?: { readonly signal: ConsequenceSignal; readonly evidence: readonly ConsequenceEvidence[] } }`; `function annotateConsequences(candidates: readonly VettedCandidate[]): readonly ConsequenceAnnotatedCandidate[]`.

- [ ] **Step 1: Write the failing test** (positive control, negative control, live pin)

```ts
// tests/composition/consequence.test.ts
import { describe, it, expect } from 'vitest';
import { annotateConsequences } from '../../src/composition/consequence.js';
import { rankDiscoveries } from '../../src/composition/discovery.js';
import { CATALOG_GRAPH } from '../../src/composition/catalog-graph.js';
import { CANONICAL_GRAPH } from '../../src/composition/canonical-graph.js';

describe('annotateConsequences', () => {
  it('attaches a consequence to every candidate; promising get a signal, non-promising get inconclusive/none', () => {
    const ranked = rankDiscoveries(CATALOG_GRAPH);
    const annotated = annotateConsequences(ranked);
    expect(annotated.length).toBe(ranked.length); // 1:1, order preserved
    // every promising candidate carries a signal from the allowed set
    for (const c of annotated) {
      if (c.verdict === 'promising') {
        expect(['entailed', 'novel-consequence', 'inconclusive']).toContain(c.consequence?.signal);
      }
    }
  });

  it('LIVE PIN (Task-0 measured): catalog promising yields 0 entailed, 1 novel-consequence', () => {
    const annotated = annotateConsequences(rankDiscoveries(CATALOG_GRAPH));
    const promising = annotated.filter((c) => c.verdict === 'promising');
    const entailed = promising.filter((c) => c.consequence?.signal === 'entailed').length;
    const novel = promising.filter((c) => c.consequence?.signal === 'novel-consequence').length;
    expect(entailed).toBe(0);
    expect(novel).toBe(1);
  });

  it('LIVE PIN (Task-0 measured): canonical promising yields 0 entailed, 3 novel-consequence', () => {
    const annotated = annotateConsequences(rankDiscoveries(CANONICAL_GRAPH));
    const promising = annotated.filter((c) => c.verdict === 'promising');
    expect(promising.filter((c) => c.consequence?.signal === 'entailed').length).toBe(0);
    expect(promising.filter((c) => c.consequence?.signal === 'novel-consequence').length).toBe(3);
  });

  it('annotation is order-preserving and non-mutating (same verdicts/scores as input)', () => {
    const ranked = rankDiscoveries(CATALOG_GRAPH);
    const annotated = annotateConsequences(ranked);
    annotated.forEach((c, i) => {
      expect(c.verdict).toBe(ranked[i].verdict);
      expect(c.score).toBe(ranked[i].score);
      expect(c.a).toBe(ranked[i].a);
      expect(c.b).toBe(ranked[i].b);
    });
  });
});
```

Plus a UNIT test of the classifier's same-target/same-governing logic, using the synthetic positive + negative controls (this is the design's non-vacuous guard). Read `CANONICAL_EQUATIONS` to pick a real entry `ce` that HAS a `scalarAst` and a monomial:

```ts
import { classifyProposal } from '../../src/composition/consequence.js';
import { normalForm } from '../../src/canonical/normal-form.js';
import { CANONICAL_EQUATIONS } from '../../src/canonical/registry.js';

describe('classifyProposal — same-target AND same-governing match (the r1-bug guard)', () => {
  const withAst = CANONICAL_EQUATIONS.filter((e) => e.scalarAst);
  it('POSITIVE control: a proposal whose normalForm == a canonical eq for the SAME target and SAME governing → entailed', () => {
    const ce = withAst[0]; // any canonical eq with a scalarAst
    const fakeProposal = {
      target: ce.dimensional.target,
      governing: ce.dimensional.governing,
      scalarAst: ce.scalarAst!,
      derivedFrom: { sourceEquationIds: ['X', 'Y'] as [string, string] },
    };
    const res = classifyProposal(fakeProposal as never, CANONICAL_EQUATIONS);
    expect(res.signal).toBe('entailed');
    expect(res.evidence.canonicalMatch).not.toBeNull();
  });
  it('NEGATIVE control: same target, DIFFERENT governing set → NOT entailed (novel-consequence), never a contradiction', () => {
    const ce = withAst[0];
    // same target, but strip the governing set so it cannot match same-governing
    const fakeProposal = {
      target: ce.dimensional.target,
      governing: [] as const, // different governing → must NOT be entailed
      scalarAst: ce.scalarAst!,
      derivedFrom: { sourceEquationIds: ['X', 'Y'] as [string, string] },
    };
    const res = classifyProposal(fakeProposal as never, CANONICAL_EQUATIONS);
    expect(res.signal).toBe('novel-consequence'); // not entailed; and there is no 'contradiction' signal at all
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/composition/consequence.test.ts`
Expected: FAIL — `src/composition/consequence.js` does not exist.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/composition/consequence.ts
/**
 * Consequence propagation — the machine pre-classifier for the human
 * adjudication ledger. A POST-PASS annotation over ranked candidates (mirrors
 * `annotateAdjudications`): reuse `deriveProposedBridges` to derive each
 * promising candidate's monomial consequence, then compare its `normalForm`
 * against the canonical registry (SAME target AND SAME governing set) to label
 * it `entailed` (re-derives known physics), `novel-consequence` (valid, no
 * match), or `inconclusive` (no monomial consequence). Annotation-only: never
 * mutates the catalog/graph, never re-orders or re-scores, never writes to
 * ADJUDICATIONS. The underlying ProposedBridge stays `status:'unadjudicated'`.
 *
 * @module composition/consequence
 */
import type { VettedCandidate } from './discovery.js';
import type { ProposedBridge } from './proposed-bridges.js';
import { deriveProposedBridges } from './proposed-bridges.js';
import { normalForm } from '../canonical/normal-form.js';
import { CANONICAL_EQUATIONS } from '../canonical/registry.js';
import type { CanonicalEquation } from '../canonical/canonical-equation.js';

/** @public */
export type ConsequenceSignal = 'entailed' | 'novel-consequence' | 'inconclusive';

/** @public */
export interface ConsequenceEvidence {
  readonly target: string;
  readonly governing: readonly string[];
  readonly derivedNormalForm: string;
  /** The id of the canonical equation whose normalForm matched, or null. */
  readonly canonicalMatch: string | null;
  readonly sourceEquationIds: readonly [string, string];
}

/** @public */
export type ConsequenceAnnotatedCandidate = VettedCandidate & {
  readonly consequence?: {
    readonly signal: ConsequenceSignal;
    readonly evidence: readonly ConsequenceEvidence[];
  };
};

/** Governing-name set equality (order-insensitive). */
function sameGoverning(a: readonly { name: string }[], b: readonly { name: string }[]): boolean {
  if (a.length !== b.length) return false;
  const sa = new Set(a.map((g) => g.name));
  return b.every((g) => sa.has(g.name));
}

/**
 * Classify ONE derived proposal against the canonical registry.
 * `entailed` iff some canonical equation with a `scalarAst` has the SAME target
 * name AND SAME governing set AND a matching `normalForm`. Otherwise
 * `novel-consequence`. There is NO contradiction signal — a differing normalForm
 * for the same target is NOT a contradiction (design r2: E=mc² vs E=hf).
 * @public
 */
export function classifyProposal(
  proposal: Pick<ProposedBridge, 'target' | 'governing' | 'scalarAst' | 'derivedFrom'>,
  canonical: readonly CanonicalEquation[] = CANONICAL_EQUATIONS,
): { readonly signal: Exclude<ConsequenceSignal, 'inconclusive'>; readonly evidence: ConsequenceEvidence } {
  const derivedNF = normalForm(proposal.scalarAst);
  let canonicalMatch: string | null = null;
  for (const ce of canonical) {
    if (!ce.scalarAst) continue;
    if (ce.dimensional.target.name !== proposal.target.name) continue;
    if (!sameGoverning(ce.dimensional.governing, proposal.governing)) continue;
    if (normalForm(ce.scalarAst) === derivedNF) {
      canonicalMatch = ce.id; // CanonicalEquation.id is a top-level `readonly id: string` (verified)
      break;
    }
  }
  return {
    signal: canonicalMatch ? 'entailed' : 'novel-consequence',
    evidence: {
      target: proposal.target.name,
      governing: proposal.governing.map((g) => g.name),
      derivedNormalForm: derivedNF,
      canonicalMatch,
      sourceEquationIds: proposal.derivedFrom.sourceEquationIds,
    },
  };
}

/**
 * Annotate ranked candidates with their consequence signal. Order-preserving,
 * 1:1 with the input; only `promising` candidates are classified (they are the
 * only ones `deriveProposedBridges` processes). A promising candidate with no
 * derived proposal is `inconclusive`.
 * @public
 */
export function annotateConsequences(
  candidates: readonly VettedCandidate[],
): readonly ConsequenceAnnotatedCandidate[] {
  const promising = candidates.filter((c) => c.verdict === 'promising');
  const proposals = deriveProposedBridges(promising);

  // Group proposals + their classification by the sorted candidate-pair key.
  const byPair = new Map<string, { signal: ConsequenceSignal; evidence: ConsequenceEvidence[] }>();
  for (const p of proposals) {
    const key = [p.derivedFrom.identification.a, p.derivedFrom.identification.b].sort().join('~');
    const cls = classifyProposal(p);
    const cur = byPair.get(key);
    if (!cur) {
      byPair.set(key, { signal: cls.signal, evidence: [cls.evidence] });
    } else {
      cur.evidence.push(cls.evidence);
      // entailed dominates novel: if ANY consequence re-derives known physics, the pair is entailed.
      if (cls.signal === 'entailed') cur.signal = 'entailed';
    }
  }

  return candidates.map((c) => {
    if (c.verdict !== 'promising') return c;
    const key = [c.a, c.b].sort().join('~');
    const hit = byPair.get(key);
    const signal: ConsequenceSignal = hit ? hit.signal : 'inconclusive';
    return { ...c, consequence: { signal, evidence: hit?.evidence ?? [] } };
  });
}
```

**Verify at implementation:** `CanonicalEquation.id` is confirmed (`readonly id: string`, e.g. 'CE-newton-gravitation'). Read `proposed-bridges.ts:158-185` to confirm `ProposedBridge` exposes `scalarAst`, `target`, `governing`, `derivedFrom.identification.{a,b}`, and `derivedFrom.sourceEquationIds` exactly as used above. The `fakeProposal as never` cast in the unit test is only to satisfy the `Pick<ProposedBridge,...>` param from a literal — keep the literal's field names matching the Pick (`target`, `governing`, `scalarAst`, `derivedFrom.sourceEquationIds`); if tsc accepts the literal without the cast, drop the cast.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/composition/consequence.test.ts`
Expected: PASS (live pins 0/1 catalog, 0/3 canonical; positive+negative controls). Then `npx tsc --noEmit && npx tsc -p tsconfig.tests.json --noEmit`.

- [ ] **Step 5: Commit**

```bash
git add src/composition/consequence.ts tests/composition/consequence.test.ts
git commit -m "feat(discovery): consequence-propagation annotation (entailed/novel/inconclusive)"
```

---

### Task 2: `discover` CLI surfacing + `--json`

**Files:**
- Modify: `src/cli/commands/discover.ts`, `src/cli-api.ts`
- Test: modify `tests/cli/upt-discover-opts.test.ts`; re-pin the discover golden(s)

**Interfaces:**
- Consumes: `annotateConsequences`, `ConsequenceAnnotatedCandidate` (Task 1) via `ctx.api`.

- [ ] **Step 1: cli-api re-export** — add to `src/cli-api.ts` (near the discovery re-exports):
```ts
export { annotateConsequences } from './composition/consequence.js';
export type { ConsequenceAnnotatedCandidate, ConsequenceSignal, ConsequenceEvidence } from './composition/consequence.js';
```

- [ ] **Step 2: Write the failing test** (discover surfaces the signal in text + json)

```ts
// add to tests/cli/upt-discover-opts.test.ts (mirror the existing runCli harness in that file)
it('discover shows a consequence signal on promising candidates', async () => {
  const cap = /* the file's existing capture harness */;
  const code = await runCli(['discover'], cap.io);
  expect(code).toBe(0);
  expect(cap.lines.join('')).toMatch(/consequence|novel-consequence|entailed/i);
});
it('discover --json carries the consequence field additively', async () => {
  const cap = /* capture */;
  const code = await runCli(['discover', '--json'], cap.io);
  expect(code).toBe(0);
  const parsed = JSON.parse(cap.lines.join(''));
  const promising = parsed.result.filter((r: { verdict: string }) => r.verdict === 'promising');
  expect(promising.every((r: { consequence?: unknown }) => 'consequence' in r)).toBe(true);
});
```
(Read the file's existing harness + how `--json` result is shaped before writing — mirror it exactly.)

- [ ] **Step 3: Wire it in** — in `discover.ts`, after `annotateAdjudications` produces `annotated`, run `api.annotateConsequences` over the SAME ranked list (compose the two annotation layers — both are `VettedCandidate & {...}` intersections, so apply consequence to the adjudication-annotated array; confirm the field merges). Add a text trailer per promising candidate showing `consequence.signal` (when present), and include `consequence` in the `--json` result objects. Do NOT re-order. The `--derive` path is unaffected (consequence, like adjudication, is skipped there).

- [ ] **Step 4: Run + re-pin goldens**

Run: `npm run build && npx vitest run tests/cli/upt-discover-opts.test.ts`
Then re-capture the discover golden(s) that now show the consequence line (rebuild dist FIRST — the Phase-3 lesson), register any new golden in BOTH `tests/cli/golden-cases.mjs` and the in-process list, and run `npx vitest run tests/cli/upt-golden.test.ts tests/cli/inprocess-golden.test.ts`. Both tsc gates clean.

- [ ] **Step 5: Commit**
```bash
git add src/cli/commands/discover.ts src/cli-api.ts tests/cli/upt-discover-opts.test.ts tests/cli/golden* tests/cli/inprocess-golden.test.ts
git commit -m "feat(cli): discover surfaces the consequence signal (text + --json)"
```

---

### Task 3: Public exports, docs, and wrap

**Files:**
- Modify: `src/index.ts`, `CHANGELOG.md`, `README.md`, `cli/README.md`, `todo.md`, `docs/architecture/`

- [ ] **Step 1: Public exports** — add to `src/index.ts` (following the adjudication exports): `annotateConsequences` (value) and `ConsequenceAnnotatedCandidate`, `ConsequenceSignal`, `ConsequenceEvidence` (types). Update any public-surface snapshot/invariant test (grep `public-surface`, `public-tag`) — the whole-suite invariant fails otherwise (the Phase-1/3 lesson).

- [ ] **Step 2: Verify the calibration benchmark is UNCHANGED**

Run: `npx vitest run tests/composition/discovery-calibration.test.ts`
Expected: PASS byte-identical (this plan never touched `rankDiscoveries`/`VettedCandidate` — the whole point of the annotation-layer design). If it moved, STOP — something leaked into the core funnel.

- [ ] **Step 3: Docs** — `CHANGELOG.md` `## [Unreleased]` `### Added`: consequence-propagation annotation (entailed/novel/inconclusive), the machine pre-classifier for the ledger, annotation-only, Task-0 yield (0 entailed / 4 novel), Unit B deferred. `README.md`: note the discover consequence signal; refresh the suite count after the gate. `cli/README.md`: the `discover` consequence column + `--json` field. `todo.md`: check off Unit A; keep Unit B queued.

- [ ] **Step 4: Regenerate dep graph** — `npm run docs:deps`; commit the regenerated `docs/architecture/` (wrap task); confirm cycles still 0+0.

- [ ] **Step 5: Release-gate** — `npm test` (full suite; expect green incl. the unchanged calibration benchmark), then `npm run build && npm run smoke`. Record the passing count for README.

- [ ] **Step 6: Commit**
```bash
git add src/index.ts CHANGELOG.md README.md cli/README.md todo.md docs/architecture/
git commit -m "docs(discovery): public exports, CLI/README, CHANGELOG; dep-graph restamp"
```

---

## Self-review

- **Spec coverage:** the design's Unit A (annotation-only entailed/novel/inconclusive; `consequence-invalid` cut; synthetic positive + negative control; benchmark untouched; discover surfacing) maps to Tasks 1–3. `consequence-invalid` is absent (cut per Task-0). ✓
- **Placeholder scan:** every code step carries real code; the two `as never`/`as {id?}` casts are flagged "verify at implementation" with the real-shape instruction (not placeholders — they're guarded casts pending a field-name confirmation the implementer makes by reading source). Live pins use the Task-0-measured numbers (0/1, 0/3), not invented values. ✓
- **Type consistency:** `ConsequenceSignal`/`ConsequenceEvidence`/`ConsequenceAnnotatedCandidate`/`annotateConsequences`/`classifyProposal` names are consistent across Tasks 1–3. `annotateConsequences` returns `readonly ConsequenceAnnotatedCandidate[]` everywhere. ✓
- **The design's circular-integration correction** (post-pass, not `vetInContext`) is stated in Global Constraints and realized in Task 1. ✓
- **Pre-execution verification gate:** Task 1 Step 3 instructs the implementer to confirm `ProposedBridge`/`CanonicalEquation` field names (esp. `id`, `scalarAst`, `derivedFrom.identification`) against source before finalizing — the CLAUDE.md wrong-snippet mitigation.
