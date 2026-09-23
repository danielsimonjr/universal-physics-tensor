# Atlas invalid-bridge benchmark — fixtures (Phase 5)

| Directory | Holds | Who writes it |
|---|---|---|
| `public/items.json` | The FROZEN items, WITHOUT the answer | `scripts/atlas-benchmark-assemble.mjs`, from model output |
| `scorer/labels.json` | The expected outcome per frozen item | The same script; no `src/` file may read it |
| `contested/items.json` | Items the raters disputed, never scored | The same script, with `authorship: 'contested-draft'` |
| `provenance/` | Every model call: exact prompt, reply, cost and the launch's isolation record; kappa and the freeze in `assembly.json` | `scripts/atlas-benchmark-models.mjs` |

**The items are MODEL-authored and MODEL-rated** (pre-registration Amendment 2, 2026-09-22).
An atlas-blind `claude-fable-5-1` instance wrote them. A separate instance encoded them without
seeing the answers. Two further instances, with no shared context, rated them. No human authored
or rated an item, and the kappa in `provenance/assembly.json` is agreement between two model
instances.

Do not edit these files by hand. To rebuild: `node scripts/atlas-benchmark-models.mjs all`, then
`bun run build && node scripts/atlas-benchmark-assemble.mjs`. A rebuild calls the model again and
produces a DIFFERENT set, which is an amendment to the pre-registration.

The answer (`kind`, `failureKind`) lives ONLY in `scorer/labels.json`. The loader refuses a public
or contested item that carries either field.
