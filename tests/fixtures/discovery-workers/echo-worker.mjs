#!/usr/bin/env node
/**
 * CI echo worker: read one JSON request from stdin, emit one NDJSON candidate.
 * No Python. Argv-spawned only.
 */
import { stdin } from 'node:process';

const chunks = [];
stdin.on('data', (c) => chunks.push(c));
stdin.on('end', () => {
  const req = JSON.parse(Buffer.concat(chunks).toString('utf8').trim() || '{}');
  const target = req.target ?? 'y';
  const dim = { L: 0, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 };
  const expr = { kind: 'symbol', name: target, dim };
  process.stdout.write(JSON.stringify({ expression: expr, note: 'echo-worker' }) + '\n');
});
