// @ts-check
import emoji from 'remark-emoji';
import { addPlugin } from 'plugins-manager';

/** @type {Partial<import("../../../types/main").RocketCliOptions>} */
const config = {
  setupUnifiedPlugins: [addPlugin({ location: 'markdown', name: 'emoji', plugin: emoji })],
};

export default config;
