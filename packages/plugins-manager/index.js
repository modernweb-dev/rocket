/** @typedef {import('./types/main').MetaPlugin} MetaPlugin */
/** @typedef {import('./types/main').AddPluginFn} AddPluginFn */
/** @typedef {import('./types/main').AddPluginType} AddPluginType */

export { addPlugin } from './src/addPlugin.js';
export { adjustPluginOptions } from './src/adjustPluginOptions.js';
export { metaConfigToRollupConfig } from './src/metaConfigToRollupConfig.js';
export { metaConfigToWebDevServerConfig } from './src/metaConfigToWebDevServerConfig.js';
export { executeSetupFunctions } from './src/executeSetupFunctions.js';
