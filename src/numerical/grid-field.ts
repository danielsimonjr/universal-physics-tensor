/**
 * GridField — a sampled field on a regular grid, for the 'grid' numericalForm
 * finite-difference path. See v0.3.5-Design.md §5.
 *
 * The interface now lives in the leaf `./types.js` module (it only depends on
 * `NestedArray`), which removes the former `types ↔ grid-field` type cycle. This
 * module re-exports it so the established `numerical/grid-field` import path —
 * used by `pderiv.ts`, `numerical/index.ts`, and the public `src/index.ts` — keeps
 * working unchanged.
 *
 * @module numerical/grid-field
 */
export type { GridField } from './types.js';
