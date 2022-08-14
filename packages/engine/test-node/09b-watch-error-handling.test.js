import chai from 'chai';
import { setupTestEngine } from './test-helpers.js';

const { expect } = chai;

describe('Engine start error handling', () => {
  it('01: name is not defined', async () => {
    const { readOutput, writeSource, anEngineEvent, cleanup, engine, setAsOpenedInBrowser } =
      await setupTestEngine('fixtures/09b-watch-error-handling/01-name-is-not-defined/docs');
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

  it('04: update-header-while-rendering', async () => {
    const { readOutput, writeSource, cleanup, engine, setAsOpenedInBrowser, outputExists } =
      await setupTestEngine(
        'fixtures/09b-watch-error-handling/04-update-header-while-rendering/docs',
      );
    await writeSource(
      'index.rocket.js',
      [
        '/* START - Rocket auto generated - do not touch */',
        "export const sourceRelativeFilePath = 'index.rocket.js';",
        "import { html, components, layout } from './recursive.data.js';",
        'export { html, components, layout };',
        'export async function registerCustomElements() {',
        '  // hydrate-able components',
        "  customElements.define('hello-typer', await import('#c/HelloTyper.js').then(m => m.HelloTyper));",
        '}',
        'export const needsLoader = true;',
        '/* END - Rocket auto generated - do not touch */',
        '',
        'export default () => html`',
        '  <h1>Hello World</h1>',
        '  <hello-typer loading="hydrate:onVisible"></hello-typer>',
        '`;',
      ].join('\n'),
    );

    await engine.start();
    setAsOpenedInBrowser('index.rocket.js');

    const { port } = engine.devServer.config;
    expect(outputExists('index.html')).to.be.false;
    await fetch(`http://localhost:${port}/`);

    expect(readOutput('index.html')).to.equal(
      [
        '<!DOCTYPE html>',
        '<html lang="en">',
        '  <head>',
        '    <meta charset="utf-8" />',
        '  </head>',
        '  <body>',
        '    <h1>Hello World</h1>',
        '    <hello-typer loading="hydrate:onVisible"',
        '      ><template shadowroot="open"',
        '        ><style>',
        '          button {',
        '            font-size: 200%;',
        '            width: 64px;',
        '            height: 64px;',
        '            border: none;',
        '            border-radius: 10px;',
        '            background-color: seagreen;',
        '            color: white;',
        '          }',
        '        </style>',
        '        <p>🤔 Hello <span> </span></p>',
        '        <button>+</button>',
        '      </template></hello-typer',
        '    >',
        '    <script type="module" src="index-loader-generated.js"></script>',
        '  </body>',
        '</html>',
      ].join('\n'),
    );

    await cleanup();
  });
});
