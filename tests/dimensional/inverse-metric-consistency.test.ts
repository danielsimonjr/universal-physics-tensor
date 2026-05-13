/**
 * Inverse-metric consistency check — deferred to v0.3.5.
 *
 * Per v0.3.0-Design.md §13 Q2 locked decision. The warning requires a
 * Violation.severity field which is a substantive enrichment;
 * bundling it with the mathjs numerical-backend introduction (v0.3.5)
 * is cleaner than inflating v0.3.0 scope.
 *
 * v0.3.5 will activate both it.todo entries below.
 */

import { describe, it } from 'vitest';

describe('Inverse-metric consistency (deferred to v0.3.5)', () => {
  it.todo("v0.3.5 — warn when g · g_inverse contracts to something ≠ kronecker-delta");
  it.todo("v0.3.5 — ValidationResult.violations gains severity:'error'|'warning' field");
});
