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
}

export declare const GOLDEN_CASES: GoldenCase[];
