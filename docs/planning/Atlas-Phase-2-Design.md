# Atlas Phase 2 — design note (Sprint 2: regimes and error-carrying paths)

**Status:** draft for Adam vet A2. Authorized by the Sprint 2 promotion in
[`ACTIVE.md`](ACTIVE.md).

**Goal.** Make *"at my operating point, which models are valid, and where does each stop"* a
query, and make path error a computed bound rather than prose.

---

## 0. The invariant this sprint is most likely to break, stated first

**The GR spine re-expression must leave every confrontation number unchanged.**

Sprint 2 re-expresses general-relativity validity conditions in dimensionless form (`r_s/r`,
`v/c`). That is a change of *description*, not of *physics* — so every number produced by
`listConfrontations()` and every GR test value must be **bit-identical** before and after.

This is the load-bearing invariant because it is the one that can break **silently**: a
re-expression that is subtly wrong still returns plausible numbers, still passes a smoke test, and
is only caught by comparing against the previous values. So it is pinned, not read:

- Capture every confrontation's numeric output **before** any Sprint 2 edit, as a committed golden.
- Assert equality **after**, with the golden in the repository rather than in an agent's memory.
- A tolerance is NOT acceptable here. The claim is "the description changed and the physics did
  not", and any nonzero delta falsifies it.

Sprint 0 lost time to a plan's arithmetic error that produced a confidently wrong test; this is the
same class, and a golden captured first is the only instrument that catches it.

---

## 1. `Regime` and `ValidityDomain` — two different claims, not one claim twice

| | `ValidityDomain` (shipped) | `Regime` (Sprint 0) |
|---|---|---|
| Form | `description: string` + `predicate: (inputs) => boolean` | `family` + `inequalities` over π-groups + `groupDefinitions` |
| Evaluates over | **raw named inputs** | **dimensionless groups** |
| Readable by a machine | No — an opaque closure | Yes — declarative inequalities |
| Traceable to the dimension matrix | No | Yes, keyed by `PiGroup.formula` |

**They coexist. A regime NEVER silently replaces a predicate.** This is the sprint's second
absolute rule, and the reason is not stylistic:

- A `predicate` is an arbitrary closure. It may encode conditions **no π-group captures** —
  positivity, integer-ness, a branch cut, a domain exclusion. Replacing it with a regime would
  discard those *invisibly*, because the resulting object still type-checks and still answers.
- A `Regime` carries traceability a closure cannot. Losing it would give up exactly what makes the
  regime queryable.

**Rule.** When both are present, `evaluateEdge` checks the `predicate` exactly as it does today,
and **additionally** evaluates `regimeHolds` *only when the caller supplies group values*. When
only one is present, behaviour is unchanged from today. There is no migration, no deprecation, and
no code path in this sprint that reads a regime *instead of* a predicate.

**The interface boundary that follows, and it must be explicit:** a regime is stated over π-groups,
so *someone* must compute group values from raw inputs. This sprint does **not** do that
computation implicitly inside `evaluateEdge` — inferring group values from raw inputs would be a
silent, lossy guess at the mapping. The caller supplies them. An absent group value is **unknown**,
and unknown is *not* a violation — the same asymmetry Sprint 1 settled for conventions: silence is
a question, never a verdict.

---

## 2. Uniformity is a field, enforced at admission

Sprint 0 established that an approximation's error may be **non-uniform** — the pendulum's phase
error grows without bound in time while its period error stays small. A bound with no statement of
what it is uniform *in* is not a bound.

So `ApproximationBound` gains a uniformity statement, and it is **enforced at admission** rather
than checked later: constructing a bound without it throws, exactly as `MissingHorizonError`
already guards the machine horizon. A validator that runs "later" is one that can be skipped.

---

## 3. Path bounds: `(K, δ)` composed along a route

`propagateUncertainty` composes bounds along a path using the existing outer-after-inner algebra
(`composeBoundPath`, `K₂K₁` and `K₂δ₁ + δ₂`). Two constraints carried from Sprint 1:

1. **A path containing any edge whose relation composes to `'no-composite-claim'` has NO bound.**
   It must return an explicit no-claim, never a number. A composed number over an undefined
   composite would be the most dangerous output this library could produce: precise-looking and
   unfounded.
2. **Norm-relativity is still unrecorded** (Phase 1 §0). `IDENTITY_BOUND` holds *in the norm a
   bridge states*, and no field records that norm, so a path crossing two differently-normed
   bounds cannot be composed soundly. **Phase 2 should add `norm?` to `ApproximationBound`** —
   this is the field whose absence forced four conservative table cells, and adding it is what
   makes them revisitable.

---

## 4. Widening the composition table is a reviewed act

Phase 2 supplies the edge data that Phase 1's four conservative rows were waiting on. Any widening
must:

- fail the **pinned cell-count test** first (56 `'no-composite-claim'` of 64), so the change is
  visible;
- assert each newly-defined cell individually, because — as Phase 1 learned when a demotion and an
  addition cancelled — **a count pin does not detect a swap**;
- state which edge field justifies the widening. A cell defined without the data that licenses it
  is a false claim wearing a table.

---

## 5. Out of scope, deliberately

- No change to `status`, `EdgeConfidence`, or any existing confrontation value.
- No new export on `src/index.ts`; everything stays `@internal` behind the `atlas` subpath.
- Row and edge counts stay 55 / 41.
- No migration of any `ValidityDomain` to a `Regime`.

---

## 6. Open items for Adam (A2)

1. **§0 is the priority.** Is a committed golden of every confrontation number, compared with zero
   tolerance, sufficient to catch a wrong GR re-expression — or is there a way for the
   re-expression to be wrong while leaving all current numbers unchanged? If the latter, the
   golden is necessary but not sufficient and I need to know what else to pin.
2. Is "the caller supplies group values, absent ⇒ unknown ⇒ not a violation" right, or does it let
   a genuinely-violated regime pass silently as unknown? Compare with the conventions asymmetry
   Sprint 1 settled, and say whether the two cases are actually alike.
3. Does keeping `predicate` and `Regime` side by side create a way for them to **disagree**, and if
   so what should `evaluateEdge` do? I have deliberately not defined a precedence — say whether
   that is a hole.
4. Is enforcing uniformity at admission right, or does it make some legitimate bound
   unconstructible?
5. Anything I have not asked about — particularly anywhere this note assumes Sprint 0's `Regime`
   fits a purpose it was not designed for.
