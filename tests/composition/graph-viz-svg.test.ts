/**
 * SVG rendering of the physics map — `renderDotToSvg` over the optional
 * `@viz-js/viz` (pure-WASM Graphviz) peer.
 *
 * The happy-path render is guarded to skip when the optional peer is not
 * installed (CI installs the optionalDependency, so it runs there). The
 * error-class shape is checked unconditionally.
 *
 * @module tests/composition/graph-viz-svg
 */
import { describe, it, expect } from 'vitest';
import {
  renderDotToSvg,
  SvgRendererUnavailableError,
} from '../../src/composition/graph-viz-svg.js';
import { buildVizModel } from '../../src/composition/graph-viz.js';
import { CATALOG_GRAPH } from '../../src/composition/catalog-graph.js';

let peerAvailable = true;
try {
  await import('@viz-js/viz');
} catch {
  peerAvailable = false;
}

describe('SvgRendererUnavailableError', () => {
  it('is an Error with an actionable default message', () => {
    const e = new SvgRendererUnavailableError();
    expect(e).toBeInstanceOf(Error);
    expect(e.name).toBe('SvgRendererUnavailableError');
    expect(e.message).toContain('@viz-js/viz');
  });
});

describe.skipIf(!peerAvailable)('renderDotToSvg', () => {
  it('renders a small DOT string to an SVG document', async () => {
    const svg = await renderDotToSvg('digraph { a -> b; }');
    expect(typeof svg).toBe('string');
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
  });

  it('renders the real catalog map model toDot() output to SVG', async () => {
    const dot = buildVizModel(CATALOG_GRAPH).toDot();
    const svg = await renderDotToSvg(dot);
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
  });
});
