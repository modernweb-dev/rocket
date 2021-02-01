---
'@rocket/launch': minor
---

Introduces the following layouts:

- `layout-404` A space not found page
- `layout-home` Frontpage with center logo below text
- `layout-home-background` Frontpage with left text and background image on the right
- `layout-sidebar` Left sidebar, right content
- `layout-index` Extends layout-sidebar

BREAKING CHANGES:

- Sets `layout-sidebar` as the default layout
- Removed dedicated Layout setting for `layout-home` use `layout-home-background` instead
- Renamed `404.njk` to `layout-404`
- Renamed `layout.njk` to `layout-sidebar`
- Renamed `pure-content.njk` to `layout-raw`
- Renamed `with-index.njk` to `layout-index`
- Renamed `with-sidebar.njk` to `layout-sidebar`
- Renamed `home.njk` to `layout-home`
