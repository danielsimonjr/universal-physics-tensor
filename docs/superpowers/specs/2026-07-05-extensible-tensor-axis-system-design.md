# Extensible Tensor Axis Type System (rank-N, consumer-driven): Design

**Date:** 2026-07-05 · **Status:** r1 — approved (Approach C), for implementation.

## Motivation

UPT is expanding to many more branches of physics (condensed matter, gauge/particle
physics, statistical field theory, biophysics, …). The rank-6 tensor's axes must
become **first-class and extensible** to classify them — including the currently
**untyped Topology axis** — and a genuinely new **Quantum Statistics** axis
(bosonic/fermionic/anyonic/parastatistic) that condensed matter and particle physics
both need and that does not cleanly reduce to the other six.

The hard constraint (from this session's Phase-2 grounding + the scale/force
axis-audit): an axis is only load-bearing when quantities **carry** its attribute and
the discovery funnel **measures** it firing. Wiring an axis that only ever abstains is
the inert-metadata / E-layer trap we have killed repeatedly. So the design is
**consumer-driven**: type + wire the axes, but gate them in the falsifier ONLY on
measured discrimination.

## Approach C — typed unions + a data-driven registry

Each classification axis is BOTH a typed union (compile-time safety) AND a registry
entry (runtime, drives the falsifier + audit). Adding an axis = one union + one
registry line + tagging quantities.

### Component 1 — `src/composition/axes.ts` (new, the single source)

```ts
export type ScaleAxis = 'quantum' | 'mesoscopic' | 'classical' | 'cosmological';
export type ForceAxis = 'gravitational' | 'electromagnetic' | 'weak' | 'strong' | 'emergent';
export type InformationAxis = 'von-neumann' | 'shannon' | 'kolmogorov' | 'discord';
export type SymmetryAxis = 'poincare' | 'gauge' | 'conformal' | 'susy' | 'emergent';
export type TopologyAxis = 'trivial' | 'chern' | 'winding' | 'z2' | 'berry';
export type StatisticsAxis = 'bosonic' | 'fermionic' | 'anyonic' | 'parastatistic';

export interface AxisSpec {
  readonly name: string;               // 'scale' | 'force' | 'topology' | ...
  readonly values: readonly string[];  // the union's members at runtime
  readonly gated: boolean;             // participates in the discovery axis falsifier?
  readonly description: string;
}
export const AXES: readonly AxisSpec[] = [ /* the six regime axes below */ ];
export const GATE_AXES: readonly string[] = AXES.filter(a => a.gated).map(a => a.name);
```

Registry contents (initial `gated` flags in **bold**):
- scale — **gated: true** (existing)
- force — **gated: true** (existing)
- information — gated: false (existing, authored-not-gated)
- symmetry — gated: false (NEW as an attribute; typed already in core)
- topology — gated: false (NEW)
- statistics — gated: false (NEW, the 7th axis)

A **sync test** pins each union's members === its registry `values` (no drift).

The SI `Dimension` axis is **NOT** in this registry — it is the complete 7-base system
in `dimensional/`; conflating it would break Buckingham-π. `core/types.ts`'s
tensor-config types (`PhysicalScale`/`Force`/`Symmetry`/`InformationMeasure`, consumed
by `UniversalTensor`) stay as-is; the axes registry is the discovery/attribute layer.
(A follow-up MAY reconcile the two, out of scope here.)

### Component 2 — `RegimeAttributes` (extend, in `quantity.ts`)

Reference the axes.ts unions and add the three new fields:

```ts
export interface RegimeAttributes {
  readonly scale?: ScaleAxis;
  readonly force?: ForceAxis;
  readonly information?: InformationAxis;
  readonly symmetry?: SymmetryAxis;      // now first-class
  readonly topology?: TopologyAxis;      // NEW
  readonly statistics?: StatisticsAxis;  // NEW
}
```

Quantities are tagged with the new attributes **only where the physics is
unambiguous and sourced** — same discipline the scale/force audit enforced (it
STRIPPED `mass`/`temperature` to `{}` under reviewer disagreement). Initial tagging:
the existing topology-bearing quantities (quantum-Hall conductance/resistance,
holographic/RT entropy, topological-entanglement entropy) get `topology`; obvious
statistics carriers get `statistics`. No guessing.

### Component 3 — falsifier integration (`discovery.ts`)

The axis falsifier already iterates `GATE_AXES` and indexes `attrs[axis]`, abstaining
on `undefined`, clashing on a mismatch. The ONLY change: import `GATE_AXES` from
`axes.ts` (registry-derived) instead of the local `const`. Enabling an axis's gate is
then a one-line `gated: true` flip. No falsifier-logic surgery. `effectiveAttributes`
returns the full `RegimeAttributes`, so the new fields flow automatically.

### Component 4 — discrimination audit (`src/composition/axis-audit.ts`, new)

`auditAxisDiscrimination(edges)` runs the candidate funnel and reports, per axis:
`{ axis, fires, abstains, checked, clashRate }`. An axis that never fires is inert —
it stays ungated, documented. An axis flips to `gated: true` ONLY when the audit shows
it discriminates. Surfaced like the coverage/grounding reports; pinned by a test.
This is the anti-inert-metadata gate: **rank grows on measured evidence, not vision.**

## What ships now vs later

- **Now:** the registry + Topology/Statistics typed + wired into `RegimeAttributes` +
  the audit tool; tag the existing topology/statistics-bearing quantities. New-axis
  gates stay **off** (coverage too thin to fire — honest). Statistics carries a note:
  the spin-statistics theorem ties it to Symmetry, so the audit must confirm it
  discriminates INDEPENDENTLY before it earns a gate.
- **Later (each its own effort):** as branch bridges land, coverage grows; re-run the
  audit; flip gates that now discriminate.

## Testing

- Union↔registry sync (members === values); non-empty/unique values per axis.
- Existing axis-clash tests stay green (scale/force behaviour unchanged).
- New-attribute round-trip: quantities tagged with topology/statistics validate and
  are readable by `effectiveAttributes`.
- `auditAxisDiscrimination` report pinned (initial firing rates: topology/statistics
  abstain on the current funnel — documented, not a failure).

## Non-goals (YAGNI + honesty)

- No SI-dimension expansion (complete; separate system).
- No gate flips without measured firing.
- No reconciliation of the tensor-config types with the axes registry (follow-up).
- No new branch bridges here — this is only the scaffolding they ride on.
