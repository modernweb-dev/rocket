import chai from 'chai';
import chalk from 'chalk';
import { execute, setFixtureDir } from '@rocket/cli/test-helpers';

const { expect } = chai;

describe('RocketCli use cases', () => {
  let cleanupCli;

  before(() => {
    // ignore colors in tests as most CIs won't support it
    chalk.level = 0;
    setFixtureDir(import.meta.url);
  });

  afterEach(async () => {
    if (cleanupCli?.cleanup) {
      await cleanupCli.cleanup();
    }
  });

  it('supports dynamic imports', async () => {
    const {
      cli,
      readOutput,
      outputExists,
    } = await execute('use-cases/dynamic-imports/rocket.config.js', { captureLog: true });
    cleanupCli = cli;

    expect(outputExists('sub/assets/myData.js'), 'static files did not get copied').to.be.true;

    const aboutHtml = await readOutput('about/index.html', { formatHtml: true });
    expect(aboutHtml).to.equal(
      [
        '<p><code>about.md</code></p>',
        '<script type="module" src="/about/__mdjs-stories.js" mdjs-setup></script>',
      ].join('\n'),
    );

    const subHtml = await readOutput('sub/index.html', { formatHtml: true });
    expect(subHtml).to.equal(
      [
        '<p><code>sub/index.md</code></p>',
        '<script type="module" src="/sub/__mdjs-stories.js" mdjs-setup></script>',
      ].join('\n'),
    );

    const subDetailsHtml = await readOutput('sub/details/index.html', {
      formatHtml: true,
    });
    expect(subDetailsHtml).to.equal(
      [
        '<p><code>sub/details.md</code></p>',
        '<script type="module" src="/sub/details/__mdjs-stories.js" mdjs-setup></script>',
      ].join('\n'),
    );

    const indexHtml = await readOutput('index.html', { formatHtml: true });
    expect(indexHtml).to.equal(
      [
        '<p><code>index.md</code></p>',
        '<script type="module" src="/__mdjs-stories.js" mdjs-setup></script>',
      ].join('\n'),
    );
  });
});
