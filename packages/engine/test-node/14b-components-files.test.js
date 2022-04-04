import chai from 'chai';
import { setupTestEngine } from './test-helpers.js';

const { expect } = chai;

describe('Components', () => {
  it('01: registers components server side by default', async () => {
    const { build, readOutput, readSource, outputExists } = await setupTestEngine(
      'fixtures/14-components/01-load-server-side/docs',
    );
    await build();

    expect(readSource('index.rocket.js')).to.equal(
      [
        '/* START - Rocket auto generated - do not touch */',
        "export const sourceRelativeFilePath = 'index.rocket.js';",
        "import { html, components } from './recursive.data.js';",
        'export { html, components };',
        'export async function registerCustomElements() {',
        '  // server-only components',
        "  customElements.define('my-el', await import('@test/components').then(m => m.MyEl));",
        '}',
        '/* END - Rocket auto generated - do not touch */',
        '',
        'export default () => html`<my-el></my-el>`;',
      ].join('\n'),
    );

    expect(readOutput('index.html')).to.equal(
      [
        //
        '<my-el',
        '  ><template shadowroot="open"><p>Hello World</p></template></my-el',
        '>',
      ].join('\n'),
    );

    expect(outputExists('index-loader-generated.js')).to.be.false;
  });

  it('02: registers components to hydrate on server side', async () => {
    const { build, readOutput, readSource } = await setupTestEngine(
      'fixtures/14-components/02-register-hydrate/docs',
    );
    await build();

    expect(readSource('index.rocket.js')).to.equal(
      [
        '/* START - Rocket auto generated - do not touch */',
        "export const sourceRelativeFilePath = 'index.rocket.js';",
        "import { html, components } from './recursive.data.js';",
        'export { html, components };',
        'export async function registerCustomElements() {',
        '  // hydrate-able components',
        "  customElements.define('my-el', await import('@test/components').then(m => m.MyEl));",
        '}',
        '/* END - Rocket auto generated - do not touch */',
        '',
        'export default () => html`<my-el loading="hydrate"></my-el>`;',
      ].join('\n'),
    );

    expect(readOutput('index.html')).to.equal(
      [
        //
        '<my-el loading="hydrate"',
        '  ><template shadowroot="open"><p>Hello World</p></template></my-el',
        '>',
        '<script type="module" src="index-loader-generated.js"></script>',
      ].join('\n'),
    );

    expect(readOutput('index-loader-generated.js')).to.equal(
      [
        "import { HydrationLoader } from '@rocket/engine/hydration';",
        '',
        'const hydrateAbleComponents = {',
        "  'my-el': () => import('@test/components').then(m => m.MyEl),",
        '};',
        '',
        'const loader = new HydrationLoader(hydrateAbleComponents);',
        '',
        'window.__ROCKET_HYDRATION_LOADER__ = loader;',
        'await loader.init();',
      ].join('\n'),
    );
  });

  it('03: registers client rendering component', async () => {
    const { build, readOutput, readSource } = await setupTestEngine(
      'fixtures/14-components/03-register-client/docs',
    );
    await build();

    expect(readSource('index.rocket.js')).to.equal(
      [
        '/* START - Rocket auto generated - do not touch */',
        "export const sourceRelativeFilePath = 'index.rocket.js';",
        "import { html, components } from './recursive.data.js';",
        'export { html, components };',
        'export async function registerCustomElements() {',
        '  // client-only components',
        "  // 'my-el2': () => import('@test/components').then(m => m.MyEl2),",
        '}',
        '/* END - Rocket auto generated - do not touch */',
        '',
        'export default () => html`<my-el2 loading="client"></my-el2>`;',
      ].join('\n'),
    );

    expect(readOutput('index.html')).to.equal(
      [
        //
        '<my-el2 loading="client"></my-el2>',
        '<script type="module" src="index-loader-generated.js"></script>',
      ].join('\n'),
    );

    expect(readOutput('index-loader-generated.js')).to.equal(
      [
        "import { HydrationLoader } from '@rocket/engine/hydration';",
        '',
        'const hydrateAbleComponents = {};',
        '',
        'const loader = new HydrationLoader(hydrateAbleComponents);',
        '// client-only components',
        'await loader.setup();',
        "customElements.define('my-el2', await import('@test/components').then(m => m.MyEl2));",
        '',
        'window.__ROCKET_HYDRATION_LOADER__ = loader;',
        'await loader.init();',
      ].join('\n'),
    );
  });

  it('04: handles client and hydration at the same time', async () => {
    const { build, readOutput } = await setupTestEngine(
      'fixtures/14-components/04-hydration-and-client/docs',
    );
    await build();

    expect(readOutput('index-loader-generated.js')).to.equal(
      [
        "import { HydrationLoader } from '@rocket/engine/hydration';",
        '',
        'const hydrateAbleComponents = {',
        "  'my-el4': () => import('@test/components/MyEl4').then(m => m.MyEl4),",
        '};',
        '',
        'const loader = new HydrationLoader(hydrateAbleComponents);',
        '// client-only components',
        'await loader.setup();',
        "customElements.define('my-only', await import('@test/components/MyOnly').then(m => m.MyOnly));",
        '',
        'window.__ROCKET_HYDRATION_LOADER__ = loader;',
        'await loader.init();',
      ].join('\n'),
    );
  });

  it('05: handles define import error', async () => {
    const { build, readOutput, writeSource, readSource } = await setupTestEngine(
      'fixtures/14-components/05-handles-define-import-error/docs',
    );
    await writeSource(
      'index.rocket.js',
      [
        '/* START - Rocket auto generated - do not touch */',
        "export const sourceRelativeFilePath = 'index.rocket.md';",
        "import { html, components } from './recursive.data.js';",
        'export { html, components };',
        '// server-only components',
        "customElements.define('my-el', await import('../src/MyEl.js').then(m => m.MyEl));",
        '/* END - Rocket auto generated - do not touch */',
        '',
        'export default () => html`<my-el></my-el>`;',
      ].join('\n'),
    );

    try {
      await build();
    } catch (err) {
      expect(err.message).to.contain("Cannot find package 'wrong-pkg'");
    }

    expect(readOutput('index.html')).to.contain("Cannot find package 'wrong-pkg'");
    expect(readSource('index.rocket.js')).to.equal(
      [
        '/* START - Rocket auto generated - do not touch */',
        "export const sourceRelativeFilePath = 'index.rocket.js';",
        "import { html, components } from './recursive.data.js';",
        'export { html, components };',
        'export async function registerCustomElements() {',
        '  // server-only components',
        "  customElements.define('my-el', await import('wrong-pkg').then(m => m.WrongClass));",
        '}',
        '/* END - Rocket auto generated - do not touch */',
        '',
        'export default () => html`<my-el></my-el>`;',
      ].join('\n'),
    );
  });

  it('06: handles define import error in md', async () => {
    const { build, readOutput, writeSource, readSource } = await setupTestEngine(
      'fixtures/14-components/06-handles-define-import-error-md/docs',
    );
    await writeSource(
      'index.rocket.md',
      [
        '```js server',
        '/* START - Rocket auto generated - do not touch */',
        "export const sourceRelativeFilePath = 'index.rocket.md';",
        "import { html, components } from './recursive.data.js';",
        'export { html, components };',
        '// server-only components',
        "customElements.define('my-el', await import('../src/MyEl.js').then(m => m.MyEl));",
        '/* END - Rocket auto generated - do not touch */',
        '```',
        '',
        '<my-el></my-el>',
      ].join('\n'),
    );

    try {
      await build();
    } catch (err) {
      expect(err.message).to.contain("Cannot find package 'wrong-pkg'");
    }

    expect(readOutput('index.html')).to.contain("Cannot find package 'wrong-pkg'");

    expect(readSource('index.rocket.md')).to.equal(
      [
        '```js server',
        '/* START - Rocket auto generated - do not touch */',
        "export const sourceRelativeFilePath = 'index.rocket.md';",
        "import { html, components } from './recursive.data.js';",
        'export { html, components };',
        'export async function registerCustomElements() {',
        '  // server-only components',
        "  customElements.define('my-el', await import('wrong-pkg').then(m => m.WrongClass));",
        '}',
        '/* END - Rocket auto generated - do not touch */',
        '```',
        '',
        '<my-el></my-el>',
      ].join('\n'),
    );
  });

  it('07: removes unused elements from registration header', async () => {
    const { build, readOutput, readSource, writeSource } = await setupTestEngine(
      'fixtures/14-components/07-removes-registrations/docs',
    );

    await writeSource(
      'index.rocket.js',
      [
        '/* START - Rocket auto generated - do not touch */',
        "export const sourceRelativeFilePath = 'index.rocket.js';",
        "import { html, components } from './recursive.data.js';",
        'export { html, components };',
        'export async function registerCustomElements() {',
        '  // server-only components',
        "  customElements.define('my-el', await import('@test/components').then(m => m.MyEl));",
        '}',
        '/* END - Rocket auto generated - do not touch */',
        '',
        'export default () => html`<p>Hey</p>`;',
      ].join('\n'),
    );

    await build();

    expect(readSource('index.rocket.js')).to.equal(
      [
        '/* START - Rocket auto generated - do not touch */',
        "export const sourceRelativeFilePath = 'index.rocket.js';",
        "import { html, components } from './recursive.data.js';",
        'export { html, components };',
        '/* END - Rocket auto generated - do not touch */',
        '',
        'export default () => html`<p>Hey</p>`;',
      ].join('\n'),
    );
    expect(readOutput('index.html')).to.equal('<p>Hey</p>');
  });

  it('08: do not inject the component loader into open graph layouts', async () => {
    const { build, readOutput, readSource, outputExists } = await setupTestEngine(
      'fixtures/14-components/08-open-graph-no-loader-injection/docs',
    );
    await build();

    expect(readSource('index.rocket.js')).to.equal(
      [
        '/* START - Rocket auto generated - do not touch */',
        "export const sourceRelativeFilePath = 'index.rocket.js';",
        "import { html, components, openGraphServerComponents, openGraphLayout } from './recursive.data.js';",
        'export { html, components, openGraphServerComponents, openGraphLayout };',
        'export async function registerCustomElements() {',
        '  // hydrate-able components',
        "  customElements.define('my-el', await import('@test/components').then(m => m.MyEl));",
        '}',
        '/* END - Rocket auto generated - do not touch */',
        '',
        'export default () => html`<my-el loading="hydrate:onClick"></my-el>`;',
      ].join('\n'),
    );

    expect(readOutput('index.html')).to.equal(
      [
        '<my-el loading="hydrate:onClick"',
        '  ><template shadowroot="open"><p>Hello World</p></template></my-el',
        '>',
        '<script type="module" src="index-loader-generated.js"></script>',
      ].join('\n'),
    );
    expect(readOutput('index.opengraph.html')).to.equal(
      [
        '<!DOCTYPE html>',
        '<html lang="en">',
        '  <head>',
        '    <meta charset="utf-8" />',
        '  </head>',
        '  <body>',
        '    <my-el',
        '      ><template shadowroot="open"><p>Hello World</p></template></my-el',
        '    >',
        '  </body>',
        '</html>',
      ].join('\n'),
    );

    expect(outputExists('index-loader-generated.js')).to.be.true;
  });

  it('09: the open graph layout can bring additional server side components', async () => {
    const { build, readOutput, readSource } = await setupTestEngine(
      'fixtures/14-components/09-open-graph-additional-server-components/docs',
    );
    await build();

    expect(readSource('index.rocket.js')).to.equal(
      [
        '/* START - Rocket auto generated - do not touch */',
        "export const sourceRelativeFilePath = 'index.rocket.js';",
        "import { html, components, openGraphLayout } from './recursive.data.js';",
        'export { html, components, openGraphLayout };',
        'export async function registerCustomElements() {',
        '  // server-only components',
        "  customElements.define('my-el', await import('@test/components').then(m => m.MyEl));",
        '  // server-only open-graph only components',
        "  customElements.define('other-el', await import('@test/components').then(m => m.OtherEl));",
        '}',
        '/* END - Rocket auto generated - do not touch */',
        '',
        'export default () => html`<my-el></my-el>`;',
      ].join('\n'),
    );

    expect(readOutput('index.html')).to.equal(
      ['<my-el', '  ><template shadowroot="open"><p>Hello World</p></template></my-el', '>'].join(
        '\n',
      ),
    );

    expect(readOutput('index.opengraph.html')).to.equal(
      [
        '<!DOCTYPE html>',
        '<html lang="en">',
        '  <head>',
        '    <meta charset="utf-8" />',
        '  </head>',
        '  <body>',
        '    <other-el',
        '      ><template shadowroot="open"><p>Other Hello World</p></template></other-el',
        '    >',
        '    <next-el loading="hydrate:onClick"></next-el>',
        '  </body>',
        '</html>',
      ].join('\n'),
    );
  });

  it('10: during start it injects/removes the loader script as hydration/client components are added/removed', async () => {
    const { writeSource, cleanup, engine, anEngineEvent, readOutput, adjustSource } =
      await setupTestEngine('fixtures/14-components/10-start-inject-remove-loader/docs');
    await writeSource('index.rocket.js', 'export default () => html`<p>init</p>`;');

    await engine.start();

    // add client component => need loader script
    await adjustSource('index.rocket.js', /<p>init<\/p>/, '<my-el loading="client"></my-el>');
    await anEngineEvent('rocketUpdated');
    expect(readOutput('index.html')).to.equal(
      [
        '<my-el loading="client"></my-el>',
        '<script type="module" src="index-loader-generated.js"></script>',
      ].join('\n'),
    );

    // remove client component => remove loader script
    await adjustSource('index.rocket.js', / loading="client"/, '');
    await anEngineEvent('rocketUpdated');
    expect(readOutput('index.html')).to.equal(
      ['<my-el', '  ><template shadowroot="open"><p>Hello World</p></template></my-el', '>'].join(
        '\n',
      ),
    );

    await cleanup();
  });

  it('11: during start it corrects a wrong rocket header', async () => {
    const { writeSource, cleanup, engine, anEngineEvent, readOutput, adjustSource } =
      await setupTestEngine('fixtures/14-components/11-start-correct-wrong-header/docs');
    await writeSource(
      'index.rocket.js',
      [
        '/* START - Rocket auto generated - do not touch */',
        "export const sourceRelativeFilePath = 'index.rocket.js';",
        "import { html, components } from './recursive.data.js';",
        'export { html, components };',
        'export async function registerCustomElements() {',
        '  // server-only components',
        "  customElements.define('my-el', await import('#components').then(m => m.MyEl));",
        '}',
        '/* END - Rocket auto generated - do not touch */',
        '',
        'export default () => html`<my-el></my-el>`;',
      ].join('\n'),
    );

    await engine.start();

    await adjustSource('index.rocket.js', /<my-el><\/my-el>/, '<my-el></my-el> ');
    await anEngineEvent('rocketUpdated');
    expect(readOutput('index.html')).to.equal(
      ['<my-el', '  ><template shadowroot="open"><p>Hello World</p></template></my-el', '>'].join(
        '\n',
      ),
    );

    await cleanup();
  });

  it('12: during build it corrects a wrong rocket header', async () => {
    const { build, writeSource, readSource } = await setupTestEngine(
      'fixtures/14-components/12-build-correct-wrong-header/docs',
    );
    await writeSource(
      'index.rocket.js',
      [
        '/* START - Rocket auto generated - do not touch */',
        "export const sourceRelativeFilePath = 'index.rocket.js';",
        "import { html, components } from './recursive.data.js';",
        'export { html, components };',
        'export async function registerCustomElements() {',
        '  // server-only components',
        "  customElements.define('my-el', await import('#components').then(m => m.MyEl));",
        '}',
        '/* END - Rocket auto generated - do not touch */',
        '',
        'export default () => html`<my-el></my-el>`;',
      ].join('\n'),
    );
    await build();

    expect(readSource('index.rocket.js')).to.equal(
      [
        '/* START - Rocket auto generated - do not touch */',
        "export const sourceRelativeFilePath = 'index.rocket.js';",
        "import { html, components } from './recursive.data.js';",
        'export { html, components };',
        'export async function registerCustomElements() {',
        '  // server-only components',
        "  customElements.define('my-el', await import('@test/components').then(m => m.MyEl));",
        '}',
        '/* END - Rocket auto generated - do not touch */',
        '',
        'export default () => html`<my-el></my-el>`;',
      ].join('\n'),
    );
  });
});
