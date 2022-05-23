```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '10--docs/20--basics/60--routing.rocket.md';
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
  customElements.define('main-docs', await import('@rocket/components/main-docs.js').then(m => m.MainDocs));
  // hydrate-able components
  // prettier-ignore
  customElements.define('rocket-search', await import('@rocket/search/web').then(m => m.RocketSearch));
  // prettier-ignore
  customElements.define('rocket-drawer', await import('@rocket/components/drawer.js').then(m => m.RocketDrawer));
}
/* END - Rocket auto generated - do not touch */
```

# Routing

Rocket uses **file-based routing** to generate your build URLs based on the file layout of your project `site/pages` directory. When a file is added to the `site/pages` directory of your project, it is automatically available as a route based on its filename.

## Static routes

Rocket Pages are Markdown (`rocket.md`), HTML (`rocket.html`) and JavaScript (`rocket.js`) in the `site/pages` directory become pages on your website. Each page’s route is decided based on its filename and path within the `site/pages` directory. This means that there is no separate "routing config" to maintain in an Rocket project.

```bash
# Example: Static routes
docs/index.rocket.md        -> mysite.com/
docs/about.rocket.md        -> mysite.com/about/
docs/about/index.rocket.js  -> mysite.com/about/
docs/about/me.rocket.html   -> mysite.com/about/me/
docs/posts/1.md             -> mysite.com/posts/1/
```

Each page essentially will become an `index.html` file in a specific folder.
This means it will "force" a trailing slash on the URL.

This is important as a file `about/index.html` will work on all servers and does not leave room for interpretation.

Below is a summary of investigations by [Zach Leatherman](https://www.zachleat.com/web/trailing-slash/) and [Sebastien Lorber](https://github.com/slorber/trailing-slash-guide)

**Legend**:

- 🆘 HTTP 404 Error
- 💔 Potentially Broken Assets (e.g. `<img src="image.avif">`)
- 🟡 SEO Warning: Multiple endpoints for the same content
- ✅ Correct, canonical or redirects to canonical
- ➡️ Redirects to canonical

<table class="fullwidth">
  <thead>
    <tr>
      <th></th>
      <th colspan="2"><code>about.html</code></th>
      <th colspan="2"><code>about/index.html</code></th>
    </tr>
    <tr>
      <th>Host</th>
      <th><code>/about</code></th>
      <th><code>/about/</code></th>
      <th><code>/about</code></th>
      <th><code>/about/</code></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><a href="https://slorber.github.io/trailing-slash-guide">GitHub Pages</a></td>
      <td>✅</td>
      <td>🆘 <code>404</code></td>
      <td>➡️ <code>/about/</code></td>
      <td>✅</td>
    </tr>
    <tr>
      <td><a href="https://trailing-slash-guide-default.netlify.app">Netlify</a></td>
      <td>✅</td>
      <td>➡️ <code>/about</code></td>
      <td>➡️ <code>/about/</code></td>
      <td>✅</td>
    </tr>
    <tr>
      <td><a href="https://vercel-default-eight.vercel.app">Vercel</a></td>
      <td>🆘 <code>404</code></td>
      <td>🆘 <code>404</code></td>
      <td>🟡💔</td>
      <td>✅</td>
    </tr>
    <tr>
      <td><a href="https://trailing-slash-guide.pages.dev">Cloudflare Pages</a></td>
      <td>✅</td>
      <td>➡️ <code>/about</code></td>
      <td>➡️ <code>/about/</code></td>
      <td>✅</td>
    </tr>
    <tr>
      <td><a href="https://trailing-slash-guide.onrender.com">Render</a></td>
      <td>✅</td>
      <td>🟡💔</td>
      <td>🟡💔</td>
      <td>✅</td>
    </tr>
    <tr>
      <td><a href="https://polite-bay-08a23e210.azurestaticapps.net">Azure Static Web Apps</a></td>
      <td>✅</td>
      <td>🆘 <code>404</code></td>
      <td>🟡💔</td>
      <td>✅</td>
    </tr>
  </tbody>
</table>

If you wanna know more be sure to checkout [Trailing Slashes on URLs: Contentious or Settled?](https://www.zachleat.com/web/trailing-slash/).

## Non index.html pages

Sometimes you may still have the need to create a `name.html` file.
This is possible via `*.rocket.js` files as it will handle full filename within "itself" explicitly.

```bash
docs/404.html.rocket.js           -> mysite.com/404.html
docs/about/hidden.html.rocket.js  -> mysite.com/about/hidden.html
```

This can also be used to create non html files like

```bash
docs/sitemap.xml.rocket.js           -> mysite.com/sitemap.xml
docs/robot.txt.rocket.js             -> mysite.com/robot.txt
docs/about/background.svg.rocket.js  -> mysite.com/about/background.svg
```

You still have access to all features within Rocket pages.
