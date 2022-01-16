/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

import { Engine } from '@rocket/engine/server';

import { rollup } from 'rollup';
import path from 'path';
import { copy } from '@web/rollup-plugin-copy';
import { rollupPluginHTML } from '@web/rollup-plugin-html';

import { createMpaConfig, createServiceWorkerConfig } from '@rocket/building-rollup';
import { addPlugin, adjustPluginOptions } from 'plugins-manager';
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
  const defaultSetupPlugins = [
    addPlugin(copy, {
      patterns: ['__public/**/'],
      rootDir: config.outputDevDir,
    }),
  ];
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
  const finalConfig = typeof config.rollup === 'function' ? config.rollup(mpaConfig) : mpaConfig;
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
  static pluginName = 'RocketBuild';

  /**
   * @param {RocketCliOptions} config
   */
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
    await this.engine.build();

    await productionBuild(this.cli.options);

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

  // /**
  //  * @param {RocketCliOptions} config
  //  */
  // setupCommand(config) {
  //   config.watch = false;
  //   config.lintInputDir = config.outputDir;
  //   return config;
  // }

  // async buildCommand() {
  //   await this.eleventy.write();
  //   if (this.config.emptyOutputDir) {
  //     await fs.emptyDir(this.config.outputDir);
  //   }
  //   await productionBuild(this.config);
  // }
}
