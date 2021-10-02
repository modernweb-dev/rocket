const fs = require('fs');
const path = require('path');
const { processContentWithTitle } = require('@rocket/core/title');
const { createSocialImage: defaultCreateSocialImage } = require('./createSocialImage.cjs');
const { getComputedConfig } = require('./computedConfig.cjs');
const { executeSetupFunctions } = require('plugins-manager');

class TitleMetaPlugin {
  static dataName = 'titleMeta';

  async execute(data) {
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
  }
}

class TitlePlugin {
  static dataName = 'title';

  async execute(data) {
    if (data.title) {
      return data.title;
    }
    return data.titleMeta?.title;
  }
}

class EleventyNavigationPlugin {
  static dataName = 'eleventyNavigation';

  async execute(data) {
    if (data.eleventyNavigation) {
      return data.eleventyNavigation;
    }
    return data.titleMeta?.eleventyNavigation;
  }
}

class SectionPlugin {
  static dataName = 'section';

  async execute(data) {
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
  }
}

class LayoutPlugin {
  static dataName = 'layout';

  constructor({ defaultLayout = 'layout-default' } = {}) {
    this.defaultLayout = defaultLayout;
  }

  async execute(data) {
    if (data.layout) {
      return data.layout;
    }
    if (data.page.filePathStem) {
      const parts = data.page.filePathStem.split('/');
      if (parts[parts.length - 1] === 'index') {
        return 'layout-index';
      }
    }
    return this.defaultLayout;
  }
}

class SocialMediaImagePlugin {
  static dataName = 'socialMediaImage';

  constructor(args = {}) {
    const { createSocialImage = defaultCreateSocialImage, rocketConfig = {} } = args;

    this.cleanedUpArgs = { ...args };
    delete this.cleanedUpArgs.createSocialImage;

    this.rocketConfig = rocketConfig;
    this.createSocialImage = createSocialImage;
  }

  async execute(data) {
    if (data.socialMediaImage) {
      return data.socialMediaImage;
    }

    if (this.rocketConfig.createSocialMediaImages === false) {
      return;
    }

    if (!data.title) {
      return;
    }

    const title = data.titleMeta.parts ? data.titleMeta.parts[0] : '';
    const subTitle =
      data.titleMeta.parts && data.titleMeta.parts[1] ? `in ${data.titleMeta.parts[1]}` : '';
    const section = data.section ? ' ' + data.section[0].toUpperCase() + data.section.slice(1) : '';
    const footer = `${data.site.name}${section}`;

    const imgUrl = await this.createSocialImage({
      title,
      subTitle,
      footer,
      section,
      ...this.cleanedUpArgs,
    });
    return imgUrl;
  }
}

function sortByOrder(a, b) {
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
        order: matches && matches.length > 0 ? parseInt(matches[1]) : 10000,
        name: entry.name,
        value,
      });
    } else {
      unsortedEntries.push({
        order: matches && matches.length > 0 ? parseInt(matches[1]) : 10000,
        name: entry.name,
        value: relativePath,
      });
    }
  }
  const sortedTree = {};
  for (const unsortedEntry of unsortedEntries.sort(sortByOrder)) {
    sortedTree[unsortedEntry.name] = unsortedEntry.value;
  }
  return sortedTree;
}

class JoiningBlocksPlugin {
  static dataName = '_joiningBlocks';

  constructor(rocketConfig) {
    const { _inputDirCwdRelative } = rocketConfig;
    this.partialsSource = path.resolve(_inputDirCwdRelative, '_merged_includes');
  }

  async execute() {
    const joiningBlocks = await dirToTree(this.partialsSource, '_joiningBlocks');
    return joiningBlocks;
  }
}

function generateEleventyComputed() {
  const rocketConfig = getComputedConfig();

  let metaPlugins = [
    { plugin: TitleMetaPlugin, options: {} },
    { plugin: TitlePlugin, options: {} },
    { plugin: EleventyNavigationPlugin, options: {} },
    { plugin: SectionPlugin, options: {} },
    { plugin: SocialMediaImagePlugin, options: { rocketConfig } },
    { plugin: JoiningBlocksPlugin, options: rocketConfig },
    { plugin: LayoutPlugin, options: {} },
  ];

  const finalMetaPlugins = executeSetupFunctions(
    rocketConfig.setupEleventyComputedConfig,
    metaPlugins,
  );

  const eleventyComputed = {};
  for (const pluginObj of finalMetaPlugins) {
    if (pluginObj.options) {
      const inst = new pluginObj.plugin(pluginObj.options);
      eleventyComputed[inst.constructor.dataName] = inst.execute.bind(inst);
    } else {
      const inst = new pluginObj.plugin();
      eleventyComputed[inst.constructor.dataName] = inst.execute.bind(inst);
    }
  }

  return eleventyComputed;
}

module.exports = {
  generateEleventyComputed,
  LayoutPlugin,
  TitleMetaPlugin,
  TitlePlugin,
  EleventyNavigationPlugin,
  SectionPlugin,
  SocialMediaImagePlugin,
  JoiningBlocksPlugin,
};
