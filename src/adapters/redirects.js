/** Runs on: server */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

/**
 * Netlify and Cloudflare Workers Static Assets both read a `_redirects` file from the published
 * directory, with one `source target status` rule per line.
 *
 * @param {import('@rocket/js/types.js').RedirectConfig[]} redirects
 */
export function makeRedirectsFileSource(redirects) {
  return redirects
    .map(redirect => `${redirect.source} ${redirect.target} ${redirect.status || 308}`)
    .join('\n')
    .concat('\n');
}

/**
 * Writes `<outDir>/_redirects` for the configured URL Lifecycle Redirects, if there are any.
 *
 * @param {import('@rocket/js/types.js').RocketAdapterBuildContext} context
 */
export function writeRedirectsFile(context) {
  const redirects = context.config.urlLifecycle?.redirects || [];
  if (!redirects.length) {
    return;
  }

  mkdirSync(context.outDir, { recursive: true });
  writeFileSync(path.join(context.outDir, '_redirects'), makeRedirectsFileSource(redirects));
}
