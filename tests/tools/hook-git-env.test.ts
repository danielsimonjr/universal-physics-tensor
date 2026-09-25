/**
 * A pre-push hook run from a LINKED worktree must not let a child git act on the repository.
 *
 * From a linked worktree git exports an absolute GIT_DIR to its hooks. The pre-push gate runs the
 * test suite, and tests that ran `git init` / `git commit` in a temp directory inherited it: on the
 * 0.47.0 release push they set core.bare = true in the main .git/config and committed onto the
 * worktree's HEAD. `.githooks/scrub-git-env.sh` drops the repository-local variables first.
 *
 * Each test builds a scratch repository, a bare remote and a linked worktree, and installs a
 * pre-push hook that does what the leaking tests did. The first test is the positive control: with
 * no scrub the damage happens, so the check can see it. The second sources the real scrub file.
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { GIT_LOCAL_ENV_VARS } from '../setup/scrub-git-env.js';

const SCRUB = resolve(__dirname, '../../.githooks/scrub-git-env.sh').replace(/\\/g, '/');
const ID = ['-c', 'user.email=x@example.invalid', '-c', 'user.name=x'];

let root: string;
const git = (cwd: string, ...args: string[]) =>
  execFileSync('git', [...ID, ...args], { cwd, encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

/** Build main + bare remote + linked worktree `wt` on branch `wtb`; install a pre-push hook. */
function setup(scrub: boolean): { main: string; wt: string; out: string } {
  const main = join(root, 'main');
  const wt = join(root, 'wt');
  const hooks = join(root, 'hooks');
  const out = join(root, 'branch-seen-by-hook.txt').replace(/\\/g, '/');
  git(root, 'init', '-q', '--bare', 'remote.git');
  git(root, 'init', '-q', 'main');
  git(main, 'commit', '-q', '--allow-empty', '-m', 'base');
  git(main, 'remote', 'add', 'origin', '../remote.git');
  // An explicit hooksPath, so a global core.hooksPath cannot bypass the scratch hook.
  mkdirSync(hooks);
  git(main, 'config', 'core.hooksPath', hooks.replace(/\\/g, '/'));
  const hook = [
    '#!/bin/sh',
    'set -e',
    scrub ? `. "${SCRUB}"` : ': no scrub',
    // The hook's own git must still see the worktree it runs in.
    `git rev-parse --abbrev-ref HEAD > "${out}"`,
    // What the leaking tests did: git init + commit in a temp directory.
    't=$(mktemp -d)',
    'cd "$t"',
    'git init -q',
    'git -c user.email=t@example.invalid -c user.name=t commit -q --allow-empty -m leak',
    '',
  ].join('\n');
  writeFileSync(join(hooks, 'pre-push'), hook);
  chmodSync(join(hooks, 'pre-push'), 0o755);
  git(main, 'worktree', 'add', '-q', '../wt', '-b', 'wtb');
  return { main, wt, out };
}

const damage = (main: string) => ({
  bare: git(main, 'config', '--get', 'core.bare'),
  authors: git(main, 'log', '--format=%ae', 'wtb'),
});

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'upt-hook-git-env-'));
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe('pre-push from a linked worktree — child git stays out of the repository', () => {
  it('positive control: without the scrub, a temp-dir git init/commit damages the repository', () => {
    const { main, wt } = setup(false);
    git(wt, 'push', '-q', 'origin', 'wtb');
    const d = damage(main);
    expect(d.bare).toBe('true');
    expect(d.authors).toContain('t@example.invalid');
  });

  it('with .githooks/scrub-git-env.sh sourced, the repository is unchanged and the hook still sees its worktree', () => {
    const { main, wt, out } = setup(true);
    git(wt, 'push', '-q', 'origin', 'wtb');
    const d = damage(main);
    expect(d.bare).toBe('false');
    expect(d.authors).toBe('x@example.invalid');
    expect(readFileSync(out, 'utf-8').trim()).toBe('wtb');
  });

  it('the test-process scrub list is exactly git\'s own list of repository-local variables', () => {
    const fromGit = git(root, 'rev-parse', '--local-env-vars').split(/\r?\n/).filter(Boolean);
    expect([...GIT_LOCAL_ENV_VARS].sort()).toEqual(fromGit.sort());
  });

  it('the test process carries none of those variables', () => {
    expect(GIT_LOCAL_ENV_VARS.filter((name) => name in process.env)).toEqual([]);
  });
});
