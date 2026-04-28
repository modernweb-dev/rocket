```js server
export const config = {
  path: '/',
  metadata: {
    title: 'Rocket - keep the files, ship HTML',
    description:
      'Rocket helps you build content sites and Web Component docs with plain source files and static HTML.',
  },
  menu: false,
};

import { html } from 'lit';
import { atlasHeroLayout } from '@rocket/js/layouts/atlasHero.js';
export { atlasHeroComponents as components } from '@rocket/js/layouts/atlasHero.js';
import { globalData } from './globalData.js';

import { resolve } from '@rocket/js/resolve.js';

const githubRepo = 'https://github.com/modernweb-dev/rocket';

const localData = {
  heroMainData: {
    logoNoText: resolve('@rocket/js/docs/assets/rocket-logo-light.svg', import.meta),
    eyebrow: 'OPEN SOURCE STATIC SITES WITH PLAIN SOURCE',
    title: 'Keep the files. Ship HTML.',
    body: 'Rocket helps you build content sites and Web Component docs with plain source files. Write Markdown, use web-standard components, and ship static HTML by default.',
    documentationLink: '/setup/manual-quick-start',
    documentationText: 'Read the docs',
    setupLink: '/setup/build-with-ai',
    setupText: 'Start with AI prompt',
    installLabel: 'Install',
    installCommand: 'npm install @rocket/js',
    badges: [
      { text: 'Open source', icon: 'GitHub', href: githubRepo },
      {
        text: 'MIT licensed',
        icon: 'license',
        href: 'https://github.com/modernweb-dev/rocket/blob/main/LICENSE',
      },
      {
        text: 'Published on npm',
        icon: 'npm',
        href: 'https://www.npmjs.com/package/@rocket/js',
      },
    ],
  },
  whyRocketData: [
    {
      icon: 'file-earmark-text',
      tone: 'red',
      title: 'Plain source files',
      description: 'Write Markdown pages with JavaScript layouts, components, and config.',
    },
    {
      icon: 'lightning-charge',
      tone: 'amber',
      title: 'Flexible component loading',
      description:
        'Static HTML by default. Choose server rendering, browser-only loading, or hydration per component.',
    },
    {
      icon: 'book-half',
      tone: 'red',
      title: 'Made for Web Component docs',
      description:
        'Build docs with clean pages, web-standard components, and no framework lock-in.',
    },
  ],
  quickStartData: {
    title: 'Quick start',
    subtitle: 'In an npm project:',
    command: ['npm install @rocket/js', 'npx rocket init', 'npm start'],
    description: html`Build with <code>npm run build</code>.`,
  },
  workflowData: {
    title: 'Plain source in, static HTML out',
    steps: [
      {
        icon: 'file-earmark-text',
        tone: 'red',
        title: 'Create content',
        description: 'Create Markdown & JS pages, layouts, and components.',
      },
      {
        icon: 'code-slash',
        tone: 'amber',
        title: 'Use your AI',
        description: 'Ask ChatGPT, Codex, Claude, or Gemini to edit plain source.',
      },
      {
        icon: 'terminal',
        tone: 'green',
        title: 'Run npm run build',
        description: 'Generate static output with optimized component loading.',
      },
      {
        icon: 'folder',
        tone: 'blue',
        title: 'Deploy dist/',
        description: 'Publish static files to any static host.',
      },
    ],
  },
};

export const layout = pageData => atlasHeroLayout(pageData, { ...globalData, ...localData });
```
