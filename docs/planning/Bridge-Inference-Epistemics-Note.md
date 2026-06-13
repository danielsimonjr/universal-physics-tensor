# Bridge-Inference Epistemics — What the Mapping Can and Cannot Do

> **Provenance:** Written 2026-06-13 (branch
> `claude/bridge-equations-specs-review-4mfy38`), prompted by the
> framing question: *"UPT seeks a mapping from known equations of
> physics to bridge/linking equations with similar variable tensors, to
> help quantify missing variables in unknown equations — any thoughts?"*
>
> This is a **standing methodology note**, not a release artifact. It
> exists to keep the project's claims calibrated to what the dimensional/
> structural matching method can actually deliver, and to record three
> implementable consequences: the **identifiability trichotomy**, the
> **retrodiction benchmark**, and **structural-analogy-over-variable-
> similarity**. It is meant to sit beside the improvement plans and be
> cited when a future cycle is tempted to promise discovery the method
> cannot underwrite.
>
> **Status:** descriptive + recommending. No code changes are mandated
> by this note; the two concrete build targets it proposes (Buckingham-π
> enumeration, the retrodiction harness) are unscheduled and offered to
> the queue, not committed.

## The thesis hides two operations with very different standing

The one-sentence pitch — *map known equations to bridges by similar
variable tensors, then quantify missing variables in unknown equations*
— bundles two operations whose epistemic standing could not be more
different. Almost every calibration problem in this project comes from
treating them as one thing.

**(A) Constraint propagation inside known structure.** Given quantities
whose dimensions and tensor character are known, the dimensional functor
constrains functional form, propagates uncertainty, and catches
inconsistency. This is classical and *correct*: Buckingham π, unit
analysis, the reasoning behind the Planck scale and Kolmogorov turbulence
scaling. "Solving for a missing variable" here is interpolation inside a
structure already trusted.

**(B) Discovering an unknown law by matching similar variable tensors.**
This is the part the pitch leans on ("quantify missing variables in
*unknown* equations") and it is the weak one. Dimensional/variable
matching is a hypothesis *filter*, not a hypothesis *generator*. Two
quantities sharing dimensions tells you almost nothing: energy and torque
are dimensionally identical; entropy and heat capacity are both J·K⁻¹;
action and angular momentum coincide. The false-positive rate of "shares
units / shares variables" is enormous, and the failure mode has a name —
Eddington-style large-number numerology, Dirac's large-number hypothesis.
A mapping engine that proposes links by dimensional similarity will
manufacture plausible-looking nonsense faster than anything can refute
it.

**The load-bearing observation: the pitch oversells and the code
undersells.** The *implementation* — the status taxonomy (8 established ·
33 speculative · 3 highly-speculative), the negative catalog
(`src/bridges/rejected.ts`), and the GW170817 (BE-36) and Planckian
(BE-23) **data confrontations** — already knows that a bridge is a
conjecture until data adjudicates it. The lived project is far more
honest than its one-sentence summary. The corrective is not to change the
code; it is to **stop promising (B) when the value is in (A) plus
falsification**, and to make that boundary explicit wherever the project
describes itself.

## The units hazard is the thesis failing in miniature

The M-1 finding (Eve, 2026-06-11; banner in
`src/composition/quantities.ts`, design response in
`v0.10.0-Units-Normalization-Design-Note.md` r2) is not a bookkeeping
nuisance. It is direct proof that **the dimensional vector is too coarse
to certify a physical identity**:

- GeV-valued energy nodes sit beside joule-valued ones, factor
  1.602×10⁻¹⁰, dimension-indistinguishable.
- Information splits three ways — bits / nats / J·K⁻¹ — with bits and
  nats both living in DIMENSIONLESS, off by ln 2, with no dimensional
  guard.

If the ℤ⁷ exponent vector cannot tell joules from GeV or bits from nats,
it cannot be the thing that certifies "quantity X in equation 1 *is*
quantity Y in equation 2." That is the central matching claim failing on
the easiest possible cases. The G-9 per-quantity unit-convention tag is
therefore not cleanup — it is the admission that the functor needs a
**finer equivalence relation than dimensions** to be trustworthy as a
matcher. Treat M-1 as a load-bearing research finding, not a chore.

## Consequence 1 — the identifiability trichotomy

"Quantify the missing variable" is an inverse problem on a constraint
graph, and inverse problems admit a clean trichotomy that is *computable*
from the graph the project already maintains. For an unknown quantity,
take the subgraph of bridges and laws that touch it and count independent
dimensionless constraints against degrees of freedom:

1. **Over-determined** — the unknown is pinned *and* constraints remain.
   The surplus is a **consistency test**: this is the falsification
   regime, where BE-36 (GW170817) and BE-23 (Planckian) already live.
   *This is the project's strongest ground and should be the headline use
   case.*
2. **Exactly determined** — solvable, up to the dimensionless constant
   that dimensional analysis can never supply (the 2π, the ½, α). Honest
   and useful, provided the residual constant is flagged as
   undetermined, never invented.
3. **Under-determined** — a family of solutions; the graph cannot close
   it and real physics, not more matching, is required. *Most genuinely
   "unknown equation" cases land here* — which is exactly why the
   discovery claim must stay modest.

This trichotomy is the rigorous skeleton under the pitch, and it tells
the engine **when it is allowed to speak**. It is also implementable on
top of the existing composition graph: the enumerator
(`enumerateCompositions`) already walks edge compositions; classifying a
target node by (independent π-constraints touching it) vs (its free
dimensionless degrees of freedom) is the same machinery pointed at a
counting question. The honest version of "solve for the missing variable"
is **Buckingham-π enumeration** over a variable set — a well-posed,
classical algorithm the project does not yet have, and the principled
inference primitive that case (2) needs. Its hard boundary — it yields
form up to a function of the π-groups, never the dimensionless constant —
is precisely the line that separates this work from numerology, and must
be stated loudly wherever the capability is offered.

## Consequence 2 — the retrodiction benchmark (test the *framework*)

The sharp, fair test of whether the matching idea has any teeth at all:
**make it retrodict.** Hide a quantity the network already knows — say,
drop the Hawking-temperature node — and ask whether the surrounding
bridges recover it: functional form, and ideally order of magnitude. If
the engine cannot reconstruct things it was *previously told*, it has
zero chance on genuinely unknown physics, and that is cheap to discover
here instead of in a preprint.

This is a benchmark **on the framework itself**, distinct from the
per-bridge data confrontations (which test individual physics claims). It
is the meta-level guard against self-deception, and it is the kind of
result a physicist respects, because it is a way the whole project can
fail *visibly*. Recommended shape:

- A held-out harness: for each established-tier node with ≥1 incident
  edge, mask it, run the over-determined-subgraph solve, and score
  recovered form / magnitude against the known value.
- Report it as a standing framework metric (e.g. in
  `docs/architecture/`), refreshed per release like the benchmarks.
- Pre-register the pass bar before running (P-3 discipline): which nodes,
  what counts as recovery, what magnitude tolerance — committed before
  the first score, so the benchmark cannot be retrofitted to a flattering
  result.

The established tier (the 8) is the right proving ground: these are the
nodes whose true values are independently known, so a miss is
unambiguous.

## Consequence 3 — match structure, not variables

The phrase "similar variable tensors" points somewhere weaker than the
project's own best instincts. The strongest bridges in the history of
physics are **not** built from shared variables — they are
structure-preserving maps between domains whose variables differ:

- Maxwell's electrical–mechanical analogies,
- Onsager reciprocity (the symmetry of the transport matrix, not a shared
  quantity),
- the fluctuation–dissipation theorem (response ↔ correlation, across
  unrelated observables).

Each is a **functor between domains** in the category-theory sense: the
*shape* of the equations corresponds, while the physical interpretations
of the symbols do not. That is a sharper, more discriminating signal than
dimensional or variable overlap — and, per the units hazard above,
variable/dimensional overlap is demonstrably too coarse to certify
anything. Two rank-2 symmetric tensors that contract the same way against
the metric share something real; two scalars sharing J·K⁻¹ share almost
nothing.

Practical consequence for the matcher: the current reduction of every
quantity to a 7-vector of SI exponents throws away the most useful
fingerprint. **Tensor structure — valence, index symmetry, contraction
pattern — is a richer and more discriminating signal than scalar
dimensions, and it is under-exploited.** If the engine is ever to propose
*real* bridges rather than coincidences, it should match on relational
structure (same equation shape, possibly different domains), not on the
variables themselves. This is also the cleanest reading of the
project-name "tensor": not the rank-6 container (correctly being replaced
by the typed quantity graph), and not loosely "a bag of indexed numbers,"
but the covariant structure that makes two objects genuinely analogous.

## Positioning recommendation

Build and describe UPT as a **consistency-and-confrontation engine** that
*proposes* candidates for humans and data to kill — which is what it
already is. Concretely:

- **Lead with falsification, not discovery.** The respectable question is
  not "predict the unknown variable" but "these two equations claim to
  share a quantity — are they mutually consistent, and what does that
  consistency predict that I can check?" BE-36 and BE-23 are the
  template; make them the headline, not the footnote.
- **Gate the engine's voice on the trichotomy.** Let it solve only in the
  determined case, only ever report consistency in the over-determined
  case, and explicitly decline (return "under-determined; needs physics")
  rather than guess in the third.
- **Never invent the dimensionless constant.** Carry it as an explicit
  undetermined factor. This single rule is most of what separates the
  project from large-number numerology.
- **Resist the gravitational pull toward "it discovers new equations."**
  The matching method cannot carry that weight alone, and the project's
  own honesty machinery — the negative catalog, the speculative tier, the
  units hazard — is the standing evidence of why.

## Offered to the queue (not committed)

Two build targets follow from this note. Both are unscheduled; neither is
promised by writing this down:

1. **Buckingham-π enumerator** over a declared variable set — the
   principled primitive for the exactly-determined case, with the
   "form-up-to-a-π-function, never the constant" boundary enforced in the
   API surface.
2. **Retrodiction harness** over the established tier — the framework's
   own falsification benchmark, pre-registered before first score.

The identifiability classifier (Consequence 1) is the smallest of the
three and the natural first step: it is a counting query over the graph
`enumerateCompositions` already traverses, and it is the precondition for
both targets above.
