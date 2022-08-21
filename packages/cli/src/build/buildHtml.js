import { Engine } from '@rocket/engine/server';

/**
 * @param {import('../RocketCli.js').RocketCli} cli
 * @returns
 */
export async function buildHtml(cli) {
  // TODO: enable URL support in the Engine and remove this typescript "workaround"
  if (typeof cli.options.inputDir !== 'string' || typeof cli.options.outputDevDir !== 'string') {
    return;
  }

  await cli.clearOutputDevDir();
  const engine = new Engine();
  engine.setOptions({
    docsDir: cli.options.inputDir,
    outputDir: cli.options.outputDevDir,
    setupPlugins: cli.options.setupEnginePlugins,
    longFileHeaderWidth: cli.options.longFileHeaderWidth,
    longFileHeaderComment: cli.options.longFileHeaderComment,
    renderMode: 'production',
    clearOutputDir: cli.options.clearOutputDir,
  });
  console.log('Engine building...');
  await engine.build({ autoStop: cli.options.buildAutoStop });

  return engine;
}
