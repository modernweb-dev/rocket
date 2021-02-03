---
'@rocket/cli': patch
---

Adds performance improvements for social media images by:
- creating social media images only in `rocket build` phase
- adds a config `createSocialMediaImages` to enable (default) or disable it globally
- adds config `start.createSocialMediaImages` to enable or disable (default) it during `rocket start`
