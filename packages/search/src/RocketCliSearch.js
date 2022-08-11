/* eslint-disable @typescript-eslint/ban-ts-comment */

// @ts-ignore https://github.com/lucaong/minisearch/issues/152
import MiniSearch from 'minisearch';
import { getIdBlocksOfHtml } from './getIdBlocksOfHtml.js';
// import readline from 'readline';
import path from 'path';
// import { renderResults } from './renderResults.js';
import { PageTree } from '@rocket/engine';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';

export class RocketCliSearch {
  /** @type {{ id: string; title: string; section: string; headline: string; body: string }[]} */
  documents = [];

  /**
   * @param {import('commander').Command} program
   * @param {import('@rocket/cli').RocketCli} cli
   */
  async setupCommand(program, cli) {
    this.cli = cli;
    this.active = true;

    this.cli.events.on('build-end', async () => {
      await this.gatherDocuments();
      await this.saveIndex();
    });
  }

  async gatherDocuments() {
    if (!this.cli) {
      return;
    }

    const pageTree = new PageTree();
    this.inputDir =
      this.cli.options.inputDir instanceof URL
        ? this.cli.options.inputDir.pathname
        : this.cli.options.inputDir;
    this.outputDir =
      this.cli.options.outputDir instanceof URL
        ? this.cli.options.outputDir.pathname
        : this.cli.options.outputDir;
    await pageTree.restore(path.join(this.inputDir, 'pageTreeData.rocketGenerated.json'));

    for (const page of pageTree.all()) {
      if (!page.model.outputRelativeFilePath) {
        continue;
      }
      const htmlPath = path.join(this.outputDir, page.model.outputRelativeFilePath);
      const html = await readFile(htmlPath, 'utf8');
      const blocks = await getIdBlocksOfHtml({ html, url: page.model.url });

      for (const block of blocks) {
        this.documents.push({
          id: block.url,
          title: page.model.name,
          // @ts-ignore
          section: page.model.menuSection,
          headline: block.headline,
          body: block.text,
        });
      }
    }
  }

  async saveIndex() {
    if (!this.outputDir || !this.inputDir) {
      return;
    }
    const miniSearch = new MiniSearch({
      fields: ['title', 'headline', 'body', 'section'], // fields to index for full-text search
      storeFields: ['title', 'headline', 'body', 'section'], // fields to return with search results
      searchOptions: {
        boost: { headline: 3, title: 2 },
        fuzzy: 0.2,
        prefix: true,
      },
    });

    miniSearch.addAll(this.documents);
    const json = JSON.stringify(miniSearch);

    const outputWritePath = path.join(this.outputDir, 'rocket-search-index.json');
    const relPath = path.relative(process.cwd(), outputWritePath);
    await writeFile(outputWritePath, json);

    const publicDir = path.join(this.inputDir, '..', 'public');
    if (!existsSync(publicDir)) {
      await mkdir(publicDir, { recursive: true });
    }
    const publicWritePath = path.join(publicDir, 'rocket-search-index.json');
    await writeFile(publicWritePath, json);

    console.log(
      `Search index written to ${relPath} - ${new TextEncoder().encode(json).byteLength} bytes`,
    );
  }

  // async setup({ config, argv, eleventy }) {
  //   const searchDefinitions = [
  //     {
  //       name: 'mode',
  //       alias: 'm',
  //       type: String,
  //       defaultValue: 'search',
  //       description: 'What build to run [search, index]',
  //     },
  //     { name: 'term', type: String, defaultOption: true, defaultValue: '' },
  //     { name: 'help', type: Boolean, description: 'See all options' },
  //   ];
  //   const searchOptions = commandLineArgs(searchDefinitions, { argv });

  //   this.config = {
  //     ...config,
  //     search: searchOptions,
  //   };
  //   this.eleventy = eleventy;
  // }

  // async inspectRenderedHtml({ html, url, layout, title, data, eleventy }) {
  //   if (this.excludeLayouts.includes(layout)) {
  //     return;
  //   }
  //   if (data.excludeFromSearch) {
  //     return;
  //   }

  //   const urlFilter = eleventy.config.nunjucksFilters.url;

  //   const blocks = await getIdBlocksOfHtml({ html, url });
  //   for (const block of blocks) {
  //     this.documents.push({
  //       id: urlFilter(block.url),
  //       title,
  //       section: data.section,
  //       headline: block.headline,
  //       body: block.text,
  //     });
  //   }
  // }

  // async searchCommand() {
  //   await this.eleventy.write();
  //   await this.setupIndex();

  //   process.stderr.write('\u001B[?25l'); // hide default cursor

  //   readline.emitKeypressEvents(process.stdin);
  //   process.stdin.setRawMode(true);
  //   process.stdin.on('keypress', (str, key) => {
  //     if (key.ctrl && key.name === 'c') {
  //       process.stderr.write('\u001B[?25h'); // show cursor
  //       process.exit();
  //     }

  //     const { term } = this.config.search;
  //     switch (key.name) {
  //       case 'backspace':
  //         this.config.search.term = term.substring(0, term.length - 1);
  //         break;
  //       case 'return':
  //       case 'right':
  //       case 'left':
  //       case 'up':
  //       case 'down':
  //         // ignore
  //         break;
  //       default:
  //         this.config.search.term += str;
  //     }
  //     this.renderCli();
  //   });

  //   this.renderCli();
  // }

  // renderCli() {
  //   const { term } = this.config.search;
  //   const results = this.miniSearch?.search(term);

  //   if (results) {
  //     const output = renderResults({ term, results });
  //     console.log(output.join('\n'));
  //   }
  // }
}
