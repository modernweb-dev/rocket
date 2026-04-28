```js server
export const config = {
  path: '/setup',
  metadata: {
    title: 'Start',
    description: 'Choose the AI-assisted or manual path for creating a first Rocket site.',
    custom: {
      atlasDoc: {
        asideTip: {
          title: 'Start tip',
          description:
            'Choose the AI path for a generated first site, or the manual path when you want to learn each file by hand.',
        },
      },
    },
  },
  menu: {
    linkText: 'Start',
    iconName: 'compass',
    noLink: true,
    order: 10,
  },
};

import { atlasDocLayout } from '@rocket/js/layouts/atlasDoc.js';
export { atlasDocComponents as components } from '@rocket/js/layouts/atlasDoc.js';
import { globalData } from '../globalData.js';

export const layout = pageData => atlasDocLayout(pageData, globalData);
```

# Start

Start here when you are setting up a Rocket site for the first time. Most Site Authors should start
with a Coding Agent. Use the manual path when you want to create the files yourself.

## Choose a path

- [Start with AI](/setup/build-with-ai) gives a Coding Agent a complete prompt for a deployable
  Rocket site.
- [Manual Quick Start](/setup/manual-quick-start) creates a minimal project with one Markdown Page,
  npm scripts, and a local dev server.
- [How Rocket Works](/setup/how-rocket-works) explains the Page model, the docs path, and what you
  should know before creating files.

After the first site builds, continue with [Build a Site](/tutorials/acme-ui-docs) when you want a
guided human tutorial. Guides cover production workflows, Reference covers APIs and concepts, and
Examples show complete patterns.
