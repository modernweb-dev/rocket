> Rocket is in public alpha. Expect APIs and documentation to keep improving before 1.0.

<p align="center">
  <picture width="60%">
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/modernweb-dev/rocket/main/docs/assets/rocket-logo-dark-with-text.svg">
    <img alt="Rocket Logo" src="https://raw.githubusercontent.com/modernweb-dev/rocket/main/docs/assets/rocket-logo-light-with-text.svg">
  </picture>
</p>

<p align="center">
  <a href="https://github.com/modernweb-dev/rocket/actions"
    ><img
      src="https://img.shields.io/github/actions/workflow/status/modernweb-dev/rocket/release.yml?branch=main&label=release&style=flat-square"
      alt="Release workflow status"
  /></a>
  <a href="https://twitter.com/modern_web_dev"
    ><img
      src="https://img.shields.io/badge/twitter-@modern_web_dev-1DA1F3?style=flat-square"
      alt="Follow @modern_web_dev on Twitter"
  /></a>
  <a href="https://open.vscode.dev/modernweb-dev/rocket"
    ><img
      src="https://img.shields.io/static/v1?logo=visualstudiocode&label=&message=Open%20in%20Visual%20Studio%20Code&labelColor=2c2c32&color=007acc&logoColor=007acc"
      alt="Open in VS Code"
  /></a>
</p>

<p align="center">
  <a href="https://rocket.modern-web.dev">Website</a>
  ·
  <a href="https://rocket.modern-web.dev/setup/build-with-ai">Start with AI</a>
  ·
  <a href="https://rocket.modern-web.dev/chat">Discord Community</a>
</p>

# Rocket

Rocket is a static-site metaframework for content sites and Web Component docs: HTML-first, zero JS
by default, AI-friendly, and deployable anywhere.

- **Start with AI:** Copy the starter prompt, paste it into Claude, Cursor, Codex, or another
  coding agent, and get a deployable Rocket site made of plain files.
- **Content first:** Write durable pages in Markdown, then opt into JavaScript only when it helps.
- **Explicit routes:** Each Page owns its public URL with `config.path`, independent of file
  location.
- **Component loading:** Choose `server`, `client`, or `hydrate:*` per Registered Component.
- **Modern Web stack:** Build on Lit, Vite, and Modern Web tooling without hiding the underlying
  configuration.

Rocket is not a SPA framework, React/Vite/Astro replacement, or backend application framework. Use
it when the output should mostly be static HTML and the source should stay easy for humans and
coding agents to inspect.

<p align="center">
  <a href="https://rocket.modern-web.dev/setup/build-with-ai/"><strong>Start With AI&nbsp;&nbsp;▶</strong></a>
  ·
  <a href="https://rocket.modern-web.dev/setup/manual-quick-start/">Manual Quick Start</a>
</p>

## Five-minute path

Use [Start With AI](https://rocket.modern-web.dev/setup/build-with-ai/) when you want an agent to
create the project shell, pages, layout, metadata, and Netlify config for you:

1. Copy the Rocket prompt.
2. Paste it into Claude, Cursor, Codex, or another coding agent with a short Site Brief.
3. Let the agent create the files, run `npm run build`, and fix failures.
4. Keep the plain Markdown, JavaScript, CSS, and config files afterward.

Rocket requires Node.js 22 or newer.

For a manual project, install the package from npm:

```bash
npm install @rocket/js
npx rocket init
```

`rocket init` creates a compact Atlas docs starter, including `rocket-config.js`,
`docs/pages/sharedData.js`, starter Markdown Pages, a static JSON Page for a Request Demo, and a
removable project-local Rocket Agent Skill. It also adds npm scripts when the names are available:

```json
{
  "type": "module",
  "scripts": {
    "start": "rocket start",
    "build": "rocket build"
  },
  "dependencies": {
    "@rocket/js": "^0.1.0"
  }
}
```

The generated `rocket-config.js` discovers general documentation Pages under `docs/pages` and
colocated component reference Pages under `src`:

```js
/** @type {import('@rocket/js/types.js').RocketConfig} */
export default {
  includeGlobs: ['docs/pages/**/*.rocket.{md,js}', 'src/**/*.rocket.{md,js}'],
};
```

The generated `docs/pages/index.rocket.md` gives you an Atlas hero home Page:

````md
```js server
export const config = {
  path: '/',
  metadata: {
    title: 'Rocket Site',
    description: 'Documentation built with Rocket.',
  },
  menu: {
    iconName: 'house',
    order: 0,
  },
};

import { atlasHeroLayout, atlasHeroComponents } from '@rocket/js/layouts/atlasHero.js';
import { heroData } from './sharedData.js';

export const components = atlasHeroComponents;
export const layout = pageData => atlasHeroLayout(pageData, heroData);
```

# Rocket Site

This starter is rendered with Rocket's Atlas hero layout.
````

Then run:

```bash
npm start
npm run build
```

The build writes static output to `dist/`:

```txt
dist/
|-- index.html
`-- assets/
```

Follow the [Manual Quick Start](https://rocket.modern-web.dev/setup/manual-quick-start/) when you
want to create the smallest working project by hand.

## When to use Rocket

Use Rocket for:

- content-first static sites
- documentation sites
- Web Component and design-system docs
- AI-generated sites you want to own afterward
- pages that should ship as HTML before JavaScript

Do not use Rocket for:

- SPA products with complex client-side routing
- backend applications
- projects that need a large plugin ecosystem today
- teams that specifically want React, Astro, Eleventy, or VitePress conventions

## Package and dependency philosophy

Rocket optimizes the generated site output, not the npm dependency count. A Rocket project installs
`@rocket/js` and gets the build pipeline, Markdown processing, dev server, Lit-based server
rendering, and docs-layout affordances in one package. Visitor pages stay static by default, and
browser JavaScript is only emitted for loading strategies you choose.

## Status and docs

Rocket is currently in **public alpha** at `0.1.x`. APIs can change before `1.0.0`;
breaking changes are documented through changesets and release notes.

- [Start With AI](https://rocket.modern-web.dev/setup/build-with-ai/)
- [Manual Quick Start](https://rocket.modern-web.dev/setup/manual-quick-start/)
- [Build a Site](https://rocket.modern-web.dev/tutorials/acme-ui-docs)
- [Examples](https://rocket.modern-web.dev/examples)
- [Reference](https://rocket.modern-web.dev/reference)
- [Known Limitations](https://rocket.modern-web.dev/help/known-limitations)
- [Roadmap](./ROADMAP.md)

Rocket is part of the [Modern Web Family](https://modern-web.dev/discover/about/).

<p align="center">
  <a href="https://rocket.modern-web.dev/chat"><strong>Join our Discord Community&nbsp;&nbsp;▶</strong></a>
</p>

## Working on this repo

```bash
npm ci
npm start
npm run types
npm test
npm run lint
```

`npm start` runs the Rocket docs site. `npm test` runs the Node test suite.

## 🤝 Contributing

We are always looking for contributors of all skill levels! If you're looking to ease your way into the project, try out a [good first issue](https://github.com/modernweb-dev/rocket/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22).

If you are interested in helping contribute to Modern Web, please take a look at our [Contributing Guide](https://github.com/modernweb-dev/rocket/blob/main/CONTRIBUTING.md). Also, feel free to drop into [Discord](https://rocket.modern-web.dev/chat) and say hi. 👋

### Financial Contributors

Become a financial contributor and help us sustain our community. [[Contribute](https://opencollective.com/modern-web/contribute)]

## License

Rocket is released under the [MIT License](./LICENSE).
