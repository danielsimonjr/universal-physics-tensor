/**
 * Formula-parser registry: returns a working parser regardless of MathTS
 * availability, and reports which one is active.
 */
import { describe, it, expect } from 'vitest';
import {
  getFormulaParser,
  getFormulaParserKind,
} from '../../src/numerical/formula-registry.js';

describe('formula-registry', () => {
  it('returns a working parser (whichever is selected)', async () => {
    const p = await getFormulaParser();
    const v = p
      .parse('hbar*c^3/(8*pi*G*M*k_B)')
      .evaluate({
        hbar: 1.054571817e-34,
        c: 299792458,
        G: 6.6743e-11,
        M: 1.989e30,
        k_B: 1.380649e-23,
      });
    expect(v).toBeGreaterThan(6e-8);
    expect(v).toBeLessThan(6.3e-8);
  });

  it('reports a known parser kind', async () => {
    const kind = await getFormulaParserKind();
    expect(['mathts', 'builtin']).toContain(kind);
  });
});
