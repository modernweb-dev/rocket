import assert from 'node:assert/strict';
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { collectResult } from '@lit-labs/ssr/lib/render-result.js';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { init, parse as parseExports } from 'es-module-lexer';
import { describe, it } from 'node:test';
import { finalizeRocketIcons, iconsFromPackage } from './icons.js';
import { compileMarkdownLoad, compileMarkdownSetup } from './markdownCompiler.js';
import { RocketCodeBlock } from './RocketCodeBlock.js';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));
const docsPagesDir = path.join(projectRoot, 'docs/pages');

describe('Test markdownCompiler', () => {
  it('01: compiles docs Markdown Pages with explicit Registered Components exports', async () => {
    await init;

    const missingComponentsExports = [];
    for (const pageFile of findMarkdownPages(docsPagesDir)) {
      const source = readFileSync(pageFile, 'utf8');
      if (!usesRegisteredComponentLayout(source)) {
        continue;
      }

      const compiledModule = await compileMarkdownLoad(source);
      const [, exports] = parseExports(compiledModule);
      const exportsComponents = exports.some(exported => exported.n === 'components');
      if (!exportsComponents) {
        missingComponentsExports.push(path.relative(projectRoot, pageFile));
      }
    }

    assert.deepEqual(missingComponentsExports, []);
  });

  it('02: renders labeled Markdown Code Blocks with frame data and Prism output', async () => {
    defineRocketCodeBlock();
    const code = 'const command = "rocket build";\nconsole.log(`copy ${command}!`);';
    const body = await renderMarkdownPage(`# Guide

\`\`\`js label="Install command" {1} showLineNumbers
${code}
\`\`\`
`);
    const encodedCode = readAttribute(body, 'encoded-code');

    assert.match(body, /<rocket-code-block\b/);
    assert.equal(readAttribute(body, 'label'), 'Install command');
    assert.equal(readAttribute(body, 'language'), 'js');
    assert.match(body, /part="frame"/);
    assert.match(body, /part="label"[^>]*>[\s\S]*Install command/);
    assert.match(body, /part="language-badge"[^>]*>[\s\S]*JS/);
    assert.match(body, /<figcaption part="caption">[\s\S]*part="copy-button"[\s\S]*<\/figcaption>/);
    assert.match(body, /<button[\s\S]*aria-label="Copy code"[\s\S]*<\/button>/);
    assert.match(body, /<rocket-icon\b[^>]*\bname="copy"/);
    assert.match(body, /<rocket-icon\b[^>]*\bname="check-lg"/);
    assert.match(body, /<rocket-icon\b[^>]*\bname="x-circle"/);
    assert.equal(Buffer.from(encodedCode, 'base64').toString('utf8'), code);
    assert.match(body, /<pre class="language-js">/);
    assert.match(body, /<code class="language-js code-highlight">/);
    assert.match(body, /class="code-line line-number highlight-line" line="1"/);
    assert.match(body, /class="token keyword"[^>]*>const/);

    const finalizedBody = await finalizeRocketIcons(body, {
      layoutIconLibraries: {
        bootstrap: iconsFromPackage('bootstrap-icons', 'icons/*.svg'),
      },
      layoutDefaultIconLibrary: 'bootstrap',
      pageData: { _hasBrowserLoadedComponents: true },
    });
    assert.deepEqual(Object.keys(readIconManifest(finalizedBody).icons).sort(), [
      'bootstrap:check-lg',
      'bootstrap:copy',
      'bootstrap:x-circle',
    ]);
  });

  it('03: renders unlabeled Markdown Code Blocks without a header', async () => {
    defineRocketCodeBlock();
    const code = 'const label = "not a header";';
    const body = await renderMarkdownPage(`# Guide

\`\`\`js
${code}
\`\`\`
`);
    const encodedCode = readAttribute(body, 'encoded-code');

    assert.match(body, /<rocket-code-block\b/);
    assert.equal(readAttribute(body, 'language'), 'js');
    assert.equal(Buffer.from(encodedCode, 'base64').toString('utf8'), code);
    assert.doesNotMatch(body, /<figcaption\b/);
    assert.doesNotMatch(body, /part="caption"/);
    assert.match(body, /part="code"/);
    assert.match(body, /part="copy-button body-copy-button"/);
  });

  it('04: derives terminal frames for shell-language Markdown Code Blocks', async () => {
    defineRocketCodeBlock();
    const code = 'npm run build';
    const body = await renderMarkdownPage(`# Guide

\`\`\`bash
${code}
\`\`\`
`);

    assert.match(body, /<rocket-code-block\b[^>]*\slanguage="bash"/);
    assert.doesNotMatch(body, /<rocket-code-block\b[^>]*\sframe=/);
    assert.match(body, /part="frame terminal-frame"/);
    assert.match(body, /part="code terminal-code"/);
  });

  it('05: renders js demo source panels inside rocket-js-demo with Code Block treatment', async () => {
    defineRocketCodeBlock();
    const code = [
      "import { html } from 'lit';",
      '',
      'export const simpleDemo = () => html`<button type="button">Demo</button>`;',
    ].join('\n');
    const body = await renderMarkdownPage(`# Demo

\`\`\`js demo label="docs/pages/examples/simple-demo.js"
${code}
\`\`\`
`);
    const encodedCode = readAttribute(body, 'encoded-code');

    assert.match(
      body,
      /<rocket-js-demo demo-name="simpleDemo">[\s\S]*<rocket-code-block\b[^>]*\blabel="docs\/pages\/examples\/simple-demo\.js"[^>]*\slanguage="js"[\s\S]*<\/rocket-code-block>[\s\S]*<\/rocket-js-demo>/,
    );
    assert.doesNotMatch(body, /rocket-preview/);
    assert.equal(Buffer.from(encodedCode, 'base64').toString('utf8'), code);
    assert.match(body, /part="copy-button"/);
    assert.match(body, /<pre class="language-js">/);
  });

  it('06: renders Markdown Code Blocks with custom starting line numbers', async () => {
    defineRocketCodeBlock();
    const body = await renderMarkdownPage(`# Guide

\`\`\`js showLineNumbers=10
const first = 1;
const second = 2;
\`\`\`
`);

    assert.match(body, /class="code-line line-number" line="10"/);
    assert.match(body, /class="code-line line-number" line="11"/);
  });

  it('07: renders Markdown heading permalinks for shareable sections', async () => {
    const body = await renderMarkdownPage(`# Guide

## Install Rocket
`);
    const anchor = readAnchorForHash(body, 'install-rocket');

    assert.match(body, /<h2 id="install-rocket">Install Rocket<a\b/);
    assert.match(anchor, /class="heading-anchor"/);
    assert.match(anchor, /aria-label="Link to this heading"/);
    assert.doesNotMatch(anchor, /\saria-hidden=|\stabindex=/);
    assert.match(anchor, />#<\/a>$/);
  });

  it('08: imports the JavaScript Demo define entrypoint in generated browser code', async () => {
    const code = [
      "import { html } from 'lit';",
      '',
      'export const simpleDemo = () => html`<button type="button">Demo</button>`;',
    ].join('\n');
    const source = `# Demo

\`\`\`js demo
${code}
\`\`\`
`;
    const pageModule = await compileMarkdownLoad(source);
    const singleDemoModule = await compileMarkdownLoad(source, { singleDemo: 'simpleDemo' });

    assert.match(pageModule, /import\("@rocket\/js\/define\/RocketJsDemo\.js"\)/);
    assert.match(singleDemoModule, /import\("@rocket\/js\/define\/RocketJsDemo\.js"\)/);
    assert.doesNotMatch(pageModule, /import\("@rocket\/js\/RocketJsDemo\.js"\)/);
    assert.doesNotMatch(singleDemoModule, /import\("@rocket\/js\/RocketJsDemo\.js"\)/);
  });

  it('09: renders js request-demo blocks as Request Demo elements with Code Block source', async () => {
    defineRocketCodeBlock();
    const code = [
      'export default function content(request) {',
      '  return { pathname: new URL(request.url).pathname };',
      '}',
    ].join('\n');
    const body = await renderMarkdownPage(`# Request Demo

\`\`\`js request-demo url="/api/time?format=json" label="docs/pages/api/time.rocket.js" height=360
${code}
\`\`\`
`);
    const encodedCode = readAttribute(body, 'encoded-code');

    assert.match(body, /<rocket-request-demo\b[^>]*\burl="\/api\/time\?format=json"/);
    assert.match(body, /<rocket-request-demo\b[^>]*\blabel="docs\/pages\/api\/time\.rocket\.js"/);
    assert.match(body, /<rocket-request-demo\b[^>]*\bheight="360"/);
    assert.doesNotMatch(body, /<figcaption part="header">/);
    assert.doesNotMatch(body, /data-request-demo-source/);
    assert.doesNotMatch(body, /data-request-demo-actions/);
    assert.match(
      body,
      /<rocket-request-demo[\s\S]*<rocket-code-block\b[^>]*\blabel="docs\/pages\/api\/time\.rocket\.js"[^>]*\blanguage="js"[\s\S]*<\/rocket-code-block>[\s\S]*<\/rocket-request-demo>/,
    );
    assert.equal(Buffer.from(encodedCode, 'base64').toString('utf8'), code);
  });

  it('10: does not extract or execute js request-demo source as Page or JavaScript Demo code', async () => {
    const requestDemoCode = [
      'customElements.define("request-demo-owned-card", class extends HTMLElement {});',
      'export const shouldNotBecomeDemo = () => "request demo source";',
    ].join('\n');
    const source = `\`\`\`js server
export const config = { path: "/request-demo" };
\`\`\`

# Request Demo

\`\`\`js request-demo url="/missing-route"
${requestDemoCode}
\`\`\`
`;
    const setupCode = await compileMarkdownSetup(source);
    const pageModule = await compileMarkdownLoad(source);
    const clientCode = readClientCode(pageModule);

    assert.doesNotMatch(setupCode, /request-demo-owned-card/);
    assert.doesNotMatch(setupCode, /shouldNotBecomeDemo/);
    assert.equal(clientCode, '');
    assert.doesNotMatch(pageModule, /demo setup code/);
    assert.doesNotMatch(pageModule, /rocketSingleDemo/);
  });

  it('11: omits default Request Demo height from generated markup', async () => {
    defineRocketCodeBlock();
    const body = await renderMarkdownPage(`# Request Demo

\`\`\`js request-demo url="/api/default-height.json"
export default () => ({ ok: true });
\`\`\`
`);

    assert.match(body, /<rocket-request-demo\b[^>]*\burl="\/api\/default-height\.json"/);
    assert.doesNotMatch(body, /<rocket-request-demo\b[^>]*\bheight=/);
    assert.doesNotMatch(body, /<iframe\b/);
  });
});

function defineRocketCodeBlock() {
  if (!customElements.get('rocket-code-block')) {
    customElements.define('rocket-code-block', RocketCodeBlock);
  }
}

/**
 * @param {string} source
 */
async function renderMarkdownPage(source) {
  const tempDir = mkdtempSync(path.join(process.cwd(), 'temp/rocket-markdown-'));
  const moduleFile = path.join(tempDir, 'page.mjs');

  try {
    writeFileSync(moduleFile, await compileMarkdownLoad(source));
    const module = await import(pathToFileURL(moduleFile).href);
    return collectResult(
      module.contentFn(
        {},
        /** @param {{ content: unknown }} data */
        data => data.content,
      ),
    );
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

/**
 * @param {string} html
 * @param {string} name
 */
function readAttribute(html, name) {
  const match = html.match(new RegExp(`\\s${name}="([^"]*)"`));
  assert.ok(match, `Expected ${name} attribute`);
  return match[1];
}

/**
 * @param {string} moduleCode
 */
function readClientCode(moduleCode) {
  const match = /data\._clientCode = `([\s\S]*?)`;\n\s+data\.content/.exec(moduleCode);
  assert.ok(match, 'Expected generated client code assignment');
  return match[1];
}

/**
 * @param {string} html
 * @param {string} id
 */
function readAnchorForHash(html, id) {
  const match = html.match(new RegExp(`<a\\b[^>]*href="#${id}"[^>]*>#[\\s\\S]*?<\\/a>`));
  assert.ok(match, `Expected anchor link for #${id}`);
  return match[0];
}

/**
 * @param {string} html
 */
function readIconManifest(html) {
  const match = /<script type="application\/json" data-rocket-icon-manifest>(.*?)<\/script>/.exec(
    html,
  );
  assert.ok(match, 'Expected rocket-icon manifest');
  return JSON.parse(match[1]);
}

/**
 * @param {string} directory
 * @returns {string[]}
 */
function findMarkdownPages(directory) {
  return readdirSync(directory, { withFileTypes: true })
    .flatMap(entry => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return findMarkdownPages(entryPath);
      }
      return entry.name.endsWith('.rocket.md') ? [entryPath] : [];
    })
    .sort();
}

/**
 * @param {string} source
 */
function usesRegisteredComponentLayout(source) {
  return /atlas(?:Doc|Hero)(?:Layout|Components)|webAwesomeComponents/.test(source);
}
