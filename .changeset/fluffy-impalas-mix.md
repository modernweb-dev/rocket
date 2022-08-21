---
'@rocket/engine': patch
---

Adjust urls containing url fragments

```html
<!-- user writes -->
<a href="./about.rocket.js#some-id"></a>

<!-- rocket outputs -->
<!-- before -->
<a href="./about.rocket.js#some-id"></a>
<!-- after -->
<a href="/about/#some-id"></a>
```
