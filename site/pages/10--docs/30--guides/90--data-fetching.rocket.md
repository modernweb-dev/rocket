```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '10--docs/30--guides/90--data-fetching.rocket.md';
// prettier-ignore
import { html, layout, setupUnifiedPlugins, components, openGraphLayout } from '../../recursive.data.js';
export { html, layout, setupUnifiedPlugins, components, openGraphLayout };
export async function registerCustomElements() {
  // server-only components
  // prettier-ignore
  customElements.define('inline-notification', await import('@rocket/components/components/InlineNotification').then(m => m.InlineNotification));
  // client-only components
  // 'rocket-search': () => import('@rocket/search/web').then(m => m.RocketSearch),
  // 'rocket-drawer': () => import('@rocket/drawer').then(m => m.RocketDrawer),
}
/* END - Rocket auto generated - do not touch */
```

# Data Fetching

<inline-notification type="warning">

This guide is not yet complete.

</inline-notification>

## Using Eleventy Fetch

```js
import eleventyFetch from '@11ty/eleventy-fetch';

const films = await eleventyFetch('https://swapi.dev/api/films/', {
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
```
