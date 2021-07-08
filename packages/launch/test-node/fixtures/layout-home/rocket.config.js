import { rocketLaunch } from '@rocket/launch';

/** @type {import('@rocket/cli').RocketCliOptions} */
const config = {
  presets: [rocketLaunch()],
};

export default config;
