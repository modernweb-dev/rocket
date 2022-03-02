```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '10--docs/30--guides/20--social-media.rocket.md';
import { html, layout, setupUnifiedPlugins } from '../../recursive.data.js';
export { html, layout, setupUnifiedPlugins };
/* END - Rocket auto generated - do not touch */
```

# Social Media

Having a nice preview image for social media can be very helpful.
For that reason Rocket has a specific functionality to generate a preview image.

This functionality is disable by default. You can enable it by exporting a `openGraphLayout` function/class instance.

The functionality is the same as normal [Layouts](../20--basics/50--layouts.rocket.md).

## How it works

<inline-notification type="danger">

STEP2 IS NOT YET IMPLEMENTED

</inline-notification>

1. Whenever a HTML page is rendered and there is an `openGraphLayout` defined it will create an additional `filename.opengraph.html` file.

   Here are some examples

   ```
   site/pages/index.rocket.md        -> mysite.com/index.opengraph.html
   site/pages/about.rocket.md        -> mysite.com/about/index.opengraph.html
   site/pages/about/index.rocket.js  -> mysite.com/about/index.opengraph.html
   site/pages/about/me.rocket.html   -> mysite.com/about/me/index.opengraph.html
   site/pages/404.html.rocket.js     -> mysite.com/404.openGraph.html
   site/pages/sitemap.xml.rocket.js  -> open graph only happens for html files
   ```

2. During the the build phase is does the following logic
   a. If there is a `filename.opengraph.html` file it will open that file in playwright
   a. It sets its screen size to 1200×630px and takes a screenshot
   a. Adjusts the "source file" e.g. `index.html` by injecting `<meta property="og:image" content="https://absolute.url/to/screenshot.jpg">` if not already present
