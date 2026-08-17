# Test Coverage Analysis


## Summary

| Metric | Count |
|--------|-------|
| Total Source Files | 263 |
| Total Test Files | 353 |
| Source Files with Tests | 259 |
| Source Files without Tests | 4 |
| Coverage | 98.5% |

---

## Source Files Without Test Coverage

The following 4 source files are not directly imported by any test file:

### canonical/

- `src/canonical/entries/_l1-build.ts` → Expected test: `tests/unit/canonical/_l1-build.test.ts`

### cli/

- `src/cli/commands/_discovery-opts.ts` → Expected test: `tests/unit/cli/_discovery-opts.test.ts`

### composition/

- `src/composition/edges/_catalog-helpers.ts` → Expected test: `tests/unit/composition/_catalog-helpers.test.ts`
- `src/composition/quantities/_dims.ts` → Expected test: `tests/unit/composition/_dims.test.ts`

---

## Source Files With Test Coverage

| Source File | Test Files |
|-------------|------------|
| `bridges/be11-decoherence-confrontation.ts` | `public-surface.test.ts`, `be11-decoherence-confrontation.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `tensor.test.ts` |
| `bridges/be21-kss-confrontation.ts` | `public-surface.test.ts`, `be21-kss-confrontation.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `tensor.test.ts` |
| `bridges/be23-planckian-confrontation.ts` | `public-surface.test.ts`, `be23-planckian-confrontation.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `tensor.test.ts` |
| `bridges/be35-bootstrap-confrontation.ts` | `public-surface.test.ts`, `be35-bootstrap-confrontation.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `tensor.test.ts` |
| `bridges/be36-gw170817-confrontation.ts` | `public-surface.test.ts`, `be36-gw170817-confrontation.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `enumerate-uncertainty.test.ts`, `tensor.test.ts` |
| `bridges/be37-cassini-confrontation.ts` | `public-surface.test.ts`, `be37-cassini.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `tensor.test.ts` |
| `bridges/be48-collapse-confrontation.ts` | `public-surface.test.ts`, `be48-collapse.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `tensor.test.ts` |
| `bridges/be51-lensing-confrontation.ts` | `public-surface.test.ts`, `be51-lensing-confrontation.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `tensor.test.ts` |
| `bridges/be52-mercury-confrontation.ts` | `public-surface.test.ts`, `be52-mercury-confrontation.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `tensor.test.ts` |
| `bridges/be55-quantum-hall-confrontation.ts` | `public-surface.test.ts`, `be-55-quantum-hall.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `tensor.test.ts` |
| `bridges/be55-quantum-hall.ts` | `public-surface.test.ts`, `be-11-fix.test.ts`, `be-14-ryu-takayanagi.test.ts`, `be-18-fix.test.ts`, `be-29-fix.test.ts`, `be-47-fix.test.ts`, `be-48-fix.test.ts`, `be-55-quantum-hall.test.ts`, `be-56-casimir.test.ts`, `be-57-unruh.test.ts`, `be-58-johnson-nyquist.test.ts`, `be-59-ac-josephson.test.ts`, `be-60-fractional-qh.test.ts`, `be-61-wiedemann-franz.test.ts`, `be-62-bcs-gap.test.ts`, `be-63-chandrasekhar-mass.test.ts`, `be-64-eddington-luminosity.test.ts`, `be-65-jeans-mass.test.ts`, `bridge-equations-facade.test.ts`, `catalog-adapter.test.ts`, `catalog-integrity.test.ts`, `catalog-json.test.ts`, `confrontation-registry.test.ts`, `descriptor-consistency.test.ts`, `dimensional-signature-catalog.test.ts`, `membership.test.ts`, `orphan-dimensional-signature.test.ts`, `public-api-stability.test.ts`, `spec-vs-index.test.ts`, `bridges-index.test.ts`, `invariants.test.ts`, `graphs.test.ts`, `catalog-full.test.ts`, `catalog-tranche.test.ts`, `proposed-bridges.test.ts`, `tensor.test.ts` |
| `bridges/be56-casimir-confrontation.ts` | `public-surface.test.ts`, `be-56-casimir.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `tensor.test.ts` |
| `bridges/be56-casimir.ts` | `public-surface.test.ts`, `be-11-fix.test.ts`, `be-14-ryu-takayanagi.test.ts`, `be-18-fix.test.ts`, `be-29-fix.test.ts`, `be-47-fix.test.ts`, `be-48-fix.test.ts`, `be-55-quantum-hall.test.ts`, `be-56-casimir.test.ts`, `be-57-unruh.test.ts`, `be-58-johnson-nyquist.test.ts`, `be-59-ac-josephson.test.ts`, `be-60-fractional-qh.test.ts`, `be-61-wiedemann-franz.test.ts`, `be-62-bcs-gap.test.ts`, `be-63-chandrasekhar-mass.test.ts`, `be-64-eddington-luminosity.test.ts`, `be-65-jeans-mass.test.ts`, `bridge-equations-facade.test.ts`, `catalog-adapter.test.ts`, `catalog-integrity.test.ts`, `catalog-json.test.ts`, `confrontation-registry.test.ts`, `descriptor-consistency.test.ts`, `dimensional-signature-catalog.test.ts`, `membership.test.ts`, `orphan-dimensional-signature.test.ts`, `public-api-stability.test.ts`, `spec-vs-index.test.ts`, `bridges-index.test.ts`, `invariants.test.ts`, `graphs.test.ts`, `catalog-full.test.ts`, `catalog-tranche.test.ts`, `proposed-bridges.test.ts`, `tensor.test.ts` |
| `bridges/be57-unruh.ts` | `public-surface.test.ts`, `be-11-fix.test.ts`, `be-14-ryu-takayanagi.test.ts`, `be-18-fix.test.ts`, `be-29-fix.test.ts`, `be-47-fix.test.ts`, `be-48-fix.test.ts`, `be-55-quantum-hall.test.ts`, `be-56-casimir.test.ts`, `be-57-unruh.test.ts`, `be-58-johnson-nyquist.test.ts`, `be-59-ac-josephson.test.ts`, `be-60-fractional-qh.test.ts`, `be-61-wiedemann-franz.test.ts`, `be-62-bcs-gap.test.ts`, `be-63-chandrasekhar-mass.test.ts`, `be-64-eddington-luminosity.test.ts`, `be-65-jeans-mass.test.ts`, `bridge-equations-facade.test.ts`, `catalog-adapter.test.ts`, `catalog-integrity.test.ts`, `catalog-json.test.ts`, `confrontation-registry.test.ts`, `descriptor-consistency.test.ts`, `dimensional-signature-catalog.test.ts`, `membership.test.ts`, `orphan-dimensional-signature.test.ts`, `public-api-stability.test.ts`, `spec-vs-index.test.ts`, `bridges-index.test.ts`, `invariants.test.ts`, `graphs.test.ts`, `catalog-full.test.ts`, `catalog-tranche.test.ts`, `proposed-bridges.test.ts`, `tensor.test.ts` |
| `bridges/be58-johnson-nyquist-confrontation.ts` | `public-surface.test.ts`, `be-58-johnson-nyquist.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `tensor.test.ts` |
| `bridges/be58-johnson-nyquist.ts` | `public-surface.test.ts`, `be-11-fix.test.ts`, `be-14-ryu-takayanagi.test.ts`, `be-18-fix.test.ts`, `be-29-fix.test.ts`, `be-47-fix.test.ts`, `be-48-fix.test.ts`, `be-55-quantum-hall.test.ts`, `be-56-casimir.test.ts`, `be-57-unruh.test.ts`, `be-58-johnson-nyquist.test.ts`, `be-59-ac-josephson.test.ts`, `be-60-fractional-qh.test.ts`, `be-61-wiedemann-franz.test.ts`, `be-62-bcs-gap.test.ts`, `be-63-chandrasekhar-mass.test.ts`, `be-64-eddington-luminosity.test.ts`, `be-65-jeans-mass.test.ts`, `bridge-equations-facade.test.ts`, `catalog-adapter.test.ts`, `catalog-integrity.test.ts`, `catalog-json.test.ts`, `confrontation-registry.test.ts`, `descriptor-consistency.test.ts`, `dimensional-signature-catalog.test.ts`, `membership.test.ts`, `orphan-dimensional-signature.test.ts`, `public-api-stability.test.ts`, `spec-vs-index.test.ts`, `bridges-index.test.ts`, `invariants.test.ts`, `graphs.test.ts`, `catalog-full.test.ts`, `catalog-tranche.test.ts`, `proposed-bridges.test.ts`, `tensor.test.ts` |
| `bridges/be59-ac-josephson-confrontation.ts` | `public-surface.test.ts`, `be-59-ac-josephson.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `tensor.test.ts` |
| `bridges/be59-ac-josephson.ts` | `public-surface.test.ts`, `be-11-fix.test.ts`, `be-14-ryu-takayanagi.test.ts`, `be-18-fix.test.ts`, `be-29-fix.test.ts`, `be-47-fix.test.ts`, `be-48-fix.test.ts`, `be-55-quantum-hall.test.ts`, `be-56-casimir.test.ts`, `be-57-unruh.test.ts`, `be-58-johnson-nyquist.test.ts`, `be-59-ac-josephson.test.ts`, `be-60-fractional-qh.test.ts`, `be-61-wiedemann-franz.test.ts`, `be-62-bcs-gap.test.ts`, `be-63-chandrasekhar-mass.test.ts`, `be-64-eddington-luminosity.test.ts`, `be-65-jeans-mass.test.ts`, `bridge-equations-facade.test.ts`, `catalog-adapter.test.ts`, `catalog-integrity.test.ts`, `catalog-json.test.ts`, `confrontation-registry.test.ts`, `descriptor-consistency.test.ts`, `dimensional-signature-catalog.test.ts`, `membership.test.ts`, `orphan-dimensional-signature.test.ts`, `public-api-stability.test.ts`, `spec-vs-index.test.ts`, `bridges-index.test.ts`, `invariants.test.ts`, `graphs.test.ts`, `catalog-full.test.ts`, `catalog-tranche.test.ts`, `proposed-bridges.test.ts`, `tensor.test.ts` |
| `bridges/be60-fractional-qh-confrontation.ts` | `public-surface.test.ts`, `be-60-fractional-qh.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `tensor.test.ts` |
| `bridges/be60-fractional-qh.ts` | `public-surface.test.ts`, `be-11-fix.test.ts`, `be-14-ryu-takayanagi.test.ts`, `be-18-fix.test.ts`, `be-29-fix.test.ts`, `be-47-fix.test.ts`, `be-48-fix.test.ts`, `be-55-quantum-hall.test.ts`, `be-56-casimir.test.ts`, `be-57-unruh.test.ts`, `be-58-johnson-nyquist.test.ts`, `be-59-ac-josephson.test.ts`, `be-60-fractional-qh.test.ts`, `be-61-wiedemann-franz.test.ts`, `be-62-bcs-gap.test.ts`, `be-63-chandrasekhar-mass.test.ts`, `be-64-eddington-luminosity.test.ts`, `be-65-jeans-mass.test.ts`, `bridge-equations-facade.test.ts`, `catalog-adapter.test.ts`, `catalog-integrity.test.ts`, `catalog-json.test.ts`, `confrontation-registry.test.ts`, `descriptor-consistency.test.ts`, `dimensional-signature-catalog.test.ts`, `membership.test.ts`, `orphan-dimensional-signature.test.ts`, `public-api-stability.test.ts`, `spec-vs-index.test.ts`, `bridges-index.test.ts`, `invariants.test.ts`, `graphs.test.ts`, `catalog-full.test.ts`, `catalog-tranche.test.ts`, `proposed-bridges.test.ts`, `tensor.test.ts` |
| `bridges/be61-wiedemann-franz-confrontation.ts` | `public-surface.test.ts`, `be-61-wiedemann-franz.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `tensor.test.ts` |
| `bridges/be61-wiedemann-franz.ts` | `public-surface.test.ts`, `be-11-fix.test.ts`, `be-14-ryu-takayanagi.test.ts`, `be-18-fix.test.ts`, `be-29-fix.test.ts`, `be-47-fix.test.ts`, `be-48-fix.test.ts`, `be-55-quantum-hall.test.ts`, `be-56-casimir.test.ts`, `be-57-unruh.test.ts`, `be-58-johnson-nyquist.test.ts`, `be-59-ac-josephson.test.ts`, `be-60-fractional-qh.test.ts`, `be-61-wiedemann-franz.test.ts`, `be-62-bcs-gap.test.ts`, `be-63-chandrasekhar-mass.test.ts`, `be-64-eddington-luminosity.test.ts`, `be-65-jeans-mass.test.ts`, `bridge-equations-facade.test.ts`, `catalog-adapter.test.ts`, `catalog-integrity.test.ts`, `catalog-json.test.ts`, `confrontation-registry.test.ts`, `descriptor-consistency.test.ts`, `dimensional-signature-catalog.test.ts`, `membership.test.ts`, `orphan-dimensional-signature.test.ts`, `public-api-stability.test.ts`, `spec-vs-index.test.ts`, `bridges-index.test.ts`, `invariants.test.ts`, `graphs.test.ts`, `catalog-full.test.ts`, `catalog-tranche.test.ts`, `proposed-bridges.test.ts`, `tensor.test.ts` |
| `bridges/be62-bcs-gap-confrontation.ts` | `public-surface.test.ts`, `be-62-bcs-gap.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `tensor.test.ts` |
| `bridges/be62-bcs-gap.ts` | `public-surface.test.ts`, `be-11-fix.test.ts`, `be-14-ryu-takayanagi.test.ts`, `be-18-fix.test.ts`, `be-29-fix.test.ts`, `be-47-fix.test.ts`, `be-48-fix.test.ts`, `be-55-quantum-hall.test.ts`, `be-56-casimir.test.ts`, `be-57-unruh.test.ts`, `be-58-johnson-nyquist.test.ts`, `be-59-ac-josephson.test.ts`, `be-60-fractional-qh.test.ts`, `be-61-wiedemann-franz.test.ts`, `be-62-bcs-gap.test.ts`, `be-63-chandrasekhar-mass.test.ts`, `be-64-eddington-luminosity.test.ts`, `be-65-jeans-mass.test.ts`, `bridge-equations-facade.test.ts`, `catalog-adapter.test.ts`, `catalog-integrity.test.ts`, `catalog-json.test.ts`, `confrontation-registry.test.ts`, `descriptor-consistency.test.ts`, `dimensional-signature-catalog.test.ts`, `membership.test.ts`, `orphan-dimensional-signature.test.ts`, `public-api-stability.test.ts`, `spec-vs-index.test.ts`, `bridges-index.test.ts`, `invariants.test.ts`, `graphs.test.ts`, `catalog-full.test.ts`, `catalog-tranche.test.ts`, `proposed-bridges.test.ts`, `tensor.test.ts` |
| `bridges/be63-chandrasekhar-mass-confrontation.ts` | `public-surface.test.ts`, `be-63-chandrasekhar-mass.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `tensor.test.ts` |
| `bridges/be63-chandrasekhar-mass.ts` | `public-surface.test.ts`, `be-11-fix.test.ts`, `be-14-ryu-takayanagi.test.ts`, `be-18-fix.test.ts`, `be-29-fix.test.ts`, `be-47-fix.test.ts`, `be-48-fix.test.ts`, `be-55-quantum-hall.test.ts`, `be-56-casimir.test.ts`, `be-57-unruh.test.ts`, `be-58-johnson-nyquist.test.ts`, `be-59-ac-josephson.test.ts`, `be-60-fractional-qh.test.ts`, `be-61-wiedemann-franz.test.ts`, `be-62-bcs-gap.test.ts`, `be-63-chandrasekhar-mass.test.ts`, `be-64-eddington-luminosity.test.ts`, `be-65-jeans-mass.test.ts`, `bridge-equations-facade.test.ts`, `catalog-adapter.test.ts`, `catalog-integrity.test.ts`, `catalog-json.test.ts`, `confrontation-registry.test.ts`, `descriptor-consistency.test.ts`, `dimensional-signature-catalog.test.ts`, `membership.test.ts`, `orphan-dimensional-signature.test.ts`, `public-api-stability.test.ts`, `spec-vs-index.test.ts`, `bridges-index.test.ts`, `invariants.test.ts`, `graphs.test.ts`, `catalog-full.test.ts`, `catalog-tranche.test.ts`, `proposed-bridges.test.ts`, `tensor.test.ts` |
| `bridges/be64-eddington-luminosity-confrontation.ts` | `public-surface.test.ts`, `be-64-eddington-luminosity.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `tensor.test.ts` |
| `bridges/be64-eddington-luminosity.ts` | `public-surface.test.ts`, `be-11-fix.test.ts`, `be-14-ryu-takayanagi.test.ts`, `be-18-fix.test.ts`, `be-29-fix.test.ts`, `be-47-fix.test.ts`, `be-48-fix.test.ts`, `be-55-quantum-hall.test.ts`, `be-56-casimir.test.ts`, `be-57-unruh.test.ts`, `be-58-johnson-nyquist.test.ts`, `be-59-ac-josephson.test.ts`, `be-60-fractional-qh.test.ts`, `be-61-wiedemann-franz.test.ts`, `be-62-bcs-gap.test.ts`, `be-63-chandrasekhar-mass.test.ts`, `be-64-eddington-luminosity.test.ts`, `be-65-jeans-mass.test.ts`, `bridge-equations-facade.test.ts`, `catalog-adapter.test.ts`, `catalog-integrity.test.ts`, `catalog-json.test.ts`, `confrontation-registry.test.ts`, `descriptor-consistency.test.ts`, `dimensional-signature-catalog.test.ts`, `membership.test.ts`, `orphan-dimensional-signature.test.ts`, `public-api-stability.test.ts`, `spec-vs-index.test.ts`, `bridges-index.test.ts`, `invariants.test.ts`, `graphs.test.ts`, `catalog-full.test.ts`, `catalog-tranche.test.ts`, `proposed-bridges.test.ts`, `tensor.test.ts` |
| `bridges/be65-jeans-mass-confrontation.ts` | `public-surface.test.ts`, `be-65-jeans-mass.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `tensor.test.ts` |
| `bridges/be65-jeans-mass.ts` | `public-surface.test.ts`, `be-11-fix.test.ts`, `be-14-ryu-takayanagi.test.ts`, `be-18-fix.test.ts`, `be-29-fix.test.ts`, `be-47-fix.test.ts`, `be-48-fix.test.ts`, `be-55-quantum-hall.test.ts`, `be-56-casimir.test.ts`, `be-57-unruh.test.ts`, `be-58-johnson-nyquist.test.ts`, `be-59-ac-josephson.test.ts`, `be-60-fractional-qh.test.ts`, `be-61-wiedemann-franz.test.ts`, `be-62-bcs-gap.test.ts`, `be-63-chandrasekhar-mass.test.ts`, `be-64-eddington-luminosity.test.ts`, `be-65-jeans-mass.test.ts`, `bridge-equations-facade.test.ts`, `catalog-adapter.test.ts`, `catalog-integrity.test.ts`, `catalog-json.test.ts`, `confrontation-registry.test.ts`, `descriptor-consistency.test.ts`, `dimensional-signature-catalog.test.ts`, `membership.test.ts`, `orphan-dimensional-signature.test.ts`, `public-api-stability.test.ts`, `spec-vs-index.test.ts`, `bridges-index.test.ts`, `invariants.test.ts`, `graphs.test.ts`, `catalog-full.test.ts`, `catalog-tranche.test.ts`, `proposed-bridges.test.ts`, `tensor.test.ts` |
| `bridges/bridge-equations.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `tensor.test.ts` |
| `bridges/catalog-adapter.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `catalog-adapter.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `tensor.test.ts` |
| `bridges/confrontation-coverage.ts` | `be-55-quantum-hall.test.ts`, `be-56-casimir.test.ts`, `be-57-unruh.test.ts`, `be-58-johnson-nyquist.test.ts`, `be-59-ac-josephson.test.ts`, `be-60-fractional-qh.test.ts`, `be-61-wiedemann-franz.test.ts`, `be-62-bcs-gap.test.ts`, `be-63-chandrasekhar-mass.test.ts`, `be-64-eddington-luminosity.test.ts`, `be-65-jeans-mass.test.ts`, `be11-decoherence-confrontation.test.ts`, `be21-kss-confrontation.test.ts`, `be35-bootstrap-confrontation.test.ts`, `be37-cassini.test.ts`, `be48-collapse.test.ts`, `be51-lensing-confrontation.test.ts`, `confrontation-coverage.test.ts`, `confrontation-registry.test.ts`, `confrontation-rigor.test.ts`, `graphs.test.ts` |
| `bridges/confrontations.ts` | `public-surface.test.ts`, `be-55-quantum-hall.test.ts`, `be-56-casimir.test.ts`, `be-57-unruh.test.ts`, `be-58-johnson-nyquist.test.ts`, `be-59-ac-josephson.test.ts`, `be-60-fractional-qh.test.ts`, `be-61-wiedemann-franz.test.ts`, `be-62-bcs-gap.test.ts`, `be-65-jeans-mass.test.ts`, `be11-decoherence-confrontation.test.ts`, `be21-kss-confrontation.test.ts`, `be35-bootstrap-confrontation.test.ts`, `be37-cassini.test.ts`, `be48-collapse.test.ts`, `be51-lensing-confrontation.test.ts`, `bridge-equations-facade.test.ts`, `catalog-json.test.ts`, `confrontation-registry.test.ts`, `confrontation-rigor.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `tensor.test.ts` |
| `bridges/descriptor.ts` | `descriptor-consistency.test.ts` |
| `equations/_be-helpers.ts` | `_be-helpers.test.ts` |
| `equations/be-11-decoherence-master.ts` | `be-11-fix.test.ts`, `bridge-equations-facade.test.ts` |
| `equations/be-12-coherence-length.ts` | `be-12-encoding.test.ts` |
| `equations/be-13-einstein-trace.ts` | `be-13-encoding.test.ts` |
| `equations/be-14-ryu-takayanagi.ts` | `be-14-ryu-takayanagi.test.ts` |
| `equations/be-15-emergence.ts` | `be-15-encoding.test.ts`, `catalog-grammar-applicability.test.ts` |
| `equations/be-16-landauer.ts` | `be-16-landauer-encoding.test.ts`, `bridge-equations-facade.test.ts` |
| `equations/be-17-einstein-cartan.ts` | `be-17-encoding.test.ts`, `be-17-structural.test.ts`, `bridge-check.test.ts` |
| `equations/be-18-higgs-mass.ts` | `be-18-encoding.test.ts` |
| `equations/be-19-quantum-bounce.ts` | `be-19-encoding.test.ts`, `bridge-check.test.ts` |
| `equations/be-20-vacuum-energy.ts` | `be-20-encoding.test.ts` |
| `equations/be-21-kss-bound.ts` | `be-21-encoding.test.ts`, `bridge-equations-facade.test.ts` |
| `equations/be-22-topological-entanglement.ts` | `be-22-encoding.test.ts`, `bridge-check.test.ts` |
| `equations/be-23-syk-planckian.ts` | `be-23-encoding.test.ts`, `be23-planckian-confrontation.test.ts` |
| `equations/be-24-foerster-fret.ts` | `be-24-encoding.test.ts` |
| `equations/be-25-iit-phi.ts` | `be-25-iit-encoding.test.ts` |
| `equations/be-25-orch-or.ts` | `be-25-encoding.test.ts` |
| `equations/be-26-dna-tunneling.ts` | `be-26-encoding.test.ts`, `be-26-ad.test.ts`, `bridge-check.test.ts` |
| `equations/be-27-effective-temperature.ts` | `be-27-encoding.test.ts` |
| `equations/be-28-onsager-entropy-production.ts` | `be-28-onsager-encoding.test.ts`, `catalog-grammar-applicability.test.ts` |
| `equations/be-29-jarzynski.ts` | `be-29-encoding.test.ts` |
| `equations/be-30-flm-first-law.ts` | `be-30-encoding.test.ts` |
| `equations/be-31-causal-set-bd.ts` | `be-31-encoding.test.ts` |
| `equations/be-32-quantum-reference-frame.ts` | `be-32-encoding.test.ts` |
| `equations/be-33-hertz-millis.ts` | `be-33-encoding.test.ts` |
| `equations/be-34-kibble-zurek.ts` | `be-34-encoding.test.ts`, `bridge-check.test.ts` |
| `equations/be-35-conformal-bootstrap.ts` | `be-35-encoding.test.ts` |
| `equations/be-36-gw-speed-bound.ts` | `be-36-encoding.test.ts`, `be36-gw170817-confrontation.test.ts` |
| `equations/be-37-shapiro-delay.ts` | `be-37-numerical-eikonal.test.ts`, `be-37-shapiro-eikonal-structural.test.ts`, `be-37-shapiro-encoding.test.ts`, `covariant-derivative-preview.test.ts`, `be37-shapiro-step-sweep.test.ts` |
| `equations/be-38-mond.ts` | `be-38-encoding.test.ts` |
| `equations/be-39-asymptotic-safety.ts` | `be-39-encoding.test.ts` |
| `equations/be-40-composite-higgs.ts` | `be-40-encoding.test.ts` |
| `equations/be-41-swampland.ts` | `be-41-encoding.test.ts`, `bridge-check.test.ts` |
| `equations/be-42-hawking-temperature.ts` | `be-42-encoding.test.ts`, `bridge-equations-facade.test.ts`, `bridge-ast-gradient-byid.test.ts`, `bridge-ast-gradient.test.ts` |
| `equations/be-43-er-epr.ts` | `be-43-encoding.test.ts` |
| `equations/be-44-soft-hair.ts` | `be-44-encoding.test.ts` |
| `equations/be-45-tcc.ts` | `be-45-encoding.test.ts` |
| `equations/be-46-multiverse-measure.ts` | `be-46-encoding.test.ts`, `catalog-grammar-applicability.test.ts` |
| `equations/be-47-bbn-dark-sector.ts` | `be-47-encoding.test.ts`, `bridge-check.test.ts` |
| `equations/be-48-grw-localization.ts` | `be-48-encoding.test.ts` |
| `equations/be-49-quantum-darwinism.ts` | `be-49-encoding.test.ts` |
| `equations/be-50-wheeler-feynman.ts` | `be-50-encoding.test.ts` |
| `equations/be-53-yang-mills-beta.ts` | `be-53-encoding.test.ts` |
| `equations/be-54-randall-sundrum-brane.ts` | `be-54-encoding.test.ts` |
| `bridges/evaluators.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `evaluators.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `tensor.test.ts` |
| `bridges/gravitational-lensing.ts` | `public-surface.test.ts`, `be-11-fix.test.ts`, `be-14-ryu-takayanagi.test.ts`, `be-18-fix.test.ts`, `be-29-fix.test.ts`, `be-47-fix.test.ts`, `be-48-fix.test.ts`, `be-55-quantum-hall.test.ts`, `be-56-casimir.test.ts`, `be-57-unruh.test.ts`, `be-58-johnson-nyquist.test.ts`, `be-59-ac-josephson.test.ts`, `be-60-fractional-qh.test.ts`, `be-61-wiedemann-franz.test.ts`, `be-62-bcs-gap.test.ts`, `be-63-chandrasekhar-mass.test.ts`, `be-64-eddington-luminosity.test.ts`, `be-65-jeans-mass.test.ts`, `bridge-equations-facade.test.ts`, `catalog-adapter.test.ts`, `catalog-integrity.test.ts`, `catalog-json.test.ts`, `confrontation-registry.test.ts`, `descriptor-consistency.test.ts`, `dimensional-signature-catalog.test.ts`, `gravitational-lensing.test.ts`, `membership.test.ts`, `orphan-dimensional-signature.test.ts`, `public-api-stability.test.ts`, `spec-vs-index.test.ts`, `bridges-index.test.ts`, `invariants.test.ts`, `graphs.test.ts`, `catalog-full.test.ts`, `catalog-tranche.test.ts`, `proposed-bridges.test.ts`, `tensor.test.ts` |
| `bridges/index.ts` | `public-surface.test.ts`, `be-11-fix.test.ts`, `be-14-ryu-takayanagi.test.ts`, `be-18-fix.test.ts`, `be-29-fix.test.ts`, `be-47-fix.test.ts`, `be-48-fix.test.ts`, `be-55-quantum-hall.test.ts`, `be-56-casimir.test.ts`, `be-57-unruh.test.ts`, `be-58-johnson-nyquist.test.ts`, `be-59-ac-josephson.test.ts`, `be-60-fractional-qh.test.ts`, `be-61-wiedemann-franz.test.ts`, `be-62-bcs-gap.test.ts`, `be-63-chandrasekhar-mass.test.ts`, `be-64-eddington-luminosity.test.ts`, `be-65-jeans-mass.test.ts`, `bridge-equations-facade.test.ts`, `catalog-adapter.test.ts`, `catalog-integrity.test.ts`, `catalog-json.test.ts`, `confrontation-registry.test.ts`, `descriptor-consistency.test.ts`, `dimensional-signature-catalog.test.ts`, `membership.test.ts`, `orphan-dimensional-signature.test.ts`, `public-api-stability.test.ts`, `spec-vs-index.test.ts`, `bridges-index.test.ts`, `invariants.test.ts`, `graphs.test.ts`, `catalog-full.test.ts`, `catalog-tranche.test.ts`, `proposed-bridges.test.ts`, `tensor.test.ts` |
| `bridges/membership.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `membership.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `tensor.test.ts` |
| `observations/types.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `observation-types.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `tensor.test.ts` |
| `bridges/perihelion-precession-labeled.ts` | `perihelion-precession-labeled.test.ts` |
| `bridges/perihelion-precession.ts` | `public-surface.test.ts`, `be-11-fix.test.ts`, `be-14-ryu-takayanagi.test.ts`, `be-18-fix.test.ts`, `be-29-fix.test.ts`, `be-47-fix.test.ts`, `be-48-fix.test.ts`, `be-55-quantum-hall.test.ts`, `be-56-casimir.test.ts`, `be-57-unruh.test.ts`, `be-58-johnson-nyquist.test.ts`, `be-59-ac-josephson.test.ts`, `be-60-fractional-qh.test.ts`, `be-61-wiedemann-franz.test.ts`, `be-62-bcs-gap.test.ts`, `be-63-chandrasekhar-mass.test.ts`, `be-64-eddington-luminosity.test.ts`, `be-65-jeans-mass.test.ts`, `bridge-equations-facade.test.ts`, `catalog-adapter.test.ts`, `catalog-integrity.test.ts`, `catalog-json.test.ts`, `confrontation-registry.test.ts`, `descriptor-consistency.test.ts`, `dimensional-signature-catalog.test.ts`, `membership.test.ts`, `orphan-dimensional-signature.test.ts`, `perihelion-precession-labeled.test.ts`, `perihelion-precession.test.ts`, `public-api-stability.test.ts`, `spec-vs-index.test.ts`, `bridges-index.test.ts`, `invariants.test.ts`, `graphs.test.ts`, `catalog-full.test.ts`, `catalog-tranche.test.ts`, `proposed-bridges.test.ts`, `tensor.test.ts` |
| `bridges/rejected.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `membership.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `catalog-full.test.ts`, `tensor.test.ts` |
| `bridges/rhs-registry.ts` | `descriptor-consistency.test.ts`, `dimensional-signature-catalog.test.ts`, `linkage.test.ts`, `bridge-ast-gradient-byid.test.ts` |
| `bridges/sensitivity.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `sensitivity.test.ts`, `graphs.test.ts`, `tensor.test.ts` |
| `canonical/canonical-equation.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `canonical-graph-information-axis.test.ts`, `canonical-graph.test.ts`, `tensor.test.ts` |
| `canonical/dimensional-fields.ts` | `dimensional-fields.test.ts` |
| `entries/atomic.ts` | `atomic.test.ts` |
| `entries/condensed-matter.ts` | `condensed-matter.test.ts` |
| `entries/dimensional-classics.ts` | `dimensional-classics.test.ts` |
| `entries/electromagnetism.ts` | `electromagnetism.test.ts` |
| `entries/fluids-waves.ts` | `fluids-waves.test.ts` |
| `entries/mechanics.ts` | `mechanics.test.ts` |
| `entries/nonmonomial.ts` | `nonmonomial.test.ts` |
| `entries/relativity.ts` | `relativity.test.ts` |
| `entries/statistical-mechanics.ts` | `statistical-mechanics.test.ts` |
| `entries/thermo-nuclear-cosmo.ts` | `thermo-nuclear-cosmo.test.ts` |
| `canonical/linkage.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `linkage.test.ts`, `graphs.test.ts`, `tensor.test.ts` |
| `canonical/normal-form.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `normal-form.test.ts`, `graphs.test.ts`, `tensor.test.ts` |
| `canonical/registry.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `invariants.test.ts`, `linkage.test.ts`, `nonmonomial.test.ts`, `numeric-prefactor.test.ts`, `registry.test.ts`, `relativity.test.ts`, `seed-l-layer.test.ts`, `graphs.test.ts`, `canonical-graph-information-axis.test.ts`, `canonical-graph.test.ts`, `consequence.test.ts`, `proposed-bridges.test.ts`, `tensor.test.ts` |
| `canonical/seed-l-layer.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `seed-l-layer.test.ts`, `graphs.test.ts`, `tensor.test.ts` |
| `src/cli-api.ts` | `graphs.test.ts` |
| `cli/args.ts` | `args.test.ts`, `main-dispatch.test.ts` |
| `cli/command.ts` | `main-dispatch.test.ts` |
| `commands/audit.ts` | `confront.test.ts`, `explain-bridge-redirect.test.ts`, `inprocess-golden.test.ts`, `json-contract.test.ts`, `main-dispatch.test.ts`, `new-commands.test.ts`, `source-extension.test.ts`, `upt-discover-opts.test.ts` |
| `commands/axes.ts` | `confront.test.ts`, `explain-bridge-redirect.test.ts`, `inprocess-golden.test.ts`, `json-contract.test.ts`, `main-dispatch.test.ts`, `new-commands.test.ts`, `source-extension.test.ts`, `upt-discover-opts.test.ts` |
| `commands/candidates.ts` | `confront.test.ts`, `explain-bridge-redirect.test.ts`, `inprocess-golden.test.ts`, `json-contract.test.ts`, `main-dispatch.test.ts`, `new-commands.test.ts`, `source-extension.test.ts`, `upt-discover-opts.test.ts` |
| `commands/canonical.ts` | `confront.test.ts`, `explain-bridge-redirect.test.ts`, `inprocess-golden.test.ts`, `json-contract.test.ts`, `main-dispatch.test.ts`, `new-commands.test.ts`, `source-extension.test.ts`, `upt-discover-opts.test.ts` |
| `commands/confront.ts` | `confront.test.ts`, `explain-bridge-redirect.test.ts`, `inprocess-golden.test.ts`, `json-contract.test.ts`, `main-dispatch.test.ts`, `new-commands.test.ts`, `source-extension.test.ts`, `upt-discover-opts.test.ts` |
| `commands/connectors.ts` | `confront.test.ts`, `explain-bridge-redirect.test.ts`, `inprocess-golden.test.ts`, `json-contract.test.ts`, `main-dispatch.test.ts`, `new-commands.test.ts`, `source-extension.test.ts`, `upt-discover-opts.test.ts` |
| `commands/coverage.ts` | `confront.test.ts`, `explain-bridge-redirect.test.ts`, `inprocess-golden.test.ts`, `json-contract.test.ts`, `main-dispatch.test.ts`, `new-commands.test.ts`, `source-extension.test.ts`, `upt-discover-opts.test.ts` |
| `commands/derive.ts` | `confront.test.ts`, `explain-bridge-redirect.test.ts`, `inprocess-golden.test.ts`, `json-contract.test.ts`, `main-dispatch.test.ts`, `new-commands.test.ts`, `source-extension.test.ts`, `upt-discover-opts.test.ts` |
| `commands/discover.ts` | `confront.test.ts`, `explain-bridge-redirect.test.ts`, `inprocess-golden.test.ts`, `json-contract.test.ts`, `main-dispatch.test.ts`, `new-commands.test.ts`, `source-extension.test.ts`, `upt-discover-opts.test.ts` |
| `commands/eval.ts` | `confront.test.ts`, `explain-bridge-redirect.test.ts`, `inprocess-golden.test.ts`, `json-contract.test.ts`, `main-dispatch.test.ts`, `new-commands.test.ts`, `source-extension.test.ts`, `upt-discover-opts.test.ts` |
| `commands/evaluate.ts` | `confront.test.ts`, `explain-bridge-redirect.test.ts`, `inprocess-golden.test.ts`, `json-contract.test.ts`, `main-dispatch.test.ts`, `new-commands.test.ts`, `source-extension.test.ts`, `upt-discover-opts.test.ts` |
| `commands/explain.ts` | `confront.test.ts`, `explain-bridge-redirect.test.ts`, `inprocess-golden.test.ts`, `json-contract.test.ts`, `main-dispatch.test.ts`, `new-commands.test.ts`, `source-extension.test.ts`, `upt-discover-opts.test.ts` |
| `commands/ground.ts` | `confront.test.ts`, `explain-bridge-redirect.test.ts`, `inprocess-golden.test.ts`, `json-contract.test.ts`, `main-dispatch.test.ts`, `new-commands.test.ts`, `source-extension.test.ts`, `upt-discover-opts.test.ts` |
| `commands/index.ts` | `confront.test.ts`, `explain-bridge-redirect.test.ts`, `inprocess-golden.test.ts`, `json-contract.test.ts`, `main-dispatch.test.ts`, `new-commands.test.ts`, `source-extension.test.ts`, `upt-discover-opts.test.ts` |
| `commands/map.ts` | `confront.test.ts`, `explain-bridge-redirect.test.ts`, `inprocess-golden.test.ts`, `json-contract.test.ts`, `main-dispatch.test.ts`, `new-commands.test.ts`, `source-extension.test.ts`, `upt-discover-opts.test.ts` |
| `commands/predict.ts` | `confront.test.ts`, `explain-bridge-redirect.test.ts`, `inprocess-golden.test.ts`, `json-contract.test.ts`, `main-dispatch.test.ts`, `new-commands.test.ts`, `source-extension.test.ts`, `upt-discover-opts.test.ts` |
| `commands/priority.ts` | `confront.test.ts`, `explain-bridge-redirect.test.ts`, `inprocess-golden.test.ts`, `json-contract.test.ts`, `main-dispatch.test.ts`, `new-commands.test.ts`, `source-extension.test.ts`, `upt-discover-opts.test.ts` |
| `commands/recover.ts` | `confront.test.ts`, `explain-bridge-redirect.test.ts`, `inprocess-golden.test.ts`, `json-contract.test.ts`, `main-dispatch.test.ts`, `new-commands.test.ts`, `source-extension.test.ts`, `upt-discover-opts.test.ts` |
| `commands/symbolic.ts` | `confront.test.ts`, `explain-bridge-redirect.test.ts`, `inprocess-golden.test.ts`, `json-contract.test.ts`, `main-dispatch.test.ts`, `new-commands.test.ts`, `source-extension.test.ts`, `upt-discover-opts.test.ts` |
| `cli/errors.ts` | `args.test.ts`, `graphs.test.ts`, `main-dispatch.test.ts` |
| `cli/graphs.ts` | `graphs.test.ts` |
| `cli/main.ts` | `confront.test.ts`, `explain-bridge-redirect.test.ts`, `inprocess-golden.test.ts`, `json-contract.test.ts`, `main-dispatch.test.ts`, `new-commands.test.ts`, `source-extension.test.ts`, `upt-discover-opts.test.ts` |
| `cli/output.ts` | `output.test.ts` |
| `cli/version.ts` | `output.test.ts` |
| `composition/adjudication.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `catalog-json.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `adjudication-annotate.test.ts`, `adjudication-id.test.ts`, `adjudication-registry.test.ts`, `discovery-calibration.test.ts`, `tensor.test.ts` |
| `composition/axes.ts` | `graphs.test.ts`, `axes.test.ts` |
| `composition/axis-audit.ts` | `graphs.test.ts`, `axis-audit.test.ts` |
| `composition/bridge-analysis.ts` | `graphs.test.ts`, `axis-gate.test.ts`, `bridge-priority.test.ts`, `discovery-canonical-kind.test.ts`, `discovery-magnitude.test.ts`, `discovery.test.ts`, `graph-viz.test.ts`, `link-candidates.test.ts`, `linkage-map.test.ts`, `orphan-connectors.test.ts`, `bridge-derivation-audit.test.ts` |
| `composition/bridge-prediction.ts` | `graphs.test.ts`, `attribute-audit.test.ts`, `bridge-prediction.test.ts` |
| `composition/canonical-graph.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `attribute-audit.test.ts`, `axis-gate.test.ts`, `bridge-prediction.test.ts`, `bridge-priority.test.ts`, `calibration-targets.test.ts`, `canonical-graph-information-axis.test.ts`, `canonical-graph.test.ts`, `catalog-full.test.ts`, `catalog-tranche.test.ts`, `compose-properties.test.ts`, `compose.test.ts`, `consequence.test.ts`, `discovery-calibration.test.ts`, `discovery.test.ts`, `enumerate-uncertainty.test.ts`, `explain.test.ts`, `identifiability.test.ts`, `link-candidates.test.ts`, `linkage-map.test.ts`, `namespacing.test.ts`, `orphan-connectors.test.ts`, `proposed-bridges.test.ts`, `quantities.test.ts`, `retrodiction.test.ts`, `stress-tests.test.ts`, `symbolic-composition.test.ts`, `bridge-derivation-audit.test.ts`, `symbolic-exponent.test.ts`, `tensor.test.ts` |
| `composition/catalog-graph.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `descriptor-consistency.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `attribute-audit.test.ts`, `axis-audit.test.ts`, `axis-gate.test.ts`, `bridge-prediction.test.ts`, `bridge-priority.test.ts`, `calibration-targets.test.ts`, `catalog-full.test.ts`, `catalog-tranche.test.ts`, `compose-properties.test.ts`, `compose.test.ts`, `consequence.test.ts`, `discovery-calibration.test.ts`, `discovery.test.ts`, `enumerate-uncertainty.test.ts`, `explain.test.ts`, `graph-viz-svg.test.ts`, `graph-viz.test.ts`, `identifiability.test.ts`, `link-candidates.test.ts`, `linkage-map.test.ts`, `namespacing.test.ts`, `orphan-connectors.test.ts`, `proposed-bridges.test.ts`, `quantities.test.ts`, `retrodiction.test.ts`, `stress-tests.test.ts`, `symbolic-composition.test.ts`, `bridge-derivation-audit.test.ts`, `symbolic-exponent.test.ts`, `tensor.test.ts` |
| `composition/compose-surface.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `tensor.test.ts` |
| `composition/compose-symbolic.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `attribute-audit.test.ts`, `axis-gate.test.ts`, `bridge-prediction.test.ts`, `bridge-priority.test.ts`, `calibration-targets.test.ts`, `catalog-full.test.ts`, `catalog-tranche.test.ts`, `collect-symbols-transcendental.test.ts`, `compose-properties.test.ts`, `compose.test.ts`, `discovery.test.ts`, `enumerate-uncertainty.test.ts`, `explain.test.ts`, `identifiability.test.ts`, `link-candidates.test.ts`, `linkage-map.test.ts`, `namespacing.test.ts`, `orphan-connectors.test.ts`, `quantities.test.ts`, `retrodiction.test.ts`, `stress-tests.test.ts`, `symbolic-composition.test.ts`, `symbolic-simplification.test.ts`, `bridge-derivation-audit.test.ts`, `symbolic-exponent.test.ts`, `tensor.test.ts` |
| `composition/compose.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `attribute-audit.test.ts`, `axis-gate.test.ts`, `bridge-prediction.test.ts`, `bridge-priority.test.ts`, `calibration-targets.test.ts`, `catalog-full.test.ts`, `catalog-tranche.test.ts`, `compose-properties.test.ts`, `compose.test.ts`, `discovery.test.ts`, `enumerate-uncertainty.test.ts`, `explain.test.ts`, `identifiability.test.ts`, `link-candidates.test.ts`, `linkage-map.test.ts`, `namespacing.test.ts`, `orphan-connectors.test.ts`, `quantities.test.ts`, `retrodiction.test.ts`, `stress-tests.test.ts`, `symbolic-composition.test.ts`, `bridge-derivation-audit.test.ts`, `symbolic-exponent.test.ts`, `tensor.test.ts` |
| `composition/consequence.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `consequence.test.ts`, `tensor.test.ts` |
| `composition/consistency.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `attribute-audit.test.ts`, `axis-gate.test.ts`, `bridge-prediction.test.ts`, `bridge-priority.test.ts`, `calibration-targets.test.ts`, `catalog-full.test.ts`, `catalog-tranche.test.ts`, `compose-properties.test.ts`, `compose.test.ts`, `discovery.test.ts`, `enumerate-uncertainty.test.ts`, `explain.test.ts`, `identifiability.test.ts`, `link-candidates.test.ts`, `linkage-map.test.ts`, `namespacing.test.ts`, `orphan-connectors.test.ts`, `quantities.test.ts`, `retrodiction.test.ts`, `stress-tests.test.ts`, `symbolic-composition.test.ts`, `bridge-derivation-audit.test.ts`, `symbolic-exponent.test.ts`, `tensor.test.ts` |
| `composition/dimension-adjacency.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `attribute-audit.test.ts`, `axis-gate.test.ts`, `bridge-prediction.test.ts`, `bridge-priority.test.ts`, `calibration-targets.test.ts`, `catalog-full.test.ts`, `catalog-tranche.test.ts`, `compose-properties.test.ts`, `compose.test.ts`, `dimension-adjacency.test.ts`, `discovery.test.ts`, `enumerate-uncertainty.test.ts`, `explain.test.ts`, `identifiability.test.ts`, `link-candidates.test.ts`, `linkage-map.test.ts`, `namespacing.test.ts`, `orphan-connectors.test.ts`, `quantities.test.ts`, `retrodiction.test.ts`, `stress-tests.test.ts`, `symbolic-composition.test.ts`, `bridge-derivation-audit.test.ts`, `symbolic-exponent.test.ts`, `tensor.test.ts` |
| `composition/discovery.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `adjudication-annotate.test.ts`, `axis-gate.test.ts`, `canonical-graph.test.ts`, `consequence.test.ts`, `discovery-calibration.test.ts`, `discovery-canonical-kind.test.ts`, `discovery-magnitude.test.ts`, `discovery.test.ts`, `grounding.test.ts`, `proposed-bridges.test.ts`, `tensor.test.ts` |
| `composition/edge.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `attribute-audit.test.ts`, `axis-gate.test.ts`, `bridge-prediction.test.ts`, `bridge-priority.test.ts`, `calibration-targets.test.ts`, `catalog-full.test.ts`, `catalog-tranche.test.ts`, `compose-properties.test.ts`, `compose.test.ts`, `discovery.test.ts`, `enumerate-uncertainty.test.ts`, `explain.test.ts`, `graph-viz.test.ts`, `identifiability.test.ts`, `link-candidates.test.ts`, `linkage-map.test.ts`, `namespacing.test.ts`, `orphan-connectors.test.ts`, `quantities.test.ts`, `retrodiction.test.ts`, `stress-tests.test.ts`, `symbolic-composition.test.ts`, `user-equation.test.ts`, `bridge-derivation-audit.test.ts`, `symbolic-exponent.test.ts`, `tensor.test.ts` |
| `edges/calibration.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `attribute-audit.test.ts`, `axis-gate.test.ts`, `bridge-prediction.test.ts`, `bridge-priority.test.ts`, `calibration-targets.test.ts`, `canonical-graph.test.ts`, `catalog-full.test.ts`, `catalog-tranche.test.ts`, `compose-properties.test.ts`, `compose.test.ts`, `discovery.test.ts`, `enumerate-uncertainty.test.ts`, `explain.test.ts`, `identifiability.test.ts`, `link-candidates.test.ts`, `linkage-map.test.ts`, `namespacing.test.ts`, `orphan-connectors.test.ts`, `quantities.test.ts`, `retrodiction.test.ts`, `stress-tests.test.ts`, `symbolic-composition.test.ts`, `symbolic-simplification.test.ts`, `bridge-derivation-audit.test.ts`, `symbolic-exponent.test.ts`, `tensor.test.ts` |
| `edges/catalog-condensed-matter.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `attribute-audit.test.ts`, `axis-gate.test.ts`, `bridge-prediction.test.ts`, `bridge-priority.test.ts`, `calibration-targets.test.ts`, `catalog-full.test.ts`, `catalog-tranche.test.ts`, `compose-properties.test.ts`, `compose.test.ts`, `discovery.test.ts`, `enumerate-uncertainty.test.ts`, `explain.test.ts`, `identifiability.test.ts`, `link-candidates.test.ts`, `linkage-map.test.ts`, `namespacing.test.ts`, `orphan-connectors.test.ts`, `quantities.test.ts`, `retrodiction.test.ts`, `stress-tests.test.ts`, `symbolic-composition.test.ts`, `bridge-derivation-audit.test.ts`, `symbolic-exponent.test.ts`, `tensor.test.ts` |
| `edges/catalog-fields.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `attribute-audit.test.ts`, `axis-gate.test.ts`, `bridge-prediction.test.ts`, `bridge-priority.test.ts`, `calibration-targets.test.ts`, `catalog-full.test.ts`, `catalog-tranche.test.ts`, `compose-properties.test.ts`, `compose.test.ts`, `discovery.test.ts`, `enumerate-uncertainty.test.ts`, `explain.test.ts`, `identifiability.test.ts`, `link-candidates.test.ts`, `linkage-map.test.ts`, `namespacing.test.ts`, `orphan-connectors.test.ts`, `quantities.test.ts`, `retrodiction.test.ts`, `stress-tests.test.ts`, `symbolic-composition.test.ts`, `bridge-derivation-audit.test.ts`, `symbolic-exponent.test.ts`, `tensor.test.ts` |
| `edges/catalog-full.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `attribute-audit.test.ts`, `axis-gate.test.ts`, `bridge-prediction.test.ts`, `bridge-priority.test.ts`, `calibration-targets.test.ts`, `catalog-full.test.ts`, `catalog-tranche.test.ts`, `compose-properties.test.ts`, `compose.test.ts`, `discovery.test.ts`, `enumerate-uncertainty.test.ts`, `explain.test.ts`, `identifiability.test.ts`, `link-candidates.test.ts`, `linkage-map.test.ts`, `namespacing.test.ts`, `orphan-connectors.test.ts`, `quantities.test.ts`, `retrodiction.test.ts`, `stress-tests.test.ts`, `symbolic-composition.test.ts`, `bridge-derivation-audit.test.ts`, `symbolic-exponent.test.ts`, `tensor.test.ts` |
| `edges/catalog-gravitation-cosmology.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `attribute-audit.test.ts`, `axis-gate.test.ts`, `bridge-prediction.test.ts`, `bridge-priority.test.ts`, `calibration-targets.test.ts`, `catalog-full.test.ts`, `catalog-tranche.test.ts`, `compose-properties.test.ts`, `compose.test.ts`, `discovery.test.ts`, `enumerate-uncertainty.test.ts`, `explain.test.ts`, `identifiability.test.ts`, `link-candidates.test.ts`, `linkage-map.test.ts`, `namespacing.test.ts`, `orphan-connectors.test.ts`, `quantities.test.ts`, `retrodiction.test.ts`, `stress-tests.test.ts`, `symbolic-composition.test.ts`, `bridge-derivation-audit.test.ts`, `symbolic-exponent.test.ts`, `tensor.test.ts` |
| `edges/catalog-quantum.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `attribute-audit.test.ts`, `axis-gate.test.ts`, `bridge-prediction.test.ts`, `bridge-priority.test.ts`, `calibration-targets.test.ts`, `catalog-full.test.ts`, `catalog-tranche.test.ts`, `compose-properties.test.ts`, `compose.test.ts`, `discovery.test.ts`, `enumerate-uncertainty.test.ts`, `explain.test.ts`, `identifiability.test.ts`, `link-candidates.test.ts`, `linkage-map.test.ts`, `namespacing.test.ts`, `orphan-connectors.test.ts`, `quantities.test.ts`, `retrodiction.test.ts`, `stress-tests.test.ts`, `symbolic-composition.test.ts`, `bridge-derivation-audit.test.ts`, `symbolic-exponent.test.ts`, `tensor.test.ts` |
| `edges/catalog-tranche.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `attribute-audit.test.ts`, `axis-gate.test.ts`, `bridge-prediction.test.ts`, `bridge-priority.test.ts`, `calibration-targets.test.ts`, `catalog-full.test.ts`, `catalog-tranche.test.ts`, `compose-properties.test.ts`, `compose.test.ts`, `discovery.test.ts`, `enumerate-uncertainty.test.ts`, `explain.test.ts`, `identifiability.test.ts`, `link-candidates.test.ts`, `linkage-map.test.ts`, `namespacing.test.ts`, `orphan-connectors.test.ts`, `quantities.test.ts`, `retrodiction.test.ts`, `stress-tests.test.ts`, `symbolic-composition.test.ts`, `bridge-derivation-audit.test.ts`, `symbolic-exponent.test.ts`, `tensor.test.ts` |
| `composition/enumerate.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `attribute-audit.test.ts`, `axis-gate.test.ts`, `bridge-prediction.test.ts`, `bridge-priority.test.ts`, `calibration-targets.test.ts`, `catalog-full.test.ts`, `catalog-tranche.test.ts`, `compose-properties.test.ts`, `compose.test.ts`, `discovery.test.ts`, `enumerate-uncertainty.test.ts`, `explain.test.ts`, `identifiability.test.ts`, `link-candidates.test.ts`, `linkage-map.test.ts`, `namespacing.test.ts`, `orphan-connectors.test.ts`, `quantities.test.ts`, `retrodiction.test.ts`, `stress-tests.test.ts`, `symbolic-composition.test.ts`, `bridge-derivation-audit.test.ts`, `symbolic-exponent.test.ts`, `tensor.test.ts` |
| `composition/explain.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `attribute-audit.test.ts`, `axis-gate.test.ts`, `bridge-prediction.test.ts`, `bridge-priority.test.ts`, `calibration-targets.test.ts`, `catalog-full.test.ts`, `catalog-tranche.test.ts`, `compose-properties.test.ts`, `compose.test.ts`, `discovery.test.ts`, `enumerate-uncertainty.test.ts`, `explain.test.ts`, `identifiability.test.ts`, `link-candidates.test.ts`, `linkage-map.test.ts`, `namespacing.test.ts`, `orphan-connectors.test.ts`, `quantities.test.ts`, `retrodiction.test.ts`, `stress-tests.test.ts`, `symbolic-composition.test.ts`, `bridge-derivation-audit.test.ts`, `symbolic-exponent.test.ts`, `tensor.test.ts` |
| `composition/expr-eval.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `numeric-prefactor.test.ts`, `graphs.test.ts`, `attribute-audit.test.ts`, `axis-gate.test.ts`, `bridge-prediction.test.ts`, `bridge-priority.test.ts`, `calibration-targets.test.ts`, `catalog-full.test.ts`, `catalog-tranche.test.ts`, `compose-properties.test.ts`, `compose.test.ts`, `discovery.test.ts`, `enumerate-uncertainty.test.ts`, `explain.test.ts`, `identifiability.test.ts`, `link-candidates.test.ts`, `linkage-map.test.ts`, `namespacing.test.ts`, `orphan-connectors.test.ts`, `quantities.test.ts`, `retrodiction.test.ts`, `stress-tests.test.ts`, `symbolic-composition.test.ts`, `symbolic-simplification.test.ts`, `bridge-derivation-audit.test.ts`, `symbolic-exponent.test.ts`, `tensor.test.ts` |
| `composition/expr-simplify.ts` | `graphs.test.ts`, `symbolic-simplification.test.ts` |
| `composition/expr-subst.ts` | `symbolic-composition.test.ts` |
| `composition/graph-viz-svg.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `attribute-audit.test.ts`, `axis-gate.test.ts`, `bridge-prediction.test.ts`, `bridge-priority.test.ts`, `calibration-targets.test.ts`, `catalog-full.test.ts`, `catalog-tranche.test.ts`, `compose-properties.test.ts`, `compose.test.ts`, `discovery.test.ts`, `enumerate-uncertainty.test.ts`, `explain.test.ts`, `graph-viz-svg.test.ts`, `identifiability.test.ts`, `link-candidates.test.ts`, `linkage-map.test.ts`, `namespacing.test.ts`, `orphan-connectors.test.ts`, `quantities.test.ts`, `retrodiction.test.ts`, `stress-tests.test.ts`, `symbolic-composition.test.ts`, `bridge-derivation-audit.test.ts`, `symbolic-exponent.test.ts`, `tensor.test.ts` |
| `composition/graph-viz.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `attribute-audit.test.ts`, `axis-gate.test.ts`, `bridge-prediction.test.ts`, `bridge-priority.test.ts`, `calibration-targets.test.ts`, `canonical-graph.test.ts`, `catalog-full.test.ts`, `catalog-tranche.test.ts`, `compose-properties.test.ts`, `compose.test.ts`, `discovery.test.ts`, `enumerate-uncertainty.test.ts`, `explain.test.ts`, `graph-viz-svg.test.ts`, `graph-viz.test.ts`, `identifiability.test.ts`, `link-candidates.test.ts`, `linkage-map.test.ts`, `namespacing.test.ts`, `orphan-connectors.test.ts`, `quantities.test.ts`, `retrodiction.test.ts`, `stress-tests.test.ts`, `symbolic-composition.test.ts`, `user-equation.test.ts`, `bridge-derivation-audit.test.ts`, `symbolic-exponent.test.ts`, `tensor.test.ts` |
| `composition/grounding.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `grounding.test.ts`, `tensor.test.ts` |
| `composition/identifiability.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `attribute-audit.test.ts`, `axis-gate.test.ts`, `bridge-prediction.test.ts`, `bridge-priority.test.ts`, `calibration-targets.test.ts`, `catalog-full.test.ts`, `catalog-tranche.test.ts`, `compose-properties.test.ts`, `compose.test.ts`, `discovery.test.ts`, `enumerate-uncertainty.test.ts`, `explain.test.ts`, `identifiability.test.ts`, `link-candidates.test.ts`, `linkage-map.test.ts`, `namespacing.test.ts`, `orphan-connectors.test.ts`, `quantities.test.ts`, `retrodiction.test.ts`, `stress-tests.test.ts`, `symbolic-composition.test.ts`, `bridge-derivation-audit.test.ts`, `symbolic-exponent.test.ts`, `tensor.test.ts` |
| `composition/index.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `attribute-audit.test.ts`, `axis-gate.test.ts`, `bridge-prediction.test.ts`, `bridge-priority.test.ts`, `calibration-targets.test.ts`, `catalog-full.test.ts`, `catalog-tranche.test.ts`, `compose-properties.test.ts`, `compose.test.ts`, `discovery.test.ts`, `enumerate-uncertainty.test.ts`, `explain.test.ts`, `identifiability.test.ts`, `link-candidates.test.ts`, `linkage-map.test.ts`, `namespacing.test.ts`, `orphan-connectors.test.ts`, `quantities.test.ts`, `retrodiction.test.ts`, `stress-tests.test.ts`, `symbolic-composition.test.ts`, `bridge-derivation-audit.test.ts`, `symbolic-exponent.test.ts`, `tensor.test.ts` |
| `composition/proposed-bridges.ts` | `graphs.test.ts`, `proposed-bridges.test.ts` |
| `composition/quantities.ts` | `attribute-audit.test.ts`, `quantities.test.ts` |
| `quantities/common.ts` | `attribute-audit.test.ts`, `quantities.test.ts` |
| `quantities/condensed-matter.ts` | `attribute-audit.test.ts`, `quantities.test.ts` |
| `quantities/fields.ts` | `attribute-audit.test.ts`, `quantities.test.ts` |
| `quantities/gravitation-cosmology.ts` | `attribute-audit.test.ts`, `quantities.test.ts` |
| `quantities/quantum.ts` | `attribute-audit.test.ts`, `quantities.test.ts` |
| `composition/quantity.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `attribute-audit.test.ts`, `axis-gate.test.ts`, `bridge-prediction.test.ts`, `bridge-priority.test.ts`, `calibration-targets.test.ts`, `catalog-full.test.ts`, `catalog-tranche.test.ts`, `compose-properties.test.ts`, `compose.test.ts`, `discovery.test.ts`, `enumerate-uncertainty.test.ts`, `explain.test.ts`, `graph-viz.test.ts`, `identifiability.test.ts`, `link-candidates.test.ts`, `linkage-map.test.ts`, `namespacing.test.ts`, `orphan-connectors.test.ts`, `quantities.test.ts`, `retrodiction.test.ts`, `stress-tests.test.ts`, `symbolic-composition.test.ts`, `user-equation.test.ts`, `bridge-derivation-audit.test.ts`, `symbolic-exponent.test.ts`, `tensor.test.ts` |
| `composition/representative-values.ts` | `discovery-magnitude.test.ts` |
| `composition/retrodiction.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `attribute-audit.test.ts`, `axis-gate.test.ts`, `bridge-prediction.test.ts`, `bridge-priority.test.ts`, `calibration-targets.test.ts`, `catalog-full.test.ts`, `catalog-tranche.test.ts`, `compose-properties.test.ts`, `compose.test.ts`, `discovery.test.ts`, `enumerate-uncertainty.test.ts`, `explain.test.ts`, `identifiability.test.ts`, `link-candidates.test.ts`, `linkage-map.test.ts`, `namespacing.test.ts`, `orphan-connectors.test.ts`, `quantities.test.ts`, `retrodiction.test.ts`, `stress-tests.test.ts`, `symbolic-composition.test.ts`, `bridge-derivation-audit.test.ts`, `symbolic-exponent.test.ts`, `tensor.test.ts` |
| `composition/symbolic-constants.ts` | `symbolic-composition.test.ts`, `symbolic-constants-extra.test.ts` |
| `composition/uncertainty.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `attribute-audit.test.ts`, `axis-gate.test.ts`, `bridge-prediction.test.ts`, `bridge-priority.test.ts`, `calibration-targets.test.ts`, `catalog-full.test.ts`, `catalog-tranche.test.ts`, `compose-properties.test.ts`, `compose.test.ts`, `discovery.test.ts`, `enumerate-uncertainty.test.ts`, `explain.test.ts`, `identifiability.test.ts`, `link-candidates.test.ts`, `linkage-map.test.ts`, `namespacing.test.ts`, `orphan-connectors.test.ts`, `quantities.test.ts`, `retrodiction.test.ts`, `stress-tests.test.ts`, `symbolic-composition.test.ts`, `bridge-derivation-audit.test.ts`, `symbolic-exponent.test.ts`, `tensor.test.ts` |
| `composition/user-equation.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `attribute-audit.test.ts`, `axis-gate.test.ts`, `bridge-prediction.test.ts`, `bridge-priority.test.ts`, `calibration-targets.test.ts`, `canonical-graph.test.ts`, `catalog-full.test.ts`, `catalog-tranche.test.ts`, `compose-properties.test.ts`, `compose.test.ts`, `discovery.test.ts`, `enumerate-uncertainty.test.ts`, `explain.test.ts`, `identifiability.test.ts`, `link-candidates.test.ts`, `linkage-map.test.ts`, `namespacing.test.ts`, `orphan-connectors.test.ts`, `quantities.test.ts`, `retrodiction.test.ts`, `stress-tests.test.ts`, `symbolic-composition.test.ts`, `user-equation.test.ts`, `bridge-derivation-audit.test.ts`, `symbolic-exponent.test.ts`, `tensor.test.ts` |
| `core/axes-registry.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `perihelion-precession-labeled.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `axes-registry.test.ts`, `labeled-tensor-axis-order.test.ts`, `labeled-tensor-merge-split.test.ts`, `labeled-tensor.test.ts`, `tensor.test.ts` |
| `core/cell.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `addCell.test.ts`, `cell.test.ts`, `flux-rules.test.ts`, `populated-cells.test.ts`, `regime-rule-install.test.ts`, `tensor.test.ts` |
| `core/constants.ts` | `public-surface.test.ts`, `be-56-casimir.test.ts`, `be-58-johnson-nyquist.test.ts`, `be-62-bcs-gap.test.ts`, `bridge-equations-facade.test.ts`, `perihelion-precession.test.ts`, `public-api-stability.test.ts`, `numeric-prefactor.test.ts`, `graphs.test.ts`, `canonical-graph.test.ts`, `namespacing.test.ts`, `constants.test.ts`, `perfect-fluid.test.ts`, `schwarzschild-riemann.test.ts`, `schwarzschild.test.ts`, `conserved-charge-mercury.test.ts`, `einstein-desitter.test.ts`, `einstein-flrw.test.ts`, `einstein-vacuum-schwarzschild.test.ts`, `geometrized-schwarzschild-equivalence.test.ts`, `geometrized.test.ts`, `gl4-integrator.test.ts`, `killing-schwarzschild.test.ts`, `klein-gordon.test.ts`, `kretschmann-horizon.test.ts`, `kretschmann-schwarzschild.test.ts`, `painleve-gullstrand-curvature.test.ts`, `schwarzschild-radial-geodesic.test.ts`, `weyl-kerr-schild.test.ts`, `weyl-schwarzschild.test.ts`, `tensor.test.ts` |
| `core/flux-rules.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `flux-rules.test.ts`, `populated-cells.test.ts`, `regime-rule-install.test.ts`, `tensor.test.ts` |
| `core/labeled-tensor.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `perihelion-precession-labeled.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `labeled-tensor-axis-order.test.ts`, `labeled-tensor-merge-split.test.ts`, `labeled-tensor.test.ts`, `tensor.test.ts` |
| `core/regime-registry.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `regime-registry.test.ts`, `regime-rule-install.test.ts`, `regimes-builtins.test.ts`, `tensor.test.ts` |
| `core/regime-rule-install.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `regime-registry.test.ts`, `regime-rule-install.test.ts`, `tensor.test.ts` |
| `core/regimes-builtins.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `regime-registry.test.ts`, `regime-rule-install.test.ts`, `regimes-builtins.test.ts`, `tensor.test.ts` |
| `core/tensor.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `catalog-adapter.test.ts`, `public-api-stability.test.ts`, `seed-l-layer.test.ts`, `graphs.test.ts`, `addCell.test.ts`, `populated-cells.test.ts`, `regime-registry.test.ts`, `tensor.test.ts` |
| `core/types.ts` | `public-surface.test.ts`, `be-12-encoding.test.ts`, `be-13-encoding.test.ts`, `be-14-ryu-takayanagi.test.ts`, `be-19-encoding.test.ts`, `be-20-encoding.test.ts`, `be-21-encoding.test.ts`, `be-25-encoding.test.ts`, `be-27-encoding.test.ts`, `be-29-encoding.test.ts`, `be-34-encoding.test.ts`, `be-36-encoding.test.ts`, `be-42-encoding.test.ts`, `be-43-encoding.test.ts`, `be-54-encoding.test.ts`, `be23-planckian-confrontation.test.ts`, `bridge-equations-facade.test.ts`, `catalog-adapter.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `bridge-prediction.test.ts`, `calibration-targets.test.ts`, `catalog-full.test.ts`, `catalog-tranche.test.ts`, `enumerate-uncertainty.test.ts`, `addCell.test.ts`, `populated-cells.test.ts`, `bridge-ast-reencode.test.ts`, `tensor.test.ts` |
| `core/universal-index.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `perihelion-precession-labeled.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `labeled-tensor-merge-split.test.ts`, `labeled-tensor.test.ts`, `universal-index.test.ts`, `tensor.test.ts` |
| `diff/bridge-ast-gradient.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `be-26-ad.test.ts`, `bridge-ast-gradient-byid.test.ts`, `bridge-ast-gradient-transcendental.test.ts`, `bridge-ast-gradient.test.ts`, `bridge-ast-reencode-batch.test.ts`, `bridge-ast-reencode.test.ts`, `integral-ad.test.ts`, `dimensionful-power-ad.test.ts`, `tensor.test.ts` |
| `diff/bridge-gradient.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `bridge-ast-gradient.test.ts`, `bridge-gradient.test.ts`, `tensor.test.ts` |
| `diff/bridge-specs.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `bridge-ast-gradient.test.ts`, `bridge-gradient.test.ts`, `tensor.test.ts` |
| `dimensional/algebra.ts` | `public-surface.test.ts`, `be-11-fix.test.ts`, `be-12-encoding.test.ts`, `be-13-encoding.test.ts`, `be-14-ryu-takayanagi.test.ts`, `be-15-encoding.test.ts`, `be-16-landauer-encoding.test.ts`, `be-17-encoding.test.ts`, `be-19-encoding.test.ts`, `be-22-encoding.test.ts`, `be-23-encoding.test.ts`, `be-25-encoding.test.ts`, `be-26-encoding.test.ts`, `be-34-encoding.test.ts`, `be-35-encoding.test.ts`, `be-37-shapiro-encoding.test.ts`, `be-40-encoding.test.ts`, `be-41-encoding.test.ts`, `be-44-encoding.test.ts`, `be-47-encoding.test.ts`, `be-54-encoding.test.ts`, `bridge-equations-facade.test.ts`, `catalog-grammar-applicability.test.ts`, `dimensional-signature-catalog.test.ts`, `public-api-stability.test.ts`, `atomic.test.ts`, `condensed-matter.test.ts`, `electromagnetism.test.ts`, `fluids-waves.test.ts`, `invariants.test.ts`, `mechanics.test.ts`, `nonmonomial.test.ts`, `statistical-mechanics.test.ts`, `thermo-nuclear-cosmo.test.ts`, `graphs.test.ts`, `calibration-targets.test.ts`, `discovery-canonical-kind.test.ts`, `proposed-bridges.test.ts`, `symbolic-composition.test.ts`, `symbolic-simplification.test.ts`, `algebra-properties.test.ts`, `algebra.test.ts`, `bridge-check.test.ts`, `dimension-inference.test.ts`, `dimensionful-power-ad.test.ts`, `distributional-grammar.test.ts`, `integral-bounds-validation.test.ts`, `symbolic-exponent.test.ts`, `tensor-partial-derivative.test.ts`, `transcendental-validation.test.ts`, `parse-physics.test.ts`, `tensor.test.ts` |
| `dimensional/ast-builders.ts` | `_be-helpers.test.ts`, `dimensional-fields.test.ts`, `ast-builders.test.ts` |
| `dimensional/ast-types.ts` | `public-surface.test.ts`, `be-11-fix.test.ts`, `be-12-encoding.test.ts`, `be-13-encoding.test.ts`, `be-14-ryu-takayanagi.test.ts`, `be-15-encoding.test.ts`, `be-16-landauer-encoding.test.ts`, `be-17-encoding.test.ts`, `be-17-structural.test.ts`, `be-18-encoding.test.ts`, `be-19-encoding.test.ts`, `be-20-encoding.test.ts`, `be-21-encoding.test.ts`, `be-22-encoding.test.ts`, `be-23-encoding.test.ts`, `be-24-encoding.test.ts`, `be-25-encoding.test.ts`, `be-25-iit-encoding.test.ts`, `be-26-encoding.test.ts`, `be-27-encoding.test.ts`, `be-28-onsager-encoding.test.ts`, `be-29-encoding.test.ts`, `be-30-encoding.test.ts`, `be-31-encoding.test.ts`, `be-32-encoding.test.ts`, `be-33-encoding.test.ts`, `be-34-encoding.test.ts`, `be-35-encoding.test.ts`, `be-36-encoding.test.ts`, `be-37-shapiro-eikonal-structural.test.ts`, `be-37-shapiro-encoding.test.ts`, `be-38-encoding.test.ts`, `be-39-encoding.test.ts`, `be-40-encoding.test.ts`, `be-41-encoding.test.ts`, `be-42-encoding.test.ts`, `be-43-encoding.test.ts`, `be-44-encoding.test.ts`, `be-45-encoding.test.ts`, `be-46-encoding.test.ts`, `be-47-encoding.test.ts`, `be-48-encoding.test.ts`, `be-49-encoding.test.ts`, `be-50-encoding.test.ts`, `be-53-encoding.test.ts`, `be-54-encoding.test.ts`, `bridge-equations-facade.test.ts`, `catalog-grammar-applicability.test.ts`, `dimensional-signature-catalog.test.ts`, `_be-helpers.test.ts`, `public-api-stability.test.ts`, `atomic.test.ts`, `condensed-matter.test.ts`, `electromagnetism.test.ts`, `fluids-waves.test.ts`, `invariants.test.ts`, `nonmonomial.test.ts`, `normal-form.test.ts`, `relativity.test.ts`, `statistical-mechanics.test.ts`, `thermo-nuclear-cosmo.test.ts`, `graphs.test.ts`, `collect-symbols-transcendental.test.ts`, `proposed-bridges.test.ts`, `symbolic-composition.test.ts`, `symbolic-simplification.test.ts`, `bridge-ast-gradient-transcendental.test.ts`, `bridge-ast-reencode-batch.test.ts`, `integral-ad.test.ts`, `bianchi-residual.test.ts`, `bridge-check.test.ts`, `christoffel-helper.test.ts`, `connection-validators.test.ts`, `cosmological-constant.test.ts`, `covariant-derivative-node.test.ts`, `covariant-derivative-preview.test.ts`, `curvature-invariants.test.ts`, `derivative-strategy-field.test.ts`, `derivative-strategy-propagation.test.ts`, `dimension-inference.test.ts`, `dimensionful-power-ad.test.ts`, `distributional-grammar.test.ts`, `duplicate-coord-warning.test.ts`, `einstein-equation.test.ts`, `einstein.test.ts`, `equation-valence.test.ts`, `integral-bounds-validation.test.ts`, `integral-derivative-tensor.test.ts`, `killing-validators.test.ts`, `kronecker-delta.test.ts`, `metric-ast-serialization.test.ts`, `metric-helpers.test.ts`, `metric-tensor.test.ts`, `minkowski-curvature.test.ts`, `numerical-form-field.test.ts`, `numerical-form-preservation.test.ts`, `op-tensor-interactions.test.ts`, `raise-lower.test.ts`, `rg-flow.test.ts`, `ricci.test.ts`, `riemann-tensor.test.ts`, `stress-energy-validators.test.ts`, `symbolic-exponent.test.ts`, `tensor-ast-serialization.test.ts`, `tensor-helpers.test.ts`, `tensor-node-types.test.ts`, `tensor-partial-derivative.test.ts`, `tensor-product.test.ts`, `tensor-step-c.test.ts`, `tensor-symbol.test.ts`, `tensor-trace.test.ts`, `transcendental-validation.test.ts`, `validation-result-shape.test.ts`, `validator-probe-ctx.test.ts`, `validator-registry.test.ts`, `validator.test.ts`, `violation-severity.test.ts`, `weyl-validators.test.ts`, `correctness.test.ts`, `evaluate.test.ts`, `integral-quadrature.test.ts`, `lowering-contract.test.ts`, `lowering-covariant-guard.test.ts`, `lowering-deferred-arms.test.ts`, `lowering-utils.test.ts`, `metric-inverse-curvature-walk.test.ts`, `metric-inverse.test.ts`, `riemann-tensor-lowering.test.ts`, `tensor-partial-derivative-lowering.test.ts`, `tensor.test.ts` |
| `dimensional/bridge-check.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `bridge-check.test.ts`, `tensor.test.ts` |
| `dimensional/buckingham.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `dimensional-classics.test.ts`, `dimensional-fields.test.ts`, `graphs.test.ts`, `buckingham.test.ts`, `derivation-benchmark.test.ts`, `tensor.test.ts` |
| `dimensional/connection-validators.ts` | `curvature-invariants.test.ts`, `einstein-equation.test.ts`, `validator-registry.test.ts` |
| `dimensional/connection.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `christoffel-helper.test.ts`, `tensor.test.ts` |
| `dimensional/constants.ts` | `bridge-check.test.ts`, `constants-surface.test.ts`, `validator.test.ts` |
| `dimensional/curvature-composite.ts` | `curvature-composite-factory.test.ts` |
| `dimensional/curvature-invariants.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `curvature-invariants.test.ts`, `validator-registry.test.ts`, `tensor.test.ts` |
| `dimensional/curvature.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `bianchi-residual.test.ts`, `einstein-equation.test.ts`, `einstein.test.ts`, `minkowski-curvature.test.ts`, `ricci.test.ts`, `validator-registry.test.ts`, `tensor.test.ts` |
| `dimensional/dimension-inference.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `dimension-inference.test.ts`, `tensor.test.ts` |
| `dimensional/dimension-spec.ts` | `graphs.test.ts`, `dimension-spec.test.ts` |
| `dimensional/einstein-equation.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `relativity.test.ts`, `graphs.test.ts`, `einstein-equation.test.ts`, `tensor.test.ts` |
| `dimensional/errors.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `connection-validators.test.ts`, `covariant-derivative-preview.test.ts`, `distributional-grammar.test.ts`, `duplicate-coord-warning.test.ts`, `einstein.test.ts`, `error-message-discoverability.test.ts`, `kronecker-delta.test.ts`, `metric-tensor.test.ts`, `metric-validation-errors.test.ts`, `minkowski-curvature.test.ts`, `op-tensor-interactions.test.ts`, `raise-lower.test.ts`, `ricci.test.ts`, `symbolic-exponent.test.ts`, `tensor-partial-derivative.test.ts`, `tensor-product.test.ts`, `tensor-symbol.test.ts`, `uptError.test.ts`, `weyl-validators.test.ts`, `be37-covariant-eikonal-real.test.ts`, `be37-shapiro-step-sweep.test.ts`, `correctness.test.ts`, `covariant-derivative-lowering.test.ts`, `engine-default.test.ts`, `errors.test.ts`, `evaluate.test.ts`, `integral-quadrature.test.ts`, `lowering-covariant-dead-else.test.ts`, `lowering-deferred-arms.test.ts`, `lowering-strategy-cast.test.ts`, `metric-inverse-curvature-walk.test.ts`, `metric-inverse.test.ts`, `riemann-tensor-lowering.test.ts`, `tensor.test.ts` |
| `dimensional/field-equation-helpers.ts` | `field-equation-helpers.test.ts` |
| `dimensional/fresh-label.ts` | `fresh-label.test.ts` |
| `dimensional/friedmann-equation.ts` | `public-surface.test.ts`, `be-19-encoding.test.ts`, `be-54-encoding.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `friedmann-equation.test.ts`, `tensor.test.ts` |
| `dimensional/gauge-field.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `gauge-field.test.ts`, `tensor.test.ts` |
| `dimensional/killing-validators.ts` | `killing-validators.test.ts` |
| `dimensional/klein-gordon-equation.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `friedmann-equation.test.ts`, `klein-gordon-equation.test.ts`, `tensor.test.ts` |
| `dimensional/metric-validators.ts` | `curvature-invariants.test.ts`, `derivative-strategy-field.test.ts`, `einstein-equation.test.ts`, `kronecker-delta.test.ts`, `metric-tensor.test.ts`, `tensor-partial-derivative.test.ts`, `tensor-trace.test.ts`, `validator-registry.test.ts` |
| `dimensional/metric.ts` | `public-api-stability.test.ts`, `bianchi-residual.test.ts`, `christoffel-helper.test.ts`, `connection-validators.test.ts`, `covariant-derivative-node.test.ts`, `covariant-derivative-preview.test.ts`, `derivative-strategy-field.test.ts`, `derivative-strategy-propagation.test.ts`, `duplicate-coord-warning.test.ts`, `einstein-equation.test.ts`, `einstein.test.ts`, `metric-ast-serialization.test.ts`, `metric-helpers.test.ts`, `minkowski-curvature.test.ts`, `numerical-form-preservation.test.ts`, `raise-lower.test.ts`, `ricci.test.ts`, `riemann-tensor.test.ts`, `lowering-utils.test.ts`, `metric-inverse-curvature-walk.test.ts`, `riemann-tensor-lowering.test.ts`, `tensor-partial-derivative-lowering.test.ts` |
| `dimensional/rg-flow.ts` | `public-surface.test.ts`, `be-39-encoding.test.ts`, `be-53-encoding.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `rg-flow.test.ts`, `tensor.test.ts` |
| `dimensional/stress-energy-validators.ts` | `cosmological-constant.test.ts`, `einstein-equation.test.ts`, `stress-energy-validators.test.ts` |
| `dimensional/tensor-trace.ts` | `public-surface.test.ts`, `be-13-encoding.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `tensor-trace.test.ts`, `tensor.test.ts` |
| `dimensional/tensor.ts` | `bianchi-residual.test.ts`, `christoffel-helper.test.ts`, `connection-validators.test.ts`, `covariant-derivative-node.test.ts`, `covariant-derivative-preview.test.ts`, `derivative-strategy-propagation.test.ts`, `distributional-grammar.test.ts`, `duplicate-coord-warning.test.ts`, `einstein-equation.test.ts`, `einstein.test.ts`, `integral-derivative-tensor.test.ts`, `metric-ast-serialization.test.ts`, `metric-helpers.test.ts`, `minkowski-curvature.test.ts`, `numerical-form-field.test.ts`, `numerical-form-preservation.test.ts`, `raise-lower.test.ts`, `ricci.test.ts`, `riemann-tensor.test.ts`, `tensor-helpers.test.ts`, `tensor-partial-derivative.test.ts`, `tensor-product.test.ts`, `tensor-step-c.test.ts`, `correctness.test.ts`, `evaluate.test.ts`, `lowering-contract.test.ts`, `lowering-utils.test.ts`, `metric-inverse-curvature-walk.test.ts`, `metric-inverse.test.ts`, `riemann-tensor-lowering.test.ts`, `tensor-partial-derivative-lowering.test.ts` |
| `dimensional/types.ts` | `public-surface.test.ts`, `be-11-fix.test.ts`, `be-12-encoding.test.ts`, `be-14-ryu-takayanagi.test.ts`, `be-15-encoding.test.ts`, `be-16-landauer-encoding.test.ts`, `be-17-encoding.test.ts`, `be-18-encoding.test.ts`, `be-22-encoding.test.ts`, `be-23-encoding.test.ts`, `be-24-encoding.test.ts`, `be-25-iit-encoding.test.ts`, `be-27-encoding.test.ts`, `be-29-encoding.test.ts`, `be-30-encoding.test.ts`, `be-31-encoding.test.ts`, `be-32-encoding.test.ts`, `be-33-encoding.test.ts`, `be-35-encoding.test.ts`, `be-36-encoding.test.ts`, `be-37-shapiro-eikonal-structural.test.ts`, `be-37-shapiro-encoding.test.ts`, `be-38-encoding.test.ts`, `be-39-encoding.test.ts`, `be-40-encoding.test.ts`, `be-42-encoding.test.ts`, `be-43-encoding.test.ts`, `be-45-encoding.test.ts`, `be-46-encoding.test.ts`, `be-48-encoding.test.ts`, `be-49-encoding.test.ts`, `be-53-encoding.test.ts`, `bridge-equations-facade.test.ts`, `catalog-grammar-applicability.test.ts`, `_be-helpers.test.ts`, `public-api-stability.test.ts`, `atomic.test.ts`, `condensed-matter.test.ts`, `electromagnetism.test.ts`, `fluids-waves.test.ts`, `invariants.test.ts`, `mechanics.test.ts`, `normal-form.test.ts`, `statistical-mechanics.test.ts`, `thermo-nuclear-cosmo.test.ts`, `graphs.test.ts`, `axis-gate.test.ts`, `bridge-prediction.test.ts`, `calibration-targets.test.ts`, `canonical-graph-information-axis.test.ts`, `canonical-graph.test.ts`, `compose-properties.test.ts`, `compose.test.ts`, `dimension-adjacency.test.ts`, `discovery-canonical-kind.test.ts`, `discovery.test.ts`, `enumerate-uncertainty.test.ts`, `explain.test.ts`, `graph-viz.test.ts`, `identifiability.test.ts`, `namespacing.test.ts`, `retrodiction.test.ts`, `symbolic-composition.test.ts`, `symbolic-simplification.test.ts`, `user-equation.test.ts`, `algebra-properties.test.ts`, `algebra.test.ts`, `ast-builders.test.ts`, `bianchi-residual.test.ts`, `bridge-check.test.ts`, `buckingham.test.ts`, `christoffel-helper.test.ts`, `connection-validators.test.ts`, `covariant-derivative-node.test.ts`, `covariant-derivative-preview.test.ts`, `derivation-benchmark.test.ts`, `derivative-strategy-field.test.ts`, `derivative-strategy-propagation.test.ts`, `dimension-inference.test.ts`, `dimension-spec.test.ts`, `dimensionful-power-ad.test.ts`, `distributional-grammar.test.ts`, `duplicate-coord-warning.test.ts`, `einstein-equation.test.ts`, `einstein.test.ts`, `equation-valence.test.ts`, `field-equation-helpers.test.ts`, `friedmann-equation.test.ts`, `gauge-field.test.ts`, `integral-bounds-validation.test.ts`, `integral-derivative-tensor.test.ts`, `klein-gordon-equation.test.ts`, `kronecker-delta.test.ts`, `metric-ast-serialization.test.ts`, `metric-helpers.test.ts`, `metric-tensor.test.ts`, `minkowski-curvature.test.ts`, `numerical-form-field.test.ts`, `numerical-form-preservation.test.ts`, `raise-lower.test.ts`, `rg-flow.test.ts`, `ricci.test.ts`, `riemann-tensor.test.ts`, `symbolic-exponent.test.ts`, `tensor-node-types.test.ts`, `tensor-partial-derivative.test.ts`, `tensor-step-c.test.ts`, `tensor-trace.test.ts`, `transcendental-validation.test.ts`, `validator-probe-ctx.test.ts`, `validator.test.ts`, `violation-severity.test.ts`, `correctness.test.ts`, `evaluate.test.ts`, `formula-dimension.test.ts`, `geometrized-schwarzschild-equivalence.test.ts`, `geometrized.test.ts`, `integral-quadrature.test.ts`, `lowering-contract.test.ts`, `lowering-covariant-guard.test.ts`, `lowering-utils.test.ts`, `metric-inverse-curvature-walk.test.ts`, `metric-inverse.test.ts`, `parse-physics.test.ts`, `riemann-tensor-lowering.test.ts`, `tensor-partial-derivative-lowering.test.ts`, `tensor.test.ts` |
| `dimensional/validator-registry.ts` | `validator-registry.test.ts` |
| `dimensional/validator.ts` | `public-surface.test.ts`, `be-11-fix.test.ts`, `be-12-encoding.test.ts`, `be-13-encoding.test.ts`, `be-14-ryu-takayanagi.test.ts`, `be-15-encoding.test.ts`, `be-16-landauer-encoding.test.ts`, `be-17-encoding.test.ts`, `be-17-structural.test.ts`, `be-18-encoding.test.ts`, `be-19-encoding.test.ts`, `be-20-encoding.test.ts`, `be-21-encoding.test.ts`, `be-22-encoding.test.ts`, `be-23-encoding.test.ts`, `be-24-encoding.test.ts`, `be-25-encoding.test.ts`, `be-25-iit-encoding.test.ts`, `be-26-encoding.test.ts`, `be-27-encoding.test.ts`, `be-28-onsager-encoding.test.ts`, `be-29-encoding.test.ts`, `be-30-encoding.test.ts`, `be-31-encoding.test.ts`, `be-32-encoding.test.ts`, `be-33-encoding.test.ts`, `be-34-encoding.test.ts`, `be-35-encoding.test.ts`, `be-36-encoding.test.ts`, `be-37-shapiro-eikonal-structural.test.ts`, `be-37-shapiro-encoding.test.ts`, `be-38-encoding.test.ts`, `be-39-encoding.test.ts`, `be-40-encoding.test.ts`, `be-41-encoding.test.ts`, `be-42-encoding.test.ts`, `be-43-encoding.test.ts`, `be-44-encoding.test.ts`, `be-45-encoding.test.ts`, `be-46-encoding.test.ts`, `be-47-encoding.test.ts`, `be-48-encoding.test.ts`, `be-49-encoding.test.ts`, `be-50-encoding.test.ts`, `be-53-encoding.test.ts`, `be-54-encoding.test.ts`, `bridge-equations-facade.test.ts`, `catalog-grammar-applicability.test.ts`, `dimensional-signature-catalog.test.ts`, `_be-helpers.test.ts`, `public-api-stability.test.ts`, `atomic.test.ts`, `condensed-matter.test.ts`, `electromagnetism.test.ts`, `fluids-waves.test.ts`, `invariants.test.ts`, `nonmonomial.test.ts`, `normal-form.test.ts`, `relativity.test.ts`, `statistical-mechanics.test.ts`, `thermo-nuclear-cosmo.test.ts`, `graphs.test.ts`, `collect-symbols-transcendental.test.ts`, `proposed-bridges.test.ts`, `symbolic-composition.test.ts`, `symbolic-simplification.test.ts`, `bridge-ast-gradient-transcendental.test.ts`, `bridge-ast-reencode-batch.test.ts`, `integral-ad.test.ts`, `bianchi-residual.test.ts`, `bridge-check.test.ts`, `christoffel-helper.test.ts`, `connection-validators.test.ts`, `cosmological-constant.test.ts`, `covariant-derivative-node.test.ts`, `covariant-derivative-preview.test.ts`, `curvature-invariants.test.ts`, `dimension-inference.test.ts`, `dimensionful-power-ad.test.ts`, `distributional-grammar.test.ts`, `duplicate-coord-warning.test.ts`, `einstein.test.ts`, `equation-valence.test.ts`, `integral-bounds-validation.test.ts`, `integral-derivative-tensor.test.ts`, `killing-validators.test.ts`, `kronecker-delta.test.ts`, `metric-ast-serialization.test.ts`, `metric-tensor.test.ts`, `minkowski-curvature.test.ts`, `numerical-form-preservation.test.ts`, `op-tensor-interactions.test.ts`, `raise-lower.test.ts`, `rg-flow.test.ts`, `ricci.test.ts`, `riemann-tensor.test.ts`, `stress-energy-validators.test.ts`, `symbolic-exponent.test.ts`, `tensor-ast-serialization.test.ts`, `tensor-helpers.test.ts`, `tensor-node-types.test.ts`, `tensor-partial-derivative.test.ts`, `tensor-product.test.ts`, `tensor-step-c.test.ts`, `tensor-symbol.test.ts`, `transcendental-validation.test.ts`, `validation-result-shape.test.ts`, `validator-probe-ctx.test.ts`, `validator.test.ts`, `violation-severity.test.ts`, `weyl-validators.test.ts`, `correctness.test.ts`, `evaluate.test.ts`, `integral-quadrature.test.ts`, `lowering-contract.test.ts`, `lowering-covariant-guard.test.ts`, `lowering-deferred-arms.test.ts`, `lowering-utils.test.ts`, `metric-inverse-curvature-walk.test.ts`, `metric-inverse.test.ts`, `riemann-tensor-lowering.test.ts`, `tensor.test.ts` |
| `dimensional/weyl-validators.ts` | `weyl-validators.test.ts` |
| `src/index.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `tensor.test.ts` |
| `numerical/be37-covariant-eikonal.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `covariant-derivative-preview.test.ts`, `duplicate-coord-warning.test.ts`, `einstein.test.ts`, `minkowski-curvature.test.ts`, `ricci.test.ts`, `be37-covariant-eikonal-real.test.ts`, `be37-shapiro-step-sweep.test.ts`, `correctness.test.ts`, `covariant-derivative-lowering.test.ts`, `engine-default.test.ts`, `evaluate.test.ts`, `integral-quadrature.test.ts`, `lowering-covariant-dead-else.test.ts`, `lowering-deferred-arms.test.ts`, `lowering-strategy-cast.test.ts`, `metric-inverse-curvature-walk.test.ts`, `metric-inverse.test.ts`, `riemann-tensor-lowering.test.ts`, `tensor.test.ts` |
| `numerical/christoffel-flat.ts` | `christoffel-flat-indexing.test.ts`, `christoffel-flat.test.ts` |
| `numerical/connection-lowering-helpers.ts` | `christoffel-precompute.test.ts`, `connection-lowering-helpers.test.ts`, `connection-lowering-nonfinite.test.ts`, `flatten-na-accuracy.test.ts`, `foreach-multi-index.test.ts`, `lowering-strategy-cast.test.ts` |
| `numerical/curvature-lowering-helpers.ts` | `bianchi-residual.test.ts`, `schwarzschild-riemann.test.ts`, `geometrized-schwarzschild-equivalence.test.ts`, `kretschmann-factored-raising.test.ts`, `kretschmann-horizon.test.ts`, `kretschmann-schwarzschild.test.ts`, `painleve-gullstrand-curvature.test.ts`, `weyl-schwarzschild.test.ts` |
| `numerical/derivative-lowering.ts` | `tensor-partial-derivative-lowering.test.ts` |
| `numerical/einstein-equation.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `einstein-desitter.test.ts`, `einstein-flrw.test.ts`, `einstein-vacuum-schwarzschild.test.ts`, `tensor.test.ts` |
| `numerical/engine-registry.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `covariant-derivative-preview.test.ts`, `duplicate-coord-warning.test.ts`, `einstein.test.ts`, `minkowski-curvature.test.ts`, `ricci.test.ts`, `be37-covariant-eikonal-real.test.ts`, `be37-shapiro-step-sweep.test.ts`, `correctness.test.ts`, `covariant-derivative-lowering.test.ts`, `engine-default.test.ts`, `evaluate.test.ts`, `integral-quadrature.test.ts`, `lowering-covariant-dead-else.test.ts`, `lowering-deferred-arms.test.ts`, `lowering-strategy-cast.test.ts`, `metric-inverse-curvature-walk.test.ts`, `metric-inverse.test.ts`, `riemann-tensor-lowering.test.ts`, `tensor.test.ts` |
| `numerical/errors.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `bridge-gradient.test.ts`, `covariant-derivative-preview.test.ts`, `duplicate-coord-warning.test.ts`, `einstein.test.ts`, `minkowski-curvature.test.ts`, `ricci.test.ts`, `be37-covariant-eikonal-real.test.ts`, `be37-shapiro-step-sweep.test.ts`, `correctness.test.ts`, `covariant-derivative-lowering.test.ts`, `engine-default.test.ts`, `errors.test.ts`, `evaluate.test.ts`, `integral-quadrature.test.ts`, `lowering-covariant-dead-else.test.ts`, `lowering-covariant-guard.test.ts`, `lowering-deferred-arms.test.ts`, `lowering-strategy-cast.test.ts`, `metric-inverse-curvature-walk.test.ts`, `metric-inverse.test.ts`, `riemann-tensor-lowering.test.ts`, `tensor.test.ts` |
| `numerical/float64-engine.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `perihelion-precession-labeled.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `labeled-tensor-axis-order.test.ts`, `labeled-tensor-merge-split.test.ts`, `labeled-tensor.test.ts`, `bridge-gradient.test.ts`, `bianchi-residual.test.ts`, `covariant-derivative-preview.test.ts`, `duplicate-coord-warning.test.ts`, `einstein.test.ts`, `minkowski-curvature.test.ts`, `ricci.test.ts`, `schwarzschild-riemann.test.ts`, `be37-covariant-eikonal-real.test.ts`, `be37-shapiro-step-sweep.test.ts`, `christoffel-precompute.test.ts`, `connection-lowering-nonfinite.test.ts`, `correctness.test.ts`, `covariant-derivative-lowering.test.ts`, `einsum-precompute.test.ts`, `einsum-properties.test.ts`, `engine-capability.test.ts`, `engine-conformance.float64.test.ts`, `engine-conformance.test.ts`, `engine-default.test.ts`, `evaluate.test.ts`, `float64-autograd.test.ts`, `float64-engine-ad-dispatch.test.ts`, `foreach-multi-index.test.ts`, `geometrized-schwarzschild-equivalence.test.ts`, `integral-quadrature.test.ts`, `kretschmann-factored-raising.test.ts`, `kretschmann-horizon.test.ts`, `kretschmann-schwarzschild.test.ts`, `lowering-contract.test.ts`, `lowering-covariant-dead-else.test.ts`, `lowering-covariant-guard.test.ts`, `lowering-deferred-arms.test.ts`, `lowering-strategy-cast.test.ts`, `mathts-engine-typing.test.ts`, `metric-inverse-curvature-walk.test.ts`, `metric-inverse.test.ts`, `painleve-gullstrand-curvature.test.ts`, `riemann-tensor-lowering.test.ts`, `tensor-partial-derivative-lowering.test.ts`, `weyl-schwarzschild.test.ts`, `tensor.test.ts` |
| `numerical/formula-dimension.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `dimension-inference.test.ts`, `formula-dimension.test.ts`, `parse-physics.test.ts`, `tensor.test.ts` |
| `numerical/formula-mathts.ts` | `formula-conformance.mathts.test.ts`, `formula-mathts.test.ts` |
| `numerical/formula-registry.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `formula-registry.test.ts`, `parse-physics.test.ts`, `tensor.test.ts` |
| `numerical/formula.ts` | `finiteness-guards.test.ts`, `formula-conformance.builtin.test.ts`, `formula-mathts.test.ts`, `formula.test.ts` |
| `numerical/geodesic-integrator.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `gravitational-lensing.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `schwarzschild-radial-geodesic.test.ts`, `tensor.test.ts` |
| `numerical/geometrized.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `geometrized-schwarzschild-equivalence.test.ts`, `geometrized.test.ts`, `tensor.test.ts` |
| `numerical/gl4-integrator.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `perihelion-precession.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `covariant-derivative-preview.test.ts`, `duplicate-coord-warning.test.ts`, `einstein.test.ts`, `minkowski-curvature.test.ts`, `ricci.test.ts`, `be37-covariant-eikonal-real.test.ts`, `be37-shapiro-step-sweep.test.ts`, `conserved-charge-mercury.test.ts`, `correctness.test.ts`, `covariant-derivative-lowering.test.ts`, `engine-default.test.ts`, `evaluate.test.ts`, `gl4-butcher-tableau.test.ts`, `gl4-integrator.test.ts`, `gl4-stage-solver.test.ts`, `gl4-step-halving.test.ts`, `integral-quadrature.test.ts`, `lowering-covariant-dead-else.test.ts`, `lowering-deferred-arms.test.ts`, `lowering-strategy-cast.test.ts`, `metric-inverse-curvature-walk.test.ts`, `metric-inverse.test.ts`, `perihelion-finder-roundtrip.test.ts`, `riemann-tensor-lowering.test.ts`, `tensor.test.ts` |
| `numerical/grid-field.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `covariant-derivative-preview.test.ts`, `duplicate-coord-warning.test.ts`, `einstein.test.ts`, `minkowski-curvature.test.ts`, `ricci.test.ts`, `be37-covariant-eikonal-real.test.ts`, `be37-shapiro-step-sweep.test.ts`, `correctness.test.ts`, `covariant-derivative-lowering.test.ts`, `engine-default.test.ts`, `evaluate.test.ts`, `integral-quadrature.test.ts`, `lowering-covariant-dead-else.test.ts`, `lowering-deferred-arms.test.ts`, `lowering-strategy-cast.test.ts`, `metric-inverse-curvature-walk.test.ts`, `metric-inverse.test.ts`, `pderiv.test.ts`, `riemann-tensor-lowering.test.ts`, `tensor.test.ts` |
| `numerical/index.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `covariant-derivative-preview.test.ts`, `duplicate-coord-warning.test.ts`, `einstein.test.ts`, `minkowski-curvature.test.ts`, `ricci.test.ts`, `be37-covariant-eikonal-real.test.ts`, `be37-shapiro-step-sweep.test.ts`, `correctness.test.ts`, `covariant-derivative-lowering.test.ts`, `engine-default.test.ts`, `evaluate.test.ts`, `integral-quadrature.test.ts`, `lowering-covariant-dead-else.test.ts`, `lowering-deferred-arms.test.ts`, `lowering-strategy-cast.test.ts`, `metric-inverse-curvature-walk.test.ts`, `metric-inverse.test.ts`, `riemann-tensor-lowering.test.ts`, `tensor.test.ts` |
| `numerical/input-validation.ts` | `_be-helpers.test.ts` |
| `numerical/killing.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `conserved-charge-mercury.test.ts`, `killing-schwarzschild.test.ts`, `tensor.test.ts` |
| `numerical/klein-gordon.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `klein-gordon.test.ts`, `tensor.test.ts` |
| `numerical/kretschmann.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `geometrized-schwarzschild-equivalence.test.ts`, `kretschmann-factored-raising.test.ts`, `kretschmann-horizon.test.ts`, `kretschmann-schwarzschild.test.ts`, `painleve-gullstrand-curvature.test.ts`, `tensor.test.ts` |
| `numerical/lowering-utils.ts` | `lowering-utils.test.ts` |
| `numerical/lowering.ts` | `lowering-contract.test.ts`, `lowering-covariant-guard.test.ts`, `lowering-deferred-arms.test.ts` |
| `numerical/mathts-engine.ts` | `be-26-ad.test.ts`, `bridge-ast-gradient-byid.test.ts`, `bridge-ast-gradient-transcendental.test.ts`, `bridge-ast-gradient.test.ts`, `bridge-ast-reencode-batch.test.ts`, `bridge-ast-reencode.test.ts`, `bridge-gradient.test.ts`, `integral-ad.test.ts`, `dimensionful-power-ad.test.ts`, `engine-conformance.mathts.test.ts`, `engine-conformance.test.ts`, `mathts-autograd.test.ts`, `mathts-engine-typing.test.ts` |
| `numerical/metric-inverse.ts` | `lowering-utils.test.ts` |
| `numerical/null-ic.ts` | `null-ic.test.ts` |
| `numerical/null-ray-integrator.ts` | `null-ray-integrator.test.ts` |
| `numerical/painleve-gullstrand-metric.ts` | `kretschmann-factored-raising.test.ts`, `painleve-gullstrand-curvature.test.ts` |
| `numerical/pderiv.ts` | `metric-deriv-supplied.test.ts`, `pderiv-flatten-consolidation.test.ts`, `pderiv-order-default.test.ts`, `pderiv-order.test.ts`, `pderiv.test.ts` |
| `numerical/perihelion-finder.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `perihelion-precession.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `covariant-derivative-preview.test.ts`, `duplicate-coord-warning.test.ts`, `einstein.test.ts`, `minkowski-curvature.test.ts`, `ricci.test.ts`, `be37-covariant-eikonal-real.test.ts`, `be37-shapiro-step-sweep.test.ts`, `correctness.test.ts`, `covariant-derivative-lowering.test.ts`, `engine-default.test.ts`, `evaluate.test.ts`, `integral-quadrature.test.ts`, `lowering-covariant-dead-else.test.ts`, `lowering-deferred-arms.test.ts`, `lowering-strategy-cast.test.ts`, `metric-inverse-curvature-walk.test.ts`, `metric-inverse.test.ts`, `perihelion-finder-roundtrip.test.ts`, `perihelion-finder.test.ts`, `riemann-tensor-lowering.test.ts`, `tensor.test.ts` |
| `numerical/quadrature.ts` | `finiteness-guards.test.ts`, `integral-quadrature.test.ts` |
| `numerical/strides.ts` | `strides.test.ts` |
| `numerical/tensor-engine.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `be-26-ad.test.ts`, `bridge-ast-gradient-byid.test.ts`, `bridge-ast-gradient-transcendental.test.ts`, `bridge-ast-gradient.test.ts`, `bridge-ast-reencode-batch.test.ts`, `bridge-ast-reencode.test.ts`, `bridge-gradient.test.ts`, `integral-ad.test.ts`, `covariant-derivative-preview.test.ts`, `dimensionful-power-ad.test.ts`, `duplicate-coord-warning.test.ts`, `einstein.test.ts`, `minkowski-curvature.test.ts`, `ricci.test.ts`, `be37-covariant-eikonal-real.test.ts`, `be37-shapiro-step-sweep.test.ts`, `correctness.test.ts`, `covariant-derivative-lowering.test.ts`, `einsum-precompute.test.ts`, `engine-capability.test.ts`, `engine-default.test.ts`, `evaluate.test.ts`, `float64-autograd.test.ts`, `integral-quadrature.test.ts`, `lowering-covariant-dead-else.test.ts`, `lowering-deferred-arms.test.ts`, `lowering-strategy-cast.test.ts`, `mathts-autograd.test.ts`, `mathts-engine-typing.test.ts`, `metric-inverse-curvature-walk.test.ts`, `metric-inverse.test.ts`, `riemann-tensor-lowering.test.ts`, `tensor-engine-types.test.ts`, `tensor.test.ts` |
| `numerical/types.ts` | `public-surface.test.ts`, `bridge-equations-facade.test.ts`, `public-api-stability.test.ts`, `graphs.test.ts`, `covariant-derivative-preview.test.ts`, `duplicate-coord-warning.test.ts`, `einstein.test.ts`, `minkowski-curvature.test.ts`, `ricci.test.ts`, `be37-covariant-eikonal-real.test.ts`, `be37-shapiro-step-sweep.test.ts`, `connection-lowering-helpers.test.ts`, `correctness.test.ts`, `covariant-derivative-lowering.test.ts`, `engine-default.test.ts`, `evaluate.test.ts`, `integral-quadrature.test.ts`, `lowering-contract.test.ts`, `lowering-covariant-dead-else.test.ts`, `lowering-covariant-guard.test.ts`, `lowering-deferred-arms.test.ts`, `lowering-strategy-cast.test.ts`, `lowering-utils.test.ts`, `metric-inverse-curvature-walk.test.ts`, `metric-inverse.test.ts`, `pderiv.test.ts`, `riemann-tensor-lowering.test.ts`, `tensor-engine-types.test.ts`, `tensor-partial-derivative-lowering.test.ts`, `tensor.test.ts` |
| `numerical/weyl-lowering.ts` | `weyl-kerr-schild.test.ts`, `weyl-schwarzschild.test.ts` |

---

## Test File Details

| Test File | Imports from Source |
|-----------|---------------------|
| `api/public-surface.test.ts` | 126 files |
| `api/public-tag-vs-index-invariant.test.ts` | 0 files |
| `bridges/be-11-fix.test.ts` | 19 files |
| `bridges/be-12-encoding.test.ts` | 6 files |
| `bridges/be-12-reformulation.test.ts` | 0 files |
| `bridges/be-13-encoding.test.ts` | 6 files |
| `bridges/be-13-reformulation.test.ts` | 0 files |
| `bridges/be-14-ryu-takayanagi.test.ts` | 20 files |
| `bridges/be-15-encoding.test.ts` | 5 files |
| `bridges/be-15-reformulation.test.ts` | 0 files |
| `bridges/be-16-landauer-encoding.test.ts` | 5 files |
| `bridges/be-17-encoding.test.ts` | 5 files |
| `bridges/be-17-reformulation.test.ts` | 0 files |
| `bridges/be-17-structural.test.ts` | 3 files |
| `bridges/be-18-encoding.test.ts` | 4 files |
| `bridges/be-18-fix.test.ts` | 14 files |
| `bridges/be-19-encoding.test.ts` | 6 files |
| `bridges/be-20-encoding.test.ts` | 4 files |
| `bridges/be-21-encoding.test.ts` | 4 files |
| `bridges/be-22-encoding.test.ts` | 5 files |
| `bridges/be-23-encoding.test.ts` | 5 files |
| `bridges/be-23-reformulation.test.ts` | 0 files |
| `bridges/be-24-encoding.test.ts` | 4 files |
| `bridges/be-24-reformulation.test.ts` | 0 files |
| `bridges/be-25-encoding.test.ts` | 5 files |
| `bridges/be-25-iit-encoding.test.ts` | 4 files |
| `bridges/be-25-reformulation.test.ts` | 0 files |
| `bridges/be-26-encoding.test.ts` | 4 files |
| `bridges/be-27-encoding.test.ts` | 5 files |
| `bridges/be-28-onsager-encoding.test.ts` | 3 files |
| `bridges/be-29-encoding.test.ts` | 5 files |
| `bridges/be-29-fix.test.ts` | 14 files |
| `bridges/be-30-encoding.test.ts` | 4 files |
| `bridges/be-30-reformulation.test.ts` | 0 files |
| `bridges/be-31-encoding.test.ts` | 4 files |
| `bridges/be-31-reformulation.test.ts` | 0 files |
| `bridges/be-32-encoding.test.ts` | 4 files |
| `bridges/be-33-encoding.test.ts` | 4 files |
| `bridges/be-33-reformulation.test.ts` | 0 files |
| `bridges/be-34-encoding.test.ts` | 5 files |
| `bridges/be-35-encoding.test.ts` | 5 files |
| `bridges/be-36-encoding.test.ts` | 5 files |
| `bridges/be-36-reformulation.test.ts` | 0 files |
| `bridges/be-37-numerical-eikonal.test.ts` | 1 files |
| `bridges/be-37-r3-disposition.test.ts` | 0 files |
| `bridges/be-37-shapiro-eikonal-structural.test.ts` | 4 files |
| `bridges/be-37-shapiro-encoding.test.ts` | 5 files |
| `bridges/be-38-encoding.test.ts` | 4 files |
| `bridges/be-38-reformulation.test.ts` | 0 files |
| `bridges/be-39-encoding.test.ts` | 5 files |
| `bridges/be-40-encoding.test.ts` | 5 files |
| `bridges/be-41-encoding.test.ts` | 4 files |
| `bridges/be-42-encoding.test.ts` | 5 files |
| `bridges/be-43-encoding.test.ts` | 5 files |
| `bridges/be-43-reformulation.test.ts` | 0 files |
| `bridges/be-44-encoding.test.ts` | 4 files |
| `bridges/be-45-encoding.test.ts` | 4 files |
| `bridges/be-46-encoding.test.ts` | 4 files |
| `bridges/be-47-encoding.test.ts` | 4 files |
| `bridges/be-47-fix.test.ts` | 14 files |
| `bridges/be-48-encoding.test.ts` | 4 files |
| `bridges/be-48-fix.test.ts` | 14 files |
| `bridges/be-49-encoding.test.ts` | 4 files |
| `bridges/be-50-encoding.test.ts` | 3 files |
| `bridges/be-50-reformulation.test.ts` | 0 files |
| `bridges/be-51-gravitational-lensing-structural.test.ts` | 0 files |
| `bridges/be-52-perihelion-precession-structural.test.ts` | 0 files |
| `bridges/be-53-encoding.test.ts` | 5 files |
| `bridges/be-54-encoding.test.ts` | 6 files |
| `bridges/be-55-quantum-hall.test.ts` | 17 files |
| `bridges/be-56-casimir.test.ts` | 18 files |
| `bridges/be-57-unruh.test.ts` | 16 files |
| `bridges/be-58-johnson-nyquist.test.ts` | 18 files |
| `bridges/be-59-ac-josephson.test.ts` | 17 files |
| `bridges/be-60-fractional-qh.test.ts` | 17 files |
| `bridges/be-61-wiedemann-franz.test.ts` | 17 files |
| `bridges/be-62-bcs-gap.test.ts` | 18 files |
| `bridges/be-63-chandrasekhar-mass.test.ts` | 16 files |
| `bridges/be-64-eddington-luminosity.test.ts` | 16 files |
| `bridges/be-65-jeans-mass.test.ts` | 17 files |
| `bridges/be11-decoherence-confrontation.test.ts` | 3 files |
| `bridges/be21-kss-confrontation.test.ts` | 3 files |
| `bridges/be23-planckian-confrontation.test.ts` | 3 files |
| `bridges/be35-bootstrap-confrontation.test.ts` | 3 files |
| `bridges/be36-gw170817-confrontation.test.ts` | 2 files |
| `bridges/be37-cassini.test.ts` | 3 files |
| `bridges/be48-collapse.test.ts` | 3 files |
| `bridges/be51-lensing-confrontation.test.ts` | 3 files |
| `bridges/be52-mercury-confrontation.test.ts` | 1 files |
| `bridges/bridge-equations-facade.test.ts` | 130 files |
| `bridges/catalog-adapter.test.ts` | 17 files |
| `bridges/catalog-grammar-applicability.test.ts` | 7 files |
| `bridges/catalog-integrity.test.ts` | 14 files |
| `bridges/catalog-json.test.ts` | 16 files |
| `bridges/confrontation-coverage.test.ts` | 1 files |
| `bridges/confrontation-registry.test.ts` | 16 files |
| `bridges/confrontation-rigor.test.ts` | 2 files |
| `bridges/descriptor-consistency.test.ts` | 17 files |
| `bridges/dimensional-signature-catalog.test.ts` | 18 files |
| `equations/_be-helpers.test.ts` | 6 files |
| `bridges/evaluators.test.ts` | 1 files |
| `bridges/gravitational-lensing.test.ts` | 2 files |
| `bridges/membership.test.ts` | 16 files |
| `bridges/observation-types.test.ts` | 1 files |
| `bridges/orphan-dimensional-signature.test.ts` | 14 files |
| `bridges/perihelion-precession-labeled.test.ts` | 6 files |
| `bridges/perihelion-precession.test.ts` | 4 files |
| `bridges/public-api-stability.test.ts` | 127 files |
| `bridges/sensitivity.test.ts` | 1 files |
| `bridges/spec-vs-index.test.ts` | 14 files |
| `tests/bridges-index.test.ts` | 14 files |
| `canonical/atomic.test.ts` | 5 files |
| `canonical/condensed-matter.test.ts` | 5 files |
| `canonical/dimensional-classics.test.ts` | 2 files |
| `canonical/dimensional-fields.test.ts` | 3 files |
| `canonical/electromagnetism.test.ts` | 5 files |
| `canonical/fluids-waves.test.ts` | 5 files |
| `canonical/invariants.test.ts` | 19 files |
| `canonical/linkage.test.ts` | 3 files |
| `canonical/mechanics.test.ts` | 3 files |
| `canonical/nonmonomial.test.ts` | 5 files |
| `canonical/normal-form.test.ts` | 4 files |
| `canonical/numeric-prefactor.test.ts` | 3 files |
| `canonical/registry.test.ts` | 1 files |
| `canonical/relativity.test.ts` | 5 files |
| `canonical/seed-l-layer.test.ts` | 3 files |
| `canonical/statistical-mechanics.test.ts` | 5 files |
| `canonical/thermo-nuclear-cosmo.test.ts` | 5 files |
| `cli/args.test.ts` | 2 files |
| `cli/confront.test.ts` | 20 files |
| `cli/explain-bridge-redirect.test.ts` | 20 files |
| `cli/graphs.test.ts` | 135 files |
| `cli/hardening.test.ts` | 0 files |
| `cli/inprocess-golden.test.ts` | 20 files |
| `cli/json-contract.test.ts` | 20 files |
| `cli/main-dispatch.test.ts` | 23 files |
| `cli/new-commands.test.ts` | 20 files |
| `cli/output.test.ts` | 2 files |
| `cli/source-extension.test.ts` | 20 files |
| `cli/upt-derive.test.ts` | 0 files |
| `cli/upt-discover-opts.test.ts` | 20 files |
| `cli/upt-explain-inputs.test.ts` | 0 files |
| `cli/upt-golden.test.ts` | 0 files |
| `cli/upt-map-format.test.ts` | 0 files |
| `cli/upt-parse.test.ts` | 0 files |
| `composition/adjudication-annotate.test.ts` | 2 files |
| `composition/adjudication-id.test.ts` | 1 files |
| `composition/adjudication-registry.test.ts` | 1 files |
| `composition/attribute-audit.test.ts` | 32 files |
| `composition/axes.test.ts` | 1 files |
| `composition/axis-audit.test.ts` | 2 files |
| `composition/axis-gate.test.ts` | 28 files |
| `composition/bridge-prediction.test.ts` | 28 files |
| `composition/bridge-priority.test.ts` | 26 files |
| `composition/calibration-targets.test.ts` | 28 files |
| `composition/canonical-graph-information-axis.test.ts` | 4 files |
| `composition/canonical-graph.test.ts` | 9 files |
| `composition/catalog-full.test.ts` | 41 files |
| `composition/catalog-tranche.test.ts` | 40 files |
| `composition/collect-symbols-transcendental.test.ts` | 3 files |
| `composition/compose-properties.test.ts` | 26 files |
| `composition/compose.test.ts` | 26 files |
| `composition/consequence.test.ts` | 5 files |
| `composition/dimension-adjacency.test.ts` | 2 files |
| `composition/discovery-calibration.test.ts` | 4 files |
| `composition/discovery-canonical-kind.test.ts` | 4 files |
| `composition/discovery-magnitude.test.ts` | 3 files |
| `composition/discovery.test.ts` | 28 files |
| `composition/enumerate-uncertainty.test.ts` | 28 files |
| `composition/explain.test.ts` | 26 files |
| `composition/graph-viz-svg.test.ts` | 3 files |
| `composition/graph-viz.test.ts` | 6 files |
| `composition/grounding.test.ts` | 2 files |
| `composition/identifiability.test.ts` | 26 files |
| `composition/link-candidates.test.ts` | 26 files |
| `composition/linkage-map.test.ts` | 26 files |
| `composition/namespacing.test.ts` | 27 files |
| `composition/orphan-connectors.test.ts` | 26 files |
| `composition/proposed-bridges.test.ts` | 22 files |
| `composition/quantities.test.ts` | 31 files |
| `composition/retrodiction.test.ts` | 26 files |
| `composition/stress-tests.test.ts` | 25 files |
| `composition/symbolic-composition.test.ts` | 31 files |
| `composition/symbolic-constants-extra.test.ts` | 1 files |
| `composition/symbolic-simplification.test.ts` | 8 files |
| `composition/user-equation.test.ts` | 5 files |
| `core/addCell.test.ts` | 3 files |
| `core/axes-registry.test.ts` | 1 files |
| `core/cell.test.ts` | 1 files |
| `core/constants.test.ts` | 1 files |
| `core/flux-rules.test.ts` | 2 files |
| `core/labeled-tensor-axis-order.test.ts` | 3 files |
| `core/labeled-tensor-merge-split.test.ts` | 4 files |
| `core/labeled-tensor.test.ts` | 4 files |
| `core/populated-cells.test.ts` | 4 files |
| `core/regime-registry.test.ts` | 4 files |
| `core/regime-rule-install.test.ts` | 5 files |
| `core/regimes-builtins.test.ts` | 2 files |
| `core/universal-index.test.ts` | 1 files |
| `diff/be-26-ad.test.ts` | 4 files |
| `diff/bridge-ast-gradient-byid.test.ts` | 5 files |
| `diff/bridge-ast-gradient-transcendental.test.ts` | 5 files |
| `diff/bridge-ast-gradient.test.ts` | 6 files |
| `diff/bridge-ast-reencode-batch.test.ts` | 5 files |
| `diff/bridge-ast-reencode.test.ts` | 4 files |
| `diff/bridge-gradient.test.ts` | 6 files |
| `diff/integral-ad.test.ts` | 5 files |
| `dimensional/algebra-properties.test.ts` | 2 files |
| `dimensional/algebra.test.ts` | 2 files |
| `dimensional/ast-builders.test.ts` | 2 files |
| `dimensional/bianchi-residual.test.ts` | 8 files |
| `dimensional/bridge-check.test.ts` | 13 files |
| `dimensional/bridge-derivation-audit.test.ts` | 26 files |
| `dimensional/buckingham.test.ts` | 2 files |
| `dimensional/christoffel-helper.test.ts` | 6 files |
| `dimensional/connection-validators.test.ts` | 6 files |
| `dimensional/constants-surface.test.ts` | 1 files |
| `dimensional/cosmological-constant.test.ts` | 3 files |
| `dimensional/covariant-derivative-node.test.ts` | 5 files |
| `dimensional/covariant-derivative-preview.test.ts` | 17 files |
| `dimensional/curvature-composite-factory.test.ts` | 1 files |
| `dimensional/curvature-invariants.test.ts` | 5 files |
| `dimensional/derivation-benchmark.test.ts` | 2 files |
| `dimensional/derivative-strategy-field.test.ts` | 4 files |
| `dimensional/derivative-strategy-propagation.test.ts` | 4 files |
| `dimensional/dimension-inference.test.ts` | 6 files |
| `dimensional/dimension-spec.test.ts` | 2 files |
| `dimensional/dimensionful-power-ad.test.ts` | 7 files |
| `dimensional/distributional-grammar.test.ts` | 6 files |
| `dimensional/duplicate-coord-warning.test.ts` | 16 files |
| `dimensional/einstein-equation.test.ts` | 9 files |
| `dimensional/einstein.test.ts` | 17 files |
| `dimensional/equation-valence.test.ts` | 3 files |
| `dimensional/error-message-discoverability.test.ts` | 1 files |
| `dimensional/field-equation-helpers.test.ts` | 2 files |
| `dimensional/fresh-label.test.ts` | 1 files |
| `dimensional/friedmann-equation.test.ts` | 3 files |
| `dimensional/gauge-field.test.ts` | 2 files |
| `dimensional/integral-bounds-validation.test.ts` | 4 files |
| `dimensional/integral-derivative-tensor.test.ts` | 4 files |
| `dimensional/killing-validators.test.ts` | 3 files |
| `dimensional/klein-gordon-equation.test.ts` | 2 files |
| `dimensional/kronecker-delta.test.ts` | 5 files |
| `dimensional/metric-ast-serialization.test.ts` | 5 files |
| `dimensional/metric-helpers.test.ts` | 4 files |
| `dimensional/metric-tensor.test.ts` | 5 files |
| `dimensional/metric-validation-errors.test.ts` | 1 files |
| `dimensional/minkowski-curvature.test.ts` | 17 files |
| `dimensional/numerical-form-field.test.ts` | 3 files |
| `dimensional/numerical-form-preservation.test.ts` | 5 files |
| `dimensional/op-tensor-interactions.test.ts` | 3 files |
| `dimensional/part-viii-spec-vs-impl.test.ts` | 0 files |
| `dimensional/raise-lower.test.ts` | 6 files |
| `dimensional/rg-flow.test.ts` | 4 files |
| `dimensional/ricci.test.ts` | 17 files |
| `dimensional/riemann-tensor.test.ts` | 5 files |
| `dimensional/stress-energy-validators.test.ts` | 3 files |
| `dimensional/symbolic-exponent.test.ts` | 30 files |
| `dimensional/tensor-ast-serialization.test.ts` | 2 files |
| `dimensional/tensor-helpers.test.ts` | 3 files |
| `dimensional/tensor-node-types.test.ts` | 3 files |
| `dimensional/tensor-partial-derivative.test.ts` | 7 files |
| `dimensional/tensor-product.test.ts` | 4 files |
| `dimensional/tensor-spec-vs-impl.test.ts` | 0 files |
| `dimensional/tensor-step-c.test.ts` | 4 files |
| `dimensional/tensor-symbol.test.ts` | 3 files |
| `dimensional/tensor-trace.test.ts` | 4 files |
| `dimensional/transcendental-validation.test.ts` | 4 files |
| `dimensional/uptError.test.ts` | 1 files |
| `dimensional/validation-result-shape.test.ts` | 2 files |
| `dimensional/validator-probe-ctx.test.ts` | 3 files |
| `dimensional/validator-registry.test.ts` | 6 files |
| `dimensional/validator.test.ts` | 4 files |
| `dimensional/violation-severity.test.ts` | 3 files |
| `dimensional/weyl-validators.test.ts` | 4 files |
| `fixtures/perfect-fluid.test.ts` | 1 files |
| `fixtures/schwarzschild-riemann.test.ts` | 3 files |
| `fixtures/schwarzschild.test.ts` | 1 files |
| `numerical/be37-covariant-eikonal-real.test.ts` | 11 files |
| `numerical/be37-shapiro-step-sweep.test.ts` | 12 files |
| `numerical/christoffel-flat-indexing.test.ts` | 1 files |
| `numerical/christoffel-flat.test.ts` | 1 files |
| `numerical/christoffel-precompute.test.ts` | 2 files |
| `numerical/connection-lowering-helpers.test.ts` | 2 files |
| `numerical/connection-lowering-nonfinite.test.ts` | 2 files |
| `numerical/conserved-charge-mercury.test.ts` | 3 files |
| `numerical/correctness.test.ts` | 15 files |
| `numerical/covariant-derivative-lowering.test.ts` | 11 files |
| `numerical/einstein-desitter.test.ts` | 2 files |
| `numerical/einstein-flrw.test.ts` | 2 files |
| `numerical/einstein-vacuum-schwarzschild.test.ts` | 2 files |
| `numerical/einsum-precompute.test.ts` | 2 files |
| `numerical/einsum-properties.test.ts` | 1 files |
| `numerical/engine-capability.test.ts` | 2 files |
| `numerical/engine-conformance.float64.test.ts` | 1 files |
| `numerical/engine-conformance.mathts.test.ts` | 1 files |
| `numerical/engine-conformance.test.ts` | 2 files |
| `numerical/engine-default.test.ts` | 11 files |
| `numerical/errors.test.ts` | 2 files |
| `numerical/evaluate.test.ts` | 15 files |
| `numerical/finiteness-guards.test.ts` | 2 files |
| `numerical/flatten-na-accuracy.test.ts` | 1 files |
| `numerical/float64-autograd.test.ts` | 2 files |
| `numerical/float64-engine-ad-dispatch.test.ts` | 1 files |
| `numerical/foreach-multi-index.test.ts` | 2 files |
| `numerical/formula-conformance.builtin.test.ts` | 1 files |
| `numerical/formula-conformance.mathts.test.ts` | 1 files |
| `numerical/formula-dimension.test.ts` | 2 files |
| `numerical/formula-mathts.test.ts` | 2 files |
| `numerical/formula-registry.test.ts` | 1 files |
| `numerical/formula.test.ts` | 1 files |
| `numerical/geometrized-schwarzschild-equivalence.test.ts` | 6 files |
| `numerical/geometrized.test.ts` | 3 files |
| `numerical/gl4-butcher-tableau.test.ts` | 1 files |
| `numerical/gl4-integrator.test.ts` | 2 files |
| `numerical/gl4-stage-solver.test.ts` | 1 files |
| `numerical/gl4-step-halving.test.ts` | 1 files |
| `numerical/integral-quadrature.test.ts` | 15 files |
| `numerical/killing-schwarzschild.test.ts` | 2 files |
| `numerical/klein-gordon.test.ts` | 2 files |
| `numerical/kretschmann-factored-raising.test.ts` | 4 files |
| `numerical/kretschmann-horizon.test.ts` | 4 files |
| `numerical/kretschmann-schwarzschild.test.ts` | 4 files |
| `numerical/lowering-contract.test.ts` | 7 files |
| `numerical/lowering-covariant-dead-else.test.ts` | 11 files |
| `numerical/lowering-covariant-guard.test.ts` | 7 files |
| `numerical/lowering-deferred-arms.test.ts` | 14 files |
| `numerical/lowering-strategy-cast.test.ts` | 12 files |
| `numerical/lowering-utils.test.ts` | 8 files |
| `numerical/mathts-autograd.test.ts` | 2 files |
| `numerical/mathts-engine-typing.test.ts` | 3 files |
| `numerical/metric-deriv-supplied.test.ts` | 1 files |
| `numerical/metric-inverse-curvature-walk.test.ts` | 16 files |
| `numerical/metric-inverse.test.ts` | 15 files |
| `numerical/null-ic.test.ts` | 1 files |
| `numerical/null-ray-integrator.test.ts` | 1 files |
| `numerical/painleve-gullstrand-curvature.test.ts` | 5 files |
| `numerical/parse-physics.test.ts` | 4 files |
| `numerical/pderiv-flatten-consolidation.test.ts` | 1 files |
| `numerical/pderiv-order-default.test.ts` | 1 files |
| `numerical/pderiv-order.test.ts` | 1 files |
| `numerical/pderiv.test.ts` | 3 files |
| `numerical/perihelion-finder-roundtrip.test.ts` | 2 files |
| `numerical/perihelion-finder.test.ts` | 1 files |
| `numerical/riemann-tensor-lowering.test.ts` | 16 files |
| `numerical/schwarzschild-radial-geodesic.test.ts` | 2 files |
| `numerical/strides.test.ts` | 1 files |
| `numerical/tensor-engine-types.test.ts` | 2 files |
| `numerical/tensor-partial-derivative-lowering.test.ts` | 7 files |
| `numerical/weyl-kerr-schild.test.ts` | 2 files |
| `numerical/weyl-schwarzschild.test.ts` | 4 files |
| `tests/peers-required.test.ts` | 0 files |
| `tests/tensor.test.ts` | 126 files |
