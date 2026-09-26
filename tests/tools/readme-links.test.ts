/**
 * README links must work where the README is read: on npm, where only the `files` of
 * package.json ship (persona finding D1, 2026-09-25). The README linked `docs/…`,
 * `cli/README.md`, `examples/` and `data/bridge-catalog.json` relatively, and none of them is
 * in the npm package, so every one of those links was dead on the npm page.
 *
 * Rule: a relative link must point into a shipped path. Anything else links to the GitHub
 * repository, and that target must exist in this tree, so the absolute links are not dead
 * either.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const readme = readFileSync(resolve(root, 'README.md'), 'utf-8');
const shipped: string[] = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf-8')).files;
const REPO = 'https://github.com/danielsimonjr/universal-physics-tensor/';

const links = [...readme.matchAll(/\]\(([^)\s]+)\)/g)].map((m) => m[1]!.split('#')[0]!).filter((l) => l !== '');

describe('README links resolve on npm as well as on GitHub', () => {
  it('finds links at all (the check is not vacuous)', () => {
    expect(links.length).toBeGreaterThan(20);
  });

  it('every relative link points into a path the npm package ships', () => {
    const relative = links.filter((l) => !/^[a-z]+:/i.test(l));
    const unshipped = relative.filter(
      (l) => !shipped.some((f) => l === f || l.startsWith(f.replace(/\/?$/, '/'))),
    );
    expect(unshipped).toEqual([]);
  });

  it('every link into this repository on GitHub names a path that exists in the tree', () => {
    const repoLinks = links.filter((l) => l.startsWith(REPO));
    expect(repoLinks.length).toBeGreaterThan(0);
    const missing = repoLinks
      .map((l) => l.slice(REPO.length).replace(/^(blob|tree)\/master\//, ''))
      .filter((p) => !/^(actions|issues|pulls)/.test(p))
      .filter((p) => !existsSync(resolve(root, p)));
    expect(missing).toEqual([]);
  });
});
