import MiniSearch from 'minisearch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const searchInstance = new MiniSearch({
  fields: ['title', 'headline', 'body', 'section'], // fields to index for full-text search
  storeFields: ['title', 'headline', 'body', 'section'], // fields to return with search results
  searchOptions: {
    boost: { headline: 3, title: 2 },
    fuzzy: 0.2,
  },
});

searchInstance.addAll([
  {
    id: 'http://localhost/first-page/',
    title: 'First Search Page',
    headline: 'First Search Headline',
    body: 'First Search Body',
    section: 'docs',
  },
]);

const json = JSON.stringify(searchInstance);

fs.writeFileSync(path.join(__dirname, 'one-result.json'), json);
