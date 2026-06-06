```js server
export const config = {
  path: '/examples',
  metadata: {
    title: 'Examples',
    description: 'Browse small Rocket example pages that demonstrate one feature at a time.',
    custom: {
      atlasDoc: {
        asideTip: {
          title: 'Example tip',
          description:
            'Use examples as focused implementation slices: compare the Page config, exported components, and rendered output together.',
        },
      },
    },
  },
  menu: {
    linkText: 'Examples',
    iconName: 'grid',
    noLink: true,
    order: 50,
  },
};

import { atlasDocLayout } from '@rocket/js/layouts/atlasDoc.js';
export { atlasDocComponents as components } from '@rocket/js/layouts/atlasDoc.js';
import { globalData } from '../globalData.js';

export const layout = pageData => atlasDocLayout(pageData, globalData);
```

# Examples

These examples are small, live Rocket Pages. They are not complete example websites. Use them when
you want to see one Rocket feature in a real Page file and compare the source with the rendered
output.

Full example websites are still a goal. Until those exist, start with the tutorial when you want a
multi-page project shape, then use these examples for focused implementation questions.

## Page examples

| Example page                                                    | What to inspect                                                            |
| --------------------------------------------------------------- | -------------------------------------------------------------------------- |
| [Web Awesome Components](/examples/callout)                     | Markdown Pages can use package Web Components through Rocket registration. |
| [Component Showcase With Demos](/examples/component-showcase)   | Component documentation can include rendered demos beside source.          |
| [Server Time Page](/examples/time)                              | JavaScript Pages can run at request time when static output is not enough. |
| [JavaScript Pages With Layouts](/examples/js-pages-with-layout) | Static and server-rendered JavaScript Pages can share docs layout code.    |
| [API Output](/examples/api-output)                              | JavaScript Pages can emit machine-readable static output.                  |

## What Each Page Shows

### [Web Awesome Components](/examples/callout)

Use Web Awesome custom elements in a Markdown Page with Rocket's component registration model.

This example covers:

- layout-provided Registered Components
- Web Awesome callouts, badges, details, avatars, and cards
- when to use a package component map instead of defining tags manually

### [Component Showcase With Demos](/examples/component-showcase)

Use `js demo` blocks to document Web Awesome's `<wa-details>` component with JavaScript Demos and
source code.

This example covers:

- importing browser-ready package components for demos
- default, open, disabled, icon, and grouped states
- documenting an existing component with rendered examples
- Standalone Demo URLs for focused review

### [Server Time Page](/examples/time)

Render a request-time JavaScript Page that shows the current server timestamp and request details.

This example covers:

- `.rocket.js` Page shape
- `render: 'server'`
- using `context.pageData` with `atlasDocLayout`
- returning a complete `Response`

### [JavaScript Pages With Layouts](/examples/js-pages-with-layout)

Use the docs layout from static and server-rendered JavaScript Pages without constructing PageData
by hand.

This example covers:

- the recommended JavaScript Page layout pattern
- static JavaScript Pages with concrete paths
- parameterized routes
- JSON responses versus HTML responses
- common layout mistakes

### [API Output](/examples/api-output)

Return JSON from a JavaScript Page and build it as a static file output.

This example covers:

- static `.json` route paths
- returning plain objects as JSON
- hiding API routes from navigation
- when to switch to `render: 'server'`

## Choose By Task

Start with [Web Awesome Components](/examples/callout) when the Page is mostly Markdown and needs
package components.

Use [Component Showcase With Demos](/examples/component-showcase) when a Page documents component
usage, variants, states, and interactive behavior.

Use [Server Time Page](/examples/time) when you need a minimal working `.rocket.js` Page.

Use [JavaScript Pages With Layouts](/examples/js-pages-with-layout) when a JavaScript Page should
still look like the rest of the docs site, whether it renders once at build time or runs at request
time.

Use [API Output](/examples/api-output) when a JavaScript Page should return machine-readable JSON
instead of an HTML document.

## Related docs

- [Start With AI](/setup/build-with-ai) gives a Coding Agent a prompt for a deployable Rocket site.
- [Manual Quick Start](/setup/manual-quick-start) creates the smallest Rocket project.
- [Build a Site](/tutorials/acme-ui-docs) shows a multi-page project path.
- [Pages](/reference/pages) documents Markdown Pages, JavaScript Pages, route paths, and render modes.
- [Components](/reference/components) explains Registered Components and Page-local Custom Elements.
- [Component Loading](/component-loading) helps choose `server`, `client`, or `hydrate:*`.
- [Deploy](/deploy) explains static output and adapter output.
- [Author Modules](/advanced/author-modules) lists common `@rocket/js` imports for Pages and
  layouts.
