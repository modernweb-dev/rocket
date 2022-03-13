```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '20--presets/20--launch/20--service-worker.rocket.md';
import { html, layout, setupUnifiedPlugins, components } from '../../recursive.data.js';
export { html, layout, setupUnifiedPlugins, components };
/* END - Rocket auto generated - do not touch */

import { inlineFile } from '@rocket/engine';
import { createRequire } from 'module';

const { resolve } = createRequire(new URL('.', import.meta.url));
```

# Service Worker

Rocket does come with a default service worker that will

- cache already visited pages
- cache assets of visited pages (up to 100 files then it replaces older entries)
- reload the page if a newer html page version is available on service worker activation

## Adjusting the file name

Changing the service worker file name can be quite a hassle so you can adjust generate file name via a config.

👉 `config/rocket.config.js`

```js
/** @type {import('rocket/cli').RocketCliConfig} */
export default {
  serviceWorkerName: 'my-service-worker-name.js',
  serviceWorkerSourcePath: new URL('../src/service-worker.js', import.meta.url).href,
};
```

## Meet the Service Worker

The default service worker will work for many scenarios however your needs my vary.
To enable different service worker strategies you can replace the default service worker code by providing a file at `_assets/service-worker.js`.
This file will be auto transformed and generated in the root of the website using the defined `serviceWorkerName`.

For inspiration, you can take a look at the default config.

```js server
const serviceWorkerCode = await inlineFile(resolve('@rocket/launch/js/service-worker.js'));
```

<pre><code>
${serviceWorkerCode}
</code></pre>

Be sure to check out [workbox](https://developers.google.com/web/tools/workbox) for more service worker magic.

And if you wanna have a 30 minutes crash course we highly recommend the talk [Service Workers For The Rest Of Us](https://vimeo.com/362260166) by [Philip Walton](https://twitter.com/philwalton).

## Registration

The registration happens via

```html
<script type="module" src="resolve:@rocket/launch/js/register-service-worker.js"></script>
```

Below you find its implementation

```js server
const serviceWorkerRegistrationCode = await inlineFile(
  resolve('@rocket/launch/js/register-service-worker.js'),
);
```

<pre><code>
${serviceWorkerRegistrationCode}
</code></pre>
