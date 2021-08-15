import path from 'path';
import { fileURLToPath } from 'url';
import { addPlugin } from 'plugins-manager';
import { RocketMenuCliPlugin } from './RocketCliPlugin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function webMenu() {
  return {
    path: path.resolve(__dirname),
    setupCliPlugins: [addPlugin(RocketMenuCliPlugin)],
  };
}
