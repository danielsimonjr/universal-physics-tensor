/**
 * Namespace facades on the public surface: `export * as NS from './facade.js'`
 * in `src/index.ts`.
 *
 * `public-tag-vs-index-invariant.test.ts` parses `export { … } from` and
 * `export * from`, NOT `export * as NS from`. Promoting the atlas as a namespace
 * facade while the parser could not see that form would make the invariant pass
 * over symbols it never checked — a green that measures nothing. This file:
 *
 *  1. proves the shared parsers on SYNTHETIC sources, including the inputs they
 *     must reject (a check that has only run on the real tree cannot tell a
 *     clean tree from a blind parser);
 *  2. checks every real namespace facade in the other direction: each symbol a
 *     facade re-exports must be `@public` where it is declared.
 */

import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  checkFacade,
  namedReExports,
  namespaceReExports,
  publicDeclNames,
  wildcardReExports,
} from './_public-surface-parse.js';

const here = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(here, '../../src');
const INDEX = readFileSync(join(SRC, 'index.ts'), 'utf-8');

/** Resolve a `./x.js` specifier relative to a source file to its `.ts` text. */
function readerFor(fromFile: string): (spec: string) => string | undefined {
  return (spec) => {
    const ts = resolve(dirname(fromFile), spec.replace(/\.js$/, '.ts'));
    return existsSync(ts) ? readFileSync(ts, 'utf-8') : undefined;
  };
}

describe('parsers — proven on synthetic input first', () => {
  it('namespaceReExports sees `export * as NS` and NOT a plain `export *`', () => {
    expect(namespaceReExports("export * as atlas from './atlas/public.js';")).toEqual([
      { ns: 'atlas', specifier: './atlas/public.js' },
    ]);
    expect(namespaceReExports("export * from './x.js';")).toEqual([]);
    expect(wildcardReExports("export * as atlas from './atlas/public.js';")).toEqual([]);
    expect(wildcardReExports("export * from './x.js';")).toEqual(['./x.js']);
  });

  it('namedReExports returns original names across `type`, `as` and comments', () => {
    const src = "export { a, type B, c as d /* note */ } from './m.js';\nexport type { E } from './n.js';";
    expect(namedReExports(src)).toEqual([
      { name: 'a', specifier: './m.js' },
      { name: 'B', specifier: './m.js' },
      { name: 'c', specifier: './m.js' },
      { name: 'E', specifier: './n.js' },
    ]);
  });

  it('publicDeclNames finds tagged declarations and ignores untagged ones', () => {
    const src = [
      '/** @public */',
      'export function tagged(): void {}',
      '/** @internal */',
      'export function untagged(): void {}',
    ].join('\n');
    expect([...publicDeclNames(src)]).toEqual(['tagged']);
  });
});

describe('checkFacade — the reverse check, proven to FAIL where it must', () => {
  const MODULE = [
    '/** @public */',
    'export const good = 1;',
    '/** @internal */',
    'export const bad = 2;',
  ].join('\n');
  const read = (spec: string): string | undefined => (spec === './m.js' ? MODULE : undefined);

  it('CONTROL: a facade re-exporting only @public symbols passes', () => {
    expect(checkFacade("export { good } from './m.js';", read)).toEqual([]);
  });

  it('FAILS on a deliberately UNTAGGED symbol', () => {
    expect(checkFacade("export { good, bad } from './m.js';", read)).toEqual([
      { name: 'bad', problem: 'not-tagged-public' },
    ]);
  });

  it('FAILS on a module it cannot resolve, and on a wildcard inside the facade', () => {
    expect(checkFacade("export { x } from './gone.js';", read)).toEqual([
      { name: 'x', problem: 'unresolvable-module' },
    ]);
    expect(checkFacade("export * from './m.js';", read)).toEqual([
      { name: './m.js', problem: 'wildcard-in-facade' },
    ]);
  });
});

describe('the real tree', () => {
  const facades = namespaceReExports(INDEX);

  it('finds every `export * as` line in src/index.ts (counted a second way)', () => {
    const counted = (INDEX.match(/export\s+\*\s+as\s+/g) ?? []).length;
    expect(facades.length).toBe(counted);
  });

  it('every symbol a namespace facade re-exports is @public where it is declared', () => {
    const problems: string[] = [];
    for (const { ns, specifier } of facades) {
      const file = resolve(SRC, specifier.replace(/\.js$/, '.ts'));
      if (!existsSync(file)) {
        problems.push(`${ns}: facade ${specifier} not found`);
        continue;
      }
      for (const p of checkFacade(readFileSync(file, 'utf-8'), readerFor(file))) {
        problems.push(`${ns}.${p.name}: ${p.problem}`);
      }
    }
    expect(problems).toEqual([]);
  });
});
