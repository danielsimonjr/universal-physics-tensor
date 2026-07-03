# Discovery-Hardening Phase 6 (v0.36.0) — E-layer Coarse-Graining Relations: Design

**Date:** 2026-07-03 · **Status:** r1 — DRAFT, awaiting Adam/Eve adversarial vet.
**Program:** Phase 6 (P8) of the discovery-hardening program — the last
remaining roadmap item.
**Grounded in** the 2026-07-03 substrate map + a consumption probe (verified):
the tensor's E-layer (Π = L + B + E) has **no composition-graph or canonical
presence** — the only E-layer artifacts are the legacy `EmergentPhenomenon`
type and `EmergenceCell`, referenced solely in `src/core/` (cell/flux-rules/
tensor/types/index) and **consumed by nothing in `src/composition/` or
`src/canonical/`**. The E-layer is inert today. The one existing coarse-graining
bridge (BE-15, Kawasaki-Gunton `L² = Γt`) is an ordinary `BridgeEdge`; its
"emergence" is prose in its docstring.

## The value question, named up front (the Unit-B / Phase-5 lesson)

The roadmap says: "3-5 canonical coarse-graining relations as directed
limit-edges (N→∞, ℏ→0 metadata); funnel learns the edge type." Grounding raises
the same value question that down-scoped the last three discovery-machinery
items (Unit B cancelled, Phase 5 gate-change rejected, symbolic-deepening
measured zero-yield): **would an E-layer produce real value, or add inert
structure / low-yield funnel machinery?** The evidence is not encouraging:

- The E-layer is **already inert** (isolated in `core/`, unused by discovery).
- The discovery funnel is mature and honest (0/8 genuine, coincidence-
  dominated); the last three attempts to add discovery/symbolic machinery all
  measured low-or-zero yield. There is no reason to expect limit-edges to be
  different — a cross-regime candidate matching a known limit-edge would be a
  rare "known-emergence" flag (analogous to consequence-propagation's
  `entailed`, which measured **0**).

So a **full** E-layer (new `kind:'limit'` edge type + funnel-consumption logic +
the discovery integration) is very likely a large build for inert structure or
near-zero discovery yield. This design does NOT propose that. It proposes the
**minimal honest version** and lets the vet judge whether even that is worth it.

## The minimal honest version (what this design actually proposes)

Encode the **3-5 canonical coarse-graining relations as first-class CANONICAL
L-layer entries** carrying an emergence-limit annotation — NOT a new edge-type
machinery, NOT funnel-consumption logic. The value delivered is **structural /
documentary completeness of the tensor formalism**: the framework claims
Π = L + B + E, and today the E content is absent/prose; this makes the known
emergence relations *present, encoded, and citable* in the same registry the
L-layer uses, with the limit metadata (parameter, direction) recorded.

The 3-5 relations are REAL, textbook coarse-graining limits (honest known
physics, unlike Unit B's numerology):

| relation | limit | from → to | citation class |
|---|---|---|---|
| Ehrenfest / classical limit | ℏ → 0 | quantum → classical mechanics | textbook QM |
| Thermodynamic limit | N → ∞ | statistical mechanics → thermodynamics | textbook stat-mech |
| Hydrodynamic / continuum limit | lattice spacing → 0 | discrete → continuum | textbook |
| (optional) BE-15 coarsening | t → ∞ | microscopic → mesoscale domain | Kawasaki-Gunton (already a bridge) |

Each is a `CanonicalEquation`-shaped entry (reusing the existing registry +
its dimensional/normal-form machinery) with a NEW small annotation
`emergenceLimit?: { parameter: string; direction: 'to-zero'|'to-infinity';
fromRegime: string; toRegime: string }`. That is the whole change: a typed,
cited, dimensionally-validated encoding of known emergence relations, so the
E-layer physics EXISTS in the codebase rather than being an aspirational claim.

## What this deliberately does NOT do

- **No new `BridgeEdge` `kind:'limit'` variant, no funnel-consumption logic.**
  The evidence says the funnel wouldn't get real value from consuming
  limit-edges; building that machinery is the "inert structure / low-yield"
  trap. If a concrete need to have the funnel *use* limit-edges ever appears
  (a candidate that matches a limit relation), THAT is when the consumption
  logic gets designed — YAGNI until then.
- **No claim that this enables new discovery.** Its justification is
  completeness of the tensor formalism, stated honestly.

## Firewall + benchmark

- Additive canonical content only; the discovery funnel is **untouched** (these
  are L-layer entries the funnel already reads for the canonical-source runs,
  exactly like the other canonical equations). The calibration benchmark on
  `CATALOG_GRAPH` is unaffected; the canonical-graph counts may gain entries and
  are re-pinned (measured) — the same intended-move pattern as prior canonical
  expansions.
- **Physicist-review surface (program-mandated for the E-layer):** each
  relation carries its citation + limit metadata; the honest-degenerate note
  states these are the KNOWN textbook limits, encoded for completeness, not
  machine discoveries.

## Architecture

| File | Responsibility |
|---|---|
| `src/canonical/canonical-equation.ts` (modify) | `CanonicalEquation` gains optional `emergenceLimit?` metadata (parameter/direction/from/to). |
| `src/canonical/entries/emergence.ts` (create) | the 3-5 coarse-graining `CanonicalEquation` entries, each cited + dimensionally validated. |
| `src/canonical/registry.ts` (modify) | register the new entries. |
| `tests/canonical/emergence.test.ts` | per-entry dimensional-validation + normal-form pins; the `emergenceLimit` metadata shape. |

## The go/no-go this design commits to

The honest question for the vet: **is the E-layer's structural/documentary
completeness worth 3-5 encoded canonical entries + a small metadata field — or
is the E-layer's absence an acceptable, documented scope boundary** (the
framework says Π = L + B + E aspirationally, and honestly labels the E-layer as
future work)? If the vet judges even the minimal version is not worth its
weight — that encoding known textbook limits as canonical entries adds
maintenance without real use — then Phase 6 is NOT built and the E-layer's
absence is documented as a deliberate, honest scope boundary. Given the pattern
(three prior items down-scoped), this design's author assesses the minimal
version as **marginal-but-defensible** (it encodes real physics for
completeness, low-risk, no false claims) and the full version as
**not-worth-building** (inert machinery). The vet decides between "build the
minimal completeness version" and "document the E-layer as an accepted scope
boundary and declare the discovery-hardening program complete."
