# Test Coverage Analysis

**Generated**: 2026-05-17

## Summary

| Metric | Count |
|--------|-------|
| Total Source Files | 74 |
| Total Test Files | 124 |
| Source Files with Tests | 71 |
| Source Files without Tests | 3 |
| Coverage | 95.9% |

---

## Source Files Without Test Coverage

The following 3 source files are not directly imported by any test file:

### dimensional/

- `src/dimensional/connection-validators.ts` → Expected test: `tests/unit/dimensional/connection-validators.test.ts`
- `src/dimensional/fresh-label.ts` → Expected test: `tests/unit/dimensional/fresh-label.test.ts`

### numerical/

- `src/numerical/metric-inverse.ts` → Expected test: `tests/unit/numerical/metric-inverse.test.ts`

---

## Source Files With Test Coverage

| Source File | Test Files |
|-------------|------------|
| `equations/be-11-decoherence-master.ts` | `be-11-fix.test.ts`, `dimensional-signature-catalog.test.ts` |
| `equations/be-12-coherence-length.ts` | `be-12-encoding.test.ts`, `dimensional-signature-catalog.test.ts` |
| `equations/be-13-einstein-trace.ts` | `be-13-encoding.test.ts`, `dimensional-signature-catalog.test.ts` |
| `equations/be-14-ryu-takayanagi.ts` | `be-14-ryu-takayanagi.test.ts`, `dimensional-signature-catalog.test.ts` |
| `equations/be-15-emergence.ts` | `be-15-encoding.test.ts`, `dimensional-signature-catalog.test.ts` |
| `equations/be-16-landauer.ts` | `be-16-landauer-encoding.test.ts`, `dimensional-signature-catalog.test.ts` |
| `equations/be-17-einstein-cartan.ts` | `be-17-encoding.test.ts`, `be-17-structural.test.ts`, `dimensional-signature-catalog.test.ts`, `bridge-check.test.ts` |
| `equations/be-18-higgs-mass.ts` | `be-18-encoding.test.ts`, `dimensional-signature-catalog.test.ts` |
| `equations/be-19-quantum-bounce.ts` | `be-19-encoding.test.ts`, `dimensional-signature-catalog.test.ts`, `bridge-check.test.ts` |
| `equations/be-20-vacuum-energy.ts` | `be-20-encoding.test.ts`, `dimensional-signature-catalog.test.ts` |
| `equations/be-21-kss-bound.ts` | `be-21-encoding.test.ts`, `dimensional-signature-catalog.test.ts` |
| `equations/be-22-topological-entanglement.ts` | `be-22-encoding.test.ts`, `dimensional-signature-catalog.test.ts`, `bridge-check.test.ts` |
| `equations/be-23-syk-planckian.ts` | `be-23-encoding.test.ts`, `dimensional-signature-catalog.test.ts` |
| `equations/be-24-foerster-fret.ts` | `be-24-encoding.test.ts`, `dimensional-signature-catalog.test.ts` |
| `equations/be-25-iit-phi.ts` | `be-25-iit-encoding.test.ts`, `dimensional-signature-catalog.test.ts` |
| `equations/be-25-orch-or.ts` | `be-25-encoding.test.ts` |
| `equations/be-26-dna-tunneling.ts` | `be-26-encoding.test.ts`, `dimensional-signature-catalog.test.ts`, `bridge-check.test.ts` |
| `equations/be-27-effective-temperature.ts` | `be-27-encoding.test.ts`, `dimensional-signature-catalog.test.ts` |
| `equations/be-28-onsager-entropy-production.ts` | `be-28-onsager-encoding.test.ts`, `dimensional-signature-catalog.test.ts` |
| `equations/be-29-jarzynski.ts` | `be-29-encoding.test.ts`, `dimensional-signature-catalog.test.ts` |
| `equations/be-30-flm-first-law.ts` | `be-30-encoding.test.ts`, `dimensional-signature-catalog.test.ts` |
| `equations/be-31-causal-set-bd.ts` | `be-31-encoding.test.ts`, `dimensional-signature-catalog.test.ts` |
| `equations/be-32-quantum-reference-frame.ts` | `be-32-encoding.test.ts`, `dimensional-signature-catalog.test.ts` |
| `equations/be-33-hertz-millis.ts` | `be-33-encoding.test.ts`, `dimensional-signature-catalog.test.ts` |
| `equations/be-34-kibble-zurek.ts` | `be-34-encoding.test.ts`, `dimensional-signature-catalog.test.ts`, `bridge-check.test.ts` |
| `equations/be-35-conformal-bootstrap.ts` | `be-35-encoding.test.ts`, `dimensional-signature-catalog.test.ts` |
| `equations/be-36-gw-speed-bound.ts` | `be-36-encoding.test.ts`, `dimensional-signature-catalog.test.ts` |
| `equations/be-37-shapiro-delay.ts` | `be-37-numerical-eikonal.test.ts`, `be-37-shapiro-eikonal-structural.test.ts`, `be-37-shapiro-encoding.test.ts`, `dimensional-signature-catalog.test.ts`, `covariant-derivative-preview.test.ts` |
| `equations/be-38-mond.ts` | `be-38-encoding.test.ts`, `dimensional-signature-catalog.test.ts` |
| `equations/be-39-asymptotic-safety.ts` | `be-39-encoding.test.ts`, `dimensional-signature-catalog.test.ts` |
| `equations/be-40-composite-higgs.ts` | `be-40-encoding.test.ts`, `dimensional-signature-catalog.test.ts` |
| `equations/be-41-swampland.ts` | `be-41-encoding.test.ts`, `dimensional-signature-catalog.test.ts`, `bridge-check.test.ts` |
| `equations/be-42-hawking-temperature.ts` | `be-42-encoding.test.ts`, `dimensional-signature-catalog.test.ts` |
| `equations/be-43-er-epr.ts` | `be-43-encoding.test.ts`, `dimensional-signature-catalog.test.ts` |
| `equations/be-44-soft-hair.ts` | `be-44-encoding.test.ts`, `dimensional-signature-catalog.test.ts` |
| `equations/be-45-tcc.ts` | `be-45-encoding.test.ts`, `dimensional-signature-catalog.test.ts` |
| `equations/be-46-multiverse-measure.ts` | `be-46-encoding.test.ts`, `dimensional-signature-catalog.test.ts` |
| `equations/be-47-bbn-dark-sector.ts` | `be-47-encoding.test.ts`, `dimensional-signature-catalog.test.ts`, `bridge-check.test.ts` |
| `equations/be-48-grw-localization.ts` | `be-48-encoding.test.ts`, `dimensional-signature-catalog.test.ts` |
| `equations/be-49-quantum-darwinism.ts` | `be-49-encoding.test.ts`, `dimensional-signature-catalog.test.ts` |
| `equations/be-50-wheeler-feynman.ts` | `be-50-encoding.test.ts`, `dimensional-signature-catalog.test.ts` |
| `bridges/gravitational-lensing.ts` | `public-surface.test.ts`, `be-11-fix.test.ts`, `be-12-encoding.test.ts`, `be-12-reformulation.test.ts`, `be-13-encoding.test.ts`, `be-13-reformulation.test.ts`, `be-14-ryu-takayanagi.test.ts`, `be-15-encoding.test.ts`, `be-15-reformulation.test.ts`, `be-16-landauer-encoding.test.ts`, `be-17-encoding.test.ts`, `be-17-reformulation.test.ts`, `be-18-encoding.test.ts`, `be-18-fix.test.ts`, `be-19-encoding.test.ts`, `be-20-encoding.test.ts`, `be-21-encoding.test.ts`, `be-22-encoding.test.ts`, `be-23-encoding.test.ts`, `be-23-reformulation.test.ts`, `be-24-encoding.test.ts`, `be-24-reformulation.test.ts`, `be-25-encoding.test.ts`, `be-25-iit-encoding.test.ts`, `be-25-reformulation.test.ts`, `be-26-encoding.test.ts`, `be-27-encoding.test.ts`, `be-28-onsager-encoding.test.ts`, `be-29-encoding.test.ts`, `be-29-fix.test.ts`, `be-30-encoding.test.ts`, `be-30-reformulation.test.ts`, `be-31-encoding.test.ts`, `be-31-reformulation.test.ts`, `be-32-encoding.test.ts`, `be-33-encoding.test.ts`, `be-33-reformulation.test.ts`, `be-34-encoding.test.ts`, `be-35-encoding.test.ts`, `be-36-encoding.test.ts`, `be-36-reformulation.test.ts`, `be-37-r3-disposition.test.ts`, `be-37-shapiro-encoding.test.ts`, `be-38-encoding.test.ts`, `be-38-reformulation.test.ts`, `be-39-encoding.test.ts`, `be-40-encoding.test.ts`, `be-41-encoding.test.ts`, `be-42-encoding.test.ts`, `be-43-encoding.test.ts`, `be-43-reformulation.test.ts`, `be-44-encoding.test.ts`, `be-45-encoding.test.ts`, `be-46-encoding.test.ts`, `be-47-encoding.test.ts`, `be-47-fix.test.ts`, `be-48-encoding.test.ts`, `be-48-fix.test.ts`, `be-49-encoding.test.ts`, `be-50-encoding.test.ts`, `be-50-reformulation.test.ts`, `dimensional-signature-catalog.test.ts`, `gravitational-lensing.test.ts`, `orphan-dimensional-signature.test.ts`, `public-api-stability.test.ts`, `spec-vs-index.test.ts`, `bridges-index.test.ts`, `tensor.test.ts` |
| `bridges/index.ts` | `public-surface.test.ts`, `be-11-fix.test.ts`, `be-12-encoding.test.ts`, `be-12-reformulation.test.ts`, `be-13-encoding.test.ts`, `be-13-reformulation.test.ts`, `be-14-ryu-takayanagi.test.ts`, `be-15-encoding.test.ts`, `be-15-reformulation.test.ts`, `be-16-landauer-encoding.test.ts`, `be-17-encoding.test.ts`, `be-17-reformulation.test.ts`, `be-18-encoding.test.ts`, `be-18-fix.test.ts`, `be-19-encoding.test.ts`, `be-20-encoding.test.ts`, `be-21-encoding.test.ts`, `be-22-encoding.test.ts`, `be-23-encoding.test.ts`, `be-23-reformulation.test.ts`, `be-24-encoding.test.ts`, `be-24-reformulation.test.ts`, `be-25-encoding.test.ts`, `be-25-iit-encoding.test.ts`, `be-25-reformulation.test.ts`, `be-26-encoding.test.ts`, `be-27-encoding.test.ts`, `be-28-onsager-encoding.test.ts`, `be-29-encoding.test.ts`, `be-29-fix.test.ts`, `be-30-encoding.test.ts`, `be-30-reformulation.test.ts`, `be-31-encoding.test.ts`, `be-31-reformulation.test.ts`, `be-32-encoding.test.ts`, `be-33-encoding.test.ts`, `be-33-reformulation.test.ts`, `be-34-encoding.test.ts`, `be-35-encoding.test.ts`, `be-36-encoding.test.ts`, `be-36-reformulation.test.ts`, `be-37-r3-disposition.test.ts`, `be-37-shapiro-encoding.test.ts`, `be-38-encoding.test.ts`, `be-38-reformulation.test.ts`, `be-39-encoding.test.ts`, `be-40-encoding.test.ts`, `be-41-encoding.test.ts`, `be-42-encoding.test.ts`, `be-43-encoding.test.ts`, `be-43-reformulation.test.ts`, `be-44-encoding.test.ts`, `be-45-encoding.test.ts`, `be-46-encoding.test.ts`, `be-47-encoding.test.ts`, `be-47-fix.test.ts`, `be-48-encoding.test.ts`, `be-48-fix.test.ts`, `be-49-encoding.test.ts`, `be-50-encoding.test.ts`, `be-50-reformulation.test.ts`, `dimensional-signature-catalog.test.ts`, `orphan-dimensional-signature.test.ts`, `public-api-stability.test.ts`, `spec-vs-index.test.ts`, `bridges-index.test.ts`, `tensor.test.ts` |
| `bridges/perihelion-precession.ts` | `public-surface.test.ts`, `be-11-fix.test.ts`, `be-12-encoding.test.ts`, `be-12-reformulation.test.ts`, `be-13-encoding.test.ts`, `be-13-reformulation.test.ts`, `be-14-ryu-takayanagi.test.ts`, `be-15-encoding.test.ts`, `be-15-reformulation.test.ts`, `be-16-landauer-encoding.test.ts`, `be-17-encoding.test.ts`, `be-17-reformulation.test.ts`, `be-18-encoding.test.ts`, `be-18-fix.test.ts`, `be-19-encoding.test.ts`, `be-20-encoding.test.ts`, `be-21-encoding.test.ts`, `be-22-encoding.test.ts`, `be-23-encoding.test.ts`, `be-23-reformulation.test.ts`, `be-24-encoding.test.ts`, `be-24-reformulation.test.ts`, `be-25-encoding.test.ts`, `be-25-iit-encoding.test.ts`, `be-25-reformulation.test.ts`, `be-26-encoding.test.ts`, `be-27-encoding.test.ts`, `be-28-onsager-encoding.test.ts`, `be-29-encoding.test.ts`, `be-29-fix.test.ts`, `be-30-encoding.test.ts`, `be-30-reformulation.test.ts`, `be-31-encoding.test.ts`, `be-31-reformulation.test.ts`, `be-32-encoding.test.ts`, `be-33-encoding.test.ts`, `be-33-reformulation.test.ts`, `be-34-encoding.test.ts`, `be-35-encoding.test.ts`, `be-36-encoding.test.ts`, `be-36-reformulation.test.ts`, `be-37-r3-disposition.test.ts`, `be-37-shapiro-encoding.test.ts`, `be-38-encoding.test.ts`, `be-38-reformulation.test.ts`, `be-39-encoding.test.ts`, `be-40-encoding.test.ts`, `be-41-encoding.test.ts`, `be-42-encoding.test.ts`, `be-43-encoding.test.ts`, `be-43-reformulation.test.ts`, `be-44-encoding.test.ts`, `be-45-encoding.test.ts`, `be-46-encoding.test.ts`, `be-47-encoding.test.ts`, `be-47-fix.test.ts`, `be-48-encoding.test.ts`, `be-48-fix.test.ts`, `be-49-encoding.test.ts`, `be-50-encoding.test.ts`, `be-50-reformulation.test.ts`, `dimensional-signature-catalog.test.ts`, `orphan-dimensional-signature.test.ts`, `perihelion-precession.test.ts`, `public-api-stability.test.ts`, `spec-vs-index.test.ts`, `bridges-index.test.ts`, `tensor.test.ts` |
| `core/tensor.ts` | `public-surface.test.ts`, `tensor.test.ts` |
| `core/types.ts` | `public-surface.test.ts`, `be-12-encoding.test.ts`, `be-13-encoding.test.ts`, `be-14-ryu-takayanagi.test.ts`, `be-19-encoding.test.ts`, `be-20-encoding.test.ts`, `be-21-encoding.test.ts`, `be-25-encoding.test.ts`, `be-27-encoding.test.ts`, `be-29-encoding.test.ts`, `be-34-encoding.test.ts`, `be-36-encoding.test.ts`, `be-42-encoding.test.ts`, `be-43-encoding.test.ts`, `tensor.test.ts` |
| `dimensional/algebra.ts` | `public-surface.test.ts`, `be-11-fix.test.ts`, `be-12-encoding.test.ts`, `be-13-encoding.test.ts`, `be-14-ryu-takayanagi.test.ts`, `be-15-encoding.test.ts`, `be-16-landauer-encoding.test.ts`, `be-17-encoding.test.ts`, `be-18-encoding.test.ts`, `be-19-encoding.test.ts`, `be-20-encoding.test.ts`, `be-21-encoding.test.ts`, `be-22-encoding.test.ts`, `be-23-encoding.test.ts`, `be-24-encoding.test.ts`, `be-25-encoding.test.ts`, `be-25-iit-encoding.test.ts`, `be-26-encoding.test.ts`, `be-27-encoding.test.ts`, `be-28-onsager-encoding.test.ts`, `be-29-encoding.test.ts`, `be-30-encoding.test.ts`, `be-31-encoding.test.ts`, `be-32-encoding.test.ts`, `be-33-encoding.test.ts`, `be-34-encoding.test.ts`, `be-35-encoding.test.ts`, `be-36-encoding.test.ts`, `be-37-shapiro-encoding.test.ts`, `be-38-encoding.test.ts`, `be-39-encoding.test.ts`, `be-40-encoding.test.ts`, `be-41-encoding.test.ts`, `be-42-encoding.test.ts`, `be-43-encoding.test.ts`, `be-44-encoding.test.ts`, `be-45-encoding.test.ts`, `be-46-encoding.test.ts`, `be-47-encoding.test.ts`, `be-48-encoding.test.ts`, `be-49-encoding.test.ts`, `be-50-encoding.test.ts`, `dimensional-signature-catalog.test.ts`, `algebra.test.ts`, `bridge-check.test.ts`, `tensor-partial-derivative.test.ts`, `tensor.test.ts` |
| `dimensional/bridge-check.ts` | `public-surface.test.ts`, `bridge-check.test.ts`, `tensor.test.ts` |
| `dimensional/connection.ts` | `public-surface.test.ts`, `christoffel-helper.test.ts`, `tensor.test.ts` |
| `dimensional/constants.ts` | `bridge-check.test.ts`, `validator.test.ts` |
| `dimensional/errors.ts` | `public-surface.test.ts`, `covariant-derivative-preview.test.ts`, `duplicate-coord-warning.test.ts`, `error-message-discoverability.test.ts`, `kronecker-delta.test.ts`, `metric-tensor.test.ts`, `metric-validation-errors.test.ts`, `op-tensor-interactions.test.ts`, `raise-lower.test.ts`, `tensor-partial-derivative.test.ts`, `tensor-product.test.ts`, `tensor-symbol.test.ts`, `uptError.test.ts`, `correctness.test.ts`, `covariant-derivative-lowering.test.ts`, `engine-default.test.ts`, `errors.test.ts`, `evaluate.test.ts`, `metric-inverse.test.ts`, `tensor.test.ts` |
| `dimensional/metric-validators.ts` | `derivative-strategy-field.test.ts`, `kronecker-delta.test.ts`, `metric-tensor.test.ts`, `tensor-partial-derivative.test.ts` |
| `dimensional/metric.ts` | `christoffel-helper.test.ts`, `covariant-derivative-node.test.ts`, `covariant-derivative-preview.test.ts`, `derivative-strategy-field.test.ts`, `derivative-strategy-propagation.test.ts`, `duplicate-coord-warning.test.ts`, `metric-ast-serialization.test.ts`, `metric-helpers.test.ts`, `numerical-form-preservation.test.ts`, `raise-lower.test.ts` |
| `dimensional/tensor.ts` | `christoffel-helper.test.ts`, `covariant-derivative-node.test.ts`, `covariant-derivative-preview.test.ts`, `derivative-strategy-propagation.test.ts`, `duplicate-coord-warning.test.ts`, `integral-derivative-tensor.test.ts`, `metric-ast-serialization.test.ts`, `metric-helpers.test.ts`, `numerical-form-field.test.ts`, `numerical-form-preservation.test.ts`, `raise-lower.test.ts`, `tensor-helpers.test.ts`, `tensor-partial-derivative.test.ts`, `tensor-product.test.ts`, `correctness.test.ts`, `evaluate.test.ts`, `lowering-contract.test.ts`, `metric-inverse.test.ts` |
| `dimensional/types.ts` | `public-surface.test.ts`, `be-11-fix.test.ts`, `be-12-encoding.test.ts`, `be-14-ryu-takayanagi.test.ts`, `be-15-encoding.test.ts`, `be-16-landauer-encoding.test.ts`, `be-17-encoding.test.ts`, `be-18-encoding.test.ts`, `be-22-encoding.test.ts`, `be-23-encoding.test.ts`, `be-24-encoding.test.ts`, `be-25-iit-encoding.test.ts`, `be-27-encoding.test.ts`, `be-29-encoding.test.ts`, `be-30-encoding.test.ts`, `be-31-encoding.test.ts`, `be-32-encoding.test.ts`, `be-33-encoding.test.ts`, `be-35-encoding.test.ts`, `be-36-encoding.test.ts`, `be-37-shapiro-eikonal-structural.test.ts`, `be-37-shapiro-encoding.test.ts`, `be-38-encoding.test.ts`, `be-39-encoding.test.ts`, `be-40-encoding.test.ts`, `be-42-encoding.test.ts`, `be-43-encoding.test.ts`, `be-45-encoding.test.ts`, `be-46-encoding.test.ts`, `be-48-encoding.test.ts`, `be-49-encoding.test.ts`, `algebra.test.ts`, `bridge-check.test.ts`, `christoffel-helper.test.ts`, `covariant-derivative-node.test.ts`, `covariant-derivative-preview.test.ts`, `derivative-strategy-field.test.ts`, `derivative-strategy-propagation.test.ts`, `duplicate-coord-warning.test.ts`, `integral-derivative-tensor.test.ts`, `kronecker-delta.test.ts`, `metric-ast-serialization.test.ts`, `metric-helpers.test.ts`, `metric-tensor.test.ts`, `numerical-form-field.test.ts`, `numerical-form-preservation.test.ts`, `raise-lower.test.ts`, `tensor-node-types.test.ts`, `tensor-partial-derivative.test.ts`, `validator.test.ts`, `violation-severity.test.ts`, `correctness.test.ts`, `evaluate.test.ts`, `lowering-contract.test.ts`, `metric-inverse.test.ts`, `tensor.test.ts` |
| `dimensional/validator.ts` | `public-surface.test.ts`, `be-11-fix.test.ts`, `be-12-encoding.test.ts`, `be-13-encoding.test.ts`, `be-14-ryu-takayanagi.test.ts`, `be-15-encoding.test.ts`, `be-16-landauer-encoding.test.ts`, `be-17-encoding.test.ts`, `be-17-structural.test.ts`, `be-18-encoding.test.ts`, `be-19-encoding.test.ts`, `be-20-encoding.test.ts`, `be-21-encoding.test.ts`, `be-22-encoding.test.ts`, `be-23-encoding.test.ts`, `be-24-encoding.test.ts`, `be-25-encoding.test.ts`, `be-25-iit-encoding.test.ts`, `be-26-encoding.test.ts`, `be-27-encoding.test.ts`, `be-28-onsager-encoding.test.ts`, `be-29-encoding.test.ts`, `be-30-encoding.test.ts`, `be-31-encoding.test.ts`, `be-32-encoding.test.ts`, `be-33-encoding.test.ts`, `be-34-encoding.test.ts`, `be-35-encoding.test.ts`, `be-36-encoding.test.ts`, `be-37-shapiro-eikonal-structural.test.ts`, `be-37-shapiro-encoding.test.ts`, `be-38-encoding.test.ts`, `be-39-encoding.test.ts`, `be-40-encoding.test.ts`, `be-41-encoding.test.ts`, `be-42-encoding.test.ts`, `be-43-encoding.test.ts`, `be-44-encoding.test.ts`, `be-45-encoding.test.ts`, `be-46-encoding.test.ts`, `be-47-encoding.test.ts`, `be-48-encoding.test.ts`, `be-49-encoding.test.ts`, `be-50-encoding.test.ts`, `dimensional-signature-catalog.test.ts`, `bridge-check.test.ts`, `christoffel-helper.test.ts`, `covariant-derivative-node.test.ts`, `covariant-derivative-preview.test.ts`, `duplicate-coord-warning.test.ts`, `integral-derivative-tensor.test.ts`, `kronecker-delta.test.ts`, `metric-ast-serialization.test.ts`, `metric-tensor.test.ts`, `numerical-form-preservation.test.ts`, `op-tensor-interactions.test.ts`, `raise-lower.test.ts`, `tensor-ast-serialization.test.ts`, `tensor-helpers.test.ts`, `tensor-node-types.test.ts`, `tensor-partial-derivative.test.ts`, `tensor-product.test.ts`, `tensor-symbol.test.ts`, `validation-result-shape.test.ts`, `validator.test.ts`, `violation-severity.test.ts`, `correctness.test.ts`, `evaluate.test.ts`, `lowering-contract.test.ts`, `metric-inverse.test.ts`, `tensor.test.ts` |
| `src/index.ts` | `public-surface.test.ts`, `tensor.test.ts` |
| `numerical/be37-covariant-eikonal.ts` | `public-surface.test.ts`, `covariant-derivative-preview.test.ts`, `duplicate-coord-warning.test.ts`, `correctness.test.ts`, `covariant-derivative-lowering.test.ts`, `engine-default.test.ts`, `evaluate.test.ts`, `metric-inverse.test.ts`, `tensor.test.ts` |
| `numerical/connection-lowering-helpers.ts` | `connection-lowering-helpers.test.ts` |
| `numerical/engine-registry.ts` | `public-surface.test.ts`, `covariant-derivative-preview.test.ts`, `duplicate-coord-warning.test.ts`, `correctness.test.ts`, `covariant-derivative-lowering.test.ts`, `engine-default.test.ts`, `evaluate.test.ts`, `metric-inverse.test.ts`, `tensor.test.ts` |
| `numerical/errors.ts` | `public-surface.test.ts`, `covariant-derivative-preview.test.ts`, `duplicate-coord-warning.test.ts`, `correctness.test.ts`, `covariant-derivative-lowering.test.ts`, `engine-default.test.ts`, `errors.test.ts`, `evaluate.test.ts`, `metric-inverse.test.ts`, `tensor.test.ts` |
| `numerical/float64-engine.ts` | `public-surface.test.ts`, `covariant-derivative-preview.test.ts`, `duplicate-coord-warning.test.ts`, `correctness.test.ts`, `covariant-derivative-lowering.test.ts`, `einsum-properties.test.ts`, `engine-capability.test.ts`, `engine-conformance.float64.test.ts`, `engine-conformance.test.ts`, `engine-default.test.ts`, `evaluate.test.ts`, `float64-autograd.test.ts`, `lowering-contract.test.ts`, `metric-inverse.test.ts`, `tensor.test.ts` |
| `numerical/geodesic-integrator.ts` | `public-surface.test.ts`, `gravitational-lensing.test.ts`, `schwarzschild-radial-geodesic.test.ts`, `tensor.test.ts` |
| `numerical/grid-field.ts` | `pderiv.test.ts` |
| `numerical/index.ts` | `public-surface.test.ts`, `covariant-derivative-preview.test.ts`, `duplicate-coord-warning.test.ts`, `correctness.test.ts`, `covariant-derivative-lowering.test.ts`, `engine-default.test.ts`, `evaluate.test.ts`, `metric-inverse.test.ts`, `tensor.test.ts` |
| `numerical/lowering.ts` | `lowering-contract.test.ts` |
| `numerical/mathts-engine.ts` | `engine-conformance.mathts.test.ts` |
| `numerical/null-ray-integrator.ts` | `null-ray-integrator.test.ts` |
| `numerical/pderiv.ts` | `metric-deriv-supplied.test.ts`, `pderiv.test.ts` |
| `numerical/tensor-engine.ts` | `public-surface.test.ts`, `covariant-derivative-preview.test.ts`, `duplicate-coord-warning.test.ts`, `correctness.test.ts`, `covariant-derivative-lowering.test.ts`, `engine-capability.test.ts`, `engine-default.test.ts`, `evaluate.test.ts`, `float64-autograd.test.ts`, `mathts-autograd.test.ts`, `metric-inverse.test.ts`, `tensor-engine-types.test.ts`, `tensor.test.ts` |
| `numerical/types.ts` | `connection-lowering-helpers.test.ts`, `correctness.test.ts`, `evaluate.test.ts`, `lowering-contract.test.ts`, `metric-inverse.test.ts`, `tensor-engine-types.test.ts` |

---

## Test File Details

| Test File | Imports from Source |
|-----------|---------------------|
| `api/public-surface.test.ts` | 19 files |
| `bridges/be-11-fix.test.ts` | 7 files |
| `bridges/be-12-encoding.test.ts` | 8 files |
| `bridges/be-12-reformulation.test.ts` | 3 files |
| `bridges/be-13-encoding.test.ts` | 7 files |
| `bridges/be-13-reformulation.test.ts` | 3 files |
| `bridges/be-14-ryu-takayanagi.test.ts` | 8 files |
| `bridges/be-15-encoding.test.ts` | 7 files |
| `bridges/be-15-reformulation.test.ts` | 3 files |
| `bridges/be-16-landauer-encoding.test.ts` | 7 files |
| `bridges/be-17-encoding.test.ts` | 7 files |
| `bridges/be-17-reformulation.test.ts` | 3 files |
| `bridges/be-17-structural.test.ts` | 2 files |
| `bridges/be-18-encoding.test.ts` | 7 files |
| `bridges/be-18-fix.test.ts` | 3 files |
| `bridges/be-19-encoding.test.ts` | 7 files |
| `bridges/be-20-encoding.test.ts` | 7 files |
| `bridges/be-21-encoding.test.ts` | 7 files |
| `bridges/be-22-encoding.test.ts` | 7 files |
| `bridges/be-23-encoding.test.ts` | 7 files |
| `bridges/be-23-reformulation.test.ts` | 3 files |
| `bridges/be-24-encoding.test.ts` | 7 files |
| `bridges/be-24-reformulation.test.ts` | 3 files |
| `bridges/be-25-encoding.test.ts` | 7 files |
| `bridges/be-25-iit-encoding.test.ts` | 7 files |
| `bridges/be-25-reformulation.test.ts` | 3 files |
| `bridges/be-26-encoding.test.ts` | 6 files |
| `bridges/be-27-encoding.test.ts` | 8 files |
| `bridges/be-28-onsager-encoding.test.ts` | 6 files |
| `bridges/be-29-encoding.test.ts` | 8 files |
| `bridges/be-29-fix.test.ts` | 3 files |
| `bridges/be-30-encoding.test.ts` | 7 files |
| `bridges/be-30-reformulation.test.ts` | 3 files |
| `bridges/be-31-encoding.test.ts` | 7 files |
| `bridges/be-31-reformulation.test.ts` | 3 files |
| `bridges/be-32-encoding.test.ts` | 7 files |
| `bridges/be-33-encoding.test.ts` | 7 files |
| `bridges/be-33-reformulation.test.ts` | 3 files |
| `bridges/be-34-encoding.test.ts` | 7 files |
| `bridges/be-35-encoding.test.ts` | 7 files |
| `bridges/be-36-encoding.test.ts` | 8 files |
| `bridges/be-36-reformulation.test.ts` | 3 files |
| `bridges/be-37-numerical-eikonal.test.ts` | 1 files |
| `bridges/be-37-r3-disposition.test.ts` | 3 files |
| `bridges/be-37-shapiro-eikonal-structural.test.ts` | 3 files |
| `bridges/be-37-shapiro-encoding.test.ts` | 7 files |
| `bridges/be-38-encoding.test.ts` | 7 files |
| `bridges/be-38-reformulation.test.ts` | 3 files |
| `bridges/be-39-encoding.test.ts` | 7 files |
| `bridges/be-40-encoding.test.ts` | 7 files |
| `bridges/be-41-encoding.test.ts` | 6 files |
| `bridges/be-42-encoding.test.ts` | 8 files |
| `bridges/be-43-encoding.test.ts` | 8 files |
| `bridges/be-43-reformulation.test.ts` | 3 files |
| `bridges/be-44-encoding.test.ts` | 6 files |
| `bridges/be-45-encoding.test.ts` | 7 files |
| `bridges/be-46-encoding.test.ts` | 7 files |
| `bridges/be-47-encoding.test.ts` | 6 files |
| `bridges/be-47-fix.test.ts` | 3 files |
| `bridges/be-48-encoding.test.ts` | 7 files |
| `bridges/be-48-fix.test.ts` | 3 files |
| `bridges/be-49-encoding.test.ts` | 7 files |
| `bridges/be-50-encoding.test.ts` | 6 files |
| `bridges/be-50-reformulation.test.ts` | 3 files |
| `bridges/dimensional-signature-catalog.test.ts` | 45 files |
| `bridges/gravitational-lensing.test.ts` | 2 files |
| `bridges/orphan-dimensional-signature.test.ts` | 3 files |
| `bridges/perihelion-precession.test.ts` | 1 files |
| `bridges/public-api-stability.test.ts` | 3 files |
| `bridges/spec-vs-index.test.ts` | 3 files |
| `tests/bridges-index.test.ts` | 3 files |
| `dimensional/algebra.test.ts` | 2 files |
| `dimensional/bridge-check.test.ts` | 12 files |
| `dimensional/christoffel-helper.test.ts` | 5 files |
| `dimensional/covariant-derivative-node.test.ts` | 4 files |
| `dimensional/covariant-derivative-preview.test.ts` | 12 files |
| `dimensional/derivative-strategy-field.test.ts` | 3 files |
| `dimensional/derivative-strategy-propagation.test.ts` | 3 files |
| `dimensional/duplicate-coord-warning.test.ts` | 11 files |
| `dimensional/error-message-discoverability.test.ts` | 1 files |
| `dimensional/integral-derivative-tensor.test.ts` | 3 files |
| `dimensional/inverse-metric-consistency.test.ts` | 0 files |
| `dimensional/kronecker-delta.test.ts` | 4 files |
| `dimensional/metric-ast-serialization.test.ts` | 4 files |
| `dimensional/metric-helpers.test.ts` | 3 files |
| `dimensional/metric-tensor.test.ts` | 4 files |
| `dimensional/metric-validation-errors.test.ts` | 1 files |
| `dimensional/numerical-form-field.test.ts` | 2 files |
| `dimensional/numerical-form-preservation.test.ts` | 4 files |
| `dimensional/op-tensor-interactions.test.ts` | 2 files |
| `dimensional/part-viii-spec-vs-impl.test.ts` | 0 files |
| `dimensional/raise-lower.test.ts` | 5 files |
| `dimensional/tensor-ast-serialization.test.ts` | 1 files |
| `dimensional/tensor-helpers.test.ts` | 2 files |
| `dimensional/tensor-node-types.test.ts` | 2 files |
| `dimensional/tensor-partial-derivative.test.ts` | 6 files |
| `dimensional/tensor-product.test.ts` | 3 files |
| `dimensional/tensor-spec-vs-impl.test.ts` | 0 files |
| `dimensional/tensor-symbol.test.ts` | 2 files |
| `dimensional/uptError.test.ts` | 1 files |
| `dimensional/validation-result-shape.test.ts` | 1 files |
| `dimensional/validator.test.ts` | 3 files |
| `dimensional/violation-severity.test.ts` | 2 files |
| `numerical/connection-lowering-helpers.test.ts` | 2 files |
| `numerical/correctness.test.ts` | 11 files |
| `numerical/covariant-derivative-lowering.test.ts` | 7 files |
| `numerical/einsum-properties.test.ts` | 1 files |
| `numerical/engine-capability.test.ts` | 2 files |
| `numerical/engine-conformance.float64.test.ts` | 1 files |
| `numerical/engine-conformance.mathts.test.ts` | 1 files |
| `numerical/engine-conformance.test.ts` | 1 files |
| `numerical/engine-default.test.ts` | 7 files |
| `numerical/errors.test.ts` | 2 files |
| `numerical/evaluate.test.ts` | 11 files |
| `numerical/float64-autograd.test.ts` | 2 files |
| `numerical/lowering-contract.test.ts` | 6 files |
| `numerical/mathts-autograd.test.ts` | 1 files |
| `numerical/metric-deriv-supplied.test.ts` | 1 files |
| `numerical/metric-inverse.test.ts` | 11 files |
| `numerical/null-ray-integrator.test.ts` | 1 files |
| `numerical/pderiv.test.ts` | 2 files |
| `numerical/schwarzschild-radial-geodesic.test.ts` | 1 files |
| `numerical/tensor-engine-types.test.ts` | 2 files |
| `tests/tensor.test.ts` | 19 files |
