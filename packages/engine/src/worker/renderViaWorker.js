import { Worker } from 'worker_threads';

const workerFilePath = new URL('./renderWorker.js', import.meta.url).pathname;

/** @type {Worker | undefined} */
let workerSingleton;

const history = new Set();

/**
 * @param {string} sourceFilePath
 * @returns {Promise<Worker>}
 */
async function getWorker(sourceFilePath) {
  if (!workerSingleton) {
    workerSingleton = new Worker(workerFilePath);
  }

  if (history.has(sourceFilePath)) {
    // trying rerender the same file => needs a new worker to clear the module cache
    await workerSingleton.terminate();
    workerSingleton = new Worker(workerFilePath);
    history.clear();
  }
  history.add(sourceFilePath);

  return workerSingleton;
}

let isRendering = '';

/**
 * @param {object} options
 * @param {string} options.sourceFilePath
 * @param {string} options.outputDir
 * @param {string} options.inputDir
 * @param {string} options.renderMode
 * @returns
 */
export function renderViaWorker({
  sourceFilePath,
  inputDir,
  outputDir,
  renderMode = 'development',
}) {
  return new Promise((resolve, reject) => {
    getWorker(sourceFilePath).then(worker => {
      // console.log(`Rendering ${filePath} via worker`);
      if (isRendering !== '') {
        reject(
          new Error(
            `Trying to start rendering ${sourceFilePath} while ${isRendering} is rendering`,
          ),
        );
      }
      isRendering = sourceFilePath;
      /**
       * @param {Error} error
       */
      function handleError(error) {
        // the worker is dead long live the worker
        cleanupRenderWorker().then(() => {
          reject(error);
        });
      }

      worker.once('message', result => {
        isRendering = '';
        worker.removeListener('error', handleError);
        if (result.passOnError) {
          reject(result.passOnError);
        }
        if (result.sourceFilePath === sourceFilePath) {
          resolve(result);
        } else {
          reject(new Error(`File path mismatch: ${result.sourceFilePath} !== ${sourceFilePath}`));
        }
      });
      worker.once('error', handleError);

      worker.postMessage({
        action: 'renderFile',
        sourceFilePath,
        outputDir,
        inputDir,
        renderMode,
      });
    });
  });
}

export async function cleanupRenderWorker() {
  if (workerSingleton) {
    await workerSingleton.terminate();
    workerSingleton = undefined;
  }
}
