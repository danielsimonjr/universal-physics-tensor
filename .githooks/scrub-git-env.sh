# Sourced by the git hooks before they run anything that spawns git in another directory.
#
# git exports repository-local variables to a hook. From a LINKED worktree that includes an
# absolute GIT_DIR (<main>/.git/worktrees/<name>); from the main worktree it does not. Any child
# that runs `git init` or `git commit` in a temp directory inherits it and acts on THIS repository.
# On the 0.47.0 release push the test suite did exactly that: it set core.bare = true in the main
# .git/config and committed onto the worktree's HEAD.
#
# `git rev-parse --local-env-vars` is git's own list of those variables. The hook runs in the
# worktree root, so its own git commands still find the right repository through discovery.
# tests/tools/hook-git-env.test.ts pushes from a linked worktree to prove both halves.
# shellcheck disable=SC2046
unset $(git rev-parse --local-env-vars)
