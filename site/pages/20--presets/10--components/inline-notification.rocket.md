```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '20--presets/10--components/inline-notification.rocket.md';
import { html, layout, setupUnifiedPlugins, components } from '../../recursive.data.js';
export { html, layout, setupUnifiedPlugins, components };
/* END - Rocket auto generated - do not touch */

import { InlineNotification } from '@rocket/components';
customElements.define('inline-notification', InlineNotification);
```

# Inline Notification

Launch ships with `<inline-notification>`, a custom element that applies some styles similar to "info boxes".

To add an inline notification you need to import the element definition:

````md
```js server
import { InlineNotification } from '@rocket/components';
customElements.define('inline-notification', InlineNotification);
```
````

Then you can add your notification to the page. If you want to write the notification's content using markdown, pad the opening and closing tags with empty lines.

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
