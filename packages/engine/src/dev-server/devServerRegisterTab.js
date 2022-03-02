import { existsSync } from 'fs';
import path from 'path';
import { debuglog } from 'util';
import { updateRocketHeader } from '../file-header/updateRocketHeader.js';
import { cleanupAutoGeneratedFiles } from '../formats/cleanupAutoGeneratedFiles.js';

const logRendering = debuglog('engine:rendering');

/**
 * @param {object} options
 * @param {string} options.inputDir
 * @param {(sourceFilePath: string) => string} options.getSourceFilePathFromUrl
 * @param {(sourceFilePath: string) => string} options.getOutputFilePath
 * @param {import('../web-menu/PageTree.js').PageTree} options.pageTree
 * @param {(sourceFilePath: string) => Promise<import('../../types/main.js').renderWorkerResult>} options.renderFile
 * @param {(options?: { triggerSourceFilePath?: string, deleteOtherFiles?: boolean}) => void} options.renderAllOpenedFiles
 * @returns {import('../../types/main.js').DevServerPlugin}
 */
export function devServerRegisterTab({
  inputDir,
  getSourceFilePathFromUrl,
  getOutputFilePath,
  pageTree,
  renderFile,
  renderAllOpenedFiles,
}) {
  return {
    name: 'register-tab-plugin',
    injectWebSocket: true,
    /**
     * @param {import('koa').Context} context
     */
    serve: async context => {
      if (context.path === '/ws-register-tab.js') {
        return "import { sendMessage } from '/__web-dev-server__web-socket.js';\n export default () => { sendMessage({ type: 'register-tab', pathname: document.location.pathname }); }";
      }

      // generating files on demand
      const sourceFilePath = await getSourceFilePathFromUrl(context.path);
      if (sourceFilePath) {
        const outputFilePath = getOutputFilePath(sourceFilePath);
        if (!existsSync(outputFilePath)) {
          const sourceRelativeFilePath = path.relative(inputDir, sourceFilePath);
          await updateRocketHeader(sourceFilePath, inputDir);
          logRendering(`${sourceRelativeFilePath} because it got requested by a browser tab.`);
          try {
            const result = await renderFile(sourceFilePath);
            await pageTree.add(sourceRelativeFilePath);
            await pageTree.save();
            await cleanupAutoGeneratedFiles(result);
            if (pageTree.needsAnotherRenderingPass) {
              logRendering(`${sourceRelativeFilePath} again as the pageTree was modified.`);
              const result = await renderFile(sourceFilePath);
              await cleanupAutoGeneratedFiles(result);
              await renderAllOpenedFiles({ triggerSourceFilePath: sourceFilePath });
              pageTree.needsAnotherRenderingPass = false;
            }
          } catch (error) {
            // nothing as error already rendered to file
          }
        }
      }
    },
  };
}
