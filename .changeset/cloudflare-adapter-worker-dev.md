---
'@rocket/js': minor
---

Add a `cloudflare()` adapter for sites that deploy static Rocket Pages next to an existing
Cloudflare Worker. `rocket start` runs the Worker from the site's `wrangler.jsonc` on the same
origin and port as the Pages, and hands it the paths in `assets.run_worker_first`. `rocket build`
checks that `assets.directory` matches the build output, writes `.assetsignore`, and writes
`urlLifecycle.redirects` to `_redirects`. Server-rendered Pages are not supported by this adapter
yet. Adapters can now adjust the dev server through an optional
`adjustDevServerConfig(config, context)` hook. Wrangler `^4.162.0` is an optional peer dependency,
loaded only by this adapter.
