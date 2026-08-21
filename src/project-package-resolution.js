import { moduleResolve } from 'import-meta-resolve';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const browserImportConditions = new Set(['browser', 'import', 'module']);

/**
 * Resolve a bare package import from the Site Author project using browser ESM conditions.
 * Built-in modules and packages absent from the project are left to another resolver.
 *
 * @param {string} specifier
 */
export function resolveProjectBrowserPackage(specifier) {
  if (!isPackageSpecifier(specifier)) {
    return undefined;
  }
  try {
    const projectParent = pathToFileURL(path.join(process.cwd(), 'package.json'));
    const resolved = moduleResolve(specifier, projectParent, browserImportConditions, false);
    return resolved.protocol === 'file:' ? resolved.href : undefined;
  } catch {
    return undefined;
  }
}

/**
 * @param {string} specifier
 */
function isPackageSpecifier(specifier) {
  return (
    !specifier.startsWith('.') &&
    !specifier.startsWith('/') &&
    !specifier.startsWith('#') &&
    !URL.canParse(specifier)
  );
}
