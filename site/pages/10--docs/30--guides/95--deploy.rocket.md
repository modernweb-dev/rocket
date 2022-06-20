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
  customElements.define('inline-notification', await import('@rocket/components/inline-notification.js').then(m => m.InlineNotification));
  // prettier-ignore
  customElements.define('main-docs', await import('@rocket/components/main-docs.js').then(m => m.MainDocs));
  // hydrate-able components
  // prettier-ignore
  customElements.define('rocket-search', await import('@rocket/search/search.js').then(m => m.RocketSearch));
  // prettier-ignore
  customElements.define('rocket-drawer', await import('@rocket/components/drawer.js').then(m => m.RocketDrawer));
}
/* END - Rocket auto generated - do not touch */
```

# Deploy a Website

## Deploying Rocket

Rocket works as a static site builder, meaning that shipping your finished Rocket site is extremely easy. Any 
service able to host a collection of HTML documents is able to host your Rocket site without hassle.

Below you can find multiple examples and recipes for deploying your Rocket site for various cloud providers and hosting services.

---

### Github Pages

The Rocket starter ships with GitHub Pages integration set up by default. What this means is that 
all you have to do to have your freshly created Rocket project hosted is enable it from your GitHub Repository's Settings
following these steps:

1. After pushing your generated Rocket project to GitHub, navigate to the `Settings` -tab in your repository.

2. From this tab, select the side navigation option `Pages`.

3. In your `Pages` -page, set the `Source` option to the newly generated `gh-pages` -branch, leaving the directory as `/ (root)`.

4. Save your Settings.


**And you're done!**

Your page should now appear hosted in `https://yourusername.github.io/your-repository/` in the following minutes.


You won't need to worry about any deployments either. Rocket will automatically handle deployments from your main branch onto the newly published
GitHub pages every time you push your code.

---
