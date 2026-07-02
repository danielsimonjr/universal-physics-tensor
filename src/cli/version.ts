/**
 * Runtime package-version lookup for the UPT CLI (`upt --version`, etc.).
 *
 * Reads `package.json` relative to this module's own location rather than
 * importing a generated constant, so it stays correct without a build step
 * re-stamping a version string. From `dist/cli/version.js`, `../../package.json`
 * resolves to the package root in both the dev checkout and the installed
 * npm layout (`dist/` ships as part of the published package).
 */

import { readFileSync } from 'node:fs';

export function packageVersion(): string {
  const pkgPath = new URL('../../package.json', import.meta.url);
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as { version: string };
  return pkg.version;
}
