# Universal Physics Tensor Framework - Implementation Plan

## 1. Scope

This document describes the **implementation shape** of UPT during the formalization phase: directory layout, technology choices, test strategy, and quality gates. It is intentionally narrow. Production deployment, multi-environment configuration, security architecture, monitoring, and tech-stack alternatives are deferred to [`Future-Production-Hardening.md`](./Future-Production-Hardening.md).

Strategic context lives in [`Development-Plan.md`](./Development-Plan.md). Requirements live in [`System-Requirements.md`](./System-Requirements.md).

---

## 2. Technology Stack

Single concrete stack; no alternatives evaluated at this stage.

- **Language:** TypeScript 5.x (strict mode)
- **Runtime:** Node.js >= 18 (per `package.json` `engines`)
- **Test runner:** Vitest
- **Lint / format:** ESLint, Prettier
- **Module system:** ESM (`"type": "module"` in `package.json`)
- **Build:** `tsc` direct compile to `dist/`

If a future bottleneck or workload justifies a different stack (WebAssembly, Rust, Python), that decision belongs to a future planning iteration — see `Future-Production-Hardening.md` § "Tech-Stack Alternatives" for the historical option list.

---

## 3. Directory Layout

### 3.1 Current (v0.1.0)

```
src/
├── core/
│   ├── tensor.ts        # UniversalTensor — rank-3 sparse Map<key,value>
│   └── types.ts         # Dimension, ConstituentSpace, IndexTuple
└── index.ts             # Public exports
tests/
└── tensor.test.ts       # 37 cases, all green
docs/
├── planning/            # this directory
│   ├── Development-Plan.md
│   ├── Implementation-Plan.md
│   ├── System-Requirements.md
│   └── Future-Production-Hardening.md
└── specification/       # Parts I-VI
package.json
tsconfig.json
```

### 3.2 Planned (Phase A — formalization)

```
src/
├── core/                # existing
├── bridges/             # NEW: bridge equation catalog + implementations
│   ├── index.ts         # typed metadata array for all 40 equations
│   ├── types.ts         # BridgeEquationMetadata interface, status enum
│   └── ryu-takayanagi.ts  # first end-to-end implementation (BE-14)
├── dimensional/         # NEW: dimensional-analysis tool
│   ├── algebra.ts       # Dimension type with mul/div/pow
│   ├── check.ts         # check(lhs, rhs) -> { ok, lhs_dim, rhs_dim }
│   └── index.ts
├── validation/          # NEW: physics validation cases
│   └── ryu-takayanagi.test.ts
└── index.ts
tests/
└── tensor.test.ts       # existing
```

No `infrastructure/`, `compute-modules/`, `web-app/`, `monitoring/`, `config/`, or `adapters/` directories at this stage. Those are hypotheticals from the original plan and now live in `Future-Production-Hardening.md`.

---

## 4. Test Strategy

### 4.1 Test Categories (current)

| Category | Status | Notes |
|----------|--------|-------|
| Unit | **Active** (37/37 passing) | `tests/tensor.test.ts`. Vitest. |
| Integration | **Forward-looking** | Will be added once `src/bridges/` and `src/dimensional/` interact. |
| Physics validation | **Forward-looking** | First case: Ryu-Takayanagi against analytic interval-CFT result. |
| End-to-end | **Out of scope** | No UI, no API server, no e2e to run. |
| Performance benchmarks | **Out of scope** | No production-load profile to benchmark against. |

When adding integration or physics tests, place them under `tests/` mirroring `src/` paths, named `*.test.ts`.

### 4.2 Test Scripts

Already configured in `package.json`:

```json
"scripts": {
  "build": "tsc",
  "test": "vitest run",
  "test:watch": "vitest",
  "smoke": "node test-example.js"
}
```

No `test:e2e`, `test:performance`, or `test:physics` separation yet — when physics validation cases land, decide whether to split based on runtime. For now a single `npm test` covers everything.

### 4.3 Quality Gates

**Pre-commit (manual at this stage; no hooks installed):**

- `npm run build` (typecheck + emit, both must succeed)
- `npx vitest run` (all tests green)

**Pre-merge (manual on `master`):**

- Same as pre-commit.
- Coverage is not currently measured; add `vitest --coverage` only when there is a concrete reason to (target threshold 80% for `src/bridges/` once that directory has > 200 lines).

CI beyond typecheck/build/test is parked in `Future-Production-Hardening.md` § "CI/CD Beyond Basic".

---

## 5. Coding Conventions

- TypeScript strict mode is on (verify with `tsconfig.json`).
- Public exports flow through `src/index.ts`.
- New modules export their own types from a sibling `types.ts` file (matches `src/core/` pattern).
- Bridge equation files are named by `equation_id` slug: `ryu-takayanagi.ts`, not `bridge_14.ts` — the slug carries meaning, the number does not.
- Dimensional checks accompany every bridge implementation; a bridge without a passing dimensional test is incomplete.

---

## 6. Versioning

- Library is at `0.1.0`. Pre-1.0 — every minor bump is allowed to be breaking.
- A bridge equation's metadata schema may change before it stabilizes; that is acceptable while < 1.0.
- 1.0 is gated on "all 40 bridge equations have valid metadata; at least 10 have working implementations; dimensional tool catches all known-issue cases" — this is approximate, not a contract.

---

## 7. Documentation

Code documentation lives in three places:

1. **TSDoc comments** on public exports — required for anything in `src/index.ts`.
2. **Spec cross-references** — every implemented bridge has a comment linking to its Part-I/II section.
3. **Planning docs** — this file, `Development-Plan.md`, `System-Requirements.md`, `Future-Production-Hardening.md`. Updated when the shape of the work changes, not on every commit.

`README.md` is the user-facing entry point. It should track what works in `src/`, not what is planned.

---

## 8. What Is Explicitly Not Here

The following sections existed in the previous version of this document and have been moved to `Future-Production-Hardening.md`:

- Multi-environment configuration (`config/development.yml`, etc.)
- Cloud-native deployment (`Dockerfile.prod`, `docker-compose.yml`, Kubernetes manifests)
- On-premises installation script
- Authentication / authorization (JWT, RBAC, rate limiting)
- Monitoring / observability (Grafana, Prometheus, ELK)
- Tech-stack alternatives (Python, Go, Rust, Vue, Angular, Svelte, MongoDB, Neo4j, InfluxDB)
- Blue-green deployment, database migrations
- WASM compute core with Emscripten
- Web frontend / visualization (separate future repo)
- Worker pool with seven specialized worker classes
- REST / GraphQL API server

If any of those become relevant, lift the section back from `Future-Production-Hardening.md` with concrete acceptance criteria.
