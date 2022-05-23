```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '10--docs/30--guides/80--web-fonts.rocket.md';
// prettier-ignore
import { html, layout, setupUnifiedPlugins, components, openGraphLayout } from '../../recursive.data.js';
export { html, layout, setupUnifiedPlugins, components, openGraphLayout };
export async function registerCustomElements() {
  // server-only components
  // prettier-ignore
  customElements.define('rocket-social-link', await import('@rocket/components/social-link.js').then(m => m.RocketSocialLink));
  // prettier-ignore
  customElements.define('rocket-header', await import('@rocket/components/header.js').then(m => m.RocketHeader));
  // prettier-ignore
  customElements.define('inline-notification', await import('@rocket/components/components/InlineNotification').then(m => m.InlineNotification));
  // prettier-ignore
  customElements.define('main-docs', await import('@rocket/components/main-docs.js').then(m => m.MainDocs));
  // hydrate-able components
  // prettier-ignore
  customElements.define('rocket-search', await import('@rocket/search/web').then(m => m.RocketSearch));
  // prettier-ignore
  customElements.define('rocket-drawer', await import('@rocket/components/drawer.js').then(m => m.RocketDrawer));
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

   If you just need any font then feel free to download the the optimized [Rubik](/fonts/Rubik-VariableFont_wght.woff2) we are using on this page.

   ```css
   @font-face {
     font-family: 'Rubik';
     src: url('/fonts/Rubik-VariableFont_wght.woff2') format('woff2 supports variations'), url('/fonts/Rubik-VariableFont_wght.woff2')
         format('woff2-variations');
     font-weight: 1 999;
   }
   ```

2. Preload the web font

   This means the font will start downloading before any CSS has even been parsed.

   ```html
   <link
     rel="preload"
     href="/fonts/Rubik-VariableFont_wght.woff2"
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

<inline-notification type="warning">

Variable fonts can be VERY big - and with the performance goals a typical Rocket site has the font will become the bottleneck as soon as it exceeds a size of ~200kb.
So choose your font wisely.

</inline-notification>

## Put it all together

All together this means you can use local web fonts and there will be no layout shift.

```html
<link
  rel="preload"
  href="/fonts/Rubik-VariableFont_wght.woff2"
  as="font"
  type="font/woff2"
  crossorigin
/>

<style>
  @font-face {
    font-family: 'Rubik';
    src: url('/fonts/Rubik-VariableFont_wght.woff2') format('woff2 supports variations'), url('/fonts/Rubik-VariableFont_wght.woff2')
        format('woff2-variations');
    font-weight: 1 999;
    font-display: optional;
  }
</style>
```
