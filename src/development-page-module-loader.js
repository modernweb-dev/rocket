import { normalizeLoadedPageModule } from './loaded-page-module.js';
import { parseComponents } from './components.js';

/** @typedef {import('./page-runtime.js').PageModuleLoaderOptions} PageModuleLoaderOptions */

export function createDevelopmentPageModuleLoader() {
  return {
    /**
     * @param {PageModuleLoaderOptions} options
     */
    async load({ page, variant }) {
      if (!page.file.endsWith('.js')) {
        const importAttributes = { type: 'rocketLoadMdInitial' };
        if (typeof variant === 'object' && variant.kind === 'standalone-demo') {
          Object.assign(importAttributes, { singleDemo: variant.demoName });
        }
        const module = await import(`./${page.file}`, {
          with: importAttributes,
        });
        return normalizeLoadedPageModule({ kind: 'markdown', module, parseComponents });
      }

      const module = await import(`./${page.file}`, {
        with: { type: 'rocketLoadJsInitial' },
      });
      return normalizeLoadedPageModule({ kind: 'javascript', module });
    },
  };
}
