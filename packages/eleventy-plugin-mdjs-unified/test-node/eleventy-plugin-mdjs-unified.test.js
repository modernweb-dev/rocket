const chai = require('chai');
const path = require('path');
const Eleventy = require('@11ty/eleventy');

const { expect } = chai;

async function renderEleventy(inputDir) {
  const mainOutputPath = '_site';
  const resolvedInputDir = path.resolve(path.dirname(__dirname), inputDir);
  const elev = new Eleventy(resolvedInputDir, mainOutputPath);

  // 11ty always wants a relative path to cwd - why?
  const rel = path.relative(process.cwd(), resolvedInputDir);
  const relCwdPathToConfig = path.join(rel, '.eleventy.cjs');
  elev.setConfigPathOverride(relCwdPathToConfig);
  elev.config.filters = {};

  elev.setDryRun(true);
  await elev.init();

  const htmlFiles = [];

  elev.config.filters['hook-for-test'] = (html, outputPath) => {
    const name = path.relative(mainOutputPath, outputPath);
    htmlFiles.push({
      html,
      name,
    });
    return html;
  };

  const orig = console.log;
  console.log = () => {
    // no logging
  };
  await elev.write();
  console.log = orig;

  return htmlFiles;
}

describe('eleventy-plugin-mdjs-unified', () => {
  it('renders markdown', async () => {
    const files = await renderEleventy('./test-node/fixtures/md');
    expect(files).to.deep.equal([
      {
        html:
          '<h1 id="first"><a aria-hidden="true" tabindex="-1" href="#first"><span class="icon icon-link"></span></a>First</h1>',
        name: 'first/index.html',
      },
    ]);
  });

  it('renders markdown with javascript', async () => {
    const files = await renderEleventy('./test-node/fixtures/mdjs');

    expect(files.length).to.equal(1);
    expect(files[0].name).to.equal('first/index.html');

    expect(files[0].html).to.include('<script type="module">');
    expect(files[0].html).to.include('for (const story of stories)');
  });

  it('rewrites relative import pathes', async () => {
    const files = await renderEleventy('./test-node/fixtures/mdjs-import');
    expect(files).to.deep.equal([
      {
        html:
          "<p>first</p>\n        <script type=\"module\">\n          import '../import-me.js';\nimport('../import-me-too.js');\n        </script>\n      ",
        name: 'first/index.html',
      },
    ]);
  });

  it('rewrites relative import pathes in subpages', async () => {
    const files = await renderEleventy('./test-node/fixtures/mdjs-import-in-subpage');
    expect(files).to.deep.equal([
      {
        html:
          "<p>first</p>\n        <script type=\"module\">\n          import '../../import-me.js';\nimport('../../import-me-too.js');\n        </script>\n      ",
        name: 'subpage/first/index.html',
      },
    ]);
  });

  it('does not touch relative imports of an index.md file', async () => {
    const files = await renderEleventy('./test-node/fixtures/mdjs-import-index');
    expect(files).to.deep.equal([
      {
        html:
          "<p>index</p>\n        <script type=\"module\">\n          import './import-me.js';\nimport('./import-me-too.js');\n        </script>\n      ",
        name: 'index.html',
      },
    ]);
  });

  it('allows to configure the plugins for unity', async () => {
    const files = await renderEleventy('./test-node/fixtures/plugin-configure');
    expect(files).to.deep.equal([
      {
        html:
          '<h1 id="first"><a class="anchor" href="#first"><span class="icon icon-link"></span></a>First</h1>',
        name: 'first/index.html',
      },
    ]);
  });
});
