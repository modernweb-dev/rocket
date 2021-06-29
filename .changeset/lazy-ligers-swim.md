---
'@rocket/cli': patch
---

Adjust copy logic to

1. for `_assets/_static` copy over everything
2. for all other paths copy over everything except `*.html` and `*.md`
