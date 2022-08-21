import { gatherFiles } from '@rocket/engine';
import { Engine } from '@rocket/engine/server';
import { fromRollup } from '@web/dev-server-rollup';

import { readFile, unlink, writeFile } from 'fs/promises';

import puppeteer from 'puppeteer';
import path from 'path';

/**
 * @param {import('../RocketCli.js').RocketCli} cli
 * @returns
 */
export async function buildOpenGraphImages(cli) {
  const openGraphFiles = await gatherFiles(cli.options.outputDevDir, {
    fileEndings: ['.opengraph.html'],
  });
  if (openGraphFiles.length === 0) {
    return;
  }

  // TODO: enable URL support in the Engine and remove this typescript "workaround"
  if (typeof cli.options.inputDir !== 'string' || typeof cli.options.outputDevDir !== 'string') {
    return;
  }

  const withWrap = cli.options.setupDevServerAndBuildPlugins
    ? cli.options.setupDevServerAndBuildPlugins.map(modFunction => {
        modFunction.wrapPlugin = fromRollup;
        return modFunction;
      })
    : [];

  const engine = new Engine();
  engine.setOptions({
    docsDir: cli.options.inputDir,
    outputDir: cli.options.outputDevDir,
    setupPlugins: cli.options.setupEnginePlugins,
    open: false,
    clearOutputDir: false,
    adjustDevServerOptions: cli.options.adjustDevServerOptions,
    setupDevServerMiddleware: cli.options.setupDevServerMiddleware,
    setupDevServerPlugins: [...cli.options.setupDevServerPlugins, ...withWrap],
  });
  try {
    await engine.start();
    if (!engine?.devServer?.config.port) {
      return;
    }

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // In 2022 Twitter & Facebook recommend a size of 1200x628 - we capture with 2 dpr for retina displays
    await page.setViewport({
      width: 1200,
      height: 628,
      deviceScaleFactor: 2,
    });

    for (const openGraphFile of openGraphFiles) {
      const relUrl = path.relative(cli.options.outputDevDir, openGraphFile);
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
      const url = `http://localhost:${engine.devServer.config.port}/${relUrl}`;
      await page.goto(url, { waitUntil: 'networkidle0' });
      await page.screenshot({ path: imagePath });

      await unlink(openGraphFile);
      await writeFile(htmlPath, htmlString);
    }
    await browser.close();

    await engine.stop();
  } catch (e) {
    console.log('Could not start dev server to generate open graph images');
    console.error(e);
  }
}
