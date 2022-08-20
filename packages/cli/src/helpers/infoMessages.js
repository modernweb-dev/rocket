import ip from 'ip';
import { white, cyan } from 'colorette';

/** @typedef {import('@web/dev-server').DevServerConfig} DevServerConfig */

/**
 *
 * @param {DevServerConfig} devServerOptions
 * @param {string} host
 * @param {string} path
 * @returns {string}
 */
export function createAddress(devServerOptions, host, path) {
  return `http${devServerOptions.http2 ? 's' : ''}://${host}:${devServerOptions.port}${path}`;
}

/**
 *
 * @param {DevServerConfig} devServerOptions
 * @param {console} logger
 * @param {string} openPath
 */
export function logNetworkAddress(devServerOptions, logger, openPath) {
  try {
    const address = ip.address();
    if (typeof address === 'string') {
      logger.log(
        `${white('  🌐 Network:')}  ${cyan(createAddress(devServerOptions, address, openPath))}`,
      );
    }
  } catch (_a) {
    //
  }
}
