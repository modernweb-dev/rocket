import { applyPlugins } from 'plugins-manager';
import { AdjustAssetUrls } from '../transformers/AdjustAssetUrls.js';

const defaultPlugins = [{ plugin: AdjustAssetUrls }];

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
