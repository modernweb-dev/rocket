/**
 * @template T
 * @typedef {import('../types/main.js').MetaPlugin<T>} MetaPlugin
 **/
/** @typedef {import('../types/main.js').Plugin} Plugin */
/** @typedef {import('../types/main.js').AnyFn} AnyFn */

export { addPlugin } from './addPlugin.js';
export { removePlugin } from './removePlugin.js';
export { adjustPluginOptions } from './adjustPluginOptions.js';
export { applyPlugins } from './applyPlugins.js';
export { executeSetupFunctions } from './executeSetupFunctions.js';
