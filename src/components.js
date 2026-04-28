import { resolve } from '@rocket/js/resolve.js';
import { createComponentHydration } from './component-hydration.js';

/**
 * @param {import('@rocket/js/types.js').Components} components
 */
export const parseComponents = createComponentHydration({
  loadComponentModule(file) {
    return import(file);
  },
  resolveBrowserImport(file) {
    return resolve(file, import.meta);
  },
  hydrationLoaderSpecifier: '@rocket/js/hydration/hydrationLoader.js',
});
