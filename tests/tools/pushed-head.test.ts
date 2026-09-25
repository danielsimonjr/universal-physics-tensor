/**
 * The pre-push gates can vouch only for HEAD, so the hook refuses a push whose commit is not HEAD.
 *
 * git passes one "<local ref> <local sha> <remote ref> <remote sha>" line per pushed ref on stdin.
 * For an annotated tag the local sha is the TAG OBJECT's, not the commit's. The hook once compared
 * that raw sha with HEAD, so it refused every annotated release tag, the 0.46.0 tag included,
 * although the tag named HEAD. `pushesNotAtHead` peels each sha to the commit it names first.
 *
 * Each test builds a throwaway git repository, so it does not depend on this tree's state.
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pushesNotAtHead } from '../../tools/gate-inputs/pushed-head.js';

const ZERO = '0000000000000000000000000000000000000000';
let repo: string;
const git = (...args: string[]) =>
  execFileSync('git', ['-c', 'user.email=t@example.invalid', '-c', 'user.name=t', '-c', 'core.autocrlf=false', ...args], {
    cwd: repo,
    encoding: 'utf-8',
  }).trim();
const commit = (msg: string) => {
  writeFileSync(join(repo, `${msg}.txt`), `${msg}\n`);
  git('add', '.');
  git('commit', '-q', '-m', msg);
  return git('rev-parse', 'HEAD');
};
const line = (ref: string, sha: string) => `${ref} ${sha} ${ref} ${ZERO}\n`;

beforeEach(() => {
  repo = mkdtempSync(join(tmpdir(), 'upt-pushed-head-'));
  git('init', '-q');
});

afterEach(() => {
  rmSync(repo, { recursive: true, force: true });
});

describe('pushesNotAtHead — the pushed commit must be HEAD', () => {
  it('allows a branch push of HEAD', () => {
    const head = commit('a');
    expect(pushesNotAtHead(repo, line('refs/heads/master', head))).toEqual([]);
  });

  it('allows an annotated tag that names HEAD, although its sha is the tag object', () => {
    const head = commit('a');
    git('tag', '-a', 'v1.0.0', '-m', 'release');
    const tagObject = git('rev-parse', 'v1.0.0');
    expect(tagObject).not.toBe(head);
    expect(pushesNotAtHead(repo, line('refs/tags/v1.0.0', tagObject))).toEqual([]);
  });

  it('refuses a branch or a tag whose commit is not HEAD', () => {
    const old = commit('a');
    git('tag', '-a', 'v0.9.0', '-m', 'old');
    const oldTag = git('rev-parse', 'v0.9.0');
    commit('b');
    expect(pushesNotAtHead(repo, line('refs/heads/old', old) + line('refs/tags/v0.9.0', oldTag))).toEqual([
      `refs/heads/old (${old})`,
      `refs/tags/v0.9.0 (${oldTag})`,
    ]);
  });

  it('allows a deletion, whose local sha is all zeros', () => {
    commit('a');
    expect(pushesNotAtHead(repo, `(delete) ${ZERO} refs/heads/gone ${'1'.repeat(40)}\n`)).toEqual([]);
  });
});
