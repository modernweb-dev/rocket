// @ts-check

import proxy from 'koa-proxy';
import { addPlugin } from 'plugins-manager';

export default /** @type {import('../../../../../types/main.js').RocketCliOptions} */ ({
  setupDevServerMiddleware: [
    addPlugin(proxy, {
      host: 'http://localhost:9000/',
      match: /^\/api\//,
    }),
  ],
});
