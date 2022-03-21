import { rocketSpark } from '@rocket/spark';

export default /** @type {import('@rocket/cli').RocketCliOptions} */ ({
  absoluteBaseUrl: 'http://localhost:8080',
  presets: [rocketSpark()],
});
