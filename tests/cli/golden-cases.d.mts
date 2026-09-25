/**
 * Type surface for the committed golden-case list (`golden-cases.mjs`).
 * The list itself stays plain .mjs so `golden-capture.mjs` can run it with
 * bare `node` (no build/transpile step); this declaration gives the strict
 * test typecheck gate (`tsc -p tsconfig.tests.json`, no `allowJs`) real
 * types for the runner test instead of an implicit `any`.
 */
export interface GoldenCase {
  name: string;
  args: string[];
  /** Case runs only when the optional MathTS peer is present (tests/helpers/peers.ts). */
  peerGated?: boolean;
  /** Additionally pin filtered stderr as tests/cli/golden/<name>.stderr.txt. */
  pinStderr?: boolean;
  /** Expected exit code when it is not 0: 3 for a check that ran and failed (0.47.0). */
  exitCode?: number;
}

export declare const GOLDEN_CASES: GoldenCase[];
