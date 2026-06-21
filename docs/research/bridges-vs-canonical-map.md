# Bridges vs. Standard Physics — a Location Map

**Snapshot:** codebase HEAD (post the bridges-vs-canonical follow-up program),
2026-06-20. Point-in-time research finding (re-derive with the commands at the
end; numbers move as the catalog/canonical registry evolve).

## Question

Where do the **bridge equations** sit relative to **standard physics**? Overlay
each catalog bridge onto the canonical (textbook L-layer) graph and ask which
bridges share a quantity with established physics — and through which — versus
which float free of it.

## Method

Each catalog bridge edge (`CATALOG_GRAPH`) is injected into the canonical graph
(`CANONICAL_GRAPH`, now **66 law edges** after the Adam+Eve expansion) as a `user`
junction — the
`upt map --source=canonical --equation "…"` mechanism — and its landing is read
off (`equationLanding`): the connected component it joins and the quantities that
link it there.

**"Location" = shared-quantity adjacency**, the graph's actual linkage rule:
exact and formula-independent. **Sharing a quantity name is necessary, not
sufficient, for a real physical connection** — many adjacencies are dimensional
coincidences, not derivations.

## Result

41 catalog edges over the 66-law canonical graph (post Adam+Eve expansion; the
pre-expansion 29-law numbers were 18 / 23):

| | total | established/law | speculative | highly-spec |
|---|---|---|---|---|
| **Connect** to standard physics | **20** | 4 | 14 | 2 |
| **Isolated** from it | **21** | 4 | 15 | 2 |

The expansion connected two previously-orphaned bridges via newly-added canonical
quantities: **BE-15** (universal emergence) via `time`, and **BE-47** (BBN dark
sector) via `hubble-rate`.

Almost all connections dock at the two observables the canonical graph itself hubs
on — **`mass`** and **`temperature`** — plus a cosmology/Planck tail
(`hubble-rate-squared` → Friedmann, `planck-length`, `planck-mass`,
`semi-major-axis`) and, after this program, `thermal-wavelength` (BE-11 Zurek).

### Two follow-up findings (this program)

**1. A name divergence hid a real link — now fixed.** BE-11 (Zurek) — an
*established* bridge — was isolated only because the catalog names the thermal de
Broglie wavelength `thermal-de-broglie-wavelength` while the canonical law
`CE-thermal-de-broglie` names the same physical quantity `thermal-wavelength`. A
`QUANTITY_IDENTIFICATIONS` alias reconnects it (17 → 18 connected). A dimension
audit confirmed this is the *one* true alias among 106 same-dimension pairs —
same dimension ≠ same quantity (`effective-mass` ≠ `mass`, every dimensionless
coupling shares `[dimensionless]`), so no bulk aliasing.

**2. The isolated *established* bridges are out of scope, not a fillable gap.**
The 4 remaining (`be-21` KSS η/s, `be-53` Yang–Mills β, `be-34` Kibble–Zurek,
`be-11-master` decoherence) are isolated for structural reasons a *dimensional*
L-layer cannot fix:

- **Yang–Mills β** (`be-53`): purely *dimensionless* (gauge-coupling, color/flavor
  numbers, β — all `[1]`). A dimension-centric registry cannot anchor it.
- **KSS η/s** (`be-21`): a single oddly-dimensioned ratio `[T·Θ]` with no
  canonical relative; KSS *is* the relation (no more-fundamental textbook law).
- **Kibble–Zurek** (`be-34`) / **decoherence master** (`be-11-master`): use
  *domain-specific* quantities (`reheating-temperature`, `defect-rest-mass`,
  decoherence rates) that are NOT the generic canonical `temperature`/`mass` —
  aliasing them would be the `effective-mass ≠ mass` mistake.

So the registry was extended with the genuinely-missing *dimensional* textbook
laws instead — starting with **Newton's 2nd `F=ma`, mass–energy `E=mc²`, momentum
`p=mv`** and ultimately the full Adam+Eve expansion to **66 canonical equations**
(`p=mv` also anchors de Broglie's `p`). These complete the L-layer's mechanics
coverage but do **not** change bridge attachment — bridges
name their quantities specifically.

### Isolated, and *how* isolated

Of the 21 canonical-isolated bridges, only **4** connect to *other bridges*
within the catalog — **17 are truly orphaned** (singletons even in
`CATALOG_GRAPH`). The speculative frontier is not just detached from textbooks;
most of it is detached from everything.

### Dimension-adjacency review surface (`dimensionAdjacency`)

For quantities isolated *by name*, the map now surfaces same-dimension canonical
candidates — **56** of them (dimensionless excluded). It is a **review surface,
not an auto-merge**: the overwhelming majority are *deliberate distinctions*, e.g.

| catalog quantity | dim | candidates | true alias? |
|---|---|---|---|
| `thermal-de-broglie-wavelength` | [length] | …, `thermal-wavelength` | **YES — aliased** |
| `effective-mass` | [mass] | `mass`, `planck-mass`, `secondary-mass` | no (deliberately distinct) |
| `mond-force` | [force] | `force`, `gravitational-force`, … | no (MOND-modified, not Newtonian) |
| `reheating-temperature` | [temperature] | `temperature`, `hawking-temperature` | no (a specific cosmological T) |
| `defect-rest-mass` | [mass] | `mass`, `secondary-mass` | no (a specific defect mass) |

The surface's job is to make name-divergent *true* aliases (like the thermal one)
findable for human adjudication — not to merge by dimension.

## Reading

The catalog is **~49% attached / ~51% adrift** of textbook physics (20 of 41,
after the L-layer grew 29→66), the attachment funnels through `mass`/`temperature`,
and most of the adrift portion (17 of 21) is orphaned even from other bridges. The established bridges that stay
isolated do so legitimately — they are dimensionless or domain-specific physics
outside a dimension-centric L-layer, not gaps to be filled. The honest levers the
map exposed were a single hidden name-alias (fixed) and the registry's missing
*foundational mechanics* (added) — not a way to manufacture connectivity the
physics doesn't have.

## Reproduce

```bash
node bin/upt.mjs map --source=canonical --equation "temperature = mass"   # BE-42 shape
# the full sweep + the dimension-adjacency surface use the public buildVizModel +
# equationLanding + dimensionAdjacency over CATALOG_GRAPH / CANONICAL_GRAPH.
```
