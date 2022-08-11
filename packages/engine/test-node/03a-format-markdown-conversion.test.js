import chai from 'chai';
import { readFile } from 'fs/promises';
import { mdHtmlToJsTemplate, mdInJsToMdHtmlInJs, mdToMdInJs } from '../src/formats/markdown.js';
import { format } from './test-helpers.js';

const { expect } = chai;

describe('Format Markdown Conversion', async () => {
  it('01: converts *.rocket.md files to js files', async () => {
    expect(
      format(
        mdToMdInJs(
          [
            '```js server',
            "let foo = 'bar';",
            "export const sourceRelativeFilePath = 'index.rocket.md';",
            '```',
            '',
            'index.rocket.md sourceRelativeFilePath: "${sourceRelativeFilePath}"',
            '',
            '${foo}',
            '',
            '```js server',
            "foo = 'baz';",
            '```',
            '',
            '${foo}',
          ].join('\n'),
        ),
        { format: 'js' },
      ),
    ).to.equal(
      format(
        await readFile(
          new URL(
            './fixtures/03b-format-markdown/c01-md-in-js-to-md-html/md-in-js.js',
            import.meta.url,
          ),
        ).then(foo => foo.toString()),
        { format: 'js' },
      ),
    );
  });

  it('02: escapes back slashes in markdown', async () => {
    expect(
      mdToMdInJs(
        [
          //
          '```bash',
          'cp something/something \\',
          '   more/about',
          '```',
          '<my-element foo="bar"></my-element>',
        ].join('\n'),
      ) + '\n',
    ).to.equal(
      [
        'const rocketAutoConvertedMdText = [];',
        'rocketAutoConvertedMdText.push("```bash");',
        'rocketAutoConvertedMdText.push("cp something/something \\\\");',
        'rocketAutoConvertedMdText.push("   more/about");',
        'rocketAutoConvertedMdText.push("```");',
        'rocketAutoConvertedMdText.push("<my-element foo=\\"bar\\"></my-element>");',
        "export default rocketAutoConvertedMdText.join('\\n');",
        '',
      ].join('\n'),
    );
  });

  const md03mdHtml = [
    '<server-code>',
    "let foo = 'bar';",
    "export const sourceRelativeFilePath = 'index.rocket.md';",
    '</server-code>',
    '<p>index.rocket.md sourceRelativeFilePath: "${sourceRelativeFilePath}"</p>',
    '${foo}',
    '<server-code>',
    "foo = 'baz';",
    '</server-code>',
    '${foo}',
  ].join('\n');

  it('30: render markdown to html while wrapping server code and keeping it as is', async () => {
    expect(
      await mdInJsToMdHtmlInJs(
        new URL(
          './fixtures/03b-format-markdown/c01-md-in-js-to-md-html/md-in-js.js',
          import.meta.url,
        ),
      ),
    ).to.equal(md03mdHtml);
  });

  it('60: create the final template to be used for rendering', async () => {
    expect(mdHtmlToJsTemplate(md03mdHtml)).to.equal(
      [
        "import { html } from 'lit';",
        "let foo = 'bar';",
        "export const sourceRelativeFilePath = 'index.rocket.md';",
        'const rocketAutoConvertedTemplate0 = html`<p>index.rocket.md sourceRelativeFilePath: "${sourceRelativeFilePath}"</p>',
        '${foo}`;',
        "foo = 'baz';",
        'const rocketAutoConvertedTemplate1 = html`${foo}`;',
        'export default () => html`${rocketAutoConvertedTemplate0}${rocketAutoConvertedTemplate1}`;',
      ].join('\n'),
    );
  });

  it('61: will return the template directly if there is only one', async () => {
    expect(
      mdHtmlToJsTemplate(
        [
          '<server-code>',
          "export const sourceRelativeFilePath = 'index.rocket.md';",
          '</server-code>',
          '<p>index.rocket.md sourceRelativeFilePath: "${sourceRelativeFilePath}"</p>',
        ].join('\n'),
      ),
    ).to.equal(
      [
        "import { html } from 'lit';",
        "export const sourceRelativeFilePath = 'index.rocket.md';",
        'const rocketAutoConvertedTemplate0 = html`<p>index.rocket.md sourceRelativeFilePath: "${sourceRelativeFilePath}"</p>`;',
        'export default () => rocketAutoConvertedTemplate0;',
      ].join('\n'),
    );
  });
});

// describe.skip('mdToJsWithMd', () => {
//   it('wraps simple text', async () => {
//     expect(mdToJsWithMd('Hello')).to.equal(
//       [
//         `import { md } from '@rocket/engine';`,
//         `let rocketAutoConvertedMdText = '';`,
//         'rocketAutoConvertedMdText += md`Hello`;',
//         `export default rocketAutoConvertedMdText;`,
//       ].join('\n'),
//     );
//   });

//   it('removes the js server code block wrapper', async () => {
//     const result = mdToJsWithMd(
//       [
//         //
//         '```js server',
//         'let a = 1;',
//         '```',
//       ].join('\n'),
//     );
//     expect(result).to.equal(
//       [
//         `import { md } from '@rocket/engine';`,
//         `let rocketAutoConvertedMdText = '';`,
//         'let a = 1;',
//         `export default rocketAutoConvertedMdText;`,
//       ].join('\n'),
//     );
//   });

//   it('removes multiple js server code block wrappers', async () => {
//     const result = mdToJsWithMd(
//       [
//         //
//         '```js server',
//         'let a = 1;',
//         '```',
//         'some text',
//         '   ```js server',
//         '   let b = 1;',
//         '   ```',
//       ].join('\n'),
//     );
//     expect(result).to.equal(
//       [
//         `import { md } from '@rocket/engine';`,
//         `let rocketAutoConvertedMdText = '';`,
//         'let a = 1;',
//         'rocketAutoConvertedMdText += md`some text`;',
//         '   let b = 1;',
//         `export default rocketAutoConvertedMdText;`,
//       ].join('\n'),
//     );
//   });

//   it('removes js server-markdown code block wrappers but keep it as markdown text', async () => {
//     const result = mdToJsWithMd(
//       [
//         //
//         'some text',
//         '```js server-markdown',
//         '${members.map(member => `- ${member}\\n`)}',
//         '```',
//       ].join('\n'),
//     );
//     expect(result).to.equal(
//       [
//         `import { md } from '@rocket/engine';`,
//         `let rocketAutoConvertedMdText = '';`,
//         'rocketAutoConvertedMdText += md`some text`;',
//         'rocketAutoConvertedMdText += md`${members.map(member => `- ${member}\\n`)}`;',
//         `export default rocketAutoConvertedMdText;`,
//       ].join('\n'),
//     );
//   });

//   it('will not remove the js code block wrappers if inside a "bigger" code fence block', async () => {
//     const result = mdToJsWithMd(
//       [
//         //
//         'You can write it like this:',
//         '`````',
//         '```js server',
//         'let a = 1;',
//         '```',
//         '`````',
//       ].join('\n'),
//     );
//     expect(result).to.equal(
//       [
//         `import { md } from '@rocket/engine';`,
//         `let rocketAutoConvertedMdText = '';`,
//         'rocketAutoConvertedMdText += md`You can write it like this:`;',
//         'rocketAutoConvertedMdText += md`\\`\\`\\`\\`\\``;',
//         'rocketAutoConvertedMdText += md`\\`\\`\\`js server`;',
//         'rocketAutoConvertedMdText += md`let a = 1;`;',
//         'rocketAutoConvertedMdText += md`\\`\\`\\``;',
//         'rocketAutoConvertedMdText += md`\\`\\`\\`\\`\\``;',
//         `export default rocketAutoConvertedMdText;`,
//       ].join('\n'),
//     );
//   });

//   it('escapes $ in code blocks', async () => {
//     const result = mdToJsWithMd(
//       [
//         //
//         '````md',
//         '```js story',
//         'export const JsStory = () => {',
//         '  const calculateSomething = 12;',
//         '  return html`',
//         '    <demo-wc-card .header=${`Something: ${calculateSomething}`}>JS Story</demo-wc-card>',
//         '  `;',
//         '};',
//         '```',
//         '````',
//       ].join('\n'),
//     );
//     expect(result).to.equal(
//       [
//         "import { md } from '@rocket/engine';",
//         "let rocketAutoConvertedMdText = '';",
//         'rocketAutoConvertedMdText += md`\\`\\`\\`\\`md`;',
//         'rocketAutoConvertedMdText += md`\\`\\`\\`js story`;',
//         'rocketAutoConvertedMdText += md`export const JsStory = () => {`;',
//         'rocketAutoConvertedMdText += md`  const calculateSomething = 12;`;',
//         'rocketAutoConvertedMdText += md`  return html\\``;',
//         'rocketAutoConvertedMdText += md`    <demo-wc-card .header=\\${\\`Something: \\${calculateSomething}\\`}>JS Story</demo-wc-card>`;',
//         'rocketAutoConvertedMdText += md`  \\`;`;',
//         'rocketAutoConvertedMdText += md`};`;',
//         'rocketAutoConvertedMdText += md`\\`\\`\\``;',
//         'rocketAutoConvertedMdText += md`\\`\\`\\`\\``;',
//         'export default rocketAutoConvertedMdText;',
//       ].join('\n'),
//     );
//   });
// });
