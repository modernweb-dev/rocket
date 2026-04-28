```js server
export const config = {
  path: '/guides',
  metadata: {
    title: 'Guides',
    description:
      'Open focused Rocket guides for production workflows after the site-building tutorial.',
    custom: {
      atlasDoc: {
        asideTip: {
          title: 'Guide tip',
          description:
            'Use Guides after the tutorial when you are adding production behavior such as request-time routes, collections, or deployment.',
        },
      },
    },
  },
  menu: {
    linkText: 'Guides',
    iconName: 'journal-text',
    noLink: true,
    order: 30,
  },
};

import { atlasDocLayout } from '@rocket/js/layouts/atlasDoc.js';
export { atlasDocComponents as components } from '@rocket/js/layouts/atlasDoc.js';
import { globalData } from '../globalData.js';

export const layout = pageData => atlasDocLayout(pageData, globalData);
```

# Guides

Use these pages after the guided site-building tutorial, or jump into them when you need one
specific production workflow.

## In this section

- [Component Loading](/component-loading) explains how to choose when page components load.
- [Request-time JavaScript Pages](/request-time-javascript-pages) adds request-time pages,
  JSON responses, and generated SVG responses.
- [Page Collections](/page-collections) builds a blog-scale archive from static Pages, Page
  Metadata, and generated pagination.
- [Deploy](/deploy) prepares static and server-rendered Rocket sites for production hosting.
- [Netlify Adapter](/netlify-adapter) documents the built-in adapter for server-rendered Pages on
  Netlify.
