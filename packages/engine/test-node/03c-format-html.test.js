import chai from 'chai';
import { setupTestEngine } from './test-helpers.js';
import { htmlToJsTemplate } from '../src/formats/html.js';

const { expect } = chai;

describe('Format Html', async () => {
  describe('Html conversion', async () => {
    it('1: single server block', async () => {
      const source = [
        '<script type="module" server>',
        "export const sourceRelativeFilePath = 'index.rocket.html';",
        '</script>',
        '<h1>${sourceRelativeFilePath}</h1>',
      ].join('\n');
      const expected = [
        "import { html } from 'lit';",
        "export const sourceRelativeFilePath = 'index.rocket.html';",
        'const rocketAutoConvertedTemplate0 = html`<h1>${sourceRelativeFilePath}</h1>`;',
        'export default () => rocketAutoConvertedTemplate0;',
      ].join('\n');
      expect(htmlToJsTemplate(source)).to.deep.equal(expected);
    });

    it('2: iterating over an array', async () => {
      const source = [
        '<script type="module" server>',
        "export const animals = ['Tiger', 'Sheep', 'Cow'];",
        '</script>',
        '<div>',
        '${animals.map(animal => html`',
        '  <p>${animal}</p>',
        '`)}',
        '</div>',
      ].join('\n');
      const expected = [
        "import { html } from 'lit';",
        "export const animals = ['Tiger', 'Sheep', 'Cow'];",
        'const rocketAutoConvertedTemplate0 = html`<div>',
        '${animals.map(animal => html`',
        '  <p>${animal}</p>',
        '\\`)}',
        '</div>`;',
        'export default () => rocketAutoConvertedTemplate0;',
      ].join('\n');
      expect(htmlToJsTemplate(source)).to.deep.equal(expected);
    });
  });

  describe('Pages', async () => {
    it('01: Basic', async () => {
      const { build, readOutput, writeSource, readSource } = await setupTestEngine(
        'fixtures/03c-format-html/01-basic/docs',
      );

      await writeSource('index.rocket.html', '<h1>Hello World</h1>');
      await build();

      expect(readSource('index.rocket.html')).to.equal(
        [
          `<script type="module" server>`,
          `  /* START - Rocket auto generated - do not touch */`,
          `  export const sourceRelativeFilePath = 'index.rocket.html';`,
          `  /* END - Rocket auto generated - do not touch */`,
          `</script>`,
          '<h1>Hello World</h1>',
        ].join('\n'),
      );

      expect(readOutput('index.html')).to.equal(['<h1>Hello World</h1>'].join('\n'));
    });

    it('02: Client JavaScript', async () => {
      const { build, readOutput } = await setupTestEngine(
        'fixtures/03c-format-html/02-client-js/docs',
      );
      await build();

      expect(readOutput('index.html')).to.equal(
        [
          `<h1>Client side JS</h1>`,
          `<script type="module">`,
          `  console.log('test1');`,
          `</script>`,
          `<script type="module" client>`,
          `  console.log('test2');`,
          `</script>`,
          `<p>bar</p>`,
        ].join('\n'),
      );
    });

    it('03: Multiple Server Blocks', async () => {
      const { build, readOutput } = await setupTestEngine(
        'fixtures/03c-format-html/03-multiple-server-blocks/docs',
      );
      await build();

      expect(readOutput('index.html')).to.equal(
        [
          '<h1>Welcome</h1>',
          '<p>index.rocket.md sourceRelativeFilePath: "index.rocket.html"</p>',
          '<p>bar</p>',
          '<p>bar2</p>',
        ].join('\n'),
      );
    });
  });
});
