---
'@rocket/eleventy-rocket-nav': minor
'@rocket/cli': minor
---

To support dynamically created content to be part of the anchor navigation of the page we now analyze the final html output instead of `entry.templateContent`.

BREAKING CHANGE:
- only add anchors for the currently active pages (before it added anchor for every page)
