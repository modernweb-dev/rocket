```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '10--docs/30--guides/30--images.rocket.md';
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

# Images

<inline-notification type="danger">

THIS IS NOT YET IMPLEMENTED

</inline-notification>

Rocket does handle content images automatically by

- producing multiple sizes so users download images that are meant for their resolution
- outputting multiple formats so the device can choose the best image format it supports

And the best thing about is you don't need to do anything.

## Usage

If you are using markdown images you are good to go.

```md
![My Image](path/to/image.jpg)
```

will result in

```html
<picture>
  <source
    type="image/avif"
    srcset="/images/5f03d82-300.avif 300w, /images/5f03d82-820.avif 820w"
    sizes="(min-width: 1024px) 820px, calc(100vw - 20px)"
  />
  <source
    type="image/jpeg"
    srcset="/images/5f03d82-300.jpeg 300w, /images/5f03d82-820.jpeg 820w"
    sizes="(min-width: 1024px) 820px, calc(100vw - 20px)"
  />
  <img
    alt="My Image"
    rocket-image="responsive"
    src="/images/5f03d82-300.jpeg"
    width="300"
    height="158"
    loading="lazy"
    decoding="async"
  />
</picture>
```

## Benefits

The main benefit is that we can serve the correct size and optimal image format depending on the browser capabilities leading to optimal loading times on different systems.

- Smaller images for smaller screens

  When providing `srcset` and `sizes` the browser can decide which image makes the most sense to download.
  This will lead to much faster websites especially on mobile where smaller images can be served.
  If you wanna know more check out [The anatomy of responsive images](https://jakearchibald.com/2015/anatomy-of-responsive-images/).

- Serve the best/smallest image format the browser understands

  There are currently ~3 formats you may want to consider `avif`, `webp` and `jpg`. The improvements are huge [webp is ~30% and avif ~50%](https://www.ctrl.blog/entry/webp-avif-comparison.html) smaller then the original jpg.

## Adding a caption

If you want to describe your image in more detail you can add a caption

```md
![My Image](path/to/image.jpg 'My caption text')
```

will result in

```html
<figure>
  <picture>
    <!-- picture code the same as above -->
  </picture>
  <figcaption>My caption text</figcaption>
</figure>
```

## Adjusting options

Under the hood it is using [11ty/image](https://www.11ty.dev/docs/plugins/image/) and all it's options are available.

<inline-notification type="tip">

If you are using a layout preset like `@rocket/launch` then you probably don't want to touch/change these options as the preset will set it for you accordion to its layout needs.

The default preset for regular markdown content is available as `responsive`.

</inline-notification>

👉 `config/rocket.config.js`

```js
/** @type {import('rocket/cli').RocketCliConfig} */
export default {
  imagePresets: {
    responsive: {
      widths: [300, 820],
      formats: ['avif', 'jpeg'],
      sizes: '(min-width: 1024px) 820px, calc(100vw - 20px)',
    },
  },
};
```

## Ignoring Images

Files ending in `.svg` or that include `rocket-ignore.` will remain untouched.

For example

```md
![Logo stays svg](logo.svg)
![Ignore by file name](my-image.rocket-unresponsive.jpg)
![My Image Alternative Text](my-image.jpeg)
```

becomes

```html
<img src="logo.svg" alt="Logo stays svg" rocket-image="responsive" />
<img src="my-image.rocket-unresponsive.jpg" alt="Ignore by file name" rocket-image="responsive" />
<picture>[...] </picture>
```

### Adjusting ignore function

The default ignore function looks like this

```js
/**
 * The default responsive ignore function will ignore files
 * - ending in `.svg`
 * - containing `rocket-unresponsive.`
 *
 * @param {object} opts
 * @param {string} opts.src
 * @param {string} opts.title
 * @param {string} opts.alt
 * @param {{name: string, value: string}[]} opts.attributes
 * @returns {boolean}
 */
function ignore({ src }) {
  return src.endsWith('svg') || src.includes('rocket-unresponsive.');
}
```

and you can adjust it by setting it via the `imagePreset`.

For this example we want to also ignore `.jpeg` files.

👉 `config/rocket.config.js`

```js
/** @type {import('rocket/cli').RocketCliConfig} */
export default {
  imagePresets: {
    responsive: {
      // ...
      ignore: ({ src }) =>
        src.endsWith('.jpeg') || src.endsWith('svg') || src.includes('rocket-unresponsive.'),
    },
  },
};
```

With that setting we get the following behavior

```md
![Logo stays svg](logo.svg)
![Ignore by file name](my-image.rocket-unresponsive.jpg)
![My Image Alternative Text](my-image.jpeg)
```

becomes

```html
<img src="logo.svg" alt="Logo stays svg" rocket-image="responsive" />
<img src="my-image.rocket-unresponsive.jpg" alt="Ignore by file name" rocket-image="responsive" />
<img src="my-image.jpeg" alt="My Image Alternative Text" rocket-image="responsive" />
```

## Defining your own presets

You can add your own image preset like so

```js
/** @type {import('rocket/cli').RocketCliConfig} */
export default {
  imagePresets: {
    'my-image-preset': {
      widths: [30, 60],
      formats: ['avif', 'jpeg'],
      sizes: '(min-width: 1024px) 30px, 60px',
    },
  },
};
```

Once that `imagePreset` is defined you can use it by adding it to any `img` tag.

```html
<img src="./path/to/image.jpg" alt="my alt" rocket-image="my-image-preset" />
```

## How does it work?

1. Each markdown image `![my image](path/to/image.jpg)` gets rendered as `<img src="path/to/image.jpg" alt="my image" rocket-image="responsive">`
2. We parse the html output and process every image which has `rocket-image`
3. Get the image preset settings from the name e.g. `rocket-image="my-image-preset"` reads `imagePreset['my-image-preset']`
4. Pass the settings onto `@11ty/image` to generate the image sizes and formats
5. With the metadata we render the html

## Default Formats

An [image file format](https://en.wikipedia.org/wiki/Image_file_formats) is a way of storing common image formats. Each format varies in capabilities like compression algorithm, availability, progressive rendering, encode and decode time, ...
Ultimately newer formats are usually smaller while retaining image quality which leads to faster websites.

By default, we generate `avif` and `jpg` because

- we only want to generate two versions to limit CI time and html size
- `avif` is significantly smaller than `webp`
- `avif` is available in
  - Chrome since August 2020
  - Firefox since June 2021
- `jpg` as a fallback for Edge, Safari, IE11
- `webp` would only help a small percentage of Edge & Safari on macOS 11 (Big Sur) users

This leads to the following situation:

- Chrome, Firefox gets the small `avif`
- Edge, Safari, IE11 gets the bigger `jpg`

To learn more about `avif` take a look at [AVIF has landed](https://jakearchibald.com/2020/avif-has-landed/).

If you want to add `webp` (or replace `avif` with it) you can do so by setting the formats

👉 `config/rocket.config.js`

```js
/** @type {import('rocket/cli').RocketCliConfig} */
export default {
  imagePresets: {
    responsive: {
      formats: ['avif', 'webp', 'jpeg'],
    },
  },
};
```

## Default widths

In order to understand the need for having a single image in multiple resolutions we need to understand the our website is served to many different environments and each may come with its own specific device pixel ratio (DPR). The device pixel ratio is the ratio between physical pixels and logical pixels. For instance, the Galaxy S20 report a device pixel ratio of 3, because the physical linear resolution is triple the logical linear resolution.

Physical resolution: 1440 x 3200
Logical resolution: 480 x 1067

And 1440 / 480 = 3.

By default, we generate the following widths `600`, `900` and `1640` because

- we only want to generate a small amount of widths to limit CI time and service worker cache size
- `600` is good for mobile with DRP 2
- `900` is good for mobile with DRP 3 and desktop with DPR of 1
- `1640` is good for desktop with DPR of 2

If you want to add more widths you can add them to `widths`.

👉 `config/rocket.config.js`

```js
/** @type {import('rocket/cli').RocketCliConfig} */
export default {
  imagePresets: {
    responsive: {
      widths: [300, 600, 900, 1200, 1640],
      sizes: '(min-width: 1024px) 820px, calc(100vw - 20px)',
    },
  },
};
```

<inline-notification type="tip">

As an end user in most cases you don't want to mess with this as a layout preset should set this for you. If you are building your own layout preset then be sure to set `widths` and `sizes` via `adjustImagePresets`

```js
export function myPreset() {
  return {
    adjustImagePresets: imagePresets => ({
      ...imagePresets,
      responsive: {
        ...imagePresets.responsive,
        widths: [600, 900, 1640],
        sizes: '(min-width: 1024px) 820px, calc(100vw - 40px)',
      },
    }),
  };
}
```

</inline-notification>

```js script

```
