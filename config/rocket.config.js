import { rocketLaunch } from '@rocket/launch';
import { rocketSpark } from '@rocket/spark';
import { presetRocketSearch } from '@rocket/search';

/**
 * Extracts the current applicable absoluteBaseUrl from Netlify system variables
 *
 * @param {string} fallback
 */
export function absoluteBaseUrlNetlify(fallback) {
  let absoluteBaseUrl = fallback;

  switch (process.env.CONTEXT) {
    case 'production':
      absoluteBaseUrl = process.env.URL ?? '';
      break;
    case 'deploy-preview':
      absoluteBaseUrl = process.env.DEPLOY_URL ?? '';
      break;
    case 'branch-deploy':
      absoluteBaseUrl = process.env.DEPLOY_PRIME_URL ?? '';
      break;
    /* no default */
  }
  return absoluteBaseUrl;
}

export default /** @type {import('@rocket/cli/types/main').RocketCliOptions} */ ({
  absoluteBaseUrl: absoluteBaseUrlNetlify('http://localhost:8080'),
  longFileHeaderWidth: 100,
  longFileHeaderComment: '// prettier-ignore',
  // adjustDevServerOptions: (options) => ({
  //   ...options,
  //   nodeResolve: {
  //     ...options.nodeResolve,
  //     exportConditions: ['development'],
  //   },
  // }),

  // buildOpenGraphImages: false,

  presets: [rocketLaunch(), rocketSpark(), presetRocketSearch()],
  // serviceWorkerName: 'sw.js',
  // pathPrefix: '/_site/',

  // clearOutputDir: false,
});
