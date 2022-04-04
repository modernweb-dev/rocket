```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '10--docs/20--basics/80--hydration.rocket.md';
// prettier-ignore
import { html, layout, setupUnifiedPlugins, components, openGraphLayout } from '../../recursive.data.js';
export { html, layout, setupUnifiedPlugins, components, openGraphLayout };
export async function registerCustomElements() {
  // server-only components
  // prettier-ignore
  customElements.define('inline-notification', await import('@rocket/components/components/InlineNotification').then(m => m.InlineNotification));
  // hydrate-able components
  customElements.define('my-counter', await import('#components/MyCounter').then(m => m.MyCounter));
  // client-only components
  // 'rocket-search': () => import('@rocket/search/web').then(m => m.RocketSearch),
  // 'rocket-drawer': () => import('@rocket/drawer').then(m => m.RocketDrawer),
}
/* END - Rocket auto generated - do not touch */
```

# Hydration

By default all components are only rendered on the server.
This however means those components are "static" and can not add interactivity.

To add interactivity to your component you can either render it only on the client or you can render on the server and `hydrate` it on the client.

## Progressive Hydration

With Rocket we recommend to use progressive Hydration.

You can see it as <br>
➡️ Start with 0 JavaScript <br>
➡️ Load JavaScript of components as needed

In practice this means we use components without any loading strategy if we want server rendering.
For a static site like a blog this will be almost all of my components.
But some components will have interactivity and those will need to be hydrated.

In the following example we have two components being only server rendered and one being hydrated.

```html
<blog-header></blog-header>
<p>Here is more text</p>
<blog-author></blog-author>

<blog-newsletter-sign-up loading="hydrate:onClick"></blog-newsletter-sign-up>
```

- If this is the only content on the page it means it will load with zero JavaScript 🎉.
- If we use the sign up then the JS of `blog-newsletter-sign-up` will be loaded to give feedback about a valid email address.
- If we don't then no additional JS will be loaded at all.

<inline-notification>

The automatic loading/hydration only works if you [register components to the rocket loader](./40--components.rocket.md).

</inline-notification>

## Server Loading

Server Loading has almost zero impact on the client side page performance and is therefore fastest possible solution available.

Loading and rendering on the server is the default and for that reasons does not need to be specified.

```html
<blog-header></blog-header>
```

will result in a server rendering only.

The output will be a [Declarative Shadow Dom (DSD)](https://web.dev/declarative-shadow-dom/).

```html
<blog-header>
  <template shadowroot="open">
    <style>
      :host {
        display: block;
      }
      h1 {
        color: red;
      }
    </style>
    <h1>Welcome to my Blog</h1>
  </template>
</blog-header>
```

which looks like this

<div style="border: 1px solid green; padding: 10px; margin-bottom: 10px;">
<blog-header>
  <template shadowroot="open">
    <style>
      :host {
        display: block;
      }
      h1 {
        color: red;
      }
    </style>
    <h1>Welcome to my Blog</h1>
  </template>
</blog-header>
</div>

Open it on [Codepen](https://codepen.io/daKmoR/pen/qBpQVGK) to play around.

A DSD does not need any JavaScript (in 2022: none chromium browser need a polyfill) to display elements with their styles scoped.

If possible you should always render your component only on the server to avoid unnecessary JavaScript.
This results in the best possible site performance.

Server only rendered components however can never be interactive. For interactive components you need JavaScript which you can bring by using progressive hydration.

## Hydration Loading

Hydration Loading roughly has a medium impact on the client side page performance. For the initial load there is almost zero impact and we then decide when to take the performance hit by loading and executing the JavaScript of components.

Hydration Loading becomes necessary as soon as we need interactive components.
In Rocket we recommend to progressively hydrate based on user actions.

For example a counter only server rendered will not work as expected.

```html
<my-counter loading="server"></my-counter>
<!-- you could omit the `loading="server"` as it's the default -->
```

👇 the +/- buttons will not do anything

<div style="border: 1px solid green; padding: 10px; margin-bottom: 10px;">
  <my-counter></my-counter>
</div>

To "enable" it we set the `loading` attribute for example to `hydrate:onClick`.

```html
<my-counter loading="hydrate:onClick"></my-counter>
```

👇 now if we click the +/- buttons the component will hydrate and the counter works

<div style="border: 1px solid green; padding: 10px; margin-bottom: 10px;">
  <my-counter loading="hydrate:onClick"></my-counter>
</div>

<inline-notification>

After you clicked on the 2nd example the 1st example will start working as well.
The reason for that is that it's the same component `my-counter`.
Once you hydrate a component it will hydrate all its instances.

</inline-notification>

### Hydration Conditions

You can specify and combine multiple conditions on when to hydrate a component.

```html
<my-el loading="hydrate:[[ one or multiple conditions ]]"></my-el>
```

| Option                         | Description                                                                             |
| ------------------------------ | --------------------------------------------------------------------------------------- |
| onClientLoad                   | as soon as possible                                                                     |
| onClick                        | as you click on the element                                                             |
| onMedia                        | as soon as a media query is met                                                         |
| onVisible                      | as soon as component + optional padding becomes visible                                 |
| onHover (⚠️ not implemented)   | as you hover over the element + optional padding (click triggers hover => touchscreens) |
| withIdle (⚠️ not implemented)  | as soon there is a free slot in the main thread                                         |
| withDelay (⚠️ not implemented) | after x ms                                                                              |

Each of the options can be combined via `&&` or `||`.

| Example                                                         | Description                                                                                          |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `onClientLoad`                                                  | above the fold element that should become interactive as soon as possible                            |
| `onMedia('(max-width: 320px)')`                                 | mobile burger menu that triggers a drawer for navigation (only hydrate on screens smaller then 320p) |
| `onMedia('(min-width: 640px)') && onClick`                      | chart that only becomes interactive on desktop after a click                                         |
| `onMedia('(prefers-reduced-motion: no-preference)') && onClick` | a visual animation that plays on click only if there is no prefers-reduced-motion                    |
| `onVisible`                                                     | heavy chart that becomes interactive when element becomes visible                                    |
| `onVisible(100px)`                                              | heavy chart that becomes interactive when element + 100px padding becomes visible                    |

<inline-notification type="warning">

Hydration Loading does not (yet) support passing complex SSR data via properties. e.g. components that want to hydrate can only use attributes for now.

</inline-notification>

## Client Loading

Client Loading has a large impact on the client side page performance.
It means nothing happens on the server and the JavaScript for the component gets shipped and instantly executed to render the "initial" paint of the component.

HTML with components using client loading is shipped as is.

```html
<my-el loading="client"></my-el>
```

As the HTML does not contain any details of the content within `my-el` it also means that SEO might be impacted.

When will we still use Client Loading?

- Components that can not be server rendered
  - Technical reasons like usage of `canvas` or `webgl` which can not be "rendered" into HTML
  - Components may do things that hit some of the SSR limitation
  - SSR Limitations means to only do imperative manipulation of the DOM in `update, updated, firstUpdated` for more see [lit-ssr docs](https://github.com/lit/lit/tree/main/packages/labs/ssr#notes-and-limitations)
  - Web Components SSR is pretty new so some components may need adjustments before they can work with SSR
- Components that require user data do not make sense to SSR if using Build Time SSR.

## Loading Strategy Impacts

Which loading strategy you choose will have an impact on the performance of your page.
The higher the impact the more JavaScript you send to the client which will result in lower performance.

If you use a component on the same page with different loading strategies then the following impacts applies

1. client (high impact)
2. hydrate (medium impact)
3. server (low impact)

The loading strategy with the highest impact will be applied to all components.

```html
<my-component loading="client"></my-component>
<my-component loading="hydrate:*"></my-component>
<my-component loading="server"></my-component>
```

Results in `client rendering` of all `my-component`s.

<!-- prettier-ignore-start -->
```html
<my-component loading="hydrate:*"></my-component>
<my-component loading="server"></my-component>
```
<!-- prettier-ignore-end -->

Results in `server+hydration rendering` of all `my-component`s.

<!-- prettier-ignore-start -->
```html
<my-component loading="server"></my-component>
<my-component></my-component>
```
<!-- prettier-ignore-end -->

Results in `server rendering` of all `my-component`s.

Why theses impacts?

1. client - if you eagerly load & render the component on the client then bloating the html of some components by server rendering does not bring any benefit
2. hydrate - hydration means that all component with the same tag name will be hydrated on the client - you can not keep a server only variation of a component
3. server - almost zero client side impact

<inline-notification>

Always try to load all components of a page with the same (lowest) impact if possible.

</inline-notification>
