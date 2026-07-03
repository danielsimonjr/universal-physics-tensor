/**
 * `upt confront` — in-process against the src/cli port (dist/cli/main.js),
 * matching the convention established in main-dispatch.test.ts /
 * json-contract.test.ts (not a src/ import — the command needs the built
 * cli-api barrel wired in).
 */
import { describe, it, expect } from 'vitest';
import { runCli } from '../../dist/cli/main.js';

function capture() {
  const lines: string[] = [];
  const sink = (s?: string) => lines.push((s ?? '') + '\n');
  return { lines, io: { out: sink, err: sink, write: (s: string) => lines.push(s) } };
}

describe('upt confront', () => {
  it('lists all confrontations by default (exit 0)', async () => {
    const cap = capture();
    const code = await runCli(['confront'], cap.io);
    expect(code).toBe(0);
    const text = cap.lines.join('');
    expect(text).toMatch(/be-37/);
    expect(text).toMatch(/be-48/);
    expect(text).toMatch(/be-52/);
  });

  it('--bridge=be-37 runs one, exit 0', async () => {
    const cap = capture();
    const code = await runCli(['confront', '--bridge=be-37'], cap.io);
    expect(code).toBe(0);
    expect(cap.lines.join('')).toMatch(/PPN|γ|gamma/i);
  });

  it('--bridge with an unregistered id is a bad value → exit 1', async () => {
    const cap = capture();
    const code = await runCli(['confront', '--bridge=be-99'], cap.io);
    expect(code).toBe(1);
  });

  it('--bridge with an unparseable value is a bad value → exit 1', async () => {
    const cap = capture();
    const code = await runCli(['confront', '--bridge=garbage'], cap.io);
    expect(code).toBe(1);
  });

  it('--json emits an envelope with a result array', async () => {
    const cap = capture();
    const code = await runCli(['confront', '--json'], cap.io);
    expect(code).toBe(0);
    const parsed = JSON.parse(cap.lines.join(''));
    expect(parsed.command).toBe('confront');
    expect(Array.isArray(parsed.result)).toBe(true);
    expect(parsed.result.some((o: { kind: string }) => o.kind === 'value')).toBe(true);
  });
});
