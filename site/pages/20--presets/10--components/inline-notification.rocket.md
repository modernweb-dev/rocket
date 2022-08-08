```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '20--presets/10--components/inline-notification.rocket.md';
// prettier-ignore
import { html, layout, setupUnifiedPlugins, components, openGraphLayout } from '../../recursive.data.js';
export { html, layout, setupUnifiedPlugins, components, openGraphLayout };
export async function registerCustomElements() {
  // server-only components
  // prettier-ignore
  customElements.define('rocket-social-link', await import('@rocket/components/social-link.js').then(m => m.RocketSocialLink));
  // prettier-ignore
  customElements.define('rocket-header', await import('@rocket/components/header.js').then(m => m.RocketHeader));
  // prettier-ignore
  customElements.define('inline-notification', await import('@rocket/components/inline-notification.js').then(m => m.InlineNotification));
  // prettier-ignore
  customElements.define('rocket-main-docs', await import('@rocket/components/main-docs.js').then(m => m.RocketMainDocs));
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
```

# Inline Notification

Components ships with `<inline-notification>`, a custom element that applies some styles similar to "info boxes".

To add all components to the rocket loader add this to `site/pages/recursive.data.js`:

```js
import { rocketComponents } from '@rocket/components/components.js';

export const components = {
  ...rocketComponents,
};
```

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
