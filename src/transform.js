/** Runs on: import-hook */
import markdown from 'remark-parse';
import { unified } from 'unified';
import gfm from 'remark-gfm';
import remark2rehype from 'remark-rehype';
import rehypePrism from 'rehype-prism-plus';
import rawHtml from 'rehype-raw';
import htmlStringify from 'rehype-stringify';
import rehypeSlug from 'rehype-slug';
import rehypeLinkHeadings from 'rehype-autolink-headings';
import { extractMdCode } from './extractCode.js';
import { visit } from 'unist-util-visit';
import { init, parse as parseExports } from 'es-module-lexer';
import { headLinesToTree } from './menu.js';
import { parseRequestDemoMetadata } from './requestDemoMetadata.js';
import ts from 'typescript';

/** @type {import('rehype-autolink-headings').Options} */
const headingAnchorOptions = {
  behavior: 'append',
  properties: {
    className: ['heading-anchor'],
    ariaLabel: 'Link to this heading',
  },
  content: {
    type: 'text',
    value: '#',
  },
};

/**
 * @param {string} md
 */
export async function mdToJs(md) {
  const result = await unified()
    .use(markdown)
    .use(gfm)
    .use(extractMdCode('server'))
    .use(extractMdCode('client'))
    .use(parseDemos)
    .use(parseRequestDemos)
    .use(captureCodeBlockData)
    .use(escapeRocketMd)
    .use(remark2rehype, { allowDangerousHtml: true })
    // now html
    .use(rawHtml)
    .use(fixImageTags)
    .use(rehypePrism)
    .use(wrapCodeBlocks)
    .use(escapeCodeBlocks)
    .use(rehypeSlug)
    .use(rehypeLinkHeadings, headingAnchorOptions)
    .use(extractHeadings)

    .use(htmlStringify)
    .process(md);

  const code = /** @type {{client: string; server: string}} */ (result.data.code);
  const headlines = /** @type {import('@rocket/js/types.js').Headline[]} */ (result.data.headings);

  const moduleCode = await makeJsFile(
    code.server,
    code.client || '',
    result.value.toString(),
    headlines,
  );
  return moduleCode;
}

/**
 * @param {string} md
 * @param {string} demo
 */
export async function mdToJsSingleDemo(md, demo) {
  const result = await unified()
    .use(markdown)
    .use(extractMdCode('server'))
    .use(extractMdCode('client'))
    .use(extractSingleDemo, demo)
    .use(captureCodeBlockData)
    .use(remark2rehype, { allowDangerousHtml: true })
    // now html
    .use(rawHtml)
    .use(rehypePrism)
    .use(wrapCodeBlocks)
    .use(escapeCodeBlocks)

    .use(htmlStringify)
    .process(md);

  const code = /** @type {{client: string; server: string}} */ (result.data.code);

  let litImport = "import { html } from 'lit'";
  if (/import\s*?{(?:\n|.)*?html(\n|.)*}.*/m.test(code.server)) {
    litImport = '';
  }
  const moduleCode = `
import {render} from '@lit-labs/ssr';
${litImport}
${code.server}
export function contentFn(data, layout) {
  data._clientCode = \`${code.client
    .replace(/\\/g, '\\\\')
    .replace(/\$/g, '\\$')
    .replace(/`/g, '\\`')}\`;
  data.content = html\`${result.value.toString()}\`;

  const layoutResult = layout(data);
  return render(layoutResult);
}`;
  return moduleCode;
}

/**
 * @param {string} serverCode
 * @param {string} clientCode
 * @param {string} markdown
 * @param {import('@rocket/js/types.js').Headline[]} headlines
 * @returns {Promise<string>}
 */
async function makeJsFile(serverCode, clientCode, markdown, headlines) {
  let litImport = "import { html } from 'lit'";
  const normalizedServerCode = normalizeLayoutExportBindings(serverCode);
  if (/import\s*?{(?:\n|.)*?html(\n|.)*}.*/m.test(normalizedServerCode)) {
    litImport = '';
  }
  return `
import {render} from '@lit-labs/ssr';
${litImport}
${normalizedServerCode}
export function contentFn(data, defaultLayout) {
  let renderLayout = defaultLayout;
  if (typeof layout !== 'undefined') {
    renderLayout = layout;
  }
  data._clientCode = \`${clientCode
    .replace(/\\/g, '\\\\')
    .replace(/\$/g, '\\$')
    .replace(/`/g, '\\`')}\`;
  data.content = html\`${markdown}\`;
  data.toc = ${JSON.stringify(headLinesToTree(headlines))};

  const layoutResult = renderLayout(data);
  return render(layoutResult);
}`;
}

/**
 * Direct ESM re-exports do not create local bindings, but the generated Markdown module calls the
 * selected layout from inside contentFn. Rewriting only direct `layout` re-exports keeps the public
 * Page syntax working while preserving the generated function's local binding lookup.
 *
 * @param {string} serverCode
 * @returns {string}
 */
function normalizeLayoutExportBindings(serverCode) {
  if (typeof serverCode !== 'string') {
    return '';
  }
  const sourceFile = ts.createSourceFile(
    'page-server.js',
    serverCode,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.JS,
  );
  /** @type {{start: number; end: number; text: string}[]} */
  const replacements = [];

  for (const statement of sourceFile.statements) {
    if (
      !ts.isExportDeclaration(statement) ||
      !statement.moduleSpecifier ||
      !statement.exportClause ||
      !ts.isNamedExports(statement.exportClause)
    ) {
      continue;
    }

    const layoutExport = statement.exportClause.elements.find(
      element => element.name.text === 'layout',
    );
    if (!layoutExport) {
      continue;
    }

    const moduleSpecifier = statement.moduleSpecifier.getText(sourceFile);
    const attributes = statement.attributes ? ` ${statement.attributes.getText(sourceFile)}` : '';
    const importedName = (layoutExport.propertyName || layoutExport.name).getText(sourceFile);
    const layoutImportSpecifier =
      importedName === 'layout' ? 'layout' : `${importedName} as layout`;
    const replacementLines = [
      `import { ${layoutImportSpecifier} } from ${moduleSpecifier}${attributes};`,
      'export { layout };',
    ];

    const remainingExports = statement.exportClause.elements.filter(
      element => element !== layoutExport,
    );
    if (remainingExports.length) {
      const remainingSpecifiers = remainingExports.map(element => {
        if (element.propertyName) {
          return `${element.propertyName.getText(sourceFile)} as ${element.name.getText(sourceFile)}`;
        }
        return element.name.getText(sourceFile);
      });
      replacementLines.push(
        `export { ${remainingSpecifiers.join(', ')} } from ${moduleSpecifier}${attributes};`,
      );
    }

    replacements.push({
      start: statement.getStart(sourceFile),
      end: statement.end,
      text: replacementLines.join('\n'),
    });
  }

  if (!replacements.length) {
    return serverCode;
  }

  let normalizedCode = serverCode;
  for (const replacement of replacements.toReversed()) {
    normalizedCode =
      normalizedCode.slice(0, replacement.start) +
      replacement.text +
      normalizedCode.slice(replacement.end);
  }
  return normalizedCode;
}

function parseDemos() {
  /** @type {{name: string, code: string}[]} */
  const demos = [];

  /** @type {import('unist-util-visit').Visitor} */
  const visitor = _node => {
    const node = /** @type {import('mdast').Code & {visited: boolean}} */ (_node);
    if (isDemoCodeNode(node) && typeof node.value === 'string' && !node.visited) {
      const codePreview = structuredClone(node);
      codePreview.visited = true;
      codePreview.meta = demoCodeBlockMeta(node.meta);
      const code = node.value;
      const parsed = parseExports(code);
      const name = parsed[1][0].ln || parsed[1][0].n;
      // we transform a code node into a root node, so cast
      const rootNode = /** @type {import('mdast').Root} */ (/** @type {unknown} */ (node));
      rootNode.type = 'root';
      rootNode.children = [
        { type: 'html', value: `<rocket-js-demo demo-name="${name}">` },
        { type: 'text', value: '\n\n' },
        codePreview,
        { type: 'text', value: '\n\n' },
        { type: 'html', value: '</rocket-js-demo>' },
      ];
      // root nodes don't have values
      // @ts-ignore
      delete node.value;
      delete node.lang;
      delete node.meta;
      demos.push({ name, code });
    }
  };

  /**
   * @param {import('unist').Node} tree
   * @param {import('vfile').VFile} file
   */
  return async function (tree, file) {
    await init;
    visit(tree, 'code', visitor);
    if (!file.data) {
      file.data = {};
    }

    const code = /** @type {{client: string}} */ (file.data?.code);

    if (demos.length) {
      const demoCode = demos.map(demo => demo.code).join('\n');
      const invokeDemosCode = demos
        .map(demo => `{key: '${demo.name}', demo: ${demo.name}}`)
        .join(', ');

      // @ts-ignore
      file.data.code.client = [
        '// client code',
        code.client + ';',
        '// demo code',
        demoCode,
        '// demo setup code',
        'let needsElements = false;',
        `for (const demo of [${invokeDemosCode}]) {`,
        '  const element = document.querySelector(`rocket-js-demo[demo-name="${demo.key}"]`);',
        '  if (element) {',
        '    needsElements = true;',
        '    element.demo = demo.demo;',
        '  }',
        '}',
        'if (needsElements) {',
        '  import("@rocket/js/define/RocketJsDemo.js");',
        '}',
      ].join('\n');
    }

    return tree;
  };
}

function parseRequestDemos() {
  /** @type {import('unist-util-visit').Visitor} */
  const visitor = _node => {
    const node = /** @type {import('mdast').Code & {visited: boolean}} */ (_node);
    if (!isRequestDemoCodeNode(node) || typeof node.value !== 'string' || node.visited) {
      return;
    }

    const metadata = parseRequestDemoMetadata(node.meta);
    const codePreview = structuredClone(node);
    codePreview.visited = true;
    codePreview.meta = metadata.label
      ? `label="${escapeFenceAttribute(metadata.label)}"`
      : undefined;

    const rootNode = /** @type {import('mdast').Root} */ (/** @type {unknown} */ (node));
    rootNode.type = 'root';
    rootNode.children = [
      { type: 'html', value: requestDemoFallbackStart(metadata) },
      { type: 'text', value: '\n\n' },
      codePreview,
      { type: 'text', value: '\n\n' },
      { type: 'html', value: requestDemoFallbackEnd() },
    ];
    // root nodes don't have values
    // @ts-ignore
    delete node.value;
    delete node.lang;
    delete node.meta;
  };

  /**
   * @param {import('unist').Node} tree
   */
  return function (tree) {
    visit(tree, 'code', visitor);
    return tree;
  };
}

/**
 * @param {import('mdast').Code} node
 */
function isRequestDemoCodeNode(node) {
  return node.lang === 'js' && /^request-demo(?:\s|$)/.test(node.meta || '');
}

/**
 * @param {import('mdast').Code} node
 */
function isDemoCodeNode(node) {
  return node.lang === 'js' && /(?:^|\s)demo(?:\s|$)/.test(node.meta || '');
}

/**
 * @param {string | null | undefined} meta
 */
function demoCodeBlockMeta(meta) {
  const codeBlockMeta = (meta || '').replace(/(?:^|\s)demo(?=\s|$)/, ' ').trim();

  return codeBlockMeta || undefined;
}

/**
 * @param {import('./requestDemoMetadata.js').RequestDemoMetadata} metadata
 */
function requestDemoFallbackStart(metadata) {
  const urlAttribute = escapeHtmlAttribute(metadata.url);
  const labelAttribute = metadata.label ? ` label="${escapeHtmlAttribute(metadata.label)}"` : '';
  const heightAttribute = metadata.height !== undefined ? ` height="${metadata.height}"` : '';

  return `<rocket-request-demo url="${urlAttribute}"${labelAttribute}${heightAttribute}>`;
}

function requestDemoFallbackEnd() {
  return '</rocket-request-demo>';
}

/**
 * @param {string} demoName
 */
function extractSingleDemo(demoName) {
  /** @type {{name: string, code: string, node: import('mdast').Root} | null} */
  let demo = null;

  /** @type {import('unist-util-visit').Visitor} */
  const visitor = _node => {
    const node = /** @type {import('mdast').Code & {visited: boolean}} */ (_node);
    if (isDemoCodeNode(node) && typeof node.value === 'string' && !node.visited) {
      const codePreview = structuredClone(node);
      codePreview.visited = true;
      codePreview.meta = demoCodeBlockMeta(node.meta);
      const code = node.value;
      const parsed = parseExports(code);
      const name = parsed[1][0].ln || parsed[1][0].n;
      if (name !== demoName) {
        return;
      }
      // we transform a code node into a root node, so cast
      const rootNode = /** @type {import('mdast').Root} */ (/** @type {unknown} */ (node));
      rootNode.type = 'root';
      rootNode.children = [
        {
          type: 'html',
          value: `<rocket-js-demo demo-name="${name}" single-demo>`,
        },
        { type: 'text', value: '\n\n' },
        codePreview,
        { type: 'text', value: '\n\n' },
        { type: 'html', value: '</rocket-js-demo>' },
      ];
      // root nodes don't have values
      // @ts-ignore
      delete node.value;
      delete node.lang;
      delete node.meta;
      demo = { name, code, node: rootNode };
    }
  };

  /**
   * @param {import('unist').Node} tree
   * @param {import('vfile').VFile} file
   */
  return async function (tree, file) {
    await init;
    visit(tree, 'code', visitor);
    if (!file.data) {
      file.data = {};
    }

    if (demo) {
      Object.assign(tree, demo?.node);
      const code = /** @type {{client: string}} */ (file.data?.code);
      // @ts-ignore
      file.data.code.client = [
        '// client code',
        code.client + ';',
        '// demo code',
        demo.code + ';',
        '// demo setup code',
        `const element = document.querySelector(\`rocket-js-demo[demo-name="${demo.name}"]\`);`,
        `element.demo = ${demo.name};`,
        'import("@rocket/js/define/RocketJsDemo.js");',
      ].join('\n');
    }

    return tree;
  };
}

function captureCodeBlockData() {
  /** @type {import('unist-util-visit').Visitor} */
  const visitor = _node => {
    const node = /** @type {import('mdast').Code} */ (_node);
    const label = parseCodeBlockLabel(node.meta);
    node.data = node.data || {};
    node.data.hProperties = {
      ...node.data.hProperties,
      ...(node.meta ? { metastring: node.meta } : {}),
      'data-rocket-code-label': label || '',
      'data-rocket-code-language': node.lang || '',
      'data-rocket-code-encoded': Buffer.from(node.value, 'utf8').toString('base64'),
    };
  };

  /**
   * @param {import('unist').Node} tree
   */
  return function (tree) {
    visit(tree, 'code', visitor);
    return tree;
  };
}

/**
 * @param {string | null | undefined} meta
 */
function parseCodeBlockLabel(meta) {
  if (!meta) {
    return undefined;
  }
  return /(?:^|\s)label="([^"]+)"/.exec(meta)?.[1];
}

/**
 * @param {string} value
 */
function escapeFenceAttribute(value) {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

/**
 * @param {string} value
 */
function escapeHtml(value) {
  return value.replace(/[&<>"'`$\\]/g, char => htmlEscapes[char]);
}

/**
 * @param {string} value
 */
function escapeHtmlAttribute(value) {
  return escapeHtml(value);
}

/** @type {Record<string, string>} */
const htmlEscapes = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '`': '&#96;',
  $: '&#36;',
  '\\': '&#92;',
};

function wrapCodeBlocks() {
  /** @type {import('unist-util-visit').Visitor} */
  const visitor = (_node, index, _parent) => {
    const pre = /** @type {import('hast').Element} */ (_node);
    const parent = /** @type {import('hast').Element} */ (_parent);
    const code = pre.children.find(child => child.type === 'element' && child.tagName === 'code');
    if (!code || code.type !== 'element') {
      return;
    }

    delete code.properties.metastring;
    const label = readStringProperty(
      code.properties['data-rocket-code-label'] ?? code.properties.dataRocketCodeLabel,
    );
    const encodedCode = readStringProperty(
      code.properties['data-rocket-code-encoded'] ?? code.properties.dataRocketCodeEncoded,
    );
    if (encodedCode === undefined || index === undefined) {
      return;
    }

    const language = readStringProperty(
      code.properties['data-rocket-code-language'] ?? code.properties.dataRocketCodeLanguage,
    );
    delete code.properties['data-rocket-code-label'];
    delete code.properties.dataRocketCodeLabel;
    delete code.properties['data-rocket-code-language'];
    delete code.properties.dataRocketCodeLanguage;
    delete code.properties['data-rocket-code-encoded'];
    delete code.properties.dataRocketCodeEncoded;

    const properties = {
      ...(label ? { label } : {}),
      ...(language ? { language } : {}),
      'encoded-code': encodedCode,
    };

    parent.children[index] = {
      type: 'element',
      tagName: 'rocket-code-block',
      properties,
      children: [pre],
    };
  };

  /**
   * @param {import('unist').Node} tree
   * @returns {import('unist').Node}
   */
  return function (tree) {
    visit(tree, { type: 'element', tagName: 'pre' }, visitor);
    return tree;
  };
}

/**
 * @param {unknown} value
 */
function readStringProperty(value) {
  if (Array.isArray(value)) {
    return value.join(' ');
  }
  return typeof value === 'string' ? value : undefined;
}

/**
 * @param {string} string
 * @returns {string}
 */
function escapeOutsideTemplates(string) {
  let result = '';
  let templateLevels = 0;
  for (let i = 0; i < string.length; i++) {
    if (string[i] === '$' && string[i + 1] === '{' && string[i - 1] !== '\\') {
      templateLevels++;
    } else if (templateLevels && string[i] === '}') {
      templateLevels--;
    }
    if (templateLevels) {
      result += string[i];
    } else {
      result += string[i].replace('\\', '\\\\').replace('`', '\\`');
    }
  }

  return result;
}

function escapeRocketMd() {
  /** @type {import('unist-util-visit').Visitor} */
  const visitor = _node => {
    const node = /** @type {import('mdast').Text} */ (_node);
    if (node.type === 'text' && typeof node.value === 'string') {
      node.value = escapeOutsideTemplates(node.value);
    }
  };

  /**
   * @param {import('unist').Node} tree
   */
  return function (tree) {
    visit(tree, 'text', visitor);
    return tree;
  };
}

function fixImageTags() {
  /** @type {import('unist-util-visit').Visitor} */
  const visitor = _node => {
    const node = /** @type {import('hast').Element} */ (_node);
    if (node.type === 'element' && node.tagName === 'img') {
      const props = node.properties || {};
      const src = typeof props.src === 'string' ? decodeURIComponent(props.src) : props.src;

      node.properties = { ...props, src };
    }
  };

  /**
   * @param {import('unist').Node} tree
   */
  return function (tree) {
    visit(tree, 'element', visitor);
    return tree;
  };
}

/**
 * visits all 'pre > code' elements and escapes any text inside
 */
function escapeCodeBlocks() {
  /** @type {import('unist-util-visit').Visitor} */
  const visitor = (_node, _, _parent) => {
    const node = /** @type {import('hast').Element} */ (_node);
    const parent = /** @type {import('hast').Element} */ (_parent);
    if (parent?.type === 'element' && parent.tagName === 'pre') {
      visit(node, 'text', replacer);
    }
  };

  /** @type {import('unist-util-visit').Visitor} */
  const replacer = _node => {
    const node = /** @type {import('hast').Text} */ (_node);
    if (typeof node.value !== 'string') {
      return;
    }
    node.value = node.value.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
  };

  /**
   * @param {import('unist').Node} tree
   * @returns {import('unist').Node}
   */
  return function (tree) {
    visit(tree, { type: 'element', tagName: 'code' }, visitor);
    return tree;
  };
}

function extractHeadings() {
  /** @type {import('@rocket/js/types.js').Headline[]} */
  const headings = [];

  /** @type {import('unist-util-visit').Visitor} */
  const visitor = _node => {
    const node = /** @type {import('hast').Element} */ (_node);
    if ('menu-exclude' in node.properties) {
      return;
    }
    const match = node.tagName.match(/h([1-6])/);
    const text = /** @type {string} */ (
      node.properties['link-text'] ||
        node.children.find(child => child.type === 'text')?.value ||
        ''
    );
    if (match) {
      const id = node.properties?.id;
      if (typeof id === 'string') {
        headings.push({ id, level: parseInt(match[1]), text });
      }
    }
  };

  /**
   * @param {import('unist').Node} tree
   * @param {import('vfile').VFile} file
   */
  return function (tree, file) {
    visit(tree, { type: 'element' }, visitor);
    file.data.headings = headings;
    return tree;
  };
}
