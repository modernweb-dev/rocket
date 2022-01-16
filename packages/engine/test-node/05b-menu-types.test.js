import chai from 'chai';
import { setupTestEngine } from './test-helpers.js';

const { expect } = chai;

describe('Menu Types', () => {
  it('01 breadcrumb', async () => {
    const { readOutput, build } = await setupTestEngine(
      'fixtures/05b-menu-types/01-breadcrumb/docs',
    );
    await build();

    expect(readOutput('components/button-blue/index.html', { format: 'html' })).to.equal(
      [
        '<nav aria-label="Breadcrumb">',
        '  <ol>',
        '    <li class="web-menu-active">',
        '      <a href="/"> Home </a>',
        '    </li>',
        '    <li class="web-menu-active">',
        '      <a href="/components/"> Components </a>',
        '    </li>',
        '    <li class="web-menu-current">',
        '      <a href="/components/button-blue/" aria-current="page"> Button Blue </a>',
        '    </li>',
        '  </ol>',
        '</nav>',
        '<main><h1>Button Blue</h1></main>',
      ].join('\n'),
    );

    expect(readOutput('components/button-red/index.html', { format: 'html' })).to.equal(
      [
        '<nav aria-label="Breadcrumb">',
        '  <ol>',
        '    <li class="web-menu-active">',
        '      <a href="/"> Home </a>',
        '    </li>',
        '    <li class="web-menu-active">',
        '      <a href="/components/"> Components </a>',
        '    </li>',
        '    <li class="web-menu-current">',
        '      <a href="/components/button-red/" aria-current="page"> Button Red </a>',
        '    </li>',
        '  </ol>',
        '</nav>',
        '<main><h1>Button Red</h1></main>',
      ].join('\n'),
    );

    expect(readOutput('components/index.html', { format: 'html' })).to.equal(
      [
        '<nav aria-label="Breadcrumb">',
        '  <ol>',
        '    <li class="web-menu-active">',
        '      <a href="/"> Home </a>',
        '    </li>',
        '    <li class="web-menu-current">',
        '      <a href="/components/" aria-current="page"> Components </a>',
        '    </li>',
        '  </ol>',
        '</nav>',
        '<main><h1>Components</h1></main>',
      ].join('\n'),
    );

    expect(readOutput('index.html', { format: 'html' })).to.equal(
      [
        '<nav aria-label="Breadcrumb">',
        '  <ol>',
        '    <li class="web-menu-current">',
        '      <a href="/" aria-current="page"> Home </a>',
        '    </li>',
        '  </ol>',
        '</nav>',
        '<main><h1>Home</h1></main>',
      ].join('\n'),
    );
  });

  it('02 site', async () => {
    const { readOutput, build } = await setupTestEngine('fixtures/05b-menu-types/02-site/docs');
    await build();

    expect(readOutput('components/button-red/index.html', { format: 'html' })).to.equal(
      [
        '<nav aria-label="site">',
        '  <a href="/about/"> About </a>',
        '  <a href="/components/"> Components </a>',
        '</nav>',
        '<main><h1>Button Red</h1></main>',
      ].join('\n'),
    );

    expect(readOutput('components/index.html', { format: 'html' })).to.equal(
      [
        '<nav aria-label="site">',
        '  <a href="/about/"> About </a>',
        '  <a href="/components/" aria-current="page"> Components </a>',
        '</nav>',
        '<main><h1>Components</h1></main>',
      ].join('\n'),
    );
  });

  it('03 next-previous', async () => {
    const { readOutput, build } = await setupTestEngine(
      'fixtures/05b-menu-types/03-next-previous/docs',
    );
    await build();

    expect(readOutput('index.html', { format: 'html' })).to.equal(
      [
        '<a href="/one/" class="next-menu">',
        '  <span class="next-menu__description">Next article</span>',
        '  <span>one</span>',
        '</a>',
        '<main><h1>Home</h1></main>',
      ].join('\n'),
    );

    expect(readOutput('one/index.html', { format: 'html' })).to.equal(
      [
        '<a href="/" class="previous-menu">',
        '  <span class="previous-menu__description">Previous article</span>',
        '  <span>Home</span>',
        '</a>',
        '<a href="/two/" class="next-menu">',
        '  <span class="next-menu__description">Next article</span>',
        '  <span>two</span>',
        '</a>',
        '<main><h1>one</h1></main>',
      ].join('\n'),
    );

    expect(readOutput('two/index.html', { format: 'html' })).to.equal(
      [
        '<a href="/one/" class="previous-menu">',
        '  <span class="previous-menu__description">Previous article</span>',
        '  <span>one</span>',
        '</a>',
        '<a href="/three/" class="next-menu">',
        '  <span class="next-menu__description">Next article</span>',
        '  <span>three</span>',
        '</a>',
        '<main><h1>two</h1></main>',
      ].join('\n'),
    );

    expect(readOutput('three/index.html', { format: 'html' })).to.equal(
      [
        '<a href="/two/" class="previous-menu">',
        '  <span class="previous-menu__description">Previous article</span>',
        '  <span>two</span>',
        '</a>',
        '<main><h1>three</h1></main>',
      ].join('\n'),
    );
  });

  it('03b next-previous nested', async () => {
    const { readOutput, build } = await setupTestEngine(
      'fixtures/05b-menu-types/03b-next-previous-nested/docs',
    );
    await build();

    expect(readOutput('index.html', { format: 'html' })).to.equal(
      [
        '<a href="/guides/" class="next-menu">',
        '  <span class="next-menu__description">Next article</span>',
        '  <span>Guides</span>',
        '</a>',
        '<main><h1>Home</h1></main>',
      ].join('\n'),
    );

    expect(readOutput('guides/index.html', { format: 'html' })).to.equal(
      [
        '<a href="/" class="previous-menu">',
        '  <span class="previous-menu__description">Previous article</span>',
        '  <span>Home</span>',
        '</a>',
        '<a href="/guides/setup/getting-started/" class="next-menu">',
        '  <span class="next-menu__description">Next article</span>',
        '  <span>Getting started</span>',
        '</a>',
        '<main><h1>Guides</h1></main>',
      ].join('\n'),
    );

    expect(
      readOutput('guides/first-pages/getting-started/index.html', { format: 'html' }),
    ).to.equal(
      [
        '<a href="/guides/" class="previous-menu">',
        '  <span class="previous-menu__description">Previous article</span>',
        '  <span>Guides</span>',
        '</a>',
        '<a href="/guides/first-pages/adding-pages/" class="next-menu">',
        '  <span class="next-menu__description">Next article</span>',
        '  <span>Adding Pages</span>',
        '</a>',
        '<main><h1>Getting started</h1></main>',
      ].join('\n'),
    );

    expect(
      readOutput('guides/first-pages/writing-content/index.html', { format: 'html' }),
    ).to.equal(
      [
        '<a href="/guides/first-pages/adding-pages/" class="previous-menu">',
        '  <span class="previous-menu__description">Previous article</span>',
        '  <span>Adding Pages</span>',
        '</a>',
        '<a href="/guides/configuration/getting-started/" class="next-menu">',
        '  <span class="next-menu__description">Next article</span>',
        '  <span>Getting started</span>',
        '</a>',
        '<main><h1>Writing Content</h1></main>',
      ].join('\n'),
    );
  });

  it('04 article-overview', async () => {
    const { readOutput, build } = await setupTestEngine(
      'fixtures/05b-menu-types/04-article-overview/docs',
    );
    await build();

    expect(readOutput('blog/index.html', { format: 'html' })).to.equal(
      [
        '<div class="blog-intro">',
        '  <h1>Blog Overview</h1>',
        '</div>',
        '<div>',
        '  <article class="post">',
        // '    <div class="cover">',
        // '      <a href="/blog/new-year-new-challenge/" tabindex="-1" aria-hidden="true">',
        // '        <figure>',
        // '          <img ../>',
        // '        </figure>',
        // '      </a>',
        // '    </div>',
        '    <a href="/blog/new-year-new-challenge/">',
        '      <h2>New Year New Challenge</h2>',
        '    </a>',
        // '    <div class="authors">',
        // '      [[ authors image + name each linked ]]',
        // '      <time>Updated: Sep 6, 2021</time>',
        // '    </div>',
        '    <div class="description">',
        '      <a href="/blog/new-year-new-challenge/" tabindex="-1">',
        '        <p>It is a new year and there are new challenges awaiting.</p>',
        '      </a>',
        // '      <div class="tags">',
        // '        <a href="/blog/tags/capabilities/">Capabilities</a> ',
        // '        <a href="/blog/tags/games/">Games</a>',
        // '      </div>',
        '    </div>',
        '  </article>',
        '  <article class="post">',
        '    <a href="/blog/comparing-apple-to-oranges/">',
        '      <h2>Comparing Apple to Oranges</h2>',
        '    </a>',
        '    <div class="description">',
        '      <a href="/blog/comparing-apple-to-oranges/" tabindex="-1">',
        '        <p>Say you have an apple and you then find an orange - what would you do?</p>',
        '      </a>',
        '    </div>',
        '  </article>',
        '</div>',
      ].join('\n'),
    );
  });

  it('05 indexMenu', async () => {
    const { readOutput, build } = await setupTestEngine('fixtures/05b-menu-types/05-index/docs');
    await build();

    expect(
      readOutput('components/content/accordion/overview/index.html', { format: 'html' }),
    ).to.equal(
      [
        '<nav aria-label="index" data-type="index">',
        '  <ul class="lvl-2">',
        '    <li class="web-menu-active">',
        '      <span>Content</span>',
        '      <ul class="lvl-3">',
        '        <li class="web-menu-active">',
        '          <details open>',
        '            <summary>Accordion</summary>',
        '            <ul class="lvl-4">',
        '              <li class="web-menu-current">',
        '                <a href="/components/content/accordion/overview/" aria-current="page">',
        '                  Accordion Overview',
        '                </a>',
        '              </li>',
        '              <li class="  ">',
        '                <a href="/components/content/accordion/api/"> Accordion API </a>',
        '              </li>',
        '            </ul>',
        '          </details>',
        '        </li>',
        '      </ul>',
        '    </li>',
        '    <li class="  ">',
        '      <span>Inputs</span>',
        '      <ul class="lvl-3">',
        '        <li class="  ">',
        '          <a href="/components/inputs/input-text/"> Input Text </a>',
        '        </li>',
        '        <li class="  ">',
        '          <a href="/components/inputs/textarea/"> Textarea </a>',
        '        </li>',
        '      </ul>',
        '    </li>',
        '  </ul>',
        '</nav>',
        '<main><h1>Accordion Overview</h1></main>',
      ].join('\n'),
    );

    expect(readOutput('components/inputs/textarea/index.html', { format: 'html' })).to.equal(
      [
        '<nav aria-label="index" data-type="index">',
        '  <ul class="lvl-2">',
        '    <li class="  ">',
        '      <span>Content</span>',
        '      <ul class="lvl-3">',
        '        <li class="  ">',
        '          <details>',
        '            <summary>Accordion</summary>',
        '            <ul class="lvl-4">',
        '              <li class="  ">',
        '                <a href="/components/content/accordion/overview/"> Accordion Overview </a>',
        '              </li>',
        '              <li class="  ">',
        '                <a href="/components/content/accordion/api/"> Accordion API </a>',
        '              </li>',
        '            </ul>',
        '          </details>',
        '        </li>',
        '      </ul>',
        '    </li>',
        '    <li class="web-menu-active">',
        '      <span>Inputs</span>',
        '      <ul class="lvl-3">',
        '        <li class="  ">',
        '          <a href="/components/inputs/input-text/"> Input Text </a>',
        '        </li>',
        '        <li class="web-menu-current">',
        '          <a href="/components/inputs/textarea/" aria-current="page"> Textarea </a>',
        '        </li>',
        '      </ul>',
        '    </li>',
        '  </ul>',
        '</nav>',
        '<main><h1>Textarea</h1></main>',
      ].join('\n'),
    );

    expect(readOutput('getting-started/setup/install-cli/index.html', { format: 'html' })).to.equal(
      [
        '<nav aria-label="index" data-type="index">',
        '  <ul class="lvl-2">',
        '    <li class="web-menu-active">',
        '      <span>Setup</span>',
        '      <ul class="lvl-3">',
        '        <li class="web-menu-current">',
        '          <a href="/getting-started/setup/install-cli/" aria-current="page"> Install Cli </a>',
        '        </li>',
        '      </ul>',
        '    </li>',
        '  </ul>',
        '</nav>',
        '<main><h1>Install Cli</h1></main>',
      ].join('\n'),
    );
  });

  it('06 tableOfContents', async () => {
    const { readOutput, build } = await setupTestEngine(
      'fixtures/05b-menu-types/06-table-of-contents/docs',
    );
    await build();

    expect(readOutput('index.html', { format: 'html' })).to.equal(
      [
        '<aside>',
        '  <h2>Contents</h2>',
        '  <nav aria-label="Table of Contents">',
        '    <ol class="lvl-2">',
        '      <li class="  ">',
        '        <a href="#every-headline"> Every headline </a>',
        '        <ol class="lvl-3">',
        '          <li class="  ">',
        '            <a href="#will-be"> will be </a>',
        '          </li>',
        '        </ol>',
        '      </li>',
        '      <li class="  ">',
        '        <a href="#listed"> listed </a>',
        '        <ol class="lvl-3">',
        '          <li class="  ">',
        '            <a href="#considering"> considering </a>',
        '            <ol class="lvl-4">',
        '              <li class="  ">',
        '                <a href="#nesting"> nesting </a>',
        '              </li>',
        '              <li class="  ">',
        '                <a href="#and"> and </a>',
        '              </li>',
        '            </ol>',
        '          </li>',
        '          <li class="  ">',
        '            <a href="#returning"> returning </a>',
        '          </li>',
        '        </ol>',
        '      </li>',
        '      <li class="  ">',
        '        <a href="#to-the"> to the </a>',
        '      </li>',
        '      <li class="  ">',
        '        <a href="#main-level"> main level </a>',
        '      </li>',
        '    </ol>',
        '  </nav>',
        '</aside>',
        '<main>',
        '  <h1 id="welcome-to-the-table-of-contents-menu">Welcome to the table of contents menu</h1>',
        '  <h2 id="every-headline">Every headline</h2>',
        '  <h3 id="will-be">will be</h3>',
        '  <h2 id="listed">listed</h2>',
        '  <h3 id="considering">considering</h3>',
        '  <h4 id="nesting">nesting</h4>',
        '  <h4 id="and">and</h4>',
        '  <h3 id="returning">returning</h3>',
        '  <h2 id="to-the">to the</h2>',
        '  <h2 id="main-level">main level</h2>',
        '</main>',
      ].join('\n'),
    );

    expect(readOutput('empty/index.html', { format: 'html' })).to.equal(
      [
        '<main>',
        '  <h1>Empty because no sub headlines</h1>',
        '  <h2>or no ids</h2>',
        '</main>',
      ].join('\n'),
    );
  });

  it('07 child-list', async () => {
    const { readOutput, build } = await setupTestEngine(
      'fixtures/05b-menu-types/07-child-list/docs',
    );
    await build();

    expect(readOutput('components/index.html', { format: 'html' })).to.equal(
      [
        '<nav aria-label="Child List Menu" data-type="child-list-menu">',
        '  <ul class="lvl-2">',
        '    <li class="  ">',
        '      <span>Content</span>',
        '      <ul class="lvl-3">',
        '        <li class="  ">',
        '          <a href="/components/content/accordion/overview/">Accordion</a>',
        '        </li>',
        '      </ul>',
        '    </li>',
        '    <li class="  ">',
        '      <span>Inputs</span>',
        '      <ul class="lvl-3">',
        '        <li class="  ">',
        '          <a href="/components/inputs/input-text/">Input Text</a>',
        '        </li>',
        '        <li class="  ">',
        '          <a href="/components/inputs/textarea/">Textarea</a>',
        '        </li>',
        '      </ul>',
        '    </li>',
        '  </ul>',
        '</nav>',
        '<main>',
        '  <h1>Components</h1>',
        '  <meta name="menu:exclude" content="true" />',
        '</main>',
      ].join('\n'),
    );

    expect(readOutput('components/inputs/index.html', { format: 'html' })).to.equal(
      [
        '<nav aria-label="Child List Menu" data-type="child-list-menu">',
        '  <ul class="lvl-3">',
        '    <li class="  ">',
        '      <a href="/components/inputs/input-text/">Input Text</a>',
        '    </li>',
        '    <li class="  ">',
        '      <a href="/components/inputs/textarea/">Textarea</a>',
        '    </li>',
        '  </ul>',
        '</nav>',
        '<main>',
        '  <h1>Inputs</h1>',
        '  <meta name="menu:exclude" content="true" />',
        '</main>',
      ].join('\n'),
    );

    expect(readOutput('index.html', { format: 'html' })).to.equal(
      [
        '<nav aria-label="Child List Menu" data-type="child-list-menu">',
        '  <ul class="lvl-1">',
        '    <li class="  ">',
        '      <span>Components</span>',
        '      <ul class="lvl-2">',
        '        <li class="  ">',
        '          <a href="/components/content/accordion/overview/">Content</a>',
        '        </li>',
        '        <li class="  ">',
        '          <a href="/components/inputs/input-text/">Inputs</a>',
        '        </li>',
        '      </ul>',
        '    </li>',
        '    <li class="  ">',
        '      <a href="/getting-started/">Getting started</a>',
        '      <ul class="lvl-2">',
        '        <li class="  ">',
        '          <a href="/getting-started/setup/">Setup</a>',
        '        </li>',
        '      </ul>',
        '    </li>',
        '  </ul>',
        '</nav>',
        '<main><h1>Home</h1></main>',
      ].join('\n'),
    );
  });
});
