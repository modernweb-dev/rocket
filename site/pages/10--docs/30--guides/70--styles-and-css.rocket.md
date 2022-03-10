```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '10--docs/30--guides/70--styles-and-css.rocket.md';
import { html, layout, setupUnifiedPlugins } from '../../recursive.data.js';
export { html, layout, setupUnifiedPlugins };
/* END - Rocket auto generated - do not touch */

import { inlineFile } from '@rocket/engine';
import { createRequire } from 'module';
import path from 'path';

const { resolve } = createRequire(new URL('.', import.meta.url));
```

# Styles And CSS

Styles with Rocket can be as simple or as complex as you'd like them to be. In this guide we'll go through a few of the different approaches available to you when it comes to styling a site built with Rocket.

## Approaches to Styling

### 1. Simple `<link>` Tags and External Files

...

### 2. Global CSS Styling

...

### 3. Completely Component Scoped Styles

...

The best part about these 3 approaches and Rocket is you don't have to pick one over the other. You can mix and match them as needed in your project.

## Recommendations & Best Practices

This is where we'll share our recommendations and what we would consider best practices for styles **but by all means choose the approach that works best for your project and your team.**

### Global Styles

We would first recommend that you have your global styles (resets, CSS variables, theme colors, etc.) all placed in a .css file or an inline style tag on your base layout. Web components work very well with [CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/--*) which is why we a global.css or base.css file would be a great place to set your site's theme colors, global resets, etc.

Here's an example of some base properties for a theme.

👉 `global.css`

```css
:root {
  --theme-bg: #ffffff;
  --theme-on-bg: #000000;
  --theme-primary: #D21B1D;
  --theme-on-primary: #ffffff;
}
```

These properties could easily be used to set the body's background color and default text color of the site or within a button component to set the background color of the button and the color of the text in the button.

### Resets

You'll see many differing opinions online about styles that normalize or reset your styles across different browsers. Some of our favorites would be [A Modern CSS Reset](https://piccalil.li/blog/a-modern-css-reset/) and [Normalize CSS](https://necolas.github.io/normalize.css/) but we would recommend you pick what works best for you and your project. (I'm sure you're noticing a trend).

To include your reset styles you can simply place them at the top of your `global.css` file or import them from external `reset.css` file at the top of your `global.css` file.

### Typography



