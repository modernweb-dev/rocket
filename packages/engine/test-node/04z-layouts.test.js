import chai from 'chai';
import { expectThrowsAsync, setupTestEngine } from './test-helpers.js';

const { expect } = chai;

describe('Layouts', () => {
  it('01-function', async () => {
    const { build, readOutput } = await setupTestEngine('fixtures/04-layouts/01-function/docs');
    await build();

    let outcome = [
      '<!DOCTYPE html>',
      '<html>',
      '  <head>',
      '    <title>Fixed Title | Rocket</title>',
      '  </head>',
      '  <body>',
      '    <h1 id="welcome-members">',
      '      <a aria-hidden="true" tabindex="-1" href="#welcome-members"',
      '        ><span class="icon icon-link"></span></a',
      '      >Welcome Members:',
      '    </h1>',
      '    <ul>',
      '      <li>',
      '        <p>Superman</p>',
      '      </li>',
      '      <li>',
      '        <p>Deadpool</p>',
      '      </li>',
      '    </ul>',
      '    <p>Generated on 2022-03-03 13:20</p>',
      '  </body>',
      '</html>',
    ].join('\n');

    expect(readOutput('index.html')).to.equal(outcome);

    expect(readOutput('markdown/index.html')).to.equal(outcome);
  });

  it.skip('permalink-invalid-filename', async () => {
    await expectThrowsAsync(
      () => {
        const { build } = setupTestEngine('fixtures/permalink-invalid-filename/docs');
        return build();
      },
      {
        errorMatch: /File at ".*" is using invalid characters. Use only url safe characters like \[a-z\]\[A-Z\]-_/,
      },
    );
  });

  it('02-Class', async () => {
    const { build, readOutput } = await setupTestEngine('fixtures/04-layouts/02-class/docs');
    await build();

    expect(readOutput('index.html')).to.equal(
      [
        '<!DOCTYPE html>',
        '<html lang="en-US">',
        '  <head> </head>',
        '  <body class="  " layout="layout">',
        '    <header id="main-header">',
        '      <div class="content-area"></div>',
        '    </header>',
        '    <div class="content-area">',
        '      <main><p>Hey there</p></main>',
        '    </div>',
        '    <footer id="main-footer">',
        '      <div class="content-area"></div>',
        '    </footer>',
        '  </body>',
        '</html>',
      ].join('\n'),
    );

    expect(readOutput('layout-raw/index.html')).to.equal('<p>Hey there</p>');

    expect(readOutput('adding-before/index.html')).to.equal(
      [
        '<!DOCTYPE html>',
        '<html lang="de-DE">',
        '  <head> </head>',
        '  <body class="  " layout="layout">',
        '    <header id="main-header">',
        '      <div class="content-area"></div>',
        '    </header>',
        '    <div class="content-area">',
        '      <main>',
        '        <p>content__10</p>',
        '        <p>Hey there</p>',
        '      </main>',
        '    </div>',
        '    <footer id="main-footer">',
        '      <div class="content-area"></div>',
        '    </footer>',
        '  </body>',
        '</html>',
      ].join('\n'),
    );

    expect(readOutput('show-data/index.html')).to.equal(
      [
        '<!DOCTYPE html>',
        '<html lang="en-US">',
        '  <head> </head>',
        '  <body class="  " layout="layout">',
        '    <header id="main-header">',
        '      <div class="content-area"></div>',
        '    </header>',
        '    <div class="content-area">',
        '      <main>',
        '        <p>content__10 🎉</p>',
        '        <p>Hey there</p>',
        '      </main>',
        '    </div>',
        '    <footer id="main-footer">',
        '      <div class="content-area"></div>',
        '    </footer>',
        '  </body>',
        '</html>',
      ].join('\n'),
    );
  });

  it('03-dynamic-title', async () => {
    const { build, readOutput } = await setupTestEngine(
      'fixtures/04-layouts/03-dynamic-title/docs',
    );
    await build();

    expect(readOutput('index.html', { format: 'html', cleanupLitMarkers: false })).to.equal(
      [
        '<html>',
        '  <head>',
        '    <title>My title</title>',
        '  </head>',
        '  <body>',
        '    <h1><!--lit-part-->Home<!--/lit-part--></h1>',
        '  </body>',
        '</html>',
      ].join('\n'),
    );
  });
});
