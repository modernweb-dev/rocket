import { rocketLaunch } from '@rocket/launch';
import { rocketBlog } from '@rocket/blog';
import { rocketSearch } from '@rocket/search';
import { absoluteBaseUrlNetlify } from '@rocket/core/helpers';

/** @type {Partial<import("./packages/cli/types/main").RocketCliOptions>} */
const config = {
  presets: [rocketLaunch(), rocketBlog(), rocketSearch()],
  absoluteBaseUrl: absoluteBaseUrlNetlify('http://localhost:8080'),
  // emptyOutputDir: false,
}
export default config;
