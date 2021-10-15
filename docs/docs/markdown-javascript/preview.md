# Markdown JavaScript >> Preview ||20

You can showcase live running code by annotating a code block with `js preview-story`.

## Features

- Shows components inside the page as they are
- You can enable “Simulation Mode” to break them out
- Simulation mode renders in an iframe to supporting media queries and isolated Simulation settings
- Simulation Settings
  - Style (windows, mac, android, iOS)
  - Size (small, medium, large, Galaxy S5, iPhone X, iPad …)
  - Automatic Height
  - Theme (light, dark)
  - Language (en, nl, …)
- Settings are ”global” for all Simulators (e.g. changing one will change all)
- Settings can be remembered for other pages / return visits

```js script
import { html } from '@mdjs/mdjs-preview';
import './assets/demo-element.js';
```

## JavaScript Story

````md
```js script
import { html } from '@mdjs/mdjs-preview';
import './assets/demo-element.js';
```

```js preview-story
export const foo = () => html`<demo-element></demo-element>`;
```
````

will result in

```js preview-story
export const foo = () => html` <demo-element></demo-element> `;
```

```js story-code
// not defined for android
```

```js story-code
// not defined for ios
```

#### Story Code

If your preview is followed by a code blocks marked as `story-code` then those will be shown when switching between multiple platforms

````md
```js preview-story
// will be visible when platform web is selected
export const JsPreviewStory = () => html` <demo-element></demo-element> `;
```

```xml story-code
<!-- will be visible when platform android is selected -->
<Button
    android:id="@+id/demoElement"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="Android Code"
    style="@style/Widget.Demo.Element"
/>
```

```swift story-code
// will be visible when platform ios is selected
import Demo.Element

let card = DemoElement()
```
````

See it in action by opening up the code block and switching platforms

```js preview-story
// will be visible when platform web is selected
export const JsPreviewStory = () => html` <demo-element></demo-element> `;
```

```xml story-code
<!-- will be visible when platform android is selected -->
<Button
    android:id="@+id/demoElement"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="Android Code"
    style="@style/Widget.Demo.Element"
/>
```

```swift story-code
// will be visible when platform ios is selected
import Demo.Element

let card = DemoElement()
```

## HTML Story

````md
```html preview-story
<demo-element></demo-element>
```
````

will result in

```html preview-story
<demo-element></demo-element>
```

## Setup Simulation Mode

For simulation mode we need a dedicated html file that will be used as an iframe target while loading stories.

The fastest way to create such a file is to use the `layout-simulator` layout.

Create a file `docs/simulator.md` with the following content.

```md
---
layout: layout-simulator
eleventyExcludeFromCollections: true
excludeFromSearch: true
---
```

Once you have that you need to configure it for the story renderer by setting it in your `rocket.config.js`.

<!-- prettier-ignore-start -->
```js
/** @type {import('rocket/cli').RocketCliConfig} */
export default ({
  setupUnifiedPlugins: [
    adjustPluginOptions('mdjsSetupCode', {
      simulationSettings: { simulatorUrl: '/simulator/' },
    }),
  ],
});
```
<!-- prettier-ignore-end -->

<inline-notification type="tip">

You can freely choose the path for the "simulator" by creating the md file in a different folder and adjusting the path in the config.

</inline-notification>

## Simulator states

To simulate these stats that usually come from the device itself we put those infos on the document tag.

We can simulate the following settings

1. `platform`
   Adopting styles and behavior depending on which device platform you are.
   ```html
   <html platform="web"></html>
   <html platform="android"></html>
   <html platform="ios"></html>
   <!-- potentially later -->
   <html platform="web-windows"></html>
   <html platform="web-mac"></html>
   ```
2. `theme`
   Adjust your styles based on a theme - light/dark are the default but you can add as many as you want.
   ```html
   <html theme="light"></html>
   <html theme="dark"></html>
   ```
3. `language`
   Best to relay on `data-lang` as `lang` often gets changes by translations services which may interfere with your translation loading system.
   ```html
   <html lang="en-US" data-lang="en-US"></html>
   <html lang="de-DE" data-lang="de-DE"></html>
   ```

If you want to react to such document changes you can use an [MutationObserver](https://developer.mozilla.org/de/docs/Web/API/MutationObserver).

For a vanilla web component it could look something like this:

```js
class DemoElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this.platform = 'the web';
    this.language = 'en-US';
    this.theme = 'light';

    this.observer = new MutationObserver(this.updateData);
  }

  updateData = () => {
    this.platform = document.documentElement.getAttribute('platform') || 'the web';
    this.language = document.documentElement.getAttribute('data-lang') || 'en-US';
    this.theme = document.documentElement.getAttribute('theme') || 'light';
    this.requestUpdate();
  };

  connectedCallback() {
    this.updateData();

    this.observer.observe(document.documentElement, { attributes: true });
  }

  requestUpdate() {
    this.shadowRoot.innerHTML = this.render();
  }

  render() {
    return `
      ...
    `;
  }
}

customElements.define('demo-element', DemoElement);
```

```js script
import '@rocket/launch/inline-notification/inline-notification.js';
```
