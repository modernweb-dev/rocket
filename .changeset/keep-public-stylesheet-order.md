---
'@rocket/js': patch
---

Keep the source order of stylesheets in `rocket build`. Vite moved the bundled Atlas Layout CSS behind Public Asset stylesheets such as a site theme from `siteData.stylesheets`, so the theme lost the cascade in the build while `rocket start` looked right. The bundled CSS now goes where the first bundled stylesheet was.
