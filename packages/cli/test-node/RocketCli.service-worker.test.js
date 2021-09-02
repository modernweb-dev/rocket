import chai from 'chai';
import chalk from 'chalk';
import { executeBuild, readStartOutput, setFixtureDir } from '@rocket/cli/test-helpers';

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

  it.only('will add a script to inject the service worker', async () => {
    cli = await executeBuild('e2e-fixtures/service-worker/rocket.config.js');
    const indexHtml = await readStartOutput(cli, 'index.html');
    const indexInject = getInjectServiceWorker(indexHtml);
    expect(indexInject).to.equal(
      '<script type="module" inject-service-worker="" src="/_merged_assets/scripts/registerServiceWorker.js"></script>',
    );
    expect(getServiceWorkerUrl(indexHtml)).to.equal('/service-worker.js');
    const subHtml = await readStartOutput(cli, 'sub/index.html');
    const subInject = getInjectServiceWorker(subHtml);
    expect(subInject).to.equal(
      '<script type="module" inject-service-worker="" src="/_merged_assets/scripts/registerServiceWorker.js"></script>',
    );
    expect(getServiceWorkerUrl(subHtml)).to.equal('/service-worker.js');
  });

  // TODO: find a way to run these test either by forcing pathPrefix in start or skipping asset gathering for build or ...
  it.skip('will add a script to inject the service worker', async () => {
    cli = await executeBuild('e2e-fixtures/service-worker/pathPrefix.rocket.config.js');
    const indexHtml = await readStartOutput(cli, 'index.html');
    const indexInject = getInjectServiceWorker(indexHtml);
    expect(indexInject).to.equal(
      '<script type="module" inject-service-worker="" src="/my-prefix-folder/_merged_assets/scripts/registerServiceWorker.js"></script>',
    );
    expect(getServiceWorkerUrl(indexHtml)).to.equal('/my-prefix-folder/service-worker.js');
    const subHtml = await readStartOutput(cli, 'sub/index.html');
    const subInject = getInjectServiceWorker(subHtml);
    expect(subInject).to.equal(
      '<script type="module" inject-service-worker="" src="/my-prefix-folder/_merged_assets/scripts/registerServiceWorker.js"></script>',
    );
    expect(getServiceWorkerUrl(subHtml)).to.equal('/my-prefix-folder/service-worker.js');
  });
});
