import { rocketLaunch } from '@rocket/launch';
import { rocketBlog } from '@rocket/blog';
import { rocketSearch } from '@rocket/search';
import { absoluteBaseUrlNetlify } from '@rocket/core/helpers';
import { remoteImports } from '@rocket/remote-imports';

export default {
  presets: [rocketLaunch(), rocketBlog(), rocketSearch(), remoteImports('./import-map.json')],
  absoluteBaseUrl: absoluteBaseUrlNetlify('http://localhost:8080'),

  // emptyOutputDir: false,
};
