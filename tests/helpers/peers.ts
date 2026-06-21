/**
 * Optional-peer detection + fail-loud gate for the test suite.
 *
 * The MathTS autograd peer drives the entire AST-AD feature arc. Those tests
 * gate on `peerPresent` via `it.runIf(...)`, so if the optional peer fails to
 * install they all SKIP and CI still goes green — the headline feature can
 * silently vanish behind a passing check (Round-2 audit, HIGH).
 *
 * `requirePeers` reads `UPT_REQUIRE_PEERS` (set in CI). When truthy, the guard
 * test in `tests/peers-required.test.ts` fails loudly if the peer is absent,
 * turning "silently skipped" into "explicitly broken".
 *
 * @module tests/helpers/peers
 */
import { hasAutogradSupport } from '../../src/numerical/tensor-engine.js';
import { MathTSEngine } from '../../src/numerical/mathts-engine.js';

/** True iff the optional MathTS autograd peer is installed and AD-capable. */
export const peerPresent: boolean = (() => {
  try {
    return hasAutogradSupport(new MathTSEngine());
  } catch {
    return false;
  }
})();

/** True iff the run demands peers be present (CI sets `UPT_REQUIRE_PEERS=1`). */
export const requirePeers: boolean = /^(1|true|yes)$/i.test(
  process.env.UPT_REQUIRE_PEERS ?? '',
);
