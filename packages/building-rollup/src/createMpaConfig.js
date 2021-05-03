import { createSpaMetaConfig } from './createSpaConfig.js';
import { adjustPluginOptions, metaConfigToRollupConfig } from 'plugins-manager';

export function createMpaConfig(userConfig) {
  const { config, metaPlugins } = createMpaMetaConfig(userConfig);

  const final = metaConfigToRollupConfig(config, metaPlugins);
  return final;
}

export function createMpaMetaConfig(userConfig = { output: {}, setupPlugins: [] }) {
  const { config, metaPlugins } = createSpaMetaConfig(userConfig);

  config.setupPlugins = [
    adjustPluginOptions('html', {
      flattenOutput: false,
    }),
    ...config.setupPlugins,
  ];

  return { config, metaPlugins };
}
