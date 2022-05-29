```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '20--presets/10--components/card-icon.rocket.md';
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
  customElements.define('card-icon', await import('@rocket/components/card-icon.js').then(m => m.CardIcon));
  // prettier-ignore
  customElements.define('main-docs', await import('@rocket/components/main-docs.js').then(m => m.MainDocs));
  // hydrate-able components
  // prettier-ignore
  customElements.define('rocket-search', await import('@rocket/search/search.js').then(m => m.RocketSearch));
  // prettier-ignore
  customElements.define('rocket-drawer', await import('@rocket/components/drawer.js').then(m => m.RocketDrawer));
}
/* END - Rocket auto generated - do not touch */

import { CardIcon } from '@rocket/components/card-icon.js';
customElements.define('card-icon', CardIcon);
```

# Card Icon

Shows an icon in a card.

_Note: This is a server only component as it reads svg files from the file system and inlines them._

<card-icon icon="solid/headphones-alt"></card-icon>

```html
<card-icon icon="solid/headphones-alt"></card-icon>
```

It does supports the 1,600+ icons from [font awesome](https://fontawesome.com/v5/search?m=free&s=solid).

The icon attribute is `solid|regular|brands` + `/` + icon name.

For example:

- `solid/anchor`
- `solid/battery-empty`
- `regular/check-circle`
- ...

Beware that in the free version of font awesome we only have access to

- [~1000 solid icons](https://fontawesome.com/v5/search?m=free&s=solid)
- [~150 regular icons](https://fontawesome.com/v5/search?m=free&s=regular)
- [~400 brands icons](https://fontawesome.com/v5/search?m=free&s=brands)
