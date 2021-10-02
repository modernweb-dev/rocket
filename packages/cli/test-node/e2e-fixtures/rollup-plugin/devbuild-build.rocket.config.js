// @ts-no-check
import json from '@rollup/plugin-json';
import { rollupPluginHTML } from '@web/rollup-plugin-html';
import { addPlugin, adjustPluginOptions } from 'plugins-manager';

/** @type {Partial<import("../../../types/main").RocketCliOptions>} */
const config = {
  setupDevAndBuildPlugins: [addPlugin(json, {}, { location: 'top' })],
  setupBuildPlugins: [
    adjustPluginOptions(rollupPluginHTML, { absoluteBaseUrl: 'https://test-me.com' }),
  ],
};

export default config;
