```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '20--presets/10--components/card-icon.rocket.md';
import {
  html,
  layout,
  setupUnifiedPlugins,
  components,
  openGraphLayout,
} from '../../recursive.data.js';
export { html, layout, setupUnifiedPlugins, components, openGraphLayout };
/* END - Rocket auto generated - do not touch */

import { CardIcon } from '@rocket/components/server';
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
