/**
 * The model-built benchmark set (pre-registration Amendment 2).
 *
 * Kappa and the freeze are RECOMPUTED here from the raw rater files, not read
 * from `provenance/assembly.json`, so the recorded numbers stay derived. Every
 * stored model call must carry the launch's own record of isolation.
 */

import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cohensKappa } from '../../src/atlas/benchmark/stats.js';
import { loadContestedDrafts, loadFrozenItems } from '../../src/atlas/benchmark/loader.js';

const here = dirname(fileURLToPath(import.meta.url));
const BENCH = resolve(here, '../fixtures/atlas/benchmark');
const PROV = resolve(BENCH, 'provenance');
const read = <T>(f: string): T => JSON.parse(readFileSync(resolve(PROV, f), 'utf-8')) as T;

interface Verdict {
  readonly id: string;
  readonly verdict: 'valid' | 'invalid';
}
interface Authored {
  readonly id: string;
  readonly kind: 'valid' | 'invalid';
}

const authored = read<Authored[]>('authored.json');
const raterA = new Map(read<Verdict[]>('rater-A.json').map((v) => [v.id, v.verdict]));
const raterB = new Map(read<Verdict[]>('rater-B.json').map((v) => [v.id, v.verdict]));
const assembly = read<{ kappaBinary: number; frozen: number; contested: number }>('assembly.json');

function binaryKappa(a: ReadonlyMap<string, string>, b: ReadonlyMap<string, string>): number {
  const m = [
    [0, 0],
    [0, 0],
  ];
  for (const it of authored) m[a.get(it.id) === 'valid' ? 0 : 1]![b.get(it.id) === 'valid' ? 0 : 1]!++;
  return cohensKappa(m);
}

describe('model-built benchmark — kappa is derived from the raw rater files', () => {
  it('both raters answered every authored item', () => {
    for (const it of authored) {
      expect(raterA.has(it.id)).toBe(true);
      expect(raterB.has(it.id)).toBe(true);
    }
  });

  it('the binary kappa recorded in assembly.json equals a recomputation', () => {
    expect(binaryKappa(raterA, raterB)).toBeCloseTo(assembly.kappaBinary, 12);
  });

  it('CONTROL: flipping ONE of rater B verdicts moves kappa, so the comparison can fail', () => {
    const first = authored[0]!.id;
    const flipped = new Map(raterB);
    flipped.set(first, raterB.get(first) === 'valid' ? 'invalid' : 'valid');
    expect(Math.abs(binaryKappa(raterA, flipped) - assembly.kappaBinary)).toBeGreaterThan(1e-3);
  });
});

describe('model-built benchmark — the freeze rule, recomputed', () => {
  it('frozen = items where both raters and the author agree on valid/invalid; the rest are contested', () => {
    const agreed = authored.filter((it) => {
      const a = raterA.get(it.id);
      return a === raterB.get(it.id) && (a === 'valid') === (it.kind === 'valid');
    });
    const frozen = loadFrozenItems(BENCH);
    const contested = loadContestedDrafts(BENCH);
    expect(frozen.map((x) => x.id).sort()).toEqual(agreed.map((x) => x.id).sort());
    expect(frozen.length + contested.length).toBe(authored.length);
    expect(frozen.length).toBe(assembly.frozen);
    expect(contested.length).toBe(assembly.contested);
  });

  it('the answer key covers exactly the frozen items', () => {
    const labels = JSON.parse(readFileSync(resolve(BENCH, 'scorer/labels.json'), 'utf-8')) as { itemId: string }[];
    expect(labels.map((l) => l.itemId).sort()).toEqual(loadFrozenItems(BENCH).map((x) => x.id).sort());
  });
});

describe('model-built benchmark — isolation, from the launch record of every call', () => {
  const calls = readdirSync(PROV)
    .filter((f) => /^(author|encode|raterA|raterB)-/.test(f))
    .map((f) => read<{ isolation: { tools: unknown[]; mcp_servers: unknown[]; model: string }; prompt: string }>(f));

  it('32 calls were stored: 8 author, 8 encoder, 8 per rater', () => {
    expect(calls.length).toBe(32);
  });

  it('every call ran with no tools, no MCP servers, on claude-fable-5-1', () => {
    for (const c of calls) {
      expect(c.isolation.tools).toEqual([]);
      expect(c.isolation.mcp_servers).toEqual([]);
      expect(c.isolation.model).toBe('claude-fable-5-1');
    }
  });

  it('no prompt names the atlas, its source tree, or any atlas record id', () => {
    for (const c of calls) expect(c.prompt).not.toMatch(/src\/atlas|atlas|model-[a-z]|ab-[a-z]/i);
  });

  it('CONTROL: that prompt scan fires on a prompt that DOES name the atlas', () => {
    expect('see src/atlas/types.ts').toMatch(/src\/atlas|atlas|model-[a-z]|ab-[a-z]/i);
  });
});
