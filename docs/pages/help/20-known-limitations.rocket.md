```js server
export const config = {
  path: '/help/known-limitations',
  metadata: {
    title: 'Known Limitations',
    description: 'Understand Rocket alpha limitations before adopting it for a production site.',
    custom: {
      atlasDoc: {
        asideTip: {
          title: 'Alpha tip',
          description:
            'Treat public APIs as useful but still moving before 1.0.0; pin versions and keep production adoption conservative.',
        },
      },
    },
  },
  menu: {
    linkText: 'Known Limitations',
    iconName: 'exclamation-triangle',
    order: 20,
  },
};

import { atlasDocLayout } from '@rocket/js/layouts/atlasDoc.js';
export { atlasDocComponents as components } from '@rocket/js/layouts/atlasDoc.js';
import { globalData } from '../globalData.js';

export const layout = pageData => atlasDocLayout(pageData, globalData);
```

# Known Limitations

Rocket is alpha software. It is useful for early adopters, content sites, and Web Component
documentation, but the public APIs can still change before `1.0.0`.

## Package and setup

- `rocket init` creates a starter docs site, not a finished project-specific site. Use
  [Start With AI](/setup/build-with-ai) when you want a Coding Agent to adapt it to your audience,
  content, design, and deployment target.
- Rocket currently requires Node.js 22 or newer.
- The package is published as `@rocket/js`; older `@rocket/create` instructions are obsolete for
  the relaunch path.

## Framework scope

- Rocket is not a SPA framework.
- Rocket is not a backend application framework.
- Rocket is not a React, Astro, Eleventy, or VitePress replacement for teams that primarily want
  those tools' conventions and ecosystems.

## Ecosystem maturity

- The plugin ecosystem is intentionally small.
- The reusable layout APIs are still settling.
- The docs currently include focused examples, not a large gallery of polished production sites.

## Stability policy

Before `1.0.0`, bug fixes and small features can ship as patch releases. Breaking changes can ship
as minor releases when they are documented in the changelog and release notes.
