---
"@rocket/navigation": patch
---

feat(navigation): add no-redirects attribute

By default, the sidebar nav redirects clicks on category headings to
their first child.

To disable those redirects, override
_includes/_joiningBlocks/_layoutSidebar/sidebar/20-navigation.njk
and add the no-redirects attribute to the <rocket-navigation>
element.
