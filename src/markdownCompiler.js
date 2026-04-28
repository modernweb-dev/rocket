/** Runs on: import-hook and build */
import markdown from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';
import { extractMdCode } from './extractCode.js';
import { mdToJs, mdToJsSingleDemo } from './transform.js';
import { init, parse as parseExports } from 'es-module-lexer';
import ts from 'typescript';
import { parseRequestDemoMetadata } from './requestDemoMetadata.js';

/**
 * @param {string} source
 * @returns {Promise<string>}
 */
export async function compileMarkdownSetup(source) {
  const result = await unified()
    .use(markdown)
    .use(extractMdCode('server'))
    .use(extractPageLocalCustomElementTags)
    .use(extractDemoNames)
    .use(validateRequestDemos)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(extractCustomElementTags)
    .use(getTitle)
    .use(compileToServerCode)
    .process(source);
  const code = /** @type {{server: string}} */ (result.data.code);
  return code.server;
}

/**
 * @param {string} source
 * @param {{singleDemo?: string}} [options]
 * @returns {Promise<string>}
 */
export async function compileMarkdownLoad(source, { singleDemo } = {}) {
  if (singleDemo) {
    return mdToJsSingleDemo(source, singleDemo);
  }
  return mdToJs(source);
}

/**
 * @returns {import('vite').Plugin}
 */
export function rocketMarkdownPlugin() {
  return {
    name: 'rocket-markdown',
    async transform(source, id) {
      const importOptions = markdownImportOptions(id);
      if (!importOptions) {
        return;
      }
      return {
        code: await compileMarkdownLoad(source, { singleDemo: importOptions.singleDemo }),
        map: null,
      };
    },
  };
}

/**
 * @param {string} id
 * @returns {{ singleDemo?: string } | null}
 */
function markdownImportOptions(id) {
  const queryIndex = id.indexOf('?');
  const file = queryIndex === -1 ? id : id.slice(0, queryIndex);
  if (!file.endsWith('.rocket.md')) {
    return null;
  }
  const query = queryIndex === -1 ? '' : id.slice(queryIndex + 1);
  return {
    singleDemo: new URLSearchParams(query).get('rocketSingleDemo') || undefined,
  };
}

/**
 * Only output server code
 * @typedef {import('unist').Node} Node
 * @this {import('unified').Processor}
 * @type {import('unified').Plugin<[import("unist-util-remove").Options?]|Array<void>, Node, string>}
 */
function compileToServerCode() {
  Object.assign(this, { Compiler: compiler });

  /**
   * @type {import('unified').Compiler}
   */
  function compiler(_, file) {
    const code = /** @type {{server: string}} */ (file.data.code);
    return code.server;
  }
}

function getTitle() {
  /** @type {string | undefined} */
  let h1Text,
    /** @type {string | undefined} */
    h1LinkText = undefined;
  /** @type {import('unist-util-visit').Visitor} */
  const visitor = _node => {
    const node = /** @type {import('hast').Element} */ (_node);
    if (typeof node.properties['link-text'] === 'string') {
      h1LinkText = node.properties['link-text'];
    }
    let text = '';
    visit(node, 'text', node => {
      text += node.value;
    });
    if (h1Text !== undefined) {
      throw new Error('Multiple h1 elements found:\n - ' + h1Text + '\n - ' + text);
    }
    h1Text = text;
  };

  /**
   * @param {import('unist').Node} tree
   * @param {import('vfile').VFile} file
   */
  return function (tree, file) {
    visit(tree, { type: 'element', tagName: 'h1' }, visitor);
    const code = /** @type {{server: string}} */ (file.data.code);
    const demoNames = /** @type {string[] | undefined} */ (file.data.demoNames) || [];
    const customElementTags =
      /** @type {string[] | undefined} */ (file.data.customElementTags) || [];
    const pageLocalCustomElementTags =
      /** @type {string[] | undefined} */ (file.data.pageLocalCustomElementTags) || [];
    code.server += `;
    export const _$title$ = ${JSON.stringify(h1Text)};
    export const _$menuLinkText$ = ${JSON.stringify(h1LinkText)};
    export const _$demoNames$ = ${JSON.stringify(demoNames)};
    export const _$customElementTags$ = ${JSON.stringify(customElementTags)};
    export const _$pageLocalCustomElementTags$ = ${JSON.stringify(pageLocalCustomElementTags)};
    `;
    return tree;
  };
}

function extractPageLocalCustomElementTags() {
  /** @type {Set<string>} */
  const pageLocalCustomElementTags = new Set();

  /** @type {import('unist-util-visit').Visitor} */
  const visitor = _node => {
    const node = /** @type {import('mdast').Code} */ (_node);
    if (node.lang === 'js' && node.meta === 'client' && typeof node.value === 'string') {
      for (const tag of parseCustomElementDefineTags(node.value)) {
        pageLocalCustomElementTags.add(tag);
      }
    }
  };

  /**
   * @param {import('unist').Node} tree
   * @param {import('vfile').VFile} file
   */
  return function (tree, file) {
    visit(tree, 'code', visitor);
    file.data.pageLocalCustomElementTags = [...pageLocalCustomElementTags].sort();
    return tree;
  };
}

/**
 * @param {string} code
 * @returns {string[]}
 */
function parseCustomElementDefineTags(code) {
  const sourceFile = ts.createSourceFile(
    'page-client.js',
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.JS,
  );
  /** @type {Set<string>} */
  const tags = new Set();

  /**
   * @param {import('typescript').Node} node
   */
  function visitNode(node) {
    const tag = readCustomElementDefineTag(node);
    if (tag) {
      tags.add(tag);
    }
    ts.forEachChild(node, visitNode);
  }

  visitNode(sourceFile);
  return [...tags].sort();
}

/**
 * @param {import('typescript').Node} node
 * @returns {string | undefined}
 */
function readCustomElementDefineTag(node) {
  if (!ts.isCallExpression(node)) {
    return;
  }
  const callTarget = node.expression;
  if (!ts.isPropertyAccessExpression(callTarget) || callTarget.name.text !== 'define') {
    return;
  }
  const receiver = callTarget.expression;
  if (!ts.isIdentifier(receiver) || receiver.text !== 'customElements') {
    return;
  }
  const [tagArgument] = node.arguments;
  if (!isLiteralTagName(tagArgument)) {
    return;
  }
  return tagArgument.text.includes('-') ? tagArgument.text : undefined;
}

/**
 * @param {import('typescript').Node | undefined} node
 * @returns {node is import('typescript').StringLiteral | import('typescript').NoSubstitutionTemplateLiteral}
 */
function isLiteralTagName(node) {
  return (
    node !== undefined && (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node))
  );
}

function extractDemoNames() {
  /** @type {string[]} */
  const demoNames = [];

  /** @type {import('unist-util-visit').Visitor} */
  const visitor = _node => {
    const node = /** @type {import('mdast').Code} */ (_node);
    if (node.lang === 'js' && node.meta === 'demo' && typeof node.value === 'string') {
      for (const exported of parseExports(node.value)[1]) {
        demoNames.push(exported.ln || exported.n);
      }
    }
  };

  /**
   * @param {import('unist').Node} tree
   * @param {import('vfile').VFile} file
   */
  return async function (tree, file) {
    await init;
    visit(tree, 'code', visitor);
    file.data.demoNames = demoNames;
    return tree;
  };
}

function validateRequestDemos() {
  /** @type {import('unist-util-visit').Visitor} */
  const visitor = _node => {
    const node = /** @type {import('mdast').Code} */ (_node);
    if (isRequestDemoCodeNode(node)) {
      parseRequestDemoMetadata(node.meta);
    }
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

function extractCustomElementTags() {
  /** @type {Set<string>} */
  const customElementTags = new Set();

  /** @type {import('unist-util-visit').Visitor} */
  const visitor = _node => {
    const node = /** @type {import('hast').Element} */ (_node);
    if (node.tagName.includes('-')) {
      customElementTags.add(node.tagName);
    }
  };

  /**
   * @param {import('unist').Node} tree
   * @param {import('vfile').VFile} file
   */
  return function (tree, file) {
    visit(tree, 'element', visitor);
    file.data.customElementTags = [...customElementTags].sort();
    return tree;
  };
}
