/**
 * NDJSON worker protocol: argv spawn, timeout/kill, malformed output.
 */
import { describe, it, expect } from 'vitest';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { runBackendWorker } from '../../../src/composition/probe/backend-protocol.js';

const here = dirname(fileURLToPath(import.meta.url));
const workers = join(here, '../../fixtures/discovery-workers');

const req = {
  problemId: 'fg-test',
  budgetMs: 2000,
  variables: ['x'],
  target: 'y',
};

describe('runBackendWorker', () => {
  it('rejects empty argv', async () => {
    const r = await runBackendWorker([], req);
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/empty argv/);
  });

  it('parses echo-worker NDJSON', async () => {
    const r = await runBackendWorker([process.execPath, join(workers, 'echo-worker.mjs')], req, {
      timeoutMs: 5000,
    });
    expect(r.ok).toBe(true);
    expect(r.candidates.length).toBe(1);
    expect(r.candidates[0]!.expression.kind).toBe('symbol');
  });

  it('parses prefactor and note fields', async () => {
    const r = await runBackendWorker([process.execPath, join(workers, 'rich-worker.mjs')], req, {
      timeoutMs: 5000,
    });
    expect(r.ok).toBe(true);
    expect(r.candidates[0]!.prefactor).toBe(2.5);
    expect(r.candidates[0]!.note).toBe('rich candidate');
  });

  it('rejects malformed NDJSON', async () => {
    const r = await runBackendWorker([process.execPath, join(workers, 'malformed-worker.mjs')], req, {
      timeoutMs: 5000,
    });
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/malformed/);
  });

  it('kills a hung worker', async () => {
    const r = await runBackendWorker([process.execPath, join(workers, 'hang-worker.mjs')], req, {
      timeoutMs: 200,
    });
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/timed out/);
  });
});
