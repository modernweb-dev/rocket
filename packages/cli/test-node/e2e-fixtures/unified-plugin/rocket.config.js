// @ts-check
import emoji from 'remark-emoji';
import { addPlugin } from 'plugins-manager';
import markdown from 'remark-parse';

/** @type {Partial<import("../../../types/main").RocketCliOptions>} */
const config = {
  setupUnifiedPlugins: [addPlugin(emoji, {}, { location: markdown })],
};

export default config;
