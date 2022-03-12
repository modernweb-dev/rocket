/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

import { Engine } from '@rocket/engine/server';

import { rollup } from 'rollup';
import path from 'path';
import { rollupPluginHTML } from '@web/rollup-plugin-html';

import { createMpaConfig, createServiceWorkerConfig } from '@rocket/building-rollup';
import { adjustPluginOptions } from 'plugins-manager';
import { existsSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';

/**
 * @param {object} config
 */
async function buildAndWrite(config) {
  const bundle = await rollup(config);

  if (Array.isArray(config.output)) {
    await bundle.write(config.output[0]);
    await bundle.write(config.output[1]);
  } else {
    await bundle.write(config.output);
  }
}

async function productionBuild(config) {
  const defaultSetupPlugins = [];
  if (config.pathPrefix) {
    defaultSetupPlugins.push(
      adjustPluginOptions(rollupPluginHTML, { absolutePathPrefix: config.pathPrefix }),
    );
  }

  const mpaConfig = createMpaConfig({
    input: '**/*.html',
    output: {
      dir: config.outputDir,
    },
    // custom
    rootDir: path.resolve(config.outputDevDir),
    absoluteBaseUrl: config.absoluteBaseUrl,
    setupPlugins: [
      ...defaultSetupPlugins,
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
}

export class RocketBuild {
  async setupCommand(program, cli) {
    this.cli = cli;

    program
      .command('build')
      .option('-i, --input-dir <path>', 'path to where to search for source files')
      .action(async cliOptions => {
        cli.setOptions(cliOptions);

        await this.build();
      });
  }

  async build() {
    this.engine = new Engine();
    this.engine.setOptions({
      docsDir: this.cli.options.inputDir,
      outputDir: this.cli.options.outputDevDir,
      setupPlugins: this.cli.options.setupEnginePlugins,
      renderMode: 'production',
    });
    await this.engine.build({ autoStop: this.cli.options.buildAutoStop });

    if (this.cli.options.buildOptimize) {
      await productionBuild(this.cli.options);
      await this.engine.copyPublicFilesTo(this.cli.options.outputDir);
    }

    // hackfix 404.html by making all asset urls absolute (rollup always makes them relative) which will break if netlify serves the content form a different url
    // TODO: find a better way to do this
    const notFoundHtmlFilePath = path.join(this.cli.options.outputDir, '404.html');
    if (existsSync(notFoundHtmlFilePath)) {
      let notFoundHtml = await readFile(notFoundHtmlFilePath, 'utf8');
      notFoundHtml = notFoundHtml.replace(/img src="/gm, 'img src="/');
      notFoundHtml = notFoundHtml.replace(
        /link rel="stylesheet" href="/gm,
        'link rel="stylesheet" href="/',
      );
      await writeFile(notFoundHtmlFilePath, notFoundHtml);
    }
  }
}
