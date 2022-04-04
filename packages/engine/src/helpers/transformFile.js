import { applyPlugins } from 'plugins-manager';
import { AdjustAssetUrls } from '../transformers/AdjustAssetUrls.js';
import { InjectLoaderFile } from '../transformers/InjectLoaderFile.js';

/** @type {import('../../types/main.js').MetaPluginOfEngine[]} */
const defaultPlugins = [
  { plugin: AdjustAssetUrls, options: {} },
  { plugin: InjectLoaderFile, options: {} },
];

/**
 * @param {string} content
 * @param {{ setupPlugins: any, sourceFilePath: string, outputFilePath: string, sourceRelativeFilePath: string, outputRelativeFilePath: string, url:string; needsLoader: boolean }} options
 * @returns {Promise<string>}
 */
export async function transformFile(content, options) {
  const finalConfig = applyPlugins(options, defaultPlugins);
  let output = content;

  for (const plugin of finalConfig.plugins) {
    if (plugin.transform) {
      output = await plugin.transform(output, options);
    }
  }

  return output;
}
