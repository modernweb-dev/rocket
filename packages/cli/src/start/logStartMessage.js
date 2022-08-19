import ip from 'ip';
import { white, bold, cyan, gray } from 'colorette';

/** @typedef {import('@web/dev-server').DevServerConfig} DevServerConfig */

/**
 *
 * @param {DevServerConfig} devServerOptions
 * @param {string} host
 * @param {string} path
 * @returns {string}
 */
function createAddress(devServerOptions, host, path) {
  return `http${devServerOptions.http2 ? 's' : ''}://${host}:${devServerOptions.port}${path}`;
}

/**
 *
 * @param {DevServerConfig} devServerOptions
 * @param {console} logger
 * @param {string} openPath
 */
function logNetworkAddress(devServerOptions, logger, openPath) {
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

/**
 * @param {{ devServerOptions: DevServerConfig, engine: import('@rocket/engine/server').Engine}} options
 * @param {console} logger
 */
export function logStartMessage({ devServerOptions, engine }, logger) {
  const prettyHost = devServerOptions.hostname ?? 'localhost';
  let openPath = typeof devServerOptions.open === 'string' ? devServerOptions.open : '/';
  if (!openPath.startsWith('/')) {
    openPath = `/${openPath}`;
  }

  logger.log(`${bold(`🚀 Rocket Engine`)} ${gray(`v${engine.getVersion()}`)}`);
  logger.log('');
  logger.log(
    `${white('  🚧 Local:')}    ${cyan(createAddress(devServerOptions, prettyHost, openPath))}`,
  );
  logNetworkAddress(devServerOptions, logger, openPath);
  logger.log('');
}
