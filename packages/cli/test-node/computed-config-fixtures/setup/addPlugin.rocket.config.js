import { addPlugin } from 'plugins-manager';

/** @type {Partial<import("../../../types/main").RocketCliOptions>} */
const config = {
  setupEleventyComputedConfig: [addPlugin({ name: 'test', plugin: () => 'test-value' })],
};

export default config;
