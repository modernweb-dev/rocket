```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '10--docs/20--basics/40--components.rocket.md';
import { html, layout, setupUnifiedPlugins } from '../../recursive.data.js';
export { html, layout, setupUnifiedPlugins };
/* END - Rocket auto generated - do not touch */

import '@rocket/launch/inline-notification/define';
```

# Components

Components in Rocket are the "just" the web standard [web components](https://developer.mozilla.org/en-US/docs/Web/Web_Components). They are used to create reusable components that can be used in any web page.

<inline-notification>

Web component only live within the html body. For content within the head or a full html page please see [layouts](./50--layouts.rocket.md).

</inline-notification>

Rocket uses [lit](https://lit.dev) for layouts so using it for components as well makes it easy to switch back and forth.
However any web component code/library should work.

## Defining a component

A lit component typically looks like this:

👉 `site/src/components/TwoColumns.js`

```js
import { html, css, LitElement } from 'lit';

class TwoColumns extends LitElement {
  render() {
    return html`
      <div>
        <slot name="left"></slot>
      </div>
      <div>
        <slot name="right"></slot>
      </div>
    `;
  }

  styles = css`
    :host {
      display: flex;
    }
  `:
}
```

👉 `site/src/components/two-columns.js`

```js
import { TwoColumns } from './TwoColumns.js';

customElements.define('two-columns', TwoColumns);
```

With the element being define you can now use it in markdown, html or JavaScript.

```md
# Hello World

<two-columns><div slot="left">

This is **left** content

</div><div slot="right">

And here comes the **right** content

</div></two-columns>
```

<inline-notification>

Note the empty lines between html & markdown. They are necessary as this is how the markdown parser separates unprocessed html from markdown.

</inline-notification>

## Loading Components

For each component you then need to decide if you want to render server or client side.

You decide this by where you are executing the element definition.

👉 `site/pages/index.rocket.js`

```js
// server side
import '../src/components/two-columns.js';

// client side
export default () => html` <script type="module" src="../src/components/two-columns.js"></script> `;
```

👉 `site/pages/index.rocket.html`

```html
<!-- server side -->
<script type="module" server>
  import '../src/components/two-columns.js';
</script>

<!-- client side -->
<script type="module">
  import '../src/components/two-columns.js';
</script>
```

👉 `site/pages/index.rocket.md`

````md
## server side

```js server
import '../src/components/two-columns.js';
```

## client side

```js client
import '../src/components/two-columns.js';
```
````

---

<inline-notification type="danger">

The part below is not yet implemented. Join the [GitHub](https://github.com/modernweb-dev/rocket/issues/308) discussion.

</inline-notification>

You can then register the component by exporting

```js
import { TwoColumns } from '...';

export const components = {
  'two-columns': () => import('../src/components/TwoColumns.js').then(mod => mod.TwoColumns),
};
```
