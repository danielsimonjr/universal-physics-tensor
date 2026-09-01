#!/usr/bin/env node
const dimL = { L: 1, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 };
const dimT = { L: 0, M: 0, T: 1, I: 0, Theta: 0, N: 0, J: 0 };
const expr = {
  kind: 'op',
  op: '+',
  args: [
    { kind: 'symbol', name: 'L', dim: dimL },
    { kind: 'symbol', name: 't', dim: dimT },
  ],
};
process.stdout.write(JSON.stringify({ expression: expr, note: 'external-invalid' }) + '\n');
