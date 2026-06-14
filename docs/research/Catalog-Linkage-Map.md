# Catalog Linkage Map — How the Equations Connect

> **Provenance:** 2026-06-14 (branch
> `claude/bridge-equations-specs-review-4mfy38`). The capstone of the
> bridge-inference toolset: point it at the whole catalog and map how the
> known and bridge equations LINK. Computed by `linkageMap`
> (`src/composition/bridge-analysis.ts`); reproduce with `upt map`; pinned
> by `tests/composition/linkage-map.test.ts`.

## Method

Two equations are *linked* when they share a quantity — one's output is
another's input, or they share an input — honoring the registered
`QUANTITY_IDENTIFICATIONS` (e.g. the Hawking temperature IS the
temperature in Landauer's bound). The connected components of that graph
are the **clusters**; a cluster is *anchored* when it contains an
established-confidence ("known physics") edge. We also count the
**directed** links: how many edge pairs actually compose into a chain.

This is a *structural* map — shared-vocabulary connectivity. It is **not**
a credibility signal (the orthogonality result from the dimensional audit
still holds): being in a cluster, or isolated, says nothing about whether
a bridge is true.

## The map (41 edges)

**23 components; 11 compose into chains.** The structure is a star, not a
web: one dominant cluster, two small thematic clusters, and a long
isolated tail.

### ● The anchored core — 16 edges

`be-11-zurek, be-12, be-16, be-37, be-42, be-42-via-rs, be-51, be-52,
law-schwarzschild-radius, be-48, be-11-master, be-23, be-27, be-33,
be-34, be-38`

- **status:** 5 established · 8 speculative · 2 highly-speculative · 1 law
- **link hubs:** `mass`, `temperature`, `schwarzschild-radius`,
  `decoherence-rate`, `thermal-de-broglie-wavelength`, `relaxation-rate`,
  `static-exponent-nu`, `dynamic-exponent-z`

This is the heart of the catalog's connectivity. **`mass` and
`temperature` are the load-bearing hubs**: established GR (lensing,
perihelion, Shapiro delay, the Schwarzschild radius) shares `mass` with
Hawking (be-42/-via-rs), GRW localization, MOND, and the perihelion
finder; and via the Hawking-temperature ≡ temperature identification, the
gravitational sub-cluster joins the thermal/quantum sub-cluster (Landauer,
thermal de Broglie, decoherence, Planckian resistivity, Kibble–Zurek).
**Eleven speculative/highly-speculative bridges hang off the established
core through these two quantities** — which is exactly the set the
priority command flags as most decidable.

### ● Cosmological-constant cluster — 3 edges

`be-13, be-20, be-31` (all speculative). Linked by
`cosmological-constant-curvature` and `ricci-scalar`: the Einstein-trace
relation, the vacuum-energy density ρ_Λ, and the causal-set Ricci scalar
share the curvature scalars.

### ● Friedmann / Hubble cluster — 2 edges

`be-19, be-54` (both speculative). Linked by `mass-density` and
`hubble-rate-squared`: two routes to H² (LQC bounce, Randall–Sundrum
brane).

### ○ Isolated — 20 edges

`be-14, be-15, be-17, be-18, be-21, be-22, be-24, be-25, be-26, be-30,
be-36, be-39, be-41, be-43, be-45, be-46, be-47, be-49, be-50, be-53`

These share no quantity with any other edge — holographic entropies,
swampland, anthropic measure, asymptotic safety, primordial
nucleosynthesis, the Yang–Mills β-function, the GW-speed bound, FRET,
Wheeler–Feynman, … Each is a self-contained statement in its own
vocabulary.

## What the map says

1. **The catalog is not a unified web; it is a hub-and-spoke star.** Half
   the edges (16) form one cluster held together by two quantities (`mass`,
   `temperature`); the other half is two small clusters plus 20 isolated
   statements. The "universal" linkage the project's name evokes is, in
   practice, concentrated in a couple of hubs.
2. **The one real bridge between regimes runs through the Hawking
   temperature.** It is the single identification that fuses the
   gravitational and thermodynamic sub-clusters into the anchored core —
   the catalog's most load-bearing link, and itself only
   highly-speculative *as a bridge* (the formula is established; the
   unification claim is not).
3. **Linkage ≠ credibility.** The anchored core mixes established GR with
   highly-speculative bridges; the isolated tail contains both the
   established Yang–Mills β-function and the speculative swampland tower.
   The map describes *structure*, and the prior caveat stands: do not read
   connectivity as truth.

## Reproduce

```bash
upt map
npx vitest run tests/composition/linkage-map.test.ts
```
