import { cleanupRenderWorker } from '../packages/engine/src/worker/renderViaWorker.js';
import { cleanupImportWorker } from '../packages/engine/src/worker/importViaWorker.js';

export const mochaHooks = {
  afterAll: async () => {
    // one-time final cleanup
    await cleanupRenderWorker();
    await cleanupImportWorker();
  },
};
