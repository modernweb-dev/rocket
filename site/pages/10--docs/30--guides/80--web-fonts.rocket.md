```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '10--docs/30--guides/80--web-fonts.rocket.md';
// prettier-ignore
import { html, layout, setupUnifiedPlugins, components, openGraphLayout } from '../../recursive.data.js';
export { html, layout, setupUnifiedPlugins, components, openGraphLayout };
export async function registerCustomElements() {
  // client-only components
  // 'rocket-search': () => import('@rocket/search/web').then(m => m.RocketSearch),
  // 'rocket-drawer': () => import('@rocket/drawer').then(m => m.RocketDrawer),
}
/* END - Rocket auto generated - do not touch */

export const description =
  'Enable a unique and consistent experience via Web Fonts. With the right loading strategy there will be no layout shift.';
export const subTitle = 'Use web fonts to ensure a unique and consistent experience.';
```

# Web Fonts

Using web fonts can be tricky and as there are so many considerations

- Use a [Variable Font](https://web.dev/variable-fonts/)?
- How to [reduced the size](https://web.dev/reduce-webfont-size/)?
- How to avoid [a layout shift as the font is loaded](https://web.dev/preload-optional-fonts/)?
- ...

Here is a quick summary of what you should do as of 2022.

1. Use a variable font

   This means only ONE font file needs to be download for all the different weights and widths.
   This file is usually bigger then one weight of a font but smaller then multiple weights font files.

   Not many fonts are "easily" accessible as a variable font. Often you need to manually [convert](https://convertio.co/ttf-woff/) a variable font ttf file to a web woff2 file.

   If you just need any font then feel free to download the the optimized [Open Sans](/fonts/OpenSans-VariableFont_wdth,wght.woff2) we are using on this page.

   ```css
   @font-face {
     font-family: 'Open Sans';
     src: url('/fonts/OpenSans-VariableFont_wdth,wght.woff2') format('woff2 supports variations'), url('/fonts/OpenSans-VariableFont_wdth,wght.woff2')
         format('woff2-variations');
     font-weight: 1 999;
   }
   ```

2. Preload the web font

   This means the font will start downloading before any CSS has even been parsed.

   ```html
   <link
     rel="preload"
     href="/fonts/OpenSans-VariableFont_wdth,wght.woff2"
     as="font"
     type="font/woff2"
     crossorigin
   />
   ```

3. Use optional fonts

   In combination with 2. this means there will be NO layout shift at all. Nothing will be display until the font is loaded or a timeout (usually 100ms) is reached. If there is a timeout then for this page visit a fallback font will be used.
   On the next page load the font will be cached and directly rendered with the web font.

   ```css
   @font-face {
     font-display: optional;
   }
   ```

## Put it all together

All together this means you can use local web fonts and there will be no layout shift.

```html
<link
  rel="preload"
  href="/fonts/OpenSans-VariableFont_wdth,wght.woff2"
  as="font"
  type="font/woff2"
  crossorigin
/>

<style>
  @font-face {
    font-family: 'Open Sans';
    src: url('/fonts/OpenSans-VariableFont_wdth,wght.woff2') format('woff2 supports variations'), url('/fonts/OpenSans-VariableFont_wdth,wght.woff2')
        format('woff2-variations');
    font-weight: 1 999;
    font-display: optional;
  }
</style>
```
