/* eslint-disable @typescript-eslint/ban-ts-comment */
import path from 'path';
import { existsSync } from 'fs';
import { rollup } from 'rollup';

// @ts-ignore
import { createMpaConfig, createServiceWorkerConfig } from '@rocket/building-rollup';

// import { rollupPluginHTML } from '@web/rollup-plugin-html';
// import { adjustPluginOptions } from 'plugins-manager';

/**
 * @param {import('rollup').RollupOptions} config
 */
async function buildAndWrite(config) {
  if (!config.output) {
    return;
  }

  const bundle = await rollup(config);

  if (Array.isArray(config.output)) {
    await bundle.write(config.output[0]);
    await bundle.write(config.output[1]);
  } else {
    await bundle.write(config.output);
  }
}

/**
 * @param {import('../RocketCli.js').RocketCli} cli
 * @param {import('@rocket/engine/server').Engine} engine
 * @returns
 */
export async function buildJavaScriptOptimizedOutput(cli, engine) {
  const config = cli.options;

  // for typescript as `this.cli.options.outputDir` supports other inputs as well
  // but the cli will normalize it to a string before calling plugins
  if (typeof config.outputDir !== 'string' || typeof config.outputDevDir !== 'string') {
    return;
  }

  await cli.clearOutputDir();

  // TODO: pathPrefix is currently not supported
  // const defaultSetupPlugins = [];
  // if (config.pathPrefix) {
  //   defaultSetupPlugins.push(
  //     adjustPluginOptions(rollupPluginHTML, { absolutePathPrefix: config.pathPrefix }),
  //   );
  // }

  const mpaConfig = createMpaConfig({
    input: '**/*.html',
    output: {
      dir: config.outputDir,
    },
    // custom
    rootDir: path.resolve(config.outputDevDir),
    absoluteBaseUrl: config.absoluteBaseUrl,
    setupPlugins: [
      // ...defaultSetupPlugins,
      ...config.setupDevServerAndBuildPlugins,
      ...config.setupBuildPlugins,
    ],
  });
  const finalConfig =
    typeof config.adjustBuildOptions === 'function'
      ? config.adjustBuildOptions(mpaConfig)
      : mpaConfig;
  await buildAndWrite(finalConfig);

  const { serviceWorkerSourcePath } = config;
  if (existsSync(serviceWorkerSourcePath)) {
    const serviceWorkerConfig = createServiceWorkerConfig({
      input: serviceWorkerSourcePath,
      output: {
        file: path.join(path.resolve(config.outputDir), config.serviceWorkerName),
      },
    });

    await buildAndWrite(serviceWorkerConfig);
  }

  // copy static files over
  await engine.copyPublicFilesTo(config.outputDir);
}
