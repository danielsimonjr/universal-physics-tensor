/**
 * Physics-map visualization — turn the composition hypergraph into Mermaid and
 * Graphviz-DOT **source text**.
 *
 * The graph is bipartite in the drawing: round nodes are *quantities*
 * (`mass`, `temperature`, …) and box nodes are *equations* — laws, bridges, or
 * proposed relations — each an n-ary junction (its source quantities point in,
 * its target points out). This makes "equations as junctions" literal and draws
 * n-ary edges faithfully (a single Mermaid/DOT edge can only connect two nodes).
 *
 * The model computes its own connected components over the junctions — so a
 * `--proposed` overlay participates in the clustering — and groups each component
 * into its own subgraph so the genuinely disjointed map stays legible. For the
 * pure-`BridgeEdge` case the component count matches the authoritative
 * {@link linkageMap} (pinned by a drift-guard test).
 *
 * Pure string production: no file I/O (the CLI is the only file-touching layer).
 *
 * @module composition/graph-viz
 */

import type { BridgeEdge } from './edge.js';
import { QUANTITY_IDENTIFICATIONS } from './compose.js';

/**
 * Epistemic status of a junction — drives node colour/shape. Bridges carry
 * their catalog confidence; `law` is a diagonal/established-physics edge;
 * `proposed` is a machine-derived, unadjudicated relation (rendered quarantined).
 *
 * @public
 */
export type VizStatus =
  | 'law'
  | 'established'
  | 'speculative'
  | 'highly-speculative'
  | 'proposed'
  | 'user';

/**
 * A normalized equation junction: n source quantities → 1 target. The render
 * model's unit of "equation", decoupled from both `BridgeEdge` and the internal
 * `ProposedBridge` type (the CLI converts each into this shape).
 *
 * @public
 */
export interface VizJunction {
  /** Graph id, e.g. `'be-42'` or `'IC-…'`. */
  readonly id: string;
  /** Short human label. */
  readonly label: string;
  readonly status: VizStatus;
  /** Source quantity names. */
  readonly sources: readonly string[];
  /** Target quantity name. */
  readonly target: string;
}

/**
 * One connected component of the bipartite graph.
 *
 * @public
 */
export interface VizCluster {
  /** Junction ids in this component. */
  readonly junctionIds: readonly string[];
  /** Distinct (canonical) quantity names touched by this component. */
  readonly quantities: readonly string[];
  /** Number of junctions (the cluster "size", matching `linkageMap`). */
  readonly size: number;
  /** Contains a `law`/`established` junction (anchored to known physics). */
  readonly anchored: boolean;
}

/**
 * Options for {@link buildVizModel}.
 *
 * @public
 */
export interface VizOptions {
  /** Diagram title (used as the graph label). */
  readonly title?: string;
  /** Already-normalized extra junctions to overlay (e.g. proposed relations). */
  readonly extraJunctions?: readonly VizJunction[];
}

/**
 * The render model: normalized junctions, their connected components, and the
 * two serializers.
 *
 * @public
 */
export interface VizModel {
  readonly junctions: readonly VizJunction[];
  readonly clusters: readonly VizCluster[];
  toMermaid(): string;
  toDot(): string;
}

/** Fill colour + dashed flag per status. Tweak here to restyle the whole map. */
const STATUS_STYLE: Readonly<
  Record<VizStatus, { readonly fill: string; readonly stroke: string; readonly dashed: boolean }>
> = {
  law: { fill: '#cfe3f7', stroke: '#3a6ea5', dashed: false }, // textbook law — blue
  established: { fill: '#cde7d3', stroke: '#3f8f5b', dashed: false }, // solid bridge — green
  speculative: { fill: '#fdebc8', stroke: '#c9881b', dashed: false }, // amber
  'highly-speculative': { fill: '#f5c6c6', stroke: '#c0392b', dashed: false }, // red
  proposed: { fill: '#e6e6e6', stroke: '#888888', dashed: true }, // unadjudicated — grey dashed
  user: { fill: '#e9d8fd', stroke: '#6b46c1', dashed: false }, // user-supplied — violet
};

/** Map a `BridgeEdge` to a `VizJunction` (raw quantity names).
 *
 * The display label is the compact catalog id (`BE-<n>`) when the edge is
 * catalog-backed, else the edge's own label — a *map* reads better with short
 * junction names; the full formula stays in the catalog. */
export function edgeToJunction(edge: BridgeEdge): VizJunction {
  const status: VizStatus = edge.kind === 'law' ? 'law' : edge.confidence;
  return {
    id: edge.id,
    label: edge.beId != null ? `BE-${edge.beId}` : edge.label,
    status,
    sources: edge.sources.map((s) => s.name),
    target: edge.target.name,
  };
}

/** Quantity-name canonicalizer from `QUANTITY_IDENTIFICATIONS` (matches `linkageMap`). */
function makeCanon(): (name: string) => string {
  const alias = new Map(QUANTITY_IDENTIFICATIONS.map((id) => [id.from, id.to]));
  return (n) => alias.get(n) ?? n;
}

/** Distinct canonical quantity names of a junction (sources ∪ target). */
function quantitiesOf(j: VizJunction): string[] {
  return [...new Set([...j.sources, j.target])];
}

/** Union-find component grouping of junctions sharing a (canonical) quantity. */
function componentsOf(junctions: readonly VizJunction[]): VizCluster[] {
  const parent = junctions.map((_, i) => i);
  const find = (x: number): number =>
    parent[x] === x ? x : (parent[x] = find(parent[x]));
  const union = (a: number, b: number): void => {
    parent[find(a)] = find(b);
  };

  const qToJunctions = new Map<string, number[]>();
  junctions.forEach((j, i) => {
    for (const qty of quantitiesOf(j)) {
      const arr = qToJunctions.get(qty) ?? [];
      arr.push(i);
      qToJunctions.set(qty, arr);
    }
  });
  for (const idxs of qToJunctions.values()) {
    for (let k = 1; k < idxs.length; k++) union(idxs[0], idxs[k]);
  }

  const groups = new Map<number, number[]>();
  junctions.forEach((_, i) => {
    const r = find(i);
    const arr = groups.get(r) ?? [];
    arr.push(i);
    groups.set(r, arr);
  });

  const clusters = [...groups.values()].map((idxs): VizCluster => {
    const js = idxs.map((i) => junctions[i]);
    const quantities = [...new Set(js.flatMap(quantitiesOf))].sort();
    return {
      junctionIds: js.map((j) => j.id),
      quantities,
      size: js.length,
      anchored: js.some((j) => j.status === 'law' || j.status === 'established'),
    };
  });
  // Deterministic: largest first, then by first junction id.
  clusters.sort(
    (a, b) => b.size - a.size || a.junctionIds[0].localeCompare(b.junctionIds[0]),
  );
  return clusters;
}

/** A stable, collision-free id factory mapping arbitrary keys to safe ids. */
function idFactory(prefix: string): (key: string) => string {
  const seen = new Map<string, string>();
  const used = new Set<string>();
  return (key) => {
    const cached = seen.get(key);
    if (cached) return cached;
    const base = `${prefix}_${key.replace(/[^A-Za-z0-9]/g, '_')}`;
    let id = base;
    let n = 1;
    while (used.has(id)) id = `${base}_${n++}`;
    used.add(id);
    seen.set(key, id);
    return id;
  };
}

/** Escape a label for Mermaid `["…"]` — XML-entity-encode the characters that
 *  break the quoted form or are read as entities (`&`, `"`, `<`, `>`). */
const mmLabel = (s: string): string =>
  s
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
/** Escape a label for a DOT double-quoted string. */
const dotLabel = (s: string): string => s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

const STATUSES_IN_ORDER: readonly VizStatus[] = [
  'law',
  'established',
  'speculative',
  'highly-speculative',
  'proposed',
  'user',
];

/**
 * Drive a format-specific cluster renderer over the standard layout, identical
 * for both emitters: multi-junction components first (each its own subgraph,
 * keyed `0`,`1`,…, labelled `anchored cluster (n)` / `cluster (n)`), then a
 * single `iso` subgraph collecting all singletons. The callback owns all
 * per-format string production; this owns only the traversal and labelling.
 */
function forEachClusterGroup(
  clusters: readonly VizCluster[],
  renderCluster: (label: string, junctionIds: readonly string[], key: string) => void,
): void {
  const multi = clusters.filter((c) => c.size > 1);
  const singletons = clusters.filter((c) => c.size === 1);
  multi.forEach((c, i) =>
    renderCluster(`${c.anchored ? 'anchored ' : ''}cluster (${c.size})`, c.junctionIds, String(i)),
  );
  if (singletons.length) {
    renderCluster(
      `isolated (${singletons.length})`,
      singletons.flatMap((c) => c.junctionIds),
      'iso',
    );
  }
}

function emitMermaid(
  clusters: readonly VizCluster[],
  byId: ReadonlyMap<string, VizJunction>,
  title: string,
): string {
  const qid = idFactory('q');
  const jid = idFactory('j');
  const usedStatuses = new Set<VizStatus>();
  const out: string[] = [`flowchart LR`, `%% ${title}`];

  const renderCluster = (label: string, junctionIds: readonly string[], key: string): void => {
    out.push(`  subgraph cl_${key}["${mmLabel(label)}"]`);
    out.push(`    direction LR`);
    const declared = new Set<string>();
    const declareQ = (name: string): string => {
      const id = qid(name);
      if (!declared.has(id)) {
        out.push(`    ${id}(["${mmLabel(name)}"]):::qty`);
        declared.add(id);
      }
      return id;
    };
    for (const id of junctionIds) {
      const j = byId.get(id)!;
      usedStatuses.add(j.status);
      const jId = jid(j.id);
      out.push(`    ${jId}["${mmLabel(j.label)}"]:::${j.status}`);
      for (const s of j.sources) out.push(`    ${declareQ(s)} --> ${jId}`);
      out.push(`    ${jId} --> ${declareQ(j.target)}`);
    }
    out.push(`  end`);
  };

  forEachClusterGroup(clusters, renderCluster);

  for (const st of STATUSES_IN_ORDER) {
    if (!usedStatuses.has(st)) continue;
    const { fill, stroke, dashed } = STATUS_STYLE[st];
    out.push(
      `  classDef ${st} fill:${fill},stroke:${stroke}${dashed ? ',stroke-dasharray:4 3' : ''}`,
    );
  }
  out.push(`  classDef qty fill:#ffffff,stroke:#999999`);
  return out.join('\n') + '\n';
}

function emitDot(
  clusters: readonly VizCluster[],
  byId: ReadonlyMap<string, VizJunction>,
  title: string,
): string {
  const qid = idFactory('q');
  const jid = idFactory('j');
  const out: string[] = [
    `digraph PhysicsMap {`,
    `  label="${dotLabel(title)}";`,
    `  rankdir=LR;`,
    `  node [fontname="Helvetica"];`,
  ];

  const renderCluster = (label: string, junctionIds: readonly string[], key: string): void => {
    out.push(`  subgraph cluster_${key} {`);
    out.push(`    label="${dotLabel(label)}";`);
    const declared = new Set<string>();
    const declareQ = (name: string): string => {
      const id = qid(name);
      if (!declared.has(id)) {
        out.push(`    ${id} [shape=ellipse,label="${dotLabel(name)}"];`);
        declared.add(id);
      }
      return id;
    };
    for (const id of junctionIds) {
      const j = byId.get(id)!;
      const jId = jid(j.id);
      const { fill, stroke, dashed } = STATUS_STYLE[j.status];
      const style = dashed ? 'filled,dashed' : 'filled';
      out.push(
        `    ${jId} [shape=box,style="${style}",fillcolor="${fill}",color="${stroke}",label="${dotLabel(
          j.label,
        )}"];`,
      );
      for (const s of j.sources) out.push(`    ${declareQ(s)} -> ${jId};`);
      out.push(`    ${jId} -> ${declareQ(j.target)};`);
    }
    out.push(`  }`);
  };

  forEachClusterGroup(clusters, renderCluster);
  out.push(`}`);
  return out.join('\n') + '\n';
}

/**
 * Build the bipartite, clustered render model from a graph (+ optional overlay).
 * Quantity names are canonicalized via `QUANTITY_IDENTIFICATIONS` so the
 * clustering matches the authoritative {@link linkageMap}.
 *
 * @public
 */
export function buildVizModel(
  edges: readonly BridgeEdge[],
  opts: VizOptions = {},
): VizModel {
  const canon = makeCanon();
  const normalize = (j: VizJunction): VizJunction => ({
    ...j,
    sources: j.sources.map(canon),
    target: canon(j.target),
  });
  const junctions: VizJunction[] = [
    ...edges.map((e) => normalize(edgeToJunction(e))),
    ...(opts.extraJunctions ?? []).map(normalize),
  ];
  // A duplicate junction id (e.g. a proposed overlay colliding with an edge id)
  // would silently drop one from the rendered output — make it a loud error.
  const byId = new Map<string, VizJunction>();
  for (const j of junctions) {
    if (byId.has(j.id)) {
      throw new Error(`buildVizModel: duplicate junction id '${j.id}'`);
    }
    byId.set(j.id, j);
  }
  const clusters = componentsOf(junctions);
  const title = opts.title ?? 'UPT physics map';

  return {
    junctions,
    clusters,
    toMermaid: () => emitMermaid(clusters, byId, title),
    toDot: () => emitDot(clusters, byId, title),
  };
}
