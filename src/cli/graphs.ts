/**
 * Shared `--source=catalog|canonical|both` graph resolution — replaces
 * `bin/upt.mjs`'s `resolveGraph` (lines 53-67). Every analysis command
 * (`discover` / `candidates` / `map` / ...) that accepts `--source` calls
 * this once to get the graph + a human-readable label for its banner.
 */

import type { BridgeEdge } from '../composition/edge.js';
import type { ParsedArgs } from './args.js';
import type { CommandCtx } from './command.js';
import { CliError } from './errors.js';

export type SourceName = 'catalog' | 'canonical' | 'both';

export function resolveGraph(
  api: CommandCtx['api'],
  flags: ParsedArgs['flags']
): { graph: BridgeEdge[]; label: string; source: SourceName } {
  const values = flags.get('source');
  const src = values && values.length > 0 ? values[values.length - 1] : 'catalog';

  switch (src) {
    case 'catalog':
      return { graph: [...api.CATALOG_GRAPH], label: 'catalog (44-bridge)', source: 'catalog' };
    case 'canonical':
      return {
        graph: [...api.CANONICAL_GRAPH],
        label: 'canonical (standard-physics L-layer, bridges excluded)',
        source: 'canonical',
      };
    case 'both':
      return {
        graph: [...api.CATALOG_GRAPH, ...api.CANONICAL_GRAPH],
        label: 'catalog + canonical',
        source: 'both',
      };
    default:
      throw new CliError(`upt: unknown --source='${src}' (expected: catalog | canonical | both)`);
  }
}
