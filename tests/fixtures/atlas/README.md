# `tests/fixtures/atlas` — atlas witness fixtures

Fixtures for the Phase 0 atlas witness tests (`tests/atlas/`). Design note:
`docs/planning/Atlas-Phase-0-Design.md`.

## What belongs here

- Reference trajectories and scoring data for the atlas bridges.
- Model parameter sets used by more than one witness test.

Integration code belongs in `tests/atlas/`, not here. The shared fixed-step RK4
helper is `tests/atlas/_ode.ts`.

## Hidden truth — nothing under `src/` may read this tree

The scoring fixtures are the ground truth that the atlas bridges are measured
against. If a module under `src/` could read them, the code under test would be
able to read its own answer key, and a witness test would prove nothing.

`tests/atlas/import-graph.test.ts` enforces this: it fails when any `.ts` file
under `src/` mentions both `fixtures/atlas` and `scorer`. It mirrors the
equivalent probe guard, `tests/composition/probe/import-graph.test.ts`.

The guard is a text check, not a resolver. It catches the realistic mistake — a
`src/` module importing a scorer path — and does not catch a path assembled at
runtime from fragments. Do not treat a green run as proof that no such route
exists.

## JSON records

`data/schemas/atlas-record.v0.json` documents the emitted atlas-record shape.
It is documentation only: this tree has no JSON-Schema validator, and adding a
dependency to get one is out of scope. An external validator can use it.
