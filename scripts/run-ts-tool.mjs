import { existsSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

const [, , target, ...args] = process.argv;

if (!target) {
  console.error('usage: node scripts/run-ts-tool.mjs <file.ts> [...args]');
  process.exitCode = 2;
} else {
  const sourcePath = resolve(target);
  const source = readFileSync(sourcePath, 'utf8');
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
    fileName: sourcePath,
  });

  const dir = mkdtempSync(`${tmpdir()}/upt-ts-tool-`);
  const nodeModules = resolve('node_modules');
  if (existsSync(nodeModules)) {
    symlinkSync(nodeModules, `${dir}/node_modules`, 'dir');
  }
  const out = `${dir}/${basename(sourcePath, '.ts')}.mjs`;
  writeFileSync(out, transpiled.outputText, 'utf8');

  const oldArgv = process.argv;
  try {
    process.argv = [process.execPath, sourcePath, ...args];
    await import(pathToFileURL(out).href);
  } finally {
    process.argv = oldArgv;
    rmSync(dir, { recursive: true, force: true });
  }
}
