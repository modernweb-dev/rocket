/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '20--docs/star-wars.rocket.js';
import { pageTree, layout, html } from '../recursive.data.js';
export { pageTree, layout, html };
/* END - Rocket auto generated - do not touch */

import cache from '@11ty/eleventy-cache-assets';

const films = await cache('https://swapi.dev/api/films/', {
  duration: '1d',
  type: 'json',
});

export default () => html`
  <h1>Star Wars</h1>

  <h2>Films:</h2>
  <ul>
    ${films.results.map(film => html`<li>${film.title} (${film.release_date})</li>`)}
  </ul>
`;
