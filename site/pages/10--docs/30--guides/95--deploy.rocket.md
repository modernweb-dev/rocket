```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '10--docs/30--guides/95--deploy.rocket.md';
// prettier-ignore
import { html, layout, setupUnifiedPlugins, components, openGraphLayout } from '../../recursive.data.js';
export { html, layout, setupUnifiedPlugins, components, openGraphLayout };
export async function registerCustomElements() {
  // server-only components
  // prettier-ignore
  customElements.define('rocket-social-link', await import('@rocket/components/social-link.js').then(m => m.RocketSocialLink));
  // prettier-ignore
  customElements.define('rocket-header', await import('@rocket/components/header.js').then(m => m.RocketHeader));
  // prettier-ignore
  customElements.define('rocket-main-docs', await import('@rocket/components/main-docs.js').then(m => m.RocketMainDocs));
  // prettier-ignore
  customElements.define('rocket-content-area', await import('@rocket/components/content-area.js').then(m => m.RocketContentArea));
  // hydrate-able components
  // prettier-ignore
  customElements.define('rocket-search', await import('@rocket/search/search.js').then(m => m.RocketSearch));
  // prettier-ignore
  customElements.define('rocket-drawer', await import('@rocket/components/drawer.js').then(m => m.RocketDrawer));
}
export const needsLoader = true;
/* END - Rocket auto generated - do not touch */
```

# Deploying Rocket

---

### Github Pages

The [Rocket Starter](../10--setup/10--getting-started.rocket.md) ships with GitHub Pages integration set up by default.
You will find the file at

```
my-project
├── .github
│   └── workflows
│       └── github-build-and-deploy-rocket-action.yml
├── site/*
└── package.json
```

This means to go live with a freshly created Rocket project hosted on GitHub you need to change the Repository's Settings following these steps:

1. After pushing your generated Rocket project to GitHub, navigate to the `Settings` -tab in your repository.
2. From this tab, select the side navigation option `Pages`.
3. In your `Pages` -page, set the `Source` option to the newly generated `gh-pages` -branch, leaving the directory as `/ (root)`.
4. Save your Settings.

**And you're done!**

Your page should now appear hosted in `https://yourusername.github.io/your-repository/` in the following minutes.

You won't need to worry about any deployments either. Rocket will automatically handle deployments from your main branch onto the newly published
GitHub pages every time you push your code.

---
