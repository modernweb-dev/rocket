# Configuration >> Service Worker ||30

Rocket does come with a default service worker that will

- cache already visited pages
- cache assets of visited pages (up to 100 files then it replaces older entries)
- reload the page if a newer html page version is available on service worker activation

## Adjusting the file name

Changing the service worker file name can be quite a hassle so you can adjust generate file name via a config.

👉 `rocket.config.js`

<!-- prettier-ignore-start -->
```js
/** @type {import('rocket/cli').RocketCliConfig} */
export default ({
  serviceWorkerName: 'my-service-worker-name.js',
});
```
<!-- prettier-ignore-end -->

## Meet the Service Worker

The default service worker will work for many scenarios however your needs my vary.
To enable different service worker strategies you can replace the default service worker code by providing a file at `_assets/service-worker.js`.
This file will be auto transformed and generated in the root of the website using the defined `serviceWorkerName`.

For inspiration, you can take a look at the default config.

[https://github.com/modernweb-dev/rocket/blob/main/packages/cli/preset/\_assets/service-worker.js](https://github.com/modernweb-dev/rocket/blob/main/packages/cli/preset/_assets/service-worker.js)

Be sure to check out [workbox](https://developers.google.com/web/tools/workbox) for more service worker magic.

And if you wanna have a 30 minutes crash course we highly recommend the talk [Service Workers For The Rest Of Us](https://vimeo.com/362260166) by [Philip Walton](https://twitter.com/philwalton).

## Registration

The registration happens via another file that you can also overwrite at `_assets/scripts/registerServiceWorker.js`.

Below you find the default implementation.

<!-- prettier-ignore-start -->
```js
{{ '/_assets/scripts/registerServiceWorker.js' | asset | toAbsPath | inlineFilePath; }}
```
<!-- prettier-ignore-end -->
