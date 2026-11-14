---
'@rocket/js': patch
---

Add a `cloudflare()` adapter for sites that pair static Pages with a Cloudflare Worker. `rocket start`
runs the Worker from the site's `wrangler.jsonc` on the same origin as the Pages and hands the paths
in `assets.run_worker_first` to it, and `rocket build` writes `.assetsignore` and checks that
`assets.directory` matches the build output. Adapters can now adjust the dev server through an
optional `adjustDevServerConfig(config, context)` hook. Wrangler `^4.162.0` is an optional peer
dependency, loaded only by this adapter.
