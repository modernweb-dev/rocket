```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '20--presets/10--launch/10--overview.rocket.md';
import { html, layout, setupUnifiedPlugins } from '../../recursive.data.js';
export { html, layout, setupUnifiedPlugins };
/* END - Rocket auto generated - do not touch */

import '@rocket/launch/inline-notification/define';
```

# Overview

Rocket comes with a preset you will love. Simple, responsive and behaving like native, it sure is going to be a hit among your users.

## Installation

Install `@rocket/launch` from the NPM repository

```bash
npm i @rocket/launch
```

## Usage

👉 `config/rocket.config.js`

```js
import { rocketLaunch } from '@rocket/launch';

/** @type {import('rocket/cli').RocketCliConfig} */
export default {
  presets: [rocketLaunch()],
};
```

## Data

You can define your own data for the available Layouts.

## Inline Notification

```js script

```

Launch ships with `<inline-notification>`, a custom element that applies some styles similar to "info boxes". The element works for `<noscript>` users as well, as long as you don't [override](/guides/presets/overriding/) the default `noscript.css` file.

To add an inline notification you need to remember to import the element definition:

````md
```js server
import '@rocket/launch/inline-notification/define';
```
````

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

<inline-notification type="tip">

Take a tip from me

</inline-notification>

```md
<inline-notification type="tip">

Take a tip from me

</inline-notification>
```

<inline-notification type="warning">

Be _sure_ about this...

</inline-notification>

```md
<inline-notification type="warning">

Be _sure_ about this...

</inline-notification>
```

<inline-notification type="danger">

You **really** shouldn't!

</inline-notification>

```md
<inline-notification type="danger">

You **really** shouldn't!

</inline-notification>
```

### Modify the Title

The notification title defaults to it's type. You can write a custom title with the `title` attribute.

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
