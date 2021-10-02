import path from 'path';
import { fileURLToPath } from 'url';
import { addPlugin } from 'plugins-manager';
import { RocketSearchPlugin } from '../src/RocketSearchPlugin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function rocketSearch() {
  return {
    path: path.resolve(__dirname),
    setupCliPlugins: [addPlugin(RocketSearchPlugin)],
  };
}
