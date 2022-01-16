import { Worker } from 'worker_threads';

const workerFilePath = new URL('./worker/renderFile.js', import.meta.url).pathname;

let worker = new Worker(workerFilePath);
const history = new Set();
let isRendering = '';

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

    worker.once('message', result => {
      isRendering = '';
      if (result.filePath === filePath) {
        resolve(result);
      } else {
        reject(new Error(`File path mismatch: ${result.filePath} !== ${filePath}`));
      }
    });
    worker.once('error', error => {
      isRendering = '';
      // the worker is dead long live the worker
      worker.unref();
      worker = new Worker(workerFilePath);
      reject(error);
    });
  });
}

export async function cleanupWorker() {
  await worker.unref();
}
