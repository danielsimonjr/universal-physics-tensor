/**
 * The pre-push gates can vouch only for HEAD, so a push whose commit is not HEAD is refused.
 *
 * The gates read the working tree, and the working tree is HEAD (`gate-inputs.ts` refuses a dirty
 * tree). A pushed ref that names another commit would go out unjudged.
 *
 * git passes one "<local ref> <local sha> <remote ref> <remote sha>" line per pushed ref on stdin.
 * For an annotated tag the local sha is the TAG OBJECT's, not the commit's, so each sha is peeled to
 * the commit it names before the comparison. Comparing the raw sha once refused every annotated
 * release tag. An all-zero local sha is a deletion, which pushes no commit.
 *
 * Run from the pre-push hook: `bun tools/gate-inputs/pushed-head.ts` (stdin as git gives it; exit 1
 * and a list when a push is refused).
 */

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const DELETION = /^0+$/;

const revParse = (root: string, rev: string) =>
  execFileSync('git', ['-C', root, 'rev-parse', '--verify', '--quiet', rev], { encoding: 'utf-8' }).trim();

/** The pushes, as "<local ref> (<local sha>)", whose commit is not HEAD. */
export function pushesNotAtHead(root: string, stdin: string): string[] {
  const head = revParse(root, 'HEAD');
  const refused: string[] = [];
  for (const line of stdin.split('\n')) {
    const [localRef, localSha] = line.trim().split(/\s+/);
    if (!localRef || !localSha || DELETION.test(localSha)) continue;
    if (revParse(root, `${localSha}^{commit}`) !== head) refused.push(`${localRef} (${localSha})`);
  }
  return refused;
}

function main(): number {
  const root = resolve(fileURLToPath(import.meta.url), '../../..');
  const refused = pushesNotAtHead(root, readFileSync(0, 'utf-8'));
  if (refused.length === 0) return 0;
  console.error(`PRE-PUSH GATE REFUSED: HEAD is ${revParse(root, 'HEAD')}, and these pushes name another commit:`);
  for (const r of refused) console.error(`  ${r}`);
  console.error('The gates read the working tree, so they can only vouch for HEAD. Check it out first.');
  return 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = main();
}
