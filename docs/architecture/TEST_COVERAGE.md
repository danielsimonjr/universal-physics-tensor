# Test Coverage Analysis

**Generated**: 2026-06-15

## Summary

| Metric | Count |
|--------|-------|
| Total Source Files | 157 |
| Total Test Files | 244 |
| Source Files with Tests | 145 |
| Source Files without Tests | 12 |
| Coverage | 92.4% |

---

## Source Files Without Test Coverage

The following 12 source files are not directly imported by any test file:

### core/

- `src/core/regime-rule-install.ts` → Expected test: `tests/unit/core/regime-rule-install.test.ts`
- `src/core/regimes-builtins.ts` → Expected test: `tests/unit/core/regimes-builtins.test.ts`

### dimensional/

- `src/dimensional/validator-registry.ts` → Expected test: `tests/unit/dimensional/validator-registry.test.ts`

### numerical/

- `src/numerical/derivative-lowering.ts` → Expected test: `tests/unit/numerical/derivative-lowering.test.ts`
- `src/numerical/formula-mathts.ts` → Expected test: `tests/unit/numerical/formula-mathts.test.ts`
- `src/numerical/lowering-utils.ts` → Expected test: `tests/unit/numerical/lowering-utils.test.ts`
- `src/numerical/mathts-autograd.ambient.d.ts` → Expected test: `tests/unit/numerical/mathts-autograd.ambient.d.test.ts`
- `src/numerical/mathts-engine.ts` → Expected test: `tests/unit/numerical/mathts-engine.test.ts`
- `src/numerical/mathts-functions.ambient.d.ts` → Expected test: `tests/unit/numerical/mathts-functions.ambient.d.test.ts`
- `src/numerical/mathts-tensor.ambient.d.ts` → Expected test: `tests/unit/numerical/mathts-tensor.ambient.d.test.ts`
- `src/numerical/metric-inverse.ts` → Expected test: `tests/unit/numerical/metric-inverse.test.ts`
- `src/numerical/null-ic.ts` → Expected test: `tests/unit/numerical/null-ic.test.ts`

---

## Source Files With Test Coverage

| Source File | Test Files |
|-------------|------------|
| `bridges/be23-planckian-confrontation.ts` | `public-surface.test.ts`, `be23-planckian-confrontation.test.ts`, `tensor.test.ts` |
| `bridges/be36-gw170817-confrontation.ts` | `public-surface.test.ts`, `be36-gw170817-confrontation.test.ts`, `enumerate-uncertainty.test.ts`, `tensor.test.ts` |
| `bridges/catalog-adapter.ts` | `public-surface.test.ts`, `catalog-adapter.test.ts`, `tensor.test.ts` |
| `bridges/confrontation-coverage.ts` | `confrontation-coverage.test.ts` |
| `equations/_be-helpers.ts` | `_be-helpers.test.ts` |
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
| `equations/be-23-syk-planckian.ts` | `be-23-encoding.test.ts`, `be23-planckian-confrontation.test.ts`, `dimensional-signature-catalog.test.ts` |
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
| `equations/be-36-gw-speed-bound.ts` | `be-36-encoding.test.ts`, `be36-gw170817-confrontation.test.ts`, `dimensional-signature-catalog.test.ts` |
| `equations/be-37-shapiro-delay.ts` | `be-37-numerical-eikonal.test.ts`, `be-37-shapiro-eikonal-structural.test.ts`, `be-37-shapiro-encoding.test.ts`, `dimensional-signature-catalog.test.ts`, `covariant-derivative-preview.test.ts`, `be37-shapiro-step-sweep.test.ts` |
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
| `equations/be-53-yang-mills-beta.ts` | `be-53-encoding.test.ts`, `dimensional-signature-catalog.test.ts` |
| `equations/be-54-randall-sundrum-brane.ts` | `be-54-encoding.test.ts`, `dimensional-signature-catalog.test.ts` |
| `bridges/gravitational-lensing.ts` | `public-surface.test.ts`, `be-11-fix.test.ts`, `be-14-ryu-takayanagi.test.ts`, `be-18-fix.test.ts`, `be-29-fix.test.ts`, `be-47-fix.test.ts`, `be-48-fix.test.ts`, `catalog-adapter.test.ts`, `catalog-integrity.test.ts`, `catalog-json.test.ts`, `dimensional-signature-catalog.test.ts`, `gravitational-lensing.test.ts`, `membership.test.ts`, `orphan-dimensional-signature.test.ts`, `public-api-stability.test.ts`, `spec-vs-index.test.ts`, `bridges-index.test.ts`, `catalog-full.test.ts`, `catalog-tranche.test.ts`, `tensor.test.ts` |
| `bridges/index.ts` | `public-surface.test.ts`, `be-11-fix.test.ts`, `be-14-ryu-takayanagi.test.ts`, `be-18-fix.test.ts`, `be-29-fix.test.ts`, `be-47-fix.test.ts`, `be-48-fix.test.ts`, `catalog-adapter.test.ts`, `catalog-integrity.test.ts`, `catalog-json.test.ts`, `dimensional-signature-catalog.test.ts`, `membership.test.ts`, `orphan-dimensional-signature.test.ts`, `public-api-stability.test.ts`, `spec-vs-index.test.ts`, `bridges-index.test.ts`, `catalog-full.test.ts`, `catalog-tranche.test.ts`, `tensor.test.ts` |
| `bridges/membership.ts` | `public-surface.test.ts`, `membership.test.ts`, `tensor.test.ts` |
| `bridges/perihelion-precession-labeled.ts` | `perihelion-precession-labeled.test.ts` |
| `bridges/perihelion-precession.ts` | `public-surface.test.ts`, `be-11-fix.test.ts`, `be-14-ryu-takayanagi.test.ts`, `be-18-fix.test.ts`, `be-29-fix.test.ts`, `be-47-fix.test.ts`, `be-48-fix.test.ts`, `catalog-adapter.test.ts`, `catalog-integrity.test.ts`, `catalog-json.test.ts`, `dimensional-signature-catalog.test.ts`, `membership.test.ts`, `orphan-dimensional-signature.test.ts`, `perihelion-precession-labeled.test.ts`, `perihelion-precession.test.ts`, `public-api-stability.test.ts`, `spec-vs-index.test.ts`, `bridges-index.test.ts`, `catalog-full.test.ts`, `catalog-tranche.test.ts`, `tensor.test.ts` |
| `bridges/rejected.ts` | `public-surface.test.ts`, `membership.test.ts`, `catalog-full.test.ts`, `tensor.test.ts` |
| `composition/bridge-analysis.ts` | `bridge-priority.test.ts`, `discovery.test.ts`, `link-candidates.test.ts`, `linkage-map.test.ts`, `orphan-connectors.test.ts`, `bridge-derivation-audit.test.ts` |
| `composition/bridge-prediction.ts` | `bridge-prediction.test.ts` |
| `composition/catalog-graph.ts` | `public-surface.test.ts`, `bridge-prediction.test.ts`, `bridge-priority.test.ts`, `calibration-targets.test.ts`, `catalog-full.test.ts`, `catalog-tranche.test.ts`, `compose-properties.test.ts`, `compose.test.ts`, `discovery.test.ts`, `enumerate-uncertainty.test.ts`, `explain.test.ts`, `identifiability.test.ts`, `link-candidates.test.ts`, `linkage-map.test.ts`, `namespacing.test.ts`, `orphan-connectors.test.ts`, `quantities.test.ts`, `retrodiction.test.ts`, `stress-tests.test.ts`, `symbolic-composition.test.ts`, `bridge-derivation-audit.test.ts`, `symbolic-exponent.test.ts`, `tensor.test.ts` |
| `composition/compose-surface.ts` | `public-surface.test.ts`, `tensor.test.ts` |
| `composition/compose-symbolic.ts` | `public-surface.test.ts`, `bridge-prediction.test.ts`, `bridge-priority.test.ts`, `calibration-targets.test.ts`, `catalog-full.test.ts`, `catalog-tranche.test.ts`, `compose-properties.test.ts`, `compose.test.ts`, `discovery.test.ts`, `enumerate-uncertainty.test.ts`, `explain.test.ts`, `identifiability.test.ts`, `link-candidates.test.ts`, `linkage-map.test.ts`, `namespacing.test.ts`, `orphan-connectors.test.ts`, `quantities.test.ts`, `retrodiction.test.ts`, `stress-tests.test.ts`, `symbolic-composition.test.ts`, `symbolic-simplification.test.ts`, `bridge-derivation-audit.test.ts`, `symbolic-exponent.test.ts`, `tensor.test.ts` |
| `composition/compose.ts` | `public-surface.test.ts`, `bridge-prediction.test.ts`, `bridge-priority.test.ts`, `calibration-targets.test.ts`, `catalog-full.test.ts`, `catalog-tranche.test.ts`, `compose-properties.test.ts`, `compose.test.ts`, `discovery.test.ts`, `enumerate-uncertainty.test.ts`, `explain.test.ts`, `identifiability.test.ts`, `link-candidates.test.ts`, `linkage-map.test.ts`, `namespacing.test.ts`, `orphan-connectors.test.ts`, `quantities.test.ts`, `retrodiction.test.ts`, `stress-tests.test.ts`, `symbolic-composition.test.ts`, `bridge-derivation-audit.test.ts`, `symbolic-exponent.test.ts`, `tensor.test.ts` |
| `composition/consistency.ts` | `public-surface.test.ts`, `bridge-prediction.test.ts`, `bridge-priority.test.ts`, `calibration-targets.test.ts`, `catalog-full.test.ts`, `catalog-tranche.test.ts`, `compose-properties.test.ts`, `compose.test.ts`, `discovery.test.ts`, `enumerate-uncertainty.test.ts`, `explain.test.ts`, `identifiability.test.ts`, `link-candidates.test.ts`, `linkage-map.test.ts`, `namespacing.test.ts`, `orphan-connectors.test.ts`, `quantities.test.ts`, `retrodiction.test.ts`, `stress-tests.test.ts`, `symbolic-composition.test.ts`, `bridge-derivation-audit.test.ts`, `symbolic-exponent.test.ts`, `tensor.test.ts` |
| `composition/discovery.ts` | `discovery.test.ts` |
| `composition/edge.ts` | `public-surface.test.ts`, `bridge-prediction.test.ts`, `bridge-priority.test.ts`, `calibration-targets.test.ts`, `catalog-full.test.ts`, `catalog-tranche.test.ts`, `compose-properties.test.ts`, `compose.test.ts`, `discovery.test.ts`, `enumerate-uncertainty.test.ts`, `explain.test.ts`, `identifiability.test.ts`, `link-candidates.test.ts`, `linkage-map.test.ts`, `namespacing.test.ts`, `orphan-connectors.test.ts`, `quantities.test.ts`, `retrodiction.test.ts`, `stress-tests.test.ts`, `symbolic-composition.test.ts`, `bridge-derivation-audit.test.ts`, `symbolic-exponent.test.ts`, `tensor.test.ts` |
| `edges/calibration.ts` | `public-surface.test.ts`, `bridge-prediction.test.ts`, `bridge-priority.test.ts`, `calibration-targets.test.ts`, `catalog-full.test.ts`, `catalog-tranche.test.ts`, `compose-properties.test.ts`, `compose.test.ts`, `discovery.test.ts`, `enumerate-uncertainty.test.ts`, `explain.test.ts`, `identifiability.test.ts`, `link-candidates.test.ts`, `linkage-map.test.ts`, `namespacing.test.ts`, `orphan-connectors.test.ts`, `quantities.test.ts`, `retrodiction.test.ts`, `stress-tests.test.ts`, `symbolic-composition.test.ts`, `symbolic-simplification.test.ts`, `bridge-derivation-audit.test.ts`, `symbolic-exponent.test.ts`, `tensor.test.ts` |
| `edges/catalog-full.ts` | `public-surface.test.ts`, `bridge-prediction.test.ts`, `bridge-priority.test.ts`, `calibration-targets.test.ts`, `catalog-full.test.ts`, `catalog-tranche.test.ts`, `compose-properties.test.ts`, `compose.test.ts`, `discovery.test.ts`, `enumerate-uncertainty.test.ts`, `explain.test.ts`, `identifiability.test.ts`, `link-candidates.test.ts`, `linkage-map.test.ts`, `namespacing.test.ts`, `orphan-connectors.test.ts`, `quantities.test.ts`, `retrodiction.test.ts`, `stress-tests.test.ts`, `symbolic-composition.test.ts`, `bridge-derivation-audit.test.ts`, `symbolic-exponent.test.ts`, `tensor.test.ts` |
| `edges/catalog-tranche.ts` | `public-surface.test.ts`, `bridge-prediction.test.ts`, `bridge-priority.test.ts`, `calibration-targets.test.ts`, `catalog-full.test.ts`, `catalog-tranche.test.ts`, `compose-properties.test.ts`, `compose.test.ts`, `discovery.test.ts`, `enumerate-uncertainty.test.ts`, `explain.test.ts`, `identifiability.test.ts`, `link-candidates.test.ts`, `linkage-map.test.ts`, `namespacing.test.ts`, `orphan-connectors.test.ts`, `quantities.test.ts`, `retrodiction.test.ts`, `stress-tests.test.ts`, `symbolic-composition.test.ts`, `bridge-derivation-audit.test.ts`, `symbolic-exponent.test.ts`, `tensor.test.ts` |
| `composition/enumerate.ts` | `public-surface.test.ts`, `bridge-prediction.test.ts`, `bridge-priority.test.ts`, `calibration-targets.test.ts`, `catalog-full.test.ts`, `catalog-tranche.test.ts`, `compose-properties.test.ts`, `compose.test.ts`, `discovery.test.ts`, `enumerate-uncertainty.test.ts`, `explain.test.ts`, `identifiability.test.ts`, `link-candidates.test.ts`, `linkage-map.test.ts`, `namespacing.test.ts`, `orphan-connectors.test.ts`, `quantities.test.ts`, `retrodiction.test.ts`, `stress-tests.test.ts`, `symbolic-composition.test.ts`, `bridge-derivation-audit.test.ts`, `symbolic-exponent.test.ts`, `tensor.test.ts` |
| `composition/explain.ts` | `public-surface.test.ts`, `bridge-prediction.test.ts`, `bridge-priority.test.ts`, `calibration-targets.test.ts`, `catalog-full.test.ts`, `catalog-tranche.test.ts`, `compose-properties.test.ts`, `compose.test.ts`, `discovery.test.ts`, `enumerate-uncertainty.test.ts`, `explain.test.ts`, `identifiability.test.ts`, `link-candidates.test.ts`, `linkage-map.test.ts`, `namespacing.test.ts`, `orphan-connectors.test.ts`, `quantities.test.ts`, `retrodiction.test.ts`, `stress-tests.test.ts`, `symbolic-composition.test.ts`, `bridge-derivation-audit.test.ts`, `symbolic-exponent.test.ts`, `tensor.test.ts` |
| `composition/expr-eval.ts` | `public-surface.test.ts`, `bridge-prediction.test.ts`, `bridge-priority.test.ts`, `calibration-targets.test.ts`, `catalog-full.test.ts`, `catalog-tranche.test.ts`, `compose-properties.test.ts`, `compose.test.ts`, `discovery.test.ts`, `enumerate-uncertainty.test.ts`, `explain.test.ts`, `identifiability.test.ts`, `link-candidates.test.ts`, `linkage-map.test.ts`, `namespacing.test.ts`, `orphan-connectors.test.ts`, `quantities.test.ts`, `retrodiction.test.ts`, `stress-tests.test.ts`, `symbolic-composition.test.ts`, `symbolic-simplification.test.ts`, `bridge-derivation-audit.test.ts`, `symbolic-exponent.test.ts`, `tensor.test.ts` |
| `composition/expr-simplify.ts` | `symbolic-simplification.test.ts` |
| `composition/expr-subst.ts` | `symbolic-composition.test.ts` |
| `composition/identifiability.ts` | `public-surface.test.ts`, `bridge-prediction.test.ts`, `bridge-priority.test.ts`, `calibration-targets.test.ts`, `catalog-full.test.ts`, `catalog-tranche.test.ts`, `compose-properties.test.ts`, `compose.test.ts`, `discovery.test.ts`, `enumerate-uncertainty.test.ts`, `explain.test.ts`, `identifiability.test.ts`, `link-candidates.test.ts`, `linkage-map.test.ts`, `namespacing.test.ts`, `orphan-connectors.test.ts`, `quantities.test.ts`, `retrodiction.test.ts`, `stress-tests.test.ts`, `symbolic-composition.test.ts`, `bridge-derivation-audit.test.ts`, `symbolic-exponent.test.ts`, `tensor.test.ts` |
| `composition/index.ts` | `public-surface.test.ts`, `bridge-prediction.test.ts`, `bridge-priority.test.ts`, `calibration-targets.test.ts`, `catalog-full.test.ts`, `catalog-tranche.test.ts`, `compose-properties.test.ts`, `compose.test.ts`, `discovery.test.ts`, `enumerate-uncertainty.test.ts`, `explain.test.ts`, `identifiability.test.ts`, `link-candidates.test.ts`, `linkage-map.test.ts`, `namespacing.test.ts`, `orphan-connectors.test.ts`, `quantities.test.ts`, `retrodiction.test.ts`, `stress-tests.test.ts`, `symbolic-composition.test.ts`, `bridge-derivation-audit.test.ts`, `symbolic-exponent.test.ts`, `tensor.test.ts` |
| `composition/quantities.ts` | `quantities.test.ts` |
| `composition/quantity.ts` | `public-surface.test.ts`, `bridge-prediction.test.ts`, `bridge-priority.test.ts`, `calibration-targets.test.ts`, `catalog-full.test.ts`, `catalog-tranche.test.ts`, `compose-properties.test.ts`, `compose.test.ts`, `discovery.test.ts`, `enumerate-uncertainty.test.ts`, `explain.test.ts`, `identifiability.test.ts`, `link-candidates.test.ts`, `linkage-map.test.ts`, `namespacing.test.ts`, `orphan-connectors.test.ts`, `quantities.test.ts`, `retrodiction.test.ts`, `stress-tests.test.ts`, `symbolic-composition.test.ts`, `bridge-derivation-audit.test.ts`, `symbolic-exponent.test.ts`, `tensor.test.ts` |
| `composition/retrodiction.ts` | `public-surface.test.ts`, `bridge-prediction.test.ts`, `bridge-priority.test.ts`, `calibration-targets.test.ts`, `catalog-full.test.ts`, `catalog-tranche.test.ts`, `compose-properties.test.ts`, `compose.test.ts`, `discovery.test.ts`, `enumerate-uncertainty.test.ts`, `explain.test.ts`, `identifiability.test.ts`, `link-candidates.test.ts`, `linkage-map.test.ts`, `namespacing.test.ts`, `orphan-connectors.test.ts`, `quantities.test.ts`, `retrodiction.test.ts`, `stress-tests.test.ts`, `symbolic-composition.test.ts`, `bridge-derivation-audit.test.ts`, `symbolic-exponent.test.ts`, `tensor.test.ts` |
| `composition/symbolic-constants.ts` | `symbolic-composition.test.ts` |
| `composition/uncertainty.ts` | `public-surface.test.ts`, `bridge-prediction.test.ts`, `bridge-priority.test.ts`, `calibration-targets.test.ts`, `catalog-full.test.ts`, `catalog-tranche.test.ts`, `compose-properties.test.ts`, `compose.test.ts`, `discovery.test.ts`, `enumerate-uncertainty.test.ts`, `explain.test.ts`, `identifiability.test.ts`, `link-candidates.test.ts`, `linkage-map.test.ts`, `namespacing.test.ts`, `orphan-connectors.test.ts`, `quantities.test.ts`, `retrodiction.test.ts`, `stress-tests.test.ts`, `symbolic-composition.test.ts`, `bridge-derivation-audit.test.ts`, `symbolic-exponent.test.ts`, `tensor.test.ts` |
| `core/axes-registry.ts` | `public-surface.test.ts`, `perihelion-precession-labeled.test.ts`, `axes-registry.test.ts`, `labeled-tensor.test.ts`, `tensor.test.ts` |
| `core/cell.ts` | `public-surface.test.ts`, `addCell.test.ts`, `cell.test.ts`, `flux-rules.test.ts`, `populated-cells.test.ts`, `tensor.test.ts` |
| `core/constants.ts` | `public-surface.test.ts`, `perihelion-precession.test.ts`, `namespacing.test.ts`, `constants.test.ts`, `perfect-fluid.test.ts`, `schwarzschild-riemann.test.ts`, `schwarzschild.test.ts`, `conserved-charge-mercury.test.ts`, `einstein-desitter.test.ts`, `einstein-flrw.test.ts`, `einstein-vacuum-schwarzschild.test.ts`, `geometrized.test.ts`, `gl4-integrator.test.ts`, `killing-schwarzschild.test.ts`, `klein-gordon.test.ts`, `kretschmann-horizon.test.ts`, `kretschmann-schwarzschild.test.ts`, `painleve-gullstrand-curvature.test.ts`, `schwarzschild-radial-geodesic.test.ts`, `weyl-kerr-schild.test.ts`, `weyl-schwarzschild.test.ts`, `tensor.test.ts` |
| `core/flux-rules.ts` | `public-surface.test.ts`, `flux-rules.test.ts`, `populated-cells.test.ts`, `tensor.test.ts` |
| `core/labeled-tensor.ts` | `public-surface.test.ts`, `perihelion-precession-labeled.test.ts`, `labeled-tensor.test.ts`, `tensor.test.ts` |
| `core/regime-registry.ts` | `public-surface.test.ts`, `regime-registry.test.ts`, `tensor.test.ts` |
| `core/tensor.ts` | `public-surface.test.ts`, `catalog-adapter.test.ts`, `addCell.test.ts`, `populated-cells.test.ts`, `tensor.test.ts` |
| `core/types.ts` | `public-surface.test.ts`, `be-12-encoding.test.ts`, `be-13-encoding.test.ts`, `be-14-ryu-takayanagi.test.ts`, `be-19-encoding.test.ts`, `be-20-encoding.test.ts`, `be-21-encoding.test.ts`, `be-25-encoding.test.ts`, `be-27-encoding.test.ts`, `be-29-encoding.test.ts`, `be-34-encoding.test.ts`, `be-36-encoding.test.ts`, `be-42-encoding.test.ts`, `be-43-encoding.test.ts`, `be-54-encoding.test.ts`, `be23-planckian-confrontation.test.ts`, `catalog-adapter.test.ts`, `bridge-prediction.test.ts`, `calibration-targets.test.ts`, `catalog-full.test.ts`, `catalog-tranche.test.ts`, `enumerate-uncertainty.test.ts`, `addCell.test.ts`, `populated-cells.test.ts`, `tensor.test.ts` |
| `core/universal-index.ts` | `public-surface.test.ts`, `perihelion-precession-labeled.test.ts`, `labeled-tensor.test.ts`, `universal-index.test.ts`, `tensor.test.ts` |
| `diff/bridge-gradient.ts` | `public-surface.test.ts`, `bridge-gradient.test.ts`, `tensor.test.ts` |
| `diff/bridge-specs.ts` | `public-surface.test.ts`, `bridge-gradient.test.ts`, `tensor.test.ts` |
| `dimensional/algebra.ts` | `public-surface.test.ts`, `be-11-fix.test.ts`, `be-12-encoding.test.ts`, `be-13-encoding.test.ts`, `be-14-ryu-takayanagi.test.ts`, `be-15-encoding.test.ts`, `be-16-landauer-encoding.test.ts`, `be-17-encoding.test.ts`, `be-19-encoding.test.ts`, `be-22-encoding.test.ts`, `be-23-encoding.test.ts`, `be-25-encoding.test.ts`, `be-26-encoding.test.ts`, `be-34-encoding.test.ts`, `be-35-encoding.test.ts`, `be-37-shapiro-encoding.test.ts`, `be-40-encoding.test.ts`, `be-41-encoding.test.ts`, `be-44-encoding.test.ts`, `be-47-encoding.test.ts`, `be-54-encoding.test.ts`, `dimensional-signature-catalog.test.ts`, `calibration-targets.test.ts`, `symbolic-composition.test.ts`, `symbolic-simplification.test.ts`, `algebra-properties.test.ts`, `algebra.test.ts`, `bridge-check.test.ts`, `symbolic-exponent.test.ts`, `tensor-partial-derivative.test.ts`, `tensor.test.ts` |
| `dimensional/bridge-check.ts` | `public-surface.test.ts`, `bridge-check.test.ts`, `tensor.test.ts` |
| `dimensional/buckingham.ts` | `public-surface.test.ts`, `buckingham.test.ts`, `derivation-benchmark.test.ts`, `tensor.test.ts` |
| `dimensional/connection-validators.ts` | `public-surface.test.ts`, `be-11-fix.test.ts`, `be-12-encoding.test.ts`, `be-13-encoding.test.ts`, `be-14-ryu-takayanagi.test.ts`, `be-15-encoding.test.ts`, `be-16-landauer-encoding.test.ts`, `be-17-encoding.test.ts`, `be-17-structural.test.ts`, `be-18-encoding.test.ts`, `be-19-encoding.test.ts`, `be-20-encoding.test.ts`, `be-21-encoding.test.ts`, `be-22-encoding.test.ts`, `be-23-encoding.test.ts`, `be-24-encoding.test.ts`, `be-25-encoding.test.ts`, `be-25-iit-encoding.test.ts`, `be-26-encoding.test.ts`, `be-27-encoding.test.ts`, `be-28-onsager-encoding.test.ts`, `be-29-encoding.test.ts`, `be-30-encoding.test.ts`, `be-31-encoding.test.ts`, `be-32-encoding.test.ts`, `be-33-encoding.test.ts`, `be-34-encoding.test.ts`, `be-35-encoding.test.ts`, `be-36-encoding.test.ts`, `be-37-shapiro-eikonal-structural.test.ts`, `be-37-shapiro-encoding.test.ts`, `be-38-encoding.test.ts`, `be-39-encoding.test.ts`, `be-40-encoding.test.ts`, `be-41-encoding.test.ts`, `be-42-encoding.test.ts`, `be-43-encoding.test.ts`, `be-44-encoding.test.ts`, `be-45-encoding.test.ts`, `be-46-encoding.test.ts`, `be-47-encoding.test.ts`, `be-48-encoding.test.ts`, `be-49-encoding.test.ts`, `be-50-encoding.test.ts`, `be-53-encoding.test.ts`, `be-54-encoding.test.ts`, `dimensional-signature-catalog.test.ts`, `_be-helpers.test.ts`, `symbolic-composition.test.ts`, `symbolic-simplification.test.ts`, `bianchi-residual.test.ts`, `bridge-check.test.ts`, `christoffel-helper.test.ts`, `connection-validators.test.ts`, `cosmological-constant.test.ts`, `covariant-derivative-node.test.ts`, `covariant-derivative-preview.test.ts`, `curvature-invariants.test.ts`, `duplicate-coord-warning.test.ts`, `einstein-equation.test.ts`, `einstein.test.ts`, `equation-valence.test.ts`, `integral-derivative-tensor.test.ts`, `killing-validators.test.ts`, `kronecker-delta.test.ts`, `metric-ast-serialization.test.ts`, `metric-tensor.test.ts`, `minkowski-curvature.test.ts`, `numerical-form-preservation.test.ts`, `op-tensor-interactions.test.ts`, `raise-lower.test.ts`, `rg-flow.test.ts`, `ricci.test.ts`, `riemann-tensor.test.ts`, `stress-energy-validators.test.ts`, `symbolic-exponent.test.ts`, `tensor-ast-serialization.test.ts`, `tensor-helpers.test.ts`, `tensor-node-types.test.ts`, `tensor-partial-derivative.test.ts`, `tensor-product.test.ts`, `tensor-step-c.test.ts`, `tensor-symbol.test.ts`, `validation-result-shape.test.ts`, `validator-probe-ctx.test.ts`, `validator.test.ts`, `violation-severity.test.ts`, `weyl-validators.test.ts`, `correctness.test.ts`, `evaluate.test.ts`, `lowering-contract.test.ts`, `lowering-covariant-guard.test.ts`, `lowering-deferred-arms.test.ts`, `metric-inverse-curvature-walk.test.ts`, `metric-inverse.test.ts`, `riemann-tensor-lowering.test.ts`, `tensor.test.ts` |
| `dimensional/connection.ts` | `public-surface.test.ts`, `christoffel-helper.test.ts`, `tensor.test.ts` |
| `dimensional/constants.ts` | `bridge-check.test.ts`, `constants-surface.test.ts`, `validator.test.ts` |
| `dimensional/curvature-composite.ts` | `curvature-composite-factory.test.ts` |
| `dimensional/curvature-invariants.ts` | `public-surface.test.ts`, `be-11-fix.test.ts`, `be-12-encoding.test.ts`, `be-13-encoding.test.ts`, `be-14-ryu-takayanagi.test.ts`, `be-15-encoding.test.ts`, `be-16-landauer-encoding.test.ts`, `be-17-encoding.test.ts`, `be-17-structural.test.ts`, `be-18-encoding.test.ts`, `be-19-encoding.test.ts`, `be-20-encoding.test.ts`, `be-21-encoding.test.ts`, `be-22-encoding.test.ts`, `be-23-encoding.test.ts`, `be-24-encoding.test.ts`, `be-25-encoding.test.ts`, `be-25-iit-encoding.test.ts`, `be-26-encoding.test.ts`, `be-27-encoding.test.ts`, `be-28-onsager-encoding.test.ts`, `be-29-encoding.test.ts`, `be-30-encoding.test.ts`, `be-31-encoding.test.ts`, `be-32-encoding.test.ts`, `be-33-encoding.test.ts`, `be-34-encoding.test.ts`, `be-35-encoding.test.ts`, `be-36-encoding.test.ts`, `be-37-shapiro-eikonal-structural.test.ts`, `be-37-shapiro-encoding.test.ts`, `be-38-encoding.test.ts`, `be-39-encoding.test.ts`, `be-40-encoding.test.ts`, `be-41-encoding.test.ts`, `be-42-encoding.test.ts`, `be-43-encoding.test.ts`, `be-44-encoding.test.ts`, `be-45-encoding.test.ts`, `be-46-encoding.test.ts`, `be-47-encoding.test.ts`, `be-48-encoding.test.ts`, `be-49-encoding.test.ts`, `be-50-encoding.test.ts`, `be-53-encoding.test.ts`, `be-54-encoding.test.ts`, `dimensional-signature-catalog.test.ts`, `_be-helpers.test.ts`, `symbolic-composition.test.ts`, `symbolic-simplification.test.ts`, `bianchi-residual.test.ts`, `bridge-check.test.ts`, `christoffel-helper.test.ts`, `connection-validators.test.ts`, `cosmological-constant.test.ts`, `covariant-derivative-node.test.ts`, `covariant-derivative-preview.test.ts`, `curvature-invariants.test.ts`, `duplicate-coord-warning.test.ts`, `einstein.test.ts`, `equation-valence.test.ts`, `integral-derivative-tensor.test.ts`, `killing-validators.test.ts`, `kronecker-delta.test.ts`, `metric-ast-serialization.test.ts`, `metric-tensor.test.ts`, `minkowski-curvature.test.ts`, `numerical-form-preservation.test.ts`, `op-tensor-interactions.test.ts`, `raise-lower.test.ts`, `rg-flow.test.ts`, `ricci.test.ts`, `riemann-tensor.test.ts`, `stress-energy-validators.test.ts`, `symbolic-exponent.test.ts`, `tensor-ast-serialization.test.ts`, `tensor-helpers.test.ts`, `tensor-node-types.test.ts`, `tensor-partial-derivative.test.ts`, `tensor-product.test.ts`, `tensor-step-c.test.ts`, `tensor-symbol.test.ts`, `validation-result-shape.test.ts`, `validator-probe-ctx.test.ts`, `validator.test.ts`, `violation-severity.test.ts`, `weyl-validators.test.ts`, `correctness.test.ts`, `evaluate.test.ts`, `lowering-contract.test.ts`, `lowering-covariant-guard.test.ts`, `lowering-deferred-arms.test.ts`, `metric-inverse-curvature-walk.test.ts`, `metric-inverse.test.ts`, `riemann-tensor-lowering.test.ts`, `tensor.test.ts` |
| `dimensional/curvature.ts` | `public-surface.test.ts`, `be-11-fix.test.ts`, `be-12-encoding.test.ts`, `be-13-encoding.test.ts`, `be-14-ryu-takayanagi.test.ts`, `be-15-encoding.test.ts`, `be-16-landauer-encoding.test.ts`, `be-17-encoding.test.ts`, `be-17-structural.test.ts`, `be-18-encoding.test.ts`, `be-19-encoding.test.ts`, `be-20-encoding.test.ts`, `be-21-encoding.test.ts`, `be-22-encoding.test.ts`, `be-23-encoding.test.ts`, `be-24-encoding.test.ts`, `be-25-encoding.test.ts`, `be-25-iit-encoding.test.ts`, `be-26-encoding.test.ts`, `be-27-encoding.test.ts`, `be-28-onsager-encoding.test.ts`, `be-29-encoding.test.ts`, `be-30-encoding.test.ts`, `be-31-encoding.test.ts`, `be-32-encoding.test.ts`, `be-33-encoding.test.ts`, `be-34-encoding.test.ts`, `be-35-encoding.test.ts`, `be-36-encoding.test.ts`, `be-37-shapiro-eikonal-structural.test.ts`, `be-37-shapiro-encoding.test.ts`, `be-38-encoding.test.ts`, `be-39-encoding.test.ts`, `be-40-encoding.test.ts`, `be-41-encoding.test.ts`, `be-42-encoding.test.ts`, `be-43-encoding.test.ts`, `be-44-encoding.test.ts`, `be-45-encoding.test.ts`, `be-46-encoding.test.ts`, `be-47-encoding.test.ts`, `be-48-encoding.test.ts`, `be-49-encoding.test.ts`, `be-50-encoding.test.ts`, `be-53-encoding.test.ts`, `be-54-encoding.test.ts`, `dimensional-signature-catalog.test.ts`, `_be-helpers.test.ts`, `symbolic-composition.test.ts`, `symbolic-simplification.test.ts`, `bianchi-residual.test.ts`, `bridge-check.test.ts`, `christoffel-helper.test.ts`, `connection-validators.test.ts`, `cosmological-constant.test.ts`, `covariant-derivative-node.test.ts`, `covariant-derivative-preview.test.ts`, `curvature-invariants.test.ts`, `duplicate-coord-warning.test.ts`, `einstein-equation.test.ts`, `einstein.test.ts`, `equation-valence.test.ts`, `integral-derivative-tensor.test.ts`, `killing-validators.test.ts`, `kronecker-delta.test.ts`, `metric-ast-serialization.test.ts`, `metric-tensor.test.ts`, `minkowski-curvature.test.ts`, `numerical-form-preservation.test.ts`, `op-tensor-interactions.test.ts`, `raise-lower.test.ts`, `rg-flow.test.ts`, `ricci.test.ts`, `riemann-tensor.test.ts`, `stress-energy-validators.test.ts`, `symbolic-exponent.test.ts`, `tensor-ast-serialization.test.ts`, `tensor-helpers.test.ts`, `tensor-node-types.test.ts`, `tensor-partial-derivative.test.ts`, `tensor-product.test.ts`, `tensor-step-c.test.ts`, `tensor-symbol.test.ts`, `validation-result-shape.test.ts`, `validator-probe-ctx.test.ts`, `validator.test.ts`, `violation-severity.test.ts`, `weyl-validators.test.ts`, `correctness.test.ts`, `evaluate.test.ts`, `lowering-contract.test.ts`, `lowering-covariant-guard.test.ts`, `lowering-deferred-arms.test.ts`, `metric-inverse-curvature-walk.test.ts`, `metric-inverse.test.ts`, `riemann-tensor-lowering.test.ts`, `tensor.test.ts` |
| `dimensional/dimension-spec.ts` | `dimension-spec.test.ts` |
| `dimensional/einstein-equation.ts` | `public-surface.test.ts`, `be-11-fix.test.ts`, `be-12-encoding.test.ts`, `be-13-encoding.test.ts`, `be-14-ryu-takayanagi.test.ts`, `be-15-encoding.test.ts`, `be-16-landauer-encoding.test.ts`, `be-17-encoding.test.ts`, `be-17-structural.test.ts`, `be-18-encoding.test.ts`, `be-19-encoding.test.ts`, `be-20-encoding.test.ts`, `be-21-encoding.test.ts`, `be-22-encoding.test.ts`, `be-23-encoding.test.ts`, `be-24-encoding.test.ts`, `be-25-encoding.test.ts`, `be-25-iit-encoding.test.ts`, `be-26-encoding.test.ts`, `be-27-encoding.test.ts`, `be-28-onsager-encoding.test.ts`, `be-29-encoding.test.ts`, `be-30-encoding.test.ts`, `be-31-encoding.test.ts`, `be-32-encoding.test.ts`, `be-33-encoding.test.ts`, `be-34-encoding.test.ts`, `be-35-encoding.test.ts`, `be-36-encoding.test.ts`, `be-37-shapiro-eikonal-structural.test.ts`, `be-37-shapiro-encoding.test.ts`, `be-38-encoding.test.ts`, `be-39-encoding.test.ts`, `be-40-encoding.test.ts`, `be-41-encoding.test.ts`, `be-42-encoding.test.ts`, `be-43-encoding.test.ts`, `be-44-encoding.test.ts`, `be-45-encoding.test.ts`, `be-46-encoding.test.ts`, `be-47-encoding.test.ts`, `be-48-encoding.test.ts`, `be-49-encoding.test.ts`, `be-50-encoding.test.ts`, `be-53-encoding.test.ts`, `be-54-encoding.test.ts`, `dimensional-signature-catalog.test.ts`, `_be-helpers.test.ts`, `symbolic-composition.test.ts`, `symbolic-simplification.test.ts`, `bianchi-residual.test.ts`, `bridge-check.test.ts`, `christoffel-helper.test.ts`, `connection-validators.test.ts`, `cosmological-constant.test.ts`, `covariant-derivative-node.test.ts`, `covariant-derivative-preview.test.ts`, `curvature-invariants.test.ts`, `duplicate-coord-warning.test.ts`, `einstein-equation.test.ts`, `einstein.test.ts`, `equation-valence.test.ts`, `integral-derivative-tensor.test.ts`, `killing-validators.test.ts`, `kronecker-delta.test.ts`, `metric-ast-serialization.test.ts`, `metric-tensor.test.ts`, `minkowski-curvature.test.ts`, `numerical-form-preservation.test.ts`, `op-tensor-interactions.test.ts`, `raise-lower.test.ts`, `rg-flow.test.ts`, `ricci.test.ts`, `riemann-tensor.test.ts`, `stress-energy-validators.test.ts`, `symbolic-exponent.test.ts`, `tensor-ast-serialization.test.ts`, `tensor-helpers.test.ts`, `tensor-node-types.test.ts`, `tensor-partial-derivative.test.ts`, `tensor-product.test.ts`, `tensor-step-c.test.ts`, `tensor-symbol.test.ts`, `validation-result-shape.test.ts`, `validator-probe-ctx.test.ts`, `validator.test.ts`, `violation-severity.test.ts`, `weyl-validators.test.ts`, `correctness.test.ts`, `evaluate.test.ts`, `lowering-contract.test.ts`, `lowering-covariant-guard.test.ts`, `lowering-deferred-arms.test.ts`, `metric-inverse-curvature-walk.test.ts`, `metric-inverse.test.ts`, `riemann-tensor-lowering.test.ts`, `tensor.test.ts` |
| `dimensional/errors.ts` | `public-surface.test.ts`, `connection-validators.test.ts`, `covariant-derivative-preview.test.ts`, `duplicate-coord-warning.test.ts`, `einstein.test.ts`, `error-message-discoverability.test.ts`, `kronecker-delta.test.ts`, `metric-tensor.test.ts`, `metric-validation-errors.test.ts`, `minkowski-curvature.test.ts`, `op-tensor-interactions.test.ts`, `raise-lower.test.ts`, `ricci.test.ts`, `symbolic-exponent.test.ts`, `tensor-partial-derivative.test.ts`, `tensor-product.test.ts`, `tensor-symbol.test.ts`, `uptError.test.ts`, `weyl-validators.test.ts`, `be37-covariant-eikonal-real.test.ts`, `be37-shapiro-step-sweep.test.ts`, `correctness.test.ts`, `covariant-derivative-lowering.test.ts`, `engine-default.test.ts`, `errors.test.ts`, `evaluate.test.ts`, `lowering-covariant-dead-else.test.ts`, `lowering-deferred-arms.test.ts`, `lowering-strategy-cast.test.ts`, `metric-inverse-curvature-walk.test.ts`, `metric-inverse.test.ts`, `riemann-tensor-lowering.test.ts`, `tensor.test.ts` |
| `dimensional/field-equation-helpers.ts` | `field-equation-helpers.test.ts` |
| `dimensional/fresh-label.ts` | `fresh-label.test.ts` |
| `dimensional/friedmann-equation.ts` | `public-surface.test.ts`, `be-19-encoding.test.ts`, `be-54-encoding.test.ts`, `friedmann-equation.test.ts`, `tensor.test.ts` |
| `dimensional/gauge-field.ts` | `public-surface.test.ts`, `gauge-field.test.ts`, `tensor.test.ts` |
| `dimensional/killing-validators.ts` | `public-surface.test.ts`, `be-11-fix.test.ts`, `be-12-encoding.test.ts`, `be-13-encoding.test.ts`, `be-14-ryu-takayanagi.test.ts`, `be-15-encoding.test.ts`, `be-16-landauer-encoding.test.ts`, `be-17-encoding.test.ts`, `be-17-structural.test.ts`, `be-18-encoding.test.ts`, `be-19-encoding.test.ts`, `be-20-encoding.test.ts`, `be-21-encoding.test.ts`, `be-22-encoding.test.ts`, `be-23-encoding.test.ts`, `be-24-encoding.test.ts`, `be-25-encoding.test.ts`, `be-25-iit-encoding.test.ts`, `be-26-encoding.test.ts`, `be-27-encoding.test.ts`, `be-28-onsager-encoding.test.ts`, `be-29-encoding.test.ts`, `be-30-encoding.test.ts`, `be-31-encoding.test.ts`, `be-32-encoding.test.ts`, `be-33-encoding.test.ts`, `be-34-encoding.test.ts`, `be-35-encoding.test.ts`, `be-36-encoding.test.ts`, `be-37-shapiro-eikonal-structural.test.ts`, `be-37-shapiro-encoding.test.ts`, `be-38-encoding.test.ts`, `be-39-encoding.test.ts`, `be-40-encoding.test.ts`, `be-41-encoding.test.ts`, `be-42-encoding.test.ts`, `be-43-encoding.test.ts`, `be-44-encoding.test.ts`, `be-45-encoding.test.ts`, `be-46-encoding.test.ts`, `be-47-encoding.test.ts`, `be-48-encoding.test.ts`, `be-49-encoding.test.ts`, `be-50-encoding.test.ts`, `be-53-encoding.test.ts`, `be-54-encoding.test.ts`, `dimensional-signature-catalog.test.ts`, `_be-helpers.test.ts`, `symbolic-composition.test.ts`, `symbolic-simplification.test.ts`, `bianchi-residual.test.ts`, `bridge-check.test.ts`, `christoffel-helper.test.ts`, `connection-validators.test.ts`, `cosmological-constant.test.ts`, `covariant-derivative-node.test.ts`, `covariant-derivative-preview.test.ts`, `curvature-invariants.test.ts`, `duplicate-coord-warning.test.ts`, `einstein.test.ts`, `equation-valence.test.ts`, `integral-derivative-tensor.test.ts`, `killing-validators.test.ts`, `kronecker-delta.test.ts`, `metric-ast-serialization.test.ts`, `metric-tensor.test.ts`, `minkowski-curvature.test.ts`, `numerical-form-preservation.test.ts`, `op-tensor-interactions.test.ts`, `raise-lower.test.ts`, `rg-flow.test.ts`, `ricci.test.ts`, `riemann-tensor.test.ts`, `stress-energy-validators.test.ts`, `symbolic-exponent.test.ts`, `tensor-ast-serialization.test.ts`, `tensor-helpers.test.ts`, `tensor-node-types.test.ts`, `tensor-partial-derivative.test.ts`, `tensor-product.test.ts`, `tensor-step-c.test.ts`, `tensor-symbol.test.ts`, `validation-result-shape.test.ts`, `validator-probe-ctx.test.ts`, `validator.test.ts`, `violation-severity.test.ts`, `weyl-validators.test.ts`, `correctness.test.ts`, `evaluate.test.ts`, `lowering-contract.test.ts`, `lowering-covariant-guard.test.ts`, `lowering-deferred-arms.test.ts`, `metric-inverse-curvature-walk.test.ts`, `metric-inverse.test.ts`, `riemann-tensor-lowering.test.ts`, `tensor.test.ts` |
| `dimensional/klein-gordon-equation.ts` | `public-surface.test.ts`, `friedmann-equation.test.ts`, `klein-gordon-equation.test.ts`, `tensor.test.ts` |
| `dimensional/metric-validators.ts` | `public-surface.test.ts`, `be-11-fix.test.ts`, `be-12-encoding.test.ts`, `be-13-encoding.test.ts`, `be-14-ryu-takayanagi.test.ts`, `be-15-encoding.test.ts`, `be-16-landauer-encoding.test.ts`, `be-17-encoding.test.ts`, `be-17-structural.test.ts`, `be-18-encoding.test.ts`, `be-19-encoding.test.ts`, `be-20-encoding.test.ts`, `be-21-encoding.test.ts`, `be-22-encoding.test.ts`, `be-23-encoding.test.ts`, `be-24-encoding.test.ts`, `be-25-encoding.test.ts`, `be-25-iit-encoding.test.ts`, `be-26-encoding.test.ts`, `be-27-encoding.test.ts`, `be-28-onsager-encoding.test.ts`, `be-29-encoding.test.ts`, `be-30-encoding.test.ts`, `be-31-encoding.test.ts`, `be-32-encoding.test.ts`, `be-33-encoding.test.ts`, `be-34-encoding.test.ts`, `be-35-encoding.test.ts`, `be-36-encoding.test.ts`, `be-37-shapiro-eikonal-structural.test.ts`, `be-37-shapiro-encoding.test.ts`, `be-38-encoding.test.ts`, `be-39-encoding.test.ts`, `be-40-encoding.test.ts`, `be-41-encoding.test.ts`, `be-42-encoding.test.ts`, `be-43-encoding.test.ts`, `be-44-encoding.test.ts`, `be-45-encoding.test.ts`, `be-46-encoding.test.ts`, `be-47-encoding.test.ts`, `be-48-encoding.test.ts`, `be-49-encoding.test.ts`, `be-50-encoding.test.ts`, `be-53-encoding.test.ts`, `be-54-encoding.test.ts`, `dimensional-signature-catalog.test.ts`, `_be-helpers.test.ts`, `symbolic-composition.test.ts`, `symbolic-simplification.test.ts`, `bianchi-residual.test.ts`, `bridge-check.test.ts`, `christoffel-helper.test.ts`, `connection-validators.test.ts`, `cosmological-constant.test.ts`, `covariant-derivative-node.test.ts`, `covariant-derivative-preview.test.ts`, `curvature-invariants.test.ts`, `derivative-strategy-field.test.ts`, `duplicate-coord-warning.test.ts`, `einstein-equation.test.ts`, `einstein.test.ts`, `equation-valence.test.ts`, `integral-derivative-tensor.test.ts`, `killing-validators.test.ts`, `kronecker-delta.test.ts`, `metric-ast-serialization.test.ts`, `metric-tensor.test.ts`, `minkowski-curvature.test.ts`, `numerical-form-preservation.test.ts`, `op-tensor-interactions.test.ts`, `raise-lower.test.ts`, `rg-flow.test.ts`, `ricci.test.ts`, `riemann-tensor.test.ts`, `stress-energy-validators.test.ts`, `symbolic-exponent.test.ts`, `tensor-ast-serialization.test.ts`, `tensor-helpers.test.ts`, `tensor-node-types.test.ts`, `tensor-partial-derivative.test.ts`, `tensor-product.test.ts`, `tensor-step-c.test.ts`, `tensor-symbol.test.ts`, `tensor-trace.test.ts`, `validation-result-shape.test.ts`, `validator-probe-ctx.test.ts`, `validator.test.ts`, `violation-severity.test.ts`, `weyl-validators.test.ts`, `correctness.test.ts`, `evaluate.test.ts`, `lowering-contract.test.ts`, `lowering-covariant-guard.test.ts`, `lowering-deferred-arms.test.ts`, `metric-inverse-curvature-walk.test.ts`, `metric-inverse.test.ts`, `riemann-tensor-lowering.test.ts`, `tensor.test.ts` |
| `dimensional/metric.ts` | `bianchi-residual.test.ts`, `christoffel-helper.test.ts`, `connection-validators.test.ts`, `covariant-derivative-node.test.ts`, `covariant-derivative-preview.test.ts`, `derivative-strategy-field.test.ts`, `derivative-strategy-propagation.test.ts`, `duplicate-coord-warning.test.ts`, `einstein-equation.test.ts`, `einstein.test.ts`, `metric-ast-serialization.test.ts`, `metric-helpers.test.ts`, `minkowski-curvature.test.ts`, `numerical-form-preservation.test.ts`, `raise-lower.test.ts`, `ricci.test.ts`, `riemann-tensor.test.ts`, `metric-inverse-curvature-walk.test.ts`, `riemann-tensor-lowering.test.ts` |
| `dimensional/rg-flow.ts` | `public-surface.test.ts`, `be-39-encoding.test.ts`, `be-53-encoding.test.ts`, `rg-flow.test.ts`, `tensor.test.ts` |
| `dimensional/stress-energy-validators.ts` | `public-surface.test.ts`, `be-11-fix.test.ts`, `be-12-encoding.test.ts`, `be-13-encoding.test.ts`, `be-14-ryu-takayanagi.test.ts`, `be-15-encoding.test.ts`, `be-16-landauer-encoding.test.ts`, `be-17-encoding.test.ts`, `be-17-structural.test.ts`, `be-18-encoding.test.ts`, `be-19-encoding.test.ts`, `be-20-encoding.test.ts`, `be-21-encoding.test.ts`, `be-22-encoding.test.ts`, `be-23-encoding.test.ts`, `be-24-encoding.test.ts`, `be-25-encoding.test.ts`, `be-25-iit-encoding.test.ts`, `be-26-encoding.test.ts`, `be-27-encoding.test.ts`, `be-28-onsager-encoding.test.ts`, `be-29-encoding.test.ts`, `be-30-encoding.test.ts`, `be-31-encoding.test.ts`, `be-32-encoding.test.ts`, `be-33-encoding.test.ts`, `be-34-encoding.test.ts`, `be-35-encoding.test.ts`, `be-36-encoding.test.ts`, `be-37-shapiro-eikonal-structural.test.ts`, `be-37-shapiro-encoding.test.ts`, `be-38-encoding.test.ts`, `be-39-encoding.test.ts`, `be-40-encoding.test.ts`, `be-41-encoding.test.ts`, `be-42-encoding.test.ts`, `be-43-encoding.test.ts`, `be-44-encoding.test.ts`, `be-45-encoding.test.ts`, `be-46-encoding.test.ts`, `be-47-encoding.test.ts`, `be-48-encoding.test.ts`, `be-49-encoding.test.ts`, `be-50-encoding.test.ts`, `be-53-encoding.test.ts`, `be-54-encoding.test.ts`, `dimensional-signature-catalog.test.ts`, `_be-helpers.test.ts`, `symbolic-composition.test.ts`, `symbolic-simplification.test.ts`, `bianchi-residual.test.ts`, `bridge-check.test.ts`, `christoffel-helper.test.ts`, `connection-validators.test.ts`, `cosmological-constant.test.ts`, `covariant-derivative-node.test.ts`, `covariant-derivative-preview.test.ts`, `curvature-invariants.test.ts`, `duplicate-coord-warning.test.ts`, `einstein-equation.test.ts`, `einstein.test.ts`, `equation-valence.test.ts`, `integral-derivative-tensor.test.ts`, `killing-validators.test.ts`, `kronecker-delta.test.ts`, `metric-ast-serialization.test.ts`, `metric-tensor.test.ts`, `minkowski-curvature.test.ts`, `numerical-form-preservation.test.ts`, `op-tensor-interactions.test.ts`, `raise-lower.test.ts`, `rg-flow.test.ts`, `ricci.test.ts`, `riemann-tensor.test.ts`, `stress-energy-validators.test.ts`, `symbolic-exponent.test.ts`, `tensor-ast-serialization.test.ts`, `tensor-helpers.test.ts`, `tensor-node-types.test.ts`, `tensor-partial-derivative.test.ts`, `tensor-product.test.ts`, `tensor-step-c.test.ts`, `tensor-symbol.test.ts`, `validation-result-shape.test.ts`, `validator-probe-ctx.test.ts`, `validator.test.ts`, `violation-severity.test.ts`, `weyl-validators.test.ts`, `correctness.test.ts`, `evaluate.test.ts`, `lowering-contract.test.ts`, `lowering-covariant-guard.test.ts`, `lowering-deferred-arms.test.ts`, `metric-inverse-curvature-walk.test.ts`, `metric-inverse.test.ts`, `riemann-tensor-lowering.test.ts`, `tensor.test.ts` |
| `dimensional/tensor-trace.ts` | `public-surface.test.ts`, `be-13-encoding.test.ts`, `tensor-trace.test.ts`, `tensor.test.ts` |
| `dimensional/tensor.ts` | `public-surface.test.ts`, `be-11-fix.test.ts`, `be-12-encoding.test.ts`, `be-13-encoding.test.ts`, `be-14-ryu-takayanagi.test.ts`, `be-15-encoding.test.ts`, `be-16-landauer-encoding.test.ts`, `be-17-encoding.test.ts`, `be-17-structural.test.ts`, `be-18-encoding.test.ts`, `be-19-encoding.test.ts`, `be-20-encoding.test.ts`, `be-21-encoding.test.ts`, `be-22-encoding.test.ts`, `be-23-encoding.test.ts`, `be-24-encoding.test.ts`, `be-25-encoding.test.ts`, `be-25-iit-encoding.test.ts`, `be-26-encoding.test.ts`, `be-27-encoding.test.ts`, `be-28-onsager-encoding.test.ts`, `be-29-encoding.test.ts`, `be-30-encoding.test.ts`, `be-31-encoding.test.ts`, `be-32-encoding.test.ts`, `be-33-encoding.test.ts`, `be-34-encoding.test.ts`, `be-35-encoding.test.ts`, `be-36-encoding.test.ts`, `be-37-shapiro-eikonal-structural.test.ts`, `be-37-shapiro-encoding.test.ts`, `be-38-encoding.test.ts`, `be-39-encoding.test.ts`, `be-40-encoding.test.ts`, `be-41-encoding.test.ts`, `be-42-encoding.test.ts`, `be-43-encoding.test.ts`, `be-44-encoding.test.ts`, `be-45-encoding.test.ts`, `be-46-encoding.test.ts`, `be-47-encoding.test.ts`, `be-48-encoding.test.ts`, `be-49-encoding.test.ts`, `be-50-encoding.test.ts`, `be-53-encoding.test.ts`, `be-54-encoding.test.ts`, `dimensional-signature-catalog.test.ts`, `_be-helpers.test.ts`, `symbolic-composition.test.ts`, `symbolic-simplification.test.ts`, `bianchi-residual.test.ts`, `bridge-check.test.ts`, `christoffel-helper.test.ts`, `connection-validators.test.ts`, `cosmological-constant.test.ts`, `covariant-derivative-node.test.ts`, `covariant-derivative-preview.test.ts`, `curvature-invariants.test.ts`, `derivative-strategy-propagation.test.ts`, `duplicate-coord-warning.test.ts`, `einstein-equation.test.ts`, `einstein.test.ts`, `equation-valence.test.ts`, `integral-derivative-tensor.test.ts`, `killing-validators.test.ts`, `kronecker-delta.test.ts`, `metric-ast-serialization.test.ts`, `metric-helpers.test.ts`, `metric-tensor.test.ts`, `minkowski-curvature.test.ts`, `numerical-form-field.test.ts`, `numerical-form-preservation.test.ts`, `op-tensor-interactions.test.ts`, `raise-lower.test.ts`, `rg-flow.test.ts`, `ricci.test.ts`, `riemann-tensor.test.ts`, `stress-energy-validators.test.ts`, `symbolic-exponent.test.ts`, `tensor-ast-serialization.test.ts`, `tensor-helpers.test.ts`, `tensor-node-types.test.ts`, `tensor-partial-derivative.test.ts`, `tensor-product.test.ts`, `tensor-step-c.test.ts`, `tensor-symbol.test.ts`, `validation-result-shape.test.ts`, `validator-probe-ctx.test.ts`, `validator.test.ts`, `violation-severity.test.ts`, `weyl-validators.test.ts`, `correctness.test.ts`, `evaluate.test.ts`, `lowering-contract.test.ts`, `lowering-covariant-guard.test.ts`, `lowering-deferred-arms.test.ts`, `metric-inverse-curvature-walk.test.ts`, `metric-inverse.test.ts`, `riemann-tensor-lowering.test.ts`, `tensor.test.ts` |
| `dimensional/types.ts` | `public-surface.test.ts`, `be-11-fix.test.ts`, `be-12-encoding.test.ts`, `be-14-ryu-takayanagi.test.ts`, `be-15-encoding.test.ts`, `be-16-landauer-encoding.test.ts`, `be-17-encoding.test.ts`, `be-18-encoding.test.ts`, `be-22-encoding.test.ts`, `be-23-encoding.test.ts`, `be-24-encoding.test.ts`, `be-25-iit-encoding.test.ts`, `be-27-encoding.test.ts`, `be-29-encoding.test.ts`, `be-30-encoding.test.ts`, `be-31-encoding.test.ts`, `be-32-encoding.test.ts`, `be-33-encoding.test.ts`, `be-35-encoding.test.ts`, `be-36-encoding.test.ts`, `be-37-shapiro-eikonal-structural.test.ts`, `be-37-shapiro-encoding.test.ts`, `be-38-encoding.test.ts`, `be-39-encoding.test.ts`, `be-40-encoding.test.ts`, `be-42-encoding.test.ts`, `be-43-encoding.test.ts`, `be-45-encoding.test.ts`, `be-46-encoding.test.ts`, `be-48-encoding.test.ts`, `be-49-encoding.test.ts`, `be-53-encoding.test.ts`, `_be-helpers.test.ts`, `bridge-prediction.test.ts`, `calibration-targets.test.ts`, `compose-properties.test.ts`, `compose.test.ts`, `discovery.test.ts`, `enumerate-uncertainty.test.ts`, `explain.test.ts`, `identifiability.test.ts`, `namespacing.test.ts`, `retrodiction.test.ts`, `symbolic-composition.test.ts`, `symbolic-simplification.test.ts`, `algebra-properties.test.ts`, `algebra.test.ts`, `bianchi-residual.test.ts`, `bridge-check.test.ts`, `buckingham.test.ts`, `christoffel-helper.test.ts`, `connection-validators.test.ts`, `covariant-derivative-node.test.ts`, `covariant-derivative-preview.test.ts`, `derivation-benchmark.test.ts`, `derivative-strategy-field.test.ts`, `derivative-strategy-propagation.test.ts`, `dimension-spec.test.ts`, `duplicate-coord-warning.test.ts`, `einstein-equation.test.ts`, `einstein.test.ts`, `equation-valence.test.ts`, `field-equation-helpers.test.ts`, `friedmann-equation.test.ts`, `gauge-field.test.ts`, `integral-derivative-tensor.test.ts`, `klein-gordon-equation.test.ts`, `kronecker-delta.test.ts`, `metric-ast-serialization.test.ts`, `metric-helpers.test.ts`, `metric-tensor.test.ts`, `minkowski-curvature.test.ts`, `numerical-form-field.test.ts`, `numerical-form-preservation.test.ts`, `raise-lower.test.ts`, `rg-flow.test.ts`, `ricci.test.ts`, `riemann-tensor.test.ts`, `symbolic-exponent.test.ts`, `tensor-node-types.test.ts`, `tensor-partial-derivative.test.ts`, `tensor-step-c.test.ts`, `tensor-trace.test.ts`, `validator-probe-ctx.test.ts`, `validator.test.ts`, `violation-severity.test.ts`, `correctness.test.ts`, `evaluate.test.ts`, `formula-dimension.test.ts`, `geometrized.test.ts`, `lowering-contract.test.ts`, `lowering-covariant-guard.test.ts`, `metric-inverse-curvature-walk.test.ts`, `metric-inverse.test.ts`, `riemann-tensor-lowering.test.ts`, `tensor.test.ts` |
| `dimensional/validator.ts` | `public-surface.test.ts`, `be-11-fix.test.ts`, `be-12-encoding.test.ts`, `be-13-encoding.test.ts`, `be-14-ryu-takayanagi.test.ts`, `be-15-encoding.test.ts`, `be-16-landauer-encoding.test.ts`, `be-17-encoding.test.ts`, `be-17-structural.test.ts`, `be-18-encoding.test.ts`, `be-19-encoding.test.ts`, `be-20-encoding.test.ts`, `be-21-encoding.test.ts`, `be-22-encoding.test.ts`, `be-23-encoding.test.ts`, `be-24-encoding.test.ts`, `be-25-encoding.test.ts`, `be-25-iit-encoding.test.ts`, `be-26-encoding.test.ts`, `be-27-encoding.test.ts`, `be-28-onsager-encoding.test.ts`, `be-29-encoding.test.ts`, `be-30-encoding.test.ts`, `be-31-encoding.test.ts`, `be-32-encoding.test.ts`, `be-33-encoding.test.ts`, `be-34-encoding.test.ts`, `be-35-encoding.test.ts`, `be-36-encoding.test.ts`, `be-37-shapiro-eikonal-structural.test.ts`, `be-37-shapiro-encoding.test.ts`, `be-38-encoding.test.ts`, `be-39-encoding.test.ts`, `be-40-encoding.test.ts`, `be-41-encoding.test.ts`, `be-42-encoding.test.ts`, `be-43-encoding.test.ts`, `be-44-encoding.test.ts`, `be-45-encoding.test.ts`, `be-46-encoding.test.ts`, `be-47-encoding.test.ts`, `be-48-encoding.test.ts`, `be-49-encoding.test.ts`, `be-50-encoding.test.ts`, `be-53-encoding.test.ts`, `be-54-encoding.test.ts`, `dimensional-signature-catalog.test.ts`, `_be-helpers.test.ts`, `symbolic-composition.test.ts`, `symbolic-simplification.test.ts`, `bianchi-residual.test.ts`, `bridge-check.test.ts`, `christoffel-helper.test.ts`, `connection-validators.test.ts`, `cosmological-constant.test.ts`, `covariant-derivative-node.test.ts`, `covariant-derivative-preview.test.ts`, `curvature-invariants.test.ts`, `duplicate-coord-warning.test.ts`, `einstein.test.ts`, `equation-valence.test.ts`, `integral-derivative-tensor.test.ts`, `killing-validators.test.ts`, `kronecker-delta.test.ts`, `metric-ast-serialization.test.ts`, `metric-tensor.test.ts`, `minkowski-curvature.test.ts`, `numerical-form-preservation.test.ts`, `op-tensor-interactions.test.ts`, `raise-lower.test.ts`, `rg-flow.test.ts`, `ricci.test.ts`, `riemann-tensor.test.ts`, `stress-energy-validators.test.ts`, `symbolic-exponent.test.ts`, `tensor-ast-serialization.test.ts`, `tensor-helpers.test.ts`, `tensor-node-types.test.ts`, `tensor-partial-derivative.test.ts`, `tensor-product.test.ts`, `tensor-step-c.test.ts`, `tensor-symbol.test.ts`, `validation-result-shape.test.ts`, `validator-probe-ctx.test.ts`, `validator.test.ts`, `violation-severity.test.ts`, `weyl-validators.test.ts`, `correctness.test.ts`, `evaluate.test.ts`, `lowering-contract.test.ts`, `lowering-covariant-guard.test.ts`, `lowering-deferred-arms.test.ts`, `metric-inverse-curvature-walk.test.ts`, `metric-inverse.test.ts`, `riemann-tensor-lowering.test.ts`, `tensor.test.ts` |
| `dimensional/weyl-validators.ts` | `public-surface.test.ts`, `be-11-fix.test.ts`, `be-12-encoding.test.ts`, `be-13-encoding.test.ts`, `be-14-ryu-takayanagi.test.ts`, `be-15-encoding.test.ts`, `be-16-landauer-encoding.test.ts`, `be-17-encoding.test.ts`, `be-17-structural.test.ts`, `be-18-encoding.test.ts`, `be-19-encoding.test.ts`, `be-20-encoding.test.ts`, `be-21-encoding.test.ts`, `be-22-encoding.test.ts`, `be-23-encoding.test.ts`, `be-24-encoding.test.ts`, `be-25-encoding.test.ts`, `be-25-iit-encoding.test.ts`, `be-26-encoding.test.ts`, `be-27-encoding.test.ts`, `be-28-onsager-encoding.test.ts`, `be-29-encoding.test.ts`, `be-30-encoding.test.ts`, `be-31-encoding.test.ts`, `be-32-encoding.test.ts`, `be-33-encoding.test.ts`, `be-34-encoding.test.ts`, `be-35-encoding.test.ts`, `be-36-encoding.test.ts`, `be-37-shapiro-eikonal-structural.test.ts`, `be-37-shapiro-encoding.test.ts`, `be-38-encoding.test.ts`, `be-39-encoding.test.ts`, `be-40-encoding.test.ts`, `be-41-encoding.test.ts`, `be-42-encoding.test.ts`, `be-43-encoding.test.ts`, `be-44-encoding.test.ts`, `be-45-encoding.test.ts`, `be-46-encoding.test.ts`, `be-47-encoding.test.ts`, `be-48-encoding.test.ts`, `be-49-encoding.test.ts`, `be-50-encoding.test.ts`, `be-53-encoding.test.ts`, `be-54-encoding.test.ts`, `dimensional-signature-catalog.test.ts`, `_be-helpers.test.ts`, `symbolic-composition.test.ts`, `symbolic-simplification.test.ts`, `bianchi-residual.test.ts`, `bridge-check.test.ts`, `christoffel-helper.test.ts`, `connection-validators.test.ts`, `cosmological-constant.test.ts`, `covariant-derivative-node.test.ts`, `covariant-derivative-preview.test.ts`, `curvature-invariants.test.ts`, `duplicate-coord-warning.test.ts`, `einstein.test.ts`, `equation-valence.test.ts`, `integral-derivative-tensor.test.ts`, `killing-validators.test.ts`, `kronecker-delta.test.ts`, `metric-ast-serialization.test.ts`, `metric-tensor.test.ts`, `minkowski-curvature.test.ts`, `numerical-form-preservation.test.ts`, `op-tensor-interactions.test.ts`, `raise-lower.test.ts`, `rg-flow.test.ts`, `ricci.test.ts`, `riemann-tensor.test.ts`, `stress-energy-validators.test.ts`, `symbolic-exponent.test.ts`, `tensor-ast-serialization.test.ts`, `tensor-helpers.test.ts`, `tensor-node-types.test.ts`, `tensor-partial-derivative.test.ts`, `tensor-product.test.ts`, `tensor-step-c.test.ts`, `tensor-symbol.test.ts`, `validation-result-shape.test.ts`, `validator-probe-ctx.test.ts`, `validator.test.ts`, `violation-severity.test.ts`, `weyl-validators.test.ts`, `correctness.test.ts`, `evaluate.test.ts`, `lowering-contract.test.ts`, `lowering-covariant-guard.test.ts`, `lowering-deferred-arms.test.ts`, `metric-inverse-curvature-walk.test.ts`, `metric-inverse.test.ts`, `riemann-tensor-lowering.test.ts`, `tensor.test.ts` |
| `src/index.ts` | `public-surface.test.ts`, `tensor.test.ts` |
| `numerical/be37-covariant-eikonal.ts` | `public-surface.test.ts`, `covariant-derivative-preview.test.ts`, `duplicate-coord-warning.test.ts`, `einstein.test.ts`, `minkowski-curvature.test.ts`, `ricci.test.ts`, `be37-covariant-eikonal-real.test.ts`, `be37-shapiro-step-sweep.test.ts`, `correctness.test.ts`, `covariant-derivative-lowering.test.ts`, `engine-default.test.ts`, `evaluate.test.ts`, `lowering-covariant-dead-else.test.ts`, `lowering-deferred-arms.test.ts`, `lowering-strategy-cast.test.ts`, `metric-inverse-curvature-walk.test.ts`, `metric-inverse.test.ts`, `riemann-tensor-lowering.test.ts`, `tensor.test.ts` |
| `numerical/christoffel-flat.ts` | `christoffel-flat-indexing.test.ts`, `christoffel-flat.test.ts` |
| `numerical/connection-lowering-helpers.ts` | `christoffel-precompute.test.ts`, `connection-lowering-helpers.test.ts`, `flatten-na-accuracy.test.ts`, `foreach-multi-index.test.ts`, `lowering-strategy-cast.test.ts` |
| `numerical/curvature-lowering-helpers.ts` | `bianchi-residual.test.ts`, `schwarzschild-riemann.test.ts`, `kretschmann-factored-raising.test.ts`, `kretschmann-horizon.test.ts`, `kretschmann-schwarzschild.test.ts`, `painleve-gullstrand-curvature.test.ts`, `weyl-schwarzschild.test.ts` |
| `numerical/einstein-equation.ts` | `public-surface.test.ts`, `einstein-desitter.test.ts`, `einstein-flrw.test.ts`, `einstein-vacuum-schwarzschild.test.ts`, `tensor.test.ts` |
| `numerical/engine-registry.ts` | `public-surface.test.ts`, `covariant-derivative-preview.test.ts`, `duplicate-coord-warning.test.ts`, `einstein.test.ts`, `minkowski-curvature.test.ts`, `ricci.test.ts`, `be37-covariant-eikonal-real.test.ts`, `be37-shapiro-step-sweep.test.ts`, `correctness.test.ts`, `covariant-derivative-lowering.test.ts`, `engine-default.test.ts`, `evaluate.test.ts`, `lowering-covariant-dead-else.test.ts`, `lowering-deferred-arms.test.ts`, `lowering-strategy-cast.test.ts`, `metric-inverse-curvature-walk.test.ts`, `metric-inverse.test.ts`, `riemann-tensor-lowering.test.ts`, `tensor.test.ts` |
| `numerical/errors.ts` | `public-surface.test.ts`, `bridge-gradient.test.ts`, `covariant-derivative-preview.test.ts`, `duplicate-coord-warning.test.ts`, `einstein.test.ts`, `minkowski-curvature.test.ts`, `ricci.test.ts`, `be37-covariant-eikonal-real.test.ts`, `be37-shapiro-step-sweep.test.ts`, `correctness.test.ts`, `covariant-derivative-lowering.test.ts`, `engine-default.test.ts`, `errors.test.ts`, `evaluate.test.ts`, `lowering-covariant-dead-else.test.ts`, `lowering-covariant-guard.test.ts`, `lowering-deferred-arms.test.ts`, `lowering-strategy-cast.test.ts`, `metric-inverse-curvature-walk.test.ts`, `metric-inverse.test.ts`, `riemann-tensor-lowering.test.ts`, `tensor.test.ts` |
| `numerical/float64-engine.ts` | `public-surface.test.ts`, `perihelion-precession-labeled.test.ts`, `labeled-tensor.test.ts`, `bridge-gradient.test.ts`, `bianchi-residual.test.ts`, `covariant-derivative-preview.test.ts`, `duplicate-coord-warning.test.ts`, `einstein.test.ts`, `minkowski-curvature.test.ts`, `ricci.test.ts`, `schwarzschild-riemann.test.ts`, `be37-covariant-eikonal-real.test.ts`, `be37-shapiro-step-sweep.test.ts`, `christoffel-precompute.test.ts`, `correctness.test.ts`, `covariant-derivative-lowering.test.ts`, `einsum-precompute.test.ts`, `einsum-properties.test.ts`, `engine-capability.test.ts`, `engine-conformance.float64.test.ts`, `engine-conformance.test.ts`, `engine-default.test.ts`, `evaluate.test.ts`, `float64-autograd.test.ts`, `float64-engine-ad-dispatch.test.ts`, `foreach-multi-index.test.ts`, `kretschmann-factored-raising.test.ts`, `kretschmann-horizon.test.ts`, `kretschmann-schwarzschild.test.ts`, `lowering-contract.test.ts`, `lowering-covariant-dead-else.test.ts`, `lowering-covariant-guard.test.ts`, `lowering-deferred-arms.test.ts`, `lowering-strategy-cast.test.ts`, `mathts-engine-typing.test.ts`, `metric-inverse-curvature-walk.test.ts`, `metric-inverse.test.ts`, `painleve-gullstrand-curvature.test.ts`, `riemann-tensor-lowering.test.ts`, `weyl-schwarzschild.test.ts`, `tensor.test.ts` |
| `numerical/formula-dimension.ts` | `formula-dimension.test.ts` |
| `numerical/formula-registry.ts` | `formula-registry.test.ts` |
| `numerical/formula.ts` | `formula-conformance.builtin.test.ts`, `formula.test.ts` |
| `numerical/geodesic-integrator.ts` | `public-surface.test.ts`, `gravitational-lensing.test.ts`, `schwarzschild-radial-geodesic.test.ts`, `tensor.test.ts` |
| `numerical/geometrized.ts` | `geometrized.test.ts` |
| `numerical/gl4-integrator.ts` | `public-surface.test.ts`, `perihelion-precession.test.ts`, `covariant-derivative-preview.test.ts`, `duplicate-coord-warning.test.ts`, `einstein.test.ts`, `minkowski-curvature.test.ts`, `ricci.test.ts`, `be37-covariant-eikonal-real.test.ts`, `be37-shapiro-step-sweep.test.ts`, `conserved-charge-mercury.test.ts`, `correctness.test.ts`, `covariant-derivative-lowering.test.ts`, `engine-default.test.ts`, `evaluate.test.ts`, `gl4-butcher-tableau.test.ts`, `gl4-integrator.test.ts`, `gl4-stage-solver.test.ts`, `lowering-covariant-dead-else.test.ts`, `lowering-deferred-arms.test.ts`, `lowering-strategy-cast.test.ts`, `metric-inverse-curvature-walk.test.ts`, `metric-inverse.test.ts`, `perihelion-finder-roundtrip.test.ts`, `riemann-tensor-lowering.test.ts`, `tensor.test.ts` |
| `numerical/grid-field.ts` | `public-surface.test.ts`, `covariant-derivative-preview.test.ts`, `duplicate-coord-warning.test.ts`, `einstein.test.ts`, `minkowski-curvature.test.ts`, `ricci.test.ts`, `be37-covariant-eikonal-real.test.ts`, `be37-shapiro-step-sweep.test.ts`, `correctness.test.ts`, `covariant-derivative-lowering.test.ts`, `engine-default.test.ts`, `evaluate.test.ts`, `lowering-covariant-dead-else.test.ts`, `lowering-deferred-arms.test.ts`, `lowering-strategy-cast.test.ts`, `metric-inverse-curvature-walk.test.ts`, `metric-inverse.test.ts`, `pderiv.test.ts`, `riemann-tensor-lowering.test.ts`, `tensor.test.ts` |
| `numerical/index.ts` | `public-surface.test.ts`, `covariant-derivative-preview.test.ts`, `duplicate-coord-warning.test.ts`, `einstein.test.ts`, `minkowski-curvature.test.ts`, `ricci.test.ts`, `be37-covariant-eikonal-real.test.ts`, `be37-shapiro-step-sweep.test.ts`, `correctness.test.ts`, `covariant-derivative-lowering.test.ts`, `engine-default.test.ts`, `evaluate.test.ts`, `lowering-covariant-dead-else.test.ts`, `lowering-deferred-arms.test.ts`, `lowering-strategy-cast.test.ts`, `metric-inverse-curvature-walk.test.ts`, `metric-inverse.test.ts`, `riemann-tensor-lowering.test.ts`, `tensor.test.ts` |
| `numerical/killing.ts` | `public-surface.test.ts`, `conserved-charge-mercury.test.ts`, `killing-schwarzschild.test.ts`, `tensor.test.ts` |
| `numerical/klein-gordon.ts` | `public-surface.test.ts`, `klein-gordon.test.ts`, `tensor.test.ts` |
| `numerical/kretschmann.ts` | `public-surface.test.ts`, `kretschmann-factored-raising.test.ts`, `kretschmann-horizon.test.ts`, `kretschmann-schwarzschild.test.ts`, `painleve-gullstrand-curvature.test.ts`, `tensor.test.ts` |
| `numerical/lowering.ts` | `lowering-contract.test.ts`, `lowering-covariant-guard.test.ts`, `lowering-deferred-arms.test.ts` |
| `numerical/null-ray-integrator.ts` | `null-ray-integrator.test.ts` |
| `numerical/painleve-gullstrand-metric.ts` | `kretschmann-factored-raising.test.ts`, `painleve-gullstrand-curvature.test.ts` |
| `numerical/pderiv.ts` | `metric-deriv-supplied.test.ts`, `pderiv-flatten-consolidation.test.ts`, `pderiv-order-default.test.ts`, `pderiv-order.test.ts`, `pderiv.test.ts` |
| `numerical/perihelion-finder.ts` | `public-surface.test.ts`, `perihelion-precession.test.ts`, `covariant-derivative-preview.test.ts`, `duplicate-coord-warning.test.ts`, `einstein.test.ts`, `minkowski-curvature.test.ts`, `ricci.test.ts`, `be37-covariant-eikonal-real.test.ts`, `be37-shapiro-step-sweep.test.ts`, `correctness.test.ts`, `covariant-derivative-lowering.test.ts`, `engine-default.test.ts`, `evaluate.test.ts`, `lowering-covariant-dead-else.test.ts`, `lowering-deferred-arms.test.ts`, `lowering-strategy-cast.test.ts`, `metric-inverse-curvature-walk.test.ts`, `metric-inverse.test.ts`, `perihelion-finder-roundtrip.test.ts`, `perihelion-finder.test.ts`, `riemann-tensor-lowering.test.ts`, `tensor.test.ts` |
| `numerical/strides.ts` | `strides.test.ts` |
| `numerical/tensor-engine.ts` | `public-surface.test.ts`, `bridge-gradient.test.ts`, `covariant-derivative-preview.test.ts`, `duplicate-coord-warning.test.ts`, `einstein.test.ts`, `minkowski-curvature.test.ts`, `ricci.test.ts`, `be37-covariant-eikonal-real.test.ts`, `be37-shapiro-step-sweep.test.ts`, `correctness.test.ts`, `covariant-derivative-lowering.test.ts`, `einsum-precompute.test.ts`, `engine-capability.test.ts`, `engine-default.test.ts`, `evaluate.test.ts`, `float64-autograd.test.ts`, `lowering-covariant-dead-else.test.ts`, `lowering-deferred-arms.test.ts`, `lowering-strategy-cast.test.ts`, `mathts-autograd.test.ts`, `mathts-engine-typing.test.ts`, `metric-inverse-curvature-walk.test.ts`, `metric-inverse.test.ts`, `riemann-tensor-lowering.test.ts`, `tensor-engine-types.test.ts`, `tensor.test.ts` |
| `numerical/types.ts` | `public-surface.test.ts`, `covariant-derivative-preview.test.ts`, `duplicate-coord-warning.test.ts`, `einstein.test.ts`, `minkowski-curvature.test.ts`, `ricci.test.ts`, `be37-covariant-eikonal-real.test.ts`, `be37-shapiro-step-sweep.test.ts`, `connection-lowering-helpers.test.ts`, `correctness.test.ts`, `covariant-derivative-lowering.test.ts`, `engine-default.test.ts`, `evaluate.test.ts`, `lowering-contract.test.ts`, `lowering-covariant-dead-else.test.ts`, `lowering-covariant-guard.test.ts`, `lowering-deferred-arms.test.ts`, `lowering-strategy-cast.test.ts`, `metric-inverse-curvature-walk.test.ts`, `metric-inverse.test.ts`, `riemann-tensor-lowering.test.ts`, `tensor-engine-types.test.ts`, `tensor.test.ts` |
| `numerical/weyl-lowering.ts` | `weyl-kerr-schild.test.ts`, `weyl-schwarzschild.test.ts` |

---

## Test File Details

| Test File | Imports from Source |
|-----------|---------------------|
| `api/public-surface.test.ts` | 73 files |
| `api/public-tag-vs-index-invariant.test.ts` | 0 files |
| `bridges/be-11-fix.test.ts` | 16 files |
| `bridges/be-12-encoding.test.ts` | 14 files |
| `bridges/be-12-reformulation.test.ts` | 0 files |
| `bridges/be-13-encoding.test.ts` | 14 files |
| `bridges/be-13-reformulation.test.ts` | 0 files |
| `bridges/be-14-ryu-takayanagi.test.ts` | 17 files |
| `bridges/be-15-encoding.test.ts` | 13 files |
| `bridges/be-15-reformulation.test.ts` | 0 files |
| `bridges/be-16-landauer-encoding.test.ts` | 13 files |
| `bridges/be-17-encoding.test.ts` | 13 files |
| `bridges/be-17-reformulation.test.ts` | 0 files |
| `bridges/be-17-structural.test.ts` | 11 files |
| `bridges/be-18-encoding.test.ts` | 12 files |
| `bridges/be-18-fix.test.ts` | 3 files |
| `bridges/be-19-encoding.test.ts` | 14 files |
| `bridges/be-20-encoding.test.ts` | 12 files |
| `bridges/be-21-encoding.test.ts` | 12 files |
| `bridges/be-22-encoding.test.ts` | 13 files |
| `bridges/be-23-encoding.test.ts` | 13 files |
| `bridges/be-23-reformulation.test.ts` | 0 files |
| `bridges/be-24-encoding.test.ts` | 12 files |
| `bridges/be-24-reformulation.test.ts` | 0 files |
| `bridges/be-25-encoding.test.ts` | 13 files |
| `bridges/be-25-iit-encoding.test.ts` | 12 files |
| `bridges/be-25-reformulation.test.ts` | 0 files |
| `bridges/be-26-encoding.test.ts` | 12 files |
| `bridges/be-27-encoding.test.ts` | 13 files |
| `bridges/be-28-onsager-encoding.test.ts` | 11 files |
| `bridges/be-29-encoding.test.ts` | 13 files |
| `bridges/be-29-fix.test.ts` | 3 files |
| `bridges/be-30-encoding.test.ts` | 12 files |
| `bridges/be-30-reformulation.test.ts` | 0 files |
| `bridges/be-31-encoding.test.ts` | 12 files |
| `bridges/be-31-reformulation.test.ts` | 0 files |
| `bridges/be-32-encoding.test.ts` | 12 files |
| `bridges/be-33-encoding.test.ts` | 12 files |
| `bridges/be-33-reformulation.test.ts` | 0 files |
| `bridges/be-34-encoding.test.ts` | 13 files |
| `bridges/be-35-encoding.test.ts` | 13 files |
| `bridges/be-36-encoding.test.ts` | 13 files |
| `bridges/be-36-reformulation.test.ts` | 0 files |
| `bridges/be-37-numerical-eikonal.test.ts` | 1 files |
| `bridges/be-37-r3-disposition.test.ts` | 0 files |
| `bridges/be-37-shapiro-eikonal-structural.test.ts` | 12 files |
| `bridges/be-37-shapiro-encoding.test.ts` | 13 files |
| `bridges/be-38-encoding.test.ts` | 12 files |
| `bridges/be-38-reformulation.test.ts` | 0 files |
| `bridges/be-39-encoding.test.ts` | 13 files |
| `bridges/be-40-encoding.test.ts` | 13 files |
| `bridges/be-41-encoding.test.ts` | 12 files |
| `bridges/be-42-encoding.test.ts` | 13 files |
| `bridges/be-43-encoding.test.ts` | 13 files |
| `bridges/be-43-reformulation.test.ts` | 0 files |
| `bridges/be-44-encoding.test.ts` | 12 files |
| `bridges/be-45-encoding.test.ts` | 12 files |
| `bridges/be-46-encoding.test.ts` | 12 files |
| `bridges/be-47-encoding.test.ts` | 12 files |
| `bridges/be-47-fix.test.ts` | 3 files |
| `bridges/be-48-encoding.test.ts` | 12 files |
| `bridges/be-48-fix.test.ts` | 3 files |
| `bridges/be-49-encoding.test.ts` | 12 files |
| `bridges/be-50-encoding.test.ts` | 11 files |
| `bridges/be-50-reformulation.test.ts` | 0 files |
| `bridges/be-51-gravitational-lensing-structural.test.ts` | 0 files |
| `bridges/be-52-perihelion-precession-structural.test.ts` | 0 files |
| `bridges/be-53-encoding.test.ts` | 13 files |
| `bridges/be-54-encoding.test.ts` | 14 files |
| `bridges/be23-planckian-confrontation.test.ts` | 3 files |
| `bridges/be36-gw170817-confrontation.test.ts` | 2 files |
| `bridges/catalog-adapter.test.ts` | 6 files |
| `bridges/catalog-integrity.test.ts` | 3 files |
| `bridges/catalog-json.test.ts` | 3 files |
| `bridges/confrontation-coverage.test.ts` | 1 files |
| `bridges/dimensional-signature-catalog.test.ts` | 56 files |
| `equations/_be-helpers.test.ts` | 12 files |
| `bridges/gravitational-lensing.test.ts` | 2 files |
| `bridges/membership.test.ts` | 5 files |
| `bridges/orphan-dimensional-signature.test.ts` | 3 files |
| `bridges/perihelion-precession-labeled.test.ts` | 6 files |
| `bridges/perihelion-precession.test.ts` | 4 files |
| `bridges/public-api-stability.test.ts` | 3 files |
| `bridges/spec-vs-index.test.ts` | 3 files |
| `tests/bridges-index.test.ts` | 3 files |
| `composition/bridge-prediction.test.ts` | 19 files |
| `composition/bridge-priority.test.ts` | 17 files |
| `composition/calibration-targets.test.ts` | 19 files |
| `composition/catalog-full.test.ts` | 21 files |
| `composition/catalog-tranche.test.ts` | 20 files |
| `composition/compose-properties.test.ts` | 17 files |
| `composition/compose.test.ts` | 17 files |
| `composition/discovery.test.ts` | 19 files |
| `composition/enumerate-uncertainty.test.ts` | 19 files |
| `composition/explain.test.ts` | 17 files |
| `composition/identifiability.test.ts` | 17 files |
| `composition/link-candidates.test.ts` | 17 files |
| `composition/linkage-map.test.ts` | 17 files |
| `composition/namespacing.test.ts` | 18 files |
| `composition/orphan-connectors.test.ts` | 17 files |
| `composition/quantities.test.ts` | 17 files |
| `composition/retrodiction.test.ts` | 17 files |
| `composition/stress-tests.test.ts` | 16 files |
| `composition/symbolic-composition.test.ts` | 30 files |
| `composition/symbolic-simplification.test.ts` | 16 files |
| `core/addCell.test.ts` | 3 files |
| `core/axes-registry.test.ts` | 1 files |
| `core/cell.test.ts` | 1 files |
| `core/constants.test.ts` | 1 files |
| `core/flux-rules.test.ts` | 2 files |
| `core/labeled-tensor.test.ts` | 4 files |
| `core/populated-cells.test.ts` | 4 files |
| `core/regime-registry.test.ts` | 1 files |
| `core/universal-index.test.ts` | 1 files |
| `diff/bridge-gradient.test.ts` | 5 files |
| `dimensional/algebra-properties.test.ts` | 2 files |
| `dimensional/algebra.test.ts` | 2 files |
| `dimensional/bianchi-residual.test.ts` | 14 files |
| `dimensional/bridge-check.test.ts` | 21 files |
| `dimensional/bridge-derivation-audit.test.ts` | 17 files |
| `dimensional/buckingham.test.ts` | 2 files |
| `dimensional/christoffel-helper.test.ts` | 13 files |
| `dimensional/connection-validators.test.ts` | 13 files |
| `dimensional/constants-surface.test.ts` | 1 files |
| `dimensional/cosmological-constant.test.ts` | 10 files |
| `dimensional/covariant-derivative-node.test.ts` | 12 files |
| `dimensional/covariant-derivative-preview.test.ts` | 24 files |
| `dimensional/curvature-composite-factory.test.ts` | 1 files |
| `dimensional/curvature-invariants.test.ts` | 10 files |
| `dimensional/derivation-benchmark.test.ts` | 2 files |
| `dimensional/derivative-strategy-field.test.ts` | 3 files |
| `dimensional/derivative-strategy-propagation.test.ts` | 3 files |
| `dimensional/dimension-spec.test.ts` | 2 files |
| `dimensional/duplicate-coord-warning.test.ts` | 23 files |
| `dimensional/einstein-equation.test.ts` | 8 files |
| `dimensional/einstein.test.ts` | 23 files |
| `dimensional/equation-valence.test.ts` | 11 files |
| `dimensional/error-message-discoverability.test.ts` | 1 files |
| `dimensional/field-equation-helpers.test.ts` | 2 files |
| `dimensional/fresh-label.test.ts` | 1 files |
| `dimensional/friedmann-equation.test.ts` | 3 files |
| `dimensional/gauge-field.test.ts` | 2 files |
| `dimensional/integral-derivative-tensor.test.ts` | 11 files |
| `dimensional/killing-validators.test.ts` | 10 files |
| `dimensional/klein-gordon-equation.test.ts` | 2 files |
| `dimensional/kronecker-delta.test.ts` | 12 files |
| `dimensional/metric-ast-serialization.test.ts` | 12 files |
| `dimensional/metric-helpers.test.ts` | 3 files |
| `dimensional/metric-tensor.test.ts` | 12 files |
| `dimensional/metric-validation-errors.test.ts` | 1 files |
| `dimensional/minkowski-curvature.test.ts` | 23 files |
| `dimensional/numerical-form-field.test.ts` | 2 files |
| `dimensional/numerical-form-preservation.test.ts` | 12 files |
| `dimensional/op-tensor-interactions.test.ts` | 11 files |
| `dimensional/part-viii-spec-vs-impl.test.ts` | 0 files |
| `dimensional/raise-lower.test.ts` | 13 files |
| `dimensional/rg-flow.test.ts` | 12 files |
| `dimensional/ricci.test.ts` | 23 files |
| `dimensional/riemann-tensor.test.ts` | 12 files |
| `dimensional/stress-energy-validators.test.ts` | 10 files |
| `dimensional/symbolic-exponent.test.ts` | 29 files |
| `dimensional/tensor-ast-serialization.test.ts` | 10 files |
| `dimensional/tensor-helpers.test.ts` | 10 files |
| `dimensional/tensor-node-types.test.ts` | 11 files |
| `dimensional/tensor-partial-derivative.test.ts` | 13 files |
| `dimensional/tensor-product.test.ts` | 11 files |
| `dimensional/tensor-spec-vs-impl.test.ts` | 0 files |
| `dimensional/tensor-step-c.test.ts` | 11 files |
| `dimensional/tensor-symbol.test.ts` | 11 files |
| `dimensional/tensor-trace.test.ts` | 3 files |
| `dimensional/uptError.test.ts` | 1 files |
| `dimensional/validation-result-shape.test.ts` | 10 files |
| `dimensional/validator-probe-ctx.test.ts` | 11 files |
| `dimensional/validator.test.ts` | 12 files |
| `dimensional/violation-severity.test.ts` | 11 files |
| `dimensional/weyl-validators.test.ts` | 11 files |
| `fixtures/perfect-fluid.test.ts` | 1 files |
| `fixtures/schwarzschild-riemann.test.ts` | 3 files |
| `fixtures/schwarzschild.test.ts` | 1 files |
| `numerical/be37-covariant-eikonal-real.test.ts` | 11 files |
| `numerical/be37-shapiro-step-sweep.test.ts` | 12 files |
| `numerical/christoffel-flat-indexing.test.ts` | 1 files |
| `numerical/christoffel-flat.test.ts` | 1 files |
| `numerical/christoffel-precompute.test.ts` | 2 files |
| `numerical/connection-lowering-helpers.test.ts` | 2 files |
| `numerical/conserved-charge-mercury.test.ts` | 3 files |
| `numerical/correctness.test.ts` | 22 files |
| `numerical/covariant-derivative-lowering.test.ts` | 11 files |
| `numerical/einstein-desitter.test.ts` | 2 files |
| `numerical/einstein-flrw.test.ts` | 2 files |
| `numerical/einstein-vacuum-schwarzschild.test.ts` | 2 files |
| `numerical/einsum-precompute.test.ts` | 2 files |
| `numerical/einsum-properties.test.ts` | 1 files |
| `numerical/engine-capability.test.ts` | 2 files |
| `numerical/engine-conformance.float64.test.ts` | 1 files |
| `numerical/engine-conformance.mathts.test.ts` | 0 files |
| `numerical/engine-conformance.test.ts` | 1 files |
| `numerical/engine-default.test.ts` | 11 files |
| `numerical/errors.test.ts` | 2 files |
| `numerical/evaluate.test.ts` | 22 files |
| `numerical/flatten-na-accuracy.test.ts` | 1 files |
| `numerical/float64-autograd.test.ts` | 2 files |
| `numerical/float64-engine-ad-dispatch.test.ts` | 1 files |
| `numerical/foreach-multi-index.test.ts` | 2 files |
| `numerical/formula-conformance.builtin.test.ts` | 1 files |
| `numerical/formula-conformance.mathts.test.ts` | 0 files |
| `numerical/formula-dimension.test.ts` | 2 files |
| `numerical/formula-mathts.test.ts` | 0 files |
| `numerical/formula-registry.test.ts` | 1 files |
| `numerical/formula.test.ts` | 1 files |
| `numerical/geometrized.test.ts` | 3 files |
| `numerical/gl4-butcher-tableau.test.ts` | 1 files |
| `numerical/gl4-integrator.test.ts` | 2 files |
| `numerical/gl4-stage-solver.test.ts` | 1 files |
| `numerical/killing-schwarzschild.test.ts` | 2 files |
| `numerical/klein-gordon.test.ts` | 2 files |
| `numerical/kretschmann-factored-raising.test.ts` | 4 files |
| `numerical/kretschmann-horizon.test.ts` | 4 files |
| `numerical/kretschmann-schwarzschild.test.ts` | 4 files |
| `numerical/lowering-contract.test.ts` | 14 files |
| `numerical/lowering-covariant-dead-else.test.ts` | 11 files |
| `numerical/lowering-covariant-guard.test.ts` | 15 files |
| `numerical/lowering-deferred-arms.test.ts` | 22 files |
| `numerical/lowering-strategy-cast.test.ts` | 12 files |
| `numerical/mathts-autograd.test.ts` | 1 files |
| `numerical/mathts-engine-typing.test.ts` | 2 files |
| `numerical/metric-deriv-supplied.test.ts` | 1 files |
| `numerical/metric-inverse-curvature-walk.test.ts` | 23 files |
| `numerical/metric-inverse.test.ts` | 22 files |
| `numerical/null-ray-integrator.test.ts` | 1 files |
| `numerical/painleve-gullstrand-curvature.test.ts` | 5 files |
| `numerical/pderiv-flatten-consolidation.test.ts` | 1 files |
| `numerical/pderiv-order-default.test.ts` | 1 files |
| `numerical/pderiv-order.test.ts` | 1 files |
| `numerical/pderiv.test.ts` | 2 files |
| `numerical/perihelion-finder-roundtrip.test.ts` | 2 files |
| `numerical/perihelion-finder.test.ts` | 1 files |
| `numerical/riemann-tensor-lowering.test.ts` | 23 files |
| `numerical/schwarzschild-radial-geodesic.test.ts` | 2 files |
| `numerical/strides.test.ts` | 1 files |
| `numerical/tensor-engine-types.test.ts` | 2 files |
| `numerical/weyl-kerr-schild.test.ts` | 2 files |
| `numerical/weyl-schwarzschild.test.ts` | 4 files |
| `tests/tensor.test.ts` | 73 files |
