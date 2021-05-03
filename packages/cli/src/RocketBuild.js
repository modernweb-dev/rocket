/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

import { rollup } from 'rollup';
import fs from 'fs-extra';
import path from 'path';
import { copy } from '@web/rollup-plugin-copy';

import { createMpaConfig, createServiceWorkerConfig } from '@rocket/building-rollup';
import { addPlugin, adjustPluginOptions } from 'plugins-manager';

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
    addPlugin({
      name: 'copy',
      plugin: copy,
      options: {
        patterns: ['!(*.md|*.html)*', '_merged_assets/_static/**/*.{png,gif,jpg,json,css,svg,ico}'],
        rootDir: config.outputDevDir,
      },
    }),
  ];
  if (config.pathPrefix) {
    defaultSetupPlugins.push(
      adjustPluginOptions('html', { absolutePathPrefix: config.pathPrefix }),
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
      ...config.setupDevAndBuildPlugins,
      ...config.setupBuildPlugins,
    ],
  });

  await buildAndWrite(mpaConfig);

  const serviceWorkerSourcePath = path.resolve('docs/_merged_assets/service-worker.js');
  if (fs.existsSync(serviceWorkerSourcePath)) {
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
  commands = ['build'];

  /**
   * @param {RocketCliOptions} config
   */
  setupCommand(config) {
    config.watch = false;
    config.lintInputDir = config.outputDir;
    return config;
  }

  async setup({ config, eleventy }) {
    this.config = {
      emptyOutputDir: true,
      ...config,
    };
    this.eleventy = eleventy;
  }

  async buildCommand() {
    await this.eleventy.write();
    if (this.config.emptyOutputDir) {
      await fs.emptyDir(this.config.outputDir);
    }
    await productionBuild(this.config);
  }
}
