```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '10--guides/10--first-pages/20--images.rocket.md';
import { pageTree, layout, html } from '../../recursive.data.js';
export { pageTree, layout, html };
/* END - Rocket auto generated - do not touch */
```

# Images


We can add a private package import to your

👉 `package.json`

```json
  "imports": {
    "#images/*": "./docs/__shared/*"
  },
```

With that we can then use `resolve:[[npm resolve name]]` in our urls.


```md
![rocket image](resolve:#images/rocket-image.jpg)
```

<div style="width: 50%">

![rocket image](resolve:#images/rocket-image.jpg)

</div>

You can also include images from dependencies.

```md
![astronaut](resolve:@rocket/launch/assets/404/astronaut.svg)
```

<div style="width: 50%">

![astronaut](resolve:@rocket/launch/assets/404/astronaut.svg)

</div>
