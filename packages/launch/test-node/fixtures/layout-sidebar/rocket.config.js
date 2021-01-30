import { rocketLaunch } from '@rocket/launch';

/** @type {Partial<import("@rocket/cli").RocketCliOptions>} */
const config = {
  presets: [rocketLaunch()],
};

export default config;
