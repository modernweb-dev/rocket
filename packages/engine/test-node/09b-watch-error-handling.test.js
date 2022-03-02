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
      "import { html } from 'lit';\nexport default () => html`index`;",
    );

    await engine.start();
    setAsOpenedInBrowser('index.rocket.js');
    await writeSource(
      'index.rocket.js',
      "import { html } from 'lit';\nexport default () => html`index ${name}`;",
    );
    await anEngineEvent('rocketUpdated');
    expect(readOutput('index.html')).to.include('ReferenceError: name is not defined');

    await writeSource(
      'index.rocket.js',
      [
        "import { html } from 'lit';",
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
      "import { html } from 'lit';\nexport default () => html`index`;",
    );

    await engine.start();
    await writeSource(
      'index.rocket.js',
      "import { html } from from 'lit';\nexport default () => html`index`;",
      { format: false },
    );
    await anEngineEvent('rocketUpdated');
    expect(readOutput('index.html')).to.include('Unexpected identifier');

    await writeSource(
      'index.rocket.js',
      ["import { html } from 'lit';", 'export default () => html`index`;'].join('\n'),
    );
    await anEngineEvent('rocketUpdated');

    expect(readOutput('index.html')).to.equal('index');
    await cleanup();
  });

  it('03: error in markdown', async () => {
    const { readOutput, writeSource, anEngineEvent, cleanup, engine } = await setupTestEngine(
      'fixtures/09b-watch-error-handling/03-markdown/docs',
    );
    await writeSource(
      'index.rocket.md',
      [
        //
        '```js server',
        "export const foo = 'bar';",
        '```',
        '# Title',
      ].join('\n'),
    );

    await engine.start();
    await writeSource(
      'index.rocket.md',
      [
        //
        '```js server',
        "export const const foo = 'bar';",
        '```',
        '# Title',
      ].join('\n'),
      { format: false },
    );
    await anEngineEvent('rocketUpdated');
    expect(readOutput('index.html')).to.include("Unexpected token 'const'");

    await writeSource(
      'index.rocket.md',
      [
        //
        '```js server',
        "export const foo = 'bar';",
        '```',
        '# Title',
      ].join('\n'),
    );
    await anEngineEvent('rocketUpdated');

    expect(readOutput('index.html')).to.equal(
      [
        '<h1 id="title">',
        '  <a aria-hidden="true" tabindex="-1" href="#title"><span class="icon icon-link"></span></a>Title',
        '</h1>',
      ].join('\n'),
    );
    await cleanup();
  });
});
