/* eslint-disable @typescript-eslint/ban-ts-comment */

/** @typedef {import('../types/main.js').FullCheckWebsiteCliOptions} FullCheckWebsiteCliOptions */
/** @typedef {import('../types/main.js').CheckWebsiteCliOptions} CheckWebsiteCliOptions */
/** @typedef {import('./assets/Asset.js').Asset} Asset */

import { EventEmitter } from 'events';
import path from 'path';
import { Command } from 'commander';
import { green, red, gray } from 'colorette';
import { gatherFiles } from './helpers/gatherFiles.js';
import { renderProgressBar } from './cli/renderProgressBar.js';
import { LocalReferencesPlugin } from './plugins/LocalReferencesPlugin.js';
// import { HasCanonicalPlugin } from './plugins/HasCanonicalPlugin.js';
import { ExternalReferencesPlugin } from './plugins/ExternalReferencesPlugin.js';
import { AssetManager } from './assets/AssetManager.js';
import { LitTerminal } from './cli/LitTerminal.js';
import { cli } from './cli/cli.js';
import { IssueManager } from './issues/IssueManager.js';
import { hr } from './cli/helpers.js';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { pathToFileURL } from 'url';
import { normalizeUrl } from './helpers/normalizeUrl.js';
import { HtmlPage } from './assets/HtmlPage.js';

export class CheckWebsiteCli extends LitTerminal {
  /** @type {FullCheckWebsiteCliOptions} */
  options = {
    configFile: '',
    inputDir: process.cwd(),
    originUrl: '',
    assetManager: new AssetManager(),
    issueManager: new IssueManager(),
    plugins: [],
  };

  /**
   * @readonly
   */
  events = new EventEmitter();

  constructor({ argv = process.argv } = {}) {
    super();
    this.argv = argv;

    this.program = new Command();
    this.program.allowUnknownOption().option('-c, --config-file <path>', 'path to config file');
    this.program.parse(this.argv);

    this.program.allowUnknownOption(false);

    if (this.program.opts().configFile) {
      this.options.configFile = this.program.opts().configFile;
    }

    this.program
      .option('-i, --input-dir <path>', 'path to where to search for source files')
      .action(async cliOptions => {
        this.setOptions(cliOptions);
      });

    this.options.plugins = [
      //
      new LocalReferencesPlugin(),
      // new HasCanonicalPlugin(),
      new ExternalReferencesPlugin(),
    ];

    /** @param {string} msg */
    this.options.issueManager.logger = msg => this.logStatic(msg);
  }

  /**
   * @param {Partial<CheckWebsiteCliOptions>} newOptions
   */
  setOptions(newOptions) {
    this.options = {
      ...this.options,
      ...newOptions,
    };
  }

  async applyConfigFile() {
    if (this.options.configFile) {
      const configFilePath = path.resolve(this.options.configFile);
      const fileOptions = (await import(configFilePath)).default;
      this.setOptions(fileOptions);
    } else {
      // make sure all default settings are properly initialized
      this.setOptions({});
    }
  }

  async execute() {
    super.execute();
    await this.applyConfigFile();
    // const inputDir = userInputDir ? path.resolve(userInputDir) : process.cwd();

    let entrypoint = path.join(this.options.inputDir, 'index.html');
    if (!existsSync(entrypoint)) {
      console.log(`Entrypoint ${entrypoint} does not exist`);
      process.exit(1);
    }
    if (!this.options.originUrl) {
      const entryHtml = await readFile(entrypoint, 'utf-8');
      const canonicalUrl = findCanonicalUrl(entryHtml);
      if (canonicalUrl) {
        this.options.originUrl = canonicalUrl;
      } else {
        console.log(`No canonical url found in ${entrypoint}`);
        process.exit(1);
      }
    }

    if (!this.options.isLocalUrl) {
      /** @param {string} url */
      this.options.isLocalUrl = url => {
        const normalizedUrl = normalizeUrl(url);
        return normalizedUrl.startsWith(this.options.originUrl);
      };
    }

    this.logStatic('🔎 Check Website');
    this.logStatic('');
    this.logStatic(`👀 Start crawling from ${green('index.html')}`);
    this.logStatic(`📄 Will follow all links within ${green(this.options.originUrl)}`);
    this.logStatic('');

    const onParseElementCallbacks = this.options.plugins
      .map(plugin => plugin.onParseElement)
      .filter(Boolean);

    this.options.assetManager = new AssetManager({
      originPath: this.options.inputDir,
      originUrl: this.options.originUrl,
      // TODO: fix type...
      // @ts-ignore
      onParseElementCallbacks,
      plugins: this.options.plugins,
      isLocalUrl: this.options.isLocalUrl,
    });
    const pluginsAndAssetManager = [...this.options.plugins, this.options.assetManager];

    this.options.assetManager.events.on('idle', () => {
      if (pluginsAndAssetManager.every(p => p.isIdle)) {
        this.updateComplete.then(() => {
          this.events.emit('done');
        });
      }
    });

    for (const plugin of this.options.plugins) {
      plugin.assetManager = this.options.assetManager;
      plugin.issueManager = this.options.issueManager;
      plugin.isLocalUrl = this.options.isLocalUrl;
      await plugin.setup(this);
      plugin.events.on('progress', () => {
        this.requestUpdate();
      });
      plugin.events.on('idle', () => {
        if (pluginsAndAssetManager.every(p => p.isIdle)) {
          this.updateComplete.then(() => {
            this.events.emit('done');
          });
        }
      });
    }

    const files = await gatherFiles(this.options.inputDir);
    if (files.length === 0) {
      console.log('🧐 No files to check. Did you select the correct folder?');
      process.exit(1);
    }

    for (const [, file] of files.entries()) {
      const fileUrl = pathToFileURL(file);
      this.options.assetManager.addExistingFile(fileUrl);
    }

    // start crawling at the main index.html
    const rootPage = this.options.assetManager.get(this.options.originUrl + '/index.html');
    if (rootPage && rootPage instanceof HtmlPage) {
      await rootPage.parse();
    }
  }

  renderParsing() {
    const title = `Parsing:`.padEnd(11);
    const total = this.options.assetManager.parsingQueue.getTotal();
    const doneNr = this.options.assetManager.parsingQueue.getDone();
    const duration = this.options.assetManager.parsingQueue.getDuration();
    const progress = renderProgressBar(doneNr, 0, total);
    const minNumberLength = `${total}`.length;
    const done = `${doneNr}`.padStart(minNumberLength);
    return `${title} ${progress} ${done}/${total} files | 🕑 ${duration}s`;
  }

  /**
   * @param {import('../types/main.js').PluginInterface} plugin
   * @returns {string}
   */
  renderPlugin(plugin) {
    const checkLabel = plugin.options.checkLabel;
    const doneNr = plugin.getDone();
    const passed = plugin.getPassed();
    const failed = plugin.getFailed();
    const skipped = plugin.getSkipped();
    const total = plugin.getTotal();

    const title = `${plugin.options.title}:`.padEnd(11);
    const progress = renderProgressBar(doneNr, 0, total);

    const minNumberLength = `${total}`.length;
    const done = `${doneNr}`.padStart(minNumberLength);

    const passedTxt = passed > 0 ? `${green(`${passed} passed`)}` : '0 passed';
    const failedTxt = failed > 0 ? `, ${red(`${failed} failed`)}` : '';
    const skippedTxt = skipped > 0 ? `, ${gray(`${skipped} skipped`)}` : '';
    const resultTxt = `${passedTxt}${failedTxt}${skippedTxt}`;
    const duration = plugin.getDuration();

    return `${title} ${progress} ${done}/${total} ${checkLabel} | 🕑 ${duration}s | ${resultTxt}`;
  }

  render() {
    return cli`
      \n${hr()}
      ${this.renderParsing()}
      ${this.options.plugins.map(plugin => this.renderPlugin(plugin)).join('\n')}
    `;
  }
}

/**
 * @param {string} html
 */
function findCanonicalUrl(html) {
  const matches = html.match(/<link\s*rel="canonical"\s*href="(.*)"/);
  if (matches) {
    return normalizeUrl(matches[1]);
  }
}
