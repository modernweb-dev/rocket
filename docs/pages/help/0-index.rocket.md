```js server
export const config = {
  path: '/help',
  metadata: {
    title: 'Help',
    description: 'Troubleshoot Rocket projects and understand current alpha limitations.',
    custom: {
      atlasDoc: {
        asideTip: {
          title: 'Help tip',
          description:
            'Start with troubleshooting for symptoms, then check known limitations when behavior looks unsupported by the current alpha.',
        },
      },
    },
  },
  menu: {
    linkText: 'Help',
    iconName: 'life-preserver',
    noLink: true,
    order: 46,
  },
};

import { atlasDocLayout } from '@rocket/js/layouts/atlasDoc.js';
export { atlasDocComponents as components } from '@rocket/js/layouts/atlasDoc.js';
import { globalData } from '../globalData.js';

export const layout = pageData => atlasDocLayout(pageData, globalData);
```

# Help

Use Help when a Rocket project does not behave as expected or when you need to understand current
alpha limitations before adoption.

## Pages in this section

- [Troubleshooting](/help/troubleshooting) maps common symptoms to likely causes and fixes.
- [Known Limitations](/help/known-limitations) sets alpha expectations before adoption.
