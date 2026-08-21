import { resolveProjectBrowserPackage } from './project-package-resolution.js';
import { resolve } from './resolve.js';

/**
 * Keeps browser packages shared between a Site Author project and a linked Rocket checkout.
 * Packages absent from the project are left to normal Node resolution, which falls back to
 * Rocket's dependency.
 *
 * @returns {import('@web/dev-server-core').Plugin}
 */
export function preferProjectPackagesPlugin() {
  /** @type {Map<string, string | undefined>} */
  const resolvedImports = new Map();

  return {
    name: 'rocket-prefer-project-packages',
    resolveImport({ source }) {
      if (resolvedImports.has(source)) {
        return resolvedImports.get(source);
      }
      let resolved;
      try {
        resolved = resolveProjectBrowserPackage(source) ? resolve(source, import.meta) : undefined;
      } catch {
        resolved = undefined;
      }
      resolvedImports.set(source, resolved);
      return resolved;
    },
  };
}
