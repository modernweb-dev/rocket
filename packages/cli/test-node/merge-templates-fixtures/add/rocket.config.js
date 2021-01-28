import { preset1 } from './preset1/preset1.js';
import { preset2 } from './preset2/preset2.js';

/** @type {Partial<import("../../../types/main").RocketCliOptions>} */
const config = {
  presets: [preset1(), preset2()],
};

export default config;
