import commandLineArgs from 'command-line-args';
import MiniSearch from 'minisearch';
import { getIdBlocksOfHtml } from './getIdBlocksOfHtml.js';
import readline from 'readline';
import fs from 'fs';
import path from 'path';
import { renderResults } from './renderResults.js';

export class RocketSearchPlugin {
  commands = ['search', 'start', 'build'];

  excludeLayouts = ['with-index.njk'];
  documents = [];

  async setup({ config, argv, eleventy }) {
    const searchDefinitions = [
      {
        name: 'mode',
        alias: 'm',
        type: String,
        defaultValue: 'search',
        description: 'What build to run [search, index]',
      },
      { name: 'term', type: String, defaultOption: true, defaultValue: '' },
      { name: 'help', type: Boolean, description: 'See all options' },
    ];
    const searchOptions = commandLineArgs(searchDefinitions, { argv });

    this.config = {
      ...config,
      search: searchOptions,
    };
    this.eleventy = eleventy;
  }

  async inspectRenderedHtml({ html, url, layout, title, data, eleventy }) {
    if (this.excludeLayouts.includes(layout)) {
      return;
    }
    if (data.excludeFromSearch) {
      return;
    }

    const urlFilter = eleventy.config.nunjucksFilters.url;

    const blocks = await getIdBlocksOfHtml({ html, url });
    for (const block of blocks) {
      this.documents.push({
        id: urlFilter(block.url),
        title,
        section: data.section,
        headline: block.headline,
        body: block.text,
      });
    }
  }

  async searchCommand() {
    await this.eleventy.write();
    await this.setupIndex();

    process.stderr.write('\u001B[?25l'); // hide default cursor

    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.on('keypress', (str, key) => {
      if (key.ctrl && key.name === 'c') {
        process.stderr.write('\u001B[?25h'); // show cursor
        process.exit();
      }

      const { term } = this.config.search;
      switch (key.name) {
        case 'backspace':
          this.config.search.term = term.substring(0, term.length - 1);
          break;
        case 'return':
        case 'right':
        case 'left':
        case 'up':
        case 'down':
          // ignore
          break;
        default:
          this.config.search.term += str;
      }
      this.renderCli();
    });

    this.renderCli();
  }

  renderCli() {
    const { term } = this.config.search;
    const results = this.miniSearch?.search(term);

    if (results) {
      const output = renderResults({ term, results });
      console.log(output.join('\n'));
    }
  }

  async setupIndex() {
    this.miniSearch = new MiniSearch({
      fields: ['title', 'headline', 'body', 'section'], // fields to index for full-text search
      storeFields: ['title', 'headline', 'body', 'section'], // fields to return with search results
      searchOptions: {
        boost: { headline: 3, title: 2 },
        fuzzy: 0.2,
        prefix: true,
      },
    });

    this.miniSearch.addAll(this.documents);
  }

  async updated() {
    await this.saveIndex();
  }

  async saveIndex() {
    await this.setupIndex();
    const json = JSON.stringify(this.miniSearch);

    const writePath = path.join(
      this.config.outputDevDir,
      '_merged_assets',
      '_static',
      'rocket-search-index.json',
    );
    const relPath = path.relative(process.cwd(), writePath);
    fs.writeFileSync(writePath, json);
    console.log(
      `Search index written to ${relPath} - ${new TextEncoder().encode(json).byteLength} bytes`,
    );
  }
}
