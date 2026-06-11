/**
 * v0.11 surface barrel for the namespacing-gate symbols (keeps
 * src/index.ts one-import-per-area while the implementations live in
 * compose.ts / edge.ts / enumerate.ts).
 *
 * @module composition/compose-surface
 */
export { CompositionAliasError } from './edge.js';
export { SOURCE_ALIAS_DISPOSITIONS } from './compose.js';
export type { AliasDisposition } from './compose.js';
export type { DispositionRequired } from './enumerate.js';
