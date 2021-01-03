/* eslint-disable @typescript-eslint/ban-ts-comment */
const { mdjsProcess } = require('@mdjs/core');
const visit = require('unist-util-visit');
const { init, parse } = require('es-module-lexer');

// @ts-ignore
const { parseTitle } = require('@rocket/core/title');

/** @typedef {import('@mdjs/core').MdjsProcessPlugin} MdjsProcessPlugin */
/** @typedef {import('../types/code').EleventPluginMdjsUnified} EleventPluginMdjsUnified */
/** @typedef {import('../types/code').NodeChildren} NodeChildren */
/** @typedef {import('../types/code').NodeElement} NodeElement */
/** @typedef {import('unist').Node} Node */

/**
 * @param {string} link
 */
function isInternalLink(link) {
  if (link.startsWith('http') || link.startsWith('/')) {
    return false;
  }
  return true;
}

/**
 * @param {*} pluginOptions
 */
function adjustLinks(pluginOptions) {
  /**
   * @param {NodeElement} node
   */
  const elementVisitor = node => {
    if (node.tagName === 'a') {
      const fullHref = node.properties && node.properties.href ? node.properties.href : undefined;
      if (fullHref) {
        const [href, anchor] = fullHref.split('#');
        const suffix = anchor ? `#${anchor}` : '';
        const { inputPath } = pluginOptions.page;

        if (isInternalLink(href) && href.endsWith('.md')) {
          if (href.endsWith('index.md')) {
            node.properties.href = `${href.substring(0, href.lastIndexOf('/') + 1)}${suffix}`;
          } else {
            node.properties.href = `${href.substring(0, href.length - 3)}/${suffix}`;
          }

          if (inputPath.endsWith('.md')) {
            if (inputPath.endsWith('index.md')) {
              // nothing
            } else {
              node.properties.href = `../${node.properties.href}`;
            }
          }
        }
      }
    }
  };

  /**
   * @param {Node} tree
   */
  function transformer(tree) {
    visit(tree, 'element', elementVisitor);
    return tree;
  }

  return transformer;
}

function cleanupTitleHeadline() {
  /**
   * @param {NodeChildren} node
   */
  const headingVisitor = node => {
    if (node.depth === 1) {
      if (node.children && node.children.length === 1) {
        const data = parseTitle(node.children[0].value);
        if (data) {
          node.children[0].value = data.title;
        }
      }
    }
  };

  /**
   * @param {Node} tree
   */
  function transformer(tree) {
    visit(tree, 'heading', headingVisitor);
    return tree;
  }

  return transformer;
}

/**
 * @param {MdjsProcessPlugin[]} plugins
 */
function addCleanupTitleHeadline(plugins) {
  if (plugins.findIndex(plugin => plugin.name === 'cleanupTitleHeadline') === -1) {
    // add plugins right after markdown
    const markdownPluginIndex = plugins.findIndex(plugin => plugin.name === 'markdown');
    plugins.splice(markdownPluginIndex + 1, 0, {
      name: 'cleanupTitleHeadline',
      plugin: cleanupTitleHeadline,
    });
  }
  return plugins;
}

/**
 * @param {MdjsProcessPlugin[]} plugins
 */
function addAdjustLinksForEleventy(plugins) {
  if (plugins.findIndex(plugin => plugin.name === 'adjustLinks') === -1) {
    // add plugins right after remark2rehype
    const remark2rehypePluginIndex = plugins.findIndex(plugin => plugin.name === 'remark2rehype');
    plugins.splice(remark2rehypePluginIndex + 1, 0, {
      name: 'adjustLinks',
      plugin: adjustLinks,
    });
  }
  return plugins;
}

/**
 * @param {string} source
 * @param {string} inputPath
 */
async function processImports(source, inputPath) {
  if (!inputPath.endsWith('index.md')) {
    if (source !== '' && source.includes('import')) {
      let newSource = '';
      let lastPos = 0;
      await init;
      const [imports] = parse(source);
      for (const importObj of imports) {
        newSource += source.substring(lastPos, importObj.s);
        const importSrc = source.substring(importObj.s, importObj.e);

        if (importSrc.startsWith('./')) {
          newSource += '.' + importSrc;
        } else if (importSrc.startsWith("'./")) {
          newSource += "'." + importSrc.substring(1);
        } else if (importSrc.startsWith('../')) {
          newSource += '../' + importSrc;
        } else if (importSrc.startsWith("'../")) {
          newSource += "'../" + importSrc.substring(1);
        } else {
          newSource += importSrc;
        }
        lastPos = importObj.e;
      }
      newSource += source.substring(lastPos, source.length);
      return newSource;
    }
  }
  return source;
}

/**
 * @param {EleventPluginMdjsUnified} pluginOptions
 */
function eleventyUnified(pluginOptions) {
  /**
   * @param {string} mdjs
   * @param {*} eleventySettings
   */
  async function render(mdjs, eleventySettings) {
    /** @type {function[]} */
    let userSetupUnifiedPlugins = [];
    if (pluginOptions.setupUnifiedPlugins) {
      if (typeof pluginOptions.setupUnifiedPlugins === 'function') {
        userSetupUnifiedPlugins = [pluginOptions.setupUnifiedPlugins];
      }
      if (Array.isArray(pluginOptions.setupUnifiedPlugins)) {
        userSetupUnifiedPlugins = pluginOptions.setupUnifiedPlugins;
      }
    }

    /**
     * @param {MdjsProcessPlugin[]} plugins
     */
    function addEleventyPageToEveryPlugin(plugins) {
      return plugins.map(plugin => {
        if (plugin.options) {
          plugin.options.page = eleventySettings.page;
        } else {
          plugin.options = { page: eleventySettings.page };
        }
        return plugin;
      });
    }

    // @ts-ignore
    const result = await mdjsProcess(mdjs, {
      setupUnifiedPlugins: [
        addCleanupTitleHeadline,
        addAdjustLinksForEleventy,
        ...userSetupUnifiedPlugins,
        addEleventyPageToEveryPlugin,
      ],
    });

    result.jsCode = await processImports(result.jsCode, eleventySettings.page.inputPath);

    return result;
  }
  return {
    set: () => {
      // do nothing
    },
    render,
  };
}

/**
 * @param {*} eleventyConfig
 * @param {EleventPluginMdjsUnified} [pluginOptions]
 */
function configFunction(eleventyConfig, pluginOptions = {}) {
  eleventyConfig.setLibrary('md', eleventyUnified(pluginOptions));
}

const eleventPluginMdjsUnified = {
  initArguments: {},
  configFunction,
};

module.exports = eleventPluginMdjsUnified;
