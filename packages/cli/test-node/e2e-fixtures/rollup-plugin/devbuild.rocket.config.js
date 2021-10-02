import json from '@rollup/plugin-json';
import { addPlugin } from 'plugins-manager';

/** @type {Partial<import("../../../types/main").RocketCliOptions>} */
const config = {
  setupDevAndBuildPlugins: [addPlugin(json, {}, { location: 'top' })],
  devServer: {
    mimeTypes: {
      // serve all json files as js
      '**/*.json': 'js',
    },
  },
};

export default config;
