const { expect } = require('chai');
const prettier = require('prettier');
const { addPageAnchors } = require('../src/addPageAnchors.js');

const format = code => prettier.format(code, { parser: 'html' }).trim();

describe('addPageAnchors', () => {
  it('finds and adds anchors for each h2 as an unordered list', async () => {
    const input = [
      '<body>',
      '  <!-- ADD PAGE ANCHORS -->',
      '  <div id="content">',
      '    <h2 id="first">👉 First Headline</h2>',
      '  </div>',
      '</body>',
    ].join('\n');
    const expected = [
      '<body>',
      '  <ul>',
      '    <li class="menu-item anchor">',
      '      <a href="#first" class="anchor">👉 First Headline</a>',
      '    </li>',
      '  </ul>',
      '  <div id="content">',
      '    <h2 id="first">👉 First Headline</h2>',
      '  </div>',
      '</body>',
    ].join('\n');
    const result = await addPageAnchors(input);
    expect(format(result)).to.deep.equal(expected);
  });
});
