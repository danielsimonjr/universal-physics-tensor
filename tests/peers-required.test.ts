/**
 * Fail-loud guard: the optional MathTS autograd peer must be present when the
 * run demands it (Round-2 audit, HIGH).
 *
 * The AST-AD test arc gates on `peerPresent` via `it.runIf(...)`. Without this
 * guard, a failed/absent optional-peer install makes every AD test SKIP while
 * CI stays green. Setting `UPT_REQUIRE_PEERS=1` (CI does) turns that silent
 * skip into an explicit failure here.
 *
 * Locally (env unset) this test simply reports peer presence and passes.
 *
 * @module tests/peers-required
 */
import { describe, it, expect } from 'vitest';
import { peerPresent, requirePeers } from './helpers/peers.js';

describe('optional-peer presence gate', () => {
  it('MathTS autograd peer is present when UPT_REQUIRE_PEERS is set', () => {
    if (requirePeers && !peerPresent) {
      throw new Error(
        'UPT_REQUIRE_PEERS is set but the MathTS autograd peer is absent — the '
        + 'AST-AD test arc would silently skip. Run `npm ci` with optional '
        + 'dependencies enabled, or unset UPT_REQUIRE_PEERS for a peerless run.',
      );
    }
    // When not required, this is informational only.
    expect(typeof peerPresent).toBe('boolean');
  });
});
