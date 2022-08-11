import { rocketLaunch } from '@rocket/launch';
import { presetRocketSearch } from '@rocket/search';

export default /** @type {import('@rocket/cli').RocketCliOptions} */ ({
  absoluteBaseUrl: 'http://localhost:8080',
  presets: [rocketLaunch(), presetRocketSearch()],
});
