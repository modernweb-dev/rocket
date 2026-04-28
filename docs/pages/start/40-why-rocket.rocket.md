```js server
export const config = {
  path: '/setup/why-rocket',
  metadata: {
    title: 'Why Rocket?',
    description: 'Understand the project shape, output model, and tradeoffs Rocket chooses.',
    custom: {
      atlasDoc: {
        asideTip: {
          title: 'Tradeoff tip',
          description:
            'Choose Rocket when plain files, inspectable HTML, and Web Component docs matter more than client-app routing.',
        },
      },
    },
  },
  menu: {
    linkText: 'Why Rocket?',
    iconName: 'question-circle',
    order: 40,
  },
};

import { atlasDocLayout } from '@rocket/js/layouts/atlasDoc.js';
export { atlasDocComponents as components } from '@rocket/js/layouts/atlasDoc.js';
import { globalData } from '../globalData.js';

export const layout = pageData => atlasDocLayout(pageData, globalData);
```

# Why Rocket?

Rocket is for sites where content, documentation, and inspectable output matter more than building a
large client-side application.

## What Rocket optimizes for

- **HTML first:** Pages render to HTML before JavaScript is involved.
- **Zero JS by default:** Browser JavaScript is emitted only for explicit component loading
  strategies.
- **Server-rendered Web Components:** Custom elements can be rendered into the document without
  shipping their component module to every visitor.
- **Explicit page config:** Each Page owns its public URL through `config.path`.
- **Static deploy output:** Static Pages build into files under `dist/`.
- **Low configuration:** A project needs `rocket-config.js`, Page files, and npm scripts before it
  can grow.
- **Agent-friendly project shape:** Pages, layouts, metadata, assets, and site data stay in ordinary
  files that coding agents can read and edit.

## What Rocket is not

Rocket is not a SPA framework, a backend application framework, or a React-first app stack. It also
does not try to match Astro, Eleventy, or VitePress plugin ecosystems.

Choose Rocket when you want a content site or Web Component documentation site that starts static,
can add JavaScript deliberately, and remains easy to own after an AI-assisted first draft.

## The ownership model

Rocket should leave you with boring files:

```txt
docs/
|-- pages/
|   |-- index.rocket.md
|   `-- components/button.rocket.md
|-- layouts/
|   `-- siteLayout.js
|-- styles/
|   `-- site.css
`-- siteData.js
```

The framework supplies page discovery, Markdown processing, component loading, static output, and
development tooling. Your project owns the content, routes, layout boundary, design decisions, and
deployment target.

## Next steps

- [Start With AI](/setup/build-with-ai) creates a deployable project from a Site Brief.
- [Manual Quick Start](/setup/manual-quick-start) shows the smallest hand-built project.
