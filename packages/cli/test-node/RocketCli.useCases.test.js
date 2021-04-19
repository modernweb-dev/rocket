import chai from 'chai';
import chalk from 'chalk';
import {
  executeStart,
  readStartOutput,
  setFixtureDir,
  startOutputExist,
} from '@rocket/cli/test-helpers';

const { expect } = chai;

describe('RocketCli use cases', () => {
  let cli;

  before(() => {
    // ignore colors in tests as most CIs won't support it
    chalk.level = 0;
    setFixtureDir(import.meta.url);
  });

  afterEach(async () => {
    if (cli?.cleanup) {
      await cli.cleanup();
    }
  });

  it('supports dynamic imports', async () => {
    cli = await executeStart('use-cases/dynamic-imports/rocket.config.js');

    expect(startOutputExist(cli, 'sub/assets/myData.js'), 'static files did not get copied').to.be
      .true;

    const aboutHtml = await readStartOutput(cli, 'about/index.html', { formatHtml: true });
    expect(aboutHtml).to.equal(
      [
        '<p><code>about.md</code></p>',
        '<script type="module" src="/about/__mdjs-stories.js" mdjs-setup></script>',
      ].join('\n'),
    );

    const subHtml = await readStartOutput(cli, 'sub/index.html', { formatHtml: true });
    expect(subHtml).to.equal(
      [
        '<p><code>sub/index.md</code></p>',
        '<script type="module" src="/sub/__mdjs-stories.js" mdjs-setup></script>',
      ].join('\n'),
    );

    const subDetailsHtml = await readStartOutput(cli, 'sub/details/index.html', {
      formatHtml: true,
    });
    expect(subDetailsHtml).to.equal(
      [
        '<p><code>sub/details.md</code></p>',
        '<script type="module" src="/sub/details/__mdjs-stories.js" mdjs-setup></script>',
      ].join('\n'),
    );

    const indexHtml = await readStartOutput(cli, 'index.html', { formatHtml: true });
    expect(indexHtml).to.equal(
      [
        '<p><code>index.md</code></p>',
        '<script type="module" src="/__mdjs-stories.js" mdjs-setup></script>',
      ].join('\n'),
    );
  });
});
