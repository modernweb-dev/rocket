const path = require('path');
const fs = require('fs-extra');
const { expect } = require('chai');
const Eleventy = require('@11ty/eleventy');
const TemplateConfig = require('@11ty/eleventy/src/TemplateConfig');
const prettier = require('prettier');

async function execute(fixtureDir) {
  const relPath = path.relative(process.cwd(), __dirname);
  const relativeInputPath = path.join(relPath, fixtureDir.split('/').join(path.sep));
  const relativeOutputPath = path.join(relPath, 'fixtures', '__output');
  const relativeConfigPath = path.join(relativeInputPath, '.eleventy.js');

  await fs.emptyDir(relativeOutputPath);

  const elev = new Eleventy(relativeInputPath, relativeOutputPath);
  const config = new TemplateConfig(null, relativeConfigPath);
  elev.config = config.getConfig();
  elev.setConfigPathOverride(relativeConfigPath);
  elev.resetConfig();

  await elev.init();
  await elev.write();
  return {
    readOutput: async readPath => {
      const relativeReadPath = path.join(relativeOutputPath, readPath);
      let text = await fs.promises.readFile(relativeReadPath);
      text = text.toString();
      text = prettier.format(text, { parser: 'html', printWidth: 100 });
      return text.trim();
    },
  };
}

describe('eleventy-rocket-nav', () => {
  it('renders a menu with anchors for h2 content', async () => {
    const { readOutput } = await execute('fixtures/three-pages');

    const bats = await readOutput('bats/index.html');
    expect(bats).to.deep.equal(
      [
        '<body>',
        '  <ul>',
        '    <li class="menu-item active">',
        '      <a href="/mammals/">Mammals</a>',
        '      <ul>',
        '        <li class="menu-item">',
        '          <a href="/humans/">Humans</a>',
        '        </li>',
        '        <li class="menu-item current">',
        '          <a href="/bats/">Bats</a>',
        '        </li>',
        '      </ul>',
        '    </li>',
        '  </ul>',
        '',
        '  <p>🦇 can fly.</p>',
        '</body>',
      ].join('\n'),
    );

    const humans = await readOutput('humans/index.html');
    expect(humans).to.deep.equal(
      [
        '<body>',
        '  <ul>',
        '    <li class="menu-item active">',
        '      <a href="/mammals/">Mammals</a>',
        '      <ul>',
        '        <li class="menu-item current">',
        '          <a href="/humans/">Humans</a>',
        '          <ul>',
        '            <li class="menu-item anchor">',
        '              <a href="#anatomy" class="anchor">Anatomy</a>',
        '            </li>',
        '            <li class="menu-item anchor">',
        '              <a href="#age" class="anchor">📖 Age</a>',
        '            </li>',
        '          </ul>',
        '        </li>',
        '        <li class="menu-item">',
        '          <a href="/bats/">Bats</a>',
        '        </li>',
        '      </ul>',
        '    </li>',
        '  </ul>',
        '',
        '  <h2 id="anatomy">Anatomy</h2>',
        '  <p>Has arms.</p>',
        '  <h2 id="age">📖 Age</h2>',
        '  <p>Up to 130 years.</p>',
        '</body>',
      ].join('\n'),
    );
  });
});
