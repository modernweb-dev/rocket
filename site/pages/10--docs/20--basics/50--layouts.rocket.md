```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '10--docs/20--basics/50--layouts.rocket.md';
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

# Layouts

Layout are special in that sense that they output the full html page (including html, head, body, etc).

The simplest layout you can make is

```js
import { html } from 'lit';

export const layout = data => html`
  <!DOCTYPE html>
  <html>
    <head>
      <title>Rocket</title>
    </head>
    <body>
      ${data.content()}
    </body>
  </html>
`;
```

and that will work fine however now every page will have the same `title` in the head.

If we now have the following markdown file:

```md
# All about me
```

it will result in

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Rocket</title>
  </head>
  <body>
    <h1>All about me</h1>
  </body>
</html>
```

Now to define a title we can add it to the data object.

```js
import { html } from 'lit';

export const layout = data => html`
  <!DOCTYPE html>
  <html>
    <head>
      <title-server-only>${data.title}</title-server-only>
    </head>
    <body>
      ${data.content()}
    </body>
  </html>
`;
```

<inline-notification>

If we want to have dynamic attributes/content for some tags outside of the body we will need to add a `-server-only` suffix. The suffix will be removed before writing the final html.
For more details see the following [lit issue](https://github.com/lit/lit/issues/2441).

</inline-notification>

In order to provide this `data.title` we now need to export is within the page.
The code could look something like this.

````md
```js server
export const title = 'About';
```

# All about me
````

results in

```html
<!DOCTYPE html>
<html>
  <head>
    <title>About</title>
  </head>
  <body>
    <h1>All about me</h1>
  </body>
</html>
```

## Layout function composition

Function can be composed into layouts.

```js
const head = html`
  <link rel="icon" href="/favicon.ico" sizes="any" /><!-- 32x32 -->
  <link rel="icon" href="/icon.svg" type="image/svg+xml" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" /><!-- 180x180 -->
  <link rel="manifest" href="/site.webmanifest" />
`;

const layoutA = data => html`
  <!DOCTYPE html>
  <html>
    <head>
      ${head}
      <title-server-only>${data.title}</title-server-only>
    </head>
    <body>
      ${data.content()}
    </body>
  </html>
`;

const layoutB =

```

<inline-notification type="warning">

Partial html is not supported in [lit](http://lit.dev) as it uses the browser build in html parser which try to "auto correct" your html by closing tags.
e.g. this

<!-- prettier-ignore-start -->

```js
const mainStart = html`
  <main>
    <p>Always at the top</p>
`;

const mainEnd = html`
  </main>
`;

const layout = () => html`
  ${mainStart}
  <p>Hello World</p>
  ${mainEnd}
`;
```

<!-- prettier-ignore-end -->

will result in

```html
<main>
  <p>Always at the top</p>
</main>
<p>Hello World</p>
```

Which is most likely not what you want.

</inline-notification>

## Class based layouts

We can get the exact same result by using a class based layout.

```js
import { html } from 'lit';

class MyLayout {
  render(data) {
    return html`
      <!DOCTYPE html>
      <html>
        <head>
          <title-server-only>${data.title}</title-server-only>
        </head>
        <body>
          ${data.content()}
        </body>
      </html>
    `;
  }
}

export const layout = new MyLayout();
```

With classes we also get the possibility to use options.

```js
import { html } from 'lit';

class MyLayout {
  constructor(options) {
    this.options = {
      titleFn: originalTitle => `${originalTitle} - Rocket`,
    };
  }

  render(data) {
    return html`
      <!DOCTYPE html>
      <html>
        <head>
          <title-server-only>${this.options.titleFn(data.title)}</title-server-only>
        </head>
        <body>
          ${data.content()}
        </body>
      </html>
    `;
  }
}

export const layout = new MyLayout({
  titleFn: originalTitle => `${originalTitle} - Space Station`,
});
```

```html
<!DOCTYPE html>
<html>
  <head>
    <title>About - Space Station</title>
  </head>
  <body>
    <h1>All about me</h1>
  </body>
</html>
```
