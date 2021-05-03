---
'@rocket/cli': minor
---

The service worker no longer precaches all urls and assets. It now

- caches already visited pages
- caches assets of visited pages (up to 100 files then it replaces older entries)
- on service worker activation it will reload the page if a newer version is available
