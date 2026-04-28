```js server
export const config = {
  path: '/advanced',
  metadata: {
    title: 'Advanced',
    description: 'Customize Rocket with lower-level layout, module, server, social, and menu APIs.',
    custom: {
      atlasDoc: {
        asideTip: {
          title: 'Advanced tip',
          description:
            'Use these APIs after the standard docs layout and Page config cover your site; they are for customization boundaries, not first setup.',
        },
      },
    },
  },
  menu: {
    linkText: 'Advanced',
    iconName: 'gear',
    noLink: true,
    order: 45,
  },
};

import { atlasDocLayout } from '@rocket/js/layouts/atlasDoc.js';
export { atlasDocComponents as components } from '@rocket/js/layouts/atlasDoc.js';
import { globalData } from '../globalData.js';

export const layout = pageData => atlasDocLayout(pageData, globalData);
```

# Advanced

Use Advanced when you need lower-level Rocket customization details or implementation-facing
contracts after the core Reference pages.

## Pages in this section

- [Atlas Layouts](/advanced/atlas-layouts) covers Rocket's reusable docs layouts and component maps.
- [Author Modules](/advanced/author-modules) lists the supported `@rocket/js` imports Site Authors
  should use and the runtime modules they should usually avoid.
- [Dev Server](/advanced/dev-server) covers local serving, watch behavior, restarts, and dev server
  config.
- [Social Link](/advanced/social-link) documents Rocket's social/profile link component and
  optional visible labels.
- [Menus](/advanced/menus) covers menu config, title/link-text resolution, table-of-contents
  headings, and previous/next navigation.
