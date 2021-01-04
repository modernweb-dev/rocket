---
'@rocket/cli': patch
---

Changes to config:
- Do not auto rollupWrap plugins added via `setupDevPlugins`.
- If you provide `devServer.plugins` then it will return that directly ignoring `setupDevAndBuildPlugins` and `setupDevPlugins`
