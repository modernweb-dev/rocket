import { rocketLaunch } from '@rocket/launch';
import { rocketBlog } from '@rocket/blog';
import { rocketSearch } from '@rocket/search';
import { absoluteBaseUrlNetlify } from '@rocket/core/helpers';
import { adjustPluginOptions } from 'plugins-manager';

export default {
  presets: [rocketLaunch(), rocketBlog(), rocketSearch()],
  absoluteBaseUrl: absoluteBaseUrlNetlify('http://localhost:8080'),
  setupUnifiedPlugins: [
    adjustPluginOptions('mdjsSetupCode', {
      simulationSettings: { simulatorUrl: '/simulator/' },
    }),
  ],

  // emptyOutputDir: false,
};
