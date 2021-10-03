import chai from 'chai';
import chalk from 'chalk';
import { execute, setFixtureDir } from '@rocket/cli/test-helpers';

const { expect } = chai;

function getInjectServiceWorker(text) {
  const scriptOpenTagStart = text.indexOf('<script type="module" inject-service-worker=""');
  const scriptCloseTagEnd = text.indexOf('</script>', scriptOpenTagStart) + 9;
  text = text.substring(scriptOpenTagStart, scriptCloseTagEnd);
  return text;
}

function getServiceWorkerUrl(text) {
  const matches = text.match(/window\.__rocketServiceWorkerUrl = '(.*?)';/);
  return matches[1];
}

describe('RocketCli e2e', () => {
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

  it('will add a script to inject the service worker', async () => {
    const { cli, readOutput } = await execute('e2e-fixtures/service-worker/rocket.config.js', {
      captureLog: true,
      type: 'build',
    });
    cleanupCli = cli;

    // we check the start output here as in the rollup build version it's hard to find
    const indexHtml = await readOutput('../__output-dev/index.html');
    const indexInject = getInjectServiceWorker(indexHtml);
    expect(indexInject).to.equal(
      '<script type="module" inject-service-worker="" src="/_merged_assets/scripts/registerServiceWorker.js"></script>',
    );
    expect(getServiceWorkerUrl(indexHtml)).to.equal('/service-worker.js');

    // we check the start output here as in the rollup build version it's hard to find
    const subHtml = await readOutput('../__output-dev/sub/index.html');
    const subInject = getInjectServiceWorker(subHtml);
    expect(subInject).to.equal(
      '<script type="module" inject-service-worker="" src="/_merged_assets/scripts/registerServiceWorker.js"></script>',
    );
    expect(getServiceWorkerUrl(subHtml)).to.equal('/service-worker.js');
  });

  // TODO: find a way to run these test either by forcing pathPrefix in start or skipping asset gathering for build or ...
  it.skip('will add a script to inject the service worker', async () => {
    const { cli, readOutput } = await execute(
      'e2e-fixtures/service-worker/pathPrefix.rocket.config.js',
      {
        captureLog: true,
        type: 'build',
      },
    );
    cleanupCli = cli;
    const indexHtml = await readOutput('index.html');
    const indexInject = getInjectServiceWorker(indexHtml);
    expect(indexInject).to.equal(
      '<script type="module" inject-service-worker="" src="/my-prefix-folder/_merged_assets/scripts/registerServiceWorker.js"></script>',
    );
    expect(getServiceWorkerUrl(indexHtml)).to.equal('/my-prefix-folder/service-worker.js');
    const subHtml = await readOutput('sub/index.html');
    const subInject = getInjectServiceWorker(subHtml);
    expect(subInject).to.equal(
      '<script type="module" inject-service-worker="" src="/my-prefix-folder/_merged_assets/scripts/registerServiceWorker.js"></script>',
    );
    expect(getServiceWorkerUrl(subHtml)).to.equal('/my-prefix-folder/service-worker.js');
  });
});
