---
'plugins-manager': minor
---

BREAKING CHANGE: `metaConfigToRollupConfig` has been renamed to `applyPlugins`

```diff
- const finalConfig = metaConfigToRollupConfig(currentConfig, defaultMetaPlugins);
+ const finalConfig = applyPlugins(currentConfig, defaultMetaPlugins);
```
