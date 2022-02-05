import { Worker } from 'worker_threads';

const workerFilePath = new URL('./worker/renderFile.js', import.meta.url).pathname;

let worker = new Worker(workerFilePath);
const history = new Set();
let isRendering = '';

/**
 * @param {object} options
 * @param {string} options.filePath
 * @param {string} options.outputDir
 * @param {boolean} options.writeFileToDisk
 * @param {string} options.renderMode
 * @returns 
 */
export function renderViaWorker({
  filePath,
  outputDir,
  writeFileToDisk,
  renderMode = 'development',
}) {
  if (history.has(filePath)) {
    // trying rerender the same file => needs a new worker to clear the module cache
    worker.unref();
    worker = new Worker(workerFilePath);
    history.clear();
  }
  history.add(filePath);

  return new Promise((resolve, reject) => {
    // console.log(`Rendering ${filePath} via worker`);
    if (isRendering !== '') {
      reject(new Error(`Trying to start rendering ${filePath} while ${isRendering} is rendering`));
    }
    isRendering = filePath;

    worker.postMessage({ action: 'renderFile', filePath, outputDir, writeFileToDisk, renderMode });

    function handleError(error) {
      isRendering = '';
      // the worker is dead long live the worker
      worker.unref();
      worker = new Worker(workerFilePath);
      reject(error);
    }

    worker.once('message', result => {
      isRendering = '';
      worker.removeListener('error', handleError);
      if (result.filePath === filePath) {
        resolve(result);
      } else {
        reject(new Error(`File path mismatch: ${result.filePath} !== ${filePath}`));
      }
    });
    worker.once('error', handleError);
  });
}

export async function cleanupWorker() {
  await worker.unref();
}
