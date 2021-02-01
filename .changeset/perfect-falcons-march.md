---
'@rocket/cli': minor
---

Adds html to core presets with the following Layouts:

- `layout-raw` No html or any wrapping (use it for xml, json, ... outputs)
- `layout-default` For content
- `layout-index` Extends content and adds an "Open Navigation" button for mobile

Layout Default has the following Joining Blocks:

- `head` For the html `<head>`
- `header` Within the top `<header>`
- `content` Html within the main content section
- `footer` Within to bottom `<footer>`
- `bottom` Add the end of the body

BREAKING CHANGES:

- `layout` renamed to `layout-default`
- Automatically sets `layout-index` for all `index.md` files
