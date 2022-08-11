import json from '@rollup/plugin-json';
import { addPlugin } from 'plugins-manager';

export default /** @type {import('../../../../../types/main.js').RocketCliOptions} */ ({
  setupDevServerAndBuildPlugins: [addPlugin(json, {}, { location: 'top' })],
  adjustDevServerOptions: options => ({
    ...options,
    mimeTypes: {
      // serve all json files as js
      '**/*.json': 'js',
    },
  }),
});
