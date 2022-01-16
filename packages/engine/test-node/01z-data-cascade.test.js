import chai from 'chai';
import { setupTestEngine } from './test-helpers.js';

const { expect } = chai;

describe('Engine Data Cascade', () => {
  it('injects a header into the source file', async () => {
    const { build, readSource, writeSource, readOutput } = await setupTestEngine(
      'fixtures/01-data-cascade/01-basics/docs',
    );
    await writeSource(
      'empty.rocket.js',
      [
        "import { html } from 'lit-html';",
        'export default () => html`empty.rocket.js sourceRelativeFilePath: "${sourceRelativeFilePath}"`;',
      ].join('\n'),
    );
    await build();

    expect(readSource('empty.rocket.js')).to.equal(
      [
        '/* START - Rocket auto generated - do not touch */',
        "export const sourceRelativeFilePath = 'empty.rocket.js';",
        '/* END - Rocket auto generated - do not touch */',
        '',
        "import { html } from 'lit-html';",
        'export default () => html`empty.rocket.js sourceRelativeFilePath: "${sourceRelativeFilePath}"`;',
      ].join('\n'),
    );
    expect(readOutput('empty/index.html')).to.equal(
      'empty.rocket.js sourceRelativeFilePath: "empty.rocket.js"',
    );

    expect(readOutput('index.html')).to.equal(
      'index.rocket.js sourceRelativeFilePath: "index.rocket.js"',
    );

    expect(readOutput('sub-dir/index.html')).to.equal(
      'sub-dir/index.rocket.js sourceRelativeFilePath: "sub-dir/index.rocket.js"',
    );
  });

  it('02: injects data from `local.data.js`', async () => {
    const { build, readSource, writeSource } = await setupTestEngine(
      'fixtures/01-data-cascade/02-local/docs',
    );
    await writeSource(
      'index.rocket.js',
      "import { html } from 'lit-html';\nexport default () => html`index`;",
    );
    await writeSource(
      'about.rocket.js',
      "import { html } from 'lit-html';\nexport default () => html`about`;",
    );
    await writeSource(
      'components/accordion.rocket.js',
      "import { html } from 'lit-html';\nexport default () => html`accordion`;",
    );
    await writeSource(
      'components/tabs.rocket.js',
      "import { html } from 'lit-html';\nexport default () => html`tabs`;",
    );
    await build();

    expect(readSource('index.rocket.js')).to.equal(
      [
        `/* START - Rocket auto generated - do not touch */`,
        "export const sourceRelativeFilePath = 'index.rocket.js';",
        "import { onRootLevel } from './local.data.js';",
        'export { onRootLevel };',
        `/* END - Rocket auto generated - do not touch */`,
        '',
        "import { html } from 'lit-html';",
        'export default () => html`index`;',
      ].join('\n'),
    );

    expect(readSource('about.rocket.js')).to.equal(
      [
        '/* START - Rocket auto generated - do not touch */',
        "export const sourceRelativeFilePath = 'about.rocket.js';",
        "import { onRootLevel } from './local.data.js';",
        'export { onRootLevel };',
        '/* END - Rocket auto generated - do not touch */',
        '',
        "import { html } from 'lit-html';",
        'export default () => html`about`;',
      ].join('\n'),
    );

    expect(readSource('components/accordion.rocket.js')).to.equal(
      [
        '/* START - Rocket auto generated - do not touch */',
        "export const sourceRelativeFilePath = 'components/accordion.rocket.js';",
        "import { inComponents } from './local.data.js';",
        'export { inComponents };',
        '/* END - Rocket auto generated - do not touch */',
        '',
        "import { html } from 'lit-html';",
        'export default () => html`accordion`;',
      ].join('\n'),
    );

    expect(readSource('components/tabs.rocket.js')).to.equal(
      [
        '/* START - Rocket auto generated - do not touch */',
        "export const sourceRelativeFilePath = 'components/tabs.rocket.js';",
        "import { inComponents } from './local.data.js';",
        'export { inComponents };',
        '/* END - Rocket auto generated - do not touch */',
        '',
        "import { html } from 'lit-html';",
        'export default () => html`tabs`;',
      ].join('\n'),
    );
  });

  it('03: injects multiple exports from `local.data.js`', async () => {
    const { build, readSource, writeSource } = await setupTestEngine(
      'fixtures/01-data-cascade/03-local-multiple-exports/docs',
    );
    await writeSource(
      'index.rocket.js',
      "import { html } from 'lit-html';\nexport default () => html`index`;",
    );
    await build();

    expect(readSource('index.rocket.js')).to.equal(
      [
        `/* START - Rocket auto generated - do not touch */`,
        "export const sourceRelativeFilePath = 'index.rocket.js';",
        "import { foo, bar } from './local.data.js';",
        'export { foo, bar };',
        `/* END - Rocket auto generated - do not touch */`,
        '',
        "import { html } from 'lit-html';",
        'export default () => html`index`;',
      ].join('\n'),
    );
  });

  it('04: imports as "[name]asOriginal" if export exists`', async () => {
    const { build, readSource, writeSource } = await setupTestEngine(
      'fixtures/01-data-cascade/04-import-as-original/docs',
    );
    await writeSource(
      'index.rocket.js',
      [
        "export const options = { ...originalOptions, b: 'bValue' };",
        '',
        "import { html } from 'lit-html';",
        'export default () => html`${JSON.stringify(options, null, 2)}`;',
      ].join('\n'),
    );
    await build();

    expect(readSource('index.rocket.js')).to.equal(
      [
        `/* START - Rocket auto generated - do not touch */`,
        "export const sourceRelativeFilePath = 'index.rocket.js';",
        "import { options as originalOptions } from './local.data.js';",
        `/* END - Rocket auto generated - do not touch */`,
        '',
        "export const options = { ...originalOptions, b: 'bValue' };",
        '',
        "import { html } from 'lit-html';",
        'export default () => html`${JSON.stringify(options, null, 2)}`;',
      ].join('\n'),
    );
  });

  it('05: injects data from `recursive.data.js`', async () => {
    const { build, readSource, writeSource } = await setupTestEngine(
      'fixtures/01-data-cascade/05-recursive/docs',
    );
    await writeSource(
      'index.rocket.js',
      "import { html } from 'lit-html';\nexport default () => html`index`;",
    );
    await writeSource(
      'about.rocket.js',
      "import { html } from 'lit-html';\nexport default () => html`about`;",
    );
    await writeSource(
      'components/index.rocket.js',
      "import { html } from 'lit-html';\nexport default () => html`components/index`;",
    );
    await build();

    expect(readSource('index.rocket.js')).to.equal(
      [
        `/* START - Rocket auto generated - do not touch */`,
        "export const sourceRelativeFilePath = 'index.rocket.js';",
        "import { fromRoot } from './recursive.data.js';",
        'export { fromRoot };',
        `/* END - Rocket auto generated - do not touch */`,
        '',
        "import { html } from 'lit-html';",
        'export default () => html`index`;',
      ].join('\n'),
    );

    expect(readSource('about.rocket.js')).to.equal(
      [
        '/* START - Rocket auto generated - do not touch */',
        "export const sourceRelativeFilePath = 'about.rocket.js';",
        "import { fromRoot } from './recursive.data.js';",
        'export { fromRoot };',
        '/* END - Rocket auto generated - do not touch */',
        '',
        "import { html } from 'lit-html';",
        'export default () => html`about`;',
      ].join('\n'),
    );

    expect(readSource('components/index.rocket.js')).to.equal(
      [
        '/* START - Rocket auto generated - do not touch */',
        "export const sourceRelativeFilePath = 'components/index.rocket.js';",
        "import { fromRoot } from '../recursive.data.js';",
        'export { fromRoot };',
        '/* END - Rocket auto generated - do not touch */',
        '',
        "import { html } from 'lit-html';",
        'export default () => html`components/index`;',
      ].join('\n'),
    );
  });

  it('`local.data.js` overwrites data from `recursive.data.js`', async () => {
    const { build, readSource, writeSource } = await setupTestEngine(
      'fixtures/01-data-cascade/06-local-overwrite/docs',
    );
    await writeSource(
      'index.rocket.js',
      "import { html } from 'lit-html';\nexport default () => html`index`;",
    );
    await writeSource(
      'components/index.rocket.js',
      "import { html } from 'lit-html';\nexport default () => html`components/index`;",
    );
    await writeSource(
      'components/tabs.rocket.js',
      "import { html } from 'lit-html';\nexport default () => html`components/tabs`;",
    );
    await build();

    expect(readSource('index.rocket.js')).to.equal(
      [
        `/* START - Rocket auto generated - do not touch */`,
        "export const sourceRelativeFilePath = 'index.rocket.js';",
        "import { fromRoot } from './recursive.data.js';",
        'export { fromRoot };',
        `/* END - Rocket auto generated - do not touch */`,
        '',
        "import { html } from 'lit-html';",
        'export default () => html`index`;',
      ].join('\n'),
    );

    expect(readSource('components/index.rocket.js')).to.equal(
      [
        '/* START - Rocket auto generated - do not touch */',
        "export const sourceRelativeFilePath = 'components/index.rocket.js';",
        "import { fromRoot } from './local.data.js';",
        'export { fromRoot };',
        '/* END - Rocket auto generated - do not touch */',
        '',
        "import { html } from 'lit-html';",
        'export default () => html`components/index`;',
      ].join('\n'),
    );

    expect(readSource('components/tabs.rocket.js')).to.equal(
      [
        '/* START - Rocket auto generated - do not touch */',
        "export const sourceRelativeFilePath = 'components/tabs.rocket.js';",
        "import { fromRoot } from './local.data.js';",
        'export { fromRoot };',
        '/* END - Rocket auto generated - do not touch */',
        '',
        "import { html } from 'lit-html';",
        'export default () => html`components/tabs`;',
      ].join('\n'),
    );
  });

  it('injects a header into the markdown source file', async () => {
    const { build, readSource, writeSource } = await setupTestEngine(
      'fixtures/01-data-cascade/07-markdown/docs',
    );
    await writeSource(
      'index.rocket.md',
      '# Slack\n\nYou can also find us on the Polymer Slack in the [#open-wc](https://polymer.slack.com/archives/CE6D9DN05) channel.',
    );
    await build();

    expect(readSource('index.rocket.md')).to.equal(
      [
        '```js server',
        '/* START - Rocket auto generated - do not touch */',
        "export const sourceRelativeFilePath = 'index.rocket.md';",
        '/* END - Rocket auto generated - do not touch */',
        '```',
        '',
        '# Slack',
        '',
        'You can also find us on the Polymer Slack in the [#open-wc](https://polymer.slack.com/archives/CE6D9DN05) channel.',
      ].join('\n'),
    );
  });
});
