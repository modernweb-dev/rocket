---
'@rocket/launch': patch
---

Replace Layout Options `logoSrc` and `logoAlt` strings with a `logoSmall` TemplateResult

```diff
-  logoSrc: '/icon.svg',
-  logoAlt: 'Rocket Logo',
+  logoSmall: html`
+    <img src="resolve:@rocket/launch/assets/rocket-logo-light.svg" alt="Rocket" width="250" height="67.87" />
+  `,
```
