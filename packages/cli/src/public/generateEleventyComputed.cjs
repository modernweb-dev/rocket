const fs = require('fs');
const path = require('path');
const { processContentWithTitle } = require('@rocket/core/title');
const { createSocialImage: defaultcreateSocialImage } = require('./createSocialImage.cjs');
const { getComputedConfig } = require('./computedConfig.cjs');
const { executeSetupFunctions } = require('plugins-manager');

function titleMetaPlugin() {
  return async data => {
    if (data.titleMeta) {
      return data.titleMeta;
    }
    let text = await fs.promises.readFile(data.page.inputPath);
    text = text.toString();
    const titleMetaFromContent = processContentWithTitle(text, 'md');
    if (titleMetaFromContent) {
      return titleMetaFromContent;
    }
    return {};
  };
}

function titlePlugin() {
  return async data => {
    if (data.title) {
      return data.title;
    }
    return data.titleMeta?.title;
  };
}

function eleventyNavigationPlugin() {
  return async data => {
    if (data.eleventyNavigation) {
      return data.eleventyNavigation;
    }
    return data.titleMeta?.eleventyNavigation;
  };
}

function sectionPlugin() {
  return async data => {
    if (data.section) {
      return data.section;
    }

    if (data.page.filePathStem) {
      // filePathStem: '/sub/subsub/index'
      // filePathStem: '/index',
      const parts = data.page.filePathStem.split('/');
      if (parts.length > 2) {
        return parts[1];
      }
    }
  };
}

function layoutPlugin({ defaultLayout = 'layout-default' } = {}) {
  return async data => {
    if (data.layout) {
      return data.layout;
    }
    if (data.page.filePathStem) {
      const parts = data.page.filePathStem.split('/');
      if (parts[parts.length - 1] === 'index') {
        return 'layout-index';
      }
    }
    return defaultLayout;
  };
}

function socialMediaImagePlugin(args = {}) {
  const { createSocialImage = defaultcreateSocialImage } = args;

  const cleanedUpArgs = { ...args };
  delete cleanedUpArgs.createSocialImage;

  return async data => {
    if (data.socialMediaImage) {
      return data.socialMediaImage;
    }
    if (!data.title) {
      return;
    }

    const title = data.titleMeta.parts ? data.titleMeta.parts[0] : '';
    const subTitle =
      data.titleMeta.parts && data.titleMeta.parts[1] ? `in ${data.titleMeta.parts[1]}` : '';
    const section = data.section ? ' ' + data.section[0].toUpperCase() + data.section.slice(1) : '';
    const footer = `${data.site.name}${section}`;

    const imgUrl = await createSocialImage({
      title,
      subTitle,
      footer,
      section,
      ...cleanedUpArgs,
    });
    return imgUrl;
  };
}

function sortyByOrder(a, b) {
  if (a.order > b.order) {
    return 1;
  }
  if (a.order < b.order) {
    return -1;
  }
  return 0;
}

async function dirToTree(sourcePath, extra = '') {
  const pattern = /(\d+)-(.*)/i;
  const dirPath = path.resolve(sourcePath, extra);
  const unsortedEntries = [];
  const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const relativePath = path.join(extra, entry.name);
    const matches = entry.name.match(pattern);
    if (entry.isDirectory()) {
      const value = await dirToTree(sourcePath, relativePath);
      unsortedEntries.push({
        order: matches && matches.length > 0 ? parseInt(matches[1]) : 0,
        name: entry.name,
        value,
      });
    } else {
      unsortedEntries.push({
        order: matches && matches.length > 0 ? parseInt(matches[1]) : 0,
        name: entry.name,
        value: relativePath,
      });
    }
  }
  const sortedTree = {};
  for (const unsortedEntry of unsortedEntries.sort(sortyByOrder)) {
    sortedTree[unsortedEntry.name] = unsortedEntry.value;
  }
  return sortedTree;
}

function templateBlocksPlugin(rocketConfig) {
  const { _inputDirCwdRelative } = rocketConfig;
  const partialsSource = path.resolve(_inputDirCwdRelative, '_merged_includes');
  return async () => {
    const templateBlocks = await dirToTree(partialsSource);
    return templateBlocks;
  };
}

function generateEleventyComputed() {
  const rocketConfig = getComputedConfig();

  let metaPlugins = [
    { name: 'titleMeta', plugin: titleMetaPlugin },
    { name: 'title', plugin: titlePlugin },
    { name: 'eleventyNavigation', plugin: eleventyNavigationPlugin },
    { name: 'section', plugin: sectionPlugin },
    { name: 'socialMediaImage', plugin: socialMediaImagePlugin },
    { name: 'templateBlocks', plugin: templateBlocksPlugin, options: rocketConfig },
    { name: 'layout', plugin: layoutPlugin },
  ];

  const finalMetaPlugins = executeSetupFunctions(
    rocketConfig.setupEleventyComputedConfig,
    metaPlugins,
  );

  const eleventyComputed = {};
  for (const pluginObj of finalMetaPlugins) {
    if (pluginObj.options) {
      eleventyComputed[pluginObj.name] = pluginObj.plugin(pluginObj.options);
    } else {
      eleventyComputed[pluginObj.name] = pluginObj.plugin();
    }
  }

  return eleventyComputed;
}

module.exports = { generateEleventyComputed };
