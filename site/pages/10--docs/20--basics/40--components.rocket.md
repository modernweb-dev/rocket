```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '10--docs/20--basics/40--components.rocket.md';
import { html, layout, setupUnifiedPlugins, components } from '../../recursive.data.js';
export { html, layout, setupUnifiedPlugins, components };
/* END - Rocket auto generated - do not touch */
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

```js
import { html, css, LitElement } from 'lit';

class RocketGreeting extends LitElement {
  static properties = {
    count: { type: Number },
  };

  constructor() {
    super();
    this.count = 1;
  }

  render() {
    return html`
      <slot></slot>
      ${new Array(this.count).fill('🚀')}
    `;
  }

  static styles = css`
    :host {
      display: block;
    }
  `;
}
customElements.define('rocket-greeting', RocketGreeting);
```

We can now put this code in Rocket JavaScript, Markdown or Html pages.

````md
```js server
// snippet
```

# Hello World

<rocket-greeting>Go</rocket-greeting>
````

will result a server rendered output that does not load ANY JavaScript

```
Hello World

Go 🚀
```

If we would like to instead load the component and render it client side you can use the following code:

````md
```js client
// snippet
```

# Hello World

<rocket-greeting>Go</rocket-greeting>
````

👆 e.g. we can replace the client/server hint on code blocks to decide where it gets executed.

<inline-notification>

If we want to use markdown within the component we can use the following code:

```md
<rocket-greeting>

This **is** great!

</rocket-greeting>
```

Note the empty lines between html & markdown. They are necessary as this is how the markdown parser separates unprocessed html from markdown.

</inline-notification>

## Manually Loading Components

We can define as many components as we want within a page but typically it's best to define them in a separate files.

So we will move our component code into a new file 👉 `/site/src/components/rocket-greeting.js`

While importing components we decide if we want to server or client render.

👉 `site/pages/index.rocket.js`

```js
// server side
import '../src/components/rocket-greeting.js';

// client side
export default () =>
  html` <script type="module" src="../src/components/rocket-greeting.js"></script> `;
```

👉 `site/pages/index.rocket.html`

```html
<!-- server side -->
<script type="module" server>
  import '../src/components/rocket-greeting.js';
</script>

<!-- client side -->
<script type="module">
  import '../src/components/rocket-greeting.js';
</script>
```

👉 `site/pages/index.rocket.md`

````md
## server side

```js server
import '../src/components/rocket-greeting.js';
```

## client side

```js client
import '../src/components/rocket-greeting.js';
```
````

## Automatically Load and Register Components

Instead of manually loading and registering components we can let rocket handle it for us.

First we need to adjust our component file

- Export the class
- Get rid of the registration side effect
- Rename the file `rocket-greeting.js` => `RocketGreeting.js`

```diff
- class RocketGreeting extends LitElement {
+ export class RocketGreeting extends LitElement {
  ...
  }
- customElements.define('rocket-greeting', RocketGreeting);
```

And then in our page we can export `components` with a function that dynamically loads the component.

```js
export const components = {
  'rocket-greeting': () =>
    import('../src/components/RocketGreeting.js').then(m => m.RocketGreeting),
};
```

Often themes/presets will come with multiple components and a convenient way to add them to Rocket `components`.
Typically we will spread those components in to our `components` object.

```js
import { rocketComponents } from '@rocket/components/components';
import { sparkComponents } from '@rocket/spark/components';

export const components = {
  ...rocketComponents,
  ...sparkComponents,
  'rocket-greeting': () =>
    import('../src/components/RocketGreeting.js').then(m => m.RocketGreeting),
};
```

### Site level components

Generally it make sense to put this export within `site/pages/recursive.data.js`.
Doing so means the component will be automatically available for all pages.

Let me repeat that:

- We **define / spread in all components** we wanna use within the whole website and then we **never have to worry about it again**.
- Rocket will handle **if and when the loading and registration should happen**. Be it client or server side or both in a very specific timing via hydration.
- Rocket will only load the components that are actually used which means that `components` can be a huge list without any performance impact.

<inline-notification type="warning">

Not yet fully implemented - currently all components are always loaded server side. Join the [GitHub](https://github.com/modernweb-dev/rocket/issues/308) discussion.

</inline-notification>

If we wish to disable or override a component then we can do so via

```js
// the automatic import will contain something like this
import { components as originalComponents } from '../path/to/recursive.data.js';

export const components = {
  ...originalComponents, // keep all the original components
  'rocket-greeting': false, // no automatic handling of this component
  'other-component': () => MyOtherComponent, // override the default component
};
```

### Hydration

Component that do not have any interactivity will never need to be hydrated so they may be imported statically on the server side.
All other component should be handled via the `components` object to enable handling of loading and registration.

Doing so enables hydration based on attributes on the component.

```html
<rocket-greeting render-mode="hydration"></rocket-greeting>
```

See the [Hydration Docs](./80--hydration.rocket.md) for more information.
