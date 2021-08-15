/* eslint-disable @typescript-eslint/ban-ts-comment */

/** @typedef {import('../types/main').WebMenuCliOptions} WebMenuCliOptions */
/** @typedef {import('../types/main').MetaPluginMenu} MetaPluginMenu */

import path from 'path';
import { cyan, green, red } from 'colorette';
import { Command } from 'commander/esm.mjs';

import { applyPlugins } from 'plugins-manager';

import { buildTree } from './buildTree.js';
import { insertMenus } from './insertMenus.js';
import { writeTreeToFileSystem } from './writeTreeToFileSystem.js';

import { Site } from './menus/Site.js';
import { Breadcrumb } from './menus/Breadcrumb.js';
import { Next } from './menus/Next.js';
import { Previous } from './menus/Previous.js';
import { ArticleOverview } from './menus/ArticleOverview.js';
import { IndexMenu } from './menus/IndexMenu.js';
import { TableOfContents } from './menus/TableOfContents.js';

/** @type {MetaPluginMenu[]} */
const defaultPlugins = [
  { plugin: Site, options: {} },
  { plugin: Breadcrumb, options: {}  },
  { plugin: Next, options: {}  },
  { plugin: IndexMenu, options: {}  },
  { plugin: Previous, options: {}  },
  { plugin: ArticleOverview, options: {}  },
  { plugin: TableOfContents, options: {}  },
];

const program = new Command();

export class WebMenuCli {
  /** @type {WebMenuCliOptions} */
  options = {
    docsDir: process.cwd(),
    setupPlugins: [],
  };

  constructor({ argv } = { argv: undefined }) {
    program
      .option('-d, --docs-dir <path>', 'path to where to search for source files')
      .option('-c, --config-file <path>', 'path to config file');

    program.parse(argv);
    this.setOptions(program.opts());
  }

  /**
   * @param {Partial<WebMenuCliOptions>} newOptions
   */
  setOptions(newOptions) {
    const setupPlugins = newOptions.setupPlugins
      ? [...this.options.setupPlugins, ...newOptions.setupPlugins]
      : this.options.setupPlugins;

    this.options = {
      ...this.options,
      ...newOptions,
      setupPlugins,
    };
  }

  async applyConfigFile() {
    if (this.options.configFile) {
      const configFilePath = path.resolve(this.options.configFile);
      const fileOptions = (await import(configFilePath)).default;
      if (fileOptions.docsDir) {
        fileOptions.docsDir = path.join(path.dirname(configFilePath), fileOptions.docsDir);
      }
      this.setOptions(fileOptions);
    }
  }

  async run() {
    await this.applyConfigFile();

    this.options = applyPlugins(this.options, defaultPlugins);

    const { docsDir: userDocsDir, outputDir: userOutputDir } = this.options;
    this.docsDir = userDocsDir ? path.resolve(userDocsDir) : this.docsDir;
    this.outputDir = userOutputDir
      ? path.resolve(userOutputDir)
      : path.join(this.docsDir, '..', '_site');
    const performanceStart = process.hrtime();

    const relPath = path.relative(process.cwd(), this.docsDir);
    console.log(`👀 Analyzing file tree at ${cyan(relPath)}`);
    const tree = await buildTree(this.docsDir);
    if (!tree) {
      console.error(red(`💥 Error: Could not find any pages at ${cyan(this.docsDir)}.`));
      process.exit(1);
    }

    console.log(`📖 Found ${green(tree.all().length)} pages`);

    const { counter } = await insertMenus(tree, this.options);
    console.log(`📝 Inserted ${green(counter.toString())} menus!`);

    console.log(`✍️  Writing files to ${cyan(path.relative(process.cwd(), this.outputDir))} ...`);
    await writeTreeToFileSystem(tree, this.outputDir);

    const performance = process.hrtime(performanceStart);
    console.log(
      `✅ Menus inserted and written to filesystem. (executed in ${performance[0]}s ${
        performance[1] / 1000000
      }ms)`,
    );
  }
}
