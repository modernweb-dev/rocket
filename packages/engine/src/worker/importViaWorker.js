import { Worker } from 'worker_threads';

const workerFilePath = new URL('./importWorker.js', import.meta.url).pathname;

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

/**
 * @param {object} options
 * @param {string} options.sourceFilePath
 * @param {Boolean} [options.throwOnError]
 * @returns
 */
export function importViaWorker({ sourceFilePath, throwOnError = false }) {
  return new Promise((resolve, reject) => {
    getWorker(sourceFilePath).then(worker => {
      /**
       * @param {Error} error
       */
      function handleError(error) {
        // the worker is dead long live the worker
        cleanupImportWorker().then(() => {
          reject(error);
        });
      }

      worker.once('message', result => {
        worker.removeListener('error', handleError);
        if (result.error) {
          reject(result.error);
        }
        if (result.sourceFilePath === sourceFilePath) {
          resolve(result);
        } else {
          reject(new Error(`File path mismatch: ${result.sourceFilePath} !== ${sourceFilePath}`));
        }
      });
      worker.once('error', handleError);
      worker.postMessage({
        sourceFilePath,
        throwOnError,
      });
    });
  });
}

export async function cleanupImportWorker() {
  if (workerSingleton) {
    await workerSingleton.terminate();
    workerSingleton = undefined;
  }
}
