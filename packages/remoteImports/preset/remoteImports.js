import path from 'path';
import { fileURLToPath } from 'url';
import { addPlugin } from 'plugins-manager';
import { rollupImportMapPlugin } from 'rollup-plugin-import-map';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function remoteImports(importMap) {
  return {
    path: path.resolve(__dirname),
    setupDevAndBuildPlugins: [
      addPlugin({
        name: 'rollup-plugin-import-map',
        plugin: rollupImportMapPlugin,
        location: 'top',
        options: path.resolve(importMap),
      }),
    ],
  };
}
