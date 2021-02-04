// @ts-no-check
import path from 'path';
import { fileURLToPath } from 'url';

import json from '@rollup/plugin-json';
import { addPlugin, adjustPluginOptions } from 'plugins-manager';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.join(__dirname, '__output');

/** @type {Partial<import("../../../types/main").RocketCliOptions>} */
const config = {
  setupDevAndBuildPlugins: [addPlugin({ name: 'json', plugin: json, location: 'top' })],
  setupBuildPlugins: [
    adjustPluginOptions('workbox', { swDest: path.join(outputDir, 'my-service-worker.js') }),
  ],
};

export default config;
