import { white, bold, cyan, gray } from 'colorette';
import { createAddress, logNetworkAddress } from '../helpers/infoMessages.js';

/** @typedef {import('@web/dev-server').DevServerConfig} DevServerConfig */

/**
 * @param {{ devServerOptions: DevServerConfig}} options
 * @param {console} logger
 */
export function logPreviewMessage({ devServerOptions }, logger) {
  const prettyHost = devServerOptions.hostname ?? 'localhost';
  let openPath = typeof devServerOptions.open === 'string' ? devServerOptions.open : '/';
  if (!openPath.startsWith('/')) {
    openPath = `/${openPath}`;
  }

  logger.log(`${bold(`👀 Previewing Production Build`)}`);
  logger.log('');
  logger.log(
    `${white('  🚧 Local:')}    ${cyan(createAddress(devServerOptions, prettyHost, openPath))}`,
  );
  logNetworkAddress(devServerOptions, logger, openPath);
  const sourceDir = devServerOptions.rootDir;
  if (sourceDir) {
    logger.log(`${white('  📝 Source:')}   ${cyan(sourceDir)}`);
  }
  logger.log('');
  logger.log(
    gray(
      'If what you see works as expected then you can upload "source" to your production web server.',
    ),
  );
}
