/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

import { Engine } from '@rocket/engine/server';
import { gatherFiles } from '@rocket/engine';

import { fromRollup } from '@web/dev-server-rollup';

import { rollup } from 'rollup';
import path from 'path';
import { rollupPluginHTML } from '@web/rollup-plugin-html';

import { createMpaConfig, createServiceWorkerConfig } from '@rocket/building-rollup';
import { adjustPluginOptions } from 'plugins-manager';
import { existsSync } from 'fs';
import { readFile, unlink, writeFile } from 'fs/promises';

import puppeteer from 'puppeteer';

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
    await this.cli.events.dispatchEventDone('build-start');

    this.engine = new Engine();
    this.engine.setOptions({
      docsDir: this.cli.options.inputDir,
      outputDir: this.cli.options.outputDevDir,
      setupPlugins: this.cli.options.setupEnginePlugins,
      longFileHeaderWidth: this.cli.options.longFileHeaderWidth,
      longFileHeaderComment: this.cli.options.longFileHeaderComment,
      renderMode: 'production',
      clearOutputDir: this.cli.options.clearOutputDir,
    });
    console.log('Engine building...');
    await this.engine.build({ autoStop: this.cli.options.buildAutoStop });

    if (this.cli.options.buildOpenGraphImages) {
      console.log('Generating Open Graph Images...');
      await this.buildOpenGraphImages();
    }

    if (this.cli.options.buildOptimize) {
      console.log('Optimize Production Build...');
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

    await this.cli.events.dispatchEventDone('build-end');
  }

  async buildOpenGraphImages() {
    const openGraphFiles = await gatherFiles(this.cli.options.outputDevDir, {
      fileEndings: ['.opengraph.html'],
    });
    if (openGraphFiles.length === 0) {
      return;
    }

    // TODO: enable URL support in the Engine and remove this "workaround"
    if (
      typeof this.cli.options.inputDir !== 'string' ||
      typeof this.cli.options.outputDevDir !== 'string'
    ) {
      return;
    }

    const withWrap = this.cli.options.setupDevServerAndBuildPlugins
      ? this.cli.options.setupDevServerAndBuildPlugins.map(modFunction => {
          modFunction.wrapPlugin = fromRollup;
          return modFunction;
        })
      : [];

    this.engine = new Engine();
    this.engine.setOptions({
      docsDir: this.cli.options.inputDir,
      outputDir: this.cli.options.outputDevDir,
      setupPlugins: this.cli.options.setupEnginePlugins,
      open: false,
      clearOutputDir: false,
      adjustDevServerOptions: this.cli.options.adjustDevServerOptions,
      setupDevServerMiddleware: this.cli.options.setupDevServerMiddleware,
      setupDevServerPlugins: [...this.cli.options.setupDevServerPlugins, ...withWrap],
    });
    try {
      await this.engine.start();

      const browser = await puppeteer.launch();
      const page = await browser.newPage();

      // In 2022 Twitter & Facebook recommend a size of 1200x628 - we capture with 2 dpr for retina displays
      await page.setViewport({
        width: 1200,
        height: 628,
        deviceScaleFactor: 2,
      });

      for (const openGraphFile of openGraphFiles) {
        const relUrl = path.relative(this.cli.options.outputDevDir, openGraphFile);
        const imagePath = openGraphFile.replace('.opengraph.html', '.opengraph.png');
        const htmlPath = openGraphFile.replace('.opengraph.html', '.html');
        const relImageUrl = path.basename(imagePath);

        let htmlString = await readFile(htmlPath, 'utf8');
        if (!htmlString.includes('<meta property="og:image"')) {
          if (htmlString.includes('</head>')) {
            htmlString = htmlString.replace(
              '</head>',
              [
                '    <meta property="og:image:width" content="2400">',
                '    <meta property="og:image:height" content="1256">',
                `    <meta property="og:image" content="./${relImageUrl}">`,
                '  </head>',
              ].join('\n'),
            );
          }
        }
        const url = `http://localhost:${this.engine.devServer.config.port}/${relUrl}`;
        await page.goto(url, { waitUntil: 'networkidle0' });
        await page.screenshot({ path: imagePath });

        await unlink(openGraphFile);
        await writeFile(htmlPath, htmlString);
      }
      await browser.close();

      await this.engine.stop();
    } catch (e) {
      console.log('Could not start dev server to generate open graph images');
      console.error(e);
    }
  }
}
