/**
 * @param {[number, number]} perf
 * @returns {string}
 */
export function formatPerformance(perf) {
  return (perf[0] + perf[1] / 1e9).toFixed(2);
}
