---
alerts:
  - type: tip
    content: Take a tip from me
  - type: warning
    content: Be *sure* about this...
  - type: danger
    content: You **really** shouldn't!
---

# Presets >> Launch || 20

Rocket comes with a preset you will love. Simple, responsive and behaving like native, it sure is going to be a hit among your users.

## Installation

Install `@rocket/launch` from the NPM repository using your favourite package manager.

<code-tabs collection="package-managers" default-tab="npm">

```bash tab npm
npm i @rocket/launch
```

```bash tab yarn
yarn add @rocket/launch
```

```bash tab pnpm
pnpm add @rocket/launch
```

</code-tabs>

## Usage

👉 `rocket.config.js`

```js
import { rocketLaunch } from '@rocket/launch';

export default {
  presets: [rocketLaunch()],
};
```

## Data

The launch preset configures [11ty data](https://www.11ty.dev/docs/data/) using a few overridable files:

- `site.cjs`: Responsible for most of the site-wide config
- `rocketLaunch.json`: configures the homepage layout
- `footer.json`: Configures the content of the footer

## Inline Notification

```js script
import '@rocket/launch/inline-notification/inline-notification.js';
```

Launch ships with `<inline-notification>`, a custom element that applies some styles similar to "info boxes". The element works for `<noscript>` users as well, as long as you don't [override](/guides/presets/overriding/) the default `noscript.css` file.

To add an inline notification you need to remember to import the element definition:

<!-- prettier-ignore-start -->
~~~markdown
```js script
import '@rocket/launch/inline-notification/inline-notification.js';
```
~~~
<!-- prettier-ignore-end -->

Then you can add your notification to the page. If you want to write the notification's content using markdown, just pad the opening and closing tags with empty lines.

There are three varieties of `<inline-notification>`, "tip", "warning", and "danger"

<style>
#inline-notifications::part(tab) {
  text-transform: capitalize;
}
#inline-notifications code-tab::part(content) {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}
#inline-notifications code-copy::part(copy-button) {
  position: absolute;
  top: 10px;
  border-radius: 6px;
  border: 1px solid var(--primary-lines-color);
}
</style>

<code-tabs id="inline-notifications" default-tab="tip">

{%for alert in alerts%}

<code-tab data-label="{{ alert.type }}" data-id="{{ alert.type }}" no-copy>

```md copy
<inline-notification type="{{ alert.type }}">

{{ alert.content | safe }}

</inline-notification>
```

<inline-notification type="{{ alert.type }}">

{{ alert.content | safe }}

</inline-notification>

</code-tab>

{%endfor%}

</code-tabs>

### Modify the Title

The notification title defautls to it's type. You can write a custom title with the `title` attribute.

<inline-notification type="tip" title="success">

I am a success message

</inline-notification>

```md
<inline-notification type="tip" title="success">

I am a success message

</inline-notification>
```

<inline-notification type="warning">

The `title` attribute does not change the title for `<noscript>` users, so don't include any critical information in it.

</inline-notification>
