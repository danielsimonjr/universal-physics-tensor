/**
 * THE PUBLIC BARREL MUST NOT REACH AN OPTIONAL PEER.
 *
 * `MEMORY.md` (Stack) states the contract: the `@danielsimonjr/mathts-*` family and
 * `@viz-js/viz` are OPTIONAL dependencies, and "everything must degrade
 * gracefully when a peer is absent". Until now nothing exercised that.
 *
 * ## Why this test exists and why it is STATIC
 *
 * The suite runs with all ten peers installed, so a full green says exactly
 * nothing about the absent path — the interesting case is the one the test
 * environment never enters. That is the same shape as a catalog check that could
 * only ever return one answer, and as a golden that only covers the subspace its
 * inputs span.
 *
 * The obvious test — uninstall the peers and import — is a poor CI gate: it needs
 * a mutated `node_modules`, it is slow, and a failure to uninstall reports as a
 * pass. So this asserts the STRUCTURAL property that actually delivers the
 * contract: **nothing reachable from `dist/index.js` imports an optional peer at
 * runtime.** If that holds, absence cannot break the barrel, because the code
 * that needs a peer is never loaded.
 *
 * ## How the contract is actually delivered — BOTH ways, measured
 *
 * 1. **Dynamically, inside try/catch.** `dist/numerical/engine-registry.js`
 *    reaches the peers only through `await import(…)` wrapped in a `try`, so an
 *    absent peer is caught and the engine simply does not register. That file IS
 *    reachable from the barrel, and it is correct.
 * 2. **Structurally.** `src/numerical/mathts-engine.ts` STATICALLY imports
 *    `@danielsimonjr/mathts-tensor`, so loading it without the peer throws with
 *    no graceful path — which is fine precisely because `MathTSEngine` is NOT
 *    re-exported from `src/index.ts` and is reachable only through the
 *    `universal-physics-tensor/numerical/mathts-engine` subpath a caller opts
 *    into.
 *
 * So the test must count STATIC imports and ignore DYNAMIC ones. Counting both
 * flags mechanism (1) — the contract WORKING — as a violation; my first version
 * did exactly that and reported ten offenders against correct code.
 *
 * Verified 2026-09-21: the walk reaches 221 files from the barrel, and injecting
 * a single static peer import into a barrel-reachable file fails this test.
 *
 * A failure here means someone re-exported an optional-peer-dependent module
 * from the barrel, and every consumer without that peer installed would break on
 * `import 'universal-physics-tensor'`.
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

import { describe, it, expect } from 'vitest';

/** Every optional dependency, read from package.json rather than hard-coded. */
function optionalPeers(): string[] {
  // The peers are optional peerDependencies (persona finding F3); npm installs
  // optionalDependencies by default, so they no longer live there.
  const pkg = JSON.parse(readFileSync(resolve('package.json'), 'utf8')) as {
    peerDependenciesMeta?: Record<string, { optional?: boolean }>;
  };
  return Object.entries(pkg.peerDependenciesMeta ?? {})
    .filter(([, meta]) => meta.optional === true)
    .map(([name]) => name);
}

/** Resolve a relative specifier to a file inside dist/, or null if it leaves. */
function resolveLocal(fromFile: string, spec: string): string | null {
  if (!spec.startsWith('.')) return null;
  const base = join(dirname(fromFile), spec);
  for (const candidate of [base, base.replace(/\.js$/, '.js'), join(base, 'index.js')]) {
    if (existsSync(candidate) && candidate.endsWith('.js')) return candidate;
  }
  return null;
}

/** Walk the runtime import graph from an entry file, staying inside dist/. */
function reachableFrom(entry: string): { files: Set<string>; externals: Map<string, string[]> } {
  const files = new Set<string>();
  const externals = new Map<string, string[]>();
  const queue = [resolve(entry)];

  while (queue.length > 0) {
    const file = queue.pop()!;
    if (files.has(file) || !existsSync(file)) continue;
    files.add(file);

    const src = readFileSync(file, 'utf8');

    // STATIC imports only — `from '…'` and bare `import '…'`. A DYNAMIC
    // `import('…')` is deliberately NOT counted, and that distinction is the
    // whole point of this test rather than a detail of it.
    //
    // A static import of an absent peer throws at module load and nothing can
    // catch it. A dynamic one inside try/catch is EXACTLY how this library
    // delivers graceful degradation — `engine-registry.js` does precisely that,
    // and counting it as a violation would flag the contract WORKING as the
    // contract broken. My first version of this test did that and reported ten
    // offenders against correct code.
    // NOTE `export … from` as well as `import … from`. A BARREL IS MOSTLY
    // RE-EXPORTS, so a regex that matches only `import` walks almost nothing —
    // my first version visited 5 files and reported a clean graph, and the
    // files.size control below is the only reason that did not read as "contract
    // verified".
    const staticSpecs = [
      ...src.matchAll(
        /(?:^|[\s;}])(?:import|export)\s+(?:[^'"()]*?\s+from\s+)?['"]([^'"]+)['"]/g,
      ),
    ].map((m) => m[1]!);

    // Dynamic specifiers are still followed for REACHABILITY — a dynamically
    // imported internal module may itself statically import a peer — but they
    // are never themselves reported.
    const dynamicSpecs = [...src.matchAll(/import\s*\(\s*['"]([^'"]+)['"]/g)].map((m) => m[1]!);

    for (const spec of [...staticSpecs, ...dynamicSpecs]) {
      const local = resolveLocal(file, spec);
      if (local !== null) queue.push(local);
    }
    for (const spec of staticSpecs) {
      if (resolveLocal(file, spec) === null && !spec.startsWith('node:')) {
        externals.set(file, [...(externals.get(file) ?? []), spec]);
      }
    }
  }
  return { files, externals };
}

describe('the public barrel does not reach an optional peer', () => {
  const entry = resolve('dist/index.js');

  it('dist/index.js exists — the build ran', () => {
    // Without this, a missing dist would make every assertion below vacuous:
    // an empty graph imports no peer, and the suite would report a pass for a
    // contract it never examined.
    expect(existsSync(entry)).toBe(true);
  });

  it('package.json still declares the peers as OPTIONAL', () => {
    // If a peer were promoted to a hard dependency, this contract would no
    // longer be the one worth testing — and the test should say so loudly
    // rather than keep passing against a premise that changed.
    const peers = optionalPeers();
    expect(peers.length).toBeGreaterThan(0);
    expect(peers.some((p) => p.startsWith('@danielsimonjr/mathts-'))).toBe(true);
  });

  it('nothing reachable from the barrel imports an optional peer at runtime', () => {
    const peers = optionalPeers();
    const { files, externals } = reachableFrom(entry);

    // Control: the walk must actually have traversed something. A broken
    // resolver that visits one file would otherwise report a clean graph.
    expect(files.size).toBeGreaterThan(10);

    const offenders: string[] = [];
    for (const [file, specs] of externals) {
      for (const spec of specs) {
        const peer = peers.find((p) => spec === p || spec.startsWith(`${p}/`));
        if (peer !== undefined) offenders.push(`${file} imports ${spec}`);
      }
    }

    expect(offenders).toEqual([]);
  });
});
