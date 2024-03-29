import { white, bold, cyan, gray } from 'colorette';
import { createAddress, logNetworkAddress } from '../helpers/infoMessages.js';

/** @typedef {import('@web/dev-server').DevServerConfig} DevServerConfig */

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
