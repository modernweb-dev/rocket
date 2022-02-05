import chai from 'chai';
import { htmlToJsTemplate } from '../src/formats/html.js';

const { expect } = chai;

describe('html conversion', async () => {
  it('1: single server block', async () => {
    const source = [
      '<script type="module" server>',
      "export const sourceRelativeFilePath = 'index.rocket.html';",
      '</script>',
      '<h1>${sourceRelativeFilePath}</h1>',
    ].join('\n');
    const expected = [
      "import { html } from 'lit-html';",
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
      "import { html } from 'lit-html';",
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
