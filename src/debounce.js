/**
 * @template {(...args: any) => any} F
 * @param {F} fn
 * @param {number} timeout
 * @returns {(...args: Parameters<F>) => ReturnType<F>}
 */
export function debounce(fn, timeout) {
  const func = function (/** @type {Parameters<F>} */ ...args) {
    if (ret._ready) {
      ret._ready = false;
      setTimeout(() => {
        ret._ready = true;
        return fn(...args);
      }, timeout);
    }
  };
  func._ready = true;
  /** @type {((...args: any) => any) & {_ready: boolean}} */
  const ret = func;
  return ret;
}
