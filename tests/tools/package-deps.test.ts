/**
 * "Zero hard dependencies" holds for a default install too (persona finding F3, 2026-09-25).
 *
 * The MathTS packages and @viz-js/viz were `optionalDependencies`, which npm installs by default: a
 * plain `npm install universal-physics-tensor` pulled 36 packages and 48 MB. They are optional
 * PEERS now (`peerDependenciesMeta.optional`), which npm does not install unless asked, and
 * devDependencies, so this repository's own tests still run against them.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf-8'));
const PEERS = [
  '@danielsimonjr/mathts-autograd', '@danielsimonjr/mathts-core', '@danielsimonjr/mathts-expression',
  '@danielsimonjr/mathts-functions', '@danielsimonjr/mathts-matrix', '@danielsimonjr/mathts-parallel',
  '@danielsimonjr/mathts-tensor', '@danielsimonjr/mathts-wasm', '@danielsimonjr/mathts-workerpool',
  '@viz-js/viz',
];

describe('package.json dependency blocks', () => {
  it('has no hard and no optional dependencies (npm installs optional ones by default)', () => {
    expect(pkg.dependencies ?? {}).toEqual({});
    expect(pkg.optionalDependencies ?? {}).toEqual({});
  });

  it('declares every MathTS package and @viz-js/viz as an OPTIONAL peer', () => {
    for (const name of PEERS) {
      expect(pkg.peerDependencies?.[name], name).toBeTypeOf('string');
      expect(pkg.peerDependenciesMeta?.[name]?.optional, name).toBe(true);
    }
    expect(Object.keys(pkg.peerDependencies).sort()).toEqual([...PEERS].sort());
  });

  it('keeps each peer as a devDependency at the same range, so the repository tests still run on it', () => {
    for (const name of PEERS) expect(pkg.devDependencies?.[name], name).toBe(pkg.peerDependencies[name]);
  });
});
