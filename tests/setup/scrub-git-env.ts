/**
 * Vitest setup: no test may inherit a repository-local git variable.
 *
 * A git hook run from a linked worktree exports an absolute GIT_DIR. A test that runs `git init`
 * or `git commit` in a temp directory, or a tool under test that runs `git -C <tmp>`, would then act
 * on the repository that launched the suite. The pre-push hook drops these variables itself
 * (`.githooks/scrub-git-env.sh`); this covers every other launcher.
 *
 * The list is git's own (`git rev-parse --local-env-vars`); tests/tools/hook-git-env.test.ts
 * fails if it drifts.
 */

export const GIT_LOCAL_ENV_VARS = [
  'GIT_ALTERNATE_OBJECT_DIRECTORIES',
  'GIT_CONFIG',
  'GIT_CONFIG_PARAMETERS',
  'GIT_CONFIG_COUNT',
  'GIT_OBJECT_DIRECTORY',
  'GIT_DIR',
  'GIT_WORK_TREE',
  'GIT_IMPLICIT_WORK_TREE',
  'GIT_GRAFT_FILE',
  'GIT_INDEX_FILE',
  'GIT_NO_REPLACE_OBJECTS',
  'GIT_REPLACE_REF_BASE',
  'GIT_PREFIX',
  'GIT_SHALLOW_FILE',
  'GIT_COMMON_DIR',
] as const;

for (const name of GIT_LOCAL_ENV_VARS) delete process.env[name];
