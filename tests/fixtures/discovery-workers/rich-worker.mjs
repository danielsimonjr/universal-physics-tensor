#!/usr/bin/env node
/** NDJSON worker emitting prefactor + note fields for protocol coverage. */
const dim = { L: 0, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 };
process.stdin.on('data', () => {
  process.stdout.write(
    JSON.stringify({
      expression: { kind: 'symbol', name: 'x', dim },
      prefactor: 2.5,
      note: 'rich candidate',
    }) + '\n',
  );
});
