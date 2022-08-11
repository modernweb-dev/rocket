import { addPlugin } from 'plugins-manager';

class EnginePluginSpark {
  static publicFolder = new URL('./public', import.meta.url).pathname;
}

export function rocketSpark() {
  return /** @type {import('@rocket/cli').RocketPreset} */ ({
    setupEnginePlugins: [addPlugin(EnginePluginSpark)],
  });
}
