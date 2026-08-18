import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const raw = execFileSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], { encoding: 'utf8' });
const report = JSON.parse(raw)[0];
const files = new Set(report.files.map((f) => f.path));
const required = new Set(['package.json', 'README.md', 'LICENSE', pkg.bin.upt]);
for (const target of Object.values(pkg.exports)) {
  for (const path of Object.values(target)) required.add(path.replace(/^\.\//, ''));
}
for (const path of required) {
  if (!files.has(path)) throw new Error(`package smoke: required published file missing: ${path}`);
}
for (const path of files) {
  if (/^(src|tests|bench|tools|docs\/planning|\.github)\//.test(path)) {
    throw new Error(`package smoke: development-only path leaked into package: ${path}`);
  }
}
console.log(`package smoke: ${files.size} files, ${report.size} bytes; exports/bin present; no dev-tree leakage`);
