/* eslint-disable @typescript-eslint/ban-ts-comment */
const path = require('path');
const slash = require('slash');
const fs = require('fs');
const { mdjsProcess } = require('@mdjs/core');
const visit = require('unist-util-visit');
const { init, parse } = require('es-module-lexer');
const markdown = require('remark-parse');

// @ts-ignore
const { parseTitle } = require('@rocket/core/title');

/** @typedef {import('@mdjs/core').MdjsProcessPlugin} MdjsProcessPlugin */
/** @typedef {import('../types/code').EleventyPluginMdjsUnified} EleventyPluginMdjsUnified */
/** @typedef {import('../types/code').NodeChildren} NodeChildren */
/** @typedef {import('../types/code').NodeElement} NodeElement */
/** @typedef {import('unist').Node} Node */

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
  if (plugins.findIndex(pluginObj => pluginObj.plugin === cleanupTitleHeadline) === -1) {
    // add plugins right after markdown
    const markdownPluginIndex = plugins.findIndex(pluginObj => pluginObj.plugin === markdown);
    plugins.splice(markdownPluginIndex + 1, 0, {
      plugin: cleanupTitleHeadline,
      options: {},
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
        } else if (importSrc.startsWith('`./')) {
          newSource += '`.' + importSrc.substring(1);
        } else if (importSrc.startsWith('../')) {
          newSource += '../' + importSrc;
        } else if (importSrc.startsWith("'../")) {
          newSource += "'../" + importSrc.substring(1);
        } else if (importSrc.startsWith('`../')) {
          newSource += '`../' + importSrc.substring(1);
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
 * @param {EleventyPluginMdjsUnified} pluginOptions
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
          plugin.options.rocketConfig = eleventySettings.rocketConfig;
        } else {
          plugin.options = {
            page: eleventySettings.page,
            rocketConfig: eleventySettings.rocketConfig,
          };
        }
        return plugin;
      });
    }

    // @ts-ignore
    const result = await mdjsProcess(mdjs, {
      setupUnifiedPlugins: [
        addCleanupTitleHeadline,
        ...userSetupUnifiedPlugins,
        addEleventyPageToEveryPlugin,
      ],
    });

    result.jsCode = await processImports(result.jsCode, eleventySettings.page.inputPath);

    let code = result.html;
    if (result.jsCode) {
      const newFolder = path.dirname(eleventySettings.page.outputPath);
      const newName = path.join(newFolder, '__mdjs-stories.js');
      await fs.promises.mkdir(newFolder, { recursive: true });
      await fs.promises.writeFile(newName, result.jsCode, 'utf8');

      let scriptUrl = eleventySettings.page.url;
      if (
        eleventySettings.rocketConfig &&
        eleventySettings.rocketConfig.command === 'build' &&
        eleventySettings.rocketConfig.pathPrefix
      ) {
        scriptUrl = slash(
          path.join(eleventySettings.rocketConfig.pathPrefix, eleventySettings.page.url),
        );
      }
      code += `
        <script type="module" src="${scriptUrl}__mdjs-stories.js" mdjs-setup></script>
      `;
    }
    return code;
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
 * @param {EleventyPluginMdjsUnified} [pluginOptions]
 */
function configFunction(eleventyConfig, pluginOptions = {}) {
  eleventyConfig.setLibrary('md', eleventyUnified(pluginOptions));
}

const EleventyPluginMdjsUnified = {
  initArguments: {},
  configFunction,
};

module.exports = EleventyPluginMdjsUnified;
