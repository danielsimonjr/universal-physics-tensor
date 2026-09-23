# Bridge-Gradient Tutorial

<!-- repo-map:no-verification -->

> **No `## Verification` block, deliberately.** This document is a tutorial. It teaches an API through worked examples and asserts nothing about the size or shape of the repository.
> The drift gate treats a missing Verification section as a failure, so the opt-out is
> stated here explicitly rather than left to be inferred from its absence.

> Five-minute walkthrough for differentiating UPT catalog bridges
> with respect to their input parameters.

## What it does

UPT's 55-bridge catalog contains many closed-form scalar formulas
(Hawking temperature ∝ 1/M, Shapiro delay ∝ log(R_far/R_near), …).
Four functions compute the gradient of a bridge with respect to
its inputs:

- `bridgeGradientNumerical(spec, params, opts?)` — central finite
  differences over a registered bridge spec. No engine and no
  optional peer. This is the supported path for the catalog's
  plain-JS evaluators.
- `bridgeGradientAST(rhs, varName, bindings)` and
  `bridgeGradientASTById(bridgeId, varName, bindings)` — exact
  reverse-mode AD over a bridge's symbolic RHS AST, through the
  optional `@danielsimonjr/mathts-autograd` peer (with `@danielsimonjr/mathts-tensor`).
- `bridgeGradient(spec, engine, params)` — engine AD. It works only
  for functions written in engine ops. The catalog evaluators use
  plain JS `Math.*`, so `bridgeGradient` cannot trace them: with a
  real engine it throws `NumericalBackendError`, and with an engine
  that lacks AD methods it throws `EngineCapabilityError`.

## Five-minute walkthrough

```typescript
import {
  bridgeGradientNumerical,
  BE42_HAWKING_DIFF,
} from 'universal-physics-tensor';

const SUN_KG = 1.989e30;

// Forward evaluation:
const T_sun = BE42_HAWKING_DIFF.evaluate({ M_kg: SUN_KG });
// → ~6.17e-8 K

// Gradient by central finite differences:
const { value, gradient } = bridgeGradientNumerical(
  BE42_HAWKING_DIFF,
  { M_kg: SUN_KG },
);
// value === T_sun
// gradient → { M_kg: -3.10e-38 }   (dT/dM is negative — bigger BH = colder)
```

## Shipped bridge specs (closed-form subset)

| Bridge spec | Differentiable params | Output |
|---|---|---|
| `BE11_DECOHERENCE_DIFF` | `gamma0_per_s`, `lambda`, `lambda0` | Decoherence rate (s⁻¹) |
| `BE37_SHAPIRO_DIFF` | `M_kg`, `R_far_m`, `R_near_m` | Time delay (s) |
| `BE42_HAWKING_DIFF` | `M_kg` | Temperature (K) |
| `BE52_PERIHELION_DIFF` | `M_kg`, `a_m`, `e` (with `T_yr` in defaults) | Perihelion advance (rad/orbit) |

All four spec exports + the aggregate `DIFFERENTIABLE_BRIDGE_SPECS`
array are `@public`.

## Honest limitations

- **Engine AD cannot trace the bridge evaluators.** Engine AD traces
  only engine operations (`engine.add`, `engine.mul`, ...). The
  bridge evaluators use plain JS `Math.*` calls, so `bridgeGradient`
  fails on them with either engine. Use `bridgeGradientNumerical`,
  or `bridgeGradientAST` for an exact gradient.

- **Optional peer for exact AD.** `mathts-autograd` is in
  `optionalDependencies`. Run `npm install --include=optional` to
  install it. `bridgeGradientAST` needs it, together with
  `mathts-tensor`; `bridgeGradientNumerical` does not.

- **Scalar output only.** Bridges returning structs (e.g.,
  `PerihelionPrecessionResult` with 6 fields) need a selector
  function that extracts a single scalar (the BE52 spec extracts
  `dphi_rad_per_orbit`). Multi-output gradients are not supported.

- **Non-smooth branches not supported.** Bridges with `Math.abs`,
  `Math.max`, conditional branches based on input value, etc.,
  may produce gradients that are technically defined as
  subgradients. There is no smoothing layer.

## Adding a new differentiable bridge

```typescript
import type { BridgeDiffSpec } from 'universal-physics-tensor';
import { evaluateMyBridge, type MyInputs } from './my-bridge.js';

export const MY_BRIDGE_DIFF: BridgeDiffSpec<MyInputs> = {
  bridgeId: 'BE-NN',
  name: 'My Bridge',
  paramNames: ['p1', 'p2'] as const,
  defaults: { /* non-differentiable inputs go here */ },
  evaluate: evaluateMyBridge,
};
```

Then call `bridgeGradientNumerical(MY_BRIDGE_DIFF, { p1, p2 })`.
No registration step required — specs are passed by reference.

## See also

- `docs/architecture/archive/v0.7-p8-bridge-gradient-audit.md` —
  the engine-capability audit (a dated record).
- `docs/planning/v0.7-Proposal-8-Design.md` — full design with
  Adam+Eve review notes.
