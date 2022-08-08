```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '40--blog/002--sharing-time/index.rocket.md';
import { html, setupUnifiedPlugins, components, openGraphLayout } from '../../recursive.data.js';
import { layout } from '../recursive.data.js';
export { html, layout, setupUnifiedPlugins, components, openGraphLayout };
export async function registerCustomElements() {
  // server-only components
  // prettier-ignore
  customElements.define('rocket-social-link', await import('@rocket/components/social-link.js').then(m => m.RocketSocialLink));
  // prettier-ignore
  customElements.define('rocket-header', await import('@rocket/components/header.js').then(m => m.RocketHeader));
  // prettier-ignore
  customElements.define('launch-blog-details', await import('@rocket/launch/blog-details.js').then(m => m.LaunchBlogDetails));
  // prettier-ignore
  customElements.define('rocket-main', await import('@rocket/components/main.js').then(m => m.RocketMain));
  // prettier-ignore
  customElements.define('rocket-content-area', await import('@rocket/components/content-area.js').then(m => m.RocketContentArea));
  // hydrate-able components
  // prettier-ignore
  customElements.define('rocket-search', await import('@rocket/search/search.js').then(m => m.RocketSearch));
  // prettier-ignore
  customElements.define('rocket-drawer', await import('@rocket/components/drawer.js').then(m => m.RocketDrawer));
}
export const needsLoader = true;
/* END - Rocket auto generated - do not touch */
import { thomas } from '../../../src/data/authors.js';

export const description =
  'Let us take a look at Rocket which is sort of a nuxt/next equivalent but instead of vue/react it works best with web standards like custom elements, ES modules, template literals...';
export const publishDate = new Date('2022-03-23');

export const tags = ['rocket', 'javascript', 'node', 'SSG'];
export const authors = [thomas];
```

# Sharing time 🎉

I have been working a lot on `@rocket/engine` which you can see as a sort of a nuxt/next equivalent but instead of vue/react it works best with web standards like custom elements, ES modules, template literals...

---

You can write content in

➡️ JavaScript <br>
➡️ Markdown <br>
➡️ HTML <br>

Markdown and HTML are ultimately "compiled" to JavaScript and then rendered.

Let's take a closer look.

---

In `index.rocket.js` we see

➡️ an auto-generated file header <br>
➡️ usage of @buildWithLit's html to gain access to all its directives, helpers and to output safe HTML <br>
➡️ usage variables to define our content <br>
➡️ the export of a layout to separate content from its surrounding <br>

```js
// site/pages/index.rocket.js

/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '40--blog/002--sharing-time/index.rocket.md';
// prettier-ignore
import { html, layout, setupUnifiedPlugins, components, openGraphLayout } from '../../recursive.data.js';
export { html, layout, setupUnifiedPlugins, components, openGraphLayout };
/* END - Rocket auto generated - do not touch */

import { html } from 'lit';

const world = 'world!';
export default () => html`<h1>Hello ${world}</h1>`;

export const layout = data => html`
  <!DOCTYPE html>
  <html>
    <body>
      ${data.content()}
    </body>
  </html>
`;
```

---

Looking at the output we only see HTML which means that it is executed server-side and will NOT ship any JavaScript.

✨ Instead of nunjucks or liquid we use lit template literals as your template engine <br>
🤯 This means that you can share templates between server and client

```html
<!DOCTYPE html>
<html>
  <body>
    <h1>Hello world!</h1>
  </body>
</html>
```

---

We want to reuse that layout for all the pages of our site.
We want this handled by a very explicit and non-magical data cascade that injects content into the auto-generated header.

➡️ We move the `layout` export into `recursive.data.js` <br>
➡️ We let the system inject it <br>

```js
// site/pages/recursive.data.js

import { html } from 'lit';

export const layout = data => html`
  <!DOCTYPE html>
  <html>
    <body>
      ${data.content()}
    </body>
  </html>
`;

// for convenience we also export html here
// so we do not need to manually import it in our pages
export { html };
```

```js
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = 'index.rocket.js';
import { html, layout } from './recursive.data.js';
export { html, layout };
/* END - Rocket auto generated - do not touch */

const world = 'world!';
export default () => html`<h1>Hello ${world}</h1>`;
```

---

Only needing to write the actual content of every page makes it way nicer to use.

We can get the exact same HTML output via

➡️ Markdown using a code fence block `js server` <br>
➡️ HTML using a `script type="module" server` tag <br>

We can use template literals in all languages 🤯

````md
```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = 'page-a.rocket.md';
import { html, layout } from './recursive.data.js';
export { html, layout };
/* END - Rocket auto generated - do not touch */

const world = 'world!';
```

# Hello \\${world}
````

```html
<script type="module" server>
  /* START - Rocket auto generated - do not touch */
  export const sourceRelativeFilePath = 'page-b.rocket.html';
  import { html, layout } from './recursive.data.js';
  export { html, layout };
  /* END - Rocket auto generated - do not touch */

  const world = 'world!';
</script>

<h1>Hello ${world}</h1>
```

---

Now we add a web component to our page using markdown.

We define and register the component server-side which means that

➡️ It will output only HTML <br>
➡️ It works even with disabled JavaScript (as there is none) <br>

\*Non-chromium browsers need a polyfill for declarative shadow dom

````md
```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = 'page-a.rocket.md';
import { html, layout } from './recursive.data.js';
export { html, layout };
/* END - Rocket auto generated - do not touch */

const world = 'world!';
```

# Hello \\${world}

<my-warning>

This **is** a demo.

</my-warning>

```js server
import { LitElement, css } from 'lit';

class MyWarning extends LitElement {
  render() {
    return html`
      <strong>Warning:</strong>
      <p><slot></slot></p>
    `;
  }

  static styles = [
    css`
      :host {
        display: block;
        background: rgba(255, 229, 100, 0.2);
        padding: 0.1rem 1.5rem;
        border-left: solid 0.5rem #e7c000;
      }
      strong {
        color: #b29400;
      }
    `,
  ];
}
customElements.define('my-warning', MyWarning);
```
````

```html
<!DOCTYPE html>
<html>
  <body>
    <h1>Hello world!</h1>

    <my-warning>
      <template shadowroot="open">
        <style>
          :host {
            display: block;
            background: rgba(255, 229, 100, 0.2);
            padding: 0.1rem 1.5rem;
            border-left: solid 0.5rem #e7c000;
          }
          strong {
            color: #b29400;
          }
        </style>
        <strong>Warning:</strong>
        <p><slot></slot></p>
      </template>
      <p>This <strong>is</strong> a demo.</p>
    </my-warning>
  </body>
</html>
```

---

Defining a component within markdown will get problematic once we use it on multiple pages.

Let's use Rockets component loader.

1️⃣ Move component to `site/src/components/MyWarning.js` <br>
2️⃣ Export class and remove the registration <br>
3️⃣ Add the component to the component loader <br>

```js
// site/src/components/MyWarning.js
import { LitElement, html, css } from 'lit';

export class MyWarning extends LitElement {
  render() {
    return html`
      <strong>Warning:</strong>
      <p><slot></slot></p>
    `;
  }

  static styles = [
    css`
      :host {
        display: block;
        background: rgba(255, 229, 100, 0.2);
        padding: 0.1rem 1.5rem;
        border-left: solid 0.5rem #e7c000;
      }
      strong {
        color: #b29400;
      }
    `,
  ];
}
```

```js
// site/pages/recursive.data.js

export const components = {
  'my-warning', () => import('../src/components/MyWarning.js').then(m => m.MyWarning),
}
```

````md
```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = 'page-a.rocket.md';
import { html, layout, components } from './recursive.data.js';
export { html, layout, components };
/* END - Rocket auto generated - do not touch */

const world = 'world!';
```

# Hello \\${world}

<my-warning>

This **is** a demo.

</my-warning>
````

---

Now we can use all loader-defined components on every page.

Let me repeat that...

➡️ We add the components ONCE to the `export const components` <br>
➡️ Rocket will decide if and when the loading and registration should happen <br>

---

Components will be server-rendered by default and no JavaScript will be required
This opens up a whole new world of possibilities 🤯

➡️ Componentize our styles <br>
➡️ Only styles of components that we actually use will be shipped <br>
➡️ Sort of tree shaking for CSS on a component basis <br>

---

For Components with styles only server-side rendering is optimal. No JavaScript to send down the wire.
Components that handle user interaction client-side JavaScript is needed.

This process is called "hydration" - not fully there yet but we have a plan
https://github.com/modernweb-dev/rocket/issues/308

---

But there is more 🎉

During development, Rocket renders individual pages as you visit them which means that even if you have 10.000 pages it will still boot up in seconds.

Also, its rendering is "stupid" simple as it's basically just an import written to file.

```js
// simplified code
if (isMarkdownPage(pathToPageThatGetsRendered)) {
  pathToPageThatGetsRendered = convertMarkdownToJs(pathToPageThatGetsRendered);
}
if (isHtmlPage(pathToPageThatGetsRendered)) {
  pathToPageThatGetsRendered = convertHtmlToJs(pathToPageThatGetsRendered);
}

const { default: content, ...data } = await import(pathToPageThatGetsRendered);
data.content = content;

if (data.layout) {
  data.content = data.layout(data.content);
}

const outputPath = getOutputPath(outputDir, data.sourceRelativeFilePath);

await fs.writeFile(outputPath, data.content);
```

---

Rockets complexity is for Developer Experience:

➡️ A dependency tree of rendered pages for smart rerenders and reloads <br>
➡️ A PageTree to render menus without touching other files <br>
➡️ Rendering via workers that get cycled as the es module graph changes (there is no way to clear it) <br>

---

If you gonna pick rocket up you will find it very intuitive as there is a 1:1 mapping between files and url.

Add files to the `site/pages` folder and they will be rendered as you visit them.

```
// Static routes
docs/index.rocket.md        -> mysite.com/
docs/about.rocket.md        -> mysite.com/about/
docs/about/index.rocket.js  -> mysite.com/about/
docs/about/me.rocket.html   -> mysite.com/about/me/
docs/posts/1.md             -> mysite.com/posts/1/


// Non index.html pages
docs/404.html.rocket.js           -> mysite.com/404.html
docs/about/hidden.html.rocket.js  -> mysite.com/about/hidden.html

// Non HTML files
docs/sitemap.xml.rocket.js           -> mysite.com/sitemap.xml
docs/robot.txt.rocket.js             -> mysite.com/robot.txt
docs/about/background.svg.rocket.js  -> mysite.com/about/background.svg
```

---

Rocket handles assets uniquely by referencing the original location you define via relative link or node resolution (probably the ONLY non-standard feature of Rocket)

This means that

➡️ Relative URL within assets will work <br>
➡️ Less work during development as there is NO copying <br>

```html
<!-- site/pages/about/bridge.rocket.html -->

<img src="./assets/bridge.png" alt="Bridge" />
<!-- ⬇️ becomes ⬇️ -->
<img src="/__wds-outside-root__/1/site/pages/about/assets/bridge.png" alt="Bridge" />

<link rel="stylesheet" href="resolve:@pkg/something/style.css" />
<!-- ⬇️ becomes ⬇️ -->
<link rel="stylesheet" href="/__wds-outside-root__/1/node_modules/@pkg/something/style.css" />

<!--
  # node resolution supports private imports
  
  👉 package.json
  "imports": {
    "logo": "./site/src/images/logo.png"
  }
-->
<img src="resolve:#logo" alt="Logo" />
<!-- ⬇️ becomes ⬇️ -->
<img src="/__wds-outside-root__/1/site/src/images/logo.png" alt="Logo" />
```

---

🚧 All the packages are released in alpha state <br>
💡 The docs have all the core concepts explained but are still incomplete

Wanna know more? 🤔

Visit the WIP homepage
https://next.rocket.modern-web.dev/

---

💬 We are very hungry for feedback - to make sure Rocket steers in the right direction

If you have any questions, comments or suggestions, please open an issue, create a pull request or join us on Discord or Slack.

https://next.rocket.modern-web.dev/chat

---

Interested?

🕑 Getting started takes you only 5 minutes <br>
🏃‍♂️ Run "npx @rocket/create@latest" in the terminal <br>
🎯 Choose your template and start coding! <br>

PS: It creates a folder for you now worries 🤗

```
npx @rocket/create@latest
        |          Welcome to Rocket! (®rocket/create v0.0.5)
       / \         Everyone can code a website
      / _ \
     |.o '.|       You are about to embark upon a new mission 🚀.
     |'._.'|
     |     |
   ,'|  |  |`.
  /  |  |  |  \    If you encounter a problem, visit
  |,-'--|--'-.|      https://github.com/modernweb-dev/rocket/issues
      ( | )        to search or file a new issue
     ((   ))
    ((  :  ))      Follow us: https://twitter.com/modern_web_dev
     ((   ))       Chat with us: https://next.rocket.modern-web.dev/chat
      (( ))
       ( )         Notes: You can exit any time with Ctrl+C or Esc
        .                 A new folder "rocket-<template name>" will be created
        .

? Which Starter Template would you like to use? › - Use arrow-keys. Return to submit.
    Blog - Get started with a new blog
❯   Landing Page (Spark Theme)
    Minimal
    Custom (community built)
```

---

What do you get?

For example the Landing Page

➡️ it uses 10+ web components <br>
➡️ ONLY one gets shipped via JS to the user <br>
➡️ Rearrange or reuse those components in any way you want <br>

See live demo
https://next.rocket.modern-web.dev/presets/spark/demo/

---

What can you expect in the future?

➡️ We build this in public and open source <br>
➡️ Partial Hydration / Island Architecture <br>
➡️ Open Graph Images <br>
➡️ Search <br>
➡️ Your suggestion 🤗 <br>

---

To finish up I wanna thank all those awesome projects that inspired Rocket.

➡️ @buildWithLit for an awesome community, SSR, template literals on steroids, and an effective way to write web components <br>
➡️ @eleven_ty for the data cascade and for being a super honest project <br>

---

➡️ @astrodotbuild for bringing the island architecture to the masses - also some docs and examples are ported from it <br>
➡️ next/nuxt as a landmark on features users need <br>
➡️ remix for pioneering "back to HTML with React" <br>
