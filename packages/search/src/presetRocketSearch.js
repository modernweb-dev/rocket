import { addPlugin } from 'plugins-manager';
import { RocketCliSearch } from './RocketCliSearch.js';

export function presetRocketSearch() {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return /** @type {import('@rocket/cli').RocketPreset} */ ({
    setupCliPlugins: [addPlugin(RocketCliSearch)],
  });
}
