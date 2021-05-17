import path from 'path';
import { adjustPluginOptions } from 'plugins-manager';
// import { addPlugin } from 'plugins-manager';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function addOcticonToHeadlines(plugins) {
  return plugins.map(pluginObj => {
    if (pluginObj.name === 'htmlHeading') {
      return {
        ...pluginObj,
        options: {
          properties: {
            className: ['anchor'],
          },
          content: [
            {
              type: 'element',
              tagName: 'svg',
              properties: {
                className: ['octicon', 'octicon-link'],
                viewBox: '0 0 16 16',
                ariaHidden: 'true',
                width: 16,
                height: 16,
              },
              children: [
                {
                  type: 'element',
                  tagName: 'path',
                  properties: {
                    fillRule: 'evenodd',
                    d:
                      'M7.775 3.275a.75.75 0 001.06 1.06l1.25-1.25a2 2 0 112.83 2.83l-2.5 2.5a2 2 0 01-2.83 0 .75.75 0 00-1.06 1.06 3.5 3.5 0 004.95 0l2.5-2.5a3.5 3.5 0 00-4.95-4.95l-1.25 1.25zm-4.69 9.64a2 2 0 010-2.83l2.5-2.5a2 2 0 012.83 0 .75.75 0 001.06-1.06 3.5 3.5 0 00-4.95 0l-2.5 2.5a3.5 3.5 0 004.95 4.95l1.25-1.25a.75.75 0 00-1.06-1.06l-1.25 1.25a2 2 0 01-2.83 0z',
                  },
                },
              ],
            },
          ],
        },
      };
    }
    return pluginObj;
  });
}

export function rocketLaunch() {
  return {
    path: path.resolve(__dirname),
    setupUnifiedPlugins: [addOcticonToHeadlines],
    setupEleventyComputedConfig: [
      adjustPluginOptions('layout', { defaultLayout: 'layout-sidebar' }),
    ],
    adjustImagePresets: imagePresets => ({
      ...imagePresets,
      responsive: {
        ...imagePresets.responsive,
        widths: [600, 900, 1640],
        sizes: '(min-width: 1024px) 820px, calc(100vw - 40px)',
      },
    }),
  };
}
