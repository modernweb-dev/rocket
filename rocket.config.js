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
      simulationSettings: {
        simulatorUrl: '/simulator/',
        themes: [
          { key: 'light', name: 'Light' },
          { key: 'dark', name: 'Dark' },
        ],
        platforms: [
          { key: 'web', name: 'Web' },
          { key: 'android', name: 'Android' },
          { key: 'ios', name: 'iOS' },
        ],
      },
    }),
  ],

  // emptyOutputDir: false,
};
