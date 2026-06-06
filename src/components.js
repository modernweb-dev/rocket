import { resolve } from '@rocket/js/resolve.js';
import { createComponentHydration } from './component-hydration.js';

/** @type {import('@rocket/js/types.js').Components} */
export const rocketDemoComponents = {
  'rocket-code-block': {
    file: './RocketCodeBlock.js',
    className: 'RocketCodeBlock',
    loading: 'hydrate:onVisible',
  },
  'rocket-js-demo': {
    file: './RocketJsDemo.js',
    className: 'RocketJsDemo',
    loading: 'client',
  },
  'rocket-request-demo': {
    file: './RocketRequestDemo.js',
    className: 'RocketRequestDemo',
    loading: 'client',
  },
};

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
