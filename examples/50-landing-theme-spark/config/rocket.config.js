import { rocketSpark } from '@rocket/spark';

export default /** @type {import('@rocket/cli').RocketCliOptions} */ ({
  absoluteBaseUrl: 'http://localhost:8080',
  longFileHeaderWidth: 100,
  longFileHeaderComment: '// prettier-ignore',
  presets: [rocketSpark()],
});
