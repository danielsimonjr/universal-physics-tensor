# Bridge-Gradient Tutorial (v0.9 Proposal 8)

<!-- repo-map:no-verification -->

> **No `## Verification` block, deliberately.** This document is a tutorial. It teaches an API through worked examples and asserts nothing about the size or shape of the repository.
> The drift gate treats a missing Verification section as a failure, so the opt-out is
> stated here explicitly rather than left to be inferred from its absence.

> Phase 4 deliverable of v0.9 Proposal 8 (Bridge Parameter
> Differentiation via `mathts-autograd`). Five-minute walkthrough
> for differentiating UPT catalog bridges with respect to their
> input parameters.

## What it does

UPT's 44-bridge catalog contains many closed-form scalar formulas
(Hawking temperature ∝ 1/M, Shapiro delay ∝ log(R_far/R_near), …).
`bridgeGradient` computes the gradient of any registered bridge
spec with respect to a chosen subset of its inputs, using
reverse-mode automatic differentiation via `MathTSEngine` (which
in turn uses the optional `@danielsimonjr/mathts-autograd` peer).

Engine-agnostic surface, single error path: missing AD support →
`EngineCapabilityError`.

## Five-minute walkthrough

```typescript
import {
  bridgeGradient,
  gradientToNamed,
  BE42_HAWKING_DIFF,
} from '@danielsimonjr/universal-physics-tensor';
import { MathTSEngine } from '@danielsimonjr/universal-physics-tensor/numerical/mathts-engine';

const engine = new MathTSEngine();
const SUN_KG = 1.989e30;

// Forward evaluation (no AD needed):
const T_sun = BE42_HAWKING_DIFF.evaluate({ M_kg: SUN_KG });
// → ~6e-8 K

// Reverse-mode gradient:
const { value, gradient } = await bridgeGradient(
  BE42_HAWKING_DIFF,
  engine,
  { M_kg: SUN_KG },
);
// value === T_sun
// gradient: rank-1 EngineTensor of shape [1], with d(T_H)/d(M_kg)

const named = gradientToNamed(BE42_HAWKING_DIFF, gradient, engine);
// → { M_kg: -3e-38 }   (dT/dM is negative — bigger BH = colder)
```

## Shipped bridge specs (v0.9 closed-form subset)

| Bridge spec | Differentiable params | Output |
|---|---|---|
| `BE11_DECOHERENCE_DIFF` | `gamma0_per_s`, `lambda`, `lambda0` | Decoherence rate (s⁻¹) |
| `BE37_SHAPIRO_DIFF` | `M_kg`, `R_far_m`, `R_near_m` | Time delay (s) |
| `BE42_HAWKING_DIFF` | `M_kg` | Temperature (K) |
| `BE52_PERIHELION_DIFF` | `M_kg`, `a_m`, `e` (with `T_yr` in defaults) | Perihelion advance (rad/orbit) |

All four spec exports + the aggregate `DIFFERENTIABLE_BRIDGE_SPECS`
array are `@public`.

## Honest limitations

- **`Float64ReferenceEngine` cannot AD-trace bridge evaluators.**
  Float64's dual-number AD only traces engine-traced operations
  (`engine.add`, `engine.mul`, ...). Bridge evaluators use plain
  JS `Math.*` calls, which strip the dual-number tracking. Pass
  a `MathTSEngine` instance instead.

- **Optional peer required.** `mathts-autograd` is in
  `optionalDependencies`. Run
  `npm install --include=optional` to install. Without it,
  `bridgeGradient` throws `EngineCapabilityError`.

- **Scalar output only.** Bridges returning structs (e.g.,
  `PerihelionPrecessionResult` with 6 fields) need a selector
  function that extracts a single scalar (the BE52 spec extracts
  `dphi_rad_per_orbit`). Multi-output AD is out of v0.9 scope.

- **Non-smooth branches not supported.** Bridges with `Math.abs`,
  `Math.max`, conditional branches based on input value, etc.,
  may produce gradients that are technically defined as
  subgradients. v0.9 ships no smoothing layer.

## Adding a new differentiable bridge

```typescript
import type { BridgeDiffSpec } from '@danielsimonjr/universal-physics-tensor';
import { evaluateMyBridge, type MyInputs } from './my-bridge.js';

export const MY_BRIDGE_DIFF: BridgeDiffSpec<MyInputs> = {
  bridgeId: 'BE-NN',
  name: 'My Bridge',
  paramNames: ['p1', 'p2'] as const,
  defaults: { /* non-differentiable inputs go here */ },
  evaluate: evaluateMyBridge,
};
```

Then call `bridgeGradient(MY_BRIDGE_DIFF, engine, { p1, p2 })`.
No registration step required — specs are passed by reference.

## See also

- `docs/architecture/v0.7-p8-bridge-gradient-audit.md` — Phase 3
  audit + engine-capability matrix + acceptance criteria status.
- `docs/planning/v0.7-Proposal-8-Design.md` — full design with
  Adam+Eve review notes.
