import { rocketLaunch } from '@rocket/launch';

export default /** @type {import('@rocket/cli').RocketCliOptions} */ ({
  absoluteBaseUrl: 'http://localhost:8080',
  presets: [rocketLaunch()],
});
