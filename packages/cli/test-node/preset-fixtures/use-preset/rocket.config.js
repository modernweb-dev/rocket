import { myPreset } from './my-preset.js';

/** @type {Partial<import("../../../types/main").RocketCliOptions>} */
const config = {
  presets: [myPreset()],
};

export default config;
