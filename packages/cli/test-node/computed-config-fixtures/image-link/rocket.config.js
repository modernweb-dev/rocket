import { adjustPluginOptions } from 'plugins-manager';

function image(h, node) {
  return h(node, 'img', {
    src: node.url,
    alt: node.alt,
  });
}

/** @type {Partial<import("../../../types/main").RocketCliOptions>} */
const config = {
  setupUnifiedPlugins: [
    adjustPluginOptions('remark2rehype', {
      handlers: {
        image,
      },
    }),
  ],
};
export default config;
