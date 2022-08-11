/**
 * @template T
 * @typedef {import('./types/main.js').MetaPlugin<T>} MetaPlugin
 **/
/** @typedef {import('./types/main.js').Plugin} Plugin */

export { addPlugin } from './src/addPlugin.js';
export { removePlugin } from './src/removePlugin.js';
export { adjustPluginOptions } from './src/adjustPluginOptions.js';
export { applyPlugins } from './src/applyPlugins.js';
export { executeSetupFunctions } from './src/executeSetupFunctions.js';
