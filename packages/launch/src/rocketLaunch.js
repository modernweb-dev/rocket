/* eslint-disable @typescript-eslint/ban-ts-comment */
import { addPlugin } from 'plugins-manager';

class EnginePluginLaunch {
  static publicFolder = new URL('../__public', import.meta.url).pathname;
}

export function rocketLaunch() {
  // @ts-ignore
  return /** @type {import('@rocket/cli').RocketPreset} */ ({
    setupEnginePlugins: [addPlugin(EnginePluginLaunch)],
    adjustOptions: options => {
      options.serviceWorkerSourcePath = new URL(
        '../src/public/service-worker.js',
        import.meta.url,
      ).pathname;
      return options;
    },
    // adjustImagePresets: imagePresets => ({
    //   ...imagePresets,
    //   responsive: {
    //     ...imagePresets.responsive,
    //     widths: [600, 900, 1640],
    //     sizes: '(min-width: 1024px) 820px, calc(100vw - 40px)',
    //   },
    // }),
  });
}
