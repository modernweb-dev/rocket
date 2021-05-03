// @ts-no-check
import json from '@rollup/plugin-json';
import { addPlugin, adjustPluginOptions } from 'plugins-manager';

/** @type {Partial<import("../../../types/main").RocketCliOptions>} */
const config = {
  setupDevAndBuildPlugins: [addPlugin({ name: 'json', plugin: json, location: 'top' })],
  setupBuildPlugins: [adjustPluginOptions('html', { absoluteBaseUrl: 'https://test-me.com' })],
};

export default config;
