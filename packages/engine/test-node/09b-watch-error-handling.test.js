import chai from 'chai';
import { setupTestEngine } from './test-helpers.js';

const { expect } = chai;

describe('Engine start error handling', () => {
  it('01: name is not defined', async () => {
    const {
      readOutput,
      writeSource,
      anEngineEvent,
      cleanup,
      engine,
      setAsOpenedInBrowser,
    } = await setupTestEngine('fixtures/09b-watch-error-handling/01-name-is-not-defined/docs');
    await writeSource(
      'index.rocket.js',
      "import { html } from 'lit-html';\nexport default () => html`index`;",
    );

    await engine.start();
    setAsOpenedInBrowser('index.rocket.js');
    await writeSource(
      'index.rocket.js',
      "import { html } from 'lit-html';\nexport default () => html`index ${name}`;",
    );
    await anEngineEvent('rocketUpdated');
    expect(readOutput('index.html')).to.include('ReferenceError: name is not defined');

    await writeSource(
      'index.rocket.js',
      [
        "import { html } from 'lit-html';",
        "const name = 'Home';",
        'export default () => html`index ${name}`;',
      ].join('\n'),
    );
    await anEngineEvent('rocketUpdated');

    expect(readOutput('index.html')).to.equal('index Home');
    await cleanup();
  });

  it('02: import error', async () => {
    const { readOutput, writeSource, anEngineEvent, cleanup, engine } = await setupTestEngine(
      'fixtures/09b-watch-error-handling/02-import/docs',
    );
    await writeSource(
      'index.rocket.js',
      "import { html } from 'lit-html';\nexport default () => html`index`;",
    );

    await engine.start();
    await writeSource(
      'index.rocket.js',
      "import { html } from from 'lit-html';\nexport default () => html`index`;",
      { format: false },
    );
    await anEngineEvent('rocketUpdated');
    expect(readOutput('index.html')).to.include('Unexpected identifier');

    await writeSource(
      'index.rocket.js',
      ["import { html } from 'lit-html';", 'export default () => html`index`;'].join('\n'),
    );
    await anEngineEvent('rocketUpdated');

    expect(readOutput('index.html')).to.equal('index');
    await cleanup();
  });
});
