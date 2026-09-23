# MEMORY.md — stateless facts (nothing here carries an "as of")

The law is `AGENTS.md`. Anything with a date, a version, or a count that will change belongs in
`NOTES.md` — **not here**. This file is what stays true regardless of when you
read it.

## Names and shapes

- Repo `universal-physics-tensor`, branch `master`.
- The atlas public surface is a **namespace facade** — `export * as atlas from './atlas/public.js'`
  — added *alongside* the existing named exports in `src/index.ts`, changing none of them.
- `src/atlas/public.ts` is the **single list** of public atlas names. The count is **derived from
  that file by the test and stated nowhere else**, so a list and a number cannot disagree.
- Witness kinds are **numeric** and **CAS**. They are counted separately.
- Tiering intent: promote only what is stable, defer what is in flux, keep benchmark and
  prediction internals internal.

## Invariants that must keep holding

- The public surface is **closed under type references**: no public declaration may reference a
  non-public type. A private type reachable through a public one is a leak whatever the tag says.
- The frozen-set hash is **bound by a test** to the LAST hash recorded in the pre-registration.
  When the set changes, that test **must go RED** until an amendment records the new hash. If it
  stays green, the change did not take.
- A **numeric** control asserts the wrong hypothesis is **refuted**. A **CAS** control can only
  assert **not checked** — a weaker guarantee, because the simplifier failing on everything
  would also produce it. Each control therefore carries a meta-check that the *true* claim
  resolves, and the two result kinds are never merged into one count.

## Roles and where things live

- Out-of-tree Lean proofs belong to the **`PhysJS`** repo, outside this one.
- Releases, npm publish and ADR-level calls are **not this session's** — escalate to Mothership.
- Peer and fleet context lives on the peer's machine. Ask rather than assume; two honest
  observers disagreeing usually means *different objects*, not a broken instrument.
