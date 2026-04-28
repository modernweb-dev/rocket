/** @typedef {import('node:worker_threads').MessagePort} MessagePort */
/** @typedef {MessagePort & {sendAndWait: (message: any) => any; _wait: PromiseWithResolvers<any>}} AsyncPort */

/**
 * Turns a MessagePort into an AsyncPort, which can wait for responses.
 * @param {MessagePort} port
 * @returns {AsyncPort}
 */
export function makeAsyncPort(port) {
  const p = /** @type {AsyncPort} */ (port);
  p._wait = Promise.withResolvers();
  p.on('message', message => {
    p._wait.resolve(message);
    p._wait = Promise.withResolvers();
  });
  p.sendAndWait = async message => {
    p.postMessage(message);
    return p._wait;
  };
  return p;
}
