```js server
export const config = {
  path: '/reference/rocket-icon',
  metadata: {
    title: 'Rocket Icon',
    description:
      'Render trusted SVG icons with the built-in rocket-icon component, Icon Libraries, and generated assets.',
    custom: {
      atlasDoc: {
        asideTip: {
          title: 'Icon tip',
          description:
            'Use server-loaded icons for important UI; reserve client-loaded icons for lower-priority decorative content.',
        },
      },
    },
  },
  menu: {
    linkText: 'Rocket Icon',
    iconName: 'alarm',
    order: 50,
  },
};

import { atlasDocLayout } from '@rocket/js/layouts/atlasDoc.js';
export { atlasDocComponents as components } from '@rocket/js/layouts/atlasDoc.js';
import { globalData } from '../globalData.js';

export const layout = pageData => atlasDocLayout(pageData, globalData);
```

# Rocket Icon

`rocket-icon` is Rocket's built-in Registered Component for trusted SVG icons. Site Authors can use
it in Markdown or JavaScript Pages without adding a Page-local component registration.

Example:

```html
<rocket-icon
  library="bootstrap"
  name="alarm"
  icon-loading="server"
  aria-hidden="true"
></rocket-icon>
```

Result:

<rocket-icon library="bootstrap" name="alarm" icon-loading="server" aria-hidden="true"></rocket-icon>

## Attributes

`name` is required. Icon names come from the basename of the configured SVG file, so
`icons/alarm.svg` is referenced as `name="alarm"`.

`library` selects a configured Icon Library. When `library` is omitted, Rocket uses the active
Default Icon Library from project config, then layout config, then the only available library when
exactly one exists. If multiple libraries are available and no default is selected, unqualified icons
fail and should add `library`.

`icon-loading` controls where the SVG is loaded:

| Value    | Behavior                                                                 |
| -------- | ------------------------------------------------------------------------ |
| `server` | Render the SVG into the initial HTML.                                    |
| `client` | Keep stable text-relative geometry in HTML, then fetch after visibility. |
| `auto`   | Default behavior when the attribute is omitted.                          |

Omitted `icon-loading` means `auto`, which server-renders unless a later loading policy defers it.

## Server rendering

During server rendering, Rocket keeps the `rocket-icon` host in the final DOM and adds Declarative
Shadow DOM containing a stable `<span part="icon">` wrapper around the raw SVG. Host attributes such
as `class`, `library`, `name`, `icon-loading`, and ARIA attributes stay author-facing.

Rocket does not add `size`, and it does not write `icon-loading="auto"` when the attribute was
omitted.

Use `icon-loading="server"` when the icon must be present in the first HTML response, such as a
navigation affordance, status marker, or button icon.

## Automatic loading regions

Use an Icon Loading Region when a long icon-heavy section should server-render only its first
automatic icons and defer the rest to the client manifest path. Add `icon-loading-region` to the
rendered container and set `icon-server-budget` to a non-negative integer:

```html
<nav icon-loading-region icon-server-budget="4">
  <rocket-icon name="house"></rocket-icon>
  <rocket-icon name="search"></rocket-icon>
  <!-- Later automatic icons in this region defer after the budget is spent. -->
</nav>
```

`icon-loading-region` is presence-only. A value such as `icon-loading-region="sidebar"` is accepted
and ignored.

`icon-server-budget="0"` is valid and defers every automatic icon in that region. Empty, negative,
decimal, and non-numeric budgets fail during server finalization.

Budgets count only automatic Icon Components in rendered DOM order. Explicit
`icon-loading="server"` and `icon-loading="client"` bypass the budget and do not consume it.

Nested regions are independent. The nearest ancestor Icon Loading Region owns automatic icons, child
regions do not consume the parent budget, and the parent budget continues after the child region.
A region without `icon-server-budget` is still an independent boundary, but its budget is unlimited.

There is no hidden global cap for automatic icons. Outside a region with a spent budget, `auto`
server-renders by default. Rocket does not measure the browser fold during build or server render;
regions are the author-controlled above-the-fold approximation.

## Client loading

Use `icon-loading="client"` for lower-priority icons that should not inline SVG into the initial
HTML.

Client-loaded icons and automatic icons deferred by a region emit an Icon Manifest and a small
`rocket-icon` browser runtime on that Page. The manifest maps deterministic Icon Reference keys such
as `bootstrap:alarm` to Rocket-generated local SVG files under `/_rocket/icons/`.

Pages with browser-loaded Registered Components also emit the Icon Manifest and browser runtime,
because those components may create `rocket-icon` elements after server rendering. Component
Loading Strategies of `client` and `hydrate:*` count as browser-loaded; pure `server` components do
not.

The browser runtime treats this manifest as authoritative: it never creates asset URLs itself, and a
client-created or changed icon can fetch only Icon References already present in the Page manifest.
Missing manifest entries warn during development and leave the stable empty fallback in place.

Pages with only server-rendered icons and no browser-loaded Registered Components do not emit an Icon
Manifest or load the `rocket-icon` browser runtime.

Example:

```html
<rocket-icon library="bootstrap" name="window-fullscreen" icon-loading="client"></rocket-icon>
```

Result:
<rocket-icon library="bootstrap" name="window-fullscreen" icon-loading="client"></rocket-icon>

## Dynamic browser icons

When Rocket emits an Icon Manifest, it includes every Icon Reference found in the rendered Page,
including server-inlined icons, plus explicit Page config and `PageData` Icon References.
Browser-created icons can use qualified references such as `library="bootstrap" name="alarm"`, or
unqualified `name` values when the manifest includes a `defaultLibrary`.

The browser cannot server-render a newly created icon. In development, missing or empty `name`,
unknown manifest entries, `icon-loading="server"`, and invalid `icon-loading` values warn and leave
or use the stable client fallback. `icon-loading="server"` and invalid values behave as client-loaded
in the browser.

If client code, a `js demo`, or a browser-loaded component creates icons that are absent from the
server-rendered HTML, include those references in the Page config:

```js label="Page config"
export const config = {
  path: '/examples/component-showcase',
  iconReferences: [
    { library: 'bootstrap', name: 'plus-square' },
    { library: 'bootstrap', name: 'dash-square' },
  ],
};
```

Layouts and JavaScript Pages can also call `pageData.addIconReferences(...)` during render for
layout-owned or data-driven browser icons.

After upgrade, changes to `name`, `library`, or `icon-loading` clear the current SVG immediately and
resolve again through the manifest. Changing to an Icon Reference absent from the manifest does not
leave the previous SVG visible. Changes to `aria-label` or `aria-labelledby` update host
accessibility semantics without changing the Icon Reference or fetching SVG again.

Repeated browser icons share a class-local SVG text cache keyed by manifest URL. In-flight and
successful fetches are reused. Failed fetches are evicted, warn in development for each attempt, and
can retry when a later icon tries the same manifest URL.

## Icon Libraries

Project-level Icon Libraries are configured in `rocket-config.js`:

```js label="rocket-config.js"
import { iconsFromPackage, iconsFromPath } from '@rocket/js/icons.js';

export default {
  includeGlobs: ['src/pages/**/*.rocket.{md,js}'],
  iconLibraries: {
    bootstrap: iconsFromPackage('bootstrap-icons', 'icons/*.svg'),
    local: iconsFromPath('./src/icons/*.svg'),
  },
  defaultIconLibrary: 'bootstrap',
};
```

Atlas and Rocket's default document layout supply a Bootstrap Icons library for layout-owned icons.
Project libraries are layered with layout libraries, but a project library name cannot collide with
an active layout library name in this first slice.

For the full configuration shape, see [Configuration](/reference/configuration).

## Migrating from wa-icon

Use `rocket-icon` for static documentation icons that should be visible in the first HTML response:

```html
<wa-callout>
  <rocket-icon slot="icon" name="info-circle"></rocket-icon>
  This icon resolves through the active Default Icon Library.
</wa-callout>
```

Reusable layouts should add their own Icon Libraries during render and use explicit `library` values
for layout-owned icon choices:

```js label="custom layout icon setup"
import { addBootstrapIconLibrary } from '@rocket/js/icons.js';
import { document } from '@rocket/js/layout-helper.js';

export const layout = pageData => {
  addBootstrapIconLibrary(pageData);
  return document(pageData, pageData.content);
};
```

```html
<rocket-icon library="bootstrap" name="arrow-up-right" aria-hidden="true"></rocket-icon>
```

For lower-level configuration, `@rocket/js/icons.js` also exports
`rocketBootstrapIconLibraries` and `rocketDefaultBootstrapIconLibrary`.

Page-configured Atlas menu icons, such as `menu.iconName`, are author-owned names. Keep them
unqualified in the Page config; Atlas resolves them through the active Default Icon Library until the
menu API grows an explicit library field.

Keep `wa-icon` when the Page is intentionally demonstrating Web Awesome itself, or when a Web
Awesome component example needs Web Awesome-specific icon features such as `family`, `variant`, or
custom Web Awesome icon libraries.

## Generated assets

When a Page uses `icon-loading="client"`, defers automatic icons through a region, or has
browser-loaded Registered Components, Rocket resolves the Icon References during server rendering,
emits an Icon Manifest, and publishes only the referenced SVG files as generated local assets.
Generated asset URLs are deterministic Rocket-owned paths with content hashes, such as
`/_rocket/icons/bootstrap/alarm.4f3a2c9d8e11.svg`.

Static builds publish only the generated SVG files referenced by emitted manifests, not whole Icon
Libraries. The development server serves the same generated URL shape. Generated client-fetched
assets are raw SVG files served as `image/svg+xml`.

Server-rendered deployment adapters must preserve the same Icon Library Configuration and SVG source
files needed for request-time resolution. Rocket's Netlify adapter routes emitted Icon Manifest
asset URLs and the `rocket-icon` browser runtime through the generated function, so request-time
Pages keep the same deterministic URL behavior as static output.

## Styling and accessibility

Style the host element from authored CSS and use the `part="icon"` wrapper when a component needs to
target the rendered icon content.

Use normal ARIA attributes on the host. Decorative icons should usually set `aria-hidden="true"`.
Meaningful icons should have an accessible name from surrounding text or an appropriate ARIA label.

## Troubleshooting

- Missing `name`: add a non-empty `name` attribute.
- Invalid `icon-loading`: use `auto`, `server`, or `client`, or omit the attribute for `auto`.
- Invalid `icon-server-budget`: use a non-negative integer such as `0`, `4`, or `12`.
- Unknown library: configure the library in `rocket-config.js` or use a layout-provided library.
- Ambiguous unqualified icon: set `defaultIconLibrary` or add `library`.
- Client icon stays empty: make sure the Icon Reference was present during server rendering so it can
  be included in the Page manifest.
