# The rank-7 axes classify but do not gate: a measured ceiling

**A PI result from the condensed-matter bridge cluster (2026-07-05).** Reproducible
with `node bin/upt.mjs coverage` + the `auditAxisDiscrimination` API.

## The question

v0.41.0 typed two new tensor axes — **Topology** and **Quantum Statistics** — and wired
them into the discovery falsifier as UNGATED attributes, with a discrimination audit
(`axis-audit.ts`) as the gate: an axis earns `gated: true` only when it MEASURABLY fires
(clashes) on the candidate funnel. The condensed-matter cluster (BE-59 Josephson, BE-60
fractional QH, BE-61 Wiedemann-Franz, BE-62 BCS gap) is the first branch expansion that
tests whether those axes earn a gate — anchored where BE-55 (quantum Hall) already sits.

## The measured answer: no

After adding the four bridges and honestly tagging the graph's electron-gas quantities
(`carrier-density`, `effective-mass` → `statistics: fermionic`; `topological-entanglement-
entropy` → `topology: z2`; `dark-fermion-mass` → `statistics: fermionic`), the audit reads:

| axis | gated | checked | fires | discriminates |
|---|---|---|---|---|
| scale | ✅ | 111 | 75 | yes |
| force | ✅ | 39 | 29 | yes |
| information | — | 1 | 0 | no |
| symmetry | — | 0 | 0 | no |
| topology | — | 0 | 0 | no |
| **statistics** | — | **0** | **0** | **no** |

**Statistics stays `checked=0` even after tagging** — because the three fermionic graph
quantities have three DIFFERENT dimensions ([L⁻³], [mass], [energy]), so no same-dimension
pair forms, so the gate has nothing to check, let alone clash. Topology is the same.

## Why this is structural, not thin coverage

A statistics gate can only fire on a **fermion↔boson clash at the same dimension**. A
sweep of all 131 graph quantities finds **no fermion↔boson same-dimension pair** (only two
fermionic and one bosonic quantity exist at all). This is not an accident of a small
catalog — it is what the physics forces:

> The physics that CARRIES topology and statistics — quantized invariants (Chern, ℤ₂,
> winding), anyonic statistics, Cooper-pair condensates — is exactly the physics that is
> **closed-form and isolated**. BE-55/59/60 are topological/statistical quantizations with
> no composition-graph edge; their quantities never enter the funnel. And the graph's
> transport quantities (Drude, Hall coefficient, Fermi gas) are all fermionic electron
> physics — same statistics, nothing to clash against.

So the two axes **classify** (they label real physics honestly) but do not **gate** (they
never separate a candidate the scale/force axes miss).

## The honest conclusion

The rank-7 framing is real as a **classification** — the catalog now spans classical Hall
(CE-hall-coefficient) and quantum/fractional Hall (BE-55/60), integer and fractional
topology, fermionic and (via BE-59) bosonic-condensate physics. But its **falsification**
payoff is nil on a monomial catalog: the axes that would enrich the discovery gate are
populated by physics too closed-form to graph-connect. This was **measured before it was
claimed** — the design predicted `fires=0` from the fermion↔boson sweep, and the audit
confirmed it. No gate was flipped. Rank grows on evidence; here the evidence says: not yet,
and not from this kind of physics.

The concrete value delivered is therefore the **spine growth** — four established,
data-confrontable bridges (evidence spine 12 → 16), including the completed quantum
metrology triangle (BE-55 ohm + BE-58 kelvin/k_B + BE-59 volt) — with the axis outcome
recorded as an honest null.
