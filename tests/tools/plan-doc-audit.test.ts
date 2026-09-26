/**
 * The plan-doc audit is a release gate (`audit:plans`, run by `validate`). A
 * plan root that does not exist used to yield ZERO files and a clean pass, so
 * moving the ledger without updating the default would have turned the gate
 * into a vacuous pass. These tests pin that it cannot.
 */

import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEFAULT_PLAN_ROOTS, runAudit } from '../../tools/plan-doc-audit/audit.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

describe('plan-doc audit — the gate cannot pass by scanning nothing', () => {
  it('every default plan root exists in the repository', () => {
    expect(DEFAULT_PLAN_ROOTS.length).toBeGreaterThan(0);
    for (const p of DEFAULT_PLAN_ROOTS) expect(existsSync(resolve(root, p))).toBe(true);
  });

  it('a plan root that does not exist is an ERROR, not an empty scan', () => {
    expect(() => runAudit({ planRoots: ['no/such/ledger.md'], cwd: root })).toThrow(/does not exist/);
  });

  it('CONTROL: the default roots run without throwing', () => {
    expect(() => runAudit({ cwd: root })).not.toThrow();
  });
});
