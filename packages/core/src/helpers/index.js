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
