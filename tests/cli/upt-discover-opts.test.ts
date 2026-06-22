/**
 * `upt discover` option validation (Round-2 robustness): `--max-orders` and
 * `--anchor` must reject malformed values with exit 2 rather than silently
 * ignoring them (or, for an empty `--max-orders=`, silently coercing to 0).
 */
import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const cli = resolve(here, '../../bin/upt.mjs');

function run(args: string[]): { status: number; stderr: string } {
  try {
    execFileSync('node', [cli, ...args], { stdio: 'pipe', encoding: 'utf8' });
    return { status: 0, stderr: '' };
  } catch (e) {
    const err = e as { status?: number; stderr?: Buffer | string };
    return { status: err.status ?? 1, stderr: String(err.stderr ?? '') };
  }
}

describe('upt discover — option validation', () => {
  it('rejects a non-numeric --max-orders', () => {
    expect(run(['discover', '--max-orders=abc']).status).toBe(2);
  });

  it('rejects an empty --max-orders (would silently coerce to 0)', () => {
    expect(run(['discover', '--max-orders=']).status).toBe(2);
  });

  it('rejects a negative --max-orders', () => {
    expect(run(['discover', '--max-orders=-1']).status).toBe(2);
  });

  it('rejects a malformed --anchor (no value)', () => {
    expect(run(['discover', '--anchor=mass']).status).toBe(2);
  });

  it('rejects a non-numeric --anchor value', () => {
    expect(run(['discover', '--anchor=mass=abc']).status).toBe(2);
  });

  it('accepts a well-formed --max-orders and --anchor', () => {
    expect(run(['discover', '--max-orders=4', '--anchor=mass=1.989e30']).status).toBe(0);
  });

  it('accepts discover with no options (default anchor)', () => {
    expect(run(['discover']).status).toBe(0);
  });
});
