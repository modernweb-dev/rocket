```js server
export const config = {
  path: '/setup/how-rocket-works',
  metadata: {
    title: 'How Rocket Works',
    description: 'Learn how Rocket builds sites from configured Markdown and JavaScript Pages.',
    custom: {
      atlasDoc: {
        asideTip: {
          title: 'Model tip',
          description:
            'Think of Rocket as Page discovery plus layout rendering; component loading and adapters layer on top of that.',
        },
      },
    },
  },
  menu: {
    linkText: 'How Rocket Works',
    iconName: 'check-circle',
    order: 30,
  },
};

import { atlasDocLayout } from '@rocket/js/layouts/atlasDoc.js';
export { atlasDocComponents as components } from '@rocket/js/layouts/atlasDoc.js';
import { globalData } from '../globalData.js';

export const layout = pageData => atlasDocLayout(pageData, globalData);
```

# How Rocket works

Rocket builds websites from **Pages**. A Page can be a Markdown file for durable content or a
JavaScript file for a request-time response. Each Page exports a `config` object, and `config.path`
controls the public URL.

That means the source file structure is for the author. The URL structure is explicit. You can keep
Pages near the content, component, or workflow they document without forcing the same shape into the
published site.

## What Rocket Needs

Every Rocket project needs three things:

1. A `rocket-config.js` file with `includeGlobs` that tell Rocket where Page files live.
2. One or more `.rocket.md` or `.rocket.js` files with an exported `config`.
3. An npm script that runs the dev server or production build.

The [Start With AI](/setup/build-with-ai) page gives a Coding Agent the smallest useful version of
that setup. The [Manual Quick Start](/setup/manual-quick-start) shows the same foundation when you
want to create the files yourself.

## Learning Path

Use the docs in this order:

1. Start with [Start With AI](/setup/build-with-ai) to have a Coding Agent create a deployable
   Rocket site.
2. Use [Manual Quick Start](/setup/manual-quick-start) when you want to create the starter by hand.
3. Continue with [Build a Site](/tutorials/acme-ui-docs) to add owned site data, layout, menus,
   assets, and component documentation.
4. Use [Component Loading](/component-loading) when a page needs custom elements or client-side
   behavior.
5. Add request-time behavior with
   [Request-time JavaScript Pages](/request-time-javascript-pages).
6. Use [Deploy](/deploy) when the site is ready to publish.

Use [Reference](/reference/core-concepts) when you need a specific option or concept. Use
[Examples](/examples/callout) when you want a complete implementation pattern.

## Before You Start

<wa-callout>
  <rocket-icon slot="icon" name="info-circle"></rocket-icon>
  Make sure Node.js 22 or newer is available before running the setup commands.
</wa-callout>

The first project usually does not need request-time behavior or a deployment adapter. Those come
later, after static Pages build successfully.

## Next step

Continue with [Start With AI](/setup/build-with-ai) and create a deployable Rocket site.
