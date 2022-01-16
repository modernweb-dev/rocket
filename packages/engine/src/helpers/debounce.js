/**
 * Debounce a function
 * @template {(this: any, ...args: any[]) => void} T
 * @param  {T}       func      function
 * @param  {number}  wait      time in milliseconds to debounce
 * @param  {boolean} immediate when true, run immediately and on the leading edge
 * @return {T}                 debounced function
 */
export function debounce(func, wait, immediate) {
  /** @type {number|undefined} */
  let timeout;
  return /** @type {typeof func}*/ (function () {
    let args = /** @type {Parameters<typeof func>} */ (/** @type {unknown}*/ (arguments));
    const later = () => {
      timeout = undefined;
      if (!immediate) func.apply(this, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(this, args);
  });
}
